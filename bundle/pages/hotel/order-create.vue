<template>
  <view class="page">
    <custom-navbar title="确认订单"></custom-navbar>
    <scroll-view scroll-y class="content">
      <!-- 顶部房型摘要 -->
      <view class="top-card">
        <view class="hotel-name">{{ hotelInfo.hotelName || '酒店名称' }}</view>
        <view class="room-brief">
          <text>{{ roomInfo.roomName || '大床房' }}</text>
          <text v-if="roomInfo.bedInfo" class="dot">·</text>
          <text v-if="roomInfo.bedInfo">{{ roomInfo.bedInfo }}</text>
          <text class="dot">·</text>
          <text>{{ hasBreakfast(roomInfo) ? '有早餐' : '不含早' }}</text>
        </view>
        <view class="date-brief">
          <text>{{ checkInDate }}</text>
          <text class="night-badge">{{ nightNum }}晚</text>
          <text>{{ checkOutDate }}</text>
        </view>
        <view class="cancel-brief">{{ roomInfo.cancelPolicy || '入住当天18:00前可免费取消' }}</view>
      </view>

      <!-- 订单信息（入住人） -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">订单信息</text>
          <view class="room-counter">
            <text class="counter-btn" @click="changeRoomNum(-1)">-</text>
            <text class="counter-value">{{ roomNum }}间</text>
            <text class="counter-btn" @click="changeRoomNum(1)">+</text>
          </view>
        </view>
        <view class="form-item">
          <image src="/static/images/keren 1.png" class="form-icon" mode="aspectFit" />
          <text class="label">住客姓名*</text>
          <input
            class="input"
            v-model="guestName"
            placeholder="请输入"
          />
        </view>
        <view class="form-item">
          <image src="/static/images/dianhua 1.png" class="form-icon" mode="aspectFit" />
          <text class="label">联系电话*</text>
          <input
            class="input"
            v-model="mobile"
            type="number"
            placeholder="请输入手机号码"
          />
        </view>
      </view>

      <!-- 房费明细 -->
      <view class="section-card">
        <view class="section-title">房费明细</view>
        <view class="price-row">
          <text class="label">房费1晚</text>
          <text class="value">¥{{ formatPrice(displayPrice) }}</text>
        </view>
        <view class="price-row">
          <text class="label sub">本单您需支付</text>
          <text class="value highlight">¥{{ totalAmount }}</text>
        </view>
      </view>

      <!-- 取消政策 -->
      <view class="section-card">
        <view class="section-title">取消政策</view>
        <view class="section-text">
          {{ roomInfo.cancelPolicy || '该房型可于入住当天12:00前免费取消' }}
        </view>
      </view>

      <!-- 入住提示 -->
      <view class="section-card">
        <view class="section-title">入住提示</view>
        <view class="section-text">
          房客信息真实、可使用任意有效证件办理入住。请在预订后按酒店要求时间办理入住。
        </view>
      </view>

      <!-- 入住协议 -->
      <view class="section-card">
        <view class="section-title">入住协议</view>
        <view class="section-text">
          预订即视为同意酒店相关入住协议及服务条款。
        </view>
      </view>
    </scroll-view>

    <!-- 底部价格栏 -->
    <view class="bottom-bar">
      <view class="bottom-prices">
        <view class="price-item" :class="{ 'highlight': userPriceType === 'list' }">
          <text class="price-label">挂牌价</text>
          <text class="price-value">¥{{ totalListPrice }}</text>
        </view>
        <view class="price-item" :class="{ 'highlight': userPriceType === 'vip' }">
          <text class="price-label">尊享价</text>
          <text class="price-value">¥{{ totalVipPrice }}</text>
        </view>
        <view class="price-item" :class="{ 'highlight': userPriceType === 'share' }">
          <text class="price-label">股东价</text>
          <text class="price-value">¥{{ totalSharePrice }}</text>
        </view>
      </view>
      <button class="submit-btn" :disabled="submitting || checking" @click="submitOrder">
        {{ checking ? '验证中...' : submitting ? '创建中...' : '立即预订' }}
      </button>
    </view>
  </view>
</template>

<script>
import { hotelDetail, createOrder, checkBooking } from '@/api/hotel.js'

export default {
  data() {
    return {
      hotelCode: '',
      roomCode: '',
      checkInDate: '',
      checkOutDate: '',
      nightNum: 1,
      hotelInfo: {},
      roomInfo: {},
      prices: { list_price: 0, vip_price: 0, share_price: 0 },
      userPriceType: 'list', // 用户价格类型，用于高亮显示
      guestName: '',
      mobile: '',
      roomNum: 1,
      submitting: false,
      checking: false // 预检查状态
    }
  },
  computed: {
    // 显示用的单晚价格（使用用户最终价格）
    displayPrice() {
      return this.prices.user_final_price || this.prices.vip_price || this.prices.list_price || 0
    },
    // 总价 = 单价 * 晚数 * 房间数
    totalAmount() {
      const amount = this.displayPrice * this.nightNum * this.roomNum
      return this.formatPrice(amount)
    },
    // 挂牌价总价
    totalListPrice() {
      const amount = this.prices.list_price * this.nightNum * this.roomNum
      return this.formatPrice(amount)
    },
    // 尊享价总价
    totalVipPrice() {
      const amount = this.prices.vip_price * this.nightNum * this.roomNum
      return this.formatPrice(amount)
    },
    // 股东价总价
    totalSharePrice() {
      const amount = this.prices.share_price * this.nightNum * this.roomNum
      return this.formatPrice(amount)
    }
  },
  onLoad(options) {
    this.hotelCode = options.hotelCode || ''
    this.roomCode = options.roomCode || ''
    this.checkInDate = options.checkInDate || ''
    this.checkOutDate = options.checkOutDate || ''

    // 接收从酒店详情页传递的房型和酒店信息，避免再次请求 hotelDetail 接口
    if (options.roomInfo) {
      try {
        this.roomInfo = JSON.parse(decodeURIComponent(options.roomInfo))
        // 优先使用 roomInfo 中的完整 roomCode（包含 ==~# 后缀），避免 URL 参数中的 roomCode 被截取
        if (this.roomInfo.roomCode) {
          this.roomCode = this.roomInfo.roomCode
        }
        // 使用后端在详情接口中计算好的价格
        this.prices = {
          list_price: this.roomInfo.list_price || 0,
          vip_price: this.roomInfo.vip_price || 0,
          share_price: this.roomInfo.share_price || 0,
          user_final_price: this.roomInfo.user_final_price || this.roomInfo.list_price || 0
        }
        this.userPriceType = this.roomInfo.user_price_type || 'list'
      } catch (e) {
        console.error('解析 roomInfo 失败:', e)
      }
    }

    if (options.hotelInfo) {
      try {
        const hotelInfo = JSON.parse(decodeURIComponent(options.hotelInfo))
        this.hotelInfo = hotelInfo || {}
      } catch (e) {
        console.error('解析 hotelInfo 失败:', e)
      }
    }

    if (this.checkInDate && this.checkOutDate) {
      const checkIn = new Date(this.checkInDate)
      const checkOut = new Date(this.checkOutDate)
      this.nightNum = Math.max(1, Math.ceil((checkOut - checkIn) / 86400000))
    }

    // 这里不再调用 hotelDetail，避免重复请求，所需信息从上一个页面传递
  },
  methods: {
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      const num = typeof price === 'number' ? price : parseFloat(price)
      return num.toFixed(2)
    },
    hasBreakfast(room) {
      const desc = (room.roomDesc || room.description || '').toLowerCase()
      const name = (room.roomName || '').toLowerCase()
      return desc.includes('早餐') || desc.includes('breakfast') || name.includes('含早')
    },
    changeRoomNum(delta) {
      const next = this.roomNum + delta
      if (next < 1) return
      this.roomNum = next
    },
    async loadHotelDetail() {
      try {
        const res = await hotelDetail({
          hotel_code: this.hotelCode,
          check_in_date: this.checkInDate,
          check_out_date: this.checkOutDate
        })
        if (res.code === 1) {
          this.hotelInfo = res.data || {}
          const rooms = this.hotelInfo.rooms || []
          // 先尝试精确匹配，如果找不到则尝试部分匹配（兼容roomCode可能不完整的情况）
          let room = rooms.find(r => r.roomCode === this.roomCode)
          if (!room) {
            // 如果精确匹配失败，尝试部分匹配（roomCode可能缺少后缀）
            room = rooms.find(r => r.roomCode && r.roomCode.indexOf(this.roomCode) === 0)
          }
          if (!room) {
            // 如果还是找不到，使用第一个房间
            room = rooms[0]
          }
          if (room) {
            this.roomInfo = room
            // 使用后端返回的完整 roomCode（包含 ==~# 后缀）
            this.roomCode = room.roomCode || this.roomCode
            // 直接使用后端计算好的价格（后端已经基于 settAmount 计算好了）
            this.prices = {
              list_price: room.list_price || 0,
              vip_price: room.vip_price || 0,
              share_price: room.share_price || 0,
              user_final_price: room.user_final_price || room.list_price || 0 // 用户最终价格
            }
            // 保存用户价格类型，用于高亮显示
            this.userPriceType = room.user_price_type || 'list'
          }
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      }
    },
    async submitOrder() {
      if (this.submitting || this.checking) return

      if (!this.hotelCode || !this.roomCode) {
        uni.showToast({ title: '参数错误', icon: 'none' })
        return
      }
      if (!this.guestName) {
        uni.showToast({ title: '请输入住客姓名', icon: 'none' })
        return
      }
      if (!this.mobile) {
        uni.showToast({ title: '请输入联系电话', icon: 'none' })
        return
      }

      // 先弹出确认提示框
      const confirmRes = await new Promise((resolve) => {
        uni.showModal({
          title: '确认预订',
          content: '确定要创建订单吗？',
          confirmText: '确定',
          cancelText: '取消',
          success: (res) => {
            resolve(res.confirm)
          },
          fail: () => {
            resolve(false)
          }
        })
      })

      if (!confirmRes) {
        return // 用户取消
      }

      // 先调用第三方酒店预订接口创建订单
      this.checking = true
      try {
        uni.showLoading({ title: '正在预订...', mask: true })

        // 传递完整的预订参数，包括从酒店详情获取的信息
        const checkRes = await checkBooking({
          hotel_code: this.hotelCode,
          room_code: this.roomCode,
          check_in_date: this.checkInDate,
          check_out_date: this.checkOutDate,
          adult_count: this.roomNum,
          child_count: 0,
          guest_name: this.guestName,
          mobile: this.mobile,
          room_num: this.roomNum,
          // 从酒店详情获取的必要参数（避免后端再次调用 hotelDetail 接口）
          shopping_id: this.hotelInfo.shoppingId || '',
          room_name: this.roomInfo.roomName || '',
          plan_code: this.roomInfo.planCode || '',
          // 基础价格（后端需要这个来判断是否需要调用接口）
          sett_amount: this.roomInfo.settAmount || 0,
          amount_price: this.roomInfo.amountPrice || 0,
          base_price: this.roomInfo.settAmount || this.roomInfo.amountPrice || 0,
          // 城市代码（用于价格计算）
          city_code: this.hotelInfo.cityCode || '',
          // 用户最终价格
          user_final_price: this.prices.user_final_price || 0,
          arrive_early_time: this.hotelInfo.arriveEarlyTime || '',
          arrive_last_time: this.hotelInfo.arriveLastTime || ''
        })

        uni.hideLoading()

        if (checkRes.code !== 1) {
          uni.showToast({ title: checkRes.msg || '预订失败', icon: 'none' })
          return
        }

        // 第三方预订成功，创建本地订单
        this.submitting = true
        uni.showLoading({ title: '正在创建订单...', mask: true })

        const res = await createOrder({
          hotel_code: this.hotelCode,
          room_code: this.roomCode,
          check_in_date: this.checkInDate,
          check_out_date: this.checkOutDate,
          adult_count: this.roomNum,
          child_count: 0,
          guest_name: this.guestName,
          mobile: this.mobile,
          room_num: this.roomNum,
          // 传递订单号和第三方订单信息（如果返回了）
          order_sn: checkRes.data?.order_sn || null,
          third_party_order: checkRes.data?.third_party_order || null,
          // 传递价格信息（从 checkBooking 返回的数据中获取，确保使用加价后的价格）
          user_final_price: checkRes.data?.user_final_price || this.prices.user_final_price || 0,
          base_price: checkRes.data?.base_price || this.roomInfo.settAmount || this.roomInfo.amountPrice || 0,
          sett_amount: checkRes.data?.sett_amount || this.roomInfo.settAmount || 0,
          amount_price: checkRes.data?.amount_price || this.roomInfo.amountPrice || 0,
          room_name: checkRes.data?.room_name || this.roomInfo.roomName || '',
          plan_code: checkRes.data?.plan_code || this.roomInfo.planCode || '',
          city_code: checkRes.data?.city_code || this.hotelInfo.cityCode || '',
          arrive_early_time: checkRes.data?.arrive_early_time || this.hotelInfo.arriveEarlyTime || '',
          arrive_last_time: checkRes.data?.arrive_last_time || this.hotelInfo.arriveLastTime || ''
        })

        uni.hideLoading()

        if (res.code === 1) {
          // 跳转到统一支付页面（复用原有支付流程）
          uni.redirectTo({
            url: `/pages/payment/payment?from=hotel&order_id=${res.data.order_id}`
          })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: e.msg || '操作失败', icon: 'none' })
      } finally {
        this.submitting = false
        this.checking = false
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1034;
  color: #fff;
  padding-bottom: 140rpx;
  padding-top: calc(120rpx + var(--status-bar-height));
}

.content {
  height: calc(100vh - 140rpx);
}

.top-card {
  padding: 40rpx 30rpx 30rpx;
  background: #1E1F34;
  border-bottom: 1px solid #1a3a5a;
}

.hotel-name {
  font-size: 34rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.room-brief {
  font-size: 26rpx;
  color: #ddd;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6rpx;
  margin-bottom: 10rpx;
}

.room-brief .dot {
  color: #666;
}

.date-brief {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 26rpx;
  color: #ddd;
  margin-bottom: 10rpx;
}

.night-badge {
  padding: 4rpx 20rpx;
  border-radius: 20rpx;
  background: #353548;
  color: #fff;
  font-size: 22rpx;
}

.cancel-brief {
  font-size: 24rpx;
  color: #999;
}

.section-card {
  margin: 20rpx 0 0;
  padding: 24rpx 26rpx;
  background: #1E1F34;
  border-radius: 16rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
}

.room-counter {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.counter-btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 1rpx solid #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #fff;
  text-align: center;
  line-height: 44rpx;
}

.counter-value {
  font-size: 26rpx;
  color: #fff;
  min-width: 60rpx;
  text-align: center;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 0;
  border-bottom: 1px solid #1f2b48;
}

.form-item:last-child {
  border-bottom: none;
}

.form-icon {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
}

.label {
  font-size: 26rpx;
  color: #ddd;
  flex-shrink: 0;
}

.input {
  flex: 1;
  text-align: right;
  font-size: 26rpx;
  color: #fff;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.step-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  border: 1px solid #555;
  text-align: center;
  line-height: 48rpx;
  font-size: 32rpx;
}

.step-value {
  min-width: 40rpx;
  text-align: center;
  font-size: 26rpx;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
}

.price-row .sub {
  color: #999;
}

.price-row .highlight {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.section-text {
  font-size: 24rpx;
  line-height: 1.6;
  color: #ccc;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 30rpx 30rpx;
  background: #1E1F34;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.bottom-prices {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.price-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.price-label {
  font-size: 24rpx;
  color: #999;
}

.price-value {
  font-size: 28rpx;
  color: #fff;
  font-weight: normal;
}

/* 高亮样式（渐变）- 根据用户等级对应的价格类型 */
.price-item.highlight .price-label {
  color: #F3BC63;
  font-weight: 700;
}

.price-item.highlight .price-value {
  background: linear-gradient(90deg, #F3BC63 0%, #FDE3B1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.submit-btn {
  width: 360rpx;
  height: 88rpx;
  background: linear-gradient(90deg, #F4BD65 0%, #FEE3B0 49.83%, #F3BD65 100%);
  border-radius: 20rpx;
  border: none;
  color: #1a1a2e;
  font-size: 32rpx;
  font-weight: bold;
}

.submit-btn[disabled] {
  opacity: 0.6;
}
</style>



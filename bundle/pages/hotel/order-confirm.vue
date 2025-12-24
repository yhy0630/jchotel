<template>
  <view class="page">
    <custom-navbar title="订单确认"></custom-navbar>
    <scroll-view scroll-y class="content">
      <!-- 房间信息 -->
      <view class="info-card">
        <view class="card-title">房间信息</view>
        <view class="info-item">
          <text class="label">房型：</text>
          <text class="value">{{ (orderInfo.room_info && orderInfo.room_info.room_type) || '--' }}</text>
        </view>
        <view class="info-item">
          <text class="label">城市：</text>
          <text class="value">{{ (orderInfo.room_info && orderInfo.room_info.city_name) || '--' }}</text>
        </view>
        <view class="info-item">
          <text class="label">入住日期：</text>
          <text class="value">{{ (orderInfo.room_info && orderInfo.room_info.check_in_date) || '--' }}</text>
        </view>
        <view class="info-item">
          <text class="label">离店日期：</text>
          <text class="value">{{ (orderInfo.room_info && orderInfo.room_info.check_out_date) || '--' }}</text>
        </view>
        <view class="info-item">
          <text class="label">入住晚数：</text>
          <text class="value">{{ (orderInfo.room_info && orderInfo.room_info.night_num) || 0 }}晚</text>
        </view>
        <view class="info-item">
          <text class="label">房间数量：</text>
          <text class="value">{{ (orderInfo.room_info && orderInfo.room_info.room_num) || 1 }}间</text>
        </view>
        <view class="info-item">
          <text class="label">入住人数：</text>
          <text class="value">{{ (orderInfo.room_info && orderInfo.room_info.guest_num) || 1 }}人</text>
        </view>
      </view>

      <!-- 客户信息 -->
      <view class="info-card">
        <view class="card-title">客户信息</view>
        <view class="info-item">
          <text class="label">联系人：</text>
          <text class="value">{{ (orderInfo.guest_info && orderInfo.guest_info.guest_name) || '--' }}</text>
        </view>
        <view class="info-item">
          <text class="label">联系电话：</text>
          <text class="value">{{ (orderInfo.guest_info && orderInfo.guest_info.mobile) || '--' }}</text>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="info-card">
        <view class="card-title">价格信息</view>
        <view class="info-item">
          <text class="label">订单金额：</text>
          <text class="value price">¥{{ formatPrice(orderInfo.amount_payable || orderInfo.amount_total || 0) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="footer">
      <button class="btn-create" :disabled="creating" @click="createOrder">
        <text v-if="creating">生成订单中...</text>
        <text v-else>生成订单</text>
      </button>
    </view>
  </view>
</template>

<script>
import { previewOffer, selectOffer } from '../../../api/hotel.js'

export default {
  data() {
    return {
      offerId: 0,
      requestId: 0,
      orderInfo: {},
      creating: false
    }
  },
  onLoad(options) {
    this.offerId = options.offer_id || 0
    this.requestId = options.request_id || 0
    this.loadPreview()
  },
  methods: {
    async loadPreview() {
      try {
        const res = await previewOffer({ offer_id: this.offerId })
        if (res.code === 1) {
          // 如果订单已存在，直接跳转支付
          if (res.data.is_exist) {
            if (res.data.is_paid) {
              uni.showToast({ title: '订单已支付', icon: 'success' })
              setTimeout(() => {
                uni.navigateBack()
              }, 1500)
            } else {
              uni.showToast({ title: '订单已存在，跳转支付', icon: 'success' })
              setTimeout(() => {
                uni.navigateTo({
                  url: `/pages/payment/payment?from=hotel&order_id=${res.data.order_id}`
                })
              }, 1500)
            }
            return
          }
          this.orderInfo = res.data
        } else {
          uni.showToast({ title: res.msg || '加载失败', icon: 'none' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    },
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      return numPrice.toFixed(2)
    },
    async createOrder() {
      if (this.creating) return
      
      this.creating = true
      try {
        const result = await selectOffer({ offer_id: this.offerId })
        if (result.code === 1) {
          uni.showToast({ title: result.msg || '订单创建成功', icon: 'success' })
          setTimeout(() => {
            // 跳转到支付页面
            uni.redirectTo({
              url: `/pages/payment/payment?from=hotel&order_id=${result.data.order_id}`
            })
          }, 1500)
        } else {
          uni.showToast({ title: result.msg || '订单创建失败', icon: 'none' })
          this.creating = false
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '订单创建失败', icon: 'none' })
        this.creating = false
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1034;
  padding-top: calc(130rpx + var(--status-bar-height));
  padding-bottom: 120rpx;
}

.content {
  padding: 20rpx;
  padding-bottom: 40rpx;
}

.info-card {
  background: #1E1F34;
  padding: 30rpx;
  margin-bottom: 20rpx;
  margin-right: 35rpx;
  border-radius: 12rpx;
  border: 2rpx solid #FCDDA6;
}

.card-title {
  color: #FCDDA6;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #ffffff;
  min-width: 140rpx;
}

.value {
  color: #ffffff;
  flex: 1;
}

.value.price {
  color: #FCDDA6;
  font-size: 36rpx;
  font-weight: bold;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #0D1034;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.btn-create {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(90deg, #F4BD65 0%, #FEE3B0 49.83%, #F3BD65 100%);
  color: #000000;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-create::after {
  border: none;
}

.btn-create[disabled] {
  opacity: 0.6;
}
</style>


<template>
  <view class="page">
    <!-- #ifndef H5 -->
    <u-sticky offset-top="0" h5-nav-height="0" bg-color="transparent">
      <u-navbar :is-back="true" :is-fixed="false" :border-bottom="false" 
        :background="navbarBackground"
        back-icon-color="#ffffff"></u-navbar>
    </u-sticky>
    <!-- #endif -->
    
    <scroll-view scroll-y class="content">
      <!-- 状态提示 -->
      <view class="status-bar">
        <view class="status-title">
          <image class="status-icon" :src="getStatusIcon(order.status)" mode="aspectFit"></image>
          <text class="status-text">{{ getStatusText(order.status) }}</text>
        </view>
        <text class="status-tip">{{ getStatusTip(order.status) }}</text>
      </view>

      <!-- 酒店信息卡片 -->
      <view class="hotel-card">
        <view class="hotel-main">
          <image v-if="order.hotel_image" class="hotel-image" :src="order.hotel_image" mode="aspectFill"></image>
          <view class="hotel-info">
            <view class="hotel-title">{{ order.hotel_name }}</view>
            <view class="hotel-date" v-if="order.check_in_date && order.check_out_date">
              {{ order.check_in_date }} - {{ order.check_out_date }} | {{ order.night_num }}晚
            </view>
            <view class="hotel-room" v-if="order.room_name">
              {{ order.room_name }} | 
            </view>
            <view class="hotel-checkin" v-if="order.check_in_time">
              入住当天18:00前可免费取消
            </view>
          </view>
        </view>
        <!-- 分割线 -->
        <view class="divider"></view>
        <!-- 实付总额 -->
        <view class="total-price-inline">
          <text class="price-label">实付总额：</text>
          <text class="price-value">¥{{ order.amount_paid || order.amount_payable || 0 }}</text>
        </view>
      </view>

      <!-- 住客信息 -->
      <view class="section-card">
        <view class="section-title">住客信息</view>
        <view class="info-row" v-if="order.guest_name">
          <text class="info-label">住客姓名*</text>
          <text class="info-value">{{ order.guest_name }}</text>
        </view>
        <view class="info-row" v-if="order.mobile">
          <text class="info-label">联系电话*</text>
          <text class="info-value">{{ order.mobile }}</text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="section-card">
        <view class="section-title">订单信息</view>
        <view class="info-row" v-if="order.order_sn">
          <text class="info-label">下单编号</text>
          <text class="info-value">{{ order.order_sn }}</text>
        </view>
        <view class="info-row" v-if="order.create_time">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{ formatTime(order.create_time) }}</text>
        </view>
        <view class="info-row" v-if="order.pay_way_text">
          <text class="info-label">支付方式</text>
          <text class="info-value">{{ order.pay_way_text }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <button v-if="order.status === 0" class="btn-outline" @click="cancelOrder">取消订单</button>
      <button v-if="order.status === 0" class="btn-filled" @click="goPay">去支付</button>
      <button v-if="order.status === 1" class="btn-outline" @click="cancelOrder">取消订单</button>
      <button v-if="order.status === 2" class="btn-outline" @click="goReview">去评价</button>
      <button v-if="order.status === 2" class="btn-filled" @click="applyInvoice">申请开票</button>
    </view>
  </view>
</template>

<script>
import { orderDetail, cancelOrder } from '../../api/hotel.js'
import config from '@/config/app.js'

export default {
  data() {
    return {
      config: config,
      orderId: 0,
      orderSn: '',
      order: {},
      bottomPrice: { list: 0, vip: 0, share: 0 }
    }
  },
  computed: {
    navbarBackground() {
      return {
        backgroundImage: `url(${this.config.baseURL}/uploads/images/images/导航栏.png)`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat'
      }
    }
  },
  onLoad(options) {
    this.orderId = options.order_id || 0
    this.orderSn = options.order_sn || ''
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      try {
        const res = await orderDetail({ 
          order_id: this.orderId,
          order_sn: this.orderSn 
        })
        if (res.code === 1) {
          this.order = res.data || {}
          // 这里可以根据订单信息计算底部价格
          this.bottomPrice = {
            list: this.order.amount_payable || 0,
            vip: this.order.amount_payable || 0,
            share: this.order.amount_payable || 0
          }
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      }
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp * 1000)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const h = String(date.getHours()).padStart(2, '0')
      const min = String(date.getMinutes()).padStart(2, '0')
      const sec = String(date.getSeconds()).padStart(2, '0')
      return `${y}-${m}-${d} ${h}:${min}:${sec}`
    },
    getStatusIcon(status) {
      if (status === 0) return '/static/images/待付款.png'
      if (status === 1) return '/static/images/待出行.png'
      if (status === 2) return '/static/images/已完成.png'
      return ''
    },
    getStatusText(status) {
      const map = { 0: '等待付款', 1: '待出行', 2: '已完成', 3: '已取消' }
      return map[status] || '未知'
    },
    getStatusTip(status) {
      const map = { 
        0: '请及时付款哦', 
        1: '请您注意出行时间', 
        2: '订单已完成',
        3: '订单已取消'
      }
      return map[status] || ''
    },
    async cancelOrder() {
      uni.showModal({
        title: '提示',
        content: '确定取消订单？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const cancelRes = await cancelOrder({ order_id: this.order.id })
              if (cancelRes.code === 1) {
                uni.showToast({ title: '订单已取消', icon: 'success' })
                setTimeout(() => {
                  this.loadDetail()
                }, 1500)
              }
            } catch (e) {
              uni.showToast({ title: e.msg || '取消失败', icon: 'none' })
            }
          }
        }
      })
    },
    goPay() {
      // 使用原有的支付页面
      uni.navigateTo({
        url: `/pages/payment/payment?order_id=${this.order.id}&order_type=hotel&order_sn=${this.order.order_sn}`
      })
    },
    applyInvoice() {
      // 跳转到申请开票页面
      uni.navigateTo({
        url: `/bundle/pages/hotel/invoice-apply?order_id=${this.order.id}&order_sn=${this.order.order_sn || ''}`
      })
    },
    goReview() {
      // 跳转到评价页面
      uni.navigateTo({
        url: `/bundle/pages/hotel/review?order_id=${this.order.id}`
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #0D1034;
  padding-bottom: 120rpx;
}
/* 设置导航栏返回图标为白色 */
/deep/ .u-navbar__content__left {
  color: #ffffff !important;
}
/deep/ .u-icon {
  color: #ffffff !important;
}
.content {
  padding: 0;
}
.status-bar {
  background: #022057;
  text-align: center;
  padding: 20rpx 30rpx 30rpx;
}
.status-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}
.status-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 12rpx;
}
.status-text {
  font-size: 36rpx;
  font-weight: 800;
  background: linear-gradient(90deg, #F4C06C 0%, #FDE0AA 50.06%, #F4C06C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.status-tip {
  font-size: 26rpx;
  color: #B8C5D6;
}

/* 酒店信息卡片 */
.hotel-card {
  background: #1E1F34;
  margin-bottom: 20rpx;
  padding: 30rpx;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.hotel-main {
  display: flex;
  gap: 20rpx;
}
.hotel-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}
.hotel-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.divider {
  width: 100%;
  height: 1rpx;
  background: #787985;
  margin: 0;
}
.total-price-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.price-label {
  font-size: 28rpx;
  color: #FFFFFF;
  margin-left: 440rpx;
}
.price-value {
  font-size: 40rpx;
  color: #fcdda6;
  font-weight: 700;
}
.hotel-title {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 500;
}
.hotel-date {
  font-size: 24rpx;
  color: #fff;
}
.hotel-room {
  font-size: 24rpx;
  color: #fff;
}
.hotel-checkin {
  font-size: 22rpx;
  color: #fff;
}


/* 信息卡片 */
.section-card {
  background: #1E1F34;
  margin-bottom: 20rpx;
  padding: 30rpx;
}
.section-title {
  font-size: 28rpx;
  color: #FCDDA6;
  font-weight: 500;
  margin-bottom: 24rpx;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.info-row:last-child {
  margin-bottom: 0;
}
.info-label {
  font-size: 26rpx;
  color: #8A92A6;
}
.info-value {
  font-size: 26rpx;
  color: #FFFFFF;
}

/* 操作按钮 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1E2139;
  padding: 20rpx 30rpx;
  padding-bottom: 60rpx;
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  border-top: 1rpx solid #787985;
}
.btn-outline {
  min-width: 200rpx;
  height: 68rpx;
  border-radius: 34rpx;
  background: transparent;
  border: 2rpx solid #FCDDA6;
  color: #FCDDA6;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40rpx;
}
.btn-outline:active {
  background: linear-gradient(90deg, #F5C26F 0%, #FCDEA7 50.26%, #F3C06F 100%);
  color: #000000;
  border-color: transparent;
}
.btn-filled {
  min-width: 200rpx;
  height: 68rpx;
  border-radius: 34rpx;
  background: linear-gradient(90deg, #F5C26F 0%, #FCDEA7 50.26%, #F3C06F 100%);
  color: #000000;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40rpx;
}
.btn-filled:active {
  opacity: 0.8;
}
</style>


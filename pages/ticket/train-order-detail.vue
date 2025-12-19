<template>
  <view class="page">
    <!-- #ifndef H5 -->
    <u-sticky offset-top="0" h5-nav-height="0" bg-color="transparent">
      <u-navbar :is-back="true" :is-fixed="false" :border-bottom="false" 
        :background="{ backgroundImage: 'url(/static/images/导航栏.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }"
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

      <!-- 火车票信息卡片 -->
      <view class="train-card">
        <view class="train-main">
          <image class="train-icon" src="/static/images/火车票.png" mode="aspectFit"></image>
          <view class="train-info">
            <view class="train-type-label">火车票</view>
            <view class="train-route">
              <text class="city-name">{{ order.departure_station_name }}</text>
              <text class="arrow">→</text>
              <text class="city-name">{{ order.arrival_station_name }}</text>
            </view>
            <view class="train-detail" v-if="order.departure_date && order.departure_time && order.arrival_time">
              {{ order.departure_date }} {{ order.departure_time }} 至 {{ order.departure_date }} {{ order.arrival_time }}
            </view>
            <view class="train-seat" v-if="order.train_no && order.seat_type">
              {{ order.train_no }} {{ order.seat_type }}
            </view>
          </view>
        </view>
        <!-- 分割线 -->
        <view class="divider"></view>
        <!-- 实付总额 -->
        <view class="total-price-inline">
          <text class="price-label">实付总额：</text>
          <text class="price-value">¥{{ order.total_price || 0 }}</text>
        </view>
      </view>

      <!-- 乘客信息 -->
      <view class="section-card">
        <view class="section-title">乘客信息</view>
        <view class="info-row" v-if="order.passenger_name">
          <text class="info-label">乘客姓名</text>
          <text class="info-value">{{ order.passenger_name }}</text>
        </view>
        <view class="info-row" v-if="order.passenger_id_card">
          <text class="info-label">乘客身份证</text>
          <text class="info-value">{{ formatIdCard(order.passenger_id_card) }}</text>
        </view>
        <view class="info-row" v-if="order.passenger_phone || order.contact_phone">
          <text class="info-label">手机号码</text>
          <text class="info-value">{{ order.passenger_phone || order.contact_phone }}</text>
        </view>
        <view class="info-row" v-if="order.passenger_phone || order.contact_phone">
          <text class="info-label">联系电话</text>
          <text class="info-value">{{ order.passenger_phone || order.contact_phone }}</text>
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
      </view>
    </scroll-view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <button v-if="order.status === 0 && order.pay_status !== 1" class="btn-outline" @click="cancelOrder">取消订单</button>
      <button v-if="order.status === 0 && order.pay_status !== 1" class="btn-filled" @click="goPay">去支付</button>
      <button v-if="order.status === 2" class="btn-filled" @click="applyInvoice">申请开票</button>
    </view>
  </view>
</template>

<script>
import { getOrderDetail } from '@/api/order.js'

export default {
  data() {
    return {
      orderId: 0,
      orderSn: '',
      order: {}
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
        const res = await getOrderDetail({ 
          id: this.orderId,
          from: 'train'
        })
        if (res.code === 1) {
          this.order = res.data || {}
          // 解析 remark 中的额外信息
          if (this.order.remark) {
            try {
              const remark = JSON.parse(this.order.remark)
              if (remark.start_station) this.order.start_station = remark.start_station
              if (remark.end_station) this.order.end_station = remark.end_station
              if (remark.span_time) this.order.span_time = remark.span_time
              if (remark.used_minutes !== undefined) this.order.used_minutes = remark.used_minutes
            } catch (e) {
              console.error('解析 remark 失败', e)
            }
          }
        } else {
          uni.showToast({ title: res.msg || '加载失败', icon: 'none' })
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
    formatIdCard(idCard) {
      if (!idCard) return ''
      if (idCard.length === 18) {
        return idCard.substring(0, 6) + '********' + idCard.substring(14)
      }
      return idCard
    },
    formatDuration(spanTime, usedMinutes) {
      if (spanTime) {
        return spanTime
      }
      if (usedMinutes) {
        const hours = Math.floor(usedMinutes / 60)
        const minutes = usedMinutes % 60
        return `${hours}小时${minutes}分钟`
      }
      return ''
    },
    getStatusIcon(status) {
      const iconMap = {
        0: '/static/images/待付款.png',
        1: '/static/images/待出行.png',
        2: '/static/images/已完成.png',
        3: '/static/images/已完成.png'
      }
      return iconMap[status] || '/static/images/待付款.png'
    },
    getStatusText(status) {
      const map = { 0: '等待付款', 1: '已支付', 2: '已出票', 3: '已取消', 4: '已退款' }
      return map[status] || '未知'
    },
    getStatusTip(status) {
      const map = { 
        0: '请及时支付订单', 
        1: '订单已支付', 
        2: '订单已出票',
        3: '订单已取消',
        4: '订单已退款'
      }
      return map[status] || ''
    },
    async cancelOrder() {
      uni.showModal({
        title: '提示',
        content: '确定取消订单？',
        success: async (res) => {
          if (res.confirm) {
            // TODO: 调用取消订单接口
            uni.showToast({ title: '取消订单功能开发中', icon: 'none' })
          }
        }
      })
    },
    goPay() {
      uni.navigateTo({
        url: `/pages/payment/payment?from=train&order_id=${this.order.id}`
      })
    },
    applyInvoice() {
      uni.showToast({ 
        title: '申请开票功能开发中', 
        icon: 'none' 
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

/* 火车票信息卡片 */
.train-card {
  background: #1E1F34;
  margin-bottom: 20rpx;
  padding: 30rpx;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.train-main {
  display: flex;
  gap: 20rpx;
}
.train-icon {
  width: 80rpx;
  height: 80rpx;
  flex-shrink: 0;
}
.train-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.train-type-label {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 500;
  margin-bottom: 8rpx;
}
.train-route {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.city-name {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 500;
}
.arrow {
  font-size: 24rpx;
  color: #B8C5D6;
}
.train-detail {
  font-size: 24rpx;
  color: #B8C5D6;
}
.train-seat {
  font-size: 24rpx;
  color: #B8C5D6;
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
  margin-left: 400rpx;
}
.price-value {
  font-size: 40rpx;
  color: #fcdda6;
  font-weight: 700;
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


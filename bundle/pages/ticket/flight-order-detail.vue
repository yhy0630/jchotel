<template>
  <view class="page">
    <scroll-view scroll-y class="content">
      <!-- 状态提示 -->
      <view class="status-bar">
        <text class="status-icon">{{ getStatusIcon(order.status) }}</text>
        <text class="status-text">{{ getStatusText(order.status) }}</text>
        <text class="status-tip">{{ getStatusTip(order.status) }}</text>
      </view>

      <!-- 航班信息 -->
      <view class="info-card">
        <view class="title">航班信息</view>
        <view class="flight-info">
          <view class="flight-no">{{ order.flight_no || '' }}</view>
          <view v-if="order.airline_name" class="airline-name">{{ order.airline_name }}</view>
        </view>
        <view class="route-info">
          <view class="station-item">
            <text class="station-name">{{ order.departure_city_name || '' }}</text>
            <text class="station-time">{{ order.departure_time || '' }}</text>
          </view>
          <view class="route-line">
            <text class="duration">{{ formatDuration(order.departure_time, order.arrival_time) }}</text>
          </view>
          <view class="station-item">
            <text class="station-name">{{ order.arrival_city_name || '' }}</text>
            <text class="station-time">{{ order.arrival_time || '' }}</text>
          </view>
        </view>
        <view class="airport-info">
          <text>出发机场: {{ order.departure_airport || '' }}</text>
          <text v-if="order.departure_terminal"> {{ order.departure_terminal }}</text>
        </view>
        <view class="airport-info">
          <text>到达机场: {{ order.arrival_airport || '' }}</text>
          <text v-if="order.arrival_terminal"> {{ order.arrival_terminal }}</text>
        </view>
        <view class="seat-info">
          <text>舱位类型: {{ getSeatTypeText(order.cabin_class) }}</text>
        </view>
        <view class="date-info">
          <text>出发日期: {{ order.departure_date || '' }}</text>
        </view>
      </view>

      <!-- 乘客信息 -->
      <view class="info-card">
        <view class="title">乘客信息</view>
        <view class="info-item">
          <text>姓名: {{ order.passenger_name || '' }}</text>
        </view>
        <view class="info-item">
          <text>身份证: {{ formatIdCard(order.passenger_id_card) }}</text>
        </view>
        <view class="info-item">
          <text>联系电话: {{ order.passenger_phone || order.contact_phone || '' }}</text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="info-card">
        <view class="title">订单信息</view>
        <view class="info-item">
          <text>订单编号: {{ order.order_sn || '' }}</text>
        </view>
        <view class="info-item">
          <text>下单时间: {{ formatTime(order.create_time) }}</text>
        </view>
        <view v-if="order.pay_time" class="info-item">
          <text>支付时间: {{ formatTime(order.pay_time) }}</text>
        </view>
        <view v-if="order.pay_status == 1" class="info-item">
          <text>支付方式: 在线支付</text>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="price-card">
        <view class="price-label">实付总额</view>
        <view class="price-value">¥{{ order.total_price || 0 }}</view>
      </view>
    </scroll-view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <button v-if="order.status === 0 && order.pay_status !== 1" class="btn cancel" @click="cancelOrder">取消订单</button>
      <button v-if="order.status === 0 && order.pay_status !== 1" class="btn pay" @click="goPay">去支付</button>
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
          from: 'flight'
        })
        if (res.code === 1) {
          this.order = res.data || {}
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
    formatDuration(depTime, arrTime) {
      if (!depTime || !arrTime) return ''
      // 简单计算，实际应该考虑跨天情况
      return '约' + this.calculateDuration(depTime, arrTime)
    },
    calculateDuration(depTime, arrTime) {
      // 简单的时长计算，实际应该考虑跨天
      const dep = depTime.split(':')
      const arr = arrTime.split(':')
      const depMinutes = parseInt(dep[0]) * 60 + parseInt(dep[1])
      const arrMinutes = parseInt(arr[0]) * 60 + parseInt(arr[1])
      const diff = arrMinutes - depMinutes
      if (diff < 0) {
        // 跨天情况
        return '24小时+'
      }
      const hours = Math.floor(diff / 60)
      const minutes = diff % 60
      return `${hours}小时${minutes}分钟`
    },
    getSeatTypeText(cabinClass) {
      const map = {
        'Y': '经济舱',
        'C': '商务舱',
        'F': '头等舱',
        'W': '超级经济舱'
      }
      return map[cabinClass] || cabinClass || '经济舱'
    },
    getStatusIcon(status) {
      if (status === 0) return '⏰'
      if (status === 1) return '✓'
      if (status === 2) return '✓'
      if (status === 3) return '✕'
      return ''
    },
    getStatusText(status) {
      const map = { 0: '待支付', 1: '已支付', 2: '已出票', 3: '已取消', 4: '已退款' }
      return map[status] || '未知'
    },
    getStatusTip(status) {
      const map = { 
        0: '请及时付款哦', 
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
        url: `/pages/payment/payment?from=flight&order_id=${this.order.id}`
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #1a1a2e;
}

.content {
  height: calc(100vh - 120rpx);
  padding: 20rpx 20rpx 140rpx 20rpx;
  box-sizing: border-box;
}

.status-bar {
  background: #16213e;
  padding: 40rpx;
  border-radius: 12rpx;
  margin: 0 0 20rpx 0;
  text-align: center;
  border: 2rpx solid #FCDDA6;
  box-sizing: border-box;
}

.status-icon {
  font-size: 60rpx;
  display: block;
  margin-bottom: 10rpx;
}

.status-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 10rpx;
}

.status-tip {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.info-card {
  background: #16213e;
  padding: 30rpx;
  border-radius: 12rpx;
  margin: 0 0 20rpx 0;
  border: 2rpx solid #FCDDA6;
  box-sizing: border-box;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.flight-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.flight-no {
  font-size: 40rpx;
  font-weight: bold;
  color: #FCDDA6;
}

.airline-name {
  font-size: 24rpx;
  color: #999;
  padding: 5rpx 15rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4rpx;
}

.route-info {
  margin: 30rpx 0;
}

.station-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.station-name {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
}

.station-time {
  font-size: 28rpx;
  color: #FCDDA6;
}

.route-line {
  padding: 20rpx 0;
  border-left: 2rpx dashed #FCDDA6;
  margin-left: 20rpx;
  padding-left: 20rpx;
}

.duration {
  font-size: 24rpx;
  color: #999;
}

.airport-info {
  font-size: 28rpx;
  color: #ffffff;
  margin-top: 15rpx;
}

.seat-info, .date-info {
  font-size: 28rpx;
  color: #ffffff;
  margin-top: 15rpx;
}

.info-item {
  font-size: 28rpx;
  color: #ffffff;
  margin-bottom: 15rpx;
  line-height: 1.6;
}

.price-card {
  background: #16213e;
  padding: 40rpx;
  border-radius: 12rpx;
  margin: 0 0 20rpx 0;
  text-align: center;
  border: 2rpx solid #FCDDA6;
  box-sizing: border-box;
}

.price-label {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.price-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #FCDDA6;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #16213e;
  padding: 20rpx 20rpx calc(20rpx + env(safe-area-inset-bottom)) 20rpx;
  display: flex;
  gap: 20rpx;
  border-top: 2rpx solid #0f1624;
  box-sizing: border-box;
}

.btn {
  flex: 1;
  padding: 25rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  border: none;
  line-height: 1.5;
}

.btn.cancel {
  background: transparent;
  color: #FCDDA6;
  border: 2rpx solid #FCDDA6;
}

.btn.pay {
  background: linear-gradient(90deg, #F4C06B 0%, #FDE0AB 49.59%, #F3BF6C 100%);
  color: #380C00;
  border: none;
}
</style>


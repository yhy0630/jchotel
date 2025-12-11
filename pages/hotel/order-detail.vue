<template>
  <view class="page">
    <scroll-view scroll-y class="content">
      <!-- 状态提示 -->
      <view class="status-bar">
        <text class="status-icon">{{ getStatusIcon(order.status) }}</text>
        <text class="status-text">{{ getStatusText(order.status) }}</text>
        <text class="status-tip">{{ getStatusTip(order.status) }}</text>
      </view>

      <!-- 需求信息 -->
      <view class="info-card">
        <view class="title">{{ order.type == 1 ? '定制房需求' : '酒店订单' }}</view>
        <view class="room-name">{{ order.room_name || '豪华标间' }}</view>
        <view class="location">{{ order.hotel_name || (order.request && (order.request.city_name + order.request.area)) }}</view>
        <view v-if="order.type == 1 && order.request" class="detail-item">
          <text>附近参照物: {{ order.request.landmark }}</text>
        </view>
        <view v-if="order.type == 1 && order.request" class="detail-item">
          <text>酒店档次: {{ order.request.hotel_level }}</text>
        </view>
        <view class="dates">{{ order.check_in_date }} 至 {{ order.check_out_date }}·{{ order.night_num }}晚1间·{{ order.room_name || '大床房' }}</view>
        <view v-if="order.type == 1 && order.offer" class="detail-item">
          <text>商家: {{ order.offer.merchant_name }}</text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="info-card">
        <view class="title">订单信息</view>
        <view class="info-item">
          <text>下单编号: {{ order.order_sn }}</text>
        </view>
        <view class="info-item">
          <text>下单时间: {{ formatTime(order.create_time) }}</text>
        </view>
        <view v-if="order.status > 0" class="info-item">
          <text>支付方式: 在线支付</text>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="price-card">
        <view class="price-label">实付总额</view>
        <view class="price-value">¥{{ order.amount_paid || order.amount_payable }}</view>
      </view>

      <!-- 底部价格栏 -->
      <view class="bottom-bar">
        <view class="price-info">
          <text class="list-price">挂牌价: ¥{{ bottomPrice.list }}</text>
          <text class="vip-price">尊享价: ¥{{ bottomPrice.vip }}</text>
          <text class="share-price">股东价: ¥{{ bottomPrice.share }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <button v-if="order.status === 0" class="btn cancel" @click="cancelOrder">取消订单</button>
      <button v-if="order.status === 0" class="btn pay" @click="goPay">去支付</button>
      <button v-if="order.status === 1" class="btn cancel" @click="cancelOrder">取消订单</button>
      <button v-if="order.status === 2" class="btn invoice" @click="applyInvoice">申请开票</button>
    </view>
  </view>
</template>

<script>
import { orderDetail, cancelOrder } from '../../api/hotel.js'

export default {
  data() {
    return {
      orderId: 0,
      orderSn: '',
      order: {},
      bottomPrice: { list: 0, vip: 0, share: 0 }
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
      if (status === 0) return '⏰'
      if (status === 1) return '⏰'
      if (status === 2) return '✓'
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
        url: `/pages/hotel/invoice-apply?order_id=${this.order.id}&order_sn=${this.order.order_sn || ''}`
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #1a1a2e;
  padding-bottom: 120rpx;
}
.content {
  padding: 20rpx;
}
.status-bar {
  background: #16213e;
  padding: 40rpx;
  text-align: center;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}
.status-icon {
  font-size: 60rpx;
  display: block;
  margin-bottom: 20rpx;
}
.status-text {
  font-size: 32rpx;
  color: #fff;
  display: block;
  margin-bottom: 10rpx;
}
.status-tip {
  font-size: 24rpx;
  color: #999;
}
.info-card {
  background: #16213e;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
}
.title {
  font-size: 28rpx;
  color: #ff9500;
  margin-bottom: 20rpx;
}
.room-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}
.location, .dates {
  color: #999;
  font-size: 24rpx;
  margin-bottom: 5rpx;
}
.detail-item {
  color: #999;
  font-size: 24rpx;
  margin-bottom: 5rpx;
}
.info-item {
  color: #999;
  font-size: 24rpx;
  margin-bottom: 10rpx;
}
.price-card {
  background: #16213e;
  padding: 30rpx;
  border-radius: 12rpx;
  text-align: right;
}
.price-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}
.price-value {
  font-size: 48rpx;
  color: #ff9500;
  font-weight: bold;
}
.bottom-bar {
  background: #16213e;
  padding: 20rpx;
  border-radius: 12rpx;
  margin-top: 20rpx;
}
.price-info {
  display: flex;
  flex-direction: column;
  gap: 5rpx;
  font-size: 24rpx;
}
.vip-price {
  color: #ff9500;
}
.share-price {
  color: #ff0000;
}
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #16213e;
  padding: 20rpx;
  display: flex;
  gap: 20rpx;
}
.btn {
  flex: 1;
  padding: 25rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  border: none;
}
.btn.cancel {
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
}
.btn.pay, .btn.invoice {
  background: #ff9500;
  color: #fff;
}
</style>


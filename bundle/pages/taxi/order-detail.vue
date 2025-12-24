<template>
  <view class="page">
    <view class="navbar">
      <view class="navbar-left" @click="goBack">
        <text class="icon-back">‹</text>
      </view>
      <view class="navbar-title">订单详情</view>
    </view>

    <view class="card status-card">
      <view class="status-text">{{ statusText }}</view>
      <view class="amount">应付：¥ {{ detail.amount_payable || detail.amount_paid || 0 }}</view>
      <view class="order-sn">订单号：{{ detail.order_sn }}</view>
    </view>

    <view class="card">
      <view class="section-title">行程信息</view>
      <view class="row">
        <text class="label">车型</text>
        <text class="value">{{ detail.vehicle_name || '—' }}</text>
      </view>
      <view class="row">
        <text class="label">供应商</text>
        <text class="value">{{ detail.supplier_name || '—' }}</text>
      </view>
      <view class="row">
        <text class="label">出发</text>
        <text class="value">{{ detail.depart_address }}</text>
      </view>
      <view class="row">
        <text class="label">到达</text>
        <text class="value">{{ detail.arrive_address }}</text>
      </view>
      <view class="row">
        <text class="label">预估</text>
        <text class="value">
          {{ detail.estimate_time ? '约' + Math.round(detail.estimate_time) + '分钟' : '' }}
          <text v-if="detail.estimate_time && detail.estimate_distance"> · </text>
          {{ detail.estimate_distance ? (detail.estimate_distance / 1000).toFixed(1) + 'km' : '' }}
        </text>
      </view>
    </view>

    <view class="card">
      <view class="section-title">乘车人</view>
      <view class="row">
        <text class="label">姓名</text>
        <text class="value">{{ detail.passenger_name || '—' }}</text>
      </view>
      <view class="row">
        <text class="label">手机</text>
        <text class="value">{{ detail.passenger_phone || '—' }}</text>
      </view>
    </view>

    <view class="card">
      <view class="section-title">支付信息</view>
      <view class="row">
        <text class="label">金额</text>
        <text class="value">¥ {{ detail.amount_payable || 0 }}</text>
      </view>
      <view class="row">
        <text class="label">支付状态</text>
        <text class="value">{{ payStatusText }}</text>
      </view>
    </view>

    <view class="actions" v-if="detail.id">
      <button
        v-if="detail.status === 0 && detail.pay_status === 0"
        class="btn pay"
        @click="goPay"
      >去支付</button>
      <button
        v-if="detail.status === 0"
        class="btn cancel"
        @click="cancelOrder"
      >取消订单</button>
    </view>
  </view>
</template>

<script>
import { getCarOrderDetail, cancelCarOrder } from '@/api/taxi'

export default {
  data() {
    return {
      orderId: '',
      detail: {}
    }
  },
  computed: {
    statusText() {
      const map = { 0: '待支付', 1: '待接单', 2: '进行中', 3: '已完成', 4: '已取消' }
      return map[this.detail.status] || '未知'
    },
    payStatusText() {
      if (!this.detail) return ''
      return this.detail.pay_status == 1 ? '已支付' : '未支付'
    }
  },
  onLoad(options) {
    this.orderId = options.order_id || options.id || ''
    if (!this.orderId) {
      uni.showToast({ title: '订单ID缺失', icon: 'none' })
      return
    }
    this.loadDetail()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    async loadDetail() {
      try {
        const res = await getCarOrderDetail({ order_id: this.orderId })
        if (res.code === 1) {
          this.detail = res.data || {}
        } else {
          uni.showToast({ title: res.msg || '加载失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      }
    },
    goPay() {
      uni.navigateTo({
        url: `/pages/payment/payment?from=taxi&order_id=${this.detail.id || this.orderId}`
      })
    },
    cancelOrder() {
      uni.showModal({
        title: '提示',
        content: '确定取消订单？',
        success: async (res) => {
          if (!res.confirm) return
          const resp = await cancelCarOrder({ order_id: this.detail.id || this.orderId })
          if (resp.code === 1) {
            uni.showToast({ title: '已取消', icon: 'success' })
            this.loadDetail()
          } else {
            uni.showToast({ title: resp.msg || '取消失败', icon: 'none' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #1a1a2e;
  color: #ffffff;
  padding-bottom: env(safe-area-inset-bottom);
}
.navbar {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 30rpx;
}
.navbar-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-back {
  font-size: 48rpx;
  color: #ffffff;
  line-height: 1;
}
.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
  color: #fff;
  margin-right: 60rpx;
}
.card {
  background: #16213e;
  border: 2rpx solid #fcdba2;
  border-radius: 16rpx;
  margin: 20rpx 24rpx;
  padding: 24rpx;
}
.status-card .status-text {
  font-size: 36rpx;
  font-weight: bold;
}
.status-card .amount {
  margin-top: 12rpx;
  font-size: 30rpx;
}
.status-card .order-sn {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #ccc;
}
.section-title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  font-size: 26rpx;
}
.label {
  color: #ccc;
  width: 160rpx;
}
.value {
  flex: 1;
  text-align: right;
  color: #fff;
  word-break: break-all;
}
.actions {
  position: fixed;
  bottom: 30rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  padding: 0 24rpx;
}
.btn {
  padding: 20rpx 36rpx;
  border-radius: 12rpx;
  border: none;
  font-size: 28rpx;
}
.btn.pay {
  background: linear-gradient(90deg, #f4c06b 0%, #fde0ab 49.59%, #f3bf6c 100%);
  color: #380c00;
}
.btn.cancel {
  background: transparent;
  color: #fcdba2;
  border: 2rpx solid #fcdba2;
}
</style>


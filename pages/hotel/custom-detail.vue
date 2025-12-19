<template>
  <view class="page">
    <scroll-view scroll-y class="content">
      <!-- 需求信息卡片 -->
      <view class="request-card">
        <view class="card-header">
          <image class="card-icon" src="/static/images/jiudian-2 1.png" mode="aspectFit"></image>
          <text class="card-title">定制房需求</text>
        </view>
        <view class="info-section">
          <view class="info-line" style="font-size: 35rpx;">{{ request.room_type}}</view>
          <view class="info-line">{{ request.city_name || '--' }}{{ request.area ? request.area : '' }}</view>
          <view class="info-line" v-if="request.landmark">{{ request.landmark }}</view>
          <view class="info-line">{{ request.price_range || '--' }}</view>
          <view class="info-line">{{ request.hotel_level || '--' }}</view>
          <view class="info-line">{{ request.check_in_date || '--' }} 至</view>
          <view class="info-line">{{ request.check_out_date || '--' }}·{{ request.night_num || 0 }}晚{{ request.guest_num || 1 }}间·{{ request.room_type || '大床房' }}</view>
        </view>
      </view>

      <!-- 商家报价列表 -->
      <view class="offers-section">
        <view class="section-title">商家报价</view>
        <view v-if="offers.length === 0" class="empty-offers">
          <text>暂无商家报价</text>
        </view>
        <view v-for="offer in offers" :key="offer.id" class="offer-card">
          <view class="offer-header">
            <text class="merchant-name">{{ offer.merchant_name || '接单商家' + offer.id }}</text>
            <button class="select-btn" @click="selectOffer(offer)">选择付款</button>
          </view>
          <view class="offer-info">
            <view class="offer-item">
              <text class="offer-label">用户</text>
              <text class="offer-value">{{ offer.user_name || offer.merchant_name || 'ZXC123' }}</text>
            </view>
            <view class="offer-item">
              <text class="offer-label">出价时间</text>
              <text class="offer-value">{{ formatTime(offer.create_time) }}</text>
            </view>
            <view class="offer-item">
              <text class="offer-label">出价金额</text>
              <text class="offer-value price">¥{{ formatPrice(offer.offer_amount) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { customDetail, selectOffer } from '../../api/hotel.js'

export default {
  data() {
    return {
      requestId: 0,
      request: {},
      offers: []
    }
  },
  onLoad(options) {
    this.requestId = options.request_id || 0
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      try {
        const res = await customDetail({ request_id: this.requestId })
        if (res.code === 1) {
          this.request = res.data.request || {}
          this.offers = res.data.offers || []
        } else {
          uni.showToast({ title: res.msg || '加载失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      }
    },
    formatTime(timestamp) {
      if (!timestamp) return '--'
      // 处理时间戳（秒或毫秒）
      const time = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
      const date = new Date(time)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const h = String(date.getHours()).padStart(2, '0')
      const min = String(date.getMinutes()).padStart(2, '0')
      return `${y}-${m}-${d} ${h}:${min}`
    },
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      return numPrice.toFixed(2)
    },
    async selectOffer(offer) {
      uni.showModal({
        title: '确认选择',
        content: `确定选择该商家报价（¥${this.formatPrice(offer.offer_amount)}）并付款吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await selectOffer({ offer_id: offer.id })
              if (result.code === 1) {
                uni.showToast({ title: '订单创建成功', icon: 'success' })
                setTimeout(() => {
                  // 跳转到支付页面
                  uni.redirectTo({
                    url: `/pages/payment/payment?from=hotel&order_id=${result.data.order_id}`
                  })
                }, 1500)
              } else {
                uni.showToast({ title: result.msg || '操作失败', icon: 'none' })
              }
            } catch (e) {
              uni.showToast({ title: e.msg || '操作失败', icon: 'none' })
            }
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
  background: #0D1034;
}

.content {
  padding: 20rpx;
  padding-bottom: 40rpx;
}

.request-card {
  background: #1E1F34;
  padding: 30rpx;
  margin-bottom: 20rpx;
  margin-right: 35rpx;
  border-radius: 12rpx;
  border: 2rpx solid #FCDDA6;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.card-icon {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
}

.card-title {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  flex: 1;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-line {
  color: #ffffff;
  font-size: 24rpx;
  line-height: 1.6;
}

.offer-card {
  background: #1E1F34;
  padding: 30rpx;
  margin-bottom: 20rpx;
  margin-right: 35rpx;
  border-radius: 12rpx;
  border: 2rpx solid #FCDDA6;
}

.section-title {
  color: #FCDDA6;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.offers-section {
  margin-top: 20rpx;
}

.empty-offers {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}

.offer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 0.5px solid #CBCBCB80;
}

.merchant-name {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
}

.offer-info {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.offer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
}

.offer-label {
  color: #ffffff;
  font-size: 28rpx;
}

.offer-value {
  color: #ffffff;
  font-size: 28rpx;
  text-align: right;
}

.offer-value.price {
  color: #FCDDA6;
  font-size: 36rpx;
  font-weight: bold;
}

.select-btn {
  background: transparent;
  color: #FCDDA6;
  border: 2rpx solid #FCDDA6;
  padding: 10rpx 30rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  line-height: 1.5;
}

.select-btn::after {
  border: none;
}
</style>

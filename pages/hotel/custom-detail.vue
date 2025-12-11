<template>
  <view class="page">
    <scroll-view scroll-y class="content">
      <!-- 需求信息卡片 -->
      <view class="request-card">
        <view class="card-title">定制房需求</view>
        <view class="info-section">
          <view class="info-item">
            <text class="label">联系电话：</text>
            <text class="value">{{ request.mobile || '--' }}</text>
          </view>
          <view class="info-item">
            <text class="label">地区：</text>
            <text class="value">{{ request.city_name || '--' }}{{ request.area ? ' ' + request.area : '' }}</text>
          </view>
          <view class="info-item">
            <text class="label">附近参照物：</text>
            <text class="value">{{ request.landmark || '--' }}</text>
          </view>
          <view class="info-item">
            <text class="label">酒店档次：</text>
            <text class="value">{{ request.hotel_level || '--' }}</text>
          </view>
          <view class="info-item">
            <text class="label">房型：</text>
            <text class="value">{{ request.room_type || '--' }}</text>
          </view>
          <view class="info-item">
            <text class="label">价位：</text>
            <text class="value">{{ request.price_range || '--' }}</text>
          </view>
          <view class="info-item">
            <text class="label">入住时间：</text>
            <text class="value">{{ request.check_in_date || '--' }}</text>
          </view>
          <view class="info-item">
            <text class="label">离店时间：</text>
            <text class="value">{{ request.check_out_date || '--' }}</text>
          </view>
          <view class="info-item">
            <text class="label">晚数：</text>
            <text class="value">{{ request.night_num || 0 }}晚</text>
          </view>
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
            <text class="merchant-label">报价商家</text>
            <text class="merchant-name">{{ offer.merchant_name || '商家' + offer.id }}</text>
          </view>
          <view class="offer-info">
            <view class="offer-item">
              <text class="offer-label">用户名称：</text>
              <text class="offer-value">{{ offer.user_name || offer.merchant_name || '--' }}</text>
            </view>
            <view class="offer-item">
              <text class="offer-label">出价时间：</text>
              <text class="offer-value">{{ formatTime(offer.create_time) }}</text>
            </view>
            <view class="offer-item">
              <text class="offer-label">出价金额：</text>
              <text class="offer-value price">¥{{ formatPrice(offer.offer_amount) }}</text>
            </view>
          </view>
          <button class="select-btn" @click="selectOffer(offer)">选择付款</button>
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
  background: #1a1a2e;
}

.content {
  padding: 20rpx;
  padding-bottom: 40rpx;
}

.request-card, .offer-card {
  background: #16213e;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
}

.card-title, .section-title {
  color: #ff9500;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-item {
  display: flex;
  align-items: flex-start;
  font-size: 28rpx;
}

.info-item .label {
  color: #999;
  min-width: 160rpx;
}

.info-item .value {
  color: #ffffff;
  flex: 1;
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
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid rgba(255, 255, 255, 0.1);
}

.merchant-label {
  color: #ff9500;
  font-size: 26rpx;
}

.merchant-name {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: bold;
}

.offer-info {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  margin-bottom: 30rpx;
}

.offer-item {
  display: flex;
  align-items: center;
  font-size: 28rpx;
}

.offer-label {
  color: #999;
  min-width: 140rpx;
}

.offer-value {
  color: #ffffff;
  flex: 1;
}

.offer-value.price {
  color: #ff9500;
  font-size: 32rpx;
  font-weight: bold;
}

.select-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(270deg, #FFA500 0%, #FF8C00 100%);
  color: #ffffff;
  border: none;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

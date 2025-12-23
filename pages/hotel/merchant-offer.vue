<template>
  <view class="page">
    <custom-navbar title="商家出价"></custom-navbar>
    <scroll-view scroll-y class="content">
      <!-- 需求信息 -->
      <view class="request-card">
        <view class="card-header">
          <image class="card-icon" src="/static/images/jiudian-2 1.png" mode="aspectFit"></image>
          <text class="title">定制房需求</text>
        </view>
        <view class="info-section">
          <view class="info-line room-name">{{ request.room_type || '豪华标间' }}</view>
          <view class="info-line">{{ request.city_name }}{{ request.area ? request.area : '' }}{{ request.landmark ? request.landmark : '' }}</view>
          <view class="info-line">{{ request.price_range }}</view>
          <view class="info-line">{{ request.hotel_level }}</view>
          <view class="info-line">{{ request.check_in_date }} 至</view>
          <view class="info-line">{{ request.check_out_date }}·{{ request.night_num }}晚1间·{{ request.room_type }}</view>
        </view>
      </view>

      <!-- 出价表单 -->
      <view class="offer-form">
        <view class="form-item">
          <text class="label">*出价金额</text>
          <input v-model="offerAmount" type="digit" placeholder="请填写金额" class="input-field" />
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部固定按钮 -->
    <view class="bottom-bar">
      <button class="submit-btn" @click="submitOffer">立即出价</button>
    </view>
  </view>
</template>

<script>
import { merchantOffer, merchantRequestList } from '../../api/hotel.js'

export default {
  data() {
    return {
      requestId: 0,
      request: {},
      offerAmount: ''
    }
  },
  onLoad(options) {
    this.requestId = options.request_id
    this.loadRequestDetail()
  },
  methods: {
    async loadRequestDetail() {
      try {
        const res = await merchantRequestList({ request_id: this.requestId })
        if (res.code === 1) {
          this.request = res.data || {}
        }
      } catch (e) {
        console.error('加载需求详情失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    async submitOffer() {
      if (!this.offerAmount) {
        uni.showToast({ title: '请填写出价金额', icon: 'none' })
        return
      }
      try {
        const res = await merchantOffer({
          request_id: this.requestId,
          offer_amount: this.offerAmount
        })
        if (res.code === 1) {
          uni.redirectTo({ 
            url: '/pages/hotel/merchant-offer-success' 
          })
        } else {
          uni.showToast({ title: res.msg || '出价失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '出价失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1034;
  padding-top: calc(88rpx + var(--status-bar-height));
  padding-bottom: 120rpx;
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

.title {
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

.info-line.room-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.offer-form {
  background: #1E1F34;
  padding: 30rpx;
  margin-right: 35rpx;
  border-radius: 12rpx;
  border: 2rpx solid #FCDDA6;
}

.form-item {
  margin-bottom: 0;
}

.label {
  color: #ffffff;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  display: block;
}

.input-field {
  background: transparent;
  color: #999999;
  padding: 24rpx 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  width: 100%;
  min-height: 80rpx;
  line-height: 1.5;
  box-sizing: border-box;
  border: none;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #0D1034;
}

.submit-btn {
  background: linear-gradient(90deg, #F4BD63 0%, #FFE3BB 50.4%, #F3BD64 100%);
  color: #380C00;
  border: none;
  padding: 10 30rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: 800;
  width: 100%;
  box-shadow: 0 4rpx 20rpx rgba(240, 190, 99, 0.3);
}

.submit-btn::after {
  border: none;
}
</style>


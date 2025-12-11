<template>
  <view class="page">
    <scroll-view scroll-y class="content">
      <!-- 需求信息 -->
      <view class="request-card">
        <view class="title">定制房需求</view>
        <view class="room-name">{{ request.room_type || '豪华标间' }}</view>
        <view class="location">{{ request.city_name }}{{ request.area }}</view>
        <view class="price-range">{{ request.price_range }}</view>
        <view class="rating">{{ request.hotel_level }}</view>
        <view class="dates">{{ request.check_in_date }} 至 {{ request.check_out_date }}·{{ request.night_num }}晚1间·{{ request.room_type }}</view>
      </view>

      <!-- 出价表单 -->
      <view class="offer-form">
        <view class="form-item">
          <text class="label">*出价金额</text>
          <input v-model="offerAmount" type="digit" placeholder="请填写金额" />
        </view>
        <button class="submit-btn" @click="submitOffer">立即出价</button>
      </view>
    </scroll-view>
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
          uni.showToast({ title: '出价成功', icon: 'success' })
          setTimeout(() => {
            uni.redirectTo({ url: '/pages/hotel/merchant-list' })
          }, 1500)
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
  background: #1a1a2e;
}
.content {
  padding: 20rpx;
}
.request-card {
  background: #16213e;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
}
.title {
  color: #ff9500;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}
.room-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}
.location, .price-range, .rating, .dates {
  color: #999;
  font-size: 24rpx;
  margin-bottom: 5rpx;
}
.offer-form {
  background: #16213e;
  padding: 30rpx;
  border-radius: 12rpx;
}
.form-item {
  margin-bottom: 30rpx;
}
.label {
  color: #ff9500;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  display: block;
}
input {
  background: #0f1624;
  color: #fff;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  width: 100%;
}
.submit-btn {
  background: #ff9500;
  color: #fff;
  border: none;
  padding: 30rpx;
  border-radius: 8rpx;
  font-size: 32rpx;
  width: 100%;
}
</style>


<template>
  <view class="page">
    <custom-navbar title="发布成功" :show-back="false"></custom-navbar>
    <!-- 成功提示 -->
    <view class="success-content">
      <view class="success-title">发布成功</view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="btn btn-primary" @click="goToMyPublish">我的发布</button>
      <button class="btn btn-outline" @click="goBack">返回上一级</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      requestId: ''
    }
  },
  onLoad(options) {
    this.requestId = options.request_id || ''
  },
  methods: {
    goToMyPublish() {
      uni.redirectTo({
        url: '/pages/hotel/custom-my'
      })
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1034;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: calc(88rpx + var(--status-bar-height)) 40rpx 40rpx;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.success-title {
  font-size: 36rpx;
  font-weight: 400;
  color: #ffffff;
  text-align: center;
}

.action-buttons {
  width: 100%;
  max-width: 600rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.btn {
  width: 100%;
  height: 96rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 400;
  border: none;
}

.btn::after {
  border: none;
}

.btn-primary {
  background: linear-gradient(90deg, #F4BD63 0%, #FFE3BB 50.4%, #F3BD64 100%);
  color: #380C00;
  box-shadow: 0 4rpx 20rpx rgba(240, 190, 99, 0.3);
}

.btn-outline {
  background: transparent;
  border: 2rpx solid #ffffff;
  color: #ffffff;
}
</style>


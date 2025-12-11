<template>
  <view class="page">
    <!-- 成功提示 -->
    <view class="success-content">
      <view class="success-icon">✓</view>
      <view class="success-title">发布成功</view>
      <view class="success-tip">您的定制房需求已发布，商家将为您报价</view>
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
  background: linear-gradient(180deg, #1a1f3a 0%, #0f1424 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120rpx;
}

.success-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #4caf50;
  color: #fff;
  font-size: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.success-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.success-tip {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  line-height: 1.6;
}

.action-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
}

.btn-primary {
  background: linear-gradient(270deg, #FFA500 0%, #FF8C00 100%);
  color: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(255, 165, 0, 0.3);
}

.btn-outline {
  background: transparent;
  border: 2rpx solid #FFA500;
  color: #FFA500;
}
</style>


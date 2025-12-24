<template>
  <view class="page">
    <custom-navbar title="出价成功" :show-back="false"></custom-navbar>
    <!-- 成功图标 -->
    <view class="success-content">
      <image class="success-icon" src="/static/images/编组 4.png" mode="aspectFit"></image>
      <view class="success-title">出价成功</view>
      <view class="success-tip">您已成功出价，请耐心等待发单人确认。</view>
    </view>

    <!-- 返回按钮 -->
    <view class="action-buttons">
      <button class="btn btn-primary" @click="goBack">返回</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 2
      })
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
  margin-bottom: 120rpx;
}

.success-icon {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 60rpx;
}

.success-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 30rpx;
  text-align: center;
}

.success-tip {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  line-height: 1.6;
}

.action-buttons {
  width: 100%;
  max-width: 500rpx;
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
</style>

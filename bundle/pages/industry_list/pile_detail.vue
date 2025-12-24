<template>
  <view class="page">
    <!-- 状态标签 -->
    <view class="status-badge">
      <image class="status-icon" src="/static/images/空闲.png" mode="aspectFit"></image>
      <text class="status-text">空闲</text>
    </view>

    <!-- 充电桩信息卡片 -->
    <view class="info-card">
      <view class="card-header">
        <text class="pile-number">102号直流</text>
        <view class="fast-badge">
          <text class="fast-text">快充</text>
        </view>
      </view>
      <text class="charge-time">39分钟前有人成功充电</text>

      <view class="divider"></view>

      <!-- 充电策略 -->
      <text class="section-title">充电策略</text>
      <view class="strategy-buttons">
        <view :class="['strategy-btn', { active: selectedStrategy === 'immediate' }]" @click="selectStrategy('immediate')">
          <text class="strategy-text">立即充电</text>
          <image v-if="selectedStrategy === 'immediate'" class="check-icon" src="/static/images/勾.png" mode="aspectFit"></image>
        </view>
        <view :class="['strategy-btn', { active: selectedStrategy === 'scheduled' }]" @click="selectStrategy('scheduled')">
          <text class="strategy-text">定时充电</text>
          <image v-if="selectedStrategy === 'scheduled'" class="check-icon" src="/static/images/勾.png" mode="aspectFit"></image>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="price-section">
        <view class="price-item left-item">
          <text class="price-label">当前价</text>
          <view class="price-value-box">  
            <text class="price-value">0.6100</text>
            <text class="price-unit">元/度</text>
          </view>
          <text class="price-time">14:00开始 0.9100元/度</text>
          <text class="price-detail">全部时段 ></text>
        </view>
        <view class="price-item right-item">
          <text class="price-label">会员价</text>
          <view class="price-value-box">
            <text class="price-value">0.5498</text>
            <text class="price-unit">元/度</text>
          </view>
          <text class="price-time">本单预计省5.51元</text>
          <text class="price-detail">14:00开始 0.9100元/度</text>
          <text class="price-detail">全部时段 ></text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-button">
      <text class="button-text">启动「立即充电」</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedStrategy: 'immediate'
    }
  },
  onLoad() {
    
  },
  methods: {
    selectStrategy(type) {
      this.selectedStrategy = type
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1038;
  padding: 30rpx;
  padding-bottom: 140rpx;
}

/* 状态标签 */
.status-badge {
  background: linear-gradient(90deg, #F4BE66 0%, #FDE3B3 49.62%, #F3C06A 100%);
  border-radius: 30rpx;
  padding: 40rpx 24rpx;
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  width: 100%;
  margin-bottom: -10;
}

.status-icon {
  width: 28rpx;
  height: 28rpx;
  margin-top: -15rpx;
}

.status-text {
  font-size: 28rpx;
  color: #380C00;
  font-weight: 500;
  margin-top: -20rpx;
}

/* 信息卡片 */
.info-card {
  background: linear-gradient(180deg, #2A2D47 0%, #1F2034 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  border: 2rpx solid #3A3D57;
  margin-top: -35rpx;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.pile-number {
  font-size: 40rpx;
  color: #F5C06A;
  font-weight: 500;
}

.fast-badge {
  background: linear-gradient(90deg, #FDE2B0 8.19%, #F4C26F 100%);
  border-radius: 8rpx;
  padding: 6rpx 16rpx;
}

.fast-text {
  font-size: 24rpx;
  color: #380C00;
}

.charge-time {
  font-size: 26rpx;
  color: #F5C06A;
  margin-bottom: 30rpx;
  display: block;
}

.divider {
  width: 100%;
  height: 2rpx;
  background: #3A3D57;
  margin-bottom: 30rpx;
}

/* 充电策略 */
.section-title {
  font-size: 28rpx;
  color: #F5C06A;
  display: block;
  margin-bottom: 20rpx;
}

.strategy-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.strategy-btn {
  flex: 1;
  height: 80rpx;
  background: #4E474C;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 2rpx solid transparent;
}

.strategy-btn.active {
  border-color: #FFE3BB;
}

.strategy-text {
  font-size: 28rpx;
  color: #FEE3BB;
}

.check-icon {
  width: 40rpx;
  height: 40rpx;
  position: absolute;
  right: 0rpx;
  bottom: 0rpx;
}

/* 价格信息 */
.price-section {
  display: flex;
  gap: 2rpx;
}

.price-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 30rpx 20rpx;
  border-radius: 16rpx;
}

.price-item.left-item {
  background: #2A2D47;
}

.price-item.right-item {
  background: #4E474C;
}

.price-label {
  font-size: 28rpx;
  color: #F5C06A;
  font-weight: 500;
}

.price-value-box {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  margin-bottom: 16rpx;
}

.price-value {
  font-size: 64rpx;
  color: #F5C06A;
  font-weight: bold;
}

.price-unit {
  font-size: 28rpx;
  color: #F5C06A;
}

.price-time {
  font-size: 26rpx;
  color: #B8B8B8;
}

.price-detail {
  font-size: 26rpx;
  color: #B8B8B8;
}

/* 底部按钮 */
.bottom-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  background: #0D1038;
}

.button-text {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(90deg, #F4BE66 0%, #FDE3B3 49.62%, #F3C06A 100%);
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #380C00;
  font-weight: 500;
}
</style>

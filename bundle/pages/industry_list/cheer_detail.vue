<template>
  <view class="page">
    <!-- 加油站信息 -->
    <view class="info-section">
      <view class="header-part">
        <image class="station-logo" :src="config.baseURL + '/uploads/images/images/加油.png'" mode="aspectFill"></image>
        <view class="header-info">
          <text class="station-name">燕北加油站</text>
          <view class="header-tags">
            <view class="tag-item">
              <text class="tag-text">24小时营业</text>
            </view>
            <view class="tag-item">
              <text class="tag-text">加200减4.61</text>
            </view>
          </view>
        </view>
      </view>
      <view class="divider-line"></view>
      <view class="address-part">
        <text class="address-text">G102长春嘉泰交口西南方向</text>
        <image class="arrow-icon" src="/static/images/arrow_right.png" mode="aspectFit"></image>
        <view class="distance-badge">
          <image class="location-icon" src="/static/images/Vector 71.png" mode="aspectFit"></image>
          <text class="distance-text">2.09km</text>
        </view>
      </view>
    </view>

    <!-- 团油价 -->
    <view class="price-section">
      <text class="section-title">团油价</text>
      <view class="price-info">
        <view class="main-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">6.74</text>
          <text class="price-unit">/L</text>
        </view>
        <text class="original-price">零售价仅直降¥0.19/L</text>
      </view>
      <view class="price-detail">
        <text class="detail-text">油站价:¥6.93/L  |  国标价:¥6.93/L</text>
      </view>
    </view>

    <!-- 选择油枪/油号 -->
    <view class="gun-section">
      <view class="gun-header">
        <text class="section-title">选择油枪/油号</text>
        <view class="gun-selector">
          <text class="gun-number">92#</text>
          <image class="dropdown-icon" src="/static/images/dropdown.png" mode="aspectFit"></image>
        </view>
      </view>
      <view class="gun-grid">
        <view v-for="(gun, index) in gunList" :key="index" :class="['gun-item', { active: selectedGun === gun }]" @click="selectGun(gun)">
          <text class="gun-text">{{ gun }}号</text>
        </view>
      </view>
      <view class="view-all">
        <text class="view-all-text">查看全部</text>
      </view>
    </view>
  </view>
</template>

<script>
import config from '@/config/app.js'

export default {
  data() {
    return {
      config: config,
      selectedGun: '1',
      gunList: ['1', '2', '5', '6', '9', '10', '13', '14']
    }
  },
  onLoad() {
    
  },
  methods: {
    selectGun(gun) {
      this.selectedGun = gun
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1038;
  padding: 30rpx;
}

/* 加油站信息 */
.info-section {
  background: #1F2034;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.header-part {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.station-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
}

.station-name {
  font-size: 36rpx;
  font-weight: 500;
  color: #ffffff;
}

.header-tags {
  display: flex;
  gap: 10rpx;
}

.tag-item {
  background: transparent;
  border: 2rpx solid #FFD99A;
  border-radius: 12rpx;
  padding: 6rpx 12rpx;
}

.tag-text {
  font-size: 22rpx;
  color: #FFD99A;
}

.divider-line {
  width: 100%;
  height: 2rpx;
  background: #2A2B3F;
  margin: 30rpx 0;
}

.address-part {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.address-text {
  flex: 1;
  font-size: 28rpx;
  color: #ffffff;
}

.arrow-icon {
  width: 24rpx;
  height: 24rpx;
}

.distance-badge {
  background: #FFD99A;
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.location-icon {
  width: 24rpx;
  height: 24rpx;
}

.distance-text {
  font-size: 24rpx;
  color: #380C00;
}

/* 团油价 */
.price-section {
  background: #1F2034;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #ffffff;
  display: block;
  margin-bottom: 20rpx;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.main-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 32rpx;
  color: #f5c16b;
  font-weight: bold;
}

.price-value {
  font-size: 64rpx;
  color: #f5c16b;
  font-weight: bold;
}

.price-unit {
  font-size: 28rpx;
  color: #f5c16b;
}

.original-price {
  font-size: 24rpx;
  color: #F5C16B;

}

.price-detail {
  padding-top: 20rpx;
  border-top: 2rpx solid #2A2B3F;
}

.detail-text {
  font-size: 24rpx;
  color: #999;
}

/* 选择油枪 */
.gun-section {
  background: #1F2034;
  border-radius: 16rpx;
  padding: 30rpx;
}

.gun-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.gun-selector {
  background: #2A2B3F;
  border-radius: 20rpx;
  padding: 8rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  border: 2rpx solid #f5c16b;
}

.gun-number {
  font-size: 28rpx;
  color: #f5c16b;
  font-weight: 500;
}

.dropdown-icon {
  width: 24rpx;
  height: 24rpx;
}

.gun-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.gun-item {
  background: #2A2B3F;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gun-item.active {
  background: #f5c16b;
}

.gun-text {
  font-size: 28rpx;
  color: #ffffff;
}

.gun-item.active .gun-text {
  color: #380C00;
}

.view-all {
  text-align: center;
  padding: 20rpx 0;
}

.view-all-text {
  font-size: 28rpx;
  color: #999;
}
</style>

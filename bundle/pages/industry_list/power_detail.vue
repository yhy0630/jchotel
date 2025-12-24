<template>
  <view class="page">
    <!-- Tab切换 -->
    <view class="tab-container">
      <view :class="['tab-item', { active: activeTab === 'free' }]" @click="switchTab('free')">
        <text class="tab-text">空闲(6)</text>
      </view>
      <view :class="['tab-item', { active: activeTab === 'used' }]" @click="switchTab('used')">
        <text class="tab-text">已插枪(0)</text>
      </view>
      <view :class="['tab-item', { active: activeTab === 'coming' }]" @click="switchTab('coming')">
        <text class="tab-text">即将充电(0)</text>
      </view>
    </view>

    <!-- 充电桩列表 -->
    <view class="pile-list">
      <view v-for="(pile, index) in pileList" :key="index" class="pile-item" @click="goToPileDetail(pile)">
        <view class="pile-left">
          <view class="pile-icon">
            <text class="icon-text">空闲</text>
          </view>
        </view>
        <view class="pile-right">
          <view class="pile-header">
            <text class="pile-number">{{ pile.number }}</text>
            <view class="pile-badge">
              <text class="badge-text">快充</text>
            </view>
          </view>
          <text class="pile-terminal">终端编号 {{ pile.terminal }}</text>
          <text class="pile-power">{{ pile.power }}</text>
          <text class="pile-info">{{ pile.info }}</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view class="price-info">
        <text class="price-value">0.6100</text>
        <text class="price-unit">元/度</text>
      </view>
      <view class="scan-button">
        <image class="scan-icon" src="/static/images/扫码.png" mode="aspectFit"></image>
        <text class="scan-text">扫码充电</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'free',
      pileList: [
        {
          number: '102号直流',
          terminal: '131082025010102',
          power: '60kW~240kW | 300V~1000V(12V)',
          info: '直流快充 | 国标2015'
        },
        {
          number: '102号直流',
          terminal: '131082025010102',
          power: '60kW~240kW | 300V~1000V(12V)',
          info: '直流快充 | 国标2015'
        },
        {
          number: '102号直流',
          terminal: '131082025010102',
          power: '60kW~240kW | 300V~1000V(12V)',
          info: '直流快充 | 国标2015'
        },
        {
          number: '102号直流',
          terminal: '131082025010102',
          power: '60kW~240kW | 300V~1000V(12V)',
          info: '直流快充 | 国标2015'
        },
        {
          number: '102号直流',
          terminal: '131082025010102',
          power: '60kW~240kW | 300V~1000V(12V)',
          info: '直流快充 | 国标2015'
        },
        {
          number: '102号直流',
          terminal: '131082025010102',
          power: '60kW~240kW | 300V~1000V(12V)',
          info: '直流快充 | 国标2015'
        }
      ]
    }
  },
  onLoad() {
    
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
    },
    goToPileDetail(pile) {
      uni.navigateTo({
        url: '/bundle/pages/industry_list/pile_detail'
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1038;
  padding: 20rpx 30rpx 120rpx;
}

/* Tab切换 */
.tab-container {
  display: flex;
  gap: 12rpx;
  margin-bottom: 30rpx;
  width: fit-content;
}

.tab-item {
  height: 60rpx;
  background: #353548;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
}

.tab-item.active {
  background: linear-gradient(90deg, #F4BE66 0%, #FDE3B3 49.62%, #F3C06A 100%);
}

.tab-text {
  font-size: 26rpx;
  color: #E4E3E3;
}

.tab-item.active .tab-text {
  color: #380C00;
}

/* 充电桩列表 */
.pile-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.pile-item {
  background: #1F2034;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  gap: 20rpx;
}

.pile-left {
  display: flex;
  align-items: center;
}

.pile-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 8rpx solid #FFE3BB;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.icon-text {
  font-size: 20rpx;
  color: #FFE3BB;
  font-weight: 500;
}

.pile-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.pile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.pile-number {
  font-size: 32rpx;
  color: #F5C06A;
  font-weight: 500;
}

.pile-badge {
  background: linear-gradient(90deg, #FDE2B0 8.19%, #F4C26F 100%);
  border-radius: 8rpx;
  padding: 4rpx 12rpx;
}

.badge-text {
  font-size: 22rpx;
  color: #380C00;
}

.pile-terminal {
  font-size: 24rpx;
  color: #E4E3E3;

}

.pile-power {
  font-size: 24rpx;
  color: #E4E3E3;
}

.pile-info {
  font-size: 24rpx;
  color: #E4E3E3;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #0D1038;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 2rpx solid #2A2B3F;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.price-value {
  font-size: 48rpx;
  color: #f5c16B;
  font-weight: bold;
}

.price-unit {
  font-size: 24rpx;
  color: #f5c16B;
}

.scan-button {
  background: linear-gradient(90deg, #F5BF69 0%, #FEE2AF 49.51%, #F5BF6B 100%);
  border-radius: 40rpx;
  padding: 20rpx 60rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.scan-icon {
  width: 32rpx;
  height: 32rpx;
}

.scan-text {
  font-size: 32rpx;
  color: #380C00;
  font-weight: 500;
}
</style>

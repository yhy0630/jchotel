<template>
  <view class="page">
    <!-- Tab切换按钮 -->
    <view class="tab-container">
      <view :class="['tab-item', { active: activeTab === 'gas' }]" @click="switchTab('gas')">
        <text class="tab-text">加油</text>
      </view>
      <view :class="['tab-item', { active: activeTab === 'charge' }]" @click="switchTab('charge')">
        <text class="tab-text">充电</text>
      </view>
    </view>

    <!-- 加油站列表 -->
    <view v-if="activeTab === 'gas'" class="list-container">
      <view v-for="(item, index) in gasList" :key="index" class="list-item" @click="goToDetail(item)">
        <view class="item-left">
          <view class="price-box">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ item.price }}</text>
            <text class="price-unit">/L</text>
          </view>
          <text class="oil-type">{{ item.oilType }}</text>
        </view>
        <view class="item-center">
          <text class="station-name">{{ item.name }}</text>
          <text class="station-address">{{ item.address }}</text>
          <view class="tag">
            <text class="tag-text">{{ item.tag }}</text>
          </view>
        </view>
        <view class="item-right">
          <view class="distance-box">
            <image class="distance-icon" src="/static/images/Vector 71.png" mode="aspectFit"></image>
            <text class="distance-text">{{ item.distance }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 充电站列表 -->
    <view v-if="activeTab === 'charge'" class="list-container">
      <view v-for="(item, index) in chargeList" :key="index" class="charge-item" @click="goToPowerDetail(item)">
        <view class="charge-top">
          <view class="charge-left">
            <image class="station-image" :src="item.image" mode="aspectFill"></image>
          </view>
          <view class="charge-center">
            <text class="station-name">{{ item.name }}</text>
            <text class="station-info">{{ item.info }}</text>
            <text class="station-desc">{{ item.desc }}</text>
          </view>
          <view class="charge-right">
            <view class="distance-box">
              <image class="distance-icon" src="/static/images/Vector 71.png" mode="aspectFit"></image>
              <text class="distance-text">{{ item.distance }}</text>
            </view>
            <image class="more-icon" src="/static/images/more.png" mode="aspectFit"></image>
          </view>
        </view>
        <view class="separator-line"></view>
        <view class="charge-bottom">
          <view class="price-box">
            <text class="price-symbol">￥</text>
            <text class="price-value">{{ item.price }}</text>
            <text class="price-unit">/度</text>
          </view>
          <view class="rating-group">
            <view class="rating-box fast">
              <text class="rating-label">快</text>
            </view>
            <view class="rating-box slow">
              <text class="rating-text">闲{{ item.rating }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import config from '@/config/app.js'

export default {
  data() {
    return {
      activeTab: 'gas',
      gasList: [
        {
          price: '6.74',
          oilType: '油品价格6.93/L',
          name: '燕北加油站',
          address: 'G102长春嘉泰交口西南方向',
          tag: '加200减4.61',
          distance: '2.09km'
        },
        {
          price: '6.74',
          oilType: '油品价格6.93/L',
          name: '燕北加油站',
          address: 'G102长春嘉泰交口西南方向',
          tag: '加200减4.61',
          distance: '2.09km'
        },
        {
          price: '6.74',
          oilType: '油品价格6.93/L',
          name: '燕北加油站',
          address: 'G102长春嘉泰交口西南方向',
          tag: '加200减4.61',
          distance: '2.09km'
        },
        {
          price: '6.74',
          oilType: '油品价格6.93/L',
          name: '燕北加油站',
          address: 'G102长春嘉泰交口西南方向',
          tag: '加200减4.61',
          distance: '2.09km'
        },
        {
          price: '6.74',
          oilType: '油品价格6.93/L',
          name: '燕北加油站',
          address: 'G102长春嘉泰交口西南方向',
          tag: '加200减4.61',
          distance: '2.09km'
        },
        {
          price: '6.74',
          oilType: '油品价格6.93/L',
          name: '燕北加油站',
          address: 'G102长春嘉泰交口西南方向',
          tag: '加200减4.61',
          distance: '2.09km'
        }
      ],
      chargeList: [
        {
          image: '',
          name: '凤尚维多充电站',
          info: '2分 | 皇冠五星13分钟 对外开放',
          desc: '充电车辆半个小时即免，超出半个小时每小时...',
          price: '0.6100',
          rating: '6/7',
          distance: '2.09km'
        },
        {
          image: '',
          name: '凤尚维多充电站',
          info: '2分 | 皇冠五星13分钟 对外开放',
          desc: '充电车辆半个小时即免，超出半个小时每小时...',
          price: '0.6100',
          rating: '6/7',
          distance: '2.09km'
        },
        {
          image: '',
          name: '凤尚维多充电站',
          info: '2分 | 皇冠五星13分钟 对外开放',
          desc: '充电车辆半个小时即免，超出半个小时每小时...',
          price: '0.6100',
          rating: '6/7',
          distance: '2.09km'
        },
        {
          image: '',
          name: '凤尚维多充电站',
          info: '2分 | 皇冠五星13分钟 对外开放',
          desc: '充电车辆半个小时即免，超出半个小时每小时...',
          price: '0.6100',
          rating: '6/7',
          distance: '2.09km'
        }
      ]
    }
  },
  onLoad() {
    // 初始化充电站图片
    const imageUrl = config.baseURL + '/uploads/images/images/充电图片.png'
    this.chargeList.forEach(item => {
      item.image = imageUrl
    })
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
    },
    goToDetail(item) {
      uni.navigateTo({
        url: '/pages/industry_list/cheer_detail'
      })
    },
    goToPowerDetail(item) {
      uni.navigateTo({
        url: '/pages/industry_list/power_detail'
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1038;
  padding: 20rpx 30rpx;
}

/* Tab切换 */
.tab-container {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.tab-item {
  flex: 1;
  height: 80rpx;
  background: #2A2B3F;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-item.active {
  background: linear-gradient(90deg, #F5BF69 0%, #FEE2AF 49.51%, #F5BF6B 100%);
}

.tab-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #ffffff;
}

.tab-item.active .tab-text {
  color: #380C00;
}

/* 列表容器 */
.list-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* 加油站列表项 */
.list-item {
  background: #1F2034;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.item-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-right: 2rpx solid #B9BABE;
  padding-right: 20rpx;
  margin-right: 20rpx;
  padding-top: 10rpx;
  padding-bottom: 10rpx;
}

.price-box {
  display: flex;
  align-items: baseline;
  margin-bottom: 10rpx;
}

.price-symbol {
  font-size: 28rpx;
  color: #f5c16b;
  font-weight: bold;
}

.price-value {
  font-size: 48rpx;
  color: #f5c16b;
  font-weight: bold;
}

.price-unit {
  font-size: 24rpx;
  color: #f5c16b;
}

.oil-type {
  font-size: 24rpx;
  color: #999;
}

.item-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.station-name {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 500;
}

.station-address {
  font-size: 24rpx;
  color: #999;
}

.tag {
  background: linear-gradient(90deg, #F5BF69 0%, #FEE2AF 49.51%, #F5BF6B 100%);
  border-radius: 8rpx;
  padding: 4rpx 12rpx;
  align-self: flex-start;
}

.tag-text {
  font-size: 22rpx;
  color: #380C00;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.distance-box {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #FFD99A;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.distance-icon {
  width: 24rpx;
  height: 24rpx;
}

.distance-text {
  font-size: 24rpx;
  color: #380C00;
}

/* 充电站列表项 */
.charge-item {
  background: #1F2034;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
}

.charge-top {
  display: flex;
  gap: 20rpx;
}

.charge-left {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.station-image {
  width: 100%;
  height: 100%;
}

.charge-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.station-info {
  font-size: 24rpx;
  color: #999;
}

.station-desc {
  font-size: 24rpx;
  color: #999;
}

.separator-line {
  width: 100%;
  height: 2rpx;
  background: #6B6B6B;
  margin: 20rpx 0;
}

.charge-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rating-group {
  display: flex;
  align-items: center;
  gap: 0;
}

.rating-box {
  padding: 8rpx 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rating-box.fast {
  background: #F5BF69;
  border-radius: 8rpx 0 0 8rpx;
}

.rating-box.slow {
  background: #6B6B6B;
  border-radius: 0 8rpx 8rpx 0;
}

.rating-label {
  font-size: 24rpx;
  color: #380C00;
  font-weight: 500;
}

.rating-text {
  font-size: 24rpx;
  color: #ffffff;
}

.charge-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}

.charge-right .distance-box {
  background: #FFD99A;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.charge-right .distance-text {
  color: #380C00;
}

.more-icon {
  width: 32rpx;
  height: 32rpx;
}
</style>

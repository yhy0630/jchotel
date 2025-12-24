<template>
  <view class="page">
    <custom-navbar title="行业资讯" :show-back="false"></custom-navbar>
    <!-- 轮播图 -->
    <view class="swiper-wrapper">
      <swiper class="swiper" :indicator-dots="false" :autoplay="true" :interval="3000" :duration="500" :current="currentIndex" @change="onSwiperChange">
        <swiper-item v-for="(item, index) in bannerList" :key="index">
          <image :src="item" mode="aspectFill" class="swiper-image"></image>
        </swiper-item>
      </swiper>
      <view class="dots-container">
        <view v-for="(item, index) in bannerList" :key="index" :class="['dot', { active: currentIndex === index }]"></view>
      </view>
    </view>

    <!-- 按钮区域 -->
    <view class="button-container">
      <view class="button-row">
        <view class="button-item" @click="navigateTo('/pages/industry_list/ai')">
          <text class="button-text">AI咨询</text>
        </view>
        <view class="button-item" @click="navigateTo('/pages/industry_list/law')">
          <text class="button-text">法律援助</text>
        </view>
        <view class="button-item" @click="navigateTo('/pages/industry_list/cheer')">
          <text class="button-text">加油/充电</text>
        </view>
      </view>
      <view class="button-row">
        <view class="button-item" @click="navigateTo('/pages/industry_list/private')">
          <text class="button-text">私人秘书</text>
        </view>
        <view class="button-item" @click="navigateTo('/pages/industry_list/agency')">
          <text class="button-text">工商代办</text>
        </view>
        <view class="button-item" @click="navigateTo('/pages/industry_list/company')">
          <text class="button-text">管企业</text>
        </view>
      </view>
      <view class="button-row">
        <view class="button-item" @click="navigateTo('/pages/industry_list/doctor')">
          <text class="button-text">就医/陪诊</text>
        </view>
        <view class="button-item" @click="navigateTo('/pages/industry_list/tea')">
          <text class="button-text">酒水/茶</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      bannerList: [
        '/static/images/Rectangle 30186.png'
      ],
      currentIndex: 0
    }
  },
  onLoad() {
    
  },
  methods: {
    navigateTo(url) {
      uni.navigateTo({ url })
    },
    onSwiperChange(e) {
      this.currentIndex = e.detail.current
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1038;
  padding-top: calc(88rpx + var(--status-bar-height));
}

.swiper-wrapper {
  position: relative;
  width: 100%;
}

.swiper {
  width: 100%;
  height: 420rpx;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.dots-container {
  position: absolute;
  bottom: 30rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 12rpx;
  z-index: 100;
  pointer-events: none;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s;
}

.dot.active {
  background: #FFD700;
  width: 24rpx;
  border-radius: 6rpx;
}

.button-container {
  padding: 30rpx 40rpx;
}

.button-row {
  display: flex;
  justify-content: flex-start;
  gap: 35rpx;
  margin-bottom: 35rpx;
}

.button-item {
  width: 200rpx;
  height: 100rpx;
  background: linear-gradient(90deg, #F5BF69 0%, #FEE2AF 49.51%, #F5BF6B 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #380C00;
}
</style>

<template>
  <view class="page">
    <!-- Tab切换 -->
    <view class="tabs">
      <view :class="['tab', { active: currentTab === 0 }]" @click="switchTab(0)">定制需求</view>
      <view :class="['tab', { active: currentTab === 1 }]" @click="switchTab(1)">我的出价</view>
    </view>

    <!-- 定制需求列表 -->
    <scroll-view v-if="currentTab === 0" scroll-y class="list">
      <view v-for="item in requestList" :key="item.id" class="card" @click="goOffer(item)">
        <view class="header">
          <text class="type">定制房需求</text>
          <button class="offer-btn" @click.stop="goOffer(item)">点击出价</button>
        </view>
        <view class="room-name">{{ item.room_type || '豪华标间' }}</view>
        <view class="location">{{ item.city_name }}{{ item.area }}</view>
        <view class="price-range">{{ item.price_range }}</view>
        <view class="rating">{{ item.hotel_level }}</view>
        <view class="dates">{{ item.check_in_date }} 至 {{ item.check_out_date }}·{{ item.night_num }}晚1间·{{ item.room_type }}</view>
      </view>
    </scroll-view>

    <!-- 我的出价列表 -->
    <scroll-view v-if="currentTab === 1" scroll-y class="list">
      <view v-for="item in offerList" :key="item.id" class="card">
        <view class="room-name">{{ item.room_type || '豪华标间' }}</view>
        <view class="location">{{ item.city_name }}</view>
        <view class="offer-amount">出价金额: ¥{{ item.offer_amount }}</view>
        <view class="status">状态: {{ getStatusText(item.status) }}</view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { merchantRequestList, merchantOfferList } from '../../api/hotel.js'

export default {
  data() {
    return {
      currentTab: 0,
      requestList: [],
      offerList: []
    }
  },
  onLoad() {
    this.loadRequestList()
  },
  methods: {
    switchTab(index) {
      this.currentTab = index
      if (index === 0) {
        this.loadRequestList()
      } else {
        this.loadOfferList()
      }
    },
    async loadRequestList() {
      try {
        const res = await merchantRequestList({ page: 1, limit: 20 })
        if (res.code === 1) {
          this.requestList = res.data.list || []
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      }
    },
    async loadOfferList() {
      try {
        const res = await merchantOfferList({ page: 1, limit: 20 })
        if (res.code === 1) {
          this.offerList = res.data.list || []
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      }
    },
    goOffer(item) {
      uni.navigateTo({
        url: `/pages/hotel/merchant-offer?request_id=${item.id}`
      })
    },
    getStatusText(status) {
      const map = { 0: '待选择', 1: '已选', 2: '未选中', 3: '取消' }
      return map[status] || '未知'
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #1a1a2e;
}
.tabs {
  display: flex;
  background: #16213e;
  border-bottom: 2px solid #0f1624;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 28rpx;
}
.tab.active {
  color: #ff9500;
  border-bottom: 2px solid #ff9500;
}
.list {
  height: calc(100vh - 100rpx);
  padding: 20rpx;
}
.card {
  background: #16213e;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.type {
  color: #ff9500;
  font-size: 24rpx;
}
.offer-btn {
  background: #ff9500;
  color: #fff;
  border: none;
  padding: 10rpx 30rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}
.room-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}
.location, .price-range, .rating, .dates, .offer-amount, .status {
  color: #999;
  font-size: 24rpx;
  margin-bottom: 5rpx;
}
</style>


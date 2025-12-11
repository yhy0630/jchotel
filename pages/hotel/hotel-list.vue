<template>
  <view class="page">
    <!-- 选项卡 -->
    <view class="tabs">
      <view :class="['tab', { active: activeTab === 'premium' }]" @click="switchTab('premium')">
        尊享房
      </view>
      <view :class="['tab', { active: activeTab === 'custom' }]" @click="switchTab('custom')">
        定制房
      </view>
    </view>

    <!-- 尊享房内容 -->
    <view v-if="activeTab === 'premium'">
      <!-- 搜索栏 -->
      <view class="search-bar">
        <view class="city-select" @click="selectCity">
          <text>{{ cityName || '选择城市' }}</text>
          <text class="arrow">▼</text>
        </view>
        <view class="date-select" @click="selectDate">
          <text>{{ checkInDate }} 至 {{ checkOutDate }}</text>
        </view>
        <button class="search-btn" @click="goSearch">搜索</button>
      </view>

      <!-- 筛选栏 -->
      <view class="filter-bar">
        <text @click="showFilter">位置/品牌/酒店/星级</text>
        <text @click="showFilter">价格/房型</text>
      </view>

      <!-- 酒店列表 -->
      <scroll-view scroll-y class="list" @scrolltolower="loadMore">
        <view v-for="item in list" :key="item.hotelCode" class="card" @click="goDetail(item)">
          <image :src="item.images && item.images[0] ? item.images[0].url : ''" class="thumb" mode="aspectFill" />
          <view class="info">
            <view class="name">{{ item.hotelName }}</view>
            <view class="rating">
              <text class="score">{{ item.commentPoint || 0 }}</text>
              <text class="reviews">{{ item.commentCount || 0 }}条点评</text>
            </view>
            <view class="location">距您{{ item.distince || '--' }}公里 近{{ item.businessarea || '--' }}</view>
            <view class="desc">{{ item.shortDesc || '' }}</view>
            <view class="price-row">
              <text class="price">挂牌价 ¥{{ formatPrice(item.list_price || item.minPrice) }}</text>
              <text class="price vip">尊享价 ¥{{ formatPrice(item.vip_price || item.minPrice) }}</text>
              <text class="price share">股东价 ¥{{ formatPrice(item.share_price || item.minPrice) }}</text>
            </view>
          </view>
        </view>
        <view v-if="loading" class="loading">加载中...</view>
        <view v-if="noMore" class="no-more">没有更多了</view>
      </scroll-view>
    </view>

    <!-- 定制房内容 -->
    <view v-if="activeTab === 'custom'" class="custom-placeholder">
      <view class="placeholder-text">定制房功能</view>
      <button class="goto-btn" @click="goToCustomForm">发布定制房需求</button>
    </view>
  </view>
</template>

<script>
import { hotelList } from '@/api/hotel.js'

export default {
  data() {
    return {
      activeTab: 'premium', // 当前选中的选项卡: premium-尊享房, custom-定制房
      cityCode: '',
      cityName: '北京',
      checkInDate: '',
      checkOutDate: '',
      list: [],
      page: 1,
      row: 10,
      total: 0,
      loading: false,
      noMore: false
    }
  },
  onLoad(options) {
    this.cityCode = options.cityCode || 'C1025'
    this.cityName = options.cityName || '北京'
    const today = new Date()
    this.checkInDate = this.formatDate(today)
    const tomorrow = new Date(today.getTime() + 86400000)
    this.checkOutDate = this.formatDate(tomorrow)
    this.loadList()
  },
  methods: {
    switchTab(tab) {
      if (this.activeTab === tab) return
      this.activeTab = tab
      if (tab === 'custom') {
        // 点击定制房选项卡，跳转到定制房发布页面
        this.goToCustomForm()
      }
    },
    goToCustomForm() {
      uni.navigateTo({
        url: '/pages/hotel/custom-form'
      })
    },
    formatDate(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      return numPrice.toFixed(2)
    },
    async loadList() {
      if (this.loading || this.noMore) return
      this.loading = true
      try {
        const res = await hotelList({
          city_code: this.cityCode,
          check_in_date: this.checkInDate,
          check_out_date: this.checkOutDate,
          page: this.page,
          row: this.row
        })
        if (res.code === 1) {
          if (this.page === 1) {
            this.list = res.data.list || []
          } else {
            this.list = this.list.concat(res.data.list || [])
          }
          this.total = res.data.total || 0
          if (this.list.length >= this.total) {
            this.noMore = true
          }
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    loadMore() {
      if (!this.noMore) {
        this.page++
        this.loadList()
      }
    },
    selectCity() {
      uni.navigateTo({ url: '/pages/hotel/city-select' })
    },
    selectDate() {
      // 日期选择器
      uni.showToast({ title: '日期选择功能待实现', icon: 'none' })
    },
    showFilter() {
      uni.showToast({ title: '筛选功能待实现', icon: 'none' })
    },
    goDetail(item) {
      uni.navigateTo({
        url: `/pages/hotel/hotel-detail?hotelCode=${item.hotelCode}&cityCode=${item.cityCode}&checkInDate=${this.checkInDate}&checkOutDate=${this.checkOutDate}`
      })
    },
    goSearch() {
      uni.navigateTo({
        url: `/pages/hotel/hotel-search?cityCode=${this.cityCode}&cityName=${this.cityName}&checkInDate=${this.checkInDate}&checkOutDate=${this.checkOutDate}`
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}
.tabs {
  display: flex;
  background: #fff;
  border-bottom: 2rpx solid #eee;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 30rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
}
.tab.active {
  color: #ff9500;
  font-weight: bold;
}
.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #ff9500;
  border-radius: 2rpx;
}
.custom-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40rpx;
}
.placeholder-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 40rpx;
}
.goto-btn {
  background: #ff9500;
  color: #fff;
  border: none;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.search-bar {
  background: #fff;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
}
.city-select, .date-select {
  padding: 10rpx 20rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  flex: 1;
  margin-right: 20rpx;
}
.search-btn {
  background: #ff9500;
  color: #fff;
  border: none;
  padding: 10rpx 40rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  white-space: nowrap;
}
.filter-bar {
  background: #fff;
  padding: 20rpx;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #eee;
}
.list {
  height: calc(100vh - 200rpx);
}
.card {
  background: #fff;
  margin: 20rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  display: flex;
}
.thumb {
  width: 200rpx;
  height: 200rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}
.info {
  flex: 1;
}
.name {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}
.rating {
  font-size: 24rpx;
  color: #ff9500;
  margin-bottom: 10rpx;
}
.location {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}
.desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.price-row {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
}
.price {
  font-size: 24rpx;
  color: #333;
}
.price.vip {
  color: #ff9500;
}
.price.share {
  color: #ff0000;
}
.loading, .no-more {
  text-align: center;
  padding: 20rpx;
  color: #999;
}
</style>


<template>
  <view class="page">
    <!-- 顶部大图 -->
    <view class="header-image">
      <image src="/static/images/酒店.png" mode="aspectFill" class="banner" />
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" @click="showFilter">
        <text>距离</text>
        <text class="arrow">▼</text>
      </view>
      <view class="filter-item" @click="showFilter">
        <text>价格</text>
        <text class="arrow">▼</text>
      </view>
      <view class="filter-item" @click="showFilter">
        <text>位置</text>
        <text class="arrow">▼</text>
      </view>
      <view class="filter-item" @click="showFilter">
        <text>房型</text>
        <text class="arrow">▼</text>
      </view>
      <view class="filter-item date-filter" @click="selectDate">
        <text>{{ checkInDate }}-{{ checkOutDate }}(一晚)</text>
        <text class="arrow">▼</text>
      </view>
    </view>

    <!-- 酒店列表 -->
    <scroll-view scroll-y class="list" @scrolltolower="loadMore">
      <view v-for="item in list" :key="item.hotelCode" class="card" @click="goDetail(item)">
        <image :src="item.images && item.images[0] ? item.images[0].url : ''" class="thumb" mode="aspectFill" />
        <view class="info">
          <view class="name">{{ item.hotelName }}</view>
          <view class="rating">
            <view class="score-badge">{{ item.commentPoint || 0 }}</view>
            <text class="reviews">超棒</text>
            <text class="review-count">{{ item.commentCount || 0 }}条点评</text>
          </view>
          <view class="location">距您直线距离{{ item.distince || '--' }}公里 近{{ item.businessarea || '--' }}广场</view>
          <view class="desc">酒店介绍：{{ item.shortDesc || '' }}</view>
          <view class="price-row">
            <view class="price-line">
              <text class="price-label">挂牌价</text>
              <text class="price-value">¥{{ formatPrice(item.list_price || item.minPrice) }}起</text>
            </view>
            <view class="price-line vip">
              <text class="price-label">尊享价</text>
              <text class="price-value">¥{{ formatPrice(item.vip_price || item.minPrice) }}起</text>
            </view>
            <view class="price-line share">
              <text class="price-label">股东价</text>
              <text class="price-value">¥{{ formatPrice(item.share_price || item.minPrice) }}起</text>
            </view>
          </view>
        </view>
      </view>
      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="noMore" class="no-more">没有更多了</view>
    </scroll-view>
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
  background: #0D1034;
}

.header-image {
  width: 100%;
  height: 400rpx;
  position: relative;
}

.banner {
  width: 100%;
  height: 100%;
}

.filter-bar {
  background: #0D1034;
  padding: 30rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-item {
  color: #fff;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.filter-item.date-filter {
  font-size: 24rpx;
}

.arrow {
  font-size: 20rpx;
  color: #fff;
}

.list {
  height: calc(100vh - 480rpx);
  background: #0D1034;
}

.card {
  background: #1E1F34;
  margin: 20rpx 30rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  display: flex;
  gap: 24rpx;
}

.thumb {
  width: 220rpx;
  height: 300rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.name {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12rpx;
}

.rating {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.score-badge {
  background: linear-gradient(115.46deg, #F4BE66 0.67%, #FEE3B2 55.65%, #F3BC62 94.35%);
  color: #021742;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.reviews {
  color: #fff;
  font-size: 24rpx;
}

.review-count {
  color: #fff;
  font-size: 22rpx;
}

.location {
  font-size: 24rpx;
  color: #fff;
  margin-bottom: 12rpx;
  line-height: 1.5;
}

.desc {
  font-size: 24rpx;
  color: #fff;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.price-row {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.price-line {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.price-label {
  font-size: 26rpx;
  color: #fff;
}

.price-value {
  font-size: 26rpx;
  color: #fff;
}

.price-line.vip .price-label,
.price-line.vip .price-value {
  background: linear-gradient(90deg, #F3BC63 0%, #FFE6B6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.price-line.share .price-label,
.price-line.share .price-value {
  color: #fff;
}

.loading, .no-more {
  text-align: center;
  padding: 40rpx;
  color: #666;
  font-size: 26rpx;
}
</style>


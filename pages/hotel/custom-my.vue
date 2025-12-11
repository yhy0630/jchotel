<template>
  <view class="page">
    <scroll-view scroll-y class="list">
      <view v-for="item in list" :key="item.id" class="card">
        <view class="header">
          <text class="type">定制房需求</text>
          <text class="status">{{ getStatusText(item.status) }}</text>
        </view>
        <view class="room-name">{{ item.room_type || '豪华标间' }}</view>
        <view class="location">{{ item.city_name }}{{ item.area }}</view>
        <view class="price-range">{{ item.price_range }}</view>
        <view class="rating">{{ item.hotel_level }}</view>
        <view class="dates">{{ item.check_in_date }} 至 {{ item.check_out_date }}·{{ item.night_num }}晚1间·{{ item.room_type }}</view>
        <view class="actions">
          <button class="detail-btn" @click="goDetail(item)">详情</button>
        </view>
      </view>
      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="noMore" class="no-more">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script>
import { customMyList } from '../../api/hotel.js'

export default {
  data() {
    return {
      list: [],
      page: 1,
      limit: 10,
      loading: false,
      noMore: false
    }
  },
  onLoad() {
    this.loadList()
  },
  onPullDownRefresh() {
    this.page = 1
    this.noMore = false
    this.loadList()
  },
  onReachBottom() {
    if (!this.noMore) {
      this.page++
      this.loadList()
    }
  },
  methods: {
    getStatusText(status) {
      const map = { 0: '待报价', 1: '已报价', 2: '已选择', 3: '已取消' }
      return map[status] || '未知'
    },
    async loadList() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await customMyList({ page: this.page, limit: this.limit })
        if (res.code === 1) {
          if (this.page === 1) {
            this.list = res.data.list || []
          } else {
            this.list = this.list.concat(res.data.list || [])
          }
          if (this.list.length >= res.data.count) {
            this.noMore = true
          }
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
        uni.stopPullDownRefresh()
      }
    },
    goDetail(item) {
      uni.navigateTo({
        url: `/pages/hotel/custom-detail?request_id=${item.id}`
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #1a1a2e;
}
.list {
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
.status {
  color: #4caf50;
  font-size: 24rpx;
}
.actions {
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
}
.detail-btn {
  background: #ff9500;
  color: #fff;
  border: none;
  padding: 12rpx 40rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
}
.room-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}
.location, .price-range, .rating {
  color: #999;
  font-size: 24rpx;
  margin-bottom: 5rpx;
}
.dates {
  color: #fff;
  font-size: 24rpx;
  margin-top: 10rpx;
}
.loading, .no-more {
  text-align: center;
  padding: 20rpx;
  color: #999;
}
</style>


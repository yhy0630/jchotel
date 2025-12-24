<template>
  <view class="page">
    <custom-navbar title="我的发布"></custom-navbar>
    <scroll-view scroll-y class="list">
      <view v-for="item in list" :key="item.id" class="card">
        <view class="header">
          <image class="room-icon" src="/static/images/jiudian-2 1.png" mode="aspectFit"></image>
          <text class="type">订制房需求</text>
        </view>
        <view class="room-name">{{ item.room_type || '豪华标间' }}</view>
        <view class="location">
          {{ item.city_name }}{{ item.area ? item.area : '' }}
        </view>
        <view class="location" v-if="item.landmark">{{ item.landmark }}</view>
        <view class="price-range">{{ item.price_range }}</view>
        <view class="rating">{{ item.hotel_level }}</view>
        <view class="dates">
          {{ item.check_in_date }} 至 {{ item.check_out_date }}·{{ item.night_num || 1 }}晚{{ item.guest_num || 1 }}间·{{ item.room_type }}
        </view>
        <!-- 支付状态：复用商家我的出价/订单列表样式 -->
        <view class="pay-status">
          <text class="pay-status-label">支付状态：</text>
          <text :class="['pay-status-value', (item.pay_status === 1 || item.pay_status === '1') ? 'paid' : 'unpaid']">
            {{ (item.pay_status === 1 || item.pay_status === '1') ? '已支付' : '待支付' }}
          </text>
        </view>
        <view class="actions">
          <button class="detail-btn" @click="goDetail(item)">去查看</button>
        </view>
      </view>
      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="noMore && list.length > 0" class="no-more">没有更多了</view>
      <view v-if="!loading && list.length === 0" class="empty">暂无数据</view>
    </scroll-view>
  </view>
</template>

<script>
import { customMyList } from '../../../api/hotel.js'

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
        url: `/bundle/pages/hotel/custom-detail?request_id=${item.id}`
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1034;
  padding-top: calc(130rpx + var(--status-bar-height));
}

.list {
  height: 100vh;
  padding: 20rpx;
}

.card {
  background: #1E1F34;
  padding: 30rpx;
  margin-bottom: 20rpx;
  margin-right: 35rpx;
  border-radius: 12rpx;
  border: 2rpx solid #FCDDA6;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  gap: 16rpx;
}

.header .room-icon {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
}

.type {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  flex: 1;
}

.room-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.location, .price-range, .rating, .dates {
  color: #ffffff;
  font-size: 24rpx;
  margin-bottom: 5rpx;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20rpx;
}

.detail-btn {
  background: transparent;
  color: #FCDDA6;
  border: 2rpx solid #FCDDA6;
  padding: 15rpx 30rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  line-height: 1.5;
}

.detail-btn::after {
  border: none;
}

.pay-status {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
  padding-top: 10rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.pay-status-label {
  color: #ffffff;
  font-size: 24rpx;
}

.pay-status-value {
  font-size: 24rpx;
  font-weight: bold;
  margin-left: 10rpx;
}

.pay-status-value.paid {
  color: #4CAF50;
}

.pay-status-value.unpaid {
  color: #FF9800;
}

.loading, .no-more, .empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}
</style>


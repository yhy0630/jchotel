<template>
  <view class="page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="navbar-left" @click="goBack">
        <text class="icon-back">‹</text>
      </view>
      <view class="navbar-title">全部订单</view>
      <view class="navbar-right">
        <view class="filter-btn" @click="toggleTypePicker(true)">
          <text>{{ typeLabel }}</text>
          <text class="icon-down">▼</text>
        </view>
      </view>
    </view>

    <!-- Tab切换 -->
    <view class="tabs">
      <view :class="['tab', { active: status === '' }]" @click="switchTab('')">全部</view>
      <view :class="['tab', { active: status === '0' }]" @click="switchTab('0')">待付款</view>
      <view :class="['tab', { active: status === '1' }]" @click="switchTab('1')">待出行</view>
      <view :class="['tab', { active: status === '2' }]" @click="switchTab('2')">已完成</view>
    </view>

    <!-- 订单列表 -->
    <scroll-view scroll-y class="list" @scrolltolower="loadMore">
      <view v-for="item in list" :key="item.id" class="card" @click="goToDetail(item)">
        <view class="header">
          <image class="room-icon" src="/static/images/jiudian-2 1.png" mode="aspectFit"></image>
          <text class="type">{{ item.type === 1 ? '定制房' : '尊享房' }}</text>
          <text class="status">{{ getStatusText(item.status) }}</text>
        </view>
        <view class="room-name">{{ item.room_name  }}</view>
        <view class="location">{{ item.hotel_name }}</view>
        <view class="dates">{{ item.check_in_date }} 至 {{ item.check_out_date }}·{{ item.night_num }}晚{{ item.room_num || 1 }}间·{{ item.room_name || '大床房' }}</view>
        <view class="price">¥ {{ item.amount_payable || item.amount_paid || 0 }}</view>
        <view class="actions" @click.stop>
          <button v-if="item.status === 0" class="btn cancel" @click.stop="cancelOrder(item)">取消订单</button>
          <button v-if="item.status === 0" class="btn pay" @click.stop="goPay(item)">去支付</button>
          <button v-if="item.status === 1" class="btn cancel" @click.stop="cancelOrder(item)">取消订单</button>
          <button v-if="item.status === 2" class="btn invoice" @click.stop="applyInvoice(item)">申请开票</button>
        </view>
      </view>
      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="noMore && list.length > 0" class="no-more">没有更多了</view>
      <view v-if="!loading && list.length === 0" class="empty">暂无订单</view>
    </scroll-view>

    <!-- 订单类型选择弹窗 -->
    <view v-if="showTypePicker" class="type-picker-mask" @click="toggleTypePicker(false)">
      <view class="type-picker-panel" @click.stop>
        <view class="panel-header">
          <text class="panel-title">全部订单</text>
          <text class="panel-close" @click="toggleTypePicker(false)">✕</text>
        </view>
        <view class="panel-tags">
          <view
            v-for="item in typeOptions"
            :key="item.value"
            :class="['panel-tag', { active: activeType === item.value }]"
            @click="chooseType(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
        <view class="panel-tags secondary">
          <view class="panel-tag disabled">机票</view>
          <view class="panel-tag disabled">火车票</view>
          <view class="panel-tag disabled">租车</view>
          <view class="panel-tag disabled">打车</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { orderList, cancelOrder as cancelHotelOrder } from '@/api/hotel.js'

export default {
  data() {
    return {
      status: '',
      activeType: '', // 订单类型：''-全部, '1'-定制房, '2'-尊享房
      typeOptions: [
        { label: '全部', value: '' },
        { label: '尊享房', value: '2' },
        { label: '定制房', value: '1' }
      ],
      showTypePicker: false,
      list: [],
      page: 1,
      limit: 10,
      loading: false,
      noMore: false
    }
  },
  computed: {
    typeLabel() {
      const option = this.typeOptions.find(item => item.value === this.activeType)
      return option ? option.label : '全部订单'
    }
  },
  onLoad(options) {
    this.status = options.status || ''
    this.activeType = options.type || ''
    this.loadList()
  },
  onPullDownRefresh() {
    this.page = 1
    this.noMore = false
    this.loadList()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    switchTab(status) {
      this.status = status
      this.page = 1
      this.noMore = false
      this.loadList()
    },
    toggleTypePicker(force = null) {
      this.showTypePicker = force === null ? !this.showTypePicker : force
    },
    chooseType(value) {
      if (this.activeType === value) {
        this.toggleTypePicker(false)
        return
      }
      this.activeType = value
      this.toggleTypePicker(false)
      this.page = 1
      this.noMore = false
      this.loadList()
    },
    async loadList() {
      if (this.loading) return
      this.loading = true
      try {
        const params = {
          status: this.status,
          page: this.page,
          limit: this.limit
        }
        // 如果有选择订单类型，添加type参数
        if (this.activeType) {
          params.type = this.activeType
        }
        const res = await orderList(params)
        if (res.code === 1) {
          if (this.page === 1) {
            this.list = res.data.list || []
          } else {
            this.list = this.list.concat(res.data.list || [])
          }
          const total = res.data.count || res.data.total || 0
          if (this.list.length >= total || (res.data.list || []).length < this.limit) {
            this.noMore = true
          } else {
            this.page++
          }
        } else {
          uni.showToast({ title: res.msg || '加载失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
        uni.stopPullDownRefresh()
      }
    },
    loadMore() {
      if (!this.noMore && !this.loading) {
        this.loadList()
      }
    },
    getStatusText(status) {
      const map = { 0: '待付款', 1: '待出行', 2: '已完成', 3: '已取消' }
      return map[status] || '未知'
    },
    goToDetail(item) {
      uni.navigateTo({
        url: `/pages/hotel/order-detail?order_id=${item.id}&order_sn=${item.order_sn || ''}`
      })
    },
    cancelOrder(item) {
      uni.showModal({
        title: '提示',
        content: '确定取消订单？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const cancelRes = await cancelHotelOrder({ order_id: item.id })
              if (cancelRes.code === 1) {
                uni.showToast({ title: '订单已取消', icon: 'success' })
                setTimeout(() => {
                  this.page = 1
                  this.noMore = false
                  this.loadList()
                }, 1500)
              } else {
                uni.showToast({ title: cancelRes.msg || '取消失败', icon: 'none' })
              }
            } catch (e) {
              uni.showToast({ title: e.msg || '取消失败', icon: 'none' })
            }
          }
        }
      })
    },
    goPay(item) {
      uni.navigateTo({
        url: `/pages/payment/payment?from=hotel&order_id=${item.id}`
      })
    },
    applyInvoice(item) {
      // 跳转到申请开票页面，传递订单信息
      uni.navigateTo({
        url: `/pages/hotel/invoice-apply?order_id=${item.id}&order_sn=${item.order_sn || ''}`
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

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background: #16213e;
  position: relative;
}

.navbar-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-back {
  font-size: 48rpx;
  color: #ffffff;
  line-height: 1;
}

.navbar-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 36rpx;
  font-weight: 500;
  color: #ffffff;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.icon-down {
  font-size: 20rpx;
  color: #999;
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
  color: #ffffff;
  font-size: 32rpx;
  position: relative;
}

.tab.active {
  color: transparent;
  background: linear-gradient(90deg, #F3C16F 0%, #FDE1AD 51.18%, #F4C271 100%);
  -webkit-background-clip: text;
  background-clip: text;
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
  background: linear-gradient(90deg, #F3C16F 0%, #FDE1AD 51.18%, #F4C271 100%);
  border-radius: 2rpx;
}

.list {
  height: calc(100vh - 176rpx);
  padding: 20rpx;
}

.card {
  background: #16213e;
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

.header .type {
  flex: 1;
}

.header .status {
  margin-left: auto;
}

.type {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  padding: 0;
  background: transparent;
  border: none;
}

.status {
  color: #ff9500;
  font-size: 24rpx;
}

.room-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.location, .dates {
  color: #ffffff;
  font-size: 24rpx;
  margin-bottom: 5rpx;
}

.price {
  color: #ffffff;
  font-size: 36rpx;
  font-weight: bold;
  margin: 20rpx 0;
  text-align: right;
}

.actions {
  display: flex;
  gap: 20rpx;
  justify-content: flex-end;
  margin-top: 20rpx;
}

.btn {
  padding: 15rpx 30rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  border: none;
  line-height: 1.5;
}

.btn.cancel {
  background: transparent;
  color: #FCDDA6;
  border: 2rpx solid #FCDDA6;
}

.btn.pay, .btn.invoice {
  background: transparent;
  color: #FCDDA6;
  border: 2rpx solid #FCDDA6;
}

.btn.pay:active, .btn.invoice:active {
  background: linear-gradient(90deg, #F4C06B 0%, #FDE0AB 49.59%, #F3BF6C 100%);
  color: #380C00;
  border-color: transparent;
}

.loading, .no-more, .empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}

/* 订单类型选择弹窗 */
.type-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.type-picker-panel {
  width: 100%;
  background: #16213e;
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx 30rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  max-height: 70vh;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.panel-title {
  font-size: 36rpx;
  font-weight: 500;
  color: #ffffff;
}

.panel-close {
  font-size: 40rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.panel-tags.secondary {
  margin-bottom: 0;
}

.panel-tag {
  padding: 20rpx 40rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #ffffff;
  border: 2rpx solid transparent;
}

.panel-tag.active {
  background: rgba(255, 149, 0, 0.2);
  border-color: #ff9500;
  color: #ff9500;
}

.panel-tag.disabled {
  opacity: 0.5;
  color: #666;
}
</style>

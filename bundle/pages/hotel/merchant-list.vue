<template>
  <view class="page">
    <custom-navbar title="接单管理"></custom-navbar>
    <!-- Tab切换 -->
    <view class="tabs">
      <view :class="['tab', { active: currentTab === 0 }]" @click="switchTab(0)">定制需求</view>
      <view :class="['tab', { active: currentTab === 1 }]" @click="switchTab(1)">我的出价</view>
    </view>

    <!-- 定制需求列表 -->
    <scroll-view v-if="currentTab === 0" scroll-y class="list">
      <view v-for="item in requestList" :key="item.id" class="card">
        <view class="header">
          <view class="header-left">
            <image class="card-icon" src="/static/images/jiudian-2 1.png" mode="aspectFit"></image>
            <text class="type">定制房需求</text>
          </view>
          <button class="offer-btn" @click.stop="goOffer(item)">点击出价</button>
        </view>
        <view class="info-section">
          <view class="info-line room-name">{{ item.room_type || '豪华标间' }}</view>
          <view class="info-line">{{ item.city_name }}{{ item.area ? item.area : '' }}{{ item.landmark ? item.landmark : '' }}</view>
          <view class="info-line">{{ item.price_range }}</view>
          <view class="info-line">{{ item.hotel_level }}</view>
          <view class="info-line">{{ item.check_in_date }} 至</view>
          <view class="info-line">{{ item.check_out_date }}·{{ item.night_num }}晚1间·{{ item.room_type }}</view>
        </view>
      </view>
    </scroll-view>

    <!-- 我的出价列表 -->
    <scroll-view v-if="currentTab === 1" scroll-y class="list">
      <view v-for="item in offerList" :key="item.id" class="card">
        <view class="header">
          <view class="header-left">
            <image class="card-icon" src="/static/images/jiudian-2 1.png" mode="aspectFit"></image>
            <text class="type">定制房需求</text>
          </view>
          <!-- 如果对应订单已支付，则不再显示“点击出价”按钮 -->
          <button 
            v-if="item.pay_status !== 1 && item.pay_status !== '1'" 
            class="offer-btn" 
            @click.stop="goOffer(item)"
          >点击出价</button>
        </view>
        <view class="info-section">
          <view class="info-line room-name">{{ item.room_type}}</view>
          <view class="info-line">{{ item.city_name }}</view>
          <view class="info-line">{{ item.price_range }}</view>
          <view class="info-line">{{ item.hotel_level }}</view>
          <view class="info-line">{{ item.check_in_date }} 至</view>
          <view class="info-line">{{ item.check_out_date }}·{{ item.night_num }}晚1间·{{ item.room_type }}</view>
          <view class="info-line" style="font-size: 30rpx;">已出价：¥{{ item.offer_amount}}</view>
          <view class="info-line pay-status">
            <text class="pay-status-label">支付状态：</text>
            <text :class="['pay-status-value', item.pay_status === 1 ? 'paid' : 'unpaid']">
              {{ item.pay_status === 1 ? '已支付' : '待支付' }}
            </text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { merchantRequestList, merchantOfferList } from '../../../api/hotel.js'

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
    // 监听支付成功事件
    uni.$on('payment', this.handlePaymentResult)
  },
  onShow() {
    // 页面显示时，如果当前在"我的出价"标签页，刷新列表数据
    if (this.currentTab === 1) {
      this.loadOfferList()
    }
  },
  onUnload() {
    // 移除支付事件监听
    uni.$off('payment', this.handlePaymentResult)
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
        url: `/bundle/pages/hotel/merchant-offer?request_id=${item.id}`
      })
    },
    getStatusText(status) {
      const map = { 0: '待选择', 1: '已选', 2: '未选中', 3: '取消' }
      return map[status] || '未知'
    },
    // 处理支付结果
    handlePaymentResult(paymentData) {
      if (paymentData.result && paymentData.from === 'hotel') {
        // 支付成功，如果当前在"我的出价"标签页，重新加载列表
        if (this.currentTab === 1) {
          this.loadOfferList()
        }
      }
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

.tabs {
  display: flex;
  background: #012158;
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
  height: calc(100vh - 100rpx);
  padding: 20rpx;
  background-color: #0D1034;
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.card-icon {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
}

.type {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
}

.offer-btn {
  background: linear-gradient(90deg, #F3BF69 0%, #FDE2AF 50.29%, #F3BF68 100%);
  color: #333333;
  border: none;
  padding: 0rpx 30rpx;
  border-radius: 50rpx;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 20rpx rgba(240, 190, 99, 0.3);
}

.offer-btn::after {
  border: none;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-line {
  color: #ffffff;
  font-size: 24rpx;
  line-height: 1.6;
}

.info-line.room-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
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
  font-size: 28rpx;
}

.pay-status-value {
  font-size: 28rpx;
  font-weight: bold;
  margin-left: 10rpx;
}

.pay-status-value.paid {
  color: #4CAF50;
}

.pay-status-value.unpaid {
  color: #FF9800;
}
</style>


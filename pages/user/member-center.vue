<template>
  <view class="page">
    <custom-navbar title="商旅会员"></custom-navbar>
    <scroll-view scroll-y class="content">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view class="user-info">
          <image class="avatar" :src="userInfo.avatar || '/static/images/my_portrait_empty.png'" mode="aspectFill"></image>
          <view class="user-details">
            <view class="user-name">{{ userInfo.nickname || '未登录' }}</view>
            <view class="user-tags">
              <view class="tag" v-if="userInfo.member_category_name">{{ userInfo.member_category_name }}</view>
              <view class="tag" v-if="userInfo.member_grade_name">{{ userInfo.member_grade_name }}</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 数据面板 -->
      <view class="panel">
        <view class="panel-grid">
          <view class="panel-item" @click="handleItemClick('energy')">
            <view class="item-label">我的能量分</view>
            <view class="item-value">{{ userInfo.energy_point || 0 }}</view>
          </view>
          <view class="panel-item" @click="handleItemClick('consume')">
            <view class="item-label">我的消费积分</view>
            <view class="item-value">{{ userInfo.consume_point || 0 }}</view>
          </view>
          <view class="panel-item" @click="handleItemClick('pending')">
            <view class="item-label">待付款</view>
            <view class="item-value">{{ orderStats.pending_payment || 0 }}</view>
          </view>
        </view>
        
        <view class="panel-divider"></view>
        
        <view class="panel-grid">
          <view class="panel-item" @click="handleItemClick('travel')">
            <view class="item-label">待出行</view>
            <view class="item-value">{{ orderStats.pending_travel || 0 }}</view>
          </view>
          <view class="panel-item" @click="handleItemClick('review')">
            <view class="item-label">待点评</view>
            <view class="item-value">{{ orderStats.pending_review || 0 }}</view>
          </view>
          <view class="panel-item" @click="handleItemClick('completed')">
            <view class="item-label">已完成</view>
            <view class="item-value">{{ orderStats.completed || 0 }}</view>
          </view>
        </view>
        
        <view class="panel-divider"></view>
        
        <view class="panel-grid">
          <view class="panel-item" @click="handleItemClick('complaint')">
            <view class="item-label">投诉反馈</view>
            <view class="item-value">{{ userInfo.complaint_count || 0 }}</view>
          </view>
          <view class="panel-item" @click="handleItemClick('platform')">
            <view class="item-label">平台信息</view>
            <view class="item-value">查看</view>
          </view>
          <view class="panel-item" @click="handleItemClick('archive')">
            <view class="item-label">个人档案</view>
            <view class="item-value">{{ userInfo.is_archive ? '已完善' : '待完善' }}</view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getUser } from '@/api/user.js'

export default {
  data() {
    return {
      userInfo: {},
      orderStats: {
        pending_payment: 0,
        pending_travel: 0,
        pending_review: 0,
        completed: 0
      }
    }
  },
  onLoad(options) {
    this.loadUserData()
  },
  onShow() {
    this.loadUserData()
  },
  methods: {
    async loadUserData() {
      try {
        const res = await getUser()
        if (res.code === 1) {
          this.userInfo = res.data || {}
          // 从用户数据中提取订单统计信息
          if (res.data.order_stats) {
            this.orderStats = res.data.order_stats
          }
        }
      } catch (e) {
        console.error('加载用户数据失败:', e)
        uni.showToast({
          title: e.msg || '加载失败',
          icon: 'none'
        })
      }
    },
    handleItemClick(type) {
      // 根据不同类型跳转到对应页面
      const routes = {
        energy: '/pages/user_points/user_points',
        consume: '/pages/user_points/user_points',
        pending: '/bundle/pages/hotel/order-list?status=0',
        travel: '/bundle/pages/hotel/order-list?status=1',
        review: '/bundle/pages/hotel/order-list?status=2',
        completed: '/bundle/pages/hotel/order-list?status=3',
        complaint: '/pages/user/complaint',
        platform: '/pages/user/platform-info',
        archive: '/pages/user/user-profile'
      }
      
      if (routes[type]) {
        uni.navigateTo({
          url: routes[type],
          fail: () => {
            uni.showToast({
              title: '功能开发中',
              icon: 'none'
            })
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1034;
  display: flex;
  flex-direction: column;
  padding-top: calc(130rpx + var(--status-bar-height));
}

.content {
  flex: 1;
  box-sizing: border-box;
  padding: 30rpx 20rpx 40rpx;
}

/* 用户信息卡片 */
.user-card {
  margin-bottom: 30rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.1);
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 12rpx;
}

.user-tags {
  display: flex;
  gap: 12rpx;
}

.tag {
  padding: 6rpx 16rpx;
  background: linear-gradient(90deg, #F3BD63 0%, #FDE3B1 50%, #F3BD64 100%);
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #380C00;
  font-weight: 500;
}

/* 数据面板 */
.panel {
  border-radius: 20rpx;
  background:#1E1F34;
  backdrop-filter: blur(10rpx);
  box-sizing: border-box;
  color: #fff;
  padding: 40rpx 10rpx;
}

.panel-grid {
  display: flex;
  justify-content: space-between;
}

.panel-item {
  flex: 1;
  text-align: center;
  padding: 0 10rpx;
}

.item-label {
  font-size: 24rpx;
  color: #FFF;
  margin-bottom: 16rpx;
  line-height: 1.4;
}

.item-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFE3BB;
  line-height: 1.2;
}

.panel-divider {
  height: 1rpx;
  background: #F7F8F9;
  margin: 40rpx 0;
}
</style>



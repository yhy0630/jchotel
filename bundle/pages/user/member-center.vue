<template>
  <view class="page">
    <custom-navbar :title="pageTitle"></custom-navbar>
    <view class="content">
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

      <!-- 数据面板 - 根据会员类别显示不同内容 -->
      <view class="panel">
        <!-- 调试信息 -->
        <view v-if="memberCategoryId === 0" class="debug-info">
          <text>正在加载会员信息...</text>
          <text>memberCategoryId: {{ memberCategoryId }}</text>
        </view>
        <!-- 商旅会员 (member_category_id: 1) -->
        <template v-if="memberCategoryId === 1">
          <view class="panel-grid">
            <view class="panel-item">
              <view class="item-label">我的能量分</view>
              <view class="item-value">{{ centerData.energy_point || 0 }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">我的消费积分</view>
              <view class="item-value">{{ centerData.consume_point || 0 }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">待付款</view>
              <view class="item-value">{{ centerData.pending_payment || 0 }}</view>
            </view>
          </view>
          <view class="panel-divider"></view>
          <view class="panel-grid">
            <view class="panel-item">
              <view class="item-label">待出行</view>
              <view class="item-value">{{ centerData.pending_travel || 0 }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">待点评</view>
              <view class="item-value">{{ centerData.pending_review || 0 }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">已完成</view>
              <view class="item-value">{{ centerData.completed || 0 }}</view>
            </view>
          </view>
          <view class="panel-divider"></view>
          <view class="panel-grid">
            <view class="panel-item">
              <view class="item-label">报销凭证</view>
              <view class="item-value">{{ centerData.complaint_count || 0 }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">平台信息</view>
              <view class="item-value">查看</view>
            </view>
            <view class="panel-item" @click="handleItemClick('archive')">
              <view class="item-label">个人档案</view>
              <view class="item-value">查看</view>
            </view>
          </view>
        </template>

        <!-- 渠道会员 (member_category_id: 2) -->
        <template v-else-if="memberCategoryId === 2">
          <view class="panel-grid">
            <view class="panel-item">
              <view class="item-label">小程序访客</view>
              <view class="item-value">{{ centerData.visitors || 0 }}人次</view>
            </view>
            <view class="panel-item">
              <view class="item-label">预定订单量</view>
              <view class="item-value">{{ centerData.booking_orders || 0 }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">在店间夜</view>
              <view class="item-value">{{ centerData.room_nights || 0 }}</view>
            </view>
          </view>
          <view class="panel-divider"></view>
          <view class="panel-grid">
            <view class="panel-item">
              <view class="item-label">预定销售额</view>
              <view class="item-value">{{ centerData.booking_sales || 0 }}元</view>
            </view>
            <view class="panel-item">
              <view class="item-label">安排预定房价</view>
              <view class="item-value">管理</view>
            </view>
            <view class="panel-item">
              <view class="item-label">门店评分</view>
              <view class="item-value">{{ centerData.store_rating || 0 }}分</view>
            </view>
          </view>
          <view class="panel-divider"></view>
          <view class="panel-grid">
            <view class="panel-item">
              <view class="item-label">待审核订单</view>
              <view class="item-value">{{ centerData.pending_audit || 0 }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">待点评客人</view>
              <view class="item-value">{{ centerData.pending_guest_review || 0 }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">平台信息</view>
              <view class="item-value">查看</view>
            </view>
          </view>
          <view class="panel-divider"></view>
          <view class="panel-grid">
            <view class="panel-item" @click="handleItemClick('archive')">
              <view class="item-label">个人档案</view>
              <view class="item-value">查看</view>
            </view>
            <view class="panel-item"></view>
            <view class="panel-item"></view>
          </view>
        </template>

        <!-- 企业会员 (member_category_id: 3) -->
        <template v-else-if="memberCategoryId === 3">
          <view class="panel-grid">
            <view class="panel-item">
              <view class="item-label">公司建档</view>
              <view class="item-value">{{ centerData.company_archive || '待完善' }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">部门建档</view>
              <view class="item-value">{{ centerData.department_archive || '待完善' }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">职员建档</view>
              <view class="item-value">{{ centerData.employee_archive || '待完善' }}</view>
            </view>
          </view>
          <view class="panel-divider"></view>
          <view class="panel-grid">
            <view class="panel-item">
              <view class="item-label">差标制度</view>
              <view class="item-value">{{ centerData.travel_policy || '待上传' }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">数据报表</view>
              <view class="item-value">{{ centerData.data_report || '可查看' }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">申请审批制度</view>
              <view class="item-value">{{ centerData.approval_system || '待开启' }}</view>
            </view>
          </view>
          <view class="panel-divider"></view>
          <view class="panel-grid">
            <view class="panel-item">
              <view class="item-label">授信额度</view>
              <view class="item-value">{{ centerData.reimbursement_system || '待设置' }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">信息通知</view>
              <view class="item-value">{{ centerData.notification || '待开启' }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">发票管理</view>
              <view class="item-value">{{ centerData.invoice_management || '待设置' }}</view>
            </view>
          </view>
          <view class="panel-divider"></view>
          <view class="panel-grid">
            <view class="panel-item" @click="handleItemClick('archive')">
              <view class="item-label">个人档案</view>
              <view class="item-value">查看</view>
            </view>
            <view class="panel-item"></view>
            <view class="panel-item"></view>
          </view>
        </template>

        <!-- 商务会员 (member_category_id: 4) -->
        <template v-else-if="memberCategoryId === 4">
          <view class="panel-grid">
            <view class="panel-item">
              <view class="item-label">收益管理</view>
              <view class="item-value">{{ centerData.closing_management || 0 }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">合同管理</view>
              <view class="item-value">{{ centerData.contract_management || 0 }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">待点评客人</view>
              <view class="item-value">{{ centerData.pending_guest_review || 0 }}</view>
            </view>
          </view>
          <view class="panel-divider"></view>
          <view class="panel-grid">
            <view class="panel-item">
              <view class="item-label">商旅客户</view>
              <view class="item-value">{{ centerData.business_travel_customers || 0 }}</view>
            </view>
            <view class="panel-item">
              <view class="item-label">渠道客户</view>
              <view class="item-value">管理</view>
            </view>
            <view class="panel-item">
              <view class="item-label">平台信息</view>
              <view class="item-value">查看</view>
            </view>
          </view>
          <view class="panel-divider"></view>
          <view class="panel-grid">
            <view class="panel-item">
              <view class="item-label">待审核订单</view>
              <view class="item-value">{{ centerData.pending_audit_waybill || 0 }}</view>
            </view>
            <view class="panel-item" @click="handleItemClick('archive')">
              <view class="item-label">个人档案</view>
              <view class="item-value">查看</view>
            </view>
            <view class="panel-item"></view>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<script>
import { getUser } from '@/api/user.js'
import request from '@/utils/request.js'
import customNavbar from '@/components/custom-navbar/custom-navbar.vue'

export default {
  components: {
    customNavbar
  },
  data() {
    return {
      userInfo: {},
      centerData: {},
      memberCategoryId: 0
    }
  },
  computed: {
    pageTitle() {
      const titles = {
        1: '商旅会员',
        2: '渠道会员',
        3: '企业会员',
        4: '商务会员'
      }
      return titles[this.memberCategoryId] || '会员中心'
    }
  },
  onLoad() {
    console.log('=== member-center onLoad ===')
    this.loadUserData().then(() => {
      this.loadCenterData()
    })
  },
  onShow() {
    console.log('=== member-center onShow ===')
    this.loadUserData().then(() => {
      this.loadCenterData()
    })
  },
  methods: {
    async loadUserData() {
      console.log('=== loadUserData 开始 ===')
      try {
        const res = await getUser()
        console.log('getUser 返回:', res)
        if (res.code === 1) {
          this.userInfo = res.data || {}
          console.log('userInfo:', this.userInfo)
          console.log('userInfo.member_category_id:', this.userInfo.member_category_id)
          // 如果接口返回了member_category_id，立即设置
          if (res.data && res.data.member_category_id) {
            this.memberCategoryId = res.data.member_category_id
            console.log('从getUser接口设置memberCategoryId:', this.memberCategoryId)
          }
        }
      } catch (e) {
        console.error('加载用户数据失败:', e)
      }
    },
    async loadCenterData() {
      console.log('=== loadCenterData 开始 ===')
      try {
        const res = await request({
          url: '/user/center',
          method: 'GET'
        })
        console.log('/user/center 返回:', res)
        if (res.code === 1 && res.data) {
          this.centerData = res.data
          this.memberCategoryId = res.data.member_category_id || 0
          console.log('centerData:', this.centerData)
          console.log('memberCategoryId 从接口获取:', this.memberCategoryId)
        }
        // 如果接口没有返回memberCategoryId，从userInfo获取
        if (!this.memberCategoryId && this.userInfo.member_category_id) {
          this.memberCategoryId = this.userInfo.member_category_id
          console.log('memberCategoryId 从userInfo获取:', this.memberCategoryId)
        }
        console.log('最终 memberCategoryId:', this.memberCategoryId)
      } catch (e) {
        console.error('加载中心数据失败:', e)
        if (this.userInfo.member_category_id) {
          this.memberCategoryId = this.userInfo.member_category_id
          console.log('异常时从userInfo获取 memberCategoryId:', this.memberCategoryId)
        }
      }
    },
    handleItemClick(type) {
      const routes = {
        energy: '/pages/user_points/user_points',
        consume: '/pages/user_points/user_points',
        pending: '/bundle/pages/hotel/order-list?status=0',
        travel: '/bundle/pages/hotel/order-list?status=1',
        review: '/bundle/pages/hotel/order-list?status=2',
        completed: '/bundle/pages/hotel/order-list?status=3',
        complaint: '/bundle/pages/user/complaint',
        platform: '/bundle/pages/user/platform-info',
        archive: '/bundle/pages/user_profile/user_profile',
        visitors: '/bundle/pages/channel/visitors',
        booking_orders: '/bundle/pages/channel/booking-orders',
        room_nights: '/bundle/pages/channel/room-nights',
        booking_sales: '/bundle/pages/channel/booking-sales',
        room_price: '/bundle/pages/channel/room-price',
        store_rating: '/bundle/pages/channel/store-rating',
        pending_audit: '/bundle/pages/channel/pending-audit',
        pending_guest_review: '/bundle/pages/channel/pending-guest-review',
        company_archive: '/bundle/pages/enterprise/company-archive',
        department_archive: '/bundle/pages/enterprise/department-archive',
        employee_archive: '/bundle/pages/enterprise/employee-archive',
        travel_policy: '/bundle/pages/enterprise/travel-policy',
        data_report: '/bundle/pages/enterprise/data-report',
        approval_system: '/bundle/pages/enterprise/approval-system',
        reimbursement_system: '/bundle/pages/enterprise/reimbursement-system',
        notification: '/bundle/pages/enterprise/notification',
        invoice_management: '/bundle/pages/enterprise/invoice-management',
        closing_management: '/bundle/pages/business/closing-management',
        contract_management: '/bundle/pages/business/contract-management',
        business_travel_customers: '/bundle/pages/business/business-travel-customers',
        channel_customers: '/bundle/pages/business/channel-customers',
        pending_audit_waybill: '/bundle/pages/business/pending-audit-waybill'
      }
      if (routes[type]) {
        uni.navigateTo({
          url: routes[type],
          fail: () => {
            uni.showToast({ title: '功能开发中', icon: 'none' })
          }
        })
      } else {
        uni.showToast({ title: '功能开发中', icon: 'none' })
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
  height: calc(100vh - 130rpx - var(--status-bar-height));
  box-sizing: border-box;
  padding: 30rpx 20rpx 100rpx;
}
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
.panel {
  border-radius: 20rpx;
  background: #1E1F34;
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
  cursor: pointer;
}
.panel-item:active {
  opacity: 0.8;
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

/* 个人档案入口 */
.archive-entry {
  margin-top: 30rpx;
  padding: 30rpx 40rpx;
  background: #1E1F34;
  border-radius: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.archive-label {
  font-size: 28rpx;
  color: #FFF;
}
.archive-value {
  font-size: 28rpx;
  color: #FFE3BB;
}
</style>

<template>
  <view class="page">
    <view class="nav-title">{{ panel.title }}</view>
    <scroll-view scroll-y class="content">
      <view class="panel">
        <view class="panel-header">
          <view class="panel-title">{{ panel.title }}</view>
          <view class="panel-sub">当前身份 · 静态演示数据</view>
        </view>
        <view class="panel-grid">
          <view
            v-for="item in panel.items"
            :key="item.label"
            class="panel-item"
          >
            <view class="item-label">{{ item.label }}</view>
            <view class="item-value">{{ item.value }}</view>
          </view>
        </view>
        <view class="panel-footer">
          <text>个人档案：</text>
          <text class="panel-name">沈以诚</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      type: 'business_travel',
      panels: {
        business_travel: {
          title: '商旅会员',
          items: [
            { label: '我的能量分', value: '4200万' },
            { label: '我的消费积分', value: '4200万' },
            { label: '待付款', value: '4200万' },
            { label: '待出行', value: '4200万' },
            { label: '待点评', value: '4200万' },
            { label: '已完成', value: '4200万' },
            { label: '投诉反馈', value: '4200万' },
            { label: '平台信息', value: '4200万' }
          ]
        },
        business: {
          title: '商务会员',
          items: [
            { label: '收盘管理', value: '2500' },
            { label: '合同管理', value: '20' },
            { label: '待点评客人', value: '30' },
            { label: '商旅客户', value: '573' },
            { label: '渠道客户', value: '管理' },
            { label: '平台信息', value: '5.0分' },
            { label: '待审核运单', value: '5' }
          ]
        },
        channel: {
          title: '渠道会员',
          items: [
            { label: '小程序访客', value: '750人次' },
            { label: '预定订单量', value: '20' },
            { label: '在店间夜', value: '30' },
            { label: '预定销售额', value: '4200元' },
            { label: '安排预定房价', value: '管理' },
            { label: '门店评分', value: '5.0分' },
            { label: '待审核订单', value: '5' },
            { label: '待点评客人', value: '2' },
            { label: '平台信息', value: '2' }
          ]
        },
        enterprise: {
          title: '企业会员',
          items: [
            { label: '公司建档', value: '已完善' },
            { label: '部门建档', value: '已完善' },
            { label: '职员建档', value: '已完善' },
            { label: '差旅制度', value: '已上传' },
            { label: '数据报表', value: '可查看' },
            { label: '申请审批制度', value: '已开启' },
            { label: '报销制度', value: '已设置' },
            { label: '信息通知', value: '开启中' },
            { label: '发票管理', value: '正常' }
          ]
        }
      }
    }
  },
  computed: {
    panel() {
      return this.panels[this.type] || this.panels.business_travel
    }
  },
  onLoad(options) {
    if (options.type) {
      this.type = options.type
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a2548 0%, #050814 100%);
  display: flex;
  flex-direction: column;
}
.nav-title {
  padding: 32rpx;
  padding-top: 80rpx;
  font-size: 32rpx;
  color: #ffffff;
}
.content {
  flex: 1;
  padding: 0 24rpx 24rpx;
}
.panel {
  border-radius: 16rpx;
  background: linear-gradient(180deg, #182b57 0%, #0f1730 100%);
  color: #fff;
  padding: 24rpx;
}
.panel-header {
  margin-bottom: 20rpx;
}
.panel-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 6rpx;
}
.panel-sub {
  font-size: 22rpx;
  color: rgba(255,255,255,0.7);
}
.panel-grid {
  display: flex;
  flex-wrap: wrap;
  border-radius: 12rpx;
  background: rgba(0,0,0,0.12);
  padding: 10rpx 0;
  margin-top: 10rpx;
}
.panel-item {
  width: 33.33%;
  padding: 16rpx 10rpx;
  text-align: center;
}
.item-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.7);
  margin-bottom: 6rpx;
}
.item-value {
  font-size: 26rpx;
  font-weight: 600;
}
.panel-footer {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
}
.panel-name {
  margin-left: 8rpx;
}
</style>



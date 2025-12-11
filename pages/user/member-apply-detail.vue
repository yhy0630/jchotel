<template>
  <view class="detail-page">
    <view class="card" v-if="info">
      <view class="card-header">
        <view>
          <view class="title">{{ info.type_text }}</view>
          <view class="status" :class="'status-' + info.status">{{ info.status_text }}</view>
        </view>
        <view class="amount" v-if="info.order_amount > 0">
          ￥{{ info.order_amount }}
        </view>
      </view>
      <view class="row">
        <text class="label">提交时间</text>
        <text class="value">{{ info.create_time_text }}</text>
      </view>
      <view class="row">
        <text class="label">支付状态</text>
        <text class="value">{{ info.pay_status_text }}</text>
      </view>
      <view class="row" v-if="info.remark">
        <text class="label">审核备注</text>
        <text class="value danger">{{ info.remark }}</text>
      </view>
    </view>

    <view class="card" v-if="info">
      <view class="card-title">表单内容</view>
      <view
        class="form-row"
        v-for="item in info.form_list"
        :key="item.label"
      >
        <text class="label">{{ item.label }}</text>
        <text class="value">{{ item.value || '-' }}</text>
      </view>
    </view>

    <view class="empty" v-if="!loading && !info">
      暂无详情
    </view>

    <view
      class="footer"
      v-if="info && info.status == 1"
    >
      <view
        v-if="info.pay_status == 0 && info.order_id"
        class="pay-btn"
        @tap="goPay"
      >
        去支付 ￥{{ info.order_amount }}
      </view>
      <view
        v-else
        class="pay-btn disabled"
      >
        已完成支付
      </view>
    </view>
  </view>
</template>

<script>
import { mapGetters } from 'vuex'
import { getMemberApplyDetail } from '@/api/user'
import { toLogin } from '@/utils/login'

export default {
  data() {
    return {
      id: '',
      info: null,
      loading: false
    }
  },
  computed: {
    ...mapGetters(['isLogin'])
  },
  onLoad(options) {
    this.id = options?.id || ''
    if (!this.id) {
      uni.showToast({ title: '参数错误', icon: 'none' })
    }
  },
  onShow() {
    this.fetchDetail()
  },
  methods: {
    async fetchDetail() {
      if (!this.id) return
      if (!this.isLogin) {
        toLogin()
        return
      }
      this.loading = true
      try {
        const res = await getMemberApplyDetail({ id: this.id })
        if (res.code === 1) {
          this.info = res.data.info
        } else {
          uni.showToast({ title: res.msg || '获取失败', icon: 'none' })
        }
      } catch (e) {
        const msg = e?.msg || e?.data?.msg || '获取失败'
        uni.showToast({ title: msg, icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    goPay() {
      if (!this.info || !this.info.order_id) {
        uni.showToast({ title: '未生成支付订单', icon: 'none' })
        return
      }
      uni.navigateTo({
        url: `/pages/payment/payment?from=member&order_id=${this.info.order_id}`
      })
    }
  }
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 20rpx 24rpx 140rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 12rpx 24rpx rgba(15, 28, 71, 0.08);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}
.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
}
.status {
  display: inline-block;
  margin-top: 8rpx;
  padding: 4rpx 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  background: #e5e5e5;
  color: #555;
}
.status-0 {
  background: rgba(255, 193, 7, 0.15);
  color: #c38000;
}
.status-1 {
  background: rgba(46, 204, 113, 0.15);
  color: #1e8e58;
}
.status-2 {
  background: rgba(231, 76, 60, 0.15);
  color: #c0392b;
}
.amount {
  font-size: 34rpx;
  color: #ff7f0a;
  font-weight: 600;
}
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
  font-size: 26rpx;
}
.label {
  color: #666;
}
.value {
  color: #111;
  max-width: 420rpx;
  text-align: right;
}
.value.danger {
  color: #c0392b;
}
.card-title {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}
.form-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 1px dashed #eee;
}
.form-row:last-child {
  border-bottom: 0;
}
.form-row .label {
  width: 180rpx;
  color: #555;
}
.form-row .value {
  flex: 1;
  text-align: right;
  color: #111;
  margin-left: 20rpx;
}
.empty {
  margin-top: 120rpx;
  text-align: center;
  color: #999;
}
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -8rpx 16rpx rgba(0, 0, 0, 0.08);
}
.pay-btn {
  height: 90rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ffb84d 0%, #ff8a34 100%);
  color: #fff;
  text-align: center;
  line-height: 90rpx;
  font-size: 30rpx;
  font-weight: 600;
}
.pay-btn.disabled {
  background: #bbb;
}
</style>












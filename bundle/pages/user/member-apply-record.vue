<template>
  <view class="record-page">
    <view class="tips">
      提交申请后可在此查看审核进度，审核通过后再进行支付。
    </view>
    <view class="record-list">
      <view v-if="!loading && !records.length" class="empty">
        <image src="/static/images/empty.png" mode="widthFix"></image>
        <text>暂无入驻记录</text>
      </view>
      <view
        class="record-card"
        v-for="item in records"
        :key="item.id"
      >
        <view class="card-header">
          <view class="title">{{ item.type_text }}</view>
          <view class="status" :class="'status-' + item.status">
            {{ item.status_text }}
          </view>
        </view>
        <view class="card-body">
          <view class="row">
            <text class="label">提交时间</text>
            <text class="value">{{ item.create_time_text }}</text>
          </view>
          <view class="row" v-if="item.form_preview">
            <text class="label">关键信息</text>
            <text class="value">{{ item.form_preview }}</text>
          </view>
          <view class="row">
            <text class="label">支付状态</text>
            <text class="value">{{ item.pay_status_text }}</text>
          </view>
          <view class="row">
            <text class="label">会员等级</text>
            <text class="value selectable" @tap="chooseGrade(item)">
              {{ item._selected_grade_name || '请选择会员等级' }}
            </text>
          </view>
          <view class="row" v-if="currentFee(item) > 0">
            <text class="label">费用</text>
            <text class="value amount">￥{{ currentFee(item) }}</text>
          </view>
          <view class="row" v-if="item.remark">
            <text class="label">审核备注</text>
            <text class="value danger">{{ item.remark }}</text>
          </view>
        </view>
        <view class="card-actions">
          <view class="btn ghost" @tap="viewDetail(item.id)">查看详情</view>
          <view
            class="btn primary"
            v-if="item.status == 1 && item.pay_status == 0"
            @tap="goPay(item)"
          >
            去支付
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapGetters } from 'vuex'
import { getMemberApplyRecords, createMemberOrder } from '@/api/user'
import { toLogin } from '@/utils/login'

export default {
  data() {
    return {
      loading: false,
      records: [],
      paymentHandler: null,
      gradeOptionsByType: {}
    }
  },
  computed: {
    ...mapGetters(['isLogin'])
  },
  onLoad() {
    this.paymentHandler = ({ from }) => {
      if (from === 'member') {
        this.fetchRecords()
      }
    }
    uni.$on('payment', this.paymentHandler)
  },
  onUnload() {
    if (this.paymentHandler) {
      uni.$off('payment', this.paymentHandler)
    }
  },
  onShow() {
    this.fetchRecords()
  },
  methods: {
    async fetchRecords() {
      if (!this.isLogin) {
        toLogin()
        return
      }
      this.loading = true
      try {
        const res = await getMemberApplyRecords()
        if (res.code === 1) {
          const list = res.data.list || []
          list.forEach(item => {
            item._selected_grade_id = 0
            item._selected_grade_name = ''
          })
          this.records = list
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
    viewDetail(id) {
      uni.navigateTo({
        url: `/bundle/pages/user/member-apply-detail?id=${id}`
      })
    },
    chooseGrade(item) {
      const list = item.grade_options || []
      if (!list.length) {
        uni.showToast({ title: '暂无可选等级，请联系管理员配置', icon: 'none' })
        return
      }
      const menus = list.map(g => `${g.name}（年费￥${g.annual_fee}）`)
      uni.showActionSheet({
        itemList: menus,
        success: ({ tapIndex }) => {
          const grade = list[tapIndex]
          this.$set(item, '_selected_grade_id', grade.id)
          this.$set(item, '_selected_grade_name', grade.name)
        }
      })
    },
    currentFee(item) {
      if (item._selected_grade_id) {
        const g = (item.grade_options || []).find(v => v.id === item._selected_grade_id)
        if (g) return g.annual_fee
      }
      return item.order_amount || 0
    },
    async goPay(item) {
      if (!this.isLogin) {
        toLogin()
        return
      }
      if (item.status != 1) {
        uni.showToast({ title: '待后台审核通过后才能支付', icon: 'none' })
        return
      }
      if (!item._selected_grade_id) {
        this.chooseGrade(item)
        return
      }
      try {
        const res = await createMemberOrder({
          apply_id: item.id,
          grade_id: item._selected_grade_id
        })
        if ((res.code === 1 || res.code === 10000) && res.data && res.data.order_id) {
          item.order_id = res.data.order_id
          item.order_amount = res.data.amount
          uni.navigateTo({
            url: `/pages/payment/payment?from=member&order_id=${res.data.order_id}`
          })
        } else {
          uni.showToast({ title: res.msg || '创建订单失败', icon: 'none' })
        }
      } catch (e) {
        const msg = e?.msg || e?.data?.msg || '创建订单失败'
        uni.showToast({ title: msg, icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.record-page {
  min-height: 100vh;
  background: #f6f7fb;
  display: flex;
  flex-direction: column;
}
.tips {
  padding: 24rpx 30rpx;
  font-size: 24rpx;
  color: #666;
}
.record-list {
  flex: 1;
  padding: 0 24rpx 40rpx;
}
.empty {
  margin-top: 120rpx;
  text-align: center;
  color: #999;
}
.empty image {
  width: 240rpx;
  margin-bottom: 20rpx;
}
.record-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 10rpx 20rpx rgba(15, 28, 71, 0.08);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111;
}
.status {
  font-size: 24rpx;
  padding: 4rpx 18rpx;
  border-radius: 999rpx;
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
.card-body {
  border-top: 1px dashed #eee;
  padding-top: 16rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
  font-size: 26rpx;
}
.label {
  color: #666;
}
.value {
  color: #111;
  text-align: right;
  max-width: 420rpx;
}
.value.amount {
  color: #e66a16;
  font-weight: 600;
}
.value.danger {
  color: #c0392b;
}
.card-actions {
  margin-top: 12rpx;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}
.btn {
  min-width: 160rpx;
  text-align: center;
  border-radius: 999rpx;
  padding: 14rpx 0;
  font-size: 26rpx;
}
.btn.ghost {
  color: #111;
  border: 1rpx solid #ccc;
}
.btn.primary {
  color: #fff;
  background: linear-gradient(90deg, #ffb84d 0%, #ff8a34 100%);
}
</style>



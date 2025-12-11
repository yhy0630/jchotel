<template>
  <view class="page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="navbar-left" @click="goBack">
        <text class="icon-back">‹</text>
      </view>
      <view class="navbar-title">申请开票</view>
      <view class="navbar-right"></view>
    </view>

    <scroll-view scroll-y class="content">
      <!-- 订单信息 -->
      <view class="info-card">
        <view class="card-title">订单信息</view>
        <view class="info-item">
          <text class="label">订单编号：</text>
          <text class="value">{{ orderInfo.order_sn || '' }}</text>
        </view>
        <view class="info-item">
          <text class="label">订单金额：</text>
          <text class="value price">¥{{ orderInfo.amount_paid || orderInfo.amount_payable || 0 }}</text>
        </view>
        <view class="info-item">
          <text class="label">酒店名称：</text>
          <text class="value">{{ orderInfo.hotel_name || '' }}</text>
        </view>
      </view>

      <!-- 开票信息 -->
      <view class="form-card">
        <view class="card-title">开票信息</view>
        
        <view class="form-item">
          <text class="form-label">发票类型 <text class="required">*</text></text>
          <picker mode="selector" :range="invoiceTypes" :value="invoiceTypeIndex" @change="onInvoiceTypeChange">
            <view class="picker-view">
              <text :class="['picker-text', { placeholder: !formData.invoice_type }]">
                {{ formData.invoice_type ? invoiceTypes[invoiceTypeIndex] : '请选择发票类型' }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">发票抬头 <text class="required">*</text></text>
          <input
            class="form-input"
            v-model="formData.invoice_title"
            placeholder="请输入发票抬头"
            placeholder-style="color: #999"
          />
        </view>

        <view class="form-item">
          <text class="form-label">纳税人识别号</text>
          <input
            class="form-input"
            v-model="formData.tax_number"
            placeholder="请输入纳税人识别号（选填）"
            placeholder-style="color: #999"
          />
        </view>

        <view class="form-item">
          <text class="form-label">收票邮箱 <text class="required">*</text></text>
          <input
            class="form-input"
            v-model="formData.email"
            type="text"
            placeholder="请输入收票邮箱"
            placeholder-style="color: #999"
          />
        </view>

        <view class="form-item">
          <text class="form-label">备注</text>
          <textarea
            class="form-textarea"
            v-model="formData.remark"
            placeholder="请输入备注信息（选填）"
            placeholder-style="color: #999"
            maxlength="200"
          />
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-bar">
        <button class="submit-btn" :disabled="submitting" @click="submitInvoice">
          {{ submitting ? '提交中...' : '提交申请' }}
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { orderDetail } from '@/api/hotel.js'

export default {
  data() {
    return {
      orderId: 0,
      orderSn: '',
      orderInfo: {},
      invoiceTypes: ['增值税普通发票', '增值税专用发票'],
      invoiceTypeIndex: 0,
      formData: {
        invoice_type: '增值税普通发票',
        invoice_title: '',
        tax_number: '',
        email: '',
        remark: ''
      },
      submitting: false
    }
  },
  onLoad(options) {
    this.orderId = options.order_id || 0
    this.orderSn = options.order_sn || ''
    this.loadOrderInfo()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    async loadOrderInfo() {
      try {
        const res = await orderDetail({
          order_id: this.orderId,
          order_sn: this.orderSn
        })
        if (res.code === 1) {
          this.orderInfo = res.data || {}
        } else {
          uni.showToast({ title: res.msg || '加载失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      }
    },
    onInvoiceTypeChange(e) {
      this.invoiceTypeIndex = e.detail.value
      this.formData.invoice_type = this.invoiceTypes[e.detail.value]
    },
    validateForm() {
      if (!this.formData.invoice_type) {
        uni.showToast({ title: '请选择发票类型', icon: 'none' })
        return false
      }
      if (!this.formData.invoice_title || !this.formData.invoice_title.trim()) {
        uni.showToast({ title: '请输入发票抬头', icon: 'none' })
        return false
      }
      if (!this.formData.email || !this.formData.email.trim()) {
        uni.showToast({ title: '请输入收票邮箱', icon: 'none' })
        return false
      }
      // 简单的邮箱验证
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailReg.test(this.formData.email)) {
        uni.showToast({ title: '请输入正确的邮箱地址', icon: 'none' })
        return false
      }
      return true
    },
    async submitInvoice() {
      if (!this.validateForm()) {
        return
      }
      if (this.submitting) return
      this.submitting = true

      try {
        // 这里调用申请开票的API
        // 暂时使用模拟API，实际需要根据后端接口调整
        uni.showLoading({ title: '提交中...' })
        
        // 模拟API调用
        setTimeout(() => {
          uni.hideLoading()
          uni.showToast({
            title: '申请提交成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 2000)
        }, 1000)

        // 实际API调用示例（需要根据后端接口调整）：
        // const res = await request.post('hotel/applyInvoice', {
        //   order_id: this.orderId,
        //   ...this.formData
        // })
        // if (res.code === 1) {
        //   uni.showToast({ title: '申请提交成功', icon: 'success' })
        //   setTimeout(() => {
        //     uni.navigateBack()
        //   }, 1500)
        // } else {
        //   uni.showToast({ title: res.msg || '提交失败', icon: 'none' })
        // }
      } catch (e) {
        uni.showToast({ title: e.msg || '提交失败', icon: 'none' })
      } finally {
        this.submitting = false
      }
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
  width: 60rpx;
}

.content {
  height: calc(100vh - 88rpx);
  padding: 20rpx;
}

.info-card, .form-card {
  background: #16213e;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #ff9500;
  margin-bottom: 30rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}

.info-item .label {
  color: #999;
}

.info-item .value {
  color: #ffffff;
}

.info-item .value.price {
  color: #ff9500;
  font-weight: bold;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.required {
  color: #ff4757;
}

.picker-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx solid rgba(255, 255, 255, 0.1);
}

.picker-text {
  font-size: 28rpx;
  color: #ffffff;
}

.picker-text.placeholder {
  color: #999;
}

.picker-arrow {
  font-size: 32rpx;
  color: #999;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #ffffff;
  border-bottom: 2rpx solid rgba(255, 255, 255, 0.1);
  background: transparent;
}

.form-textarea {
  min-height: 120rpx;
  line-height: 1.6;
}

.submit-bar {
  padding: 40rpx 0;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(270deg, #FFA500 0%, #FF8C00 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 44rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn[disabled] {
  opacity: 0.6;
}
</style>


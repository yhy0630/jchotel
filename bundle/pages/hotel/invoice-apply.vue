<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <custom-navbar title="开票信息" :show-back="true"></custom-navbar>

    <scroll-view scroll-y class="content">
      <!-- 订单信息卡片 -->
      <view class="order-info-card">
        <view class="order-header">
          <text class="order-title">开票信息-自缴费之日起，12个月之内可申请开票，超期无法申请开票</text>
        </view>
        <view class="order-details">
          <view class="order-row">
            <text class="order-label">订单编号：</text>
            <text class="order-value">{{ orderInfo.order_sn || '' }}</text>
          </view>
          <view class="order-row">
            <text class="order-label">发票金额：</text>
            <text class="order-value price">{{ orderInfo.amount_paid || orderInfo.amount_payable || 0.01 }}</text>
          </view>
        </view>
      </view>

      <!-- 发票类型选择 -->
      <view class="invoice-type-section">
        <text class="section-title">* 发票类型</text>
        <view class="checkbox-group">
          <view 
            v-for="(type, index) in invoiceTypeOptions" 
            :key="index"
            class="checkbox-item" 
            @click="selectInvoiceType(index)"
          >
            <view :class="['checkbox', { checked: formData.invoice_type_index === index }]">
              <image v-if="formData.invoice_type_index === index" class="check-icon" src="/static/images/gou_1.png" mode="aspectFit"></image>
            </view>
            <text :class="['checkbox-label', { checked: formData.invoice_type_index === index }]">{{ type.label }}</text>
          </view>
        </view>
      </view>

      <!-- 个人/企业选择 -->
      <view class="entity-type-section">
        <text class="section-title">* 性质</text>
        <view class="radio-group">
          <view 
            v-for="(entity, index) in entityTypes" 
            :key="index"
            class="radio-item" 
            @click="selectEntityType(index)"
          >
            <view :class="['radio', { checked: formData.entity_type_index === index }]">
              <image v-if="formData.entity_type_index === index" class="check-icon" src="/static/images/gou_1.png" mode="aspectFit"></image>
            </view>
            <text :class="['radio-label', { checked: formData.entity_type_index === index }]">{{ entity.label }}</text>
          </view>
        </view>
      </view>

      <!-- 发票抬头输入 -->
      <view class="input-section">
        <text class="section-title">* 发票抬头</text>
        <view class="input-wrapper">
          <input
            class="custom-input"
            v-model="formData.invoice_title"
            :placeholder="getInvoiceTitlePlaceholder()"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 电子邮箱输入 -->
      <view class="input-section">
        <text class="section-title">* 电子邮箱</text>
        <view class="input-wrapper">
          <input
            class="custom-input"
            v-model="formData.email"
            placeholder="请输入您的电子邮箱"
            placeholder-class="input-placeholder"
            type="text"
          />
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="bottom-actions">
        <button class="cancel-btn" @click="goBack">取消</button>
        <button class="submit-btn" :disabled="submitting" @click="submitInvoice">
          {{ submitting ? '提交中...' : '提交' }}
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
      invoiceTypeOptions: [
        { label: '增值税普通发票（电子版）', value: 'normal' },
        { label: '增值税专用发票（纸质版）', value: 'special' },
        { label: '增值税专用发票（纸质版）', value: 'special_paper' }
      ],
      entityTypes: [
        { label: '个人', value: 'personal' },
        { label: '企业', value: 'enterprise' }
      ],
      formData: {
        invoice_type_index: 0,
        entity_type_index: 0,
        invoice_title: '',
        email: ''
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
    selectInvoiceType(index) {
      this.formData.invoice_type_index = index
    },
    selectEntityType(index) {
      this.formData.entity_type_index = index
    },
    getInvoiceTitlePlaceholder() {
      const entityType = this.entityTypes[this.formData.entity_type_index]
      return entityType && entityType.value === 'personal' ? '请输入个人姓名' : '请输入公司名称'
    },
    validateForm() {
      if (!this.formData.invoice_title || !this.formData.invoice_title.trim()) {
        uni.showToast({ title: '请输入发票抬头', icon: 'none' })
        return false
      }
      if (!this.formData.email || !this.formData.email.trim()) {
        uni.showToast({ title: '请输入电子邮箱', icon: 'none' })
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
        uni.showLoading({ title: '提交中...' })
        
        // 构建提交数据
        const invoiceType = this.invoiceTypeOptions[this.formData.invoice_type_index]
        const entityType = this.entityTypes[this.formData.entity_type_index]
        
        const submitData = {
          order_id: this.orderId,
          order_sn: this.orderSn,
          invoice_type: invoiceType.value,
          invoice_type_name: invoiceType.label,
          entity_type: entityType.value,
          entity_type_name: entityType.label,
          invoice_title: this.formData.invoice_title.trim(),
          email: this.formData.email.trim()
        }

        console.log('提交开票申请数据:', submitData)
        
        // TODO: 调用实际的开票申请API
        // 这里需要根据后端提供的接口进行调整
        // const res = await applyInvoice(submitData)
        
        // 临时模拟成功响应
        setTimeout(() => {
          uni.hideLoading()
          uni.showToast({
            title: '开票申请提交成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 2000)
        }, 1000)

        // 实际API调用逻辑（待后端接口确定后启用）：
        // if (res.code === 1) {
        //   uni.hideLoading()
        //   uni.showToast({ 
        //     title: '开票申请提交成功', 
        //     icon: 'success',
        //     duration: 2000
        //   })
        //   setTimeout(() => {
        //     uni.navigateBack()
        //   }, 2000)
        // } else {
        //   uni.hideLoading()
        //   uni.showToast({ 
        //     title: res.msg || '提交失败，请重试', 
        //     icon: 'none' 
        //   })
        // }
      } catch (e) {
        uni.hideLoading()
        console.error('提交开票申请失败:', e)
        uni.showToast({ 
          title: e.msg || e.message || '提交失败，请重试', 
          icon: 'none' 
        })
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
  background: #0D1034;
  padding-top: calc(130rpx + var(--status-bar-height));
}

.content {
  height: calc(100vh - 88rpx);
  padding: 30rpx 20rpx;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* 订单信息卡片 */
.order-info-card {
  padding: 20rpx;
  margin-bottom: 40rpx;
  border-bottom: 1rpx solid #EEE;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.order-title {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.order-date {
  font-size: 24rpx;
  color: #999999;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-row {
  display: flex;
  align-items: center;
}

.order-label {
  font-size: 28rpx;
  color: #fff;
}

.order-value {
  font-size: 28rpx;
  color: #FFFFFF;
}

.order-value.price {
  color: #F2BD63;
  font-weight: 600;
}

/* 选择区域通用样式 */
.invoice-type-section,
.entity-type-section,
.input-section {
  margin-bottom: 40rpx;
  box-sizing: border-box;

}

.section-title {
  font-size: 28rpx;
  color: #FFFFFF;
  margin-bottom: 24rpx;
  display: block;
}

/* 复选框组 */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.checkbox-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #E4E3E3;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.checkbox.checked {
  background: transparent;
  border: transparent;
}

.check-icon {
  width:36rpx;
  height: 36rpx;
}

.checkbox-label {
  font-size: 28rpx;
  color: #FFFFFF;
  flex: 1;
}

.checkbox-label.checked {
  color: #FFE3BB;
}

/* 单选框组 */
.radio-group {
  display: flex;
  gap: 60rpx;
}

.radio-item {
  display: flex;
  align-items: center;
}

.radio {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #E4E3E3;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.radio.checked {
    border:transparent

}

.radio-dot {
  width: 20rpx;
  height: 20rpx;
  background: #FFA500;
  border-radius: 50%;
}

.radio-label {
  font-size: 28rpx;
  color: #FFFFFF;
}

.radio-label.checked {
  color: #FFE3BB;
}

/* 输入框样式 */
.input-wrapper {
  background: #353548;
  border-radius: 45rpx;
  padding: 0 10rpx 0 20rpx;
  box-sizing: border-box;
  border: 1rpx solid #F0F0F0;
}

.custom-input {
  width: 100%;
  height: 88rpx;
  font-size: 28rpx;
  color: #FFFFFF;
  background: transparent;
  border: none;
  box-sizing: border-box;

}

.input-placeholder {
  color: #E4E3E3;
}

/* 底部按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #0D1034;
  padding: 20rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  gap: 20rpx;
}

.cancel-btn {
  flex: 1;
  height: 88rpx;
  background: transparent;
  border: 2rpx solid #FADBA1;
  border-radius: 44rpx;
  color: #FADBA1;
  font-size: 32rpx;
  font-weight: 500;
}

.submit-btn {
  flex: 1;
  height: 88rpx;
  background: linear-gradient(90deg, #F4C06B 0%, #FDE0AB 49.59%, #F3BF6C 100%);
  color: #380C00;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 44rpx;
  border: none;
}

.submit-btn[disabled] {
  opacity: 0.6;
}
</style>


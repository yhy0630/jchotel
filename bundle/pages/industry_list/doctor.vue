<template>
  <view class="page">
    <view class="toggle-bar">
      <view
        class="toggle-btn"
        :class="{ active: serviceType === 'self' }"
        @click="serviceType = 'self'"
      >
        自助服务
      </view>
      <view
        class="toggle-btn"
        :class="{ active: serviceType === 'manual' }"
        @click="serviceType = 'manual'"
      >
        人工服务
      </view>
    </view>

    <FormModal
      :fields="formFields"
      textareaLabel="请输入需求详情"
      textareaKey="description"
      textareaPlaceholder="请输入需求详情"
      :textareaRequired="true"
      :maxLength="1000"
      buttonText="提交"
      @submit="handleFormSubmit"
    />
  </view>
</template>

<script>
import FormModal from '@/components/FormModal.vue'

export default {
  components: {
    FormModal
  },
  data() {
    return {
      serviceType: 'manual',
      formFields: [
        {
          label: '姓名',
          key: 'name',
          type: 'text',
          placeholder: '请输入',
          required: true
        },
        {
          label: '电话',
          key: 'phone',
          type: 'tel',
          placeholder: '请输入',
          required: true
        }
      ]
    }
  },
  methods: {
    handleFormSubmit(formData) {
      console.log('表单提交数据:', formData)
      // 这里可以添加提交逻辑，如调用API
      uni.showToast({
        title: '提交成功',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1038;
}

.toggle-bar {
  display: flex;
  justify-content: center;
  padding: 24rpx 32rpx 12rpx;
  gap: 8rpx;
}

.toggle-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  background: rgba(255, 255, 255, 0.08);
  color: #e5e8ff;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn.active {
  background: linear-gradient(90deg, #F4BD63 0%, #FDE4B4 49.71%, #F3BE66 100%);
  color: #3b1c00;
  font-weight: 600;
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.15);
}

/* 调整提交按钮位置：上移一些 */
::v-deep .form-modal .button-container {
  margin-top: 350rpx;
  padding-bottom: 24rpx;
}
</style>


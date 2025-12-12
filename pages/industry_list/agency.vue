<template>
  <view class="page">
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
  onLoad() {
    
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
</style>

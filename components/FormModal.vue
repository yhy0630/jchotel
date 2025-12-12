<template>
  <view class="form-modal">
    <!-- 表单字段 -->
    <view class="form-fields">
      <view v-for="(field, index) in fields" :key="index" class="form-group">
        <view class="field-label">
          <text v-if="field.required" class="required-star">*</text>
          <text class="label-text">{{ field.label }}</text>
        </view>
        <input
          v-if="field.type === 'text' || field.type === 'tel'"
          :type="field.type"
          :placeholder="field.placeholder"
          :value="formData[field.key]"
          @input="updateField(field.key, $event)"
          class="form-input"
        />
      </view>
    </view>

    <!-- 文本区域 -->
    <view class="textarea-group">
      <view class="textarea-label">
        <text v-if="textareaRequired" class="required-star">*</text>
        <text class="label-text">{{ textareaLabel }}</text>
      </view>
      <textarea
        :placeholder="textareaPlaceholder"
        :value="formData[textareaKey]"
        @input="updateField(textareaKey, $event)"
        class="form-textarea"
        :maxlength="maxLength"
      ></textarea>
      <view class="char-count">
        <text class="count-text">{{ (formData[textareaKey] && formData[textareaKey].length) || 0 }}/{{ maxLength }}</text>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="button-container">
      <view class="submit-button" @click="handleSubmit">
        <text class="button-text">{{ buttonText }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    fields: {
      type: Array,
      default: () => [
        { label: '姓名', key: 'name', type: 'text', placeholder: '请输入', required: true },
        { label: '电话', key: 'phone', type: 'tel', placeholder: '请输入', required: true }
      ]
    },
    textareaLabel: {
      type: String,
      default: '请输入需求详情'
    },
    textareaKey: {
      type: String,
      default: 'description'
    },
    textareaPlaceholder: {
      type: String,
      default: '请输入需求详情'
    },
    textareaRequired: {
      type: Boolean,
      default: true
    },
    maxLength: {
      type: Number,
      default: 1000
    },
    buttonText: {
      type: String,
      default: '提交'
    }
  },
  data() {
    return {
      formData: {}
    }
  },
  created() {
    this.initFormData()
  },
  methods: {
    initFormData() {
      this.fields.forEach(field => {
        this.$set(this.formData, field.key, '')
      })
      this.$set(this.formData, this.textareaKey, '')
    },
    updateField(key, event) {
      this.formData[key] = event.detail.value
    },
    handleSubmit() {
      this.$emit('submit', this.formData)
    },
    getFormData() {
      return this.formData
    },
    resetForm() {
      this.initFormData()
    }
  }
}
</script>

<style scoped>
.form-modal {
  background: #0D1038;
  padding: 30rpx;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 表单字段 */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 40rpx;
  background: #1F2034;
  border-radius: 16rpx;
  overflow: hidden;
}

.form-group {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #2A2B3F;
}

.form-group:last-child {
  border-bottom: none;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
  width: 120rpx;
  flex-shrink: 0;
}

.required-star {
  font-size: 28rpx;
  color: #FC6E6E;
}

.label-text {
  font-size: 28rpx;
  color: #ffffff;
}

.form-input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 28rpx;
  color: #999;
  outline: none;
}

.form-input::placeholder {
  color: #666;
}

/* 文本区域 */
.textarea-group {
  background: #1F2034;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.textarea-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.form-textarea {
  width: 100%;
  min-height: 300rpx;
  background: transparent;
  border: none;
  font-size: 28rpx;
  color: #999;
  outline: none;
  resize: none;
  font-family: inherit;
}

.form-textarea::placeholder {
  color: #666;
}

.char-count {
  display: flex;
  justify-content: flex-end;
  padding-top: 20rpx;
  border-top: 1rpx solid #2A2B3F;
}

.count-text {
  font-size: 24rpx;
  color: #666;
}

/* 按钮 */
.button-container {
  margin-top: auto;
  padding-bottom: 40rpx;
}

.submit-button {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(90deg, #F4BE66 0%, #FDE3B3 49.62%, #F3C06A 100%);
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-text {
  font-size: 36rpx;
  color: #380C00;
  font-weight: 500;
}
</style>

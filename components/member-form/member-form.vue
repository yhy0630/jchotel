<template>
  <view class="page">
    <custom-navbar :title="title"></custom-navbar>
    <scroll-view scroll-y class="form-wrap">
      <!-- 表单字段列表 -->
      <view class="form-item form-item-row" v-for="item in fields" :key="item.key">
        <view class="label">
          <text class="required" v-if="item.required">*</text>
          <text>{{ item.label }}</text>
        </view>
        <view class="control">
          <input
            v-if="item.type === 'input'"
            v-model="form[item.key]"
            :type="item.inputType || 'text'"
            :placeholder="item.placeholder"
            placeholder-class="ph"
          />
          <view
            v-else
            class="select"
            @tap="handleSelect(item)"
          >
            <text :class="['select-text', { 'ph': !form[item.key] }]">{{ form[item.key] || item.placeholder }}</text>
          </view>
        </view>
      </view>
      
      <!-- 身份优惠选择插槽 -->
      <view class="identity-discount-slot" @tap="toggleImageUpload">
        <slot name="identity-discount"></slot>
      </view>
      
      <!-- 身份优惠证明图片上传 -->
      <view class="form-item" v-if="showImageUploadInternal">
        <view class="control">
          <view class="upload-wrap">
            <view class="upload-item" v-for="(img, index) in identityProofImages" :key="index">
              <image :src="img" mode="aspectFill" class="upload-img"></image>
              <view class="delete-btn" @tap="deleteImage(index)">×</view>
            </view>
            <view class="upload-btn" @tap="chooseImages" v-if="identityProofImages.length < 5">
              <text class="upload-icon">+</text>
              <text class="upload-text">上传图片</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    <view class="submit-bar" @tap="handleSubmit">{{ submitText }}</view>
  </view>
</template>

<script>
import { baseURL } from '@/config/app'

export default {
  name: 'MemberForm',
  props: {
    // 页面标题
    title: {
      type: String,
      default: '完善信息'
    },
    // 表单字段配置
    fields: {
      type: Array,
      required: true,
      default: () => []
    },
    // 是否显示图片上传
    showImageUpload: {
      type: Boolean,
      default: false
    },
    // 提交按钮文字
    submitText: {
      type: String,
      default: '提交审核'
    }
  },
  data() {
    return {
      form: {},
      identityProofImages: [],
      showImageUploadInternal: false
    }
  },
  watch: {
    fields: {
      immediate: true,
      handler() {
        this.resetForm()
      }
    }
  },
  methods: {
    resetForm() {
      const nextForm = {}
      this.fields.forEach(field => {
        nextForm[field.key] = field.default || ''
      })
      this.form = nextForm
      this.identityProofImages = []
      this.showImageUploadInternal = false
    },
    chooseImages() {
      const maxCount = 9 - this.identityProofImages.length
      uni.chooseImage({
        count: maxCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          uni.showLoading({ title: '上传中...' })
          try {
            const uploadPromises = res.tempFilePaths.map(path => this.uploadImage(path))
            const uploadResults = await Promise.all(uploadPromises)
            this.identityProofImages = [...this.identityProofImages, ...uploadResults]
            uni.hideLoading()
          } catch (e) {
            uni.hideLoading()
            uni.showToast({ title: '图片上传失败', icon: 'none' })
          }
        }
      })
    },
    async uploadImage(filePath) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: baseURL + '/api/file/formImage',
          filePath: filePath,
          name: 'file',
          header: {
            'token': uni.getStorageSync('token') || ''
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data)
              if (data.code === 1 && data.data && data.data.url) {
                resolve(data.data.url)
              } else {
                reject(new Error(data.msg || '上传失败'))
              }
            } catch (e) {
              reject(e)
            }
          },
          fail: reject
        })
      })
    },
    deleteImage(index) {
      this.identityProofImages.splice(index, 1)
    },
    handleSelect(item) {
      if (!item.options || !item.options.length) {
        uni.showToast({ title: '暂无可选项', icon: 'none' })
        return
      }
      uni.showActionSheet({
        itemList: item.options,
        success: ({ tapIndex }) => {
          this.$set(this.form, item.key, item.options[tapIndex])
        }
      })
    },
    handleSubmit() {
      // 验证必填字段
      for (const item of this.fields) {
        if (item.required && !this.form[item.key]) {
          uni.showToast({ title: `请填写${item.label}`, icon: 'none' })
          return
        }
      }
      // 向父组件传递表单数据
      this.$emit('submit', {
        form: this.form,
        identityProofImages: this.identityProofImages
      })
    },
    // 提供给父组件的方法：获取表单数据
    getFormData() {
      return {
        form: this.form,
        identityProofImages: this.identityProofImages
      }
    },
    // 提供给父组件的方法：设置表单数据
    setFormData(data) {
      if (data.form) {
        this.form = { ...this.form, ...data.form }
      }
      if (data.identityProofImages) {
        this.identityProofImages = data.identityProofImages
      }
    },
    // 提供给父组件的方法：清空图片
    clearImages() {
      this.identityProofImages = []
    },
    // 切换图片上传区域显示/隐藏
    toggleImageUpload() {
      this.showImageUploadInternal = !this.showImageUploadInternal
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
.nav-title {
  padding: 32rpx;
  padding-top: 80rpx;
  font-size: 32rpx;
  color: #ffffff;
}
.form-wrap {
  flex: 1;
  margin: 20rpx 0rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  border-radius: 30rpx;
  background: #1e1F34;

}
.form-item {
  padding: 15rpx 20rpx;
}
.form-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
}
.label {
  font-size: 26rpx;
  color: #ffffff;
  flex-shrink: 0;
  width: 220rpx;
}
.required {
  color: #ff5b5b;
  margin-right: 6rpx;
}
.control {
  flex: 1;
  padding-left: 16rpx;
  padding-right: 16rpx;
  box-sizing: border-box;
}
.control input,
.select {
  height: 72rpx;
  border-radius: 8rpx;
  background: #0c1224;
  padding: 0 20rpx;
  color: #ffffff;
  font-size: 26rpx;
}
.form-item-row .control input,
.form-item-row .select {
  background: transparent;
  padding: 0;
}
.ph {
  color: #666d8f;
}
.select {
  display: flex;
  align-items: center;
}
.form-item-row .select {
  position: relative;
  justify-content: space-between;
  padding-right: 34rpx;
}
.form-item-row .select::after {
  content: '>';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #c8cbd9;
  font-size: 30rpx;
}

.select-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.identity-discount-slot {
  cursor: pointer;
}
.upload-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.upload-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  overflow: hidden;
}
.upload-img {
  width: 100%;
  height: 100%;
}
.delete-btn {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 40rpx;
  height: 40rpx;
  background: #ff5b5b;
  border-radius: 50%;
  color: #fff;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.upload-btn {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  background: #0c1224;
  border: 2rpx dashed #666d8f;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.upload-icon {
  font-size: 48rpx;
  color: #666d8f;
  line-height: 1;
  margin-bottom: 8rpx;
}
.upload-text {
  font-size: 22rpx;
  color: #666d8f;
}
.upload-tip {
  font-size: 22rpx;
  color: #666d8f;
  margin-top: 12rpx;
}
.submit-bar {
  height: 96rpx;
  margin: 0 40rpx 40rpx;
  border-radius: 48rpx;
  background: linear-gradient(90deg, #F4BD66 0%, #FEE2AF 49.58%, #F3BD65 100%);
  text-align: center;
  line-height: 96rpx;
  color: #380C00;
  font-size: 32rpx;
  font-weight: 600;
}
</style>


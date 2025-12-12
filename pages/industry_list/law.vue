<template>
  <view class="page">
    <!-- 反馈内容按钮 -->
    <view class="feedback-btn">
      <text class="feedback-text">反馈内容</text>
    </view>

    <!-- 内容输入区域 -->
    <view class="content-section">
      <textarea 
        class="content-input" 
        v-model="content"
        placeholder="请填写10字以上的内容，以便我们为您提供更好的内容"
        placeholder-class="placeholder"
        maxlength="500"
      />
      
      <!-- 上传图片区域 -->
      <view class="upload-section">
        <view class="upload-item" @click="chooseImage">
          <image class="upload-icon" src="/static/images/上传.png" mode="aspectFit"></image>
          <text class="upload-text">上传图片</text>
        </view>
      </view>
    </view>

    <!-- 联系电话 -->
    <view class="contact-section">
      <text class="contact-label">联系电话</text>
      <input 
        class="contact-input" 
        v-model="phone"
        type="text"
        placeholder="输入手机号/QQ号"
        placeholder-class="placeholder"
      />
    </view>

    <!-- 提交按钮 -->
    <view class="submit-btn" @click="handleSubmit">
      <text class="submit-text">提交</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      content: '',
      phone: '',
      imageList: []
    }
  },
  onLoad() {
    
  },
  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.imageList = res.tempFilePaths
        }
      })
    },
    handleSubmit() {
      if (!this.content || this.content.length < 10) {
        uni.showToast({
          title: '请填写10字以上的内容',
          icon: 'none'
        })
        return
      }
      if (!this.phone) {
        uni.showToast({
          title: '请输入联系方式',
          icon: 'none'
        })
        return
      }
      
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
  padding: 30rpx;
}

.feedback-btn {
  width: 200rpx;
  height: 70rpx;
  background: linear-gradient(90deg, #F5BF69 0%, #FEE2AF 49.51%, #F5BF6B 100%);
  border-radius: 35rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.feedback-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #380C00;
}

.content-section {
  background: #1F2034;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.content-input {
  width: 100%;
  min-height: 500rpx;
  font-size: 28rpx;
  color: #ffffff;
  line-height: 1.6;
}

.placeholder {
  color: #666;
  font-size: 28rpx;
}

.upload-section {
  margin-top: 40rpx;
}

.upload-item {
  width: 160rpx;
  height: 160rpx;
  background: #2A2B3F;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.upload-icon {
  width: 60rpx;
  height: 60rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
}

.contact-section {
  background: #1F2034;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 80rpx;
}

.contact-label {
  font-size: 28rpx;
  color: #ffffff;
  display: block;
  margin-bottom: 20rpx;
}

.contact-input {
  width: 100%;
  height: 80rpx;
  background: transparent;
  font-size: 28rpx;
  color: #ffffff;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(90deg, #F5BF69 0%, #FEE2AF 49.51%, #F5BF6B 100%);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: auto;
}

.submit-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #380C00;
}
</style>

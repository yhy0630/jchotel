<template>
  <view class="custom-modal-mask" v-if="show" @tap="handleMaskClick">
    <view class="custom-modal-content" @tap.stop>
      <view class="modal-close" @tap="handleCancel">×</view>
      <view class="modal-header">
        <text class="modal-title">{{ title }}</text>
      </view>
      <view class="modal-body">
        <text class="modal-text">{{ content }}</text>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel-btn" @tap="handleCancel">
          <text class="btn-text">{{ cancelText }}</text>
        </view>
        <view class="modal-btn confirm-btn" @tap="handleConfirm">
          <text class="btn-text">{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '提示'
    },
    content: {
      type: String,
      default: ''
    },
    confirmText: {
      type: String,
      default: '确认'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    maskClosable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('update:show', false);
      this.$emit('confirm');
    },
    handleCancel() {
      this.$emit('update:show', false);
      this.$emit('cancel');
    },
    handleMaskClick() {
      if (this.maskClosable) {
        this.handleCancel();
      }
    }
  }
}
</script>

<style scoped>
.custom-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.custom-modal-content {
  width: 600rpx;
  background: #0D1036;
  border: 2rpx solid #FCDDA6;
  border-radius: 32rpx;
  padding: 60rpx 40rpx 40rpx;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 20rpx;
  right: 30rpx;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50rpx;
  color: #FCDDA6;
  line-height: 1;
}

.modal-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  background: linear-gradient(90deg, #F4C06E 0%, #FDDFA8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-body {
  text-align: center;
  margin-bottom: 50rpx;
}

.modal-text {
  font-size: 30rpx;
  color: #FFFFFF;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  gap: 30rpx;
}

.modal-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background: transparent;
  border: 2rpx solid #FCDDA6;
}

.cancel-btn .btn-text {
  font-size: 32rpx;
  color: #FCDDA6;
  font-weight: 600;
}

.confirm-btn {
  background: linear-gradient(90deg, #F4C06E 0%, #FDDFA8 100%);
}

.confirm-btn .btn-text {
  font-size: 32rpx;
  color: #380C00;
  font-weight: 600;
}
</style>

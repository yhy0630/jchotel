<template>
  <member-form
    ref="memberForm"
    title="完善信息（渠道会员）"
    :fields="fields"
    :show-image-upload="form.identity_discount_id > 0"
    @submit="handleSubmit"
  >
    <!-- 营业执照上传插槽 -->
    <template #identity-discount>
      <view class="form-item">
        <view class="label">
          <text>营业执照</text>
        </view>
        <view class="control">
          <view class="license-tip">上传营业执照，最多5张</view>
          <!-- <view class="upload-wrap">
            <view class="upload-item" v-for="(img, index) in businessLicenseImages" :key="index">
              <image :src="img" mode="aspectFill" class="upload-img"></image>
              <view class="delete-btn" @tap="deleteLicenseImage(index)">×</view>
              <view class="replace-btn" @tap="replaceLicenseImage(index)">替换</view>
            </view>
            <view class="upload-btn" @tap="chooseLicenseImages" v-if="businessLicenseImages.length < 5">
              <text class="upload-icon">+</text>
            </view>
          </view> -->
        </view>
      </view>
    </template>
  </member-form>
</template> 

<script>
import { applyMember, getIdentityDiscountList } from '@/api/user'
import MemberForm from '@/components/member-form/member-form.vue'
import { baseURL } from '@/config/app'

export default {
  components: {
    MemberForm
  },
  data() {
    return {
      memberType: 'channel',
      submitting: false,
      form: {
        identity_discount_id: 0
      },
      identityDiscountList: [],
      selectedIdentityDiscount: '',
      businessLicenseImages: [],
      fields: [
        { key: 'level', label: '会员级别', required: true, type: 'input', placeholder: '请输入' },
        { key: 'account', label: '会员账号', required: true, type: 'input', placeholder: '请输入' },
        { key: 'hotel_name', label: '酒店名称', required: true, type: 'input', placeholder: '请输入' },
        { key: 'hotel_address', label: '酒店地址', required: true, type: 'input', placeholder: '请输入' },
        { key: 'manager_name', label: '负责人姓名', required: true, type: 'input', placeholder: '请输入' },
        { key: 'hotel_phone', label: '酒店电话', required: true, type: 'input', inputType: 'number', placeholder: '请输入' },
        { key: 'store_manager_name', label: '店长姓名', required: true, type: 'input', placeholder: '请输入' },
        { key: 'store_manager_phone', label: '店长电话', required: true, type: 'input', inputType: 'number', placeholder: '请输入' }
      ]
    }
  },
  created() {
    this.loadIdentityDiscountList()
  },
  methods: {
    async loadIdentityDiscountList() {
      try {
        const res = await getIdentityDiscountList()
        if (res.code === 1 && res.data && res.data.list) {
          this.identityDiscountList = res.data.list
        }
      } catch (e) {
        console.error('加载身份优惠列表失败:', e)
      }
    },
    selectIdentityDiscount() {
      if (!this.identityDiscountList || this.identityDiscountList.length === 0) {
        uni.showToast({ title: '暂无可选身份优惠', icon: 'none' })
        return
      }
      const itemList = this.identityDiscountList.map(item => `${item.name}（优惠${item.discount_rate}%）`)
      itemList.unshift('不选择')
      uni.showActionSheet({
        itemList: itemList,
        success: ({ tapIndex }) => {
          if (tapIndex === 0) {
            this.form.identity_discount_id = 0
            this.selectedIdentityDiscount = ''
            // 清空组件中的图片
            if (this.$refs.memberForm) {
              this.$refs.memberForm.clearImages()
            }
          } else {
            const selected = this.identityDiscountList[tapIndex - 1]
            this.form.identity_discount_id = selected.id
            this.selectedIdentityDiscount = `${selected.name}（优惠${selected.discount_rate}%）`
          }
        }
      })
    },
    chooseLicenseImages() {
      const maxCount = 5 - this.businessLicenseImages.length
      uni.chooseImage({
        count: maxCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          uni.showLoading({ title: '上传中...' })
          try {
            const uploadPromises = res.tempFilePaths.map(path => this.uploadLicenseImage(path))
            const uploadResults = await Promise.all(uploadPromises)
            this.businessLicenseImages = [...this.businessLicenseImages, ...uploadResults]
            uni.hideLoading()
          } catch (e) {
            uni.hideLoading()
            uni.showToast({ title: '图片上传失败', icon: 'none' })
          }
        }
      })
    },
    async uploadLicenseImage(filePath) {
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
    deleteLicenseImage(index) {
      this.businessLicenseImages.splice(index, 1)
    },
    replaceLicenseImage(index) {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          uni.showLoading({ title: '上传中...' })
          try {
            const uploadResult = await this.uploadLicenseImage(res.tempFilePaths[0])
            this.businessLicenseImages.splice(index, 1, uploadResult)
            uni.hideLoading()
          } catch (e) {
            uni.hideLoading()
            uni.showToast({ title: '图片上传失败', icon: 'none' })
          }
        }
      })
    },
    async handleSubmit(data) {
      if (this.submitting) return
      this.submitting = true
      try {
        const submitData = {
          type: this.memberType,
          form: { ...data.form, identity_discount_id: this.form.identity_discount_id },
          identity_discount_id: this.form.identity_discount_id || 0,
          identity_proof_images: data.identityProofImages.length > 0 ? JSON.stringify(data.identityProofImages) : '',
          business_license_images: this.businessLicenseImages.length > 0 ? JSON.stringify(this.businessLicenseImages) : ''
        }
        const res = await applyMember(submitData)
        if (res.code === 1) {
          uni.showToast({ title: '提交成功，等待审核', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({ title: res.msg || '提交失败', icon: 'none' })
          this.submitting = false
        }
      } catch (e) {
        const msg = e?.msg || e?.data?.msg || e?.message || '提交失败'
        uni.showToast({ title: msg, icon: 'none' })
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
/* 身份优惠选择样式 */
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
.control {
  flex: 1;
  padding-left: 16rpx;
  padding-right: 16rpx;
  box-sizing: border-box;
}
.select {
  display: flex;
  align-items: center;
  height: 72rpx;
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
.form-item-row .select.no-arrow::after {
  display: none;
}
.select-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #ffffff;
  font-size: 26rpx;
}
.ph {
  color: #666d8f;
}

/* 营业执照上传样式 */
.license-tip {
  font-size: 24rpx;
  color: #B9B9BD;
  margin-bottom: 16rpx;
  margin-left: 220rpx;
  margin-top: -30rpx;
}

.upload-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.upload-item {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.upload-img {
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: 0rpx;
  right: -8rpx;
  width: 40rpx;
  height: 40rpx;
  background: #ff5b5b;
  border-radius: 20%;
  color: #fff;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  z-index: 2;
}

.replace-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 24rpx;
  text-align: center;
  padding: 8rpx 0;
  z-index: 1;
}

.upload-btn {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #0c1224;
  border: 2rpx dashed #666d8f;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 48rpx;
  color: #666d8f;
  line-height: 1;
}
</style>

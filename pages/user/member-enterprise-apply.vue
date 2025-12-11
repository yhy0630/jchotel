<template>
  <view class="page">
    <view class="nav-title">完善信息（企业会员）</view>
    <scroll-view scroll-y class="form-wrap">
      <view class="form-item" v-for="item in fields" :key="item.key">
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
          <textarea
            v-else-if="item.type === 'textarea'"
            v-model="form[item.key]"
            :placeholder="item.placeholder"
            placeholder-class="ph"
            class="textarea"
            auto-height
          />
          <view
            v-else-if="item.type === 'select'"
            class="select"
            @tap="handleSelect(item)"
          >
            <text :class="{'ph': !form[item.key]}">{{ form[item.key] || item.placeholder }}</text>
          </view>
        </view>
      </view>
      <!-- 身份优惠选择 -->
      <view class="form-item">
        <view class="label">
          <text>身份优惠</text>
        </view>
        <view class="control">
          <view class="select" @tap="selectIdentityDiscount">
            <text :class="{'ph': !selectedIdentityDiscount}">{{ selectedIdentityDiscount || '请选择身份优惠（可选）' }}</text>
          </view>
        </view>
      </view>
      <!-- 身份优惠证明图片上传 -->
      <view class="form-item" v-if="form.identity_discount_id">
        <view class="label">
          <text>身份优惠证明图片</text>
        </view>
        <view class="control">
          <view class="upload-wrap">
            <view class="upload-item" v-for="(img, index) in identityProofImages" :key="index">
              <image :src="img" mode="aspectFill" class="upload-img"></image>
              <view class="delete-btn" @tap="deleteImage(index)">×</view>
            </view>
            <view class="upload-btn" @tap="chooseImages" v-if="identityProofImages.length < 9">
              <text class="upload-icon">+</text>
              <text class="upload-text">上传图片</text>
            </view>
          </view>
          <view class="upload-tip">最多上传9张图片</view>
        </view>
      </view>
    </scroll-view>
    <view class="submit-bar" @tap="submitApply">提交审核</view>
  </view>
</template>

<script>
import { applyMember, getMemberApplyRecords, getIdentityDiscountList } from '@/api/user'
import { baseURL } from '@/config/app'

export default {
  data() {
    return {
      memberType: 'enterprise',
      submitting: false,
      hasPendingApply: false, // 是否已有待审核的申请
      form: {},
      identityDiscountList: [], // 身份优惠列表
      selectedIdentityDiscount: '', // 选中的身份优惠名称
      identityProofImages: [], // 身份证明图片列表
      fields: [
        { key: 'level', label: '会员级别', required: true, type: 'input', placeholder: '例如：旗舰企业' },
        { key: 'account', label: '会员账号', required: true, type: 'input', placeholder: '请输入企业账号' },
        { key: 'hotel_name', label: '公司/酒店名称', required: true, type: 'input', placeholder: '请输入主体名称' },
        { key: 'hotel_address', label: '详细地址', required: true, type: 'input', placeholder: '请输入办公地址' },
        { key: 'principal', label: '负责人姓名', required: true, type: 'input', placeholder: '请输入负责人姓名' },
        { key: 'principal_mobile', label: '负责人电话', required: true, type: 'input', inputType: 'number', placeholder: '请输入联系电话' },
        { key: 'manager_name', label: '运营联系人', required: false, type: 'input', placeholder: '如有请填写' },
        { key: 'manager_mobile', label: '联系人电话', required: false, type: 'input', inputType: 'number', placeholder: '请输入联系电话' },
        { key: 'license', label: '营业执照信息', required: true, type: 'textarea', placeholder: '请输入营业执照编号、统一社会信用代码及主要经营范围' }
      ]
    }
  },
  created() {
    this.resetForm()
    this.checkPendingApply()
    this.loadIdentityDiscountList()
  },
  methods: {
    resetForm() {
      const nextForm = {}
      this.fields.forEach(field => {
        nextForm[field.key] = field.default || ''
      })
      this.form = nextForm
      this.form.identity_discount_id = 0
      this.selectedIdentityDiscount = ''
      this.identityProofImages = []
    },
    // 加载身份优惠列表
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
    // 选择身份优惠
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
            this.identityProofImages = []
          } else {
            const selected = this.identityDiscountList[tapIndex - 1]
            this.form.identity_discount_id = selected.id
            this.selectedIdentityDiscount = `${selected.name}（优惠${selected.discount_rate}%）`
          }
        }
      })
    },
    // 选择图片
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
    // 上传单张图片
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
    // 删除图片
    deleteImage(index) {
      this.identityProofImages.splice(index, 1)
    },
    // 处理下拉选择
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
    // 检查是否有待审核的申请
    async checkPendingApply() {
      try {
        const res = await getMemberApplyRecords()
        if (res.code === 1 && res.data && res.data.list) {
          // 检查是否有企业会员类型且状态为待审核(0)的申请
          const pendingApply = res.data.list.find(item => 
            item.type === 'enterprise' && item.status === 0
          )
          this.hasPendingApply = !!pendingApply
        }
      } catch (e) {
        console.error('检查待审核申请失败:', e)
      }
    },
    async submitApply() {
      // 防止重复提交
      if (this.submitting) {
        return
      }
      
      // 检查是否已有待审核的申请
      if (this.hasPendingApply) {
        uni.showModal({
          title: '提示',
          content: '您已有企业会员的待审核申请，请等待审核完成后再提交',
          showCancel: false
        })
        return
      }
      
      // 表单验证
      for (const item of this.fields) {
        if (item.required && !this.form[item.key]) {
          uni.showToast({ title: `请填写${item.label}`, icon: 'none' })
          return
        }
      }
      
      this.submitting = true
      try {
        // 准备提交数据
        const submitData = {
          type: this.memberType,
          form: this.form,
          identity_discount_id: this.form.identity_discount_id || 0,
          identity_proof_images: this.identityProofImages.length > 0 ? JSON.stringify(this.identityProofImages) : ''
        }
        
        const res = await applyMember(submitData)
        if (res.code === 1) {
          uni.showToast({ title: '提交成功，等待审核', icon: 'success' })
          setTimeout(() => {
            // 返回到上一个页面
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
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a2548 0%, #050814 100%);
  display: flex;
  flex-direction: column;
}
.nav-title {
  padding: 32rpx;
  padding-top: 80rpx;
  font-size: 32rpx;
  color: #ffffff;
}
.form-wrap {
  flex: 1;
  padding: 0 24rpx 24rpx;
}
.form-item {
  background: #151c35;
  border-radius: 12rpx;
  padding: 22rpx 24rpx;
  margin-bottom: 16rpx;
}
.label {
  font-size: 26rpx;
  color: #ffffff;
  margin-bottom: 10rpx;
}
.required {
  color: #ff5b5b;
  margin-right: 6rpx;
}
.control input,
.textarea {
  border-radius: 8rpx;
  background: #0c1224;
  padding: 0 20rpx;
  color: #ffffff;
  font-size: 26rpx;
}
.control input {
  height: 72rpx;
}
.textarea {
  min-height: 160rpx;
  padding-top: 12rpx;
  line-height: 40rpx;
}
.ph {
  color: #666d8f;
}
.select {
  height: 72rpx;
  display: flex;
  align-items: center;
  border-radius: 8rpx;
  background: #0c1224;
  padding: 0 20rpx;
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
  background: linear-gradient(90deg, #ffb84d 0%, #ff8a34 100%);
  text-align: center;
  line-height: 96rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}
</style>

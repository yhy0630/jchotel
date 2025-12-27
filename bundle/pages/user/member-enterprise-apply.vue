<template>
  <view class="page">
    <custom-navbar title="完善信息（企业会员）"></custom-navbar>
    <scroll-view scroll-y class="form-wrap">
      <!-- 1. 会员等级 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>会员等级</text>
        </view>
        <view class="control">
          <input v-model="form.level" type="text" placeholder="请输入" placeholder-class="ph" />
        </view>
      </view>
      
      <!-- 2. 会员账号 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>会员账号</text>
        </view>
        <view class="control">
          <input v-model="form.account" type="text" placeholder="请输入" placeholder-class="ph" />
        </view>
      </view>
      
      <!-- 3. 管理员姓名 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>管理员姓名</text>
        </view>
        <view class="control">
          <input v-model="form.admin_name" type="text" placeholder="请输入" placeholder-class="ph" />
        </view>
      </view>
      
      <!-- 4. 管理员性别 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>管理员性别</text>
        </view>
        <view class="control">
          <view class="select" @tap="selectGender('admin_gender')">
            <text :class="['select-text', { 'ph': !form.admin_gender }]">{{ form.admin_gender || '请选择' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 5. 管理员年龄 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>管理员年龄</text>
        </view>
        <view class="control">
          <input v-model="form.admin_age" type="number" placeholder="请输入" placeholder-class="ph" />
        </view>
      </view>
      
      <!-- 6. 管理员电话 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>管理员电话</text>
        </view>
        <view class="control">
          <input v-model="form.admin_phone" type="number" placeholder="请输入" placeholder-class="ph" />
        </view>
      </view>
      
      <!-- 7. 管理员身份证上传 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>管理员身份证</text>
        </view>
        <view class="control">
          <view class="upload-trigger" @tap="openImageUpload('admin_id_card')">
            <text :class="['upload-text', { 'ph': adminIdCardImages.length === 0 }]">
              {{ adminIdCardImages.length > 0 ? `已上传${adminIdCardImages.length}张，最多3张` : '上传身份证，最多3张' }}
            </text>
            <text class="upload-icon">+</text>
          </view>
        </view>
      </view>
      <view class="image-preview" v-if="adminIdCardImages.length > 0">
        <view class="upload-item" v-for="(img, index) in adminIdCardImages" :key="index">
          <image :src="img" mode="aspectFill" class="upload-img"></image>
          <view class="delete-btn" @tap="deleteImage('admin_id_card', index)">×</view>
        </view>
      </view>
      
      <!-- 8. 法人姓名 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>法人姓名</text>
        </view>
        <view class="control">
          <input v-model="form.legal_name" type="text" placeholder="请输入" placeholder-class="ph" />
        </view>
      </view>
      
      <!-- 9. 法人年龄 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>法人年龄</text>
        </view>
        <view class="control">
          <input v-model="form.legal_age" type="number" placeholder="请输入" placeholder-class="ph" />
        </view>
      </view>
      
      <!-- 10. 法人电话 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>法人电话</text>
        </view>
        <view class="control">
          <input v-model="form.legal_phone" type="number" placeholder="请输入" placeholder-class="ph" />
        </view>
      </view>
      
      <!-- 11. 法人身份证上传 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>法人身份证</text>
        </view>
        <view class="control">
          <view class="upload-trigger" @tap="openImageUpload('legal_id_card')">
            <text :class="['upload-text', { 'ph': legalIdCardImages.length === 0 }]">
              {{ legalIdCardImages.length > 0 ? `已上传${legalIdCardImages.length}张，最多3张` : '上传身份证，最多3张' }}
            </text>
            <text class="upload-icon">+</text>
          </view>
        </view>
      </view>
      <view class="image-preview" v-if="legalIdCardImages.length > 0">
        <view class="upload-item" v-for="(img, index) in legalIdCardImages" :key="index">
          <image :src="img" mode="aspectFill" class="upload-img"></image>
          <view class="delete-btn" @tap="deleteImage('legal_id_card', index)">×</view>
        </view>
      </view>
      
      <!-- 12. 财务姓名 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>财务姓名</text>
        </view>
        <view class="control">
          <input v-model="form.finance_name" type="text" placeholder="请输入" placeholder-class="ph" />
        </view>
      </view>
      
      <!-- 13. 财务性别 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>财务性别</text>
        </view>
        <view class="control">
          <view class="select" @tap="selectGender('finance_gender')">
            <text :class="['select-text', { 'ph': !form.finance_gender }]">{{ form.finance_gender || '请选择' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 14. 财务年龄 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>财务年龄</text>
        </view>
        <view class="control">
          <input v-model="form.finance_age" type="number" placeholder="请输入" placeholder-class="ph" />
        </view>
      </view>
      
      <!-- 15. 财务电话 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>财务电话</text>
        </view>
        <view class="control">
          <input v-model="form.finance_phone" type="number" placeholder="请输入" placeholder-class="ph" />
        </view>
      </view>
      
      <!-- 16. 财务身份证上传 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>财务身份证</text>
        </view>
        <view class="control">
          <view class="upload-trigger" @tap="openImageUpload('finance_id_card')">
            <text :class="['upload-text', { 'ph': financeIdCardImages.length === 0 }]">
              {{ financeIdCardImages.length > 0 ? `已上传${financeIdCardImages.length}张，最多3张` : '上传身份证，最多3张' }}
            </text>
            <text class="upload-icon">+</text>
          </view>
        </view>
      </view>
      <view class="image-preview" v-if="financeIdCardImages.length > 0">
        <view class="upload-item" v-for="(img, index) in financeIdCardImages" :key="index">
          <image :src="img" mode="aspectFill" class="upload-img"></image>
          <view class="delete-btn" @tap="deleteImage('finance_id_card', index)">×</view>
        </view>
      </view>
      
      <!-- 17. 营业执照上传 -->
      <view class="form-item form-item-row">
        <view class="label">
          <text class="required">*</text>
          <text>营业执照</text>
        </view>
        <view class="control">
          <view class="upload-trigger" @tap="openImageUpload('business_license')">
            <text :class="['upload-text', { 'ph': businessLicenseImages.length === 0 }]">
              {{ businessLicenseImages.length > 0 ? `已上传${businessLicenseImages.length}张，最多5张` : '上传营业执照，最多5张' }}
            </text>
            <text class="upload-icon">+</text>
          </view>
        </view>
      </view>
      <view class="image-preview" v-if="businessLicenseImages.length > 0">
        <view class="upload-item" v-for="(img, index) in businessLicenseImages" :key="index">
          <image :src="img" mode="aspectFill" class="upload-img"></image>
          <view class="delete-btn" @tap="deleteImage('business_license', index)">×</view>
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
      hasPendingApply: false,
      form: {
        level: '',
        account: '',
        admin_name: '',
        admin_gender: '',
        admin_age: '',
        admin_phone: '',
        legal_name: '',
        legal_age: '',
        legal_phone: '',
        finance_name: '',
        finance_gender: '',
        finance_age: '',
        finance_phone: '',
        identity_discount_id: 0
      },
      identityDiscountList: [],
      selectedIdentityDiscount: '',
      // 各类图片数组
      adminIdCardImages: [],      // 管理员身份证
      legalIdCardImages: [],       // 法人身份证
      financeIdCardImages: [],     // 财务身份证
      businessLicenseImages: [],   // 营业执照
      identityProofImages: []      // 身份优惠证明
    }
  },
  created() {
    this.checkPendingApply()
    this.loadIdentityDiscountList()
  },
  methods: {
    // 选择性别
    selectGender(field) {
      uni.showActionSheet({
        itemList: ['男', '女'],
        success: ({ tapIndex }) => {
          this.$set(this.form, field, ['男', '女'][tapIndex])
        }
      })
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
    // 打开图片上传
    openImageUpload(type) {
      let currentImages = []
      let maxCount = 3
      
      switch(type) {
        case 'admin_id_card':
          currentImages = this.adminIdCardImages
          maxCount = 3
          break
        case 'legal_id_card':
          currentImages = this.legalIdCardImages
          maxCount = 3
          break
        case 'finance_id_card':
          currentImages = this.financeIdCardImages
          maxCount = 3
          break
        case 'business_license':
          currentImages = this.businessLicenseImages
          maxCount = 5
          break
        case 'identity_proof':
          currentImages = this.identityProofImages
          maxCount = 5
          break
      }
      
      if (currentImages.length >= maxCount) {
        uni.showToast({ title: `最多上传${maxCount}张图片`, icon: 'none' })
        return
      }
      
      const remainCount = maxCount - currentImages.length
      uni.chooseImage({
        count: remainCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          uni.showLoading({ title: '上传中...' })
          try {
            const uploadPromises = res.tempFilePaths.map(path => this.uploadImage(path))
            const uploadResults = await Promise.all(uploadPromises)
            
            switch(type) {
              case 'admin_id_card':
                this.adminIdCardImages = [...this.adminIdCardImages, ...uploadResults]
                break
              case 'legal_id_card':
                this.legalIdCardImages = [...this.legalIdCardImages, ...uploadResults]
                break
              case 'finance_id_card':
                this.financeIdCardImages = [...this.financeIdCardImages, ...uploadResults]
                break
              case 'business_license':
                this.businessLicenseImages = [...this.businessLicenseImages, ...uploadResults]
                break
              case 'identity_proof':
                this.identityProofImages = [...this.identityProofImages, ...uploadResults]
                break
            }
            
            uni.hideLoading()
            uni.showToast({ title: '上传成功', icon: 'success' })
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
    deleteImage(type, index) {
      switch(type) {
        case 'admin_id_card':
          this.adminIdCardImages.splice(index, 1)
          break
        case 'legal_id_card':
          this.legalIdCardImages.splice(index, 1)
          break
        case 'finance_id_card':
          this.financeIdCardImages.splice(index, 1)
          break
        case 'business_license':
          this.businessLicenseImages.splice(index, 1)
          break
        case 'identity_proof':
          this.identityProofImages.splice(index, 1)
          break
      }
    },
    // 检查是否有待审核的申请
    async checkPendingApply() {
      try {
        const res = await getMemberApplyRecords()
        if (res.code === 1 && res.data && res.data.list) {
          const pendingApply = res.data.list.find(item => 
            item.type === 'enterprise' && item.status === 0
          )
          this.hasPendingApply = !!pendingApply
        }
      } catch (e) {
        console.error('检查待审核申请失败:', e)
      }
    },
    // 提交申请
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
      
      // 表单验证 - 必填字段
      const requiredFields = [
        { key: 'level', label: '会员等级' },
        { key: 'account', label: '会员账号' },
        { key: 'admin_name', label: '管理员姓名' },
        { key: 'admin_gender', label: '管理员性别' },
        { key: 'admin_age', label: '管理员年龄' },
        { key: 'admin_phone', label: '管理员电话' },
        { key: 'legal_name', label: '法人姓名' },
        { key: 'legal_age', label: '法人年龄' },
        { key: 'legal_phone', label: '法人电话' },
        { key: 'finance_name', label: '财务姓名' },
        { key: 'finance_gender', label: '财务性别' },
        { key: 'finance_age', label: '财务年龄' },
        { key: 'finance_phone', label: '财务电话' }
      ]
      
      for (const field of requiredFields) {
        if (!this.form[field.key]) {
          uni.showToast({ title: `请填写${field.label}`, icon: 'none' })
          return
        }
      }
      
      // 验证必传图片
      if (this.adminIdCardImages.length === 0) {
        uni.showToast({ title: '请上传管理员身份证', icon: 'none' })
        return
      }
      if (this.legalIdCardImages.length === 0) {
        uni.showToast({ title: '请上传法人身份证', icon: 'none' })
        return
      }
      if (this.financeIdCardImages.length === 0) {
        uni.showToast({ title: '请上传财务身份证', icon: 'none' })
        return
      }
      if (this.businessLicenseImages.length === 0) {
        uni.showToast({ title: '请上传营业执照', icon: 'none' })
        return
      }
      
      this.submitting = true
      try {
        // 准备提交数据
        const submitData = {
          type: this.memberType,
          form: {
            ...this.form,
            admin_id_card: JSON.stringify(this.adminIdCardImages),
            legal_id_card: JSON.stringify(this.legalIdCardImages),
            finance_id_card: JSON.stringify(this.financeIdCardImages),
            business_license: JSON.stringify(this.businessLicenseImages)
          },
          identity_discount_id: this.form.identity_discount_id || 0,
          identity_proof_images: this.identityProofImages.length > 0 ? JSON.stringify(this.identityProofImages) : ''
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
.page {
  min-height: 100vh;
  background: #0D1034;
  display: flex;
  flex-direction: column;
  padding-top: calc(130rpx + var(--status-bar-height));
}

.form-wrap {
  flex: 1;
  margin: 20rpx 0rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  border-radius: 30rpx;
  background: #1e1F34;
}

.form-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
  padding: 15rpx 20rpx;
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

.control input {
  height: 72rpx;
  background: transparent;
  padding: 0;
  color: #ffffff;
  font-size: 26rpx;
}

.ph {
  color: #666d8f;
}

.select {
  display: flex;
  align-items: center;
  position: relative;
  justify-content: space-between;
  padding-right: 34rpx;
  height: 72rpx;
  background: transparent;
}

.select::after {
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
  color: #ffffff;
  font-size: 26rpx;
}

.upload-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72rpx;
}

.upload-text {
  flex: 1;
  color: #ffffff;
  font-size: 26rpx;
}

.upload-icon {
  color: #fff;
  font-size: 32rpx;
  font-weight: 300;
  background-color: #353548;
  border-radius: 50%;
  padding: 5rpx 15rpx;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 20rpx;
  background: #1e1F34;
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

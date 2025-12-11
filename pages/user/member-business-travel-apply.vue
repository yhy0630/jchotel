<template>
  <view class="page">
    <view class="nav-title">完善信息（商旅会员）</view>
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
            v-else
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
import { applyMember, getIdentityDiscountList } from '@/api/user'
import { baseURL } from '@/config/app'

export default {
  data() {
    return {
      memberType: 'business_travel',
      submitting: false,
      form: {},
      identityDiscountList: [],
      selectedIdentityDiscount: '',
      identityProofImages: [],
      fields: [
        { key: 'level', label: '会员级别', required: true, type: 'input', placeholder: '例如：铂金卡' },
        { key: 'account', label: '会员账号', required: true, type: 'input', placeholder: '请输入会员账号' },
        { key: 'name', label: '姓名', required: true, type: 'input', placeholder: '请输入真实姓名' },
        { key: 'gender', label: '性别', required: true, type: 'select', placeholder: '请选择性别', options: ['男', '女'] },
        { key: 'age', label: '年龄', required: true, type: 'select', placeholder: '请选择年龄段', options: ['18-25岁', '26-35岁', '36-45岁', '46-60岁', '60岁以上'] },
        { key: 'nation', label: '民族', required: true, type: 'select', placeholder: '请选择民族', options: ['汉族', '满族', '蒙古族', '回族', '藏族', '维吾尔族', '其他'] },
        { key: 'education', label: '学历', required: true, type: 'select', placeholder: '请选择学历', options: ['高中及以下', '大专', '本科', '硕士及以上'] },
        { key: 'job', label: '职业', required: true, type: 'select', placeholder: '请选择职业', options: ['企业管理', '销售/市场', '采购', '财务', '公务员', '教师', '学生', '其他'] },
        { key: 'political', label: '政治面貌', required: true, type: 'select', placeholder: '请选择政治面貌', options: ['群众', '共青团员', '共产党员', '民主党派'] },
        { key: 'social_group', label: '社会群体', required: true, type: 'select', placeholder: '请选择社会群体', options: ['商协会', '高校校友', '公益组织', '行业社群', '其他'] },
        { key: 'hobbies', label: '业余爱好', required: false, type: 'input', placeholder: '如：旅行、摄影、阅读' },
        { key: 'living_habit', label: '住宿习惯', required: false, type: 'input', placeholder: '如：偏好高星酒店/安静房型' },
        { key: 'address', label: '常驻地址', required: false, type: 'input', placeholder: '请输入省市区及具体地址' }
      ]
    }
  },
  created() {
    this.resetForm()
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
            this.identityProofImages = []
          } else {
            const selected = this.identityDiscountList[tapIndex - 1]
            this.form.identity_discount_id = selected.id
            this.selectedIdentityDiscount = `${selected.name}（优惠${selected.discount_rate}%）`
          }
        }
      })
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
    async submitApply() {
      if (this.submitting) return
      for (const item of this.fields) {
        if (item.required && !this.form[item.key]) {
          uni.showToast({ title: `请填写${item.label}`, icon: 'none' })
          return
        }
      }
      this.submitting = true
      try {
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
.select,
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
  min-height: 140rpx;
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

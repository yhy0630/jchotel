<template>
  <member-form
    ref="memberForm"
    title="完善信息（商务会员）"
    :fields="fields"
    :show-image-upload="form.identity_discount_id > 0"
    @submit="handleSubmit"
  >
  </member-form>
</template>

<script>
import { applyMember, getIdentityDiscountList } from '@/api/user'
import { baseURL } from '@/config/app'
import MemberForm from '@/components/member-form/member-form.vue'

export default {
  components: {
    MemberForm
  },
  data() {
    return {
      memberType: 'business',
      submitting: false,
      form: {
        identity_discount_id: 0
      },
      identityDiscountList: [],
      selectedIdentityDiscount: '',
      identityDiscountImages: [], // 身份优惠图片数组
      fields: [
        { key: 'level', label: '会员级别', required: true, type: 'input', placeholder: '请输入' },
        { key: 'account', label: '会员账号', required: true, type: 'input', placeholder: '请输入' },
        { key: 'business_area', label: '业务区域', required: true, type: 'select', placeholder: '请选择', options: ['华北地区', '华东地区', '华南地区', '华中地区', '西南地区', '西北地区', '东北地区'] },
        { key: 'hotel', label: '就职酒店', required: true, type: 'input', placeholder: '请输入工作单位名称' },
        { key: 'position', label: '岗位名称', required: true, type: 'input', placeholder: '请输入' },
        { key: 'name', label: '姓名', required: true, type: 'input', placeholder: '请输入' },
        { key: 'gender', label: '性别', required: true, type: 'select', placeholder: '请选择', options: ['男', '女'] },
        { key: 'age', label: '年龄', required: true, type: 'select', placeholder: '请选择', options: ['18-25岁', '26-35岁', '36-45岁', '46-60岁', '60岁以上'] },
        { key: 'nation', label: '民族', required: true, type: 'select', placeholder: '请选择', options: ['汉族', '满族', '蒙古族', '回族', '藏族', '维吾尔族', '其他'] },
        { key: 'education', label: '学历', required: true, type: 'select', placeholder: '请选择', options: ['高中及以下', '大专', '本科', '硕士及以上'] },
        { key: 'political', label: '政治面貌', required: true, type: 'select', placeholder: '请选择', options: ['群众', '共青团员', '共产党员', '民主党派'] },
        { key: 'social_group', label: '社会群体', required: true, type: 'select', placeholder: '请选择', options: ['商协会', '高校校友', '公益组织', '行业社群', '其他'] },
        { key: 'hobbies', label: '业余爱好', required: false, type: 'input', placeholder: '如：旅行、摄影、阅读' },
        { key: 'remark', label: '备注', required: false, type: 'input', placeholder: '请输入备注信息' }
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
            this.identityDiscountImages = []
          } else {
            const selected = this.identityDiscountList[tapIndex - 1]
            this.form.identity_discount_id = selected.id
            this.selectedIdentityDiscount = `${selected.name}（优惠${selected.discount_rate}%）`
          }
        }
      })
    },
    // 打开图片上传
    openImageUpload() {
      const maxCount = 5
      const currentCount = this.identityDiscountImages.length
      
      if (currentCount >= maxCount) {
        uni.showToast({ title: '最多上传5张图片', icon: 'none' })
        return
      }
      
      const remainCount = maxCount - currentCount
      uni.chooseImage({
        count: remainCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          uni.showLoading({ title: '上传中...' })
          try {
            const uploadPromises = res.tempFilePaths.map(path => this.uploadImage(path))
            const uploadResults = await Promise.all(uploadPromises)
            this.identityDiscountImages = [...this.identityDiscountImages, ...uploadResults]
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
    deleteImage(index) {
      this.identityDiscountImages.splice(index, 1)
    },
    async handleSubmit(data) {
      if (this.submitting) return
      this.submitting = true
      try {
        const submitData = {
          type: this.memberType,
          form: { ...data.form, identity_discount_id: this.form.identity_discount_id },
          identity_discount_id: this.form.identity_discount_id || 0,
          identity_proof_images: this.identityDiscountImages.length > 0 ? JSON.stringify(this.identityDiscountImages) : ''
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

/* 上传触发器样式 */
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
  color: #c8cbd9;
  font-size: 32rpx;
  font-weight: 300;
}

.ph {
  color: #666d8f;
}

/* 图片预览区域 */
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
</style>



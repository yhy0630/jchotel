<template>
  <member-form
    ref="memberForm"
    title="完善信息（商旅会员）"
    :fields="fields"
    :show-image-upload="form.identity_discount_id > 0"
    @submit="handleSubmit"
  >
    <!-- 身份优惠选择插槽 -->
    <template #identity-discount>
      <view class="form-item form-item-row">
        <view class="label">
          <text>身份优惠</text>
        </view>
        <view class="control">
          <view class="select" @tap="selectIdentityDiscount">
            <text :class="['select-text', { 'ph': !selectedIdentityDiscount }]">{{ selectedIdentityDiscount || '请选择身份优惠（可选）' }}</text>
          </view>
        </view>
      </view>
    </template>
  </member-form>
</template>

<script>
import { applyMember, getIdentityDiscountList } from '@/api/user'
import MemberForm from '@/components/member-form/member-form.vue'

export default {
  components: {
    MemberForm
  },
  data() {
    return {
      memberType: 'business_travel',
      submitting: false,
      form: {
        identity_discount_id: 0
      },
      identityDiscountList: [],
      selectedIdentityDiscount: '',
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
    async handleSubmit(data) {
      if (this.submitting) return
      this.submitting = true
      try {
        const submitData = {
          type: this.memberType,
          form: { ...data.form, identity_discount_id: this.form.identity_discount_id },
          identity_discount_id: this.form.identity_discount_id || 0,
          identity_proof_images: data.identityProofImages.length > 0 ? JSON.stringify(data.identityProofImages) : ''
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
</style>

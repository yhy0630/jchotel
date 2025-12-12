<template>
  <view class="page">
    <view class="list">
      <view
        v-for="(item, index) in items"
        :key="item.id"
        class="row"
      >
        <view class="left">
          <image class="thumb" :src="thumbIcon" mode="aspectFill" />
        </view>
        <view class="right">
          <view class="title">{{ item.title }}</view>
          <view class="desc">{{ item.desc }}</view>
          <view class="price">￥ {{ item.price }}</view>
        </view>
        <image
          class="check"
          :src="item.checked ? checkedIcon : uncheckedIcon"
          @tap="toggleItem(index)"
        />
      </view>
    </view>

    <view class="footer">
      <view class="select-all" @tap="toggleAll">
        <image class="check" :src="allChecked ? checkedIcon : uncheckedIcon" />
        <text class="select-text">全选</text>
      </view>
      <view class="total">合计 ￥{{ totalPrice }}</view>
      <view class="submit-btn" @tap="pay">
        支付查询({{ totalCount }})
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      checkedIcon: '/static/images/编组 4.png',
      uncheckedIcon: '/static/images/椭圆形备份@3x.png',
      thumbIcon: '/static/images/company.png',
      items: [
        { id: 1, title: '工商信息', desc: '介绍占位', price: 0.15, checked: true },
        { id: 2, title: '工商信息', desc: '介绍占位', price: 0.15, checked: true },
        { id: 3, title: '工商信息', desc: '介绍占位', price: 0.15, checked: false },
        { id: 4, title: '工商信息', desc: '介绍占位', price: 0.15, checked: true },
        { id: 5, title: '工商信息', desc: '介绍占位', price: 35.80, checked: true },
      ],
    }
  },
  computed: {
    totalPrice() {
      const sum = this.items.reduce((acc, cur) => (cur.checked ? acc + cur.price : acc), 0)
      return sum.toFixed(2)
    },
    totalCount() {
      return this.items.reduce((acc, cur) => (cur.checked ? acc + 1 : acc), 0)
    },
    allChecked() {
      return this.items.length > 0 && this.items.every(i => i.checked)
    }
  },
  methods: {
    toggleItem(index) {
      const next = [...this.items]
      next[index].checked = !next[index].checked
      this.items = next
    },
    toggleAll() {
      const target = !this.allChecked
      this.items = this.items.map(i => ({ ...i, checked: target }))
    },
    pay() {
      uni.showToast({
        title: `已选${this.totalCount}项，合计￥${this.totalPrice}`,
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1038;
  display: flex;
  flex-direction: column;
}

.list {
  margin-top: 12rpx;
  padding: 12rpx 0 0;
  background: #1E1F34;
}

.row {
  display: flex;
  padding: 20rpx 20rpx 20rpx 16rpx;
  border-bottom: 1rpx solid #6B6B6B; /* 下边框颜色 */
}

.left {
  width: 210rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.check {
  width: 36rpx;
  height: 36rpx;
}

.thumb {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  background: #2d3358;
}

.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #f5f7ff;
  gap: 10rpx;
}

.title {
  font-size: 30rpx;
  font-weight: 600;
  color: #FADBA1;
}

.desc {
  font-size: 24rpx;
  color: #9aa3c5;
}

.price {
  font-size: 32rpx;
  color: #FADBA1;
  font-weight: 600;
}

/* 勾选框靠右放置 */
.row {
  position: relative;
}
.row .check {
  margin-left: auto;
}

.footer {
  height: 120rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  background: #0d1038;
  border-top: 1rpx solid rgba(255, 255, 255, 0.05);
  margin-top: auto; /* 底部对齐 */
}

.select-all {
  display: flex;
  align-items: center;
  gap: 10rpx;
  color: #e5e8ff;
  font-size: 28rpx;
}

.select-text {
  color: #e5e8ff;
}

.total {
  margin-left: 16rpx;
  color: #FADBA1;
  font-size: 30rpx;
  font-weight: 600;
  flex: 1;
}

.submit-btn {
  width: 220rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background: linear-gradient(90deg, #f4bd63 0%, #fde4b4 49.71%, #f3be66 100%);
  color: #380C00;
  font-size: 30rpx;
  font-weight: 600;
  text-align: center;
  line-height: 80rpx;
}
</style>

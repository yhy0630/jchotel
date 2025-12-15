<template>
  <view class="page">
    <!-- 顶部切换 -->
    <view class="tab-bar">
      <view
        class="tab-btn"
        :class="{ active: currentTab === 'wine' }"
        @tap="switchTab('wine')"
      >
        酒水
      </view>
      <view
        class="tab-btn"
        :class="{ active: currentTab === 'tea' }"
        @tap="switchTab('tea')"
      >
        茶叶
      </view>
    </view>

    <!-- 列表 -->
    <view class="card">
      <view
        v-for="(item, index) in items"
        :key="item.id"
        class="item"
      >
        <view class="item-left">
          <image
            class="check-icon"
            :src="item.checked ? checkedIcon : uncheckedIcon"
            @tap="toggleItem(index)"
          />
          <image class="thumb" :src="thumbIcon" mode="aspectFill" />
        </view>

        <view class="item-right">
          <view class="title">{{ item.title }}</view>
          <view class="desc">{{ item.desc }}</view>
          <view class="bottom-row">
            <view class="price">￥ {{ item.price }}</view>
            <view class="stepper">
              <view class="btn" @tap="changeCount(index, -1)">-</view>
              <view class="count">{{ item.count }}</view>
              <view class="btn" @tap="changeCount(index, 1)">+</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部结算 -->
    <view class="footer">
      <view class="select-all" @tap="toggleAll">
        <image class="check-icon" :src="allChecked ? checkedIcon : uncheckedIcon" />
        <text class="select-text">全选</text>
      </view>
      <view class="total">合计 ￥{{ totalPrice }}</view>
      <view class="submit-btn" @tap="checkout">
        结算({{ totalCount }})
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 'tea',
      checkedIcon: '/static/images/编组 4.png',
      uncheckedIcon: '/static/images/椭圆形备份@3x.png',
      thumbIcon: '/static/images/位图.png',
      items: [
        { id: 1, title: '云南普洱高端茶叶', desc: '海浪8美包2个', price: 35.8, count: 1, checked: true },
        { id: 2, title: '云南普洱高端茶叶', desc: '25L', price: 35.8, count: 1, checked: false },
        { id: 3, title: '云南普洱高端茶叶', desc: '24骨黑色', price: 35.8, count: 1, checked: true },
        { id: 4, title: '云南普洱高端茶叶', desc: '原木色', price: 35.8, count: 1, checked: true },
      ],
    }
  },
  computed: {
    totalPrice() {
      const sum = this.items.reduce((acc, cur) => {
        return cur.checked ? acc + cur.price * cur.count : acc
      }, 0)
      return sum.toFixed(1)
    },
    totalCount() {
      return this.items.reduce((acc, cur) => (cur.checked ? acc + cur.count : acc), 0)
    },
    allChecked() {
      return this.items.length > 0 && this.items.every(i => i.checked)
    },
  },
  methods: {
    switchTab(key) {
      this.currentTab = key
      // 需要切换到酒水页可在此添加跳转
      if (key === 'wine') {
        // uni.navigateTo({ url: '/pages/industry_list/wine' })
      }
    },
    toggleItem(index) {
      const next = [...this.items]
      next[index].checked = !next[index].checked
      this.items = next
    },
    changeCount(index, delta) {
      const next = [...this.items]
      const newCount = next[index].count + delta
      if (newCount < 1) return
      next[index].count = newCount
      this.items = next
    },
    toggleAll() {
      const target = !this.allChecked
      this.items = this.items.map(i => ({ ...i, checked: target }))
    },
    checkout() {
      uni.showToast({
        title: `已选${this.totalCount}件，合计￥${this.totalPrice}`,
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

.tab-bar {
  margin: 16rpx;
  background: #1b2045;
  border-radius: 48rpx;
  padding: 6rpx;
  display: flex;
}

.tab-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  color: #e5e8ff;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-btn.active {
  background: linear-gradient(90deg, #f4bd63 0%, #fde4b4 49.71%, #f3be66 100%);
  color: #3b1c00;
  font-weight: 600;
}

.card {
  margin: 0 16rpx;
  padding: 16rpx;
  background: #1b2045;
  border-radius: 16rpx;
  flex: 1;
}

.item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
}

.item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.check-icon {
  width: 40rpx;
  height: 40rpx;
}

.thumb {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #333;
}

.item-right {
  flex: 1;
  margin-left: 16rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title {
  font-size: 30rpx;
  color: #f5f7ff;
}

.desc {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #9aa3c5;
}

.bottom-row {
  margin-top: 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price {
  color: #f4bd63;
  font-size: 32rpx;
  font-weight: 600;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 8rpx;
  background: #151a36;
  color: #e5e8ff;
  font-size: 28rpx;
  text-align: center;
  line-height: 44rpx;
}

.count {
  min-width: 48rpx;
  text-align: center;
  color: #e5e8ff;
  font-size: 28rpx;
}

.footer {
  height: 120rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  background: #0d1038;
  border-top: 1rpx solid rgba(255, 255, 255, 0.05);
}

.select-all {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #e5e8ff;
  font-size: 28rpx;
}

.select-text {
  color: #e5e8ff;
}

.total {
  margin-left: 20rpx;
  color: #f4bd63;
  font-size: 30rpx;
  font-weight: 600;
  flex: 1;
}

.submit-btn {
  width: 200rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background: linear-gradient(90deg, #f4bd63 0%, #fde4b4 49.71%, #f3be66 100%);
  color: #3b1c00;
  font-size: 30rpx;
  font-weight: 600;
  text-align: center;
  line-height: 80rpx;
}
</style>


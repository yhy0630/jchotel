<template>
  <view class="page">
    <scroll-view scroll-y class="form">
      <view class="form-item">
        <text class="label">*联系电话</text>
        <input v-model="form.mobile" type="number" placeholder="请输入联系方式" />
      </view>
      <view class="form-item">
        <text class="label">*地区</text>
        <view class="picker" @click="selectCity">{{ form.city_name || '请选择需要预定的地区' }}</view>
      </view>
      <view class="form-item">
        <text class="label">区域/行政区</text>
        <input v-model="form.area" placeholder="请填写区域或行政区（选填）" />
      </view>
      <view class="form-item">
        <text class="label">*附近参照物</text>
        <input v-model="form.landmark" placeholder="请填写附近参照物" />
      </view>
      <view class="form-item">
        <text class="label">*酒店档次</text>
        <picker mode="selector" :range="hotelLevels" :value="hotelLevelIndex" @change="onHotelLevelChange">
          <view class="picker">{{ form.hotel_level || '请选择档次' }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">*房型</text>
        <picker mode="selector" :range="roomTypes" :value="roomTypeIndex" @change="onRoomTypeChange">
          <view class="picker">{{ form.room_type || '请选择需要的房型' }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">*价位</text>
        <picker mode="selector" :range="priceRanges" :value="priceRangeIndex" @change="onPriceRangeChange">
          <view class="picker">{{ form.price_range || '请选择价位' }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">*入住时间</text>
        <picker mode="date" :value="form.check_in_date" @change="onCheckInChange">
          <view class="picker">{{ form.check_in_date || '请选择' }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">*离店时间</text>
        <picker mode="date" :value="form.check_out_date" @change="onCheckOutChange">
          <view class="picker">{{ form.check_out_date || '请选择' }}</view>
        </picker>
      </view>
    </scroll-view>
    <button class="submit" @click="submit">发布</button>
  </view>
</template>

<script>
import { customPublish } from '../../api/hotel.js'

export default {
  data() {
    return {
      form: {
        mobile: '',
        city_code: '',
        city_name: '',
        area: '',
        landmark: '',
        hotel_level: '',
        room_type: '',
        price_range: '',
        check_in_date: '',
        check_out_date: '',
        guest_num: 1
      },
      hotelLevels: ['经济型', '舒适型', '高档型', '豪华型', '5星级'],
      hotelLevelIndex: -1,
      roomTypes: ['单人间', '标准间', '大床房', '双床房', '套房', '豪华标间'],
      roomTypeIndex: -1,
      priceRanges: ['100-200元', '200-300元', '300-500元', '500-800元', '800-1200元', '1200元以上'],
      priceRangeIndex: -1
    }
  },
  onShow() {
    // 从城市选择页面返回时更新城市信息
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage.cityCode) {
      this.form.city_code = currentPage.cityCode
      this.form.city_name = currentPage.cityName || ''
    }
  },
  methods: {
    selectCity() {
      uni.navigateTo({ url: '/bundle/pages/hotel/city-select' })
    },
    onCheckInChange(e) {
      this.form.check_in_date = e.detail.value
    },
    onCheckOutChange(e) {
      this.form.check_out_date = e.detail.value
    },
    onHotelLevelChange(e) {
      this.hotelLevelIndex = e.detail.value
      this.form.hotel_level = this.hotelLevels[e.detail.value]
    },
    onRoomTypeChange(e) {
      this.roomTypeIndex = e.detail.value
      this.form.room_type = this.roomTypes[e.detail.value]
    },
    onPriceRangeChange(e) {
      this.priceRangeIndex = e.detail.value
      this.form.price_range = this.priceRanges[e.detail.value]
    },
    async submit() {
      if (!this.form.mobile || !this.form.city_code || !this.form.landmark || 
          !this.form.hotel_level || !this.form.room_type || !this.form.price_range ||
          !this.form.check_in_date || !this.form.check_out_date) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      try {
        const res = await customPublish(this.form)
        if (res.code === 1) {
          // 跳转到发布成功页面
          uni.redirectTo({
            url: `/bundle/pages/hotel/custom-publish-success?request_id=${res.data.request_id || res.data.id || ''}`
          })
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '发布失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #1a1a2e;
  padding-bottom: 120rpx;
}
.form {
  padding: 20rpx;
}
.form-item {
  background: #16213e;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
}
.label {
  color: #ff9500;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  display: block;
}
input, .picker {
  background: #0f1624;
  color: #fff;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}
.submit {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #ff9500, #ff6b00);
  color: #fff;
  border: none;
  padding: 30rpx;
  font-size: 32rpx;
  border-radius: 0;
}
</style>


<template>
  <view class="page">
    <!-- 房型选项卡 -->
    <view class="room-tabs">
      <view 
        v-for="(tab, index) in roomTabs" 
        :key="index"
        :class="['room-tab-item', { active: currentTab === index }]"
        @click="switchTab(index)"
      >
        {{ tab.title }}
      </view>
    </view>

    <!-- 顶部轮播图 -->
    <view class="banner-section">
      <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500" circular>
        <swiper-item v-for="(item, index) in bannerList" :key="index">
          <image :src="item.image" mode="aspectFill" class="banner-image"></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 尊享房内容 -->
    <view v-if="currentTab === 0">
      <!-- 地址选择区域 -->
      <view class="location-section">
        <view class="location-left" @click="selectCity">
          <text class="location-text">{{ cityName }}</text>
          <text class="location-arrow">▼</text>
        </view>
        <view class="location-divider"></view>
        <view class="location-right" @click="getCurrentLocation">
          <text class="location-label">当前位置</text>
          <image class="location-img" src="/static/images/dingwei 1.png" mode="widthFix"></image>
        </view>
      </view>

      <!-- 时间选择区域 + 价格/星级 -->
      <view class="date-section with-filter">
        <view class="date-row">
          <view class="date-item" @click="selectCheckInDate">
            <text class="date-label">入住日期</text>
            <text class="date-value">{{ checkInDate }}</text>
          </view>
          <view class="date-middle">
            <text class="date-night">共{{ nightCount }}晚</text>
          </view>
          <view class="date-item" @click="selectCheckOutDate">
            <text class="date-label">离店日期</text>
            <text class="date-value">{{ checkOutDate }}</text>
          </view>
        </view>
        <view class="filter-inline" @click="showFilterPopup">
          <text class="filter-text">价格/星级</text>
          <text class="filter-value">{{ priceFilterText || '不限' }}</text>
        </view>
      </view>

      <!-- 搜索按钮 -->
      <view class="search-section">
        <button class="search-btn" @click="searchHotels">搜索房源</button>
      </view>

      <!-- 列表区域 -->
      <view class="list-section">
        <view class="hotel-list">
          <view 
            v-for="(item, index) in hotelList" 
            :key="index" 
            class="hotel-item"
            @click="goHotelDetail(item)"
          >
            <image :src="item.image || '/static/images/Rectangle 30184.png'" mode="aspectFill" class="hotel-image"></image>
            <view class="hotel-info">
              <view class="hotel-name">{{ item.hotelName }}</view>
              <view class="hotel-rating">
                <text class="rating-score">{{ item.rating || '4.9' }} 超棒</text>
                <text class="rating-reviews">{{ item.reviews || '5077' }}条点评</text>
              </view>
              <view class="hotel-location">距您直线距离{{ item.distance || '2.5' }}公里 近{{ item.area || '天安门广场' }}</view>
              <view class="hotel-desc">{{ item.desc || '酒店介绍：占位文字占位文字占位文字占位文字占位文字占位文字占位文字占位文字占位文字占位文字占位文字占位文字.....' }}</view>
              <view class="hotel-price">
                <text class="price-item">挂牌价¥{{ formatPrice(item.list_price || item.listPrice) }}起</text>
                <text class="price-item vip">尊享价¥{{ formatPrice(item.vip_price || item.vipPrice) }}起</text>
                <text class="price-item share">股东价¥{{ formatPrice(item.share_price || item.sharePrice) }}起</text>
              </view>
            </view>
          </view>
          <view v-if="loading" class="loading">加载中...</view>
          <view v-if="noMore && hotelList.length > 0" class="no-more">没有更多了</view>
          <view v-if="!loading && hotelList.length === 0" class="empty">暂无酒店数据</view>
        </view>
      </view>
    </view>

    <!-- 定制房内容 -->
    <view v-if="currentTab === 1" class="custom-form-section">
      <scroll-view scroll-y class="form">
        <view class="form-item">
          <text class="label">*联系电话</text>
          <input v-model="customForm.mobile" type="number" placeholder="请输入联系方式" class="form-input" />
        </view>
        <view class="form-item">
          <text class="label">*地区</text>
          <view class="picker" @click="selectCustomCity">{{ customForm.city_name || '请选择需要预定的地区' }}</view>
        </view>
        <view class="form-item">
          <text class="label">附近参照物</text>
          <input v-model="customForm.landmark" placeholder="请填写附近参照物" class="form-input" />
        </view>
        <view class="form-item">
          <text class="label">*酒店档次</text>
          <picker mode="selector" :range="hotelLevels" :value="hotelLevelIndex" @change="onHotelLevelChange">
            <view class="picker">{{ customForm.hotel_level || '请选择档次' }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">*房型</text>
          <picker mode="selector" :range="roomTypes" :value="roomTypeIndex" @change="onRoomTypeChange">
            <view class="picker">{{ customForm.room_type || '请选择需要的房型' }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">*价位</text>
          <picker mode="selector" :range="priceRanges" :value="priceRangeIndex" @change="onPriceRangeChange">
            <view class="picker">{{ customForm.price_range || '请选择' }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">*入住时间</text>
          <picker mode="date" :value="customForm.check_in_date" @change="onCheckInChange">
            <view class="picker">{{ customForm.check_in_date || '请选择' }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">*离店时间</text>
          <picker mode="date" :value="customForm.check_out_date" @change="onCheckOutChange">
            <view class="picker">{{ customForm.check_out_date || '请选择' }}</view>
          </picker>
        </view>
      </scroll-view>
      <button class="submit" @click="submitCustomForm">发布</button>
    </view>
  </view>
</template>

<script>
import { hotelList, customPublish } from '@/api/hotel.js'

export default {
  data() {
    return {
      bannerList: [
        { image: '/static/images/酒店.png' }
      ],
      roomTabs: [
        { title: '尊享房' },
        { title: '定制房' }
      ],
      currentTab: 0,
      cityName: '北京',
      cityCode: 'C1025',
      checkInDate: '11月03日',
      checkOutDate: '11月04日',
      nightCount: 1,
      priceFilterText: '不限',
      hotelList: [],
      page: 1,
      loading: false,
      noMore: false,
      customForm: {
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

  computed: {
    form() {
      return this.customForm
    }
  },
  
  onLoad(options) {
    if (options.city_code) {
      this.cityCode = options.city_code
    }
    if (options.city_name) {
      this.cityName = decodeURIComponent(options.city_name)
    }
    this.loadHotelList()
  },
  
  onShow() {
  },

  methods: {
    switchTab(index) {
      this.currentTab = index
      
      if (index === 0) {
        this.page = 1
        this.hotelList = []
        this.noMore = false
        this.loadHotelList()
      }
    },
    
    selectCity() {
      uni.navigateTo({
        url: '/pages/hotel/city-select'
      })
    },
    
    getCurrentLocation() {
      uni.showToast({ title: '获取当前位置', icon: 'none' })
    },
    
    selectCheckInDate() {
      uni.showToast({ title: '选择入住日期', icon: 'none' })
    },
    
    selectCheckOutDate() {
      uni.showToast({ title: '选择离店日期', icon: 'none' })
    },
    
    showFilterPopup() {
      uni.showToast({ title: '筛选功能', icon: 'none' })
    },
    
    searchHotels() {
      uni.navigateTo({
        url: `/pages/hotel/hotel-list?city_code=${this.cityCode}&city_name=${encodeURIComponent(this.cityName)}&room_type=${this.currentTab === 0 ? '2' : '1'}`
      })
    },
    
    async loadHotelList() {
      if (this.loading || this.noMore) return
      
      this.loading = true
      try {
        const res = await hotelList({
          city_code: this.cityCode,
          page: this.page,
          limit: 10,
          room_type: this.currentTab === 0 ? '2' : '1'
        })
        
        if (res.code === 1 && res.data) {
          const list = res.data.list || []
          this.hotelList = this.page === 1 ? list : [...this.hotelList, ...list]
          
          if (list.length < 10) {
            this.noMore = true
          }
        }
      } catch (e) {
        console.error('加载酒店列表失败:', e)
      } finally {
        this.loading = false
      }
    },
    
    loadMore() {
      if (!this.loading && !this.noMore) {
        this.page++
        this.loadHotelList()
      }
    },
    
    goHotelDetail(item) {
      uni.navigateTo({
        url: `/pages/hotel/hotel-detail?hotelCode=${item.hotelCode}&cityCode=${this.cityCode}`
      })
    },
    
    formatPrice(price) {
      if (!price) return '0.00'
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      return numPrice.toFixed(2)
    },

    selectCustomCity() {
      uni.navigateTo({ url: '/pages/hotel/city-select' })
    },

    onCheckInChange(e) {
      this.customForm.check_in_date = e.detail.value
    },

    onCheckOutChange(e) {
      this.customForm.check_out_date = e.detail.value
    },

    onHotelLevelChange(e) {
      this.hotelLevelIndex = e.detail.value
      this.customForm.hotel_level = this.hotelLevels[e.detail.value]
    },

    onRoomTypeChange(e) {
      this.roomTypeIndex = e.detail.value
      this.customForm.room_type = this.roomTypes[e.detail.value]
    },

    onPriceRangeChange(e) {
      this.priceRangeIndex = e.detail.value
      this.customForm.price_range = this.priceRanges[e.detail.value]
    },

    async submitCustomForm() {
      if (!this.customForm.mobile || !this.customForm.city_code || !this.customForm.landmark ||
          !this.customForm.hotel_level || !this.customForm.room_type || !this.customForm.price_range ||
          !this.customForm.check_in_date || !this.customForm.check_out_date) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      try {
        const res = await customPublish(this.customForm)
        if (res.code === 1) {
          uni.redirectTo({
            url: `/pages/hotel/custom-publish-success?request_id=${res.data.request_id || res.data.id || ''}`
          })
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '发布失败', icon: 'none' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #0D1034;
  padding: 20rpx 20rpx 40rpx;
  box-sizing: border-box;
}

.banner-section {
  width: calc(100% + 40rpx);
  height: 400rpx;
  margin-left: -20rpx;
  margin-right: -20rpx;
}

.banner-swiper {
  width: 100%;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.room-tabs {
  display: flex;
  gap: 12rpx;
  padding: 0 6rpx;
  margin-top: 10rpx;
  margin-bottom: 20rpx;
  background-color: #353548;
  color: #ffffff;
  border-radius: 48rpx;
}

.room-tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 30rpx;
  color: #ffffff;
  background-color: #353548;
  border-radius: 48rpx;
  transition: all .2s;
}

.room-tab-item.active {
  color: #1b1f35;
  font-weight: 700;
  background: linear-gradient(90deg, #F3BC62 0%, #FEE6B6 50.34%, #F3BD64 100%);
}

.location-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  background-color: #1b1f35;
  border-radius: 18rpx;
  border: 1rpx solid rgba(255,255,255,0.08);
  color: #f5f5f7;
}

.location-left {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.location-text {
  font-size: 32rpx;
  color: #f5f5f7;
  font-weight: 600;
}

.location-arrow {
  font-size: 22rpx;
  color: #c8cbd9;
}

.location-divider {
  width: 1rpx;
  height: 40rpx;
  background-color: #C3C3C3;
  margin-left: 300rpx;
}

.location-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx 18rpx;
  border-radius: 40rpx;
}

.location-img {
  width: 32rpx;
  height: 32rpx;
}

.location-label {
  font-size: 26rpx;
  color: #EDD7BC;
  font-weight: 600;
}

.date-section {
  padding: 24rpx 30rpx;
  background-color: #1b1f35;
  margin-top: 18rpx;
  border-radius: 18rpx;
  border: 1rpx solid rgba(255,255,255,0.08);
  color: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.date-section.with-filter .filter-inline {
  display: flex;
}

.date-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20rpx;
}

.date-item {
  flex: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  text-align: center;
  white-space: nowrap;
}

.date-label {
  font-size: 24rpx;
  color: #FFE3BB;
}

.date-value {
  font-size: 34rpx;
  color: #FFE3BB;
  font-weight: 700;
}

.date-middle {
  margin: 0 12rpx;
}

.date-night {
  font-size: 26rpx;
  color: #021742;
  padding: 10rpx 25rpx;
  background: linear-gradient(90deg, #F3BD63 -18.87%, #FDE3B1 48.55%, #F3BD63 122.64%);
  border-radius: 42rpx;
  font-weight: 700;
}

.filter-inline {
  display: none;
  flex-direction: column;
  gap: 8rpx;
  padding-left: 24rpx;
  border-left: 1px solid #E6E6E6;
  white-space: nowrap;
}

.filter-text {
  font-size: 23rpx;
  color: #D2BCA0;
}

.filter-value {
  font-size: 28rpx;
  color: #FFE3BB;
  font-weight: 700;
}

.search-section {
  padding: 26rpx 0;
  margin-top: 10rpx;
}

.search-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(90deg, #F4BD63 0%, #FFE3BB 50.4%, #F3BD64 100%);
  border-radius: 20rpx;
  font-size: 32rpx;
  color: #380C00;
  text-align: center;
  font-weight: 800;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(240,190,99,0.35);
}

.search-btn::after {
  border: none;
}

.list-section {
  padding: 10rpx 0 0;
}

.hotel-list {
  .hotel-item {
    background-color: #1b1f35;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    display: flex;
    padding: 22rpx;
    gap: 24rpx;
    border: 1rpx solid rgba(255,255,255,0.08);
    color: #f5f5f7;
  }
  
  .hotel-image {
    width: 260rpx;
    height: 380rpx;
    border-radius: 16rpx;
  }
  
  .hotel-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }
  
  .hotel-name {
    font-size: 33rpx;
    font-weight: 700;
    color: #f5f5f7;
  }
  
  .hotel-rating {
    display: flex;
    align-items: center;
    gap: 14rpx;
  }
  
  .rating-score {
    font-size: 23rpx;
    color: #380C00;
    background: linear-gradient(90deg, #F4BD63 0%, #FFE3BB 50.4%, #F3BD64 100%);
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-weight: 600;
  }
  
  .rating-reviews {
    font-size: 26rpx;
    color: #c8cbd9;
  }
  
  .hotel-location {
    font-size: 26rpx;
    color: #c8cbd9;
  }
  
  .hotel-desc {
    font-size: 30rpx;
    color: #f5f5f7;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .hotel-price {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8rpx;
  }
  
  .price-item {
    font-size: 30rpx;
    color: #c8cbd9;
    font-weight: 700;
  }
  
  .price-item.vip {
    background: linear-gradient(90deg, #F3BC63 0%, #FDE3B1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .price-item.share {
    color: #c8cbd9;
  }
}

.loading,
.no-more,
.empty {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 26rpx;
}

.custom-form-section {
  margin-top: 20rpx;
  padding-bottom: 120rpx;
  background-color: #1E1F34;
}

.form {
  height: calc(100vh - 600rpx);
}

.form-item {
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 18rpx;
}

.label {
  color: #fff;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  display: block;
  font-weight: 600;
}

.form-input,
.picker {
  color: #fff;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
  border: 1rpx solid #fff;
}

.form-input {
  color: #fff;
  padding: 24rpx 20rpx;
  border-radius: 12rpx;
  border: 1rpx solid #fff;
  font-size: 28rpx;
  width: 100%;
  min-height: 80rpx;
  line-height: 1.5;
  box-sizing: border-box;
}

.submit {
  position: fixed;
  bottom: 30rpx;
  left: 20rpx;
  right: 20rpx;
  background: linear-gradient(90deg, #F4BD63 0%, #FFE3BB 50.4%, #F3BD64 100%);
  color: #380C00;
  border: none;
  padding: 0rpx 30rpx;
  font-size: 32rpx;
  font-weight: 800;
  border-radius: 50rpx;
  box-shadow: 0 4rpx 20rpx rgba(240,190,99,0.3);
}

.submit::after {
  border: none;
}
</style>

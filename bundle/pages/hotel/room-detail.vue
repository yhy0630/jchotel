<template>
  <view class="page">
    <!-- 房间大图 -->
    <view class="room-header-image">
      <image :src="getRoomImage()" mode="aspectFill" class="header-img" />
    </view>

    <!-- 房间设施图标 -->
    <view class="amenities-icons">
      <view class="amenity-item">
        <image src="/static/images/停车位.png" class="amenity-icon" mode="aspectFit" />
        <text>停车位</text>
      </view>
      <view class="amenity-item">
        <image src="/static/images/jiesongji 1.png" class="amenity-icon" mode="aspectFit" />
        <text>接送机</text>
      </view>
      <view class="amenity-item">
        <image src="/static/images/wifi 1.png" class="amenity-icon" mode="aspectFit" />
        <text>WiFi</text>
      </view>
      <view class="amenity-item">
        <image src="/static/images/reshui 1.png" class="amenity-icon" mode="aspectFit" />
        <text>热水</text>
      </view>
      <view class="amenity-item">
        <image src="/static/images/周边景点.png" class="amenity-icon" mode="aspectFit" />
        <text>周边景点</text>
      </view>
    </view>

    <!-- 分隔线 -->
    <view class="separator-line"></view>

    <!-- 房间规格 -->
    <view class="room-specs-section">
      <view class="spec-item">
        <image src="/static/images/床.png" class="spec-icon" mode="aspectFit" />
        <text>{{ roomInfo.bedType || '一张双人床1.8m' }}</text>
      </view>
      <view class="spec-item">
        <image src="/static/images/餐具.png" class="spec-icon" mode="aspectFit" />
        <text>{{ roomInfo.mealDesc || '有早餐' }}</text>
      </view>
    </view>
      <!-- 查看全部设施 -->
    <view class="facilities-section">
      <view class="section-header" @click="toggleFacilities">
        <text class="section-title">查看全部设施</text>
        <text class="arrow">{{ showFacilities ? '∧' : '∨' }}</text>
      </view>
      <view v-if="showFacilities" class="facilities-content">
        <view v-if="hotelAmenities.length > 0" class="facility-group">
          <text class="facility-group-title">酒店设施</text>
          <view class="facility-list">
            <text v-for="(item, index) in hotelAmenities" :key="index" class="facility-item">{{ item }}</text>
          </view>
        </view>
        <view v-if="roomFacilities.length > 0" class="facility-group">
          <text class="facility-group-title">房间设施</text>
          <view class="facility-list">
            <text v-for="(item, index) in roomFacilities" :key="index" class="facility-item">{{ item }}</text>
          </view>
        </view>
        <view v-if="hotelAmenities.length === 0 && roomFacilities.length === 0" class="no-facilities">
          <text>暂无设施信息</text>
        </view>
      </view>
    </view>
  
    <!-- 分隔线 -->
    <view class="separator-line"></view>

    <!-- 会员权益 -->
    <view class="benefits-section">
      <view class="section-title">会员权益</view>
      <view class="benefit-item">
        <image src="/static/images/quanyi-2 1.png" class="benefit-icon" mode="aspectFit" />
        <text>权益一占位占位占位</text>
      </view>
      <view class="benefit-item">
        <image src="/static/images/quanyi-2 1.png" class="benefit-icon" mode="aspectFit" />
        <text>权益一占位占位占位</text>
      </view>
    </view>

    <!-- 分隔线 -->
    <view class="separator-line"></view>

    <!-- 政策与服务 -->
    <view class="policy-section">
      <view class="section-title">政策与服务</view>
      <view class="policy-content">
        <text>政策与服务占位占位占位占位占位占位占位占位占位占位占位占位</text>
      </view>
    </view>

    <!-- 底部预订栏 -->
    <view class="booking-bar">
      <view class="price-info">
        <view class="price-line" :class="{ 'highlight': roomInfo.user_price_type === 'list' }">
          <text class="label" :class="{ 'highlight-label': roomInfo.user_price_type === 'list' }">挂牌价</text>
          <text class="value" :class="{ 'highlight-value': roomInfo.user_price_type === 'list' }">¥{{ formatPrice(roomInfo.list_price) }}</text>
        </view>
        <view class="price-line" :class="{ 'highlight': roomInfo.user_price_type === 'vip' }">
          <text class="label" :class="{ 'highlight-label': roomInfo.user_price_type === 'vip' }">尊享价</text>
          <text class="value" :class="{ 'highlight-value': roomInfo.user_price_type === 'vip' }">¥{{ formatPrice(roomInfo.vip_price) }}</text>
        </view>
        <view class="price-line" :class="{ 'highlight': roomInfo.user_price_type === 'share' }">
          <text class="label" :class="{ 'highlight-label': roomInfo.user_price_type === 'share' }">股东价</text>
          <text class="value" :class="{ 'highlight-value': roomInfo.user_price_type === 'share' }">¥{{ formatPrice(roomInfo.share_price) }}</text>
        </view>
      </view>
      <button class="book-btn" @click="bookRoom">立即预订</button>
    </view>
  </view>
</template>

<script>
import { hotelDetail } from '@/api/hotel.js'

export default {
  data() {
    return {
      hotelCode: '',
      roomCode: '',
      cityCode: '',
      checkInDate: '',
      checkOutDate: '',
      roomInfo: {},
      showFacilities: false,
      hotelAmenities: [],
      roomFacilities: [],
      loading: false
    }
  },
  onLoad(options) {
    this.hotelCode = options.hotelCode || ''
    this.roomCode = options.roomCode || ''
    this.cityCode = options.cityCode || ''
    this.checkInDate = options.checkInDate || ''
    this.checkOutDate = options.checkOutDate || ''
    this.roomInfo = JSON.parse(decodeURIComponent(options.roomInfo || '{}'))
    this.loadHotelDetail()
  },
  methods: {
    formatPrice(price) {
      if (!price) return '0.00'
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      return numPrice.toFixed(2)
    },
    getRoomImage() {
      if (this.roomInfo.images && this.roomInfo.images.length > 0) {
        return this.roomInfo.images[0].url || this.roomInfo.images[0]
      }
      return '/static/images/default_room.png'
    },
    async loadHotelDetail() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await hotelDetail({
          hotel_code: this.hotelCode,
          city_code: this.cityCode,
          check_in_date: this.checkInDate,
          check_out_date: this.checkOutDate
        })
        if (res.code === 1 && res.data) {
          this.hotelAmenities = res.data.hotelAmenities || []
          const currentRoom = res.data.rooms?.find(room => room.roomCode === this.roomCode)
          if (currentRoom) {
            this.roomFacilities = currentRoom.roomFacilities || []
          }
        }
      } catch (e) {
        console.error('加载设施信息失败:', e)
      } finally {
        this.loading = false
      }
    },
    toggleFacilities() {
      this.showFacilities = !this.showFacilities
    },
    bookRoom() {
      uni.navigateTo({
        url: `/bundle/pages/hotel/order-create?hotelCode=${this.hotelCode}&roomCode=${this.roomCode}&checkInDate=${this.checkInDate}&checkOutDate=${this.checkOutDate}`
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #1E1F34;
  padding-bottom: 200rpx;
}

.room-header-image {
  width: 100%;
  height: 500rpx;
}

.header-img {
  width: 100%;
  height: 100%;
}

.amenities-icons {
  display: flex;
  justify-content: space-around;
  padding: 40rpx 30rpx;
  background: #1E1F34;
}

.amenity-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.amenity-icon {
  width: 60rpx;
  height: 60rpx;
}

.amenity-item text {
  font-size: 24rpx;
  color: #fff;
}

.separator-line {
  height: 1rpx;
  background: #E4E3E3;
  margin: 0 30rpx;
}

.room-specs-section {
  padding: 30rpx 30rpx 0rpx;
  background: #1E1F34;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
  color: #fff;
  font-size: 26rpx;
}

.spec-icon {
  width: 40rpx;
  height: 40rpx;
}

.facilities-section,
.benefits-section,
.policy-section {
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-top: 0rpx;
}

.arrow {
  color: #fff;
  font-size: 24rpx;
}

.facilities-content,
.policy-content {
  color: #E4E3E3;
  font-size: 26rpx;
  line-height: 1.6;
}

.facility-group {
  margin-bottom: 30rpx;
}

.facility-group:last-child {
  margin-bottom: 0;
}

.facility-group-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #F4BE66;
  margin-bottom: 16rpx;
  display: block;
}

.facility-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.facility-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #E4E3E3;
}

.no-facilities {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 40rpx 0;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
  color: #E4E3E3;
  font-size: 26rpx;
}

.benefit-icon {
  width: 40rpx;
  height: 40rpx;
}

.booking-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1E1F34;
  padding: 20rpx 30rpx 30rpx; 
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.3);
}

.price-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.price-line {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.price-line .label {
  font-size: 22rpx;
  color: #999;
}

.price-line .value {
  font-size: 24rpx;
  color: #fff;
}

/* 高亮样式（渐变）- 根据用户等级对应的价格类型 */
.price-line.highlight .label {
  color: #F3BC63;
  font-weight: 700;
}

.price-line.highlight .value {
  background: linear-gradient(90deg, #F3BC63 0%, #FDE3B1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 26rpx;
}

.highlight-label {
  color: #F3BC63;
  font-weight: 700;
}

.highlight-value {
  background: linear-gradient(90deg, #F3BC63 0%, #FDE3B1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 26rpx;
}

.book-btn {
  background: linear-gradient(107.61deg, #F3BD65 4.52%, #FEE3B1 100%);
  color: #380C00;
  padding: 0rpx 60rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;

}
</style>

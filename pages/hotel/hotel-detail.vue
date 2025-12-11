<template>
  <view class="page">
    <!-- 头部导航 -->
    <view class="header">
      <view class="nav-bar">
        <text class="back" @click="goBack">‹</text>
        <text class="title">{{ detail.hotelName || '酒店名称' }}</text>
        <view class="actions">
          <text class="icon">⋯</text>
          <text class="icon">○</text>
        </view>
      </view>
      
      <!-- 预订信息栏 -->
      <view class="booking-info">
        <text class="date">{{ formatDateShort(checkInDate) }}</text>
        <view class="night-badge">{{ nightCount }}晚</view>
        <text class="date">{{ formatDateShort(checkOutDate) }}</text>
        <text class="separator">|</text>
        <text class="guest">{{ adultCount }}成人・{{ childCount }}儿童</text>
      </view>
      
      <!-- 筛选栏 -->
      <view class="filter-tabs">
        <view 
          v-for="(filter, index) in filterOptions" 
          :key="index"
          :class="['filter-tab', { active: activeFilters.includes(filter.value) }]"
          @click="toggleFilter(filter.value)"
        >
          {{ filter.label }}
        </view>
        <view class="filter-icon" @click="showAdvancedFilter">
          <text>筛选</text>
        </view>
      </view>
    </view>

    <!-- 房间列表 -->
    <scroll-view scroll-y class="room-list" @scrolltolower="loadMore">
      <view 
        v-for="room in filteredRooms" 
        :key="room.roomCode" 
        class="room-card"
        @click="selectRoom(room)"
      >
        <image 
          :src="getRoomImage(room)" 
          class="room-image" 
          mode="aspectFill" 
        />
        <view class="room-content">
          <view class="room-header">
            <text
              class="room-type"
              @click.stop="goOrder(room.roomCode)"
            >
              {{ room.roomName || '大床房' }}
            </text>
            <view v-if="hasBreakfast(room)" class="breakfast-badge">有早餐</view>
          </view>
          
          <view class="room-specs">
            <text v-if="room.area">{{ room.area }}</text>
            <text v-if="room.bedInfo">{{ room.bedInfo }}</text>
            <text v-if="room.capacity">{{ room.capacity }}人</text>
          </view>
          
          <view v-if="room.windowInfo" class="window-info">{{ room.windowInfo }}</view>
          
          <view v-if="room.cancelPolicy" class="cancel-policy">{{ room.cancelPolicy }}</view>
          
          <view class="price-section">
            <view class="price-item">
              <text class="price-label">挂牌价</text>
              <text class="price-value">¥{{ formatPrice(room.list_price || room.amountPrice) }}起</text>
            </view>
            <view class="price-item vip">
              <text class="price-label">尊享价</text>
              <text class="price-value">¥{{ formatPrice(room.vip_price || room.amountPrice) }}起</text>
            </view>
            <view class="price-item share">
              <text class="price-label">股东价</text>
              <text class="price-value">¥{{ formatPrice(room.share_price || room.amountPrice) }}起</text>
            </view>
          </view>
          
          <button class="book-btn" @click.stop="bookRoom(room.roomCode)">订</button>
        </view>
      </view>
      
      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="noMore && filteredRooms.length > 0" class="no-more">没有更多了</view>
      <view v-if="!loading && filteredRooms.length === 0" class="empty">暂无房间</view>
    </scroll-view>
  </view>
</template>

<script>
import { hotelDetail } from '@/api/hotel.js'

export default {
  data() {
    return {
      hotelCode: '',
      cityCode: '',
      checkInDate: '',
      checkOutDate: '',
      adultCount: 1,
      childCount: 0,
      detail: {},
      rooms: [],
      loading: false,
      noMore: false,
      activeFilters: [],
      filterOptions: [
        { label: '双床房', value: 'twin' },
        { label: '大床房', value: 'king' },
        { label: '亲子主题', value: 'family' },
        { label: '含早餐', value: 'breakfast' }
      ]
    }
  },
  computed: {
    nightCount() {
      if (!this.checkInDate || !this.checkOutDate) return 1
      const start = new Date(this.checkInDate)
      const end = new Date(this.checkOutDate)
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      return diff > 0 ? diff : 1
    },
    filteredRooms() {
      if (this.activeFilters.length === 0) {
        return this.rooms
      }
      
      return this.rooms.filter(room => {
        // 床型筛选
        if (this.activeFilters.includes('twin')) {
          if (!room.roomName || !room.roomName.includes('双床') && !room.roomName.includes('双人')) {
            return false
          }
        }
        if (this.activeFilters.includes('king')) {
          if (!room.roomName || !room.roomName.includes('大床') && !room.roomName.includes('单人')) {
            return false
          }
        }
        
        // 亲子主题筛选
        if (this.activeFilters.includes('family')) {
          if (!room.roomName || !room.roomName.includes('亲子')) {
            return false
          }
        }
        
        // 早餐筛选
        if (this.activeFilters.includes('breakfast')) {
          if (!this.hasBreakfast(room)) {
            return false
          }
        }
        
        return true
      })
    }
  },
  onLoad(options) {
    this.hotelCode = options.hotelCode || ''
    this.cityCode = options.cityCode || ''
    this.checkInDate = options.checkInDate || this.formatDate(new Date())
    this.checkOutDate = options.checkOutDate || this.formatDate(new Date(Date.now() + 86400000))
    this.adultCount = parseInt(options.adultCount || 1)
    this.childCount = parseInt(options.childCount || 0)
    this.loadDetail()
  },
  methods: {
    formatDate(date) {
      if (typeof date === 'string') return date
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    formatDateShort(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${m}-${d}`
    },
    formatPrice(price) {
      if (!price) return '0.00'
      // 如果价格是分，需要除以100
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      return (numPrice > 1000 ? numPrice / 100 : numPrice).toFixed(2)
    },
    async loadDetail() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await hotelDetail({
          hotel_code: this.hotelCode,
          city_code: this.cityCode,
          check_in_date: this.checkInDate,
          check_out_date: this.checkOutDate,
          adult_count: this.adultCount,
          child_count: this.childCount
        })
        if (res.code === 1) {
          this.detail = res.data || {}
          this.rooms = this.detail.rooms || []
          
          // 处理房间数据，提取床型等信息
          this.rooms = this.rooms.map(room => {
            // 解析房间描述，提取面积、床型、人数等信息
            const desc = room.roomDesc || room.description || ''
            const areaMatch = desc.match(/(\d+(?:\.\d+)?)\s*m²|(\d+(?:\.\d+)?)\s*平米|(\d+(?:\.\d+)?)\s*平方米/)
            const bedMatch = desc.match(/(\d+)\s*张\s*(\d+(?:\.\d+)?)\s*m\s*(大床|双床|单人床)/)
            const capacityMatch = desc.match(/(\d+)\s*人/)
            
            return {
              ...room,
              area: areaMatch ? `${areaMatch[1] || areaMatch[2] || areaMatch[3]}m²` : '',
              bedInfo: bedMatch ? `${bedMatch[1]}张${bedMatch[2]}m${bedMatch[3]}` : '',
              capacity: capacityMatch ? capacityMatch[1] : (room.capacity || '2'),
              windowInfo: room.windowInfo || '窗户位于走廊或过道',
              cancelPolicy: room.cancelPolicy || '入住当天18:00前可免费取消'
            }
          })
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    getRoomImage(room) {
      if (room.images && room.images.length > 0) {
        return Array.isArray(room.images[0]) ? room.images[0].url : room.images[0]
      }
      if (this.detail.images && this.detail.images.length > 0) {
        return this.detail.images[0].url || this.detail.images[0]
      }
      return '/static/images/default_hotel.png'
    },
    hasBreakfast(room) {
      const desc = (room.roomDesc || room.description || '').toLowerCase()
      const name = (room.roomName || '').toLowerCase()
      return desc.includes('早餐') || desc.includes('breakfast') || name.includes('含早')
    },
    toggleFilter(value) {
      const index = this.activeFilters.indexOf(value)
      if (index > -1) {
        this.activeFilters.splice(index, 1)
      } else {
        this.activeFilters.push(value)
      }
    },
    showAdvancedFilter() {
      uni.showToast({ title: '高级筛选功能待实现', icon: 'none' })
    },
    selectRoom(room) {
      // 选中房间，可以高亮显示（后续可根据需要高亮）
      console.log('选中房间:', room)
    },
    goOrder(roomCode) {
      // 从房型名称或“订”按钮进入下单页
      this.bookRoom(roomCode)
    },
    bookRoom(roomCode) {
      uni.navigateTo({
        url: `/pages/hotel/order-create?hotelCode=${this.hotelCode}&roomCode=${roomCode}&checkInDate=${this.checkInDate}&checkOutDate=${this.checkOutDate}&adultCount=${this.adultCount}&childCount=${this.childCount}`
      })
    },
    loadMore() {
      // 如果接口支持分页，可以在这里加载更多
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0a1929;
  color: #fff;
}

.header {
  background: #0a1929;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  height: 88rpx;
}

.back {
  font-size: 48rpx;
  color: #fff;
  width: 60rpx;
  text-align: left;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 20rpx;
  width: 60rpx;
  justify-content: flex-end;
}

.icon {
  font-size: 32rpx;
  color: #fff;
}

.booking-info {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  font-size: 28rpx;
  gap: 10rpx;
}

.date {
  color: #fff;
}

.night-badge {
  background: #1a3a5a;
  color: #ff9500;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.separator {
  margin: 0 10rpx;
  color: #666;
}

.guest {
  color: #999;
}

.filter-tabs {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  gap: 20rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.filter-tab {
  padding: 10rpx 24rpx;
  background: #1a3a5a;
  color: #fff;
  border-radius: 30rpx;
  font-size: 28rpx;
  white-space: nowrap;
}

.filter-tab.active {
  background: #ff9500;
  color: #fff;
}

.filter-icon {
  margin-left: auto;
  padding: 10rpx 20rpx;
  color: #fff;
  font-size: 28rpx;
}

.room-list {
  height: calc(100vh - 300rpx);
  padding: 20rpx;
}

.room-card {
  background: #1a3a5a;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  display: flex;
}

.room-image {
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
}

.room-content {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  position: relative;
}

.room-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 10rpx;
}

.room-type {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.breakfast-badge {
  background: #ff9500;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
}

.room-specs {
  display: flex;
  gap: 10rpx;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.window-info {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.cancel-policy {
  font-size: 24rpx;
  color: #4a9eff;
  margin-bottom: 10rpx;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  margin-bottom: 10rpx;
}

.price-item {
  display: flex;
  gap: 10rpx;
  font-size: 24rpx;
}

.price-label {
  color: #999;
}

.price-value {
  color: #fff;
}

.price-item.vip .price-value {
  color: #ff9500;
}

.price-item.share .price-value {
  color: #ff0000;
}

.book-btn {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  background: #ff9500;
  color: #fff;
  border: none;
  width: 80rpx;
  height: 60rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading, .no-more, .empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}
</style>

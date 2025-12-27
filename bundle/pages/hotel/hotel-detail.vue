<template>
  <view class="page">
    <custom-navbar title="酒店详情"></custom-navbar>
    <!-- 预订信息栏 -->
    <view class="booking-info">
      <text class="date">{{ formatDateShort(checkInDate) }}</text>
      <text class="separator">—</text>
      <text class="night-badge">共{{ nightCount }}晚</text>
      <text class="separator">—</text>
      <text class="date">{{ formatDateShort(checkOutDate) }}</text>
      <text class="separator">|</text>
      <text class="guest">{{ adultCount }}成人·{{ childCount }}儿童</text>
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
        <image src="/static/images/shaixuan-3 1.png" class="filter-img" mode="aspectFit"></image>
        <text>筛选</text>
      </view>
    </view>
    <!-- 房间列表 -->
    <scroll-view scroll-y class="room-list" @scrolltolower="loadMore">
      <view 
        v-for="room in filteredRooms" 
        :key="room.roomCode" 
        class="room-card"
        @click="goRoomDetail(room)"
      >
        <image 
          :src="getRoomImage(room)" 
          class="room-image" 
          mode="aspectFill" 
        />
        <view class="room-content">
          <view class="room-header">
            <text class="room-type">{{ room.roomName}}</text>
            <view class="breakfast-badge">{{ room.mealDesc || '无早' }}</view>
          </view>
          
          <view class="room-specs">
            <text>{{ room.bedType || '--' }}</text>
            <text>{{ room.floor || '--' }}</text>
          </view>
          
          <view class="window-info">窗户位于走廊或者过道</view>
          <view class="cancel-policy">入住当天18：00前可免费取消</view>
          
          <view class="price-section">
            <view class="price-row" :class="{ 'highlight': room.user_price_type === 'list' }">
              <text class="price-label" :class="{ 'highlight-label': room.user_price_type === 'list' }">挂牌价</text>
              <text class="price-value" :class="{ 'highlight-price': room.user_price_type === 'list' }">¥ {{ formatPrice(room.list_price) }}起</text>
            </view>
            <view class="price-row vip" :class="{ 'highlight': room.user_price_type === 'vip' }">
              <text class="price-label" :class="{ 'highlight-label': room.user_price_type === 'vip' }">尊享价</text>
              <text class="price-value" :class="{ 'highlight-price': room.user_price_type === 'vip' }">¥ {{ formatPrice(room.vip_price) }}起</text>
            </view>
            <view class="price-row share" :class="{ 'highlight': room.user_price_type === 'share' }">
              <text class="price-label" :class="{ 'highlight-label': room.user_price_type === 'share' }">股东价</text>
              <text class="price-value" :class="{ 'highlight-price': room.user_price_type === 'share' }">¥ {{ formatPrice(room.share_price) }}起</text>
            </view>
          </view>
        </view>
        
        <view class="book-btn" @click.stop="bookRoom(room.roomCode)">
          <text>订</text>
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
      if (!price && price !== 0) return '0.00'
      // 后端返回的价格已经是元为单位，直接格式化即可
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      return numPrice.toFixed(2)
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
          // 后端已经基于 settAmount 计算好了 list_price、vip_price、share_price
          // 前端直接使用这些计算好的价格即可
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
    goRoomDetail(room) {
      const roomInfo = encodeURIComponent(JSON.stringify(room))
      uni.navigateTo({
        url: `/bundle/pages/hotel/room-detail?hotelCode=${this.hotelCode}&roomCode=${room.roomCode}&cityCode=${this.cityCode}&checkInDate=${this.checkInDate}&checkOutDate=${this.checkOutDate}&roomInfo=${roomInfo}`
      })
    },
    bookRoom(roomCode) {
      // 根据 roomCode 找到当前房型的完整信息
      const room = this.rooms.find(r => r.roomCode === roomCode) || {}
      const roomInfo = encodeURIComponent(JSON.stringify(room))

      // 组装部分酒店信息，避免订单页再次请求详情
      const hotelInfo = encodeURIComponent(JSON.stringify({
        shoppingId: this.detail.shoppingId || '',
        hotelName: this.detail.hotelName || '',
        cityCode: this.cityCode || '',
        cityName: this.detail.city || this.detail.district || '',
        arriveEarlyTime: this.detail.arriveEarlyTime || '',
        arriveLastTime: this.detail.arriveLastTime || ''
      }))

      uni.navigateTo({
        url: `/bundle/pages/hotel/order-create`
          + `?hotelCode=${this.hotelCode}`
          + `&roomCode=${roomCode}`
          + `&checkInDate=${this.checkInDate}`
          + `&checkOutDate=${this.checkOutDate}`
          + `&adultCount=${this.adultCount}`
          + `&childCount=${this.childCount}`
          + `&roomInfo=${roomInfo}`
          + `&hotelInfo=${hotelInfo}`
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

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #0D1034;
  color: #fff;
  padding-top: calc(120rpx + var(--status-bar-height));
}

.booking-info {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  font-size: 26rpx;
  gap: 12rpx;
  background: #0D1034;
  color: #fff;
  
  .date {
    color: #fff;
    font-weight: 500;
  }
  
  .separator {
    color: #666;
    margin: 0 4rpx;
  }
  
  .night-badge {
    color: #fff;
    font-weight: 500;
  }
  
  .guest {
    color: #fff;
  }
}

.filter-tabs {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  gap: 16rpx;
  overflow-x: auto;
  white-space: nowrap;
  background: #0D1034;
  
  .filter-tab {
    padding: 12rpx 28rpx;
    background: #353548;
    color: #fff;
    border-radius: 10rpx;
    font-size: 26rpx;
    white-space: nowrap;
    flex-shrink: 0;
    
    &.active {
      background: linear-gradient(90deg, #F3BC62 0%, #FEE6B6 50.34%, #F3BD64 100%);
      color: #1b1f35;
      font-weight: 600;
    }
  }
  
  .filter-icon {
    margin-left: auto;
    padding: 12rpx 20rpx;
    color: #fff;
    font-size: 26rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    flex-shrink: 0;
    
    .filter-img {
      width: 28rpx;
      height: 28rpx;
    }
  }
}

.room-list {
  height: calc(100vh - 200rpx);
  padding: 20rpx 30rpx;
  box-sizing: border-box;
}

.room-card {
  background: #1E1F34;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  display: flex;
  position: relative;
  padding: 20rpx;
  gap: 20rpx;
}

.room-image {
  width: 200rpx;
  height: 280rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.room-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding-right: 100rpx;
}

.room-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  
  .room-type {
    font-size: 32rpx;
    font-weight: 700;
    color: #fff;
  }
  
  .breakfast-badge {
    background: linear-gradient(90deg, #F4BE65 0%, #FEE3B1 50.11%, #F3BD65 100%);
    color: #380C00;
    padding: 4rpx 12rpx;
    border-radius: 10rpx;
    font-size: 20rpx;
    font-weight: 600;
    white-space: nowrap;
    margin-top: -30rpx;
  }
}

.room-specs {
  display: flex;
  gap: 32rpx;
  font-size: 26rpx;
  color: #E4E3E3;
  
  text {
    position: relative;
    
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: -16rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 2rpx;
      height: 20rpx;
      background: #666;
    }
  }
}

.window-info {
  font-size: 24rpx;
  color: #B8C5D6;
}

.cancel-policy {
  font-size: 24rpx;
  color: #B8C5D6;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  margin-top: 8rpx;
}

.price-section .price-row {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  font-size: 24rpx;
}

.price-section .price-row .price-label {
  color: #B8C5D6;
  min-width: 100rpx;
}

.price-section .price-row .price-value {
  color: #fff;
  font-weight: 600;
}

/* 高亮样式（渐变）- 根据用户等级对应的价格类型 */
.price-row.highlight .price-label {
  color: #F3BC63;
  font-weight: 700;
}

.price-row.highlight .price-value {
  background: linear-gradient(90deg, #F3BC63 0%, #FDE3B1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 28rpx;
}

/* 保留原来的 vip 样式，但如果没有高亮则使用默认样式 */
.price-row.vip:not(.highlight) .price-value {
  color: #fff;
}

.price-row.share .price-value {
  color: #fff;
}

.book-btn {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(107.61deg, #F3BD65 4.52%, #FEE3B1 100%);
  color: #380C00;
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(243, 188, 98, 0.3);
}

.loading, .no-more, .empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}
</style>

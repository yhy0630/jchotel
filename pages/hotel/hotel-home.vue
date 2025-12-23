<template>
  <view class="page">
    <custom-navbar title="酒店/民宿" ></custom-navbar>
    <!-- 顶部轮播图 -->
    <view class="banner-section">
      <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500" circular>
        <swiper-item v-for="(item, index) in bannerList" :key="index">
          <image :src="item.image" mode="aspectFill" class="banner-image"></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 房型选项卡 -->
    <view class="room-tabs">
      <view 
        v-for="(tab, index) in roomTabs" 
        :key="index"
        :class="['room-tab-item', { active: currentRoomTab === index }]"
        @click="switchRoomTab(index)"
      >
        <view class="tab-content">
          <text class="tab-title">{{ tab.title }}</text>
          <text class="tab-subtitle">{{ tab.subtitle }}</text>
          <image src="/static/images/箭头组合.png.png" mode="aspectFit" class="arrow-icon" @click.stop="handleArrowClick(index)"></image>
        </view>
        <view class="tab-icon-wrapper">
          <image :src="tab.icon" mode="aspectFit" class="tab-icon"></image>
        </view>
      </view>
    </view>

    <!-- 酒店列表 -->
    <scroll-view 
      scroll-y 
      class="hotel-list-container"
      @scrolltolower="loadMore"
    >
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
              <text class="rating-score">{{ item.rating }} 超棒</text>
              <text class="rating-reviews">{{ item.reviews }}条点评</text>
            </view>
            <view class="hotel-location">
              距您直线距离{{ item.distance }}公里 近{{ item.area }}
            </view>
            <view class="hotel-desc">{{ item.desc }}</view>
            <view class="hotel-price">
              <text class="price-item">挂牌价¥{{ formatPrice(item.list_price) }}起</text>
              <text class="price-item vip">尊享价¥{{ formatPrice(item.list_price) }}起</text>
              <text class="price-item share">股东价¥{{ formatPrice(item.list_price) }}起</text>
            </view>
          </view>
        </view>
        <view v-if="loading" class="loading">加载中...</view>
        <view v-if="noMore && hotelList.length > 0" class="no-more">没有更多了</view>
        <view v-if="!loading && hotelList.length === 0" class="empty">暂无酒店数据</view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { hotelList } from '@/api/hotel.js'

export default {
  data() {
    return {
      // 轮播图
      bannerList: [
        { image: '/static/images/酒店.png' }
      ],
      
      // 房型选项卡
      roomTabs: [
        { 
          title: '尊享房', 
          subtitle: '会员专属尊享', 
          icon: '/static/images/尊享.png',
          type: '2'
        },
        { 
          title: '定制房', 
          subtitle: '私人专属定制', 
          icon: '/static/images/定制.png',
          type: '1'
        }
      ],
      currentRoomTab: 0,
      
      // 酒店列表
      hotelList: [],
      page: 1,
      loading: false,
      noMore: false,
      
      // 城市信息
      cityCode: 'C1025',
      cityName: '北京'
    }
  },
  
  onLoad(options) {
    // 接收城市参数
    if (options.city_code) {
      this.cityCode = options.city_code
    }
    if (options.city_name) {
      this.cityName = decodeURIComponent(options.city_name)
    }
    
    // 加载酒店列表
    this.loadHotelList()
  },
  
  onReachBottom() {
    this.loadMore()
  },
  
  methods: {
    // 点击箭头图标
    handleArrowClick(index) {
      // 点击尊享房的箭头，跳转到尊享房页面
      if (index === 0) {
        uni.navigateTo({
          url: '/pages/hotel/premium-room?tab=0'
        })
      }
      // 点击定制房的箭头，跳转到定制房页面并自动切换到定制房选项卡
      else if (index === 1) {
        uni.navigateTo({
          url: '/pages/hotel/premium-room?tab=1'
        })
      }
    },
    
    // 切换房型选项卡
    switchRoomTab(index) {
      if (this.currentRoomTab === index) return
      
      this.currentRoomTab = index
      
      // 重置列表
      this.page = 1
      this.hotelList = []
      this.noMore = false
      
      // 重新加载列表
      this.loadHotelList()
    },
    
    // 加载酒店列表
    async loadHotelList() {
      if (this.loading || this.noMore) return
      
      this.loading = true
      try {
        const today = new Date()
        const tomorrow = new Date(today.getTime() + 86400000)
        
        const formatDate = (date) => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }
        
        const res = await hotelList({
          city_code: this.cityCode,
          check_in_date: formatDate(today),
          check_out_date: formatDate(tomorrow),
          type: this.roomTabs[this.currentRoomTab].type,
          page: this.page,
          row: 10
        })
        
        if (res.code === 1) {
          const list = res.data.list || []
          const total = res.data.total || 0
          
          const formattedList = list.map(item => ({
            hotelCode: item.hotelCode,
            hotelName: item.hotelName,
            rating: item.commentPoint || '4.9',
            reviews: item.commentCount || '0',
            distance: item.distince || '0',
            area: item.businessarea || '--',
            desc: item.hotelIntroduce || '暂无介绍',
            image: item.hotelPic || '',
            list_price: item.listPrice || item.list_price || 0
          }))
          
          if (this.page === 1) {
            this.hotelList = formattedList
          } else {
            this.hotelList = [...this.hotelList, ...formattedList]
          }
          
          // 判断是否还有更多数据
          if (this.hotelList.length >= total || list.length === 0) {
            this.noMore = true
          } else {
            this.page++
          }
        } else {
          uni.showToast({
            title: res.msg || '加载失败',
            icon: 'none'
          })
        }
      } catch (e) {
        console.error('加载酒店列表失败:', e)
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 加载更多
    loadMore() {
      if (!this.loading && !this.noMore) {
        this.loadHotelList()
      }
    },
    
    // 格式化价格
    formatPrice(price) {
      if (!price && price !== 0) return '0'
      return parseFloat(price).toFixed(0)
    },
    
    // 跳转到酒店详情
    goHotelDetail(item) {
      uni.navigateTo({
        url: `/pages/hotel/hotel-detail?hotelCode=${item.hotelCode}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #0D1034;
  padding-top: calc(88rpx + var(--status-bar-height));
}

/* 轮播图 */
.banner-section {
  width: 100%;
  height: 400rpx;
  
  .banner-swiper {
    width: 100%;
    height: 100%;
    
    .banner-image {
      width: 100%;
      height: 100%;
    }
  }
}

/* 房型选项卡 */
.room-tabs {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
  
  .room-tab-item {
    flex: 1;
    background: #1E1F34;
    border-radius: 16rpx;
    padding: 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    
    &.active {
      background: linear-gradient(135deg, #2A2B40 0%, #1E1F34 100%);
      border: 2rpx solid #FCDDA6;
    }
    
    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      flex: 1;
      
      .tab-title {
        font-size: 32rpx;
        color: #FFFFFF;
        font-weight: 600;
      }
      
      .tab-subtitle {
        font-size: 22rpx;
        color: #B8C5D6;
      }
      
      .arrow-icon {
        width: 40rpx;
        height: 40rpx;
        margin-top: 10rpx;
      }
    }
    
    .tab-icon-wrapper {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background: linear-gradient(90deg, #F5BE65 0%, #FEE2B9 50%, #F3BD65 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      .tab-icon {
        width: 50rpx;
        height: 50rpx;
      }
    }
  }
}

/* 酒店列表容器 */
.hotel-list-container {
  height: calc(100vh - 400rpx - 180rpx);
  padding: 10rpx 20rpx 0 20rpx;
  box-sizing: border-box;
}

.hotel-list {
  .hotel-item {
    background-color: #1b1f35;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    padding: 22rpx;
    gap: 24rpx;
    border: 1rpx solid rgba(255,255,255,0.08);
    color: #f5f5f7;
    
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
      
      .hotel-name {
        font-size: 33rpx;
        font-weight: 700;
        color: #f5f5f7;
      }
      
      .hotel-rating {
        display: flex;
        align-items: center;
        gap: 14rpx;
        
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
        
        .price-item {
          font-size: 30rpx;
          color: #c8cbd9;
          font-weight: 700;
          
          &.vip {
            background: linear-gradient(90deg, #F3BC63 0%, #FDE3B1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          &.share {
            color: #c8cbd9;
          }
        }
      }
    }
  }
  
  .loading, .no-more {
    text-align: center;
    padding: 40rpx 0;
    font-size: 28rpx;
    color: #c8cbd9;
  }
  
  .empty {
    text-align: center;
    padding: 40rpx 0;
    font-size: 28rpx;
    color: #c8cbd9;
  }
}
</style>

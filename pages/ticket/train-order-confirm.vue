<template>
  <view class="page">
    <scroll-view scroll-y class="content">
      <!-- 顶部车次摘要 -->
      <view class="top-card">
        <view class="card-header">
          <view class="header-left">
            <text class="ticket-type">直达</text>
            <text class="route-text">{{ fromStationName || fromStation || '—' }}—{{ toStationName || toStation || '—' }}</text>
            <text class="date-time">{{ formatDateDisplay(departureDate) }} {{ formatTimeDisplay(depTime) }}</text>
          </view>
        </view>
        
        <view class="card-content">
          <view class="price-row">
            <text class="price-label">{{ seatName || '—' }}</text>
            <text class="price-amount">¥{{ formatPrice(ticketPrice) }}</text>
          </view>
        </view>
      </view>

      <!-- 乘客信息 -->
      <view class="info-card">
        <view class="card-title">乘客人信息</view>
        <view class="info-item">
          <text class="info-label">姓名</text>
          <text class="info-value">{{ passengerName || '—' }}</text>
        </view>
        <view class="divider-line"></view>
        <view class="info-item">
          <text class="info-label">身份证</text>
          <text class="info-value">{{ idCard || '—' }}</text>
        </view>
        <view class="divider-line"></view>
        <view class="info-item">
          <text class="info-label">手机号码</text>
          <text class="info-value">{{ mobile || '—' }}</text>
        </view>
        <view class="divider-line"></view>
        <view class="info-item">
          <text class="info-label">联系手机</text>
          <text class="info-value">{{ mobile || '—' }}</text>
        </view>
      </view>

      <!-- 优惠专区 -->
      <view class="info-card">
        <view class="card-title">优惠专区</view>
        <view class="coupon-item">
          <text class="coupon-label">代金券</text>
          <text class="coupon-value">无优惠券可用</text>
          <text class="coupon-arrow">›</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部价格栏 -->
    <view class="bottom-bar">
      <view class="price-detail">
        <view class="price-item">
          <text class="price-label">尊享价</text>
          <text class="price-dash">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</text>
          <text class="price-amount">¥{{ formatPrice(ticketPrice) }}</text>
        </view>
        <view class="price-item">
          <text class="price-label">抵扣价</text>
          <text class="price-dash">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</text>
          <text class="price-amount">¥{{ formatPrice(ticketPrice) }}</text>
        </view>
        <view class="price-item">
          <text class="price-label">股东价</text>
          <text class="price-dash">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</text>
          <text class="price-amount">¥{{ formatPrice(ticketPrice) }}</text>
        </view>
      </view>
      <view class="action-row">
        <view class="total-price">
          <text class="total-symbol">¥</text>
          <text class="total-amount">{{ formatPrice(totalAmount).split('.')[0] }}</text>
        </view>
        <text class="detail-text">明细 ∨</text>
        <button class="pay-btn" @click="goPay">立即预订</button>
      </view>
    </view>
  </view>
</template>

<script>
import { createOrder as createTrainOrder } from '@/api/train.js'

export default {
  data() {
    return {
      trainNo: '',
      departureDate: '',
      fromStation: '',
      toStation: '',
      fromStationName: '',
      toStationName: '',
      depTime: '',
      arrTime: '',
      spanTime: '',
      startStation: '',
      endStation: '',
      seatCode: '',
      seatName: '',
      ticketPrice: 0,
      totalAmount: 0,
      passengerName: '',
      idCard: '',
      mobile: ''
    }
  },
  onLoad(options) {
    this.trainNo = decodeURIComponent(options.train_no || '')
    this.departureDate = decodeURIComponent(options.departure_date || '')
    this.fromStation = decodeURIComponent(options.from_station || '')
    this.toStation = decodeURIComponent(options.to_station || '')
    this.fromStationName = decodeURIComponent(options.from_station_name || '')
    this.toStationName = decodeURIComponent(options.to_station_name || '')
    this.depTime = decodeURIComponent(options.dep_time || '')
    this.arrTime = decodeURIComponent(options.arr_time || '')
    this.spanTime = decodeURIComponent(options.span_time || '')
    this.startStation = decodeURIComponent(options.start_station || '')
    this.endStation = decodeURIComponent(options.end_station || '')
    this.seatCode = decodeURIComponent(options.seat_code || '')
    this.seatName = decodeURIComponent(options.seat_name || '')
    this.ticketPrice = parseFloat(options.ticket_price || 0) || 0
    this.totalAmount = parseFloat(options.total_amount || this.ticketPrice) || 0
    this.passengerName = decodeURIComponent(options.passenger_name || '')
    this.idCard = decodeURIComponent(options.id_card || '')
    this.mobile = decodeURIComponent(options.mobile || '')
  },
  methods: {
    formatPrice(val) {
      const num = typeof val === 'number' ? val : parseFloat(val)
      return (isNaN(num) ? 0 : num).toFixed(2)
    },
    formatTimeDisplay(time) {
      if (!time) return '—'
      if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) return time
      if (typeof time === 'number' || /^\d+$/.test(time)) {
        const d = new Date(parseInt(time))
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      }
      if (typeof time === 'string' && time.length >= 16) return time.substr(11, 5)
      return time
    },
    formatDateDisplay(dateStr) {
      if (!dateStr) return '—'
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const d = new Date(dateStr)
        const m = d.getMonth() + 1
        const day = d.getDate()
        return `${m}月${day}日`
      }
      return dateStr
    },
    formatWeekday(dateStr) {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return weekDays[d.getDay()]
    },
    goPay() {
      const orderData = {
        train_no: this.trainNo,
        departure_date: this.departureDate,
        from_station: this.fromStation,
        to_station: this.toStation,
        from_station_name: this.fromStationName,
        to_station_name: this.toStationName,
        dep_time: this.depTime,
        arr_time: this.arrTime,
        span_time: this.spanTime,
        start_station: this.startStation,
        end_station: this.endStation,
        seat_code: this.seatCode,
        seat_name: this.seatName,
        ticket_price: this.ticketPrice,
        display_price: this.ticketPrice,
        total_amount: this.totalAmount,
        price_type: 2,
        price_type_text: '尊享价',
        passenger_name: this.passengerName,
        id_card: this.idCard,
        mobile: this.mobile
      }

      createTrainOrder(orderData)
        .then(res => {
          if (res.code === 1 && res.data && res.data.order_id) {
            const params = {
              from: 'train',
              order_id: res.data.order_id,
              amount: this.totalAmount
            }
            const qs = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&')
            uni.redirectTo({
              url: `/pages/payment/payment?${qs}`,
              fail: err => {
                console.error('跳转支付页面失败', err)
                uni.showToast({ title: '跳转支付失败，请重试', icon: 'none' })
              }
            })
          } else {
            uni.showToast({ title: res.msg || '创建订单失败', icon: 'none' })
          }
        })
        .catch(err => {
          console.error('创建火车票订单失败', err)
          uni.showToast({ title: err.message || '创建订单失败', icon: 'none' })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #0D1034;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 0 0 280rpx 0;
}

.top-card {
  background: #4E474C;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 15rpx;
      flex: 1;
      
      .ticket-type {
        font-size: 28rpx;
        color: #FFE3BB;
      }
      
      .route-text {
        font-size: 28rpx;
        color: #FFE3BB;
      }
      
      .date-time {
        font-size: 28rpx;
        color: #FFE3BB;
      }
    }
  }
  
  .card-content {
    .price-row {
      display: flex;
      align-items: center;
      gap: 10rpx;
      
      .price-label {
        font-size: 28rpx;
        color: #FFE3BB;
      }
      
      .price-amount {
        font-size: 32rpx;
        color: #FFE3BB;
      }
    }
  }
}

.info-card {
  background: #1E1F34;
  margin: 20rpx;
  padding: 40rpx 30rpx;
  border-radius: 15rpx;
  
  .card-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 30rpx;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 0;
    
    .info-label {
      font-size: 28rpx;
      color: #fff;
    }
    
    .info-value {
      font-size: 28rpx;
      color: #fff;
    }
  }
  
  .divider-line {
    height: 1rpx;
    background: #4A4A5E;
  }
  
  .coupon-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    
    .coupon-label {
      font-size: 28rpx;
      color: #fff;
      margin-right: 40rpx;
    }
    
    .coupon-value {
      flex: 1;
      font-size: 28rpx;
      color: #999;
    }
    
    .coupon-arrow {
      font-size: 36rpx;
      color: #fff;
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1E1F34;
  padding: 20rpx 20rpx 50rpx 20rpx;
  
  .price-detail {
    margin-bottom: 20rpx;
    
    .price-item {
      display: flex;
      align-items: center;
      margin-bottom: 10rpx;
      
      .price-label {
        font-size: 24rpx;
        color: #D4B896;
        min-width: 100rpx;
      }
      
      .price-dash {
        flex: 1;
        font-size: 20rpx;
        color: #4A4A5E;
        overflow: hidden;
        white-space: nowrap;
        margin: 0 10rpx;
      }
      
      .price-amount {
        font-size: 24rpx;
        color: #D4B896;
      }
    }
  }
  
  .action-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
    
    .total-price {
      display: flex;
      align-items: baseline;
      
      .total-symbol {
        font-size: 28rpx;
        color: #FFE3BB;
      }
      
      .total-amount {
        font-size: 48rpx;
        font-weight: bold;
        color: #FFE3BB;
      }
    }
    
    .detail-text {
      font-size: 28rpx;
      color: #fff;
      margin-right: auto;
    }
    
    .pay-btn {
      background: linear-gradient(90deg, #F4BD65 0%, #FEE3B0 49.83%, #F3BD65 100%);
      color: #000;
      font-size: 28rpx;
      padding: 0rpx 50rpx;
      border-radius: 18rpx;
      border: none;
      
      &::after {
        border: none;
      }
    }
  }
}
</style>


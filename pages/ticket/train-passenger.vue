<template>
  <view class="page">
    <custom-navbar title="添加信息"></custom-navbar>
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
      <view class="section-card passenger-card card-margin">
        <view class="section-title">乘客信息</view>
        
        <view class="form-group">
          <view class="form-label-row">
            <text class="form-label">姓名</text>
            <text class="form-tip">与乘车证件一致</text>
          </view>
          <input
            class="form-input"
            v-model="passengerName"
            placeholder="请输入乘客姓名"
            placeholder-class="input-placeholder"
          />
        </view>
        
        <view class="form-group">
          <view class="form-label-row">
            <text class="form-label">身份证</text>
          </view>
          <input
            class="form-input"
            v-model="idCard"
            placeholder="请输入证件号码"
            placeholder-class="input-placeholder"
            maxlength="18"
          />
        </view>
        
        <view class="form-group">
          <view class="form-label-row">
            <text class="form-label">手机号码</text>
            <text class="form-tip">用于接收车次信息</text>
          </view>
          <input
            class="form-input"
            v-model="mobile"
            type="number"
            placeholder="请输入手机号码"
            placeholder-class="input-placeholder"
            maxlength="11"
          />
        </view>
      </view>

      <!-- 优惠专区 -->
      <view class="section-card coupon-card card-margin">
        <view class="section-title">优惠专区</view>
        <view class="coupon-row">
          <text class="coupon-label">代金券</text>
          <text class="coupon-value">无优惠券可用</text>
          <text class="coupon-arrow">›</text>
        </view>
      </view>

      <!-- 价格明细 -->
      <view class="section-card price-card card-margin">
        <view class="section-title">价格明细</view>
        <view class="price-row">
          <text class="label">票面价</text>
          <text class="value">¥{{ formatPrice(ticketPrice) }}</text>
        </view>
        <view class="price-row total">
          <text class="label">本单您需支付</text>
          <text class="value total">¥{{ formatPrice(totalAmount) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <text class="bottom-tip">请先添加乘客</text>
      <button class="next-btn" :disabled="!canSubmit" @click="submit">
        下一步
      </button>
    </view>
  </view>
</template>

<script>
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
      passengerName: '',
      idCard: '',
      mobile: ''
    }
  },
  computed: {
    totalAmount() {
      return this.ticketPrice
    },
    canSubmit() {
      return (
        this.passengerName &&
        this.validateIdCard(this.idCard) &&
        this.validateMobile(this.mobile)
      )
    }
  },
  onLoad(options) {
    this.trainNo = decodeURIComponent(options.train_no || '')
    this.departureDate = decodeURIComponent(options.departure_date || '')
    this.fromStation = decodeURIComponent(options.from_station || '')
    this.toStation = decodeURIComponent(options.to_station || '')
    this.fromStationName = decodeURIComponent(options.from_station_name || '')
    this.toStationName = decodeURIComponent(options.to_station_name || '')
    this.depTime = decodeURIComponent(options.from_time || options.dep_time || '')
    this.arrTime = decodeURIComponent(options.to_time || options.arr_time || '')
    this.spanTime = decodeURIComponent(options.span_time || options.used_minutes || '')
    this.startStation = decodeURIComponent(options.start_station || '')
    this.endStation = decodeURIComponent(options.end_station || '')
    this.seatCode = decodeURIComponent(options.seat_code || '')
    this.seatName = decodeURIComponent(options.seat_name || '')
    const price = parseFloat(options.display_price || options.price || 0)
    this.ticketPrice = isNaN(price) ? 0 : price
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
    validateIdCard(id) {
      const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
      return reg.test(id)
    },
    validateMobile(m) {
      const reg = /^1[3-9]\d{9}$/
      return reg.test(m)
    },
    submit() {
      if (!this.canSubmit) {
        uni.showToast({ title: '请完善乘客信息', icon: 'none' })
        return
      }
      const params = {
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
        total_amount: this.totalAmount,
        passenger_name: this.passengerName,
        id_card: this.idCard,
        mobile: this.mobile
      }
      const qs = Object.keys(params)
        .map(k => `${k}=${encodeURIComponent(params[k] ?? '')}`)
        .join('&')
      uni.navigateTo({
        url: `/pages/ticket/train-order-confirm?${qs}`,
        fail: err => {
          console.error('跳转失败', err)
          uni.showToast({ title: '跳转失败，请重试', icon: 'none' })
        }
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
  padding-top: calc(130rpx + var(--status-bar-height));
}

.content {
  flex: 1;
  padding-bottom: 120rpx;
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

.section-card {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 15rpx;
  
  &.card-margin {
    margin-left: 20rpx;
    margin-right: 20rpx;
  }
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
  }
  
  &.passenger-card {
    background: #1E1F34;
    padding: 40rpx 30rpx;
    
    .section-title {
      font-size: 36rpx;
      color: #fff;
      margin-bottom: 40rpx;
    }
    
    .form-group {
      margin-bottom: 40rpx;
      
      .form-label-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;
        
        .form-label {
          font-size: 28rpx;
          color: #fff;
        }
        
        .form-tip {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .form-input {
        width: 100%;
        height: 80rpx;
        background: transparent;
        border: none;
        border-bottom: 1px solid #4A4A5E;
        font-size: 28rpx;
        color: #fff;
        padding: 0;
      }
      
      .input-placeholder {
        color: #666;
      }
    }
  }
  
  &.coupon-card {
    background: #1E1F34;
    padding: 40rpx 30rpx;
    
    .section-title {
      font-size: 36rpx;
      color: #fff;
      margin-bottom: 30rpx;
    }
    
    .coupon-row {
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
  
  &.price-card {
    background: #1E1F34;
    padding: 40rpx 30rpx;
    
    .section-title {
      font-size: 36rpx;
      color: #fff;
      margin-bottom: 30rpx;
    }
    
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      
      .label {
        font-size: 28rpx;
        color: #fff;
      }
      
      .value {
        font-size: 28rpx;
        color: #fff;
        
        &.total {
          background: linear-gradient(90deg, #F3BC63 0%, #FFE6B6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
      
      &.total {
        border-top: 1px solid #4A4A5E;
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1E1F34;
  padding: 12rpx 30rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  
  .bottom-tip {
    font-size: 28rpx;
    color: #fff;
  }
  
  .next-btn {
    background: linear-gradient(90deg, #F4BD67 0%, #FEE1AD 50.09%, #F3BD66 100%);
    color: #000;
    font-size: 28rpx;
    padding: 0rpx 40rpx;
    border-radius: 48rpx;
    border: none;
    
    &::after {
      border: none;
    }
    
    &[disabled] {
      opacity: 0.6;
    }
  }
}
</style>


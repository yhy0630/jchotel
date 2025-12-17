<template>
  <view class="page">
    <scroll-view scroll-y class="content">
      <view class="card top">
        <view class="title">车次信息</view>
        <view class="row">
          <text class="train-no">{{ trainNo || '—' }}</text>
          <text class="seat">{{ seatName || '—' }}</text>
        </view>
        <view class="row stations">
          <view class="block">
            <text class="time">{{ formatTimeDisplay(depTime) }}</text>
            <text class="station">{{ fromStationName || fromStation || '—' }}</text>
          </view>
          <text class="arrow">→</text>
          <view class="block">
            <text class="time">{{ formatTimeDisplay(arrTime) }}</text>
            <text class="station">{{ toStationName || toStation || '—' }}</text>
          </view>
        </view>
        <view class="date-row">
          <text>{{ formatDateDisplay(departureDate) }}</text>
          <text v-if="spanTime" class="duration">{{ spanTime }}</text>
        </view>
      </view>

      <view class="card">
        <view class="title">乘客信息</view>
        <view class="form-item">
          <text class="label">姓名*</text>
          <input class="input" v-model="passengerName" placeholder="请输入乘客姓名" />
        </view>
        <view class="form-item">
          <text class="label">身份证号*</text>
          <input class="input" v-model="idCard" maxlength="18" placeholder="请输入身份证号" />
        </view>
        <view class="form-item">
          <text class="label">手机号*</text>
          <input class="input" v-model="mobile" type="number" maxlength="11" placeholder="请输入手机号" />
        </view>
      </view>

      <view class="card">
        <view class="title">价格明细</view>
        <view class="price-row">
          <text>票面价</text>
          <text>¥{{ formatPrice(ticketPrice) }}</text>
        </view>
        <view class="price-row total">
          <text>需支付</text>
          <text class="highlight">¥{{ formatPrice(totalAmount) }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="bottom-price">
        <text class="label">需支付</text>
        <text class="value">¥{{ formatPrice(totalAmount) }}</text>
      </view>
      <button class="submit" :disabled="!canSubmit" @click="submit">立即预订</button>
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
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}
.content {
  flex: 1;
  padding-bottom: 140rpx;
}
.card {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  .title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 20rpx;
  }
}
.top .row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
  .train-no {
    font-size: 40rpx;
    font-weight: 700;
    color: #1a4a8f;
  }
  .seat {
    font-size: 26rpx;
    color: #666;
  }
}
.stations {
  align-items: center;
  .block {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    .time {
      font-size: 34rpx;
      font-weight: 700;
    }
    .station {
      font-size: 26rpx;
      color: #666;
    }
  }
  .arrow {
    width: 80rpx;
    text-align: center;
    color: #999;
  }
}
.date-row {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #666;
  display: flex;
  gap: 12rpx;
}
.duration {
  color: #999;
}
.form-item {
  display: flex;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 1px solid #f0f0f0;
  &:last-child {
    border-bottom: none;
  }
  .label {
    width: 160rpx;
    font-size: 28rpx;
    color: #333;
  }
  .input {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }
}
.price-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  font-size: 28rpx;
  color: #333;
  &.total {
    border-top: 1px solid #f0f0f0;
    margin-top: 10rpx;
    padding-top: 20rpx;
  }
  .highlight {
    color: #ff7a00;
    font-weight: 700;
  }
}
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #e0e0e0;
  .bottom-price {
    flex: 1;
    display: flex;
    align-items: baseline;
    gap: 10rpx;
    .label {
      font-size: 26rpx;
      color: #666;
    }
    .value {
      font-size: 36rpx;
      font-weight: 700;
      color: #ff7a00;
    }
  }
  .submit {
    background: linear-gradient(90deg, #ffc966, #f8d07c);
    color: #1a4a8f;
    font-size: 32rpx;
    font-weight: 600;
    padding: 20rpx 60rpx;
    border-radius: 50rpx;
    border: none;
    &[disabled] {
      opacity: 0.6;
    }
  }
}
</style>


<template>
  <view class="page">
    <scroll-view scroll-y class="content">
      <!-- 顶部航班/车次摘要 -->
      <view class="top-card">
        <view class="ticket-type">{{ ticketType === 'flight' ? '航班信息' : '车次信息' }}</view>
        <view v-if="ticketType === 'flight'" class="flight-brief">
          <text class="flight-no">{{ flightInfo.flightNo || 'CA1234' }}</text>
          <text class="airline">{{ flightInfo.airlineName || '中国国航' }}</text>
        </view>
        <view v-else class="train-brief">
          <text class="train-no">{{ trainInfo.trainNo || 'G123' }}</text>
          <text class="train-type">{{ trainInfo.trainType || '高铁' }}</text>
        </view>
        <view class="route-brief">
          <text class="departure">{{ flightInfo.departureCity || trainInfo.departureStation || '北京' }}</text>
          <text class="arrow">→</text>
          <text class="arrival">{{ flightInfo.arrivalCity || trainInfo.arrivalStation || '上海' }}</text>
        </view>
		
		{{ flightInfo.arrivalTime}}
		
        <view class="date-brief">
          <text>{{ formatDateDisplay(departureDate) }}</text>
          <text v-if="ticketType === 'flight'" class="time">{{ formatTimeDisplay(flightInfo.departureTime) }} - {{ formatTimeDisplay(flightInfo.arrivalTime) }}</text>
          <text v-else class="time">{{ formatTimeDisplay(trainInfo.departureTime) }} - {{ formatTimeDisplay(trainInfo.arrivalTime) }}</text>
        </view>
      </view>

      <!-- 乘客信息 -->
      <view class="section-card">
        <view class="section-title">乘客信息</view>
        <view class="form-item">
          <text class="label">乘客姓名*</text>
          <input
            class="input"
            v-model="passengerName"
            placeholder="请输入乘客姓名"
          />
        </view>
        <view class="form-item">
          <text class="label">身份证号*</text>
          <input
            class="input"
            v-model="idCard"
            placeholder="请输入身份证号"
            maxlength="18"
          />
        </view>
        <view class="form-item">
          <text class="label">联系电话*</text>
          <input
            class="input"
            v-model="mobile"
            type="number"
            placeholder="请输入手机号码"
            maxlength="11"
          />
        </view>
        <view v-if="ticketType === 'flight'" class="form-item">
          <text class="label">舱位等级</text>
          <text class="readonly">{{ cabinClassText }}</text>
        </view>
        <view v-else class="form-item">
          <text class="label">座位类型</text>
          <text class="readonly">{{ seatTypeText }}</text>
        </view>
      </view>

      <!-- 价格明细 -->
      <view class="section-card">
        <view class="section-title">价格明细</view>
        <view class="price-row">
          <text class="label">票面价</text>
          <text class="value">¥{{ formatPrice(ticketPrice) }}</text>
        </view>
        <view class="price-row">
          <text class="label">机建费</text>
          <text class="value">¥{{ formatPrice(airportTax) }}</text>
        </view>
        <view class="price-row">
          <text class="label">燃油费</text>
          <text class="value">¥{{ formatPrice(fuelTax) }}</text>
        </view>
        <view class="price-row">
          <text class="label sub">{{ priceTypeText }}</text>
          <text class="value highlight">¥{{ formatPrice(displayPrice) }}</text>
        </view>
        <view class="price-row total">
          <text class="label">本单您需支付</text>
          <text class="value total">¥{{ formatPrice(totalAmount) }}</text>
        </view>
      </view>

      <!-- 退改政策 -->
      <view class="section-card">
        <view class="section-title">退改政策</view>
        <view class="section-text">
          {{ ticketType === 'flight' ? '根据航空公司规定，退改政策以实际出票时为准。' : '根据铁路部门规定，退改政策以实际出票时为准。' }}
        </view>
      </view>

      <!-- 购票提示 -->
      <view class="section-card">
        <view class="section-title">购票提示</view>
        <view class="section-text">
          请确保乘客信息真实有效，身份证号将用于实名制购票。请在预订后及时完成支付。
        </view>
      </view>
    </scroll-view>

    <!-- 底部价格栏 -->
      <view class="bottom-bar">
      <view class="bottom-price">
        <text class="price-label">需支付</text>
        <text class="price-value">¥{{ formatPrice(totalAmount) }}</text>
      </view>
      <button class="submit-btn" :disabled="submitting || !canSubmit" @click="submitOrder">
        {{ submitting ? '提交中...' : '立即预订' }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      ticketType: 'flight', // flight-飞机票, train-火车票
      flightNo: '',
      trainNo: '',
      departureDate: '',
      ticketPrice: 0,      // 票面价
      airportTax: 0,       // 机建费
      fuelTax: 0,          // 燃油费
      displayPrice: 0,     // 显示价格（会员价）
      originalPrice: 0,    // 原价（票面价+机建+燃油）
      priceType: 2,
      priceTypeText: '尊享价',
      seatCode: '',
      seatName: '',
      priceId: '',
      policyId: '',
      routeId: '',
      depAirport: '',
      arrAirport: '',
      depCity: '',
      arrCity: '',
      airlineName: '',
      depTime: '',
      arrTime: '',
      
      // 航班信息（从列表页传递或查询）
      flightInfo: {
        flightNo: '',
        airlineName: '',
        departureCity: '',
        arrivalCity: '',
        departureTime: '',
        arrivalTime: ''
      },
      
      // 车次信息（从列表页传递或查询）
      trainInfo: {
        trainNo: '',
        trainType: '',
        departureStation: '',
        arrivalStation: '',
        departureTime: '',
        arrivalTime: ''
      },
      
      // 乘客信息
      passengerName: '',
      idCard: '',
      mobile: '',
      cabinClass: 'Y',
      seatType: 'second',
      
      submitting: false
    }
  },
  computed: {
    totalAmount() {
      // 总价 = 显示价格（会员价）+ 机建费 + 燃油费
      return this.displayPrice + this.airportTax + this.fuelTax
    },
    cabinClassText() {
      const map = {
        'Y': '经济舱',
        'C': '公务/头等舱'
      }
      return map[this.cabinClass] || '经济舱'
    },
    seatTypeText() {
      const map = {
        'first': '一等座',
        'second': '二等座',
        'no_seat': '站票'
      }
      return map[this.seatType] || '二等座'
    },
    canSubmit() {
      return this.passengerName && this.idCard && this.mobile && 
             this.idCard.length >= 15 && this.mobile.length === 11
    }
  },
  onLoad(options) {
    this.ticketType = options.type || 'flight'
    this.departureDate = decodeURIComponent(options.departure_date || '')
    
    // 解析价格
    const totalPrice = parseFloat(options.price || 0)
    const originalTotal = parseFloat(options.original_price || options.price || 0)
    
    // 火车票无机建/燃油，直接用总价；机票走精确拆分逻辑
    if ((options.type || 'flight') === 'train') {
      this.ticketPrice = totalPrice
      this.airportTax = 0
      this.fuelTax = 0
      this.displayPrice = totalPrice
      this.originalPrice = originalTotal
    } else {
      // 使用详情页透传的原始价格字段，避免“估算”导致验价失败
      const ticketPrice = parseFloat(options.ticket_price || 0)
      const airportTax = parseFloat(options.airport_tax || 0)
      const fuelTax = parseFloat(options.fuel_tax || 0)
      const displayPrice = parseFloat(options.display_price || 0)
      
      this.ticketPrice = isNaN(ticketPrice) ? 0 : ticketPrice
      this.airportTax = isNaN(airportTax) ? 0 : airportTax
      this.fuelTax = isNaN(fuelTax) ? 0 : fuelTax
      this.displayPrice = !isNaN(displayPrice)
        ? displayPrice
        : Math.max(0, totalPrice - this.airportTax - this.fuelTax)
      this.originalPrice = originalTotal > 0
        ? originalTotal
        : this.ticketPrice + this.airportTax + this.fuelTax
    }
    
    this.priceType = parseInt(options.price_type || 2)
    this.priceTypeText = decodeURIComponent(options.price_type_text || '尊享价')
    
    // 航班相关信息
    this.flightNo = options.flight_no || ''
    this.seatCode = options.seat_code || ''
    this.seatName = decodeURIComponent(options.seat_name || '')
    this.priceId = options.price_id || ''
    this.policyId = options.policy_id || ''
    this.routeId = options.route_id || ''
    this.depAirport = options.dep_airport || ''
    this.arrAirport = options.arr_airport || ''
    this.depCity = decodeURIComponent(options.dep_city || '')
    this.arrCity = decodeURIComponent(options.arr_city || '')
    this.airlineName = decodeURIComponent(options.airline_name || '')
    this.depTime = decodeURIComponent(options.dep_time || '')
    this.arrTime = decodeURIComponent(options.arr_time || '')
    
    if (this.ticketType === 'flight') {
      this.cabinClass = options.cabin_class || 'Y'
      this.flightInfo.flightNo = this.flightNo
      this.flightInfo.airlineName = this.airlineName
      this.flightInfo.departureCity = this.depCity
      this.flightInfo.arrivalCity = this.arrCity
      this.flightInfo.departureTime = this.depTime
      this.flightInfo.arrivalTime = this.arrTime
    } else {
      this.trainNo = options.train_no || ''
      this.seatType = options.seat_type || 'second'
      this.trainInfo.trainNo = this.trainNo
      this.trainInfo.departureTime = decodeURIComponent(options.dep_time || '')
      this.trainInfo.arrivalTime = decodeURIComponent(options.arr_time || '')
    }
  },
  methods: {
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      return numPrice.toFixed(2)
    },
    
    formatDateDisplay(dateStr) {
      if (!dateStr) return '—'
      // 如果是 YYYY-MM-DD 格式，转换为中文显示
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const date = new Date(dateStr)
        const month = date.getMonth() + 1
        const day = date.getDate()
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        const weekDay = weekDays[date.getDay()]
        return `${month}月${day}日 ${weekDay}`
      }
      return dateStr
    },
    
    formatTimeDisplay(time) {
      if (!time) return '—'
      // 如果已经是 HH:MM 格式，直接返回
      if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
        return time
      }
      // 如果是时间戳，转换为 HH:MM
      if (typeof time === 'number' || /^\d+$/.test(time)) {
        const date = new Date(parseInt(time))
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
      }
      // 如果是日期时间字符串，提取时间部分
      if (typeof time === 'string' && time.length >= 16) {
        return time.substr(11, 5)
      }
      return time
    },
    
    validateIdCard(idCard) {
      // 简单的身份证验证
      const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
      return reg.test(idCard)
    },
    
    validateMobile(mobile) {
      const reg = /^1[3-9]\d{9}$/
      return reg.test(mobile)
    },
    
    async submitOrder() {
      if (!this.passengerName) {
        uni.showToast({ title: '请输入乘客姓名', icon: 'none' })
        return
      }
      if (!this.idCard) {
        uni.showToast({ title: '请输入身份证号', icon: 'none' })
        return
      }
      if (!this.validateIdCard(this.idCard)) {
        uni.showToast({ title: '身份证号格式不正确', icon: 'none' })
        return
      }
      if (!this.mobile) {
        uni.showToast({ title: '请输入手机号码', icon: 'none' })
        return
      }
      if (!this.validateMobile(this.mobile)) {
        uni.showToast({ title: '手机号码格式不正确', icon: 'none' })
        return
      }
      
      // 跳转到订单确认页面
      const params = {
        type: this.ticketType,
        flight_no: this.flightNo,
        train_no: this.trainNo,
        departure_date: this.departureDate,
        passenger_name: this.passengerName,
        id_card: this.idCard,
        mobile: this.mobile,
        ticket_price: this.ticketPrice,
        airport_tax: this.airportTax,
        fuel_tax: this.fuelTax,
        display_price: this.displayPrice,
        total_amount: this.totalAmount,
        original_price: this.originalPrice,
        price_type: this.priceType,
        price_type_text: this.priceTypeText,
        seat_code: this.seatCode,
        seat_name: this.seatName,
        price_id: this.priceId,
        policy_id: this.policyId,
        route_id: this.routeId,
        dep_airport: this.depAirport,
        arr_airport: this.arrAirport,
        dep_city: this.depCity,
        arr_city: this.arrCity,
        airline_name: this.airlineName,
        dep_time: this.depTime,
        arr_time: this.arrTime
      }
      
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&')
      
      uni.navigateTo({
        url: `/pages/ticket/order-confirm?${queryString}`,
        fail: (err) => {
          console.error('跳转失败:', err)
          uni.showToast({ title: '页面跳转失败，请重试', icon: 'none' })
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
  padding-bottom: 120rpx;
}

.top-card {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .ticket-type {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 20rpx;
  }
  
  .flight-brief, .train-brief {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 20rpx;
    
    .flight-no, .train-no {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
    
    .airline, .train-type {
      font-size: 26rpx;
      color: #666;
    }
  }
  
  .route-brief {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 15rpx;
    
    .departure, .arrival {
      font-size: 32rpx;
      font-weight: 600;
      color: #1A4A8F;
    }
    
    .arrow {
      font-size: 28rpx;
      color: #999;
    }
  }
  
  .date-brief {
    display: flex;
    align-items: center;
    gap: 20rpx;
    font-size: 26rpx;
    color: #666;
    
    .time {
      color: #999;
    }
  }
}

.section-card {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
  }
  
  .form-item {
    display: flex;
    align-items: center;
    padding: 25rpx 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .label {
      width: 180rpx;
      font-size: 28rpx;
      color: #333;
      flex-shrink: 0;
    }
    
    .input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
    
    .readonly {
      flex: 1;
      font-size: 28rpx;
      color: #666;
    }
  }
  
  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    
    .label {
      font-size: 28rpx;
      color: #666;
      
      &.sub {
        color: #333;
        font-weight: 500;
      }
    }
    
    .value {
      font-size: 28rpx;
      color: #666;
      
      &.highlight {
        color: #FF7A00;
        font-weight: 600;
      }
      
      &.total {
        font-size: 32rpx;
        font-weight: bold;
        color: #FF7A00;
      }
    }
    
    &.total {
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 1px solid #f0f0f0;
    }
  }
  
  .section-text {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 20rpx;
  
  .bottom-price {
    flex: 1;
    display: flex;
    align-items: baseline;
    gap: 10rpx;
    
    .price-label {
      font-size: 26rpx;
      color: #666;
    }
    
    .price-value {
      font-size: 36rpx;
      font-weight: bold;
      color: #FF7A00;
    }
  }
  
  .submit-btn {
    background: linear-gradient(90deg, #FFC966, #F8D07C);
    color: #1A4A8F;
    font-size: 32rpx;
    font-weight: 600;
    padding: 20rpx 60rpx;
    border-radius: 50rpx;
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


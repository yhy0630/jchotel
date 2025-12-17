<template>
  <view class="page">
    <scroll-view scroll-y class="content">
      <!-- 航班信息摘要 -->
      <view class="top-card">
        <view class="ticket-type">{{ ticketType === 'flight' ? '航班信息' : '车次信息' }}</view>
        <view v-if="ticketType === 'flight'" class="flight-brief">
          <text class="flight-no">{{ flightNo || '—' }}</text>
          <text class="airline">{{ airlineName || '—' }}</text>
        </view>
        <view v-else class="train-brief">
          <text class="train-no">{{ trainNo || '—' }}</text>
        </view>
        <view class="route-brief">
          <text class="departure">{{ depCity || '—' }}</text>
          <text class="arrow">→</text>
          <text class="arrival">{{ arrCity || '—' }}</text>
        </view>
        <view class="date-brief">
          <text>{{ formatDateDisplay(departureDate) }}</text>
          <text v-if="ticketType === 'flight'" class="time">{{ formatTimeDisplay(depTime) }} - {{ formatTimeDisplay(arrTime) }}</text>
        </view>
        <view v-if="seatName" class="seat-info">
          <text>舱位：{{ seatName }}</text>
        </view>
      </view>

      <!-- 乘客信息 -->
      <view class="section-card">
        <view class="section-title">乘客信息</view>
        <view class="info-row">
          <text class="label">姓名</text>
          <text class="value">{{ passengerName }}</text>
        </view>
        <view class="info-row">
          <text class="label">身份证号</text>
          <text class="value">{{ idCard }}</text>
        </view>
        <view class="info-row">
          <text class="label">联系电话</text>
          <text class="value">{{ mobile }}</text>
        </view>
      </view>

      <!-- 价格明细 -->
      <view class="section-card">
        <view class="section-title">价格明细</view>
        <view class="price-row">
          <text class="label">票面价</text>
          <text class="value">¥{{ formatPrice(ticketPrice) }}</text>
        </view>
        <view class="price-row" v-if="ticketType === 'flight'">
          <text class="label">机建费</text>
          <text class="value">¥{{ formatPrice(airportTax) }}</text>
        </view>
        <view class="price-row" v-if="ticketType === 'flight'">
          <text class="label">燃油费</text>
          <text class="value">¥{{ formatPrice(fuelTax) }}</text>
        </view>
        <view class="price-row">
          <text class="label sub">{{ priceTypeText }}</text>
          <text class="value highlight">¥{{ formatPrice(displayPrice) }}</text>
        </view>
        <view class="price-row total">
          <text class="label">订单总额</text>
          <text class="value total">¥{{ formatPrice(totalAmount) }}</text>
        </view>
      </view>

      <!-- 保险选择（如果有） -->
      <view class="section-card" v-if="insuranceOptions.length > 0">
        <view class="section-title">航意险（可选）</view>
        <view 
          v-for="(insurance, index) in insuranceOptions" 
          :key="index"
          class="insurance-item"
          @click="toggleInsurance(index)"
        >
          <view class="insurance-left">
            <text class="insurance-name">{{ insurance.name }}</text>
            <text class="insurance-desc">{{ insurance.desc }}</text>
          </view>
          <view class="insurance-right">
            <text class="insurance-price">¥{{ formatPrice(insurance.price) }}</text>
            <view :class="['checkbox', { checked: selectedInsurance === index }]">
              <text v-if="selectedInsurance === index">✓</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 退改政策 -->
      <view class="section-card">
        <view class="section-title">退改政策</view>
        <view class="section-text">
          {{ ticketType === 'flight' ? '根据航空公司规定，退改政策以实际出票时为准。' : '根据铁路部门规定，退改政策以实际出票时为准。' }}
        </view>
      </view>
    </scroll-view>

    <!-- 底部价格栏 -->
    <view class="bottom-bar">
      <view class="bottom-price">
        <text class="price-label">需支付</text>
        <text class="price-value">¥{{ formatPrice(finalAmount) }}</text>
      </view>
      <button class="submit-btn" :disabled="submitting" @click="goToPayment">
        {{ submitting ? '提交中...' : '确认订单并支付' }}
      </button>
    </view>
  </view>
</template>

<script>
import { createOrder, verifyPrice } from '@/api/flight.js'

export default {
  data() {
    return {
      ticketType: 'flight',
      flightNo: '',
      trainNo: '',
      departureDate: '',
      passengerName: '',
      idCard: '',
      mobile: '',
      ticketPrice: 0,
      airportTax: 0,
      fuelTax: 0,
      displayPrice: 0,
      totalAmount: 0,
      originalPrice: 0,
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
      
      // 保险选项
      insuranceOptions: [
        { name: '航意险', desc: '保障飞行期间意外伤害，保额40万', price: 30 },
        { name: '延误险', desc: '航班延误2小时以上可获赔', price: 20 }
      ],
      selectedInsurance: -1, // -1表示未选择
      
      submitting: false
    }
  },
  computed: {
    finalAmount() {
      // 最终金额 = 订单总额 + 保险费用
      const insurancePrice = this.selectedInsurance >= 0 
        ? this.insuranceOptions[this.selectedInsurance].price 
        : 0
      return this.totalAmount + insurancePrice
    }
  },
  onLoad(options) {
    // 接收从乘客信息页面传递的参数
    this.ticketType = options.type || 'flight'
    this.flightNo = options.flight_no || ''
    this.trainNo = options.train_no || ''
    this.departureDate = decodeURIComponent(options.departure_date || '')
    this.passengerName = decodeURIComponent(options.passenger_name || '')
    this.idCard = options.id_card || ''
    this.mobile = options.mobile || ''
    this.ticketPrice = parseFloat(options.ticket_price || 0)
    this.airportTax = parseFloat(options.airport_tax || 0)
    this.fuelTax = parseFloat(options.fuel_tax || 0)
    this.displayPrice = parseFloat(options.display_price || 0)
    this.totalAmount = parseFloat(options.total_amount || 0)
    this.originalPrice = parseFloat(options.original_price || 0)
    this.priceType = parseInt(options.price_type || 2)
    this.priceTypeText = decodeURIComponent(options.price_type_text || '尊享价')
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

    // 火车票：无机建/燃油、默认无保险
    if (this.ticketType === 'train') {
      this.airportTax = 0
      this.fuelTax = 0
      this.insuranceOptions = []
      this.selectedInsurance = -1
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
    
    toggleInsurance(index) {
      if (this.selectedInsurance === index) {
        this.selectedInsurance = -1
      } else {
        this.selectedInsurance = index
      }
    },
    
    async goToPayment() {
      this.submitting = true
      
      try {
        // 机票需要先验价，火车票跳过验价
        if (this.ticketType === 'flight') {
          const verifyParams = {
            policyId: this.policyId,
            routeType: 'OW',
            segments: [
              {
                priceId: this.priceId,
                depDate: this.departureDate,
                depAirportCode: this.depAirport,
                arrAirportCode: this.arrAirport,
                flightNo: this.flightNo,
                seatCode: this.seatCode,
                seatCount: '1',
                passengerType: 'ADULT',
                price: this.ticketPrice,
                airportTax: this.airportTax,
                fuelTax: this.fuelTax
              }
            ]
          }

          const verifyRes = await verifyPrice(verifyParams)
          if (verifyRes.code !== 1 || !verifyRes.data) {
            throw new Error(verifyRes.msg || '验价失败')
          }
          uni.showToast({ title: '验价成功', icon: 'success' })
        }
      
        // 调用创建订单接口
        const orderData = {
          ticket_type: this.ticketType,
          flight_no: this.flightNo,
          train_no: this.trainNo,
          departure_date: this.departureDate,
          passenger_name: this.passengerName,
          id_card: this.idCard,
          mobile: this.mobile,
          ticket_price: this.ticketPrice,
          airport_tax: this.ticketType === 'flight' ? this.airportTax : 0,
          fuel_tax: this.ticketType === 'flight' ? this.fuelTax : 0,
          display_price: this.displayPrice,
          total_amount: this.totalAmount,
          insurance_price: this.selectedInsurance >= 0 ? this.insuranceOptions[this.selectedInsurance].price : 0,
          final_amount: this.finalAmount,
          price_type: this.priceType,
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
        
        // 调用创建订单接口
        const res = await createOrder(orderData)
        
        if (res.code === 1 && res.data && res.data.order_id) {
          // 跳转到支付页面，使用正确的参数
          const params = {
            from: 'flight', // 机票订单类型
            order_id: res.data.order_id,
            amount: this.finalAmount
          }
          
          const queryString = Object.keys(params)
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&')
          
          uni.redirectTo({
            url: `/pages/payment/payment?${queryString}`,
            fail: (err) => {
              console.error('跳转支付页面失败:', err)
              uni.showToast({ title: '跳转支付页面失败，请重试', icon: 'none' })
              this.submitting = false
            }
          })
        } else {
          throw new Error(res.msg || '创建订单失败')
        }
      } catch (e) {
        console.error('创建订单失败:', e)
        uni.showToast({ title: e.message || e.msg || '创建订单失败，请重试', icon: 'none' })
        this.submitting = false
      }
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
    
    .airline {
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
    margin-bottom: 10rpx;
    
    .time {
      color: #999;
    }
  }
  
  .seat-info {
    font-size: 26rpx;
    color: #666;
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
  
  .info-row {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .label {
      width: 180rpx;
      font-size: 28rpx;
      color: #666;
      flex-shrink: 0;
    }
    
    .value {
      flex: 1;
      font-size: 28rpx;
      color: #333;
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
  
  .insurance-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25rpx 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .insurance-left {
      flex: 1;
      
      .insurance-name {
        display: block;
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .insurance-desc {
        display: block;
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .insurance-right {
      display: flex;
      align-items: center;
      gap: 20rpx;
      
      .insurance-price {
        font-size: 28rpx;
        font-weight: 600;
        color: #FF7A00;
      }
      
      .checkbox {
        width: 40rpx;
        height: 40rpx;
        border: 2rpx solid #ddd;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.checked {
          background: #F8D07C;
          border-color: #F8D07C;
          color: #1A4A8F;
          font-weight: bold;
        }
      }
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


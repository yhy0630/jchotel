<template>
  <view class="page">
    <custom-navbar title="确认信息"></custom-navbar>
    <scroll-view scroll-y class="content">
      <!-- 航班/车次信息摘要 -->
      <view class="top-info-card">
        <view class="info-header">
          <text class="ticket-type-label">{{ ticketType === 'flight' ? '直飞' : '直达' }}</text>
          <text class="route-text">{{ depCity || '—' }}-{{ arrCity || '—' }}</text>
          <text class="date-text" v-if="departureDate">{{ formatDateDisplay(departureDate) }}</text>
          <text class="time-text" v-if="depTime">{{ formatTimeDisplay(depTime) }}</text>
        </view>
        <view class="info-detail">
          <text class="detail-item" v-if="ticketType === 'flight' && flightNo">成人 ¥{{ formatPrice(ticketPrice) }}</text>
          <text class="detail-item" v-if="ticketType === 'train' && trainNo">成人 ¥{{ formatPrice(ticketPrice) }}</text>
          <text class="detail-item" v-if="ticketType === 'flight' && airportTax">+ 机建燃油 ¥{{ formatPrice(airportTax + fuelTax) }}</text>
        </view>
        <view class="info-extra" v-if="ticketType === 'flight'">
          <text class="extra-text">退改 ¥150起 | 免费托运李23KG</text>
        </view>
      </view>

      <!-- 乘客信息 -->
      <view class="section-card">
        <view class="section-title">乘机人信息</view>
        <view class="passenger-item">
          <view class="passenger-row">
            <text class="passenger-label">姓名</text>
            <text class="passenger-value">{{ passengerName || '—' }}</text>
          </view>
          <view class="divider-line"></view>
          <view class="passenger-row">
            <text class="passenger-label">身份证</text>
            <image class="id-icon" src="/static/images/id-card.png" mode="aspectFit"></image>
            <text class="passenger-value">{{ idCard || '—' }}</text>
          </view>
          <view class="divider-line"></view>
          <view class="passenger-row">
            <text class="passenger-label">手机号码</text>
            <text class="passenger-value">{{ mobile || '—' }}</text>
          </view>
          <view class="divider-line"></view>
          <view class="passenger-row">
            <text class="passenger-label">联系手机</text>
            <text class="passenger-value">{{ mobile || '—' }}</text>
          </view>
        </view>
      </view>

      <!-- 优惠专区 -->
      <view class="section-card">
        <view class="section-title">优惠专区</view>
        <view class="coupon-item" @click="goToCouponList">
          <text class="coupon-label">代金券</text>
          <view class="coupon-right">
            <text class="coupon-text">无优惠券可用</text>
            <text class="arrow-icon">›</text>
          </view>
        </view>
      </view>

      <!-- 航意险（可选） -->
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
    </scroll-view>

    <!-- 底部价格栏 -->
    <view class="bottom-bar">
      <view class="bottom-price">
        <view class="price-row-bottom">
          <text class="price-label-small">挂牌价 ¥{{ formatPrice(totalAmount) }}</text>
        </view>
        <view class="price-row-bottom">
          <text class="price-label-small">尊享价 ¥{{ formatPrice(finalAmount) }}</text>
        </view>
        <view class="price-row-bottom">
          <text class="price-label-small">股东价 ¥{{ formatPrice(originalPrice || totalAmount) }}</text>
        </view>
      </view>
      <button class="submit-btn" :disabled="submitting" @click="goToPayment">
        {{ submitting ? '提交中...' : '立即预订' }}
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
    
    goToCouponList() {
      uni.showToast({ title: '优惠券功能开发中', icon: 'none' })
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
  background: #0D1034;
  display: flex;
  flex-direction: column;
  padding-top: calc(130rpx + var(--status-bar-height));
}

.content {
  flex: 1;
  padding-bottom: 180rpx;
}

/* 顶部信息卡片 */
.top-info-card {
  background: #4E474C;
  padding: 30rpx;
  margin-bottom: 20rpx;
  color: #FFE3BB;
  
  .info-header {
    display: flex;
    align-items: center;
    gap: 15rpx;
    margin-bottom: 15rpx;
    flex-wrap: wrap;
    
    .ticket-type-label {
      font-size: 24rpx;
      color: #FFE3BB;
      padding: 4rpx 12rpx;
      border-radius: 4rpx;
    }
    
    .route-text {
      font-size: 28rpx;
      color: #FFE3BB;
      font-weight: 500;
    }
    
    .date-text {
      font-size: 24rpx;
      color: #FFE3BB;
    }
    
    .time-text {
      font-size: 24rpx;
      color: #FFE3BB;
    }
  }
  
  .info-detail {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-bottom: 10rpx;
    
    .detail-item {
      font-size: 24rpx;
      color: #FFE3BB;
    }
  }
  
  .info-extra {
    .extra-text {
      font-size: 22rpx;
      color: #FFE3BB;
    }
  }
}

/* 信息卡片 */
.section-card {
  background: #1E1F34;
  padding: 30rpx;
  margin: 20rpx 20rpx;
  
  
  .section-title {
    font-size: 28rpx;
    font-weight: 500;
    color: #FFFFFF;
    margin-bottom: 24rpx;
  }
  
  /* 乘客信息 */
  .passenger-item {
    .passenger-row {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      
      .passenger-label {
        width: 140rpx;
        font-size: 26rpx;
        color: #8A92A6;
        flex-shrink: 0;
      }
      
      .id-icon {
        width: 32rpx;
        height: 32rpx;
        margin-right: 10rpx;
      }
      
      .passenger-value {
        flex: 1;
        font-size: 26rpx;
        color: #FFFFFF;
      }
    }
    
    .divider-line {
      height: 1rpx;
      background: rgba(255, 255, 255, 0.1);
    }
  }
  
  /* 优惠券 */
  .coupon-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    
    .coupon-label {
      font-size: 26rpx;
      color: #8A92A6;
    }
    
    .coupon-right {
      display: flex;
      align-items: center;
      gap: 10rpx;
      
      .coupon-text {
        font-size: 26rpx;
        color: #FFFFFF;
      }
      
      .arrow-icon {
        font-size: 32rpx;
        color: #8A92A6;
      }
    }
  }
  
  /* 航意险 */
  .insurance-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25rpx 0;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
    
    &:last-child {
      border-bottom: none;
    }
    
    .insurance-left {
      flex: 1;
      
      .insurance-name {
        display: block;
        font-size: 28rpx;
        font-weight: 500;
        color: #FFFFFF;
        margin-bottom: 8rpx;
      }
      
      .insurance-desc {
        display: block;
        font-size: 24rpx;
        color: #8A92A6;
      }
    }
    
    .insurance-right {
      display: flex;
      align-items: center;
      gap: 20rpx;
      
      .insurance-price {
        font-size: 28rpx;
        font-weight: 600;
        color: #FCDDA6;
      }
      
      .checkbox {
        width: 40rpx;
        height: 40rpx;
        border: 2rpx solid #8A92A6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.checked {
          background: #FCDDA6;
          border-color: #FCDDA6;
          color: #000000;
          font-weight: bold;
        }
      }
    }
  }
}

/* 底部价格栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1E2139;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #787985;
  display: flex;
  align-items: center;
  gap: 20rpx;
  
  .bottom-price {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
    
    .price-row-bottom {
      .price-label-small {
        font-size: 22rpx;
        color: #B9BABE;
      }
    }
  }
  
  .submit-btn {
    background: linear-gradient(90deg, #F5C26F 0%, #FCDEA7 50.26%, #F3C06F 100%);
    color: #000000;
    font-size: 28rpx;
    font-weight: 600;
    padding: 0rpx 80rpx;
    border-radius: 18rpx;
    border: none;
    min-width: 200rpx;
    
    &::after {
      border: none;
    }
    
    &[disabled] {
      opacity: 0.6;
    }
  }
}
</style>


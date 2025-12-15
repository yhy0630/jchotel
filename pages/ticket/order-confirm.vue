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
          <text v-if="trainType" class="train-type">{{ trainType }}</text>
          <text v-if="isFxh === '1'" class="train-badge">复兴号</text>
          <text v-if="isZndcz === '1'" class="train-badge">智能动车组</text>
        </view>
        <view class="route-brief">
          <text class="departure">{{ fromStationName || depCity || '—' }}</text>
          <text class="arrow">→</text>
          <text class="arrival">{{ toStationName || arrCity || '—' }}</text>
        </view>
        <view v-if="ticketType === 'train' && (startStation || endStation)" class="route-full">
          <text class="route-label">全程：</text>
          <text class="route-value">{{ startStation || '—' }} → {{ endStation || '—' }}</text>
        </view>
        <view class="date-brief">
          <text>{{ formatDateDisplay(departureDate) }}</text>
          <text v-if="ticketType === 'flight'" class="time">{{ formatTimeDisplay(depTime) }} - {{ formatTimeDisplay(arrTime) }}</text>
          <text v-else class="time">{{ formatTimeDisplay(fromTime || depTime) }} - {{ formatTimeDisplay(toTime || arrTime) }}</text>
          <text v-if="ticketType === 'train' && trainDuration" class="duration">{{ trainDuration }}</text>
        </view>
        <view v-if="loading" class="loading-tip">正在加载{{ ticketType === 'flight' ? '航班' : '车次' }}信息...</view>
        <view v-if="seatName" class="seat-info">
          <text>{{ ticketType === 'flight' ? '舱位' : '座位' }}：{{ seatName }}</text>
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
        <!-- 飞机票才显示机建费和燃油费 -->
        <view v-if="ticketType === 'flight'" class="price-row">
          <text class="label">机建费</text>
          <text class="value">¥{{ formatPrice(airportTax) }}</text>
        </view>
        <view v-if="ticketType === 'flight'" class="price-row">
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

      <!-- 保险选择（如果有，仅飞机票显示） -->
      <view class="section-card" v-if="ticketType === 'flight' && insuranceOptions.length > 0">
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
import { createOrder, flightDetail } from '@/api/flight.js'

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
      routeId: '',
      depAirport: '',
      arrAirport: '',
      depCity: '',
      arrCity: '',
      airlineName: '',
      depTime: '',
      arrTime: '',
      
      // 火车票相关信息
      trainType: '',
      fromStationName: '',
      toStationName: '',
      fromTime: '',
      toTime: '',
      startStation: '',
      endStation: '',
      trainDuration: '',
      spanTime: '',
      usedMinutes: '',
      isFxh: '0',
      isZndcz: '0',
      
      // 保险选项
      insuranceOptions: [
        { name: '航意险', desc: '保障飞行期间意外伤害，保额40万', price: 30 },
        { name: '延误险', desc: '航班延误2小时以上可获赔', price: 20 }
      ],
      selectedInsurance: -1, // -1表示未选择
      
      submitting: false,
      loading: false
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
    console.log('order-confirm onLoad options:', options)
    
    // 接收从乘客信息页面传递的参数 - 使用安全解码避免乱码
    this.ticketType = this.safeDecode(options.type) || 'flight'
    this.flightNo = this.safeDecode(options.flight_no) || ''
    this.trainNo = this.safeDecode(options.train_no) || ''
    this.departureDate = this.safeDecode(options.departure_date) || ''
    this.passengerName = this.safeDecode(options.passenger_name) || ''
    this.idCard = this.safeDecode(options.id_card) || ''
    this.mobile = this.safeDecode(options.mobile) || ''
    this.ticketPrice = parseFloat(options.ticket_price || 0)
    this.airportTax = parseFloat(options.airport_tax || 0)
    this.fuelTax = parseFloat(options.fuel_tax || 0)
    this.displayPrice = parseFloat(options.display_price || 0)
    this.totalAmount = parseFloat(options.total_amount || 0)
    this.originalPrice = parseFloat(options.original_price || 0)
    this.priceType = parseInt(options.price_type || 2)
    this.priceTypeText = this.safeDecode(options.price_type_text) || '尊享价'
    this.seatCode = this.safeDecode(options.seat_code) || ''
    this.seatName = this.safeDecode(options.seat_name) || ''
    this.priceId = this.safeDecode(options.price_id) || ''
    this.routeId = this.safeDecode(options.route_id) || ''
    this.depAirport = this.safeDecode(options.dep_airport) || ''
    this.arrAirport = this.safeDecode(options.arr_airport) || ''
    this.depCity = this.safeDecode(options.dep_city) || ''
    this.arrCity = this.safeDecode(options.arr_city) || ''
    this.airlineName = this.safeDecode(options.airline_name) || ''
    this.depTime = this.safeDecode(options.dep_time) || ''
    this.arrTime = this.safeDecode(options.arr_time) || ''
    
    // 火车票相关信息
    this.trainType = this.safeDecode(options.train_type) || ''
    this.fromStationName = this.safeDecode(options.from_station_name) || ''
    this.toStationName = this.safeDecode(options.to_station_name) || ''
    this.fromTime = this.safeDecode(options.from_time) || ''
    this.toTime = this.safeDecode(options.to_time) || ''
    this.startStation = this.safeDecode(options.start_station) || ''
    this.endStation = this.safeDecode(options.end_station) || ''
    this.spanTime = this.safeDecode(options.span_time) || ''
    this.usedMinutes = options.used_minutes || ''
    this.isFxh = options.is_fxh || '0'
    this.isZndcz = options.is_zndcz || '0'
    
    // 格式化运行时长
    if (this.ticketType === 'train') {
      this.trainDuration = this.formatTrainDuration(this.spanTime, this.usedMinutes)
    }
    
    console.log('解析后的数据:', {
      flightNo: this.flightNo,
      airlineName: this.airlineName,
      depCity: this.depCity,
      arrCity: this.arrCity,
      depTime: this.depTime,
      arrTime: this.arrTime,
      passengerName: this.passengerName,
      totalAmount: this.totalAmount
    })
    
    // 如果是航班订单且关键信息缺失，尝试从 API 获取
    if (this.ticketType === 'flight' && 
        (!this.flightNo || !this.airlineName || !this.depCity || !this.arrCity || !this.depTime || !this.arrTime) &&
        (this.routeId || (this.flightNo && this.departureDate))) {
      this.loadFlightDetail()
    }
  },
  methods: {
    // 安全解码函数，处理可能的双重编码或未编码情况
    safeDecode(value) {
      if (!value) return ''
      try {
        // 先尝试解码
        let decoded = decodeURIComponent(value)
        // 如果解码后的值看起来还是编码过的（包含 %），再解码一次
        if (decoded.includes('%') && decoded !== value) {
          decoded = decodeURIComponent(decoded)
        }
        return decoded
      } catch (e) {
        // 如果解码失败，返回原始值
        console.warn('解码失败，使用原始值:', value, e)
        return value
      }
    },
    
    // 从 API 获取航班详情
    async loadFlightDetail() {
      if (this.loading) return
      this.loading = true
      
      try {
        const params = {}
        if (this.routeId) {
          params.route_id = this.routeId
          params.route_type = 'OW'
        } else if (this.flightNo && this.departureDate) {
          params.flight_no = this.flightNo
          params.departure_date = this.departureDate
          if (this.depAirport) params.dep_airport = this.depAirport
          if (this.arrAirport) params.arr_airport = this.arrAirport
        } else {
          this.loading = false
          return
        }
        
        const res = await flightDetail(params)
        if (res.code === 1 && res.data) {
          const detail = res.data
          
          // 更新缺失的航班信息
          if (!this.flightNo && detail.flightNo) {
            this.flightNo = detail.flightNo
          }
          if (!this.airlineName && detail.carrierName) {
            this.airlineName = detail.carrierName
          }
          if (!this.depCity && detail.depCityName) {
            this.depCity = detail.depCityName
          }
          if (!this.arrCity && detail.arrCityName) {
            this.arrCity = detail.arrCityName
          }
          if (!this.depTime && detail.depTime) {
            this.depTime = this.formatTime(detail.depTime)
          }
          if (!this.arrTime && detail.arrTime) {
            this.arrTime = this.formatTime(detail.arrTime)
          }
          if (!this.depAirport && detail.depAirportCode) {
            this.depAirport = detail.depAirportCode
          }
          if (!this.arrAirport && detail.arrAirportCode) {
            this.arrAirport = detail.arrAirportCode
          }
          if (!this.routeId && detail.routeId) {
            this.routeId = detail.routeId
          }
          
          console.log('从 API 获取数据后:', {
            flightNo: this.flightNo,
            airlineName: this.airlineName,
            depCity: this.depCity,
            arrCity: this.arrCity,
            depTime: this.depTime,
            arrTime: this.arrTime
          })
        }
      } catch (e) {
        console.error('获取航班详情失败:', e)
      } finally {
        this.loading = false
      }
    },
    
    formatTime(timestamp) {
      if (!timestamp) return ''
      // 如果是时间戳（毫秒）
      if (typeof timestamp === 'number' || /^\d+$/.test(timestamp)) {
        const date = new Date(parseInt(timestamp))
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
      }
      // 如果是字符串格式 "2024-09-12 10:30:00"
      if (typeof timestamp === 'string' && timestamp.length >= 16) {
        return timestamp.substr(11, 5)
      }
      return timestamp
    },
    
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
    
    formatTrainDuration(spanTime, usedMinutes) {
      if (!spanTime && !usedMinutes) return ''
      
      // 优先使用 spanTime（格式：03:27）
      if (spanTime && typeof spanTime === 'string' && spanTime.includes(':')) {
        const parts = spanTime.split(':')
        if (parts.length === 2) {
          const hours = parseInt(parts[0]) || 0
          const minutes = parseInt(parts[1]) || 0
          if (hours > 0) {
            return `${hours}小时${minutes}分钟`
          }
          return `${minutes}分钟`
        }
      }
      
      // 使用 usedMinutes（分钟数）
      if (usedMinutes) {
        const minutes = parseInt(usedMinutes) || 0
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours > 0) {
          return `${hours}小时${mins}分钟`
        }
        return `${mins}分钟`
      }
      
      return ''
    },
    
    toggleInsurance(index) {
      if (this.selectedInsurance === index) {
        this.selectedInsurance = -1
      } else {
        this.selectedInsurance = index
      }
    },
    
    async goToPayment() {
      // 验证必填信息
      if (this.ticketType === 'flight' && !this.flightNo) {
        uni.showToast({ title: '航班号不能为空', icon: 'none' })
        return
      }
      if (this.ticketType === 'train' && !this.trainNo) {
        uni.showToast({ title: '车次号不能为空', icon: 'none' })
        return
      }
      if (!this.departureDate) {
        uni.showToast({ title: '出发日期不能为空', icon: 'none' })
        return
      }
      if (!this.passengerName) {
        uni.showToast({ title: '乘客姓名不能为空', icon: 'none' })
        return
      }
      if (!this.idCard) {
        uni.showToast({ title: '身份证号不能为空', icon: 'none' })
        return
      }
      if (!this.mobile) {
        uni.showToast({ title: '联系电话不能为空', icon: 'none' })
        return
      }
      
      this.submitting = true
      
      try {
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
          airport_tax: this.airportTax,
          fuel_tax: this.fuelTax,
          display_price: this.displayPrice,
          total_amount: this.totalAmount,
          insurance_price: this.selectedInsurance >= 0 ? this.insuranceOptions[this.selectedInsurance].price : 0,
          final_amount: this.finalAmount,
          price_type: this.priceType,
          seat_code: this.seatCode,
          seat_name: this.seatName,
          price_id: this.priceId,
          route_id: this.routeId,
          dep_airport: this.depAirport,
          arr_airport: this.arrAirport,
          dep_city: this.depCity,
          arr_city: this.arrCity,
          airline_name: this.airlineName,
          dep_time: this.depTime,
          arr_time: this.arrTime,
          // 火车票相关信息
          train_type: this.trainType,
          from_station_name: this.fromStationName,
          to_station_name: this.toStationName,
          from_time: this.fromTime,
          to_time: this.toTime,
          start_station: this.startStation,
          end_station: this.endStation,
          span_time: this.spanTime,
          used_minutes: this.usedMinutes,
          is_fxh: this.isFxh,
          is_zndcz: this.isZndcz
        }
        
        console.log('创建订单数据:', orderData)
        
        // 调用创建订单接口
        const res = await createOrder(orderData)
        
        console.log('创建订单响应:', res)
        
        if (res.code === 1 && res.data && res.data.order_id) {
          // 跳转到支付页面，使用正确的参数
          const params = {
            from: this.ticketType === 'flight' ? 'flight' : 'train', // 订单类型
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
    
    .airline, .train-type {
      font-size: 26rpx;
      color: #666;
    }
    
    .train-badge {
      display: inline-block;
      padding: 4rpx 12rpx;
      background: #F8D07C;
      color: #1A4A8F;
      font-size: 22rpx;
      border-radius: 4rpx;
    }
  }
  
  .route-full {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 10rpx;
    
    .route-label {
      color: #999;
    }
    
    .route-value {
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
    
    .duration {
      color: #999;
      font-size: 24rpx;
    }
  }
  
  .seat-info {
    font-size: 26rpx;
    color: #666;
  }
  
  .loading-tip {
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
    text-align: center;
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


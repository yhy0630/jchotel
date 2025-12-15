<template>
  <view class="page">
    <scroll-view scroll-y class="content">
      <!-- 顶部航班/车次摘要 -->
      <view class="top-card">
        <view class="ticket-type">{{ ticketType === 'flight' ? '航班信息' : '车次信息' }}</view>
        <view v-if="ticketType === 'flight'" class="flight-brief">
          <text class="flight-no">{{ flightInfo.flightNo || flightNo || '—' }}</text>
          <text class="airline">{{ flightInfo.airlineName || airlineName || '—' }}</text>
        </view>
        <view v-else class="train-brief">
          <text class="train-no">{{ trainInfo.trainNo || trainNo || '—' }}</text>
          <text class="train-type">{{ trainInfo.trainType || '高铁' }}</text>
          <text v-if="trainInfo.isFxh === '1'" class="train-badge">复兴号</text>
          <text v-if="trainInfo.isZndcz === '1'" class="train-badge">智能动车组</text>
        </view>
        <view class="route-brief">
          <text class="departure">{{ flightInfo.departureCity || depCity || trainInfo.departureStation || trainInfo.fromStationName || '—' }}</text>
          <text class="arrow">→</text>
          <text class="arrival">{{ flightInfo.arrivalCity || arrCity || trainInfo.arrivalStation || trainInfo.toStationName || '—' }}</text>
        </view>
        <view v-if="ticketType === 'train' && (trainInfo.startStation || trainInfo.endStation)" class="route-full">
          <text class="route-label">全程：</text>
          <text class="route-value">{{ trainInfo.startStation || '—' }} → {{ trainInfo.endStation || '—' }}</text>
        </view>
        <view class="date-brief">
          <text>{{ formatDateDisplay(departureDate) }}</text>
          <text v-if="ticketType === 'flight'" class="time">{{ formatTimeDisplay(flightInfo.departureTime || depTime) }} - {{ formatTimeDisplay(flightInfo.arrivalTime || arrTime) }}</text>
          <text v-else class="time">{{ formatTimeDisplay(trainInfo.departureTime || trainInfo.fromTime) }} - {{ formatTimeDisplay(trainInfo.arrivalTime || trainInfo.toTime) }}</text>
          <text v-if="ticketType === 'train' && trainInfo.duration" class="duration">{{ trainInfo.duration }}</text>
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
        <!-- 飞机票才显示机建费和燃油费 -->
        <view v-if="ticketType === 'flight'" class="price-row">
          <text class="label">机建费</text>
          <text class="value">¥{{ formatPrice(airportTax) }}</text>
        </view>
        <view v-if="ticketType === 'flight'" class="price-row">
          <text class="label">燃油费</text>
          <text class="value">¥{{ formatPrice(fuelTax) }}</text>
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
import { flightDetail } from '@/api/flight.js'

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
        arrivalTime: '',
        fromStationName: '',
        toStationName: '',
        fromTime: '',
        toTime: '',
        startStation: '',
        endStation: '',
        duration: '',
        spanTime: '',
        usedMinutes: '',
        isFxh: '0',
        isZndcz: '0'
      },
      
      // 乘客信息
      passengerName: '',
      idCard: '',
      mobile: '',
      cabinClass: 'Y',
      seatType: 'second',
      
      submitting: false,
      loading: false
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
      // 如果有座位名称，直接使用
      if (this.seatName) {
        return this.seatName
      }
      
      // 否则根据座位代码或类型映射
      const map = {
        'first': '一等座',
        'second': '二等座',
        'business': '商务座',
        'hard_sleeper': '硬卧',
        'soft_sleeper': '软卧',
        'hard_seat': '硬座',
        'soft_seat': '软座',
        'no_seat': '无座',
        'wz': '无座',
        'yz': '硬座',
        'yw': '硬卧',
        'rw': '软卧',
        'rz': '软座',
        'edz': '二等座',
        'ydz': '一等座',
        'swz': '商务座'
      }
      return map[this.seatType] || map[this.seatCode] || '二等座'
    },
    canSubmit() {
      return this.passengerName && this.idCard && this.mobile && 
             this.idCard.length >= 15 && this.mobile.length === 11
    }
  },
  onLoad(options) {
    console.log('passenger-info onLoad options:', options)
    
    this.ticketType = options.type || 'flight'
    this.departureDate = options.departure_date || ''
    
    // 解析价格（从详情页传递的是总价，需要拆分）
    const totalPrice = parseFloat(options.price || 0)
    const originalTotal = parseFloat(options.original_price || options.price || 0)
    
    // 如果传递了详细价格信息，使用传递的值；否则从总价估算
    this.ticketPrice = parseFloat(options.ticket_price || 0) || (originalTotal * 0.85) // 假设票面价占85%
    this.airportTax = parseFloat(options.airport_tax || 0) || 50 // 默认50
    this.fuelTax = parseFloat(options.fuel_tax || 0) || (originalTotal - this.ticketPrice - this.airportTax)
    
    this.displayPrice = totalPrice - this.airportTax - this.fuelTax // 会员价 = 总价 - 税费
    this.originalPrice = originalTotal
    this.priceType = parseInt(options.price_type || 2)
    this.priceTypeText = this.safeDecode(options.price_type_text) || '尊享价'
    
    // 航班相关信息 - 安全解码，避免双重编码导致的乱码
    this.flightNo = this.safeDecode(options.flight_no) || ''
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
    
    console.log('解析后的数据:', {
      flightNo: this.flightNo,
      airlineName: this.airlineName,
      depCity: this.depCity,
      arrCity: this.arrCity,
      depTime: this.depTime,
      arrTime: this.arrTime
    })
    
    if (this.ticketType === 'flight') {
      this.cabinClass = options.cabin_class || 'Y'
      // 确保赋值给 flightInfo 对象，使用对象替换确保响应式更新
      this.flightInfo = {
        flightNo: this.flightNo || '',
        airlineName: this.airlineName || '',
        departureCity: this.depCity || '',
        arrivalCity: this.arrCity || '',
        departureTime: this.depTime || '',
        arrivalTime: this.arrTime || ''
      }
      
      console.log('flightInfo 赋值后:', this.flightInfo)
      
      // 如果关键信息缺失，尝试从 API 获取
      if ((!this.flightInfo.flightNo || !this.flightInfo.airlineName || !this.flightInfo.departureCity || 
           !this.flightInfo.arrivalCity || !this.flightInfo.departureTime || !this.flightInfo.arrivalTime) && 
          (this.routeId || (this.flightNo && this.departureDate))) {
        this.loadFlightDetail()
      }
    } else {
      // 火车票相关信息
      this.trainNo = this.safeDecode(options.train_no) || ''
      this.seatCode = this.safeDecode(options.seat_code) || ''
      this.seatName = this.safeDecode(options.seat_name) || ''
      
      // 解析座位类型
      const seatCodeMap = {
        'ydz': 'first',
        'edz': 'second',
        'swz': 'business',
        'yw': 'hard_sleeper',
        'rw': 'soft_sleeper',
        'yz': 'hard_seat',
        'rz': 'soft_seat',
        'wz': 'no_seat'
      }
      this.seatType = seatCodeMap[this.seatCode] || 'second'
      
      // 构建完整的车次信息对象
      this.trainInfo = {
        trainNo: this.trainNo || '',
        trainType: this.safeDecode(options.train_type) || '',
        departureStation: this.safeDecode(options.from_station_name) || '',
        arrivalStation: this.safeDecode(options.to_station_name) || '',
        fromStationName: this.safeDecode(options.from_station_name) || '',
        toStationName: this.safeDecode(options.to_station_name) || '',
        departureTime: this.safeDecode(options.from_time) || '',
        arrivalTime: this.safeDecode(options.to_time) || '',
        fromTime: this.safeDecode(options.from_time) || '',
        toTime: this.safeDecode(options.to_time) || '',
        startStation: this.safeDecode(options.start_station) || '',
        endStation: this.safeDecode(options.end_station) || '',
        duration: this.formatTrainDuration(options.span_time, options.used_minutes),
        spanTime: this.safeDecode(options.span_time) || '',
        usedMinutes: options.used_minutes || '',
        isFxh: options.is_fxh || '0',
        isZndcz: options.is_zndcz || '0'
      }
      
      console.log('trainInfo 赋值后:', this.trainInfo)
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
          // 更新航班信息，使用对象替换确保响应式更新
          const updatedFlightInfo = { ...this.flightInfo }
          
          if (!updatedFlightInfo.flightNo && detail.flightNo) {
            updatedFlightInfo.flightNo = detail.flightNo
            this.flightNo = detail.flightNo
          }
          if (!updatedFlightInfo.airlineName && detail.carrierName) {
            updatedFlightInfo.airlineName = detail.carrierName
            this.airlineName = detail.carrierName
          }
          if (!updatedFlightInfo.departureCity && detail.depCityName) {
            updatedFlightInfo.departureCity = detail.depCityName
            this.depCity = detail.depCityName
          }
          if (!updatedFlightInfo.arrivalCity && detail.arrCityName) {
            updatedFlightInfo.arrivalCity = detail.arrCityName
            this.arrCity = detail.arrCityName
          }
          if (!updatedFlightInfo.departureTime && detail.depTime) {
            updatedFlightInfo.departureTime = this.formatTime(detail.depTime)
            this.depTime = this.formatTime(detail.depTime)
          }
          if (!updatedFlightInfo.arrivalTime && detail.arrTime) {
            updatedFlightInfo.arrivalTime = this.formatTime(detail.arrTime)
            this.arrTime = this.formatTime(detail.arrTime)
          }
          
          this.flightInfo = updatedFlightInfo
          console.log('从 API 获取数据后 flightInfo:', this.flightInfo)
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
        route_id: this.routeId,
        dep_airport: this.depAirport,
        arr_airport: this.arrAirport,
        dep_city: this.depCity,
        arr_city: this.arrCity,
        airline_name: this.airlineName,
        dep_time: this.depTime,
        arr_time: this.arrTime,
        // 火车票相关信息
        train_type: this.trainInfo.trainType || '',
        from_station: this.trainInfo.fromStationName || this.trainInfo.departureStation || '',
        to_station: this.trainInfo.toStationName || this.trainInfo.arrivalStation || '',
        from_station_name: this.trainInfo.fromStationName || this.trainInfo.departureStation || '',
        to_station_name: this.trainInfo.toStationName || this.trainInfo.arrivalStation || '',
        from_time: this.trainInfo.fromTime || this.trainInfo.departureTime || '',
        to_time: this.trainInfo.toTime || this.trainInfo.arrivalTime || '',
        start_station: this.trainInfo.startStation || '',
        end_station: this.trainInfo.endStation || '',
        span_time: this.trainInfo.spanTime || '',
        used_minutes: this.trainInfo.usedMinutes || '',
        is_fxh: this.trainInfo.isFxh || '0',
        is_zndcz: this.trainInfo.isZndcz || '0'
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
    flex-wrap: wrap;
    gap: 15rpx;
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
  
  .date-brief {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 20rpx;
    font-size: 26rpx;
    color: #666;
    
    .time {
      color: #999;
    }
    
    .duration {
      color: #999;
      font-size: 24rpx;
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


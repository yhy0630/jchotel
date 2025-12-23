<template>
  <view class="page">
    <custom-navbar title="机票详情"></custom-navbar>
    <scroll-view scroll-y class="content" v-if="detail">
      <!-- 航班基本信息 -->
      <view class="flight-info-card">
        <view class="flight-top-bar">
          <text class="trip-type">单程</text>
          <text class="trip-date">{{ formatDateDisplay(detail.depTime) }} {{ formatWeekday(detail.depTime) }} {{ detail.depCityName || '—' }}-{{ detail.arrCityName || '—' }}</text>
          <text class="duration-label">总时长 {{ formatDuration(detail.depTime, detail.arrTime) }}</text>
        </view>
        
        <view class="flight-main">
          <view class="route-info">
            <view class="departure">
              <text class="time">{{ formatTime(detail.depTime) }}</text>
              <text class="terminal" v-if="detail.depTerminal">{{ detail.depAirportName || '—' }}T{{ detail.depTerminal }}</text>
              <text class="terminal" v-else>{{ detail.depAirportName || '—' }}</text>
            </view>
            <view class="duration">
              <image class="arrow-img" src="/static/images/箭头大.png" mode="aspectFit"></image>
            </view>
            <view class="arrival">
              <text class="time">{{ formatTime(detail.arrTime) }}</text>
              <text class="terminal" v-if="detail.arrTerminal">{{ detail.arrAirportName || '—' }}T{{ detail.arrTerminal }}</text>
              <text class="terminal" v-else>{{ detail.arrAirportName || '—' }}</text>
            </view>
          </view> 
          
          <view class="flight-footer">
            <image class="plane-icon" src="/static/images/飞机2.png" mode="aspectFit"></image>
            <text class="flight-info">{{ detail.carrierName || '—' }}{{ detail.flightNo || '—' }}</text>
          </view>
        </view>
      </view>

      <!-- 舱位价格列表 -->
      <view class="seat-list">
        <view 
          v-for="(seat, index) in seatList" 
          :key="index" 
          class="seat-item"
        >
          <view class="seat-header">
            <view class="seat-name-row">
              <text class="seat-name">{{ seat.seatName || seat.seatMsg || '—' }}</text>
              <text v-if="seat.discount" class="discount">{{ formatDiscount(seat.discount) }}</text>
              <text v-if="seat.special === 1" class="special-tag">特价</text>
            </view>
            <view class="seat-count" v-if="seat.seatCount">
              <text>余票 {{ seat.seatCount }}张</text>
            </view>
          </view>

          <!-- 价格摘要 -->
          <view class="price-summary">
            <view class="summary-left">
              <text class="price-title">含税总价</text>
              <text class="price-value">¥{{ formatPrice(calcTotalPrice(seat)) }}</text>
              <text class="tax-desc">含机建+燃油 ¥{{ formatPrice(calcTax(seat)) }}</text>
            </view>
            <view class="summary-right">
              <button class="book-btn" @click.stop="goBook(seat)">订</button>
            </view>
          </view>

          <!-- 展开折叠 -->
          <view class="toggle-row" @click="toggleSeat(index)">
            <text class="toggle-text">{{ seat.expanded ? '收起详情' : '查看退改政策' }}</text>
            <text class="toggle-arrow">{{ seat.expanded ? '▲' : '▼' }}</text>
          </view>

          <!-- 价格明细 & 退改规则（可折叠） -->
          <view v-if="seat.expanded">
            <view class="price-list">
              <view 
                v-for="(priceInfo, pIndex) in seat.priceInfos" 
                :key="pIndex"
                class="price-item"
              >
                <view class="price-left">
                  <text class="passenger-type">{{ formatPassengerType(priceInfo.passengerType) }}</text>
                  <text class="price-desc">票面价 ¥{{ formatPrice(priceInfo.price) }}</text>
                  <text class="tax-desc">机建 ¥{{ formatPrice(priceInfo.airportTax || 0) }} / 燃油 ¥{{ formatPrice(priceInfo.fuelTax || 0) }}</text>
                </view>
                <view class="price-right">
                  <text class="total-price">¥{{ formatPrice((priceInfo.display_price || priceInfo.price) + (priceInfo.airportTax || 0) + (priceInfo.fuelTax || 0)) }}</text>
                  <text class="price-label">含税总价</text>
                </view>
              </view>
            </view>

            <view class="ticket-rules" v-if="seat.ticketRule && seat.ticketRule.length > 0">
              <view 
                v-for="(rule, rIndex) in seat.ticketRule" 
                :key="rIndex"
                class="rule-item"
              >
                <view v-if="rule.simpleDetails && rule.simpleDetails.length > 0" class="rule-details">
                  <view 
                    v-for="(detail, dIndex) in rule.simpleDetails" 
                    :key="dIndex"
                    class="rule-detail-item"
                  >
                    <text class="rule-type">{{ detail.detailFeeTypeName || detail.detailFeeType }}：</text>
                    <text class="rule-desc">{{ detail.detailFeeDesc }}</text>
                  </view>
                </view>
                <view v-if="rule.luggage" class="luggage-info">
                  <text class="luggage-label">行李额：</text>
                  <text class="luggage-desc">{{ rule.luggage }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading">加载中...</view>
    
    <!-- 错误提示 -->
    <view v-if="error" class="error">{{ error }}</view>
  </view>
</template>

<script>
import { flightDetail } from '@/api/flight.js'

export default {
  data() {
    return {
      detail: null,
      seatList: [],
      loading: true,
      error: '',
      routeId: '',
      routeType: 'OW',
      flightNo: '',
      departureDate: '',
      depAirport: '',
      arrAirport: ''
    }
  },
  onLoad(options) {
    // 优先使用新接口参数
    if (options.route_id) {
      this.routeId = decodeURIComponent(options.route_id)
      this.routeType = options.route_type || 'OW'
    } else {
      // 使用旧接口参数
      this.flightNo = options.flight_no || ''
      this.departureDate = options.departure_date || ''
      this.depAirport = options.dep_airport || ''
      this.arrAirport = options.arr_airport || ''
    }
    
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      this.loading = true
      this.error = ''
      
      try {
        const params = {}
        if (this.routeId) {
          params.route_id = this.routeId
          params.route_type = this.routeType
        } else {
          params.flight_no = this.flightNo
          params.departure_date = this.departureDate
          params.dep_airport = this.depAirport
          params.arr_airport = this.arrAirport
        }
        
        const res = await flightDetail(params)
        if (res.code === 1) {
          this.detail = res.data || {}
          this.seatList = this.prepareSeatList(this.detail.seatInfos || [])
        } else {
          this.error = res.msg || '获取航班详情失败'
        }
      } catch (e) {
        console.error('加载航班详情失败:', e)
        this.error = e.msg || '加载失败，请重试'
      } finally {
        this.loading = false
      }
    },
    
    formatTime(timestamp) {
      if (!timestamp) return '—'
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
    
    formatDuration(depTime, arrTime) {
      if (!depTime || !arrTime) return '—'
      
      let dep = null
      let arr = null
      
      // 解析时间
      if (typeof depTime === 'number' || /^\d+$/.test(depTime)) {
        dep = new Date(parseInt(depTime))
      } else if (typeof depTime === 'string' && depTime.length >= 16) {
        dep = new Date(depTime)
      }
      
      if (typeof arrTime === 'number' || /^\d+$/.test(arrTime)) {
        arr = new Date(parseInt(arrTime))
      } else if (typeof arrTime === 'string' && arrTime.length >= 16) {
        arr = new Date(arrTime)
      }
      
      if (!dep || !arr) return '—'
      
      const diff = arr.getTime() - dep.getTime()
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`
      }
      return `${minutes}分钟`
    },
    
    formatDateDisplay(timestamp) {
      if (!timestamp) return '—'
      let date = null
      
      if (typeof timestamp === 'number' || /^\d+$/.test(timestamp)) {
        date = new Date(parseInt(timestamp))
      } else if (typeof timestamp === 'string' && timestamp.length >= 10) {
        date = new Date(timestamp)
      }
      
      if (!date) return '—'
      
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}-${day}`
    },
    
    formatWeekday(timestamp) {
      if (!timestamp) return ''
      let date = null
      
      if (typeof timestamp === 'number' || /^\d+$/.test(timestamp)) {
        date = new Date(parseInt(timestamp))
      } else if (typeof timestamp === 'string' && timestamp.length >= 10) {
        date = new Date(timestamp)
      }
      
      if (!date) return ''
      
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return weekdays[date.getDay()]
    },
    
    formatMeal(meal) {
      const mealMap = {
        'HOT': '热食',
        'COLD': '冷食',
        'DRINK': '饮料',
        'SNACK_OR_BRUNCH': '点心或早午餐',
        'NONE': '无餐',
        'HAVE': '有餐',
        'BREAKFAST': '早餐',
        'LUNCH': '午餐',
        'SNACK': '茶点',
        'DINNER': '晚餐',
        'DESSERT': '甜点',
        'MAINMEAL': '正餐'
      }
      return mealMap[meal] || ''
    },
    
    formatDiscount(discount) {
      if (!discount) return ''
      const num = parseFloat(discount)
      if (num >= 1) {
        return `${num}折`
      }
      return `${(num * 10).toFixed(1)}折`
    },
    
    formatPassengerType(type) {
      const typeMap = {
        'ADULT': '成人',
        'CHILDREN': '儿童',
        'INFANT': '婴儿'
      }
      return typeMap[type] || type
    },
    
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      return numPrice.toFixed(2)
    },
    
    prepareSeatList(list) {
      return list.map(item => ({
        ...item,
        expanded: false
      }))
    },

    toggleSeat(index) {
      const seat = this.seatList[index]
      if (!seat) return
      this.$set(this.seatList, index, { ...seat, expanded: !seat.expanded })
    },

    calcTax(seat) {
      const adult = seat.priceInfos?.find(p => p.passengerType === 'ADULT')
      if (!adult) return 0
      return (adult.airportTax || 0) + (adult.fuelTax || 0)
    },

    calcTotalPrice(seat) {
      const adult = seat.priceInfos?.find(p => p.passengerType === 'ADULT')
      if (!adult) return 0
      const base = adult.display_price || adult.price || 0
      return base + (adult.airportTax || 0) + (adult.fuelTax || 0)
    },
    
    goBook(seat) {
      // 找到成人价格
      const adultPrice = seat.priceInfos?.find(p => p.passengerType === 'ADULT')
      if (!adultPrice) {
        uni.showToast({ title: '该舱位暂无价格', icon: 'none' })
        return
      }
      
      const totalPrice = this.calcTotalPrice(seat)
      const policyId = adultPrice.policyInfo?.policyId || ''
      
      // 跳转到乘客信息页面
      const params = {
        type: 'flight',
        flight_no: this.detail.flightNo || '',
        departure_date: this.detail.depDate || this.departureDate,
        price: totalPrice,
        original_price: (adultPrice.price || 0) + (adultPrice.airportTax || 0) + (adultPrice.fuelTax || 0),
        price_type: 2,
        price_type_text: '尊享价',
        seat_code: seat.seatCode || '',
        seat_name: seat.seatName || '',
        price_id: adultPrice.priceId || '',
        policy_id: policyId,
        route_id: this.detail.routeId || this.routeId || '',
        dep_airport: this.detail.depAirportCode || '',
        arr_airport: this.detail.arrAirportCode || '',
        dep_city: this.detail.depCityName || '',
        arr_city: this.detail.arrCityName || '',
        airline_name: this.detail.carrierName || '',
        dep_time: this.formatTime(this.detail.depTime),
        arr_time: this.formatTime(this.detail.arrTime)
      }
      
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&')
      
      uni.navigateTo({
        url: `/pages/ticket/passenger-info?${queryString}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #0D1038;
  padding-top: calc(130rpx + var(--status-bar-height));
}

.content {
  padding-bottom: 40rpx;
}

.flight-info-card {
  background: #1E1F34;
  overflow: hidden;
  margin-bottom: 20rpx;
  
  .flight-top-bar {
    background: #4E474C;
    padding: 20rpx 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 24rpx;
    color:#FFE3BB;
    
    .trip-type {
      font-size: 26rpx;
    }
    
    .trip-date {
      flex: 1;
      text-align: center;
      font-size: 26rpx;
    }
    
    .duration-label {
      font-size: 26rpx;
    }
  }
  
  .flight-main {
    padding: 50rpx 30rpx 30rpx;
  }
  
  .route-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40rpx;
    
    .departure, .arrival {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .time {
        font-size: 60rpx;
        // font-weight: bold;
        color: #fff;
        margin-bottom: 15rpx;
        line-height: 1;
      }
      
      .terminal {
        font-size: 28rpx;
        color: #FCDDA6;
      }
    }
    
    .duration {
      flex: 0 0 200rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .arrow-img {
        width: 180rpx;
        height: 40rpx;
      }
    }
  }
  
  .flight-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15rpx;
    
    .plane-icon {
      width: 32rpx;
      height: 32rpx;
    }
    
    .flight-info {
      font-size: 28rpx;
      color: #fff;
    }
  }
}

.seat-list {
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding: 0 10rpx;
  }
  
  .seat-item {
    background: #1E1F34;
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    margin: 0 20rpx 20rpx 20rpx;
    
    .seat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .seat-name-row {
        display: flex;
        align-items: center;
        gap: 15rpx;
        
        .seat-name {
          font-size: 32rpx;
          font-weight: 600;
          color: #fff;
        }
        
        .discount {
          font-size: 24rpx;
          color: #FFE3BB;
          background: #4E474C;
          padding: 4rpx 12rpx;
          border-radius: 4rpx;
          border:1px solid #FFE3BB

        }
        
        .special-tag {
          font-size: 22rpx;
          color: #021745;
          background: linear-gradient(115.46deg, #F4BE66 0.67%, #FEE3B2 55.65%, #F3BC62 94.35%);
          padding: 4rpx 12rpx;
          border-radius: 4rpx;
        }
      }
      
      .seat-count {
        font-size: 24rpx;
        color: #fff;
      }
    }

    .price-summary {
      margin: 10rpx 0 20rpx;
      padding: 20rpx;
      background: #1E1F34;
      border-radius: 12rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .summary-left {
        display: flex;
        flex-direction: column;
        gap: 6rpx;

        .price-title {
          font-size: 24rpx;
          color: #fff;
        }
        .price-value {
          font-size: 36rpx;
          font-weight: bold;
          background: linear-gradient(90deg, #F3BC63 0%, #FFE6B6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .tax-desc {
          font-size: 22rpx;
          color: #fff;
        }
      }

      .summary-right .book-btn {
        background: linear-gradient(107.61deg, #F3BD65 4.52%, #FEE3B1 100%);
        color: #000000;
        border: none;
        padding: 16rpx 36rpx;
        border-radius: 28rpx;
        font-size: 28rpx;
      }
    }

    .toggle-row {
      margin-top: 6rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
      font-size: 26rpx;
      padding: 12rpx 0;
      border-top: 1px dashed #e7eef9;
    }
    
    .price-list {
      margin-bottom: 20rpx;
      
      .price-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx;
        background: #1E1F34;
        margin-bottom: 15rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .price-left {
          flex: 1;
          
          .passenger-type {
            display: block;
            font-size: 28rpx;
            font-weight: 600;
            color: #fff;
            margin-bottom: 8rpx;
          }
          
          .price-desc {
            display: block;
            font-size: 24rpx;
            color: #fff;
            margin-bottom: 5rpx;
          }
          
          .tax-desc {
            display: block;
            font-size: 24rpx;
            color: #fff;
          }
        }
        
        .price-right {
          text-align: right;
          
          .total-price {
            display: block;
            font-size: 40rpx;
            font-weight: bold;
            background: linear-gradient(90deg, #F3BC63 0%, #FFE6B6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 5rpx;
          }
          
          .price-label {
            display: block;
            font-size: 22rpx;
            color: #fff;
          }
        }
      }
    }
    
    .ticket-rules {
      padding-top: 20rpx;
      border-top: 1px solid #f0f0f0;
      
      .rule-item {
        margin-bottom: 15rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .rule-details {
          margin-bottom: 10rpx;
          
          .rule-detail-item {
            font-size: 24rpx;
            color: #FFF;
            line-height: 1.6;
            margin-bottom: 8rpx;
            
            .rule-type {
              color: #E4E3E3;
              font-weight: 500;
            }
            
            .rule-desc {
              color: #E4E3E3;
            }
          }
        }
        
        .luggage-info {
          font-size: 24rpx;
          color: #666;
          line-height: 1.6;
          
          .luggage-label {
            color: #fff;
            font-weight: 500;
          }
          
          .luggage-desc {
            color: #E4E3E3;
          }
        }
      }
    }
    
    .book-action {
      display: flex;
      justify-content: flex-end;
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 1px solid #f0f0f0;
      
      .book-btn {
        background: linear-gradient(90deg, #FFC966, #F8D07C);
        color: #000000;
        font-size: 28rpx;
        font-weight: 600;
        padding: 15rpx 50rpx;
        border-radius: 50rpx;
        border: none;
        
        &::after {
          border: none;
        }
      }
    }
  }
}

.loading, .error {
  text-align: center;
  padding: 100rpx 30rpx;
  font-size: 28rpx;
  color: #999;
}

.error {
  color: #ff4444;
}
</style>


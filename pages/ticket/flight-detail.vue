<template>
  <view class="page">
    <scroll-view scroll-y class="content" v-if="detail">
      <!-- 航班基本信息 -->
      <view class="flight-info-card">
        <view class="flight-header">
          <view class="flight-no">{{ detail.flightNo || '—' }}</view>
          <view class="airline">{{ detail.carrierName || '—' }}</view>
        </view>
        
        <view class="route-info">
          <view class="departure">
            <text class="time">{{ formatTime(detail.depTime) }}</text>
            <text class="airport">{{ detail.depAirportName || '—' }}</text>
            <text class="terminal" v-if="detail.depTerminal">T{{ detail.depTerminal }}</text>
          </view>
          <view class="duration">
            <text class="duration-text">{{ formatDuration(detail.depTime, detail.arrTime) }}</text>
            <text class="arrow">→</text>
          </view>
          <view class="arrival">
            <text class="time">{{ formatTime(detail.arrTime) }}</text>
            <text class="airport">{{ detail.arrAirportName || '—' }}</text>
            <text class="terminal" v-if="detail.arrTerminal">T{{ detail.arrTerminal }}</text>
          </view>
        </view>
        
        <view class="flight-meta">
          <text v-if="detail.planeCnName" class="meta-item">{{ detail.planeCnName }}</text>
          <text v-if="detail.distance" class="meta-item">距离 {{ detail.distance }}km</text>
          <text v-if="detail.stopNum > 0" class="meta-item">经停 {{ detail.stopNum }}次</text>
          <text v-if="formatMeal(detail.meal)" class="meta-item">{{ formatMeal(detail.meal) }}</text>
        </view>
      </view>

      <!-- 舱位价格列表 -->
      <view class="seat-list">
        <view class="section-title">选择舱位</view>
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
            <text class="toggle-text">{{ seat.expanded ? '收起详情' : '展开详情' }}</text>
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
                    <text class="rule-desc">{{ detail.detailFeeDesc || '具体规则以航司为准' }}</text>
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
      
      // 跳转到乘客信息页面 - 不要预先编码，统一在构建 queryString 时编码
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
        route_id: this.detail.routeId || this.routeId || '',
        dep_airport: this.detail.depAirportCode || '',
        arr_airport: this.detail.arrAirportCode || '',
        dep_city: this.detail.depCityName || '',
        arr_city: this.detail.arrCityName || '',
        airline_name: this.detail.carrierName || '',
        dep_time: this.formatTime(this.detail.depTime),
        arr_time: this.formatTime(this.detail.arrTime)
      }
      
      // 统一在这里编码一次
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
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
  background: #f5f5f5;
}

.content {
  padding: 20rpx;
  padding-bottom: 40rpx;
}

.flight-info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .flight-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;
    
    .flight-no {
      font-size: 40rpx;
      font-weight: bold;
      color: #1A4A8F;
    }
    
    .airline {
      font-size: 28rpx;
      color: #666;
    }
  }
  
  .route-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;
    
    .departure, .arrival {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .time {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
      }
      
      .airport {
        font-size: 26rpx;
        color: #666;
        margin-bottom: 5rpx;
      }
      
      .terminal {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .duration {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .duration-text {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 10rpx;
      }
      
      .arrow {
        font-size: 28rpx;
        color: #ccc;
      }
    }
  }
  
  .flight-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    padding-top: 20rpx;
    border-top: 1px solid #f0f0f0;
    
    .meta-item {
      font-size: 24rpx;
      color: #999;
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
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
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
          color: #333;
        }
        
        .discount {
          font-size: 24rpx;
          color: #FF7A00;
          background: #FFF4E6;
          padding: 4rpx 12rpx;
          border-radius: 4rpx;
        }
        
        .special-tag {
          font-size: 22rpx;
          color: #fff;
          background: #FF7A00;
          padding: 4rpx 12rpx;
          border-radius: 4rpx;
        }
      }
      
      .seat-count {
        font-size: 24rpx;
        color: #999;
      }
    }

    .price-summary {
      margin: 10rpx 0 20rpx;
      padding: 20rpx;
      background: #f9fbff;
      border: 1px solid #e7eef9;
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
          color: #666;
        }
        .price-value {
          font-size: 36rpx;
          font-weight: bold;
          color: #1A4A8F;
        }
        .tax-desc {
          font-size: 22rpx;
          color: #999;
        }
      }

      .summary-right .book-btn {
        background: linear-gradient(90deg, #2F80ED, #56CCF2);
        color: #fff;
        border: none;
        padding: 16rpx 36rpx;
        border-radius: 50rpx;
        font-size: 28rpx;
      }
    }

    .toggle-row {
      margin-top: 6rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #1A4A8F;
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
        background: #f8f8f8;
        border-radius: 12rpx;
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
            color: #333;
            margin-bottom: 8rpx;
          }
          
          .price-desc {
            display: block;
            font-size: 24rpx;
            color: #666;
            margin-bottom: 5rpx;
          }
          
          .tax-desc {
            display: block;
            font-size: 24rpx;
            color: #999;
          }
        }
        
        .price-right {
          text-align: right;
          
          .total-price {
            display: block;
            font-size: 40rpx;
            font-weight: bold;
            color: #FF7A00;
            margin-bottom: 5rpx;
          }
          
          .price-label {
            display: block;
            font-size: 22rpx;
            color: #999;
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
            color: #666;
            line-height: 1.6;
            margin-bottom: 8rpx;
            
            .rule-type {
              color: #333;
              font-weight: 500;
            }
            
            .rule-desc {
              color: #666;
            }
          }
        }
        
        .luggage-info {
          font-size: 24rpx;
          color: #666;
          line-height: 1.6;
          
          .luggage-label {
            color: #333;
            font-weight: 500;
          }
          
          .luggage-desc {
            color: #666;
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
        color: #1A4A8F;
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


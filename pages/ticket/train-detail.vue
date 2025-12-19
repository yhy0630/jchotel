<template>
  <view class="page">
    <scroll-view scroll-y class="content" v-if="detail">
      <!-- 顶部信息栏 -->
      <view class="train-info-card">
        <view class="train-top-bar">
          <text class="trip-type">单程</text>
          <text class="trip-date">{{ formatDateDisplay(detail.departureDate || detail.fromDate) }} {{ detail.fromStation || detail.departureStationName || '—' }}-{{ detail.toStation || detail.arrivalStationName || '—' }}</text>
          <text class="duration-label">总时长 {{ formatDuration(detail.usedMinutes || detail.spanTime || detail.duration) }}</text>
        </view>

        <!-- 车次路线信息 -->
        <view class="train-main">
        <view class="route-header">
          <text class="duration-label">当日到达</text>
          <text class="duration-value">{{ formatDuration(detail.usedMinutes || detail.spanTime || detail.duration) }}</text>
        </view>
        
        <view class="route-main">
          <view class="time-block">
            <text class="time">{{ formatTimeDisplay(detail.fromTime || detail.departureTime) }}</text>
            <text class="station">{{ detail.fromStation || detail.departureStationName || '—' }}</text>
          </view>
          
          <view class="route-line">
            <image class="arrow-img" src="/static/images/箭头大.png" mode="aspectFit"></image>
            <text class="train-no">{{ detail.trainNo || '—' }}</text>
          </view>
          
          <view class="time-block">
            <text class="time">{{ formatTimeDisplay(detail.toTime || detail.arrivalTime) }}</text>
            <text class="station">{{ detail.toStation || detail.arrivalStationName || '—' }}</text>
          </view>
        </view>
        
        <!-- 虚线分割 -->
        <view class="divider-line"></view>
        
        <!-- 座位选择 -->
        <scroll-view scroll-x class="seat-selection" scroll-with-animation>
          <view class="seat-list">
            <view 
              v-for="(seat, index) in seatList" 
              :key="index" 
              class="seat-option"
              :class="{ disabled: !canBookSeat(seat), selected: selectedSeatIndex === index }"
              @click="selectSeat(index)"
            >
              <view class="seat-header">
                <text class="seat-name">{{ seat.name || seat.seatName || seat.seatCode || '—' }}</text>
                <text class="seat-discount" v-if="seat.discount">{{ seat.discount }}</text>
              </view>
              <view class="seat-price-info">
                <text class="seat-price">¥{{ formatPrice(seat.display_price || seat.price || seat.seatPrice || 0) }}</text>
                <text class="seat-status">/{{ seat.inventory !== undefined && seat.inventory !== null ? (seat.inventory > 0 ? '有票' : '无票') : '有票' }}</text>
              </view>
              <image v-if="selectedSeatIndex === index" class="check-mark" src="/static/images/勾号组合.png" mode="aspectFit"></image>
            </view>
            
            <view v-if="seatList.length === 0" class="empty-seats">
              <text>暂无座位信息</text>
            </view>
          </view>
        </scroll-view>
        </view>
      </view>

      <!-- 购票信息 -->
      <view class="booking-info">
        <view class="info-left">
          <image class="info-icon" src="/static/images/12306.png" mode="aspectFit"></image>
          <view class="info-text">
            <text class="info-title">12306购票</text>
            <text class="info-desc">12306支持05:00~23:30出票</text>
          </view>
        </view>
        <button class="booking-btn" @click="confirmBooking">预定</button>
      </view>
    </scroll-view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading">加载中...</view>
    
    <!-- 错误提示 -->
    <view v-if="error" class="error">{{ error }}</view>
  </view>
</template>

<script>
import { trainDetail } from '@/api/train.js'

export default {
  data() {
    return {
      detail: null,
      seatList: [],
      selectedSeatIndex: -1,
      loading: true,
      error: '',
      trainNo: '',
      departureDate: '',
      fromStation: '',
      toStation: '',
      fromStationName: '',
      toStationName: ''
    }
  },
  onLoad(options) {
    console.log('train-detail onLoad options:', options)
    
    // 接收从列表页传递的参数
    this.trainNo = decodeURIComponent(options.train_no || options.train_code || '')
    this.departureDate = decodeURIComponent(options.departure_date || '')
    this.fromStation = decodeURIComponent(options.from_station || '')
    this.toStation = decodeURIComponent(options.to_station || '')
    this.fromStationName = decodeURIComponent(options.from_station_name || '')
    this.toStationName = decodeURIComponent(options.to_station_name || '')
    
    if (!this.trainNo || !this.departureDate) {
      this.error = '缺少必要参数：车次号或出发日期'
      this.loading = false
      return
    }
    
    this.loadDetail()
  },
  methods: {
    // 日期展示：YYYY-MM-DD => 7月20日 周六
    formatDateDisplay(dateStr) {
      if (!dateStr) return '—'
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

    // 时间展示：支持 HH:MM / 时间戳 / 日期时间字符串
    formatTimeDisplay(time) {
      if (!time) return '—'
      if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
        return time
      }
      if (typeof time === 'number' || /^\d+$/.test(time)) {
        const date = new Date(parseInt(time))
        const h = String(date.getHours()).padStart(2, '0')
        const m = String(date.getMinutes()).padStart(2, '0')
        return `${h}:${m}`
      }
      if (typeof time === 'string' && time.length >= 16) {
        return time.substr(11, 5)
      }
      return time
    },
    async loadDetail() {
      this.loading = true
      this.error = ''
      
      try {
        const params = {
          train_no: this.trainNo,
          departure_date: this.departureDate
        }
        
        // 传递出发站和到达站信息，用于查询详情（这些参数是必需的）
        if (this.fromStationName) {
          params.from_station_name = this.fromStationName
        }
        if (this.toStationName) {
          params.to_station_name = this.toStationName
        }
        if (this.fromStation) {
          params.from_station = this.fromStation
        }
        if (this.toStation) {
          params.to_station = this.toStation
        }
        
        // 如果没有出发站和到达站信息，给出提示
        if (!this.fromStationName || !this.toStationName) {
          console.warn('缺少出发站或到达站信息，可能无法获取车次详情')
        }
        
        console.log('请求车次详情参数:', params)
        
        const res = await trainDetail(params)
        console.log('车次详情响应:', res)
        
        if (res.code === 1) {
          this.detail = res.data || {}
          
          // 根据接口文档，字段名可能是 fromStation/toStation 或 departureStationName/arrivalStationName
          // 统一处理字段名
          if (!this.detail.fromStation && this.detail.departureStationName) {
            this.detail.fromStation = this.detail.departureStationName
          }
          if (!this.detail.toStation && this.detail.arrivalStationName) {
            this.detail.toStation = this.detail.arrivalStationName
          }
          
          // 如果没有车站名称，使用传入的参数
          if (!this.detail.fromStation && this.fromStationName) {
            this.detail.fromStation = this.fromStationName
            this.detail.departureStationName = this.fromStationName
          }
          if (!this.detail.toStation && this.toStationName) {
            this.detail.toStation = this.toStationName
            this.detail.arrivalStationName = this.toStationName
          }
          
          // 处理时间字段
          if (!this.detail.fromTime && this.detail.departureTime) {
            this.detail.fromTime = this.detail.departureTime
          }
          if (!this.detail.toTime && this.detail.arrivalTime) {
            this.detail.toTime = this.detail.arrivalTime
          }
          
          // 处理日期字段
          if (!this.detail.departureDate && this.detail.fromDate) {
            this.detail.departureDate = this.detail.fromDate
          }
          
          // 处理座位列表（根据接口文档，字段名是 seatDetails）
          const rawSeatList = this.detail.seatDetails || this.detail.seats || []
          console.log('原始座位数据:', rawSeatList)
          this.seatList = this.prepareSeatList(rawSeatList)
          console.log('处理后的座位列表数量:', this.seatList.length)
        } else {
          this.error = res.msg || '获取车次详情失败'
        }
      } catch (e) {
        console.error('加载车次详情失败:', e)
        this.error = e.msg || '加载失败，请重试'
      } finally {
        this.loading = false
      }
    },
    
    formatDuration(duration) {
      if (!duration && duration !== 0) return '—'
      
      // 如果是数字（分钟数，根据接口文档 usedMinutes 是数字）
      if (typeof duration === 'number') {
        const hours = Math.floor(duration / 60)
        const minutes = duration % 60
        if (hours > 0) {
          return `${hours}小时${minutes}分钟`
        }
        return `${minutes}分钟`
      }
      
      // 如果是字符串格式的数字（如 "15"）
      if (typeof duration === 'string' && /^\d+$/.test(duration)) {
        const minutes = parseInt(duration)
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours > 0) {
          return `${hours}小时${mins}分钟`
        }
        return `${mins}分钟`
      }
      
      // 如果是字符串格式 "03:27"
      if (typeof duration === 'string' && duration.includes(':')) {
        const parts = duration.split(':')
        if (parts.length === 2) {
          const hours = parseInt(parts[0]) || 0
          const minutes = parseInt(parts[1]) || 0
          if (hours > 0) {
            return `${hours}小时${minutes}分钟`
          }
          return `${minutes}分钟`
        }
      }
      
      // 如果是 "3小时27分钟" 格式
      if (typeof duration === 'string' && duration.includes('小时')) {
        return duration
      }
      
      return duration
    },
    
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      return numPrice.toFixed(2)
    },
    
    prepareSeatList(list) {
      if (!Array.isArray(list) || list.length === 0) {
        return []
      }
      
      // 座位代码到中文名称的映射
      const seatCodeMap = {
        'yz': '硬座',
        'edz': '二等座',
        'ydz': '一等座',
        'swz': '商务座',
        'yw': '硬卧',
        'rw': '软卧',
        'rz': '软座',
        'wz': '无座',
        'yws': '硬卧上铺',
        'ywz': '硬卧中铺',
        'ywx': '硬卧下铺',
        'rws': '软卧上铺',
        'rwx': '软卧下铺'
      }
      
      // 根据座位代码获取中文名称
      const getSeatNameByCode = (code, defaultName) => {
        if (defaultName) return defaultName
        if (code && seatCodeMap[code]) {
          return seatCodeMap[code]
        }
        return defaultName || '—'
      }
      
      const seatList = []
      
      list.forEach((item, index) => {
        console.log(`处理座位项 ${index}:`, item)
        // 根据接口文档，seatDetails 中的字段名是 seatCode, seatName, seatInventory, seatPrice
        const seatCode = item.seatCode || item.code || ''
        const seatName = item.seatName || item.name || ''
        console.log(`座位项 ${index} - seatCode: ${seatCode}, seatName: ${seatName}`)
        const finalSeatName = getSeatNameByCode(seatCode, seatName)
        console.log(`座位项 ${index} - finalSeatName: ${finalSeatName}`)
        const seatPrice = parseFloat(item.seatPrice || item.price || 0)
        const seatInventory = item.seatInventory !== undefined ? parseInt(item.seatInventory) : (item.inventory !== undefined ? parseInt(item.inventory) : null)
        
        // 检查是否有嵌套的 seatInfoList（上下铺信息）
          const seatInfoList = item.seatInfoList || []
        
        // 判断是否有有效的子座位（如硬卧上铺、中铺、下铺等有意义的细分）
        // 如果子座位的 seatCode 是 "0" 或 "1"，或者 seatName 是"座位"，说明是无效数据，应该跳过
        const hasValidSubSeats = seatInfoList && Array.isArray(seatInfoList) && seatInfoList.length > 0 && 
          seatInfoList.some(sub => {
            const subCode = sub.seatCode || ''
            const subName = sub.seatName || ''
            // 有效的子座位应该是：seatCode 不是 "0" 或 "1"，且 seatName 不是"座位"，且与父级不同
            return subCode && 
                   subCode !== '0' && 
                   subCode !== '1' && 
                   subCode !== seatCode && 
                   subName && 
                   subName !== '座位'
          })
        
        if (hasValidSubSeats) {
          // 如果有有效的嵌套座位信息（如硬卧上铺、中铺、下铺），分别展示
          seatInfoList.forEach(subSeat => {
            const subSeatCode = subSeat.seatCode || ''
            const subSeatName = subSeat.seatName || subSeat.name || ''
            
            // 跳过无效的子座位数据
            if (subSeatCode === '0' || 
                subSeatCode === '1' || 
                subSeatCode === seatCode || 
                subSeatName === '座位') {
              return
            }
            
            const finalSubSeatName = getSeatNameByCode(subSeatCode, subSeatName) || `${finalSeatName}${subSeatName ? '-' + subSeatName : ''}`
            const subSeatPrice = parseFloat(subSeat.seatPrice || subSeat.price || seatPrice)
            const subSeatInventory = subSeat.seatInventory !== undefined ? parseInt(subSeat.seatInventory) : seatInventory
            
            seatList.push({
              ...subSeat,
              expanded: false,
              hasDetails: true,
              // 统一字段名
              name: finalSubSeatName,
              code: subSeatCode,
              seatCode: subSeatCode,
              seatName: finalSubSeatName,
              price: subSeatPrice,
              display_price: parseFloat(subSeat.display_price || subSeatPrice),
              original_price: parseFloat(subSeat.original_price || subSeatPrice),
              seatPrice: subSeatPrice,
              inventory: subSeatInventory,
              seatInventory: subSeatInventory,
              // 保留父级信息
              parentSeatName: finalSeatName,
              parentSeatCode: seatCode
            })
          })
        }
        
        // 无论是否有子项，都显示主座位（如果主座位有有效数据）
        // 这是最重要的，因为主座位包含了正确的座位类型名称（如"二等座"、"一等座"等）
        if (seatCode && finalSeatName && finalSeatName !== '—') {
          const hasDetails = !!(item.seatCode || item.seatName || item.seatPrice)
          
          seatList.push({
            ...item,
            expanded: false,
            hasDetails: hasDetails,
            // 统一字段名，确保使用映射后的名称
            name: finalSeatName,
            code: seatCode,
            seatCode: seatCode,
            seatName: finalSeatName,
            price: seatPrice,
            display_price: parseFloat(item.display_price || seatPrice),
            original_price: parseFloat(item.original_price || seatPrice),
            seatPrice: seatPrice,
            inventory: seatInventory,
            seatInventory: seatInventory
          })
        }
      })
      
      console.log('处理后的座位列表:', seatList)
      
      return seatList
    },

    toggleSeat(index) {
      const seat = this.seatList[index]
      if (!seat || !seat.hasDetails) return
      this.$set(this.seatList, index, { ...seat, expanded: !seat.expanded })
    },
    
    canBookSeat(seat) {
      // 根据接口文档：canBook "0" 表示正常售票，"-1" 或 "1" 表示不可购票
      // isStop "1" 表示停运
      if (this.detail.isStop === '1' || this.detail.isStop === 1) {
        return false
      }
      
      // canBook === '0' 表示可以预订，其他值表示不可预订
      if (this.detail.canBook !== '0' && this.detail.canBook !== 0) {
        return false
      }
      
      // 检查座位库存
      if (seat.inventory !== undefined && seat.inventory !== null) {
        if (parseInt(seat.inventory) <= 0) {
          return false
        }
      }
      
      // 检查价格
      const price = parseFloat(seat.display_price || seat.price || seat.seatPrice || 0)
      if (price <= 0) {
        return false
      }
      
      return true
    },
    
    selectSeat(index) {
      const seat = this.seatList[index]
      if (!this.canBookSeat(seat)) {
        uni.showToast({ title: '该座位不可预订', icon: 'none' })
        return
      }
      this.selectedSeatIndex = index
    },
    
    confirmBooking() {
      if (this.selectedSeatIndex === -1) {
        uni.showToast({ title: '请先选择座位', icon: 'none' })
        return
      }
      const seat = this.seatList[this.selectedSeatIndex]
      this.goBook(seat)
    },
    
    goBook(seat) {
      if (!this.canBookSeat(seat)) {
        uni.showToast({ title: '该座位不可预订', icon: 'none' })
        return
      }
      
      const price = parseFloat(seat.display_price || seat.price || 0)
      
      // 跳转到乘客信息页面
      const params = {
        type: 'train',
        train_no: this.detail.trainNo || this.trainNo || '',
        departure_date: this.detail.departureDate || this.detail.fromDate || this.departureDate,
        price: price,
        display_price: price, // 火车票无税费，展示价即总价
        original_price: parseFloat(seat.original_price || seat.price || 0),
        price_type: this.detail.price_type || 2,
        price_type_text: this.detail.price_type_text || '尊享价',
        seat_code: seat.code || seat.seatCode || '',
        seat_name: seat.name || seat.seatName || '',
        from_station: this.detail.fromStationCode || this.fromStation || '',
        to_station: this.detail.toStationCode || this.toStation || '',
        from_station_name: this.detail.fromStation || this.detail.departureStationName || this.fromStationName || '',
        to_station_name: this.detail.toStation || this.detail.arrivalStationName || this.toStationName || '',
        from_time: this.detail.fromTime || this.detail.departureTime || '',
        to_time: this.detail.toTime || this.detail.arrivalTime || '',
        span_time: this.detail.spanTime || '',
        used_minutes: this.detail.usedMinutes || '',
        train_type: this.detail.trainType || '',
        start_station: this.detail.startStation || '',
        end_station: this.detail.endStation || '',
        is_fxh: this.detail.isFxh || '0',
        is_zndcz: this.detail.isZndcz || '0',
        // 火车票无机建/燃油，强制为 0，避免后续页面显示
        airport_tax: 0,
        fuel_tax: 0
      }
      
      // 统一在这里编码一次
      const queryString = Object.keys(params)
        .filter(key => params[key]) // 过滤空值
        .map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
        .join('&')
      
      console.log('跳转到乘客信息页:', `/pages/ticket/passenger-info?${queryString}`)
      
      uni.navigateTo({
        url: `/pages/ticket/train-passenger?${queryString}`,
        fail: (err) => {
          console.error('跳转失败:', err)
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
}

.content {
  padding-bottom: 180rpx;
}

.train-info-card {
  background: #1E1F34;
  overflow: hidden;
  margin-bottom: 20rpx;
  
  .train-top-bar {
    background: #4E474C;
    padding: 20rpx 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 24rpx;
    color: #FFE3BB;
    
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
}

.train-main {
  padding: 30rpx 24rpx;
  
  .route-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    margin-bottom: 10rpx;
    
    .duration-label {
      font-size: 22rpx;
      color: #d3d6e0;
    }
    
    .duration-value {
      font-size: 22rpx;
      color: #FCDDA6;
    }
  }
  
  .route-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    
    .time-block {
      display: flex;
      flex-direction: column;
      align-items: center; 
      
      .time {
        font-size: 48rpx;
        font-weight: 700;
        color: #ffffff;
        line-height: 1.2;
        margin-bottom: 8rpx;
      }
      
      .station {
        font-size: 30rpx;
        color: #FCDDA6;
      }
    }
    
    .route-line {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      
      .arrow-img {
        width: 200rpx;
        height: 40rpx;
      }
      
      .train-no {
        font-size: 20rpx;
        color: #d3d6e0;
      }
    }
  }
}

.divider-line {
  margin: 20rpx 0;
  height: 1rpx;
  background: repeating-linear-gradient(
    to right,
    #d3d6e0 0,
    #d3d6e0 8rpx,
    transparent 8rpx,
    transparent 16rpx
  );
}

.seat-selection {
  padding: 0 0 20rpx 0;
  white-space: nowrap;
  
  .seat-list {
    display: inline-flex;
    gap: 16rpx;
    // padding: 0 24rpx;
  }
  
  .seat-option {
    display: inline-block;
    min-width: 200rpx;
    background: #353548;
    border-radius: 16rpx;
    padding: 20rpx 24rpx;
    border: 2rpx solid #ffffff;
    position: relative;
    
    &.selected {
      background: #4E474C;
      border-color: #FCDDA6;
      
      .seat-name {
        color: #FCDDA6;
      }
      
      .seat-discount {
        color: #FCDDA6;
      }
      
      .seat-price {
        color: #FCDDA6;
      }
      
      .seat-status {
        color: #FCDDA6;
      }
    }
    
    &.disabled {
      opacity: 0.5;
      border-color: #666;
    }
    
    .seat-header {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 12rpx;
      
      .seat-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #ffffff;
      }
      
      .seat-discount {
        font-size: 20rpx;
        color: #ffffff;
      }
    }
    
    .seat-price-info {
      display: flex;
      align-items: baseline;
      
      .seat-price {
        font-size: 24rpx;
        color: #ffffff;
        font-weight: 500;
      }
      
      .seat-status {
        font-size: 20rpx;
        color: #ffffff;
      }
    }
    
    .check-mark {
      position: absolute;
      right: 0rpx;
      bottom: 0rpx;
      width: 40rpx;
      height: 40rpx;
    }
  }
  
  .empty-seats {
    display: inline-block;
    text-align: center;
    padding: 60rpx 30rpx;
    font-size: 28rpx;
    color: #999;
  }
}

.booking-info {
  background: #2C2D42;
  margin: 20rpx 16rpx;
  border-radius: 18rpx;
  padding: 24rpx 0rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  
  .info-left {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 20rpx;
    
    .info-icon {
      margin-left: 20rpx;
      width: 80rpx;
      height: 80rpx;
      flex-shrink: 0;
    }
    
    .info-text {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      
      .info-title {
        font-size: 32rpx;
        color: #ffffff;
        font-weight: 600;
      }
      
      .info-desc {
        font-size: 24rpx;
        color: #d3d6e0;
      }
    }
  }
  
  .booking-btn {
    flex: 0 0 auto;
    background: linear-gradient(90deg, #F4BD68 0%, #FEE0AC 50.32%, #F4BE68 100%);
    color: #1E1F34;
    font-size: 32rpx;
    font-weight: 700;
    padding: 0rpx 50rpx;
    border-radius: 48rpx;
    border: none;
    color: #380c00;
    margin-right: 20rpx;
    &::after {
      border: none;
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


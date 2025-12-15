<template>
  <view class="page">
    <scroll-view scroll-y class="content" v-if="detail">
      <!-- 车次基本信息 -->
      <view class="train-info-card">
        <view class="train-header">
          <view class="train-no">{{ detail.trainNo || '—' }}</view>
          <view class="train-type" v-if="detail.trainType">{{ detail.trainType }}</view>
          <view v-if="detail.isFxh === '1'" class="train-badge">复兴号</view>
          <view v-if="detail.isZndcz === '1'" class="train-badge">智能动车组</view>
        </view>
        
        <view class="route-info">
          <view class="departure">
            <text class="time">{{ detail.fromTime || detail.departureTime || '—' }}</text>
            <text class="station">{{ detail.fromStation || detail.departureStationName || '—' }}</text>
          </view>
          <view class="duration">
            <text class="duration-text">{{ formatDuration(detail.usedMinutes || detail.spanTime || detail.duration) }}</text>
            <view class="line">
              <text class="dot"></text>
              <text class="line-dash"></text>
              <text class="train-icon">🚄</text>
            </view>
          </view>
          <view class="arrival">
            <text class="time">{{ detail.toTime || detail.arrivalTime || '—' }}</text>
            <text class="station">{{ detail.toStation || detail.arrivalStationName || '—' }}</text>
          </view>
        </view>
        
        <view class="train-meta">
          <text v-if="detail.departureDate || detail.fromDate" class="meta-item">出发日期：{{ detail.departureDate || detail.fromDate }}</text>
          <text v-if="detail.isStop === '1' || detail.isStop === 1" class="meta-item warning">已停运</text>
          <text v-else-if="detail.canBook !== '0' && detail.canBook !== 0" class="meta-item warning">不可预订</text>
        </view>
      </view>

      <!-- 座位价格列表 -->
      <view class="seat-list">
        <view class="section-title">选择座位类型</view>
        <view 
          v-for="(seat, index) in seatList" 
          :key="index" 
          class="seat-item"
          :class="{ disabled: !canBookSeat(seat) }"
        >
          <view class="seat-header">
            <view class="seat-name-row">
              <text class="seat-name">{{ seat.name || seat.seatName || seat.seatCode || '—' }}</text>
              <text v-if="seat.inventory !== undefined && seat.inventory !== null" class="inventory-tag">
                余{{ seat.inventory || seat.seatInventory || 0 }}
              </text>
            </view>
            <view class="seat-price-row">
              <text class="price-label">{{ detail.price_type_text || '尊享价' }}</text>
              <text class="price-value">¥{{ formatPrice(seat.display_price || seat.price || seat.seatPrice || 0) }}</text>
            </view>
          </view>

          <!-- 价格明细（可展开） -->
          <view class="toggle-row" @click="toggleSeat(index)" v-if="seat.hasDetails">
            <text class="toggle-text">{{ seat.expanded ? '收起详情' : '展开详情' }}</text>
            <text class="toggle-arrow">{{ seat.expanded ? '▲' : '▼' }}</text>
          </view>

          <!-- 详细信息（可折叠） -->
          <view v-if="seat.expanded && seat.hasDetails" class="seat-details">
            <view class="detail-item">
              <text class="detail-label">座位类型：</text>
              <text class="detail-value">{{ seat.name || seat.seatName || '—' }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">座位代码：</text>
              <text class="detail-value">{{ seat.code || seat.seatCode || '—' }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">票面价：</text>
              <text class="detail-value">¥{{ formatPrice(seat.original_price || seat.price || seat.seatPrice || 0) }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">{{ detail.price_type_text || '尊享价' }}：</text>
              <text class="detail-value highlight">¥{{ formatPrice(seat.display_price || seat.price || seat.seatPrice || 0) }}</text>
            </view>
            <view class="detail-item" v-if="seat.inventory !== undefined && seat.inventory !== null">
              <text class="detail-label">余票：</text>
              <text class="detail-value">{{ seat.inventory || seat.seatInventory || 0 }}张</text>
            </view>
          </view>

          <!-- 订票按钮 -->
          <view class="book-action">
            <button 
              class="book-btn" 
              :class="{ disabled: !canBookSeat(seat) }"
              @click.stop="goBook(seat)"
              :disabled="!canBookSeat(seat)"
            >
              {{ canBookSeat(seat) ? '订票' : '不可预订' }}
            </button>
          </view>
        </view>
        
        <view v-if="seatList.length === 0" class="empty-seats">
          <text>暂无座位信息</text>
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
import { trainDetail } from '@/api/train.js'

export default {
  data() {
    return {
      detail: null,
      seatList: [],
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
        is_zndcz: this.detail.isZndcz || '0'
      }
      
      // 统一在这里编码一次
      const queryString = Object.keys(params)
        .filter(key => params[key]) // 过滤空值
        .map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
        .join('&')
      
      console.log('跳转到乘客信息页:', `/pages/ticket/passenger-info?${queryString}`)
      
      uni.navigateTo({
        url: `/pages/ticket/passenger-info?${queryString}`,
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
  background: #f5f5f5;
}

.content {
  padding: 20rpx;
  padding-bottom: 40rpx;
}

.train-info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .train-header {
    display: flex;
    align-items: center;
    gap: 15rpx;
    margin-bottom: 30rpx;
    
    .train-no {
      font-size: 40rpx;
      font-weight: bold;
      color: #1A4A8F;
    }
    
    .train-type {
      font-size: 26rpx;
      color: #666;
      padding: 4rpx 12rpx;
      background: #f5f5f5;
      border-radius: 4rpx;
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
      
      .station {
        font-size: 26rpx;
        color: #666;
      }
    }
    
    .duration {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 20rpx;
      
      .duration-text {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 10rpx;
      }
      
      .line {
        position: relative;
        width: 100%;
        height: 2rpx;
        background: #e0e0e0;
        
        .dot {
          position: absolute;
          left: 0;
          top: -4rpx;
          width: 10rpx;
          height: 10rpx;
          background: #999;
          border-radius: 50%;
        }
        
        .line-dash {
          position: absolute;
          left: 10rpx;
          right: 30rpx;
          top: 0;
          height: 2rpx;
          background: repeating-linear-gradient(
            to right,
            #e0e0e0 0,
            #e0e0e0 8rpx,
            transparent 8rpx,
            transparent 16rpx
          );
        }
        
        .train-icon {
          position: absolute;
          right: -10rpx;
          top: -10rpx;
          font-size: 24rpx;
        }
      }
    }
  }
  
  .train-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    padding-top: 20rpx;
    border-top: 1px solid #f0f0f0;
    
    .meta-item {
      font-size: 24rpx;
      color: #999;
      
      &.warning {
        color: #ff4444;
      }
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
    
    &.disabled {
      opacity: 0.6;
    }
    
    .seat-header {
      margin-bottom: 20rpx;
      
      .seat-name-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 15rpx;
        margin-bottom: 15rpx;
        
        .seat-name {
          font-size: 32rpx;
          font-weight: 600;
          color: #333;
          flex: 1;
        }
        
        .inventory-tag {
          font-size: 22rpx;
          color: #ff4444;
          background: #fff0f0;
          padding: 4rpx 12rpx;
          border-radius: 4rpx;
        }
      }
      
      .seat-price-row {
        display: flex;
        align-items: baseline;
        gap: 10rpx;
        
        .price-label {
          font-size: 24rpx;
          color: #999;
        }
        
        .price-value {
          font-size: 36rpx;
          font-weight: bold;
          color: #F8D07C;
        }
      }
    }

    .toggle-row {
      margin-top: 6rpx;
      margin-bottom: 15rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #1A4A8F;
      font-size: 26rpx;
      padding: 12rpx 0;
      border-top: 1px dashed #e7eef9;
    }
    
    .seat-details {
      padding: 20rpx;
      background: #f8f8f8;
      border-radius: 12rpx;
      margin-bottom: 20rpx;
      
      .detail-item {
        display: flex;
        align-items: center;
        padding: 12rpx 0;
        font-size: 26rpx;
        
        .detail-label {
          width: 160rpx;
          color: #666;
          flex-shrink: 0;
        }
        
        .detail-value {
          flex: 1;
          color: #333;
          
          &.highlight {
            color: #F8D07C;
            font-weight: 600;
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
        
        &.disabled {
          background: #e0e0e0;
          color: #999;
        }
      }
    }
  }
  
  .empty-seats {
    text-align: center;
    padding: 60rpx 30rpx;
    font-size: 28rpx;
    color: #999;
    background: #fff;
    border-radius: 16rpx;
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


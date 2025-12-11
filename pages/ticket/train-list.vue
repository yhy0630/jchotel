<template>
  <view class="page">
    <!-- 顶部路线信息 -->
    <view class="header">
      <text class="route">{{ departureStationName }}-{{ arrivalStationName }}</text>
    </view>

    <!-- 日期选择 -->
    <view class="date-bar">
      <scroll-view scroll-x class="date-scroll">
        <view 
          v-for="(date, index) in dateList" 
          :key="index"
          :class="['date-item', { active: selectedDateIndex === index }]"
          @click="selectDate(index)"
        >
          <text class="date-text">{{ date.dateText }}</text>
          <text class="week-text">{{ date.weekText }}</text>
        </view>
        <view class="date-item calendar" @click="showCalendar">
          <text class="calendar-icon">📅</text>
        </view>
      </scroll-view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" @click="showFilter = true">
        筛选
      </view>
      <view 
        v-for="filter in filters" 
        :key="filter.value"
        :class="['filter-item', { active: sortType === filter.value }]"
        @click="changeSort(filter.value)"
      >
        {{ filter.label }}
      </view>
    </view>
    
    <!-- 筛选弹窗 -->
    <u-popup v-model="showFilter" mode="bottom" height="60%">
      <view class="filter-popup">
        <view class="filter-header">
          <text class="filter-title">筛选</text>
          <text class="filter-close" @click="showFilter = false">×</text>
        </view>
        <view class="filter-content">
          <view class="filter-group">
            <text class="group-title">价格区间</text>
            <view class="price-range">
              <input type="number" v-model="filterPrice.min" placeholder="最低价" class="price-input" />
              <text class="price-separator">-</text>
              <input type="number" v-model="filterPrice.max" placeholder="最高价" class="price-input" />
            </view>
          </view>
          <view class="filter-group">
            <text class="group-title">出发时间</text>
            <view class="time-options">
              <view 
                v-for="time in timeOptions" 
                :key="time.value"
                :class="['time-option', { active: filterTime === time.value }]"
                @click="filterTime = time.value"
              >
                {{ time.label }}
              </view>
            </view>
          </view>
          <view class="filter-group">
            <text class="group-title">车次类型</text>
            <view class="train-type-options">
              <view 
                v-for="type in trainTypeOptions" 
                :key="type.value"
                :class="['train-type-option', { active: filterTrainTypes.includes(type.value) }]"
                @click="toggleTrainType(type.value)"
              >
                {{ type.label }}
              </view>
            </view>
          </view>
          <view class="filter-group">
            <text class="group-title">座位类型</text>
            <view class="seat-options">
              <view 
                v-for="seat in seatOptions" 
                :key="seat.value"
                :class="['seat-option', { active: filterSeatTypes.includes(seat.value) }]"
                @click="toggleSeatType(seat.value)"
              >
                {{ seat.label }}
              </view>
            </view>
          </view>
        </view>
        <view class="filter-footer">
          <button class="reset-btn" @click="resetFilter">重置</button>
          <button class="confirm-btn" @click="applyFilter">确定</button>
        </view>
      </view>
    </u-popup>

    <!-- 车次列表 -->
    <scroll-view scroll-y class="list" @scrolltolower="loadMore">
      <view v-for="(item, index) in list" :key="index" class="train-item" @click="goDetail(item)">
        <view class="time-info">
          <view class="departure">
            <text class="time">{{ item.departureTime }}</text>
            <text class="station">{{ item.departureStationName }}</text>
          </view>
          <view class="duration">
            <text class="duration-text">{{ item.duration || '02小时50分钟' }}</text>
            <view class="line">
              <text class="dot"></text>
              <text class="line-dash"></text>
              <text class="train-icon">🚄</text>
            </view>
          </view>
          <view class="arrival">
            <text class="time">{{ item.arrivalTime }}</text>
            <text class="station">{{ item.arrivalStationName }}</text>
          </view>
        </view>
        
        <view class="train-info">
          <text class="train-no">{{ item.trainNo }}</text>
          <text v-if="item.trainType" class="train-type">{{ item.trainType }}</text>
        </view>
        
        <view class="seat-info">
          <view 
            v-for="seat in item.seats" 
            :key="seat.type"
            class="seat-tag"
          >
            <text class="seat-name">{{ seat.name }}</text>
            <text class="seat-price">¥{{ formatPrice(seat.price) }}</text>
          </view>
        </view>
        
        <view class="price-info">
          <text class="price-label">{{ item.price_type_text || '尊享价' }}</text>
          <text class="price">¥{{ formatPrice(item.display_price || item.price) }}</text>
          <text class="price-unit">起</text>
        </view>
        
        <button class="book-btn" @click.stop="goBook(item)">订</button>
      </view>
      
      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="noMore" class="no-more">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script>
import { trainList } from '@/api/train.js'

export default {
  data() {
    return {
      departureStation: '',
      departureStationName: '',
      arrivalStation: '',
      arrivalStationName: '',
      departureDate: '',
      returnDate: '',
      tripType: 'OW',
      trainTypes: [],
      seatType: '',
      
      dateList: [],
      selectedDateIndex: 0,
      sortType: 'departure_earliest', // departure_earliest-发时最早, duration_shortest-耗时最短, price_lowest-价格最低
      filters: [
        { label: '发时最早', value: 'departure_earliest' },
        { label: '耗时最短', value: 'duration_shortest' },
        { label: '价格最低', value: 'price_lowest' }
      ],
      
      // 筛选相关
      showFilter: false,
      filterPrice: {
        min: '',
        max: ''
      },
      filterTime: '',
      timeOptions: [
        { label: '不限', value: '' },
        { label: '06:00-12:00', value: 'morning' },
        { label: '12:00-18:00', value: 'afternoon' },
        { label: '18:00-24:00', value: 'evening' }
      ],
      filterTrainTypes: [],
      trainTypeOptions: [
        { label: '高铁', value: 'G' },
        { label: '动车', value: 'D' },
        { label: '普通', value: 'K' }
      ],
      filterSeatTypes: [],
      seatOptions: [
        { label: '一等座', value: 'first' },
        { label: '二等座', value: 'second' },
        { label: '商务座', value: 'business' },
        { label: '硬卧', value: 'hard_sleeper' },
        { label: '软卧', value: 'soft_sleeper' },
        { label: '硬座', value: 'hard_seat' },
        { label: '软座', value: 'soft_seat' },
        { label: '无座', value: 'no_seat' }
      ],
      
      list: [],
      page: 1,
      row: 20,
      total: 0,
      loading: false,
      noMore: false
    }
  },
  onLoad(options) {
    this.departureStation = options.departure_station || ''
    this.departureStationName = decodeURIComponent(options.departure_station_name || '')
    this.arrivalStation = options.arrival_station || ''
    this.arrivalStationName = decodeURIComponent(options.arrival_station_name || '')
    this.departureDate = options.departure_date || ''
    this.returnDate = options.return_date || ''
    this.tripType = options.trip_type || 'OW'
    this.trainTypes = (options.train_types || 'G').split(',')
    this.seatType = options.seat_type || ''
    
    this.initDateList()
    this.loadList()
  },
  methods: {
    initDateList() {
      const today = new Date()
      const dates = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(today.getTime() + i * 86400000)
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        dates.push({
          date: date,
          dateText: `${date.getMonth() + 1}-${date.getDate()}`,
          weekText: weekDays[date.getDay()],
          dateStr: this.formatDate(date)
        })
      }
      this.dateList = dates
    },
    
    formatDate(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    
    selectDate(index) {
      this.selectedDateIndex = index
      this.departureDate = this.dateList[index].dateStr
      this.page = 1
      this.noMore = false
      this.loadList()
    },
    
    showCalendar() {
      // #ifdef MP-WEIXIN
      const that = this
      wx.showDatePicker({
        current: this.departureDate || new Date().toISOString().split('T')[0],
        startDate: this.formatDate(new Date()),
        success: (res) => {
          const selectedDate = res.date
          that.departureDate = selectedDate
          that.initDateList()
          that.selectedDateIndex = 0
          that.page = 1
          that.noMore = false
          that.loadList()
        }
      })
      // #endif
      
      // #ifndef MP-WEIXIN
      uni.showModal({
        title: '选择日期',
        editable: true,
        placeholderText: '请输入日期 YYYY-MM-DD',
        success: (res) => {
          if (res.confirm && res.content) {
            this.departureDate = res.content
            this.initDateList()
            this.selectedDateIndex = 0
            this.page = 1
            this.noMore = false
            this.loadList()
          }
        }
      })
      // #endif
    },
    
    changeSort(type) {
      this.sortType = type
      this.page = 1
      this.noMore = false
      this.loadList()
    },
    
    // 切换车次类型筛选
    toggleTrainType(value) {
      const index = this.filterTrainTypes.indexOf(value)
      if (index > -1) {
        this.filterTrainTypes.splice(index, 1)
      } else {
        this.filterTrainTypes.push(value)
      }
    },
    
    // 切换座位类型筛选
    toggleSeatType(value) {
      const index = this.filterSeatTypes.indexOf(value)
      if (index > -1) {
        this.filterSeatTypes.splice(index, 1)
      } else {
        this.filterSeatTypes.push(value)
      }
    },
    
    // 重置筛选
    resetFilter() {
      this.filterPrice = { min: '', max: '' }
      this.filterTime = ''
      this.filterTrainTypes = []
      this.filterSeatTypes = []
      this.applyFilter()
    },
    
    // 应用筛选
    applyFilter() {
      this.showFilter = false
      this.page = 1
      this.noMore = false
      this.loadList()
    },
    
    async loadList() {
      if (this.loading || this.noMore) return
      this.loading = true
      
      try {
        const params = {
          departure_station: this.departureStation,
          arrival_station: this.arrivalStation,
          departure_date: this.departureDate,
          trip_type: this.tripType,
          train_types: this.trainTypes,
          seat_type: this.seatType,
          page: this.page,
          row: this.row
        }
        
        if (this.tripType === 'RT') {
          params.return_date = this.returnDate
        }
        
        const res = await trainList(params)
        if (res.code === 1) {
          let newList = res.data.list || []
          
          // 筛选处理
          newList = this.filterList(newList)
          
          // 排序处理
          newList = this.sortList(newList)
          
          if (this.page === 1) {
            this.list = newList
          } else {
            this.list = this.list.concat(newList)
          }
          
          this.total = res.data.total || 0
          if (this.list.length >= this.total || newList.length < this.row) {
            this.noMore = true
          }
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    
    filterList(list) {
      let filtered = [...list]
      
      // 价格筛选
      if (this.filterPrice.min) {
        filtered = filtered.filter(item => {
          const price = parseFloat(item.display_price || item.price || 0)
          return price >= parseFloat(this.filterPrice.min)
        })
      }
      if (this.filterPrice.max) {
        filtered = filtered.filter(item => {
          const price = parseFloat(item.display_price || item.price || 0)
          return price <= parseFloat(this.filterPrice.max)
        })
      }
      
      // 时间筛选
      if (this.filterTime) {
        filtered = filtered.filter(item => {
          const time = this.parseTime(item.departureTime)
          switch (this.filterTime) {
            case 'morning':
              return time >= 360 && time < 720
            case 'afternoon':
              return time >= 720 && time < 1080
            case 'evening':
              return time >= 1080
            default:
              return true
          }
        })
      }
      
      // 车次类型筛选
      if (this.filterTrainTypes.length > 0) {
        filtered = filtered.filter(item => {
          return this.filterTrainTypes.includes(item.trainType)
        })
      }
      
      // 座位类型筛选
      if (this.filterSeatTypes.length > 0) {
        filtered = filtered.filter(item => {
          if (!item.seats || !Array.isArray(item.seats)) return false
          return item.seats.some(seat => this.filterSeatTypes.includes(seat.type))
        })
      }
      
      return filtered
    },
    
    sortList(list) {
      const sorted = [...list]
      switch (this.sortType) {
        case 'departure_earliest':
          return sorted.sort((a, b) => {
            const timeA = this.parseTime(a.departureTime)
            const timeB = this.parseTime(b.departureTime)
            return timeA - timeB
          })
        case 'duration_shortest':
          return sorted.sort((a, b) => {
            const durationA = this.parseDuration(a.duration)
            const durationB = this.parseDuration(b.duration)
            return durationA - durationB
          })
        case 'price_lowest':
          return sorted.sort((a, b) => {
            const priceA = parseFloat(a.display_price || a.price || 0)
            const priceB = parseFloat(b.display_price || b.price || 0)
            return priceA - priceB
          })
        default:
          return sorted
      }
    },
    
    parseTime(timeStr) {
      if (!timeStr) return 0
      const parts = timeStr.split(':')
      return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0)
    },
    
    parseDuration(durationStr) {
      if (!durationStr) return 0
      const match = durationStr.match(/(\d+)小时(\d+)分/)
      if (match) {
        return parseInt(match[1]) * 60 + parseInt(match[2])
      }
      return 0
    },
    
    loadMore() {
      if (!this.noMore) {
        this.page++
        this.loadList()
      }
    },
    
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      return numPrice.toFixed(2)
    },
    
    goDetail(item) {
      uni.navigateTo({
        url: `/pages/ticket/train-detail?train_no=${item.trainNo}&departure_date=${this.departureDate}`
      })
    },
    
    goBook(item) {
      uni.navigateTo({
        url: `/pages/ticket/passenger-info?type=train&train_no=${item.trainNo}&departure_date=${this.departureDate}&price=${item.display_price || item.price}&price_type=${item.price_type || 2}&price_type_text=${item.price_type_text || '尊享价'}&original_price=${item.original_price || item.price}`
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

.header {
  background: #fff;
  padding: 30rpx;
  text-align: center;
  
  .route {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.date-bar {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  
  .date-scroll {
    white-space: nowrap;
    padding: 20rpx 0;
    
    .date-item {
      display: inline-block;
      padding: 20rpx 30rpx;
      margin: 0 10rpx;
      text-align: center;
      border-radius: 8rpx;
      
      .date-text {
        display: block;
        font-size: 28rpx;
        color: #666;
      }
      
      .week-text {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-top: 5rpx;
      }
      
      &.active {
        background: #F8D07C;
        
        .date-text, .week-text {
          color: #1A4A8F;
        }
      }
      
      &.calendar {
        .calendar-icon {
          font-size: 40rpx;
        }
      }
    }
  }
}

.filter-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #e0e0e0;
  
  .filter-item {
    margin-right: 30rpx;
    padding: 10rpx 20rpx;
    font-size: 26rpx;
    color: #666;
    border-radius: 8rpx;
    
    &.active {
      background: #F8D07C;
      color: #1A4A8F;
    }
  }
}

.filter-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1px solid #e0e0e0;
    
    .filter-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .filter-close {
      font-size: 50rpx;
      color: #999;
      line-height: 1;
    }
  }
  
  .filter-content {
    flex: 1;
    padding: 30rpx;
    overflow-y: auto;
    
    .filter-group {
      margin-bottom: 40rpx;
      
      .group-title {
        display: block;
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 20rpx;
      }
      
      .price-range {
        display: flex;
        align-items: center;
        gap: 20rpx;
        
        .price-input {
          flex: 1;
          padding: 20rpx;
          border: 1px solid #e0e0e0;
          border-radius: 8rpx;
          font-size: 28rpx;
        }
        
        .price-separator {
          font-size: 28rpx;
          color: #999;
        }
      }
      
      .time-options, .train-type-options, .seat-options {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;
        
        .time-option, .train-type-option, .seat-option {
          padding: 15rpx 30rpx;
          border: 2rpx solid #e0e0e0;
          border-radius: 8rpx;
          font-size: 28rpx;
          color: #666;
          
          &.active {
            border-color: #F8D07C;
            background: #F8D07C;
            color: #1A4A8F;
          }
        }
      }
    }
  }
  
  .filter-footer {
    display: flex;
    padding: 30rpx;
    border-top: 1px solid #e0e0e0;
    gap: 20rpx;
    
    .reset-btn, .confirm-btn {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      border-radius: 8rpx;
      font-size: 32rpx;
      border: none;
      
      &::after {
        border: none;
      }
    }
    
    .reset-btn {
      background: #f5f5f5;
      color: #666;
    }
    
    .confirm-btn {
      background: #F8D07C;
      color: #1A4A8F;
      font-weight: bold;
    }
  }
}

.list {
  height: calc(100vh - 300rpx);
  padding: 20rpx;
}

.train-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .time-info {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .departure, .arrival {
      text-align: center;
      
      .time {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .station {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-top: 5rpx;
      }
    }
    
    .duration {
      flex: 1;
      text-align: center;
      margin: 0 20rpx;
      
      .duration-text {
        font-size: 24rpx;
        color: #999;
      }
      
      .line {
        position: relative;
        margin: 10rpx 0;
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
        
        .train-icon {
          position: absolute;
          right: -10rpx;
          top: -10rpx;
          font-size: 24rpx;
        }
      }
    }
  }
  
  .train-info {
    margin-bottom: 20rpx;
    
    .train-no {
      font-size: 26rpx;
      color: #333;
      margin-right: 20rpx;
    }
    
    .train-type {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .seat-info {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-bottom: 20rpx;
    
    .seat-tag {
      padding: 8rpx 16rpx;
      background: #f5f5f5;
      border-radius: 6rpx;
      
      .seat-name {
        font-size: 24rpx;
        color: #666;
        margin-right: 10rpx;
      }
      
      .seat-price {
        font-size: 24rpx;
        color: #F8D07C;
        font-weight: bold;
      }
    }
  }
  
  .price-info {
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    margin-bottom: 20rpx;
    
    .price-label {
      font-size: 22rpx;
      color: #999;
      margin-right: 5rpx;
    }
    
    .price {
      font-size: 36rpx;
      font-weight: bold;
      color: #F8D07C;
    }
    
    .price-unit {
      font-size: 22rpx;
      color: #999;
      margin-left: 5rpx;
    }
  }
  
  .book-btn {
    width: 100%;
    background: #F8D07C;
    color: #1A4A8F;
    font-size: 28rpx;
    font-weight: bold;
    padding: 20rpx 0;
    border-radius: 8rpx;
    border: none;
    
    &::after {
      border: none;
    }
  }
}

.loading, .no-more {
  text-align: center;
  padding: 30rpx;
  font-size: 26rpx;
  color: #999;
}
</style>


    <!-- 顶部路线信息 -->
    <view class="header">
      <text class="route">{{ departureStationName }}-{{ arrivalStationName }}</text>
    </view>

    <!-- 日期选择 -->
    <view class="date-bar">
      <scroll-view scroll-x class="date-scroll">
        <view 
          v-for="(date, index) in dateList" 
          :key="index"
          :class="['date-item', { active: selectedDateIndex === index }]"
          @click="selectDate(index)"
        >
          <text class="date-text">{{ date.dateText }}</text>
          <text class="week-text">{{ date.weekText }}</text>
        </view>
        <view class="date-item calendar" @click="showCalendar">
          <text class="calendar-icon">📅</text>
        </view>
      </scroll-view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" @click="showFilter = true">
        筛选
      </view>
      <view 
        v-for="filter in filters" 
        :key="filter.value"
        :class="['filter-item', { active: sortType === filter.value }]"
        @click="changeSort(filter.value)"
      >
        {{ filter.label }}
      </view>
    </view>
    
    <!-- 筛选弹窗 -->
    <u-popup v-model="showFilter" mode="bottom" height="60%">
      <view class="filter-popup">
        <view class="filter-header">
          <text class="filter-title">筛选</text>
          <text class="filter-close" @click="showFilter = false">×</text>
        </view>
        <view class="filter-content">
          <view class="filter-group">
            <text class="group-title">价格区间</text>
            <view class="price-range">
              <input type="number" v-model="filterPrice.min" placeholder="最低价" class="price-input" />
              <text class="price-separator">-</text>
              <input type="number" v-model="filterPrice.max" placeholder="最高价" class="price-input" />
            </view>
          </view>
          <view class="filter-group">
            <text class="group-title">出发时间</text>
            <view class="time-options">
              <view 
                v-for="time in timeOptions" 
                :key="time.value"
                :class="['time-option', { active: filterTime === time.value }]"
                @click="filterTime = time.value"
              >
                {{ time.label }}
              </view>
            </view>
          </view>
          <view class="filter-group">
            <text class="group-title">车次类型</text>
            <view class="train-type-options">
              <view 
                v-for="type in trainTypeOptions" 
                :key="type.value"
                :class="['train-type-option', { active: filterTrainTypes.includes(type.value) }]"
                @click="toggleTrainType(type.value)"
              >
                {{ type.label }}
              </view>
            </view>
          </view>
          <view class="filter-group">
            <text class="group-title">座位类型</text>
            <view class="seat-options">
              <view 
                v-for="seat in seatOptions" 
                :key="seat.value"
                :class="['seat-option', { active: filterSeatTypes.includes(seat.value) }]"
                @click="toggleSeatType(seat.value)"
              >
                {{ seat.label }}
              </view>
            </view>
          </view>
        </view>
        <view class="filter-footer">
          <button class="reset-btn" @click="resetFilter">重置</button>
          <button class="confirm-btn" @click="applyFilter">确定</button>
        </view>
      </view>
    </u-popup>

    <!-- 车次列表 -->
    <scroll-view scroll-y class="list" @scrolltolower="loadMore">
      <view v-for="(item, index) in list" :key="index" class="train-item" @click="goDetail(item)">
        <view class="time-info">
          <view class="departure">
            <text class="time">{{ item.departureTime }}</text>
            <text class="station">{{ item.departureStationName }}</text>
          </view>
          <view class="duration">
            <text class="duration-text">{{ item.duration || '02小时50分钟' }}</text>
            <view class="line">
              <text class="dot"></text>
              <text class="line-dash"></text>
              <text class="train-icon">🚄</text>
            </view>
          </view>
          <view class="arrival">
            <text class="time">{{ item.arrivalTime }}</text>
            <text class="station">{{ item.arrivalStationName }}</text>
          </view>
        </view>
        
        <view class="train-info">
          <text class="train-no">{{ item.trainNo }}</text>
          <text v-if="item.trainType" class="train-type">{{ item.trainType }}</text>
        </view>
        
        <view class="seat-info">
          <view 
            v-for="seat in item.seats" 
            :key="seat.type"
            class="seat-tag"
          >
            <text class="seat-name">{{ seat.name }}</text>
            <text class="seat-price">¥{{ formatPrice(seat.price) }}</text>
          </view>
        </view>
        
        <view class="price-info">
          <text class="price-label">{{ item.price_type_text || '尊享价' }}</text>
          <text class="price">¥{{ formatPrice(item.display_price || item.price) }}</text>
          <text class="price-unit">起</text>
        </view>
        
        <button class="book-btn" @click.stop="goBook(item)">订</button>
      </view>
      
      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="noMore" class="no-more">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script>
import { trainList } from '@/api/train.js'

export default {
  data() {
    return {
      departureStation: '',
      departureStationName: '',
      arrivalStation: '',
      arrivalStationName: '',
      departureDate: '',
      returnDate: '',
      tripType: 'OW',
      trainTypes: [],
      seatType: '',
      
      dateList: [],
      selectedDateIndex: 0,
      sortType: 'departure_earliest', // departure_earliest-发时最早, duration_shortest-耗时最短, price_lowest-价格最低
      filters: [
        { label: '发时最早', value: 'departure_earliest' },
        { label: '耗时最短', value: 'duration_shortest' },
        { label: '价格最低', value: 'price_lowest' }
      ],
      
      // 筛选相关
      showFilter: false,
      filterPrice: {
        min: '',
        max: ''
      },
      filterTime: '',
      timeOptions: [
        { label: '不限', value: '' },
        { label: '06:00-12:00', value: 'morning' },
        { label: '12:00-18:00', value: 'afternoon' },
        { label: '18:00-24:00', value: 'evening' }
      ],
      filterTrainTypes: [],
      trainTypeOptions: [
        { label: '高铁', value: 'G' },
        { label: '动车', value: 'D' },
        { label: '普通', value: 'K' }
      ],
      filterSeatTypes: [],
      seatOptions: [
        { label: '一等座', value: 'first' },
        { label: '二等座', value: 'second' },
        { label: '商务座', value: 'business' },
        { label: '硬卧', value: 'hard_sleeper' },
        { label: '软卧', value: 'soft_sleeper' },
        { label: '硬座', value: 'hard_seat' },
        { label: '软座', value: 'soft_seat' },
        { label: '无座', value: 'no_seat' }
      ],
      
      list: [],
      page: 1,
      row: 20,
      total: 0,
      loading: false,
      noMore: false
    }
  },
  onLoad(options) {
    this.departureStation = options.departure_station || ''
    this.departureStationName = decodeURIComponent(options.departure_station_name || '')
    this.arrivalStation = options.arrival_station || ''
    this.arrivalStationName = decodeURIComponent(options.arrival_station_name || '')
    this.departureDate = options.departure_date || ''
    this.returnDate = options.return_date || ''
    this.tripType = options.trip_type || 'OW'
    this.trainTypes = (options.train_types || 'G').split(',')
    this.seatType = options.seat_type || ''
    
    this.initDateList()
    this.loadList()
  },
  methods: {
    initDateList() {
      const today = new Date()
      const dates = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(today.getTime() + i * 86400000)
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        dates.push({
          date: date,
          dateText: `${date.getMonth() + 1}-${date.getDate()}`,
          weekText: weekDays[date.getDay()],
          dateStr: this.formatDate(date)
        })
      }
      this.dateList = dates
    },
    
    formatDate(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    
    selectDate(index) {
      this.selectedDateIndex = index
      this.departureDate = this.dateList[index].dateStr
      this.page = 1
      this.noMore = false
      this.loadList()
    },
    
    showCalendar() {
      // #ifdef MP-WEIXIN
      const that = this
      wx.showDatePicker({
        current: this.departureDate || new Date().toISOString().split('T')[0],
        startDate: this.formatDate(new Date()),
        success: (res) => {
          const selectedDate = res.date
          that.departureDate = selectedDate
          that.initDateList()
          that.selectedDateIndex = 0
          that.page = 1
          that.noMore = false
          that.loadList()
        }
      })
      // #endif
      
      // #ifndef MP-WEIXIN
      uni.showModal({
        title: '选择日期',
        editable: true,
        placeholderText: '请输入日期 YYYY-MM-DD',
        success: (res) => {
          if (res.confirm && res.content) {
            this.departureDate = res.content
            this.initDateList()
            this.selectedDateIndex = 0
            this.page = 1
            this.noMore = false
            this.loadList()
          }
        }
      })
      // #endif
    },
    
    changeSort(type) {
      this.sortType = type
      this.page = 1
      this.noMore = false
      this.loadList()
    },
    
    // 切换车次类型筛选
    toggleTrainType(value) {
      const index = this.filterTrainTypes.indexOf(value)
      if (index > -1) {
        this.filterTrainTypes.splice(index, 1)
      } else {
        this.filterTrainTypes.push(value)
      }
    },
    
    // 切换座位类型筛选
    toggleSeatType(value) {
      const index = this.filterSeatTypes.indexOf(value)
      if (index > -1) {
        this.filterSeatTypes.splice(index, 1)
      } else {
        this.filterSeatTypes.push(value)
      }
    },
    
    // 重置筛选
    resetFilter() {
      this.filterPrice = { min: '', max: '' }
      this.filterTime = ''
      this.filterTrainTypes = []
      this.filterSeatTypes = []
      this.applyFilter()
    },
    
    // 应用筛选
    applyFilter() {
      this.showFilter = false
      this.page = 1
      this.noMore = false
      this.loadList()
    },
    
    async loadList() {
      if (this.loading || this.noMore) return
      this.loading = true
      
      try {
        const params = {
          departure_station: this.departureStation,
          arrival_station: this.arrivalStation,
          departure_date: this.departureDate,
          trip_type: this.tripType,
          train_types: this.trainTypes,
          seat_type: this.seatType,
          page: this.page,
          row: this.row
        }
        
        if (this.tripType === 'RT') {
          params.return_date = this.returnDate
        }
        
        const res = await trainList(params)
        if (res.code === 1) {
          let newList = res.data.list || []
          
          // 筛选处理
          newList = this.filterList(newList)
          
          // 排序处理
          newList = this.sortList(newList)
          
          if (this.page === 1) {
            this.list = newList
          } else {
            this.list = this.list.concat(newList)
          }
          
          this.total = res.data.total || 0
          if (this.list.length >= this.total || newList.length < this.row) {
            this.noMore = true
          }
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    
    filterList(list) {
      let filtered = [...list]
      
      // 价格筛选
      if (this.filterPrice.min) {
        filtered = filtered.filter(item => {
          const price = parseFloat(item.display_price || item.price || 0)
          return price >= parseFloat(this.filterPrice.min)
        })
      }
      if (this.filterPrice.max) {
        filtered = filtered.filter(item => {
          const price = parseFloat(item.display_price || item.price || 0)
          return price <= parseFloat(this.filterPrice.max)
        })
      }
      
      // 时间筛选
      if (this.filterTime) {
        filtered = filtered.filter(item => {
          const time = this.parseTime(item.departureTime)
          switch (this.filterTime) {
            case 'morning':
              return time >= 360 && time < 720
            case 'afternoon':
              return time >= 720 && time < 1080
            case 'evening':
              return time >= 1080
            default:
              return true
          }
        })
      }
      
      // 车次类型筛选
      if (this.filterTrainTypes.length > 0) {
        filtered = filtered.filter(item => {
          return this.filterTrainTypes.includes(item.trainType)
        })
      }
      
      // 座位类型筛选
      if (this.filterSeatTypes.length > 0) {
        filtered = filtered.filter(item => {
          if (!item.seats || !Array.isArray(item.seats)) return false
          return item.seats.some(seat => this.filterSeatTypes.includes(seat.type))
        })
      }
      
      return filtered
    },
    
    sortList(list) {
      const sorted = [...list]
      switch (this.sortType) {
        case 'departure_earliest':
          return sorted.sort((a, b) => {
            const timeA = this.parseTime(a.departureTime)
            const timeB = this.parseTime(b.departureTime)
            return timeA - timeB
          })
        case 'duration_shortest':
          return sorted.sort((a, b) => {
            const durationA = this.parseDuration(a.duration)
            const durationB = this.parseDuration(b.duration)
            return durationA - durationB
          })
        case 'price_lowest':
          return sorted.sort((a, b) => {
            const priceA = parseFloat(a.display_price || a.price || 0)
            const priceB = parseFloat(b.display_price || b.price || 0)
            return priceA - priceB
          })
        default:
          return sorted
      }
    },
    
    parseTime(timeStr) {
      if (!timeStr) return 0
      const parts = timeStr.split(':')
      return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0)
    },
    
    parseDuration(durationStr) {
      if (!durationStr) return 0
      const match = durationStr.match(/(\d+)小时(\d+)分/)
      if (match) {
        return parseInt(match[1]) * 60 + parseInt(match[2])
      }
      return 0
    },
    
    loadMore() {
      if (!this.noMore) {
        this.page++
        this.loadList()
      }
    },
    
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      return numPrice.toFixed(2)
    },
    
    goDetail(item) {
      uni.navigateTo({
        url: `/pages/ticket/train-detail?train_no=${item.trainNo}&departure_date=${this.departureDate}`
      })
    },
    
    goBook(item) {
      uni.navigateTo({
        url: `/pages/ticket/passenger-info?type=train&train_no=${item.trainNo}&departure_date=${this.departureDate}&price=${item.display_price || item.price}&price_type=${item.price_type || 2}&price_type_text=${item.price_type_text || '尊享价'}&original_price=${item.original_price || item.price}`
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

.header {
  background: #fff;
  padding: 30rpx;
  text-align: center;
  
  .route {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.date-bar {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  
  .date-scroll {
    white-space: nowrap;
    padding: 20rpx 0;
    
    .date-item {
      display: inline-block;
      padding: 20rpx 30rpx;
      margin: 0 10rpx;
      text-align: center;
      border-radius: 8rpx;
      
      .date-text {
        display: block;
        font-size: 28rpx;
        color: #666;
      }
      
      .week-text {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-top: 5rpx;
      }
      
      &.active {
        background: #F8D07C;
        
        .date-text, .week-text {
          color: #1A4A8F;
        }
      }
      
      &.calendar {
        .calendar-icon {
          font-size: 40rpx;
        }
      }
    }
  }
}

.filter-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #e0e0e0;
  
  .filter-item {
    margin-right: 30rpx;
    padding: 10rpx 20rpx;
    font-size: 26rpx;
    color: #666;
    border-radius: 8rpx;
    
    &.active {
      background: #F8D07C;
      color: #1A4A8F;
    }
  }
}

.filter-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1px solid #e0e0e0;
    
    .filter-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .filter-close {
      font-size: 50rpx;
      color: #999;
      line-height: 1;
    }
  }
  
  .filter-content {
    flex: 1;
    padding: 30rpx;
    overflow-y: auto;
    
    .filter-group {
      margin-bottom: 40rpx;
      
      .group-title {
        display: block;
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 20rpx;
      }
      
      .price-range {
        display: flex;
        align-items: center;
        gap: 20rpx;
        
        .price-input {
          flex: 1;
          padding: 20rpx;
          border: 1px solid #e0e0e0;
          border-radius: 8rpx;
          font-size: 28rpx;
        }
        
        .price-separator {
          font-size: 28rpx;
          color: #999;
        }
      }
      
      .time-options, .train-type-options, .seat-options {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;
        
        .time-option, .train-type-option, .seat-option {
          padding: 15rpx 30rpx;
          border: 2rpx solid #e0e0e0;
          border-radius: 8rpx;
          font-size: 28rpx;
          color: #666;
          
          &.active {
            border-color: #F8D07C;
            background: #F8D07C;
            color: #1A4A8F;
          }
        }
      }
    }
  }
  
  .filter-footer {
    display: flex;
    padding: 30rpx;
    border-top: 1px solid #e0e0e0;
    gap: 20rpx;
    
    .reset-btn, .confirm-btn {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      border-radius: 8rpx;
      font-size: 32rpx;
      border: none;
      
      &::after {
        border: none;
      }
    }
    
    .reset-btn {
      background: #f5f5f5;
      color: #666;
    }
    
    .confirm-btn {
      background: #F8D07C;
      color: #1A4A8F;
      font-weight: bold;
    }
  }
}

.list {
  height: calc(100vh - 300rpx);
  padding: 20rpx;
}

.train-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .time-info {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .departure, .arrival {
      text-align: center;
      
      .time {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .station {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-top: 5rpx;
      }
    }
    
    .duration {
      flex: 1;
      text-align: center;
      margin: 0 20rpx;
      
      .duration-text {
        font-size: 24rpx;
        color: #999;
      }
      
      .line {
        position: relative;
        margin: 10rpx 0;
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
        
        .train-icon {
          position: absolute;
          right: -10rpx;
          top: -10rpx;
          font-size: 24rpx;
        }
      }
    }
  }
  
  .train-info {
    margin-bottom: 20rpx;
    
    .train-no {
      font-size: 26rpx;
      color: #333;
      margin-right: 20rpx;
    }
    
    .train-type {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .seat-info {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-bottom: 20rpx;
    
    .seat-tag {
      padding: 8rpx 16rpx;
      background: #f5f5f5;
      border-radius: 6rpx;
      
      .seat-name {
        font-size: 24rpx;
        color: #666;
        margin-right: 10rpx;
      }
      
      .seat-price {
        font-size: 24rpx;
        color: #F8D07C;
        font-weight: bold;
      }
    }
  }
  
  .price-info {
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    margin-bottom: 20rpx;
    
    .price-label {
      font-size: 22rpx;
      color: #999;
      margin-right: 5rpx;
    }
    
    .price {
      font-size: 36rpx;
      font-weight: bold;
      color: #F8D07C;
    }
    
    .price-unit {
      font-size: 22rpx;
      color: #999;
      margin-left: 5rpx;
    }
  }
  
  .book-btn {
    width: 100%;
    background: #F8D07C;
    color: #1A4A8F;
    font-size: 28rpx;
    font-weight: bold;
    padding: 20rpx 0;
    border-radius: 8rpx;
    border: none;
    
    &::after {
      border: none;
    }
  }
}

.loading, .no-more {
  text-align: center;
  padding: 30rpx;
  font-size: 26rpx;
  color: #999;
}
</style>


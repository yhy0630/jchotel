<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <u-navbar :border-bottom="false" :is-fixed="true" :background="{ background: '#1A4A8F' }" :is-back="true">
      <view class="navbar-content">
        <text class="navbar-title">{{ navbarTitle }}</text>
        <view class="navbar-right">
          <text class="icon-more">⋯</text>
          <view class="icon-circle">◎</view>
        </view>
      </view>
    </u-navbar>

    <!-- 顶部选项卡：飞机票/火车票 -->
    <view class="tabs">
      <view :class="['tab', { active: activeTab === 'flight' }]" @click="switchTab('flight')">
        飞机票
      </view>
      <view :class="['tab', { active: activeTab === 'train' }]" @click="switchTab('train')">
        火车票
      </view>
    </view>

    <!-- 飞机票搜索表单 -->
    <view v-if="activeTab === 'flight'" class="search-form">
      <view class="banner">
        <image src="/static/images/flight-banner.png" mode="aspectFill" class="banner-img" />
      </view>
      
      <!-- 行程类型：单程/往返 -->
      <view class="trip-type">
        <view :class="['trip-btn', { active: tripType === 'OW' }]" @click="tripType = 'OW'">
          单程
        </view>
        <view :class="['trip-btn', { active: tripType === 'RT' }]" @click="tripType = 'RT'">
          往返
        </view>
      </view>

      <!-- 出发和到达城市 -->
      <view class="route-section">
        <view class="route-item" @click="selectCity('departure')">
          <text class="route-value">{{ flightForm.departureCityName || '北京' }}</text>
        </view>
        <view class="route-swap" @click="swapCities">
          <image src="/static/images/icon-flight.png" class="swap-icon" mode="aspectFit"></image>
        </view>
        <view class="route-item" @click="selectCity('arrival')">
          <text class="route-value">{{ flightForm.arrivalCityName || '青岛' }}</text>
        </view>
      </view>

      <!-- 出发日期 -->
      <view class="form-item date-item" @click="selectDate('departure')">
        <text class="date-value">{{ formatDisplayDate(flightForm.departureDate) || formatTodayDate() }}</text>
        <text class="arrow">></text>
      </view>

      <!-- 返程日期（往返时显示） -->
      <view v-if="tripType === 'RT'" class="form-item date-item" @click="selectDate('return')">
        <text class="date-value">{{ formatDisplayDate(flightForm.returnDate) || formatTomorrowDate() }}</text>
        <text class="arrow">></text>
      </view>

      <!-- 舱位等级 -->
      <view class="cabin-class-section">
        <view 
          v-for="cabin in cabinClassOptions" 
          :key="cabin.value"
          :class="['cabin-class-btn', { active: flightForm.cabinClass === cabin.value }]"
          @click="flightForm.cabinClass = cabin.value"
        >
          {{ cabin.label }}
        </view>
      </view>

      <!-- 查询按钮 -->
      <button class="search-btn" @click="searchFlight">机票查询</button>
    </view>

    <!-- 火车票搜索表单 -->
    <view v-if="activeTab === 'train'" class="search-form">
      <view class="banner">
        <image src="/static/images/train-banner.png" mode="aspectFill" class="banner-img" />
        <view class="banner-text">余票动态实时更新, 出行规划快人一步</view>
      </view>
      
      <!-- 行程类型：单程/往返 -->
      <view class="trip-type">
        <view :class="['trip-btn', { active: tripType === 'OW' }]" @click="tripType = 'OW'">
          单程
        </view>
        <view :class="['trip-btn', { active: tripType === 'RT' }]" @click="tripType = 'RT'">
          往返
        </view>
      </view>

      <!-- 出发和到达车站 -->
      <view class="route-section">
        <view class="route-item" @click="selectStation('departure')">
          <text class="route-value">{{ trainForm.departureStationName || '北京' }}</text>
        </view>
        <view class="route-swap" @click="swapStations">
          <image src="/static/images/icon-train.png" class="swap-icon" mode="aspectFit"></image>
        </view>
        <view class="route-item" @click="selectStation('arrival')">
          <text class="route-value">{{ trainForm.arrivalStationName || '青岛' }}</text>
        </view>
      </view>

      <!-- 出发日期 -->
      <view class="form-item date-item" @click="selectDate('departure')">
        <text class="date-value">{{ formatDisplayDate(trainForm.departureDate) || formatTodayDate() }}</text>
        <text class="arrow">></text>
      </view>

      <!-- 返程日期（往返时显示） -->
      <view v-if="tripType === 'RT'" class="form-item date-item" @click="selectDate('return')">
        <text class="date-value">{{ formatDisplayDate(trainForm.returnDate) || formatTomorrowDate() }}</text>
        <text class="arrow">></text>
      </view>

      <!-- 座位类型 -->
      <view class="seat-type-section">
        <view 
          v-for="seat in seatTypes" 
          :key="seat.value"
          :class="['seat-type-btn', { active: trainForm.seatType === seat.value }]"
          @click="trainForm.seatType = seat.value"
        >
          {{ seat.label }}
        </view>
      </view>

      <!-- 车次类型 -->
      <view class="train-type-section">
        <view 
          v-for="type in trainTypes" 
          :key="type.value"
          :class="['train-type-btn', { active: trainForm.trainTypes.includes(type.value) }]"
          @click="toggleTrainType(type.value)"
        >
          {{ type.label }}
        </view>
      </view>

      <!-- 查询按钮 -->
      <button class="search-btn" @click="searchTrain">车票查询</button>
    </view>

  </view>
</template>

<script>
import { cityList } from '@/api/flight.js'
import { stationList } from '@/api/train.js'

export default {
  data() {
    return {
      activeTab: 'flight', // flight-飞机票, train-火车票
      tripType: 'OW', // OW-单程, RT-往返
      
      // 飞机票表单
      flightForm: {
        departureCity: 'PKX',         // 默认北京大兴
        departureCityName: '北京',
        arrivalCity: 'SHA',           // 默认上海虹桥
        arrivalCityName: '上海',
        departureDate: '',
        returnDate: '',
        cabinClass: 'Y' // Y-经济舱, C-公务/头等舱
      },
      
      // 火车票表单
      trainForm: {
        departureStation: '',
        departureStationName: '北京',
        arrivalStation: '',
        arrivalStationName: '青岛',
        departureDate: '',
        returnDate: '',
        seatType: 'second', // first-一等座, second-二等座, hard_seat-硬座, no_seat-站票
        trainTypes: ['G'] // 默认选择高铁
      },
      
      // 舱位等级选项
      cabinClassOptions: [
        { label: '经济舱', value: 'Y' },
        { label: '公务/头等舱', value: 'C' }
      ],
      
      // 座位类型选项
      seatTypes: [
        { label: '一等座', value: 'first' },
        { label: '二等座', value: 'second' },
        { label: '硬座', value: 'hard_seat' },
        { label: '站票', value: 'no_seat' }
      ],
      
      // 车次类型选项
      trainTypes: [
        { label: '高铁', value: 'G' },
        { label: '动车', value: 'D' },
        { label: '普通', value: 'K' }
      ]
    }
  },
  computed: {
    cabinClassText() {
      const option = this.cabinClassOptions.find(item => item.value === this.flightForm.cabinClass)
      return option ? option.label : '经济舱'
    },
    navbarTitle() {
      return this.activeTab === 'flight' ? '飞机票' : '火车票'
    }
  },
  watch: {
    activeTab(newVal) {
      // 更新导航栏标题
      uni.setNavigationBarTitle({
        title: newVal === 'flight' ? '飞机票' : '火车票'
      })
    }
  },
  onLoad() {
    // 初始化日期
    const today = new Date()
    this.flightForm.departureDate = this.formatDate(today)
    this.trainForm.departureDate = this.formatDate(today)
    
    // 设置导航栏标题
    uni.setNavigationBarTitle({
      title: this.activeTab === 'flight' ? '飞机票' : '火车票'
    })
  },
  methods: {
    switchTab(tab) {
      if (this.activeTab === tab) return
      this.activeTab = tab
      this.tripType = 'OW'
      // 更新导航栏标题
      this.$nextTick(() => {
        // 标题会在computed中自动更新
      })
    },
    
    formatDate(date) {
      if (!date) return ''
      // 支持字符串/时间戳/{year,month,day}/Date
      let dObj = date
      if (typeof date === 'string') dObj = new Date(date.replace(/-/g, '/'))
      else if (typeof date === 'number') dObj = new Date(date)
      else if (typeof date === 'object' && date.year && date.month && date.day) {
        dObj = new Date(date.year, date.month - 1, date.day)
      }
      if (!(dObj instanceof Date) || isNaN(dObj.getTime())) return ''
      const y = dObj.getFullYear()
      const m = String(dObj.getMonth() + 1).padStart(2, '0')
      const d = String(dObj.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    
    formatDisplayDate(dateStr) {
      const normalized = this.normalizeDate(dateStr)
      if (!normalized) return ''
      const date = new Date(normalized.replace(/-/g, '/'))
      if (isNaN(date.getTime())) return ''
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekDay = weekDays[date.getDay()]
      const today = new Date()
      const tomorrow = new Date(today.getTime() + 86400000)
      
      if (this.isSameDay(date, today)) {
        return `${month}月${day}日 今天`
      } else if (this.isSameDay(date, tomorrow)) {
        return `${month}月${day}日 明天`
      } else {
        return `${month}月${day}日 ${weekDay}`
      }
    },
    
    formatTodayDate() {
      const today = new Date()
      const month = today.getMonth() + 1
      const day = today.getDate()
      return `${month}月${day}日 今天`
    },
    
    formatTomorrowDate() {
      const tomorrow = new Date(new Date().getTime() + 86400000)
      const month = tomorrow.getMonth() + 1
      const day = tomorrow.getDate()
      return `${month}月${day}日 明天`
    },
    
    isSameDay(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate()
    },
    
    // 交换城市
    swapCities() {
      const tempCity = this.flightForm.departureCity
      const tempCityName = this.flightForm.departureCityName
      this.flightForm.departureCity = this.flightForm.arrivalCity
      this.flightForm.departureCityName = this.flightForm.arrivalCityName
      this.flightForm.arrivalCity = tempCity
      this.flightForm.arrivalCityName = tempCityName
    },
    
    // 交换车站
    swapStations() {
      const tempStation = this.trainForm.departureStation
      const tempStationName = this.trainForm.departureStationName
      this.trainForm.departureStation = this.trainForm.arrivalStation
      this.trainForm.departureStationName = this.trainForm.arrivalStationName
      this.trainForm.arrivalStation = tempStation
      this.trainForm.arrivalStationName = tempStationName
    },
    
    // 选择城市（飞机票）
    async selectCity(type) {
      uni.navigateTo({
        url: `/pages/ticket/city-select?type=${type}&ticket_type=flight`
      })
    },
    
    // 选择车站（火车票）
    async selectStation(type) {
      uni.navigateTo({
        url: `/pages/ticket/station-select?type=${type}&ticket_type=train`
      })
    },
    
    // 选择日期
    selectDate(type) {
      const currentDate = type === 'departure' 
        ? (this.activeTab === 'flight' ? this.flightForm.departureDate : this.trainForm.departureDate)
        : (this.activeTab === 'flight' ? this.flightForm.returnDate : this.trainForm.returnDate)
      
      // 跳转到日期选择页面
      uni.navigateTo({
        url: `/pages/ticket/date-picker?current=${currentDate || this.formatDate(new Date())}&type=${type}&activeTab=${this.activeTab}`
      })
    },
    
    // 切换车次类型
    toggleTrainType(value) {
      const index = this.trainForm.trainTypes.indexOf(value)
      if (index > -1) {
        this.trainForm.trainTypes.splice(index, 1)
      } else {
        this.trainForm.trainTypes.push(value)
      }
    },
    
    // 查询航班
    searchFlight() {
      // 确保日期为字符串格式
      this.flightForm.departureDate = this.normalizeDate(this.flightForm.departureDate)
      this.flightForm.returnDate = this.normalizeDate(this.flightForm.returnDate)

      if (!this.flightForm.departureCity && !this.flightForm.departureCityName) {
        uni.showToast({ title: '请选择出发城市', icon: 'none' })
        return
      }
      if (!this.flightForm.arrivalCity && !this.flightForm.arrivalCityName) {
        uni.showToast({ title: '请选择到达城市', icon: 'none' })
        return
      }
      if (!this.flightForm.departureDate) {
        uni.showToast({ title: '请选择出发日期', icon: 'none' })
        return
      }
      if (this.tripType === 'RT' && !this.flightForm.returnDate) {
        uni.showToast({ title: '请选择返程日期', icon: 'none' })
        return
      }
      
      uni.navigateTo({
        url: `/pages/ticket/flight-list?${this.buildFlightQuery()}`
      })
    },
    
    // 查询车次
    searchTrain() {
      // 确保日期为字符串格式
      this.trainForm.departureDate = this.normalizeDate(this.trainForm.departureDate)
      this.trainForm.returnDate = this.normalizeDate(this.trainForm.returnDate)

      if (!this.trainForm.departureStation && !this.trainForm.departureStationName) {
        uni.showToast({ title: '请选择出发站', icon: 'none' })
        return
      }
      if (!this.trainForm.arrivalStation && !this.trainForm.arrivalStationName) {
        uni.showToast({ title: '请选择到达站', icon: 'none' })
        return
      }
      if (!this.trainForm.departureDate) {
        uni.showToast({ title: '请选择出发日期', icon: 'none' })
        return
      }
      if (this.tripType === 'RT' && !this.trainForm.returnDate) {
        uni.showToast({ title: '请选择返程日期', icon: 'none' })
        return
      }
      if (this.trainForm.trainTypes.length === 0) {
        uni.showToast({ title: '请至少选择一种车次类型', icon: 'none' })
        return
      }
      
      uni.navigateTo({
        url: `/pages/ticket/train-list?${this.buildTrainQuery()}`
      })
    },
    
    // 构建航班查询参数
    buildFlightQuery() {
      const params = {
        departure_city: this.flightForm.departureCity || 'PKX',
        departure_city_name: this.flightForm.departureCityName || '北京',
        arrival_city: this.flightForm.arrivalCity || 'SHA',
        arrival_city_name: this.flightForm.arrivalCityName || '上海',
        departure_date: this.flightForm.departureDate,
        trip_type: this.tripType,
        cabin_class: this.flightForm.cabinClass
      }
      if (this.tripType === 'RT') {
        params.return_date = this.flightForm.returnDate
      }
      return Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
    },
    
    // 构建车次查询参数
    buildTrainQuery() {
      const params = {
        departure_station: this.trainForm.departureStation || 'BJP',
        departure_station_name: this.trainForm.departureStationName || '北京',
        arrival_station: this.trainForm.arrivalStation || 'QDK',
        arrival_station_name: this.trainForm.arrivalStationName || '青岛',
        departure_date: this.trainForm.departureDate,
        trip_type: this.tripType,
        train_types: this.trainForm.trainTypes.join(','),
        seat_type: this.trainForm.seatType
      }
      if (this.tripType === 'RT') {
        params.return_date = this.trainForm.returnDate
      }
      return Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
    },

    // 规范化日期，避免出现 [object Object]
    normalizeDate(val) {
      if (!val) return ''
      if (typeof val === 'string') return this.formatDate(val)
      if (Array.isArray(val)) return val[0] ? this.formatDate(val[0]) : ''
      if (typeof val === 'object') return this.formatDate(val)
      return this.formatDate(val)
    }
  },
  onShow() {
    // 从城市/车站选择页面返回时更新数据
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage.options && currentPage.options.city_code) {
      // 处理城市选择返回
      if (currentPage.options.ticket_type === 'flight') {
        if (currentPage.options.type === 'departure') {
          this.flightForm.departureCity = currentPage.options.city_code
          this.flightForm.departureCityName = currentPage.options.city_name
        } else {
          this.flightForm.arrivalCity = currentPage.options.city_code
          this.flightForm.arrivalCityName = currentPage.options.city_name
        }
      }
    }
    if (currentPage.options && currentPage.options.station_code) {
      // 处理车站选择返回
      if (currentPage.options.ticket_type === 'train') {
        if (currentPage.options.type === 'departure') {
          this.trainForm.departureStation = currentPage.options.station_code
          this.trainForm.departureStationName = currentPage.options.station_name
        } else {
          this.trainForm.arrivalStation = currentPage.options.station_code
          this.trainForm.arrivalStationName = currentPage.options.station_name
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #1A4A8F;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 30rpx;
  
  .navbar-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
  }
  
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 20rpx;
    
    .icon-more {
      font-size: 40rpx;
      color: #fff;
    }
    
    .icon-circle {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      color: #1A4A8F;
    }
  }
}

.tabs {
  display: flex;
  background: #1A4A8F;
  padding: 0 20rpx;
  
  .tab {
    flex: 1;
    text-align: center;
    padding: 30rpx 0;
    font-size: 32rpx;
    color: rgba(255, 255, 255, 0.6);
    position: relative;
    
    &.active {
      color: #F8D07C;
      font-weight: bold;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background-color: #F8D07C;
      }
    }
  }
}

.search-form {
  padding: 30rpx;
  
  .banner {
    position: relative;
    margin-bottom: 30rpx;
    border-radius: 16rpx;
    overflow: hidden;
    
    .banner-img {
      width: 100%;
      height: 300rpx;
    }
    
    .banner-text {
      position: absolute;
      bottom: 20rpx;
      left: 20rpx;
      right: 20rpx;
      color: #fff;
      font-size: 28rpx;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
    }
  }
  
  .trip-type {
    display: flex;
    margin-bottom: 30rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16rpx;
    padding: 10rpx;
    
    .trip-btn {
      flex: 1;
      text-align: center;
      padding: 20rpx 0;
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.7);
      border-radius: 12rpx;
      
      &.active {
        background: #F8D07C;
        color: #1A4A8F;
        font-weight: bold;
      }
    }
  }
  
  .route-section {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .route-item {
      flex: 1;
      text-align: center;
      
      .route-value {
        font-size: 36rpx;
        font-weight: bold;
        color: #fff;
      }
    }
    
    .route-swap {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .swap-icon {
        width: 60rpx;
        height: 60rpx;
      }
    }
  }
  
  .form-item {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 30rpx;
    margin-bottom: 20rpx;
    border-radius: 16rpx;
    
    .label {
      width: 160rpx;
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .value {
      flex: 1;
      font-size: 28rpx;
      color: #fff;
    }
    
    .arrow {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.6);
    }
    
    &.date-item {
      .date-value {
        flex: 1;
        font-size: 32rpx;
        color: #fff;
        font-weight: 500;
      }
    }
  }
  
  .cabin-class-section {
    display: flex;
    gap: 20rpx;
    margin-bottom: 20rpx;
    
    .cabin-class-btn {
      flex: 1;
      padding: 20rpx 0;
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12rpx;
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.7);
      
      &.active {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        font-weight: bold;
      }
    }
  }
  
  .seat-type-section {
    display: flex;
    gap: 20rpx;
    margin-bottom: 20rpx;
    
    .seat-type-btn {
      flex: 1;
      padding: 20rpx 0;
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12rpx;
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.7);
      
      &.active {
        background: #F8D07C;
        color: #1A4A8F;
        font-weight: bold;
      }
    }
  }
  
  .train-type-section {
    display: flex;
    gap: 20rpx;
    margin-bottom: 20rpx;
    
    .train-type-btn {
      flex: 1;
      padding: 20rpx 0;
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12rpx;
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.7);
      
      &.active {
        background: #F8D07C;
        color: #1A4A8F;
        font-weight: bold;
      }
    }
  }
  
  
  .search-btn {
    width: 100%;
    margin-top: 40rpx;
    background: linear-gradient(135deg, #F8D07C 0%, #E6B85C 100%);
    color: #1A4A8F;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 16rpx;
    padding: 30rpx 0;
    border: none;
    
    &::after {
      border: none;
    }
  }
}
</style>


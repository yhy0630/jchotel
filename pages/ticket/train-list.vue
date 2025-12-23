<template>
  <view class="page">
    <custom-navbar title="火车票"></custom-navbar>
    <!-- 顶部路线信息 -->
    <!-- <view class="header">
      <text class="route">{{ departureStationName }}-{{ arrivalStationName }}</text>
    </view> -->

    <!-- 日期选择 -->
    <view class="date-bar">
      <view class="date-wrapper">
        <scroll-view scroll-x class="date-scroll" scroll-with-animation>
          <view 
            v-for="(date, index) in dateList" 
            :key="index"
            :class="['date-item', { active: selectedDateIndex === index }]"
            @click="selectDate(index)"
          >
            <text class="date-text">{{ date.dateText }}</text>
            <text class="week-text">{{ date.weekText }}</text>
          </view>
        </scroll-view>
        <view class="date-calendar" @click="showCalendar">
          <image class="calendar-icon" src="/static/images/日历.png" mode="widthFix"></image>
          <text class="calendar-text">日历</text>
        </view>
      </view>
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
        <view class="train-main">
          <view class="train-left">
            <view class="time-row">
              <view class="time-block">
                <text class="time">{{ item.fromTime || item.departureTime }}</text>
                <text class="station">{{ item.fromStation || item.departureStationName }}</text>
              </view>
              <view class="duration-block">
                <text class="duration-text">{{ item.duration || formatDuration(item.spanTime || item.usedMinutes) }}</text>
                <view class="line-wrapper">
                  <view class="line-dot start"></view>
                  <view class="line-dash"></view>
                  <view class="line-dot end"></view>
                </view>
                <text class="train-no">{{ item.trainNo }}</text>
              </view>
              <view class="time-block">
                <text class="time">{{ item.toTime || item.arrivalTime }}</text>
                <text class="station">{{ item.toStation || item.arrivalStationName }}</text>
              </view>
            </view>
          </view>
          <view class="train-right">
            <text class="price">¥{{ formatPrice(item.display_price || item.minPrice || item.price) }}</text>
            <text class="price-unit">起</text>
          </view>
        </view>
        
        <view class="seat-info">
          <view 
            v-for="(seat, seatIndex) in item.seats" 
            :key="seatIndex"
            class="seat-item"
          >
            <text class="seat-name">{{ seat.name || seat.seatName }}：</text>
            <text class="seat-status">{{ seat.inventory !== undefined && seat.inventory !== null ? (seat.inventory > 0 ? '有票' : '无票') : '有票' }}</text>
          </view>
        </view>
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
        // 确保传递正确的车站名称和代码
        const params = {
          departure_station: this.departureStation,
          departure_station_name: this.departureStationName,
          fromStationCode: this.departureStation,
          fromStationName: this.departureStationName,
          arrival_station: this.arrivalStation,
          arrival_station_name: this.arrivalStationName,
          toStationCode: this.arrivalStation,
          toStationName: this.arrivalStationName,
          departure_date: this.departureDate,
          trainDate: this.departureDate,
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
          
          // 数据标准化处理
          newList = newList.map(item => this.normalizeTrainItem(item))
          
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
          const timeStr = item.fromTime || item.departureTime || ''
          const time = this.parseTime(timeStr)
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
          const trainType = item.trainType || (item.trainNo ? item.trainNo.charAt(0) : '')
          return this.filterTrainTypes.includes(trainType)
        })
      }
      
      // 座位类型筛选
      if (this.filterSeatTypes.length > 0) {
        filtered = filtered.filter(item => {
          if (!item.seats || !Array.isArray(item.seats)) return false
          // 将座位代码映射到筛选类型
          const seatCodeMap = {
            'first': ['ydz', 'swz'],
            'second': ['edz'],
            'business': ['swz'],
            'hard_sleeper': ['yw'],
            'soft_sleeper': ['rw'],
            'hard_seat': ['yz'],
            'soft_seat': ['rz'],
            'no_seat': ['wz']
          }
          return item.seats.some(seat => {
            const seatCode = seat.code || seat.seatCode || ''
            return this.filterSeatTypes.some(filterType => {
              const codes = seatCodeMap[filterType] || []
              return codes.includes(seatCode)
            })
          })
        })
      }
      
      return filtered
    },
    
    sortList(list) {
      const sorted = [...list]
      switch (this.sortType) {
        case 'departure_earliest':
          return sorted.sort((a, b) => {
            const timeA = this.parseTime(a.fromTime || a.departureTime || '')
            const timeB = this.parseTime(b.fromTime || b.departureTime || '')
            return timeA - timeB
          })
        case 'duration_shortest':
          return sorted.sort((a, b) => {
            const durationA = a.usedMinutes || this.parseDurationToMinutes(a.duration || a.spanTime)
            const durationB = b.usedMinutes || this.parseDurationToMinutes(b.duration || b.spanTime)
            return durationA - durationB
          })
        case 'price_lowest':
          return sorted.sort((a, b) => {
            const priceA = parseFloat(a.display_price || a.minPrice || a.price || 0)
            const priceB = parseFloat(b.display_price || b.minPrice || b.price || 0)
            return priceA - priceB
          })
        default:
          return sorted
      }
    },
    
    // 将时长字符串转换为分钟数
    parseDurationToMinutes(durationStr) {
      if (!durationStr) return 0
      // 处理 "3小时27分钟" 格式
      const hourMatch = durationStr.match(/(\d+)小时/)
      const minuteMatch = durationStr.match(/(\d+)分钟/)
      const hours = hourMatch ? parseInt(hourMatch[1]) : 0
      const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0
      return hours * 60 + minutes
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
    
    // 数据标准化：将 API 返回的数据转换为页面需要的格式
    normalizeTrainItem(item) {
      // 提取车次类型（G/D/K等）
      const trainType = item.trainNo ? item.trainNo.charAt(0) : ''
      
      // 格式化运行时长
      let duration = ''
      if (item.spanTime) {
        // spanTime 格式： "03:27"
        const parts = item.spanTime.split(':')
        if (parts.length === 2) {
          const hours = parseInt(parts[0]) || 0
          const minutes = parseInt(parts[1]) || 0
          duration = `${hours}小时${minutes}分钟`
        }
      } else if (item.usedMinutes) {
        // usedMinutes 格式： 207（分钟）
        const hours = Math.floor(item.usedMinutes / 60)
        const minutes = item.usedMinutes % 60
        duration = `${hours}小时${minutes}分钟`
      }
      
      // 处理座位信息
      const seats = []
      if (item.seatDetails && Array.isArray(item.seatDetails)) {
        item.seatDetails.forEach(seat => {
          if (seat.seatCode && seat.seatName) {
            seats.push({
              code: seat.seatCode,
              name: seat.seatName,
              price: parseFloat(seat.seatPrice || 0),
              inventory: parseInt(seat.seatInventory || 0),
              seatCode: seat.seatCode,
              seatName: seat.seatName,
              seatPrice: seat.seatPrice,
              seatInventory: seat.seatInventory
            })
          }
        })
      }
      
      // 计算最低价格
      let minPrice = 0
      if (seats.length > 0) {
        const prices = seats.map(s => parseFloat(s.price || 0)).filter(p => p > 0)
        if (prices.length > 0) {
          minPrice = Math.min(...prices)
        }
      }
      
      return {
        ...item,
        // 时间相关
        departureTime: item.fromTime || item.departureTime || '',
        arrivalTime: item.toTime || item.arrivalTime || '',
        departureStationName: item.fromStation || item.departureStationName || '',
        arrivalStationName: item.toStation || item.arrivalStationName || '',
        // 时长
        duration: duration || item.duration || '',
        spanTime: item.spanTime || '',
        usedMinutes: item.usedMinutes || 0,
        // 车次信息
        trainType: trainType,
        // 座位信息
        seats: seats,
        // 价格
        minPrice: minPrice,
        display_price: item.display_price || minPrice || item.price || 0,
        price: item.price || minPrice || 0,
        // 其他
        canBook: item.canBook !== undefined ? String(item.canBook) : '1',
        isStop: item.isStop || '0',
        // 确保 canBook 字段正确（解析后的布尔值，传入 item 以便检查库存）
        _canBook: this.parseCanBook(item.canBook, {
          seats: seats,
          isStop: item.isStop
        }),
        // 原始 canBook 值（用于调试）
        _rawCanBook: item.canBook
      }
    },
    
    // 解析 canBook 字段，判断是否可以预订
    parseCanBook(canBook, item = null) {
      // 如果提供了 item，先检查是否有座位库存
      if (item && item.seats && Array.isArray(item.seats) && item.seats.length > 0) {
        // 检查是否有任何座位有库存（库存 > 0）
        const hasInventory = item.seats.some(seat => {
          const inventory = parseInt(seat.inventory || seat.seatInventory || 0)
          return inventory > 0
        })
        // 如果有座位库存，即使 canBook 是 "0" 也可以预订
        if (hasInventory) {
          return true
        }
      }
      
      // 检查 isStop 字段，如果停运则不可预订
      if (item && item.isStop === '1' || item && item.isStop === 1) {
        return false
      }
      
      if (canBook === undefined || canBook === null) {
        return true // 默认可以预订
      }
      
      // canBook: "0" 或 0 表示不可预订，"1" 或 1 或其他值表示可以预订
      const canBookValue = String(canBook).trim()
      // 如果 canBook 是 "0" 或 0，表示不可预订
      if (canBookValue === '0') {
        return false
      }
      // 如果 canBook 是 "-1"，也表示不可预订
      if (canBookValue === '-1') {
        return false
      }
      // "1" 或其他非空值都表示可以预订
      return true
    },
    
    // 判断是否可以预订车次
    canBookTrain(item) {
      // 优先使用 _canBook，如果没有则重新计算
      if (item._canBook !== undefined) {
        // 但需要再次检查座位库存
        if (item.seats && Array.isArray(item.seats) && item.seats.length > 0) {
          const hasInventory = item.seats.some(seat => {
            const inventory = parseInt(seat.inventory || seat.seatInventory || 0)
            return inventory > 0
          })
          if (hasInventory) {
            return true
          }
        }
        return item._canBook
      }
      // 直接解析 canBook 字段，传入 item 以便检查库存
      const canBook = item.canBook !== undefined ? item.canBook : '1'
      return this.parseCanBook(canBook, item)
    },
    
    // 格式化时长显示
    formatDuration(spanTimeOrMinutes) {
      if (!spanTimeOrMinutes) return ''
      if (typeof spanTimeOrMinutes === 'string' && spanTimeOrMinutes.includes(':')) {
        // spanTime 格式： "03:27"
        const parts = spanTimeOrMinutes.split(':')
        if (parts.length === 2) {
          const hours = parseInt(parts[0]) || 0
          const minutes = parseInt(parts[1]) || 0
          return `${hours}小时${minutes}分钟`
        }
      } else {
        // usedMinutes 格式： 207（分钟）
        const minutes = parseInt(spanTimeOrMinutes) || 0
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}小时${mins}分钟`
      }
      return ''
    },
    
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      return numPrice.toFixed(2)
    },
    
    goDetail(item) {
      // 跳转到车次详情页面
      // 确保必要参数存在
      const trainNo = item.trainNo || item.trainCode || ''
      const departureDate = item.fromDate || item.departureDate || this.departureDate
      
      if (!trainNo) {
        uni.showToast({ title: '车次号不能为空', icon: 'none' })
        return
      }
      
      if (!departureDate) {
        uni.showToast({ title: '出发日期不能为空', icon: 'none' })
        return
      }
      
      const params = {
        train_no: trainNo,
        departure_date: departureDate,
        train_code: item.trainCode || '',
        // 优先使用车次数据中的车站信息，如果没有则使用列表页的车站信息
        from_station: item.fromStationCode || item.fromStation || this.departureStation || '',
        to_station: item.toStationCode || item.toStation || this.arrivalStation || '',
        from_station_name: item.fromStation || item.departureStationName || this.departureStationName || '',
        to_station_name: item.toStation || item.arrivalStationName || this.arrivalStationName || '',
        from_time: item.fromTime || item.departureTime || '',
        to_time: item.toTime || item.arrivalTime || '',
        span_time: item.spanTime || '',
        used_minutes: item.usedMinutes || ''
      }
      
      // 确保出发站和到达站名称总是被传递（即使为空，也传递列表页的默认值）
      if (!params.from_station_name && this.departureStationName) {
        params.from_station_name = this.departureStationName
      }
      if (!params.to_station_name && this.arrivalStationName) {
        params.to_station_name = this.arrivalStationName
      }
      
      // 过滤空值，但保留必要参数和车站信息
      const queryString = Object.keys(params)
        .filter(key => {
          // train_no 和 departure_date 是必需的，不过滤
          if (key === 'train_no' || key === 'departure_date') {
            return true
          }
          // from_station_name 和 to_station_name 也是必需的，不过滤
          if (key === 'from_station_name' || key === 'to_station_name') {
            return true
          }
          // 其他参数过滤空值
          return params[key]
        })
        .map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
        .join('&')
      
      console.log('跳转到详情页:', `/pages/ticket/train-detail?${queryString}`)
      
      uni.navigateTo({
        url: `/pages/ticket/train-detail?${queryString}`,
        fail: (err) => {
          console.error('跳转失败:', err)
          uni.showToast({ title: '跳转失败，请重试', icon: 'none' })
        }
      })
    },
    
    goBook(item) {
      // 点击订票按钮跳转到车次详情页面
      console.log('点击订票按钮:', item)
      if (!this.canBookTrain(item)) {
        uni.showToast({ title: '该车次不可预订', icon: 'none' })
        return
      }
      this.goDetail(item)
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #0D1034;
  padding-top: calc(130rpx + var(--status-bar-height));
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
  background: #012158;
  
  .date-wrapper{
    display: flex;
    align-items: stretch;
  }

  .date-scroll {
    white-space: nowrap;
    padding: 20rpx 20rpx;
    flex: 1 1 auto;
    min-width: 0;
    
    .date-item {
      display: inline-block;
      padding: 18rpx 26rpx;
      margin: 0 8rpx;
      text-align: center;
      border-radius: 8rpx;
      border: 1rpx solid transparent;
      
      .date-text {
        display: block;
        font-size: 28rpx;
        color: #ffffff;
      }
      
      .week-text {
        display: block;
        font-size: 24rpx;
        color: #ffffff;
        margin-top: 5rpx;
      }
      
      &.active {
        background: #4E474C;
        border-color: #FCDDA6;

        .date-text, .week-text {
          color: #FCDDA6;
        }
      }
    }
  }

  .date-calendar{
    flex: 0 0 150rpx;
    width: 150rpx;
    padding: 20rpx 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    border-left: 1rpx solid rgba(255,255,255,0.2);
  }

  .calendar-icon{
    width: 48rpx;
    height: 48rpx;
  }

  .calendar-text{
    font-size: 24rpx;
    color: #e0e3ea;
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 26rpx;
  background: #1E1F34;
  padding: 24rpx 28rpx;
  border-radius: 8rpx;
  margin: 20rpx 16rpx 12rpx;

  .filter-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 76rpx;
    border-radius: 12rpx;
    background: #353548;
    color: #f0f0f0;
    font-size: 26rpx;
    font-weight: 600;
    border: none;
    padding: 0 10rpx;

    &.filter-btn {
      gap: 12rpx;

      .filter-icon {
        width: 28rpx;
        height: 28rpx;
      }
    }

    &.active {
      background: #58585e;
      color: #ffffff;
      font-weight: 700;
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
  height: calc(100vh - 320rpx);
  padding: 10rpx 16rpx;
  box-sizing: border-box;
}

.train-item {
  background: #1E1F34;
  border-radius: 18rpx;
  padding: 30rpx 24rpx;
  margin-bottom: 16rpx;
  
  .train-main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24rpx;
  }
  
  .train-left {
    flex: 1;
    min-width: 0;
    
    .time-row {
      display: flex;
      align-items: center;
      gap: 18rpx;
      
      .time-block {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        
        .time {
          font-size: 32rpx;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
        }
        
        .station {
          font-size: 20rpx;
          color: #d3d6e0;
          margin-top: 6rpx;
        }
      }
      
      .duration-block {
        flex: 0 0 auto;
        min-width: 70rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4rpx;
        
        .line-wrapper {
          width: 90rpx;
          position: relative;
          display: flex;
          align-items: center;
          margin: 10rpx 80rpx;
          
          .line-dot {
            width: 13rpx;
            height: 13rpx;
            border-radius: 50%;
            border: 1px solid #fff;
            
            &.start {
              position: absolute;
              left: 0;
            }
            
            &.end {
              position: absolute;
              right: 0;
            }
          }
          
          .line-dash {
            flex: 1;
            height: 1rpx;
            background: #ffffff;
            margin: 0 8rpx;
          }
        }
        
        .duration-text {
          font-size: 18rpx;
          color: #d3d6e0;
        }
        
        .train-no {
          font-size: 18rpx;
          color: #d3d6e0;
        }
      }
    }
  }
  
  .train-right {
    flex: 0 0 auto;
    display: flex;
    align-items: baseline;
    gap: 4rpx;
    margin-top: 20rpx;
    margin-left: 16rpx;
    
    .price {
      font-size: 30rpx;
      font-weight: 500;
      color: #ffffff;
      line-height: 1.2;
    }
    
    .price-unit {
      font-size: 18rpx;
      color: #d3d6e0;
    }
  }
  
  .seat-info {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    
    .seat-item {
      display: flex;
      align-items: center;
      
      .seat-name {
        font-size: 24rpx;
        color: #d3d6e0;
      }
      
      .seat-status {
        font-size: 24rpx;
        color: #d3d6e0;
      }
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


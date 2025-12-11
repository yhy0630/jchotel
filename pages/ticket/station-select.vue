<template>
  <view class="page">
    <!-- 搜索框 -->
    <view class="search-box">
      <input v-model="keyword" placeholder="搜索车站" @input="onSearch" />
    </view>

    <!-- 热门车站 -->
    <view class="section" v-if="hotStations.length > 0">
      <view class="section-title">热门车站</view>
      <view class="station-list">
        <view 
          v-for="station in hotStations" 
          :key="station.stationCode" 
          class="station-item"
          @click="selectStation(station)"
        >
          <text class="station-name">{{ station.stationName }}</text>
          <text class="station-city" v-if="station.cityName">{{ station.cityName }}</text>
        </view>
      </view>
    </view>

    <!-- 全部车站 -->
    <view class="section">
      <view class="section-title">全部车站</view>
      <view class="station-list">
        <view 
          v-for="station in filteredStations" 
          :key="station.stationCode" 
          class="station-item"
          @click="selectStation(station)"
        >
          <text class="station-name">{{ station.stationName }}</text>
          <text class="station-city" v-if="station.cityName">{{ station.cityName }}</text>
        </view>
      </view>
      <view v-if="filteredStations.length === 0" class="empty">暂无数据</view>
    </view>
  </view>
</template>

<script>
import { stationList } from '@/api/train.js'

export default {
  data() {
    return {
      keyword: '',
      allStations: [],
      hotStations: [],
      filteredStations: [],
      type: '', // departure/arrival
      ticketType: '' // train
    }
  },
  onLoad(options) {
    this.type = options.type || 'departure'
    this.ticketType = options.ticket_type || 'train'
    this.loadStations()
  },
  methods: {
    async loadStations() {
      try {
        const res = await stationList({
          keyword: ''
        })
        if (res.code === 1) {
          const list = res.data.list || res.data || []
          this.allStations = list
          this.hotStations = this.allStations.filter(station => station.isHot === 1 || station.isHot === '1')
          this.filteredStations = this.allStations
          return
        }
        // 接口未返回成功，使用本地兜底
        this.useLocalMock()
      } catch (e) {
        // 接口异常，使用本地兜底
        this.useLocalMock()
      }
    },

    // 本地兜底车站数据，接口不可用时保证可筛选
    useLocalMock() {
      const mock = [
        { stationCode: 'BJP', stationName: '北京', cityName: '北京', pinyinName: 'beijing', isHot: 1 },
        { stationCode: 'SHH', stationName: '上海虹桥', cityName: '上海', pinyinName: 'shanghaihongqiao', isHot: 1 },
        { stationCode: 'SHH2', stationName: '上海', cityName: '上海', pinyinName: 'shanghai', isHot: 1 },
        { stationCode: 'GZQ', stationName: '广州', cityName: '广州', pinyinName: 'guangzhou', isHot: 1 },
        { stationCode: 'SZQ', stationName: '深圳', cityName: '深圳', pinyinName: 'shenzhen', isHot: 1 },
        { stationCode: 'CDW', stationName: '成都东', cityName: '成都', pinyinName: 'chengdudong', isHot: 1 },
        { stationCode: 'CQW', stationName: '重庆西', cityName: '重庆', pinyinName: 'chongqingxi', isHot: 0 },
        { stationCode: 'HGH', stationName: '杭州东', cityName: '杭州', pinyinName: 'hangzhoudong', isHot: 0 },
        { stationCode: 'TAK', stationName: '青岛北', cityName: '青岛', pinyinName: 'qingdaobei', isHot: 0 },
        { stationCode: 'XMS', stationName: '厦门北', cityName: '厦门', pinyinName: 'xiamenbei', isHot: 0 },
        { stationCode: 'SYQ', stationName: '三亚', cityName: '三亚', pinyinName: 'sanya', isHot: 0 },
        { stationCode: 'WMR', stationName: '乌鲁木齐', cityName: '乌鲁木齐', pinyinName: 'wulumuqi', isHot: 0 },
      ]
      this.allStations = mock
      this.hotStations = mock.filter(s => s.isHot === 1)
      this.filteredStations = mock
      uni.showToast({ title: '车站数据使用本地缓存', icon: 'none' })
    },
    onSearch() {
      if (!this.keyword) {
        this.filteredStations = this.allStations
        return
      }
      this.filteredStations = this.allStations.filter(station => 
        station.stationName.includes(this.keyword) || 
        (station.pinyinName && station.pinyinName.toLowerCase().includes(this.keyword.toLowerCase())) ||
        (station.cityName && station.cityName.includes(this.keyword))
      )
    },
    selectStation(station) {
      // 返回上一页并传递选中的车站
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.$vm) {
        if (this.ticketType === 'train') {
          if (this.type === 'departure') {
            prevPage.$vm.trainForm.departureStation = station.stationCode
            prevPage.$vm.trainForm.departureStationName = station.stationName
          } else {
            prevPage.$vm.trainForm.arrivalStation = station.stationCode
            prevPage.$vm.trainForm.arrivalStationName = station.stationName
          }
        }
      }
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-box {
  padding: 20rpx;
  background: #fff;
  
  input {
    width: 100%;
    padding: 20rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    font-size: 28rpx;
  }
}

.section {
  padding: 20rpx;
  
  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .station-list {
    .station-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 25rpx;
      background: #fff;
      border-radius: 8rpx;
      margin-bottom: 20rpx;
      
      .station-name {
        font-size: 28rpx;
        color: #333;
        font-weight: bold;
      }
      
      .station-city {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .empty {
    text-align: center;
    padding: 40rpx;
    color: #999;
    font-size: 28rpx;
  }
}
</style>




    <!-- 搜索框 -->
    <view class="search-box">
      <input v-model="keyword" placeholder="搜索车站" @input="onSearch" />
    </view>

    <!-- 热门车站 -->
    <view class="section" v-if="hotStations.length > 0">
      <view class="section-title">热门车站</view>
      <view class="station-list">
        <view 
          v-for="station in hotStations" 
          :key="station.stationCode" 
          class="station-item"
          @click="selectStation(station)"
        >
          <text class="station-name">{{ station.stationName }}</text>
          <text class="station-city" v-if="station.cityName">{{ station.cityName }}</text>
        </view>
      </view>
    </view>

    <!-- 全部车站 -->
    <view class="section">
      <view class="section-title">全部车站</view>
      <view class="station-list">
        <view 
          v-for="station in filteredStations" 
          :key="station.stationCode" 
          class="station-item"
          @click="selectStation(station)"
        >
          <text class="station-name">{{ station.stationName }}</text>
          <text class="station-city" v-if="station.cityName">{{ station.cityName }}</text>
        </view>
      </view>
      <view v-if="filteredStations.length === 0" class="empty">暂无数据</view>
    </view>
  </view>
</template>

<script>
import { stationList } from '@/api/train.js'

export default {
  data() {
    return {
      keyword: '',
      allStations: [],
      hotStations: [],
      filteredStations: [],
      type: '', // departure/arrival
      ticketType: '' // train
    }
  },
  onLoad(options) {
    this.type = options.type || 'departure'
    this.ticketType = options.ticket_type || 'train'
    this.loadStations()
  },
  methods: {
    async loadStations() {
      try {
        const res = await stationList({
          keyword: ''
        })
        if (res.code === 1) {
          const list = res.data.list || res.data || []
          this.allStations = list
          this.hotStations = this.allStations.filter(station => station.isHot === 1 || station.isHot === '1')
          this.filteredStations = this.allStations
          return
        }
        // 接口未返回成功，使用本地兜底
        this.useLocalMock()
      } catch (e) {
        // 接口异常，使用本地兜底
        this.useLocalMock()
      }
    },

    // 本地兜底车站数据，接口不可用时保证可筛选
    useLocalMock() {
      const mock = [
        { stationCode: 'BJP', stationName: '北京', cityName: '北京', pinyinName: 'beijing', isHot: 1 },
        { stationCode: 'SHH', stationName: '上海虹桥', cityName: '上海', pinyinName: 'shanghaihongqiao', isHot: 1 },
        { stationCode: 'SHH2', stationName: '上海', cityName: '上海', pinyinName: 'shanghai', isHot: 1 },
        { stationCode: 'GZQ', stationName: '广州', cityName: '广州', pinyinName: 'guangzhou', isHot: 1 },
        { stationCode: 'SZQ', stationName: '深圳', cityName: '深圳', pinyinName: 'shenzhen', isHot: 1 },
        { stationCode: 'CDW', stationName: '成都东', cityName: '成都', pinyinName: 'chengdudong', isHot: 1 },
        { stationCode: 'CQW', stationName: '重庆西', cityName: '重庆', pinyinName: 'chongqingxi', isHot: 0 },
        { stationCode: 'HGH', stationName: '杭州东', cityName: '杭州', pinyinName: 'hangzhoudong', isHot: 0 },
        { stationCode: 'TAK', stationName: '青岛北', cityName: '青岛', pinyinName: 'qingdaobei', isHot: 0 },
        { stationCode: 'XMS', stationName: '厦门北', cityName: '厦门', pinyinName: 'xiamenbei', isHot: 0 },
        { stationCode: 'SYQ', stationName: '三亚', cityName: '三亚', pinyinName: 'sanya', isHot: 0 },
        { stationCode: 'WMR', stationName: '乌鲁木齐', cityName: '乌鲁木齐', pinyinName: 'wulumuqi', isHot: 0 },
      ]
      this.allStations = mock
      this.hotStations = mock.filter(s => s.isHot === 1)
      this.filteredStations = mock
      uni.showToast({ title: '车站数据使用本地缓存', icon: 'none' })
    },
    onSearch() {
      if (!this.keyword) {
        this.filteredStations = this.allStations
        return
      }
      this.filteredStations = this.allStations.filter(station => 
        station.stationName.includes(this.keyword) || 
        (station.pinyinName && station.pinyinName.toLowerCase().includes(this.keyword.toLowerCase())) ||
        (station.cityName && station.cityName.includes(this.keyword))
      )
    },
    selectStation(station) {
      // 返回上一页并传递选中的车站
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.$vm) {
        if (this.ticketType === 'train') {
          if (this.type === 'departure') {
            prevPage.$vm.trainForm.departureStation = station.stationCode
            prevPage.$vm.trainForm.departureStationName = station.stationName
          } else {
            prevPage.$vm.trainForm.arrivalStation = station.stationCode
            prevPage.$vm.trainForm.arrivalStationName = station.stationName
          }
        }
      }
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-box {
  padding: 20rpx;
  background: #fff;
  
  input {
    width: 100%;
    padding: 20rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    font-size: 28rpx;
  }
}

.section {
  padding: 20rpx;
  
  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .station-list {
    .station-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 25rpx;
      background: #fff;
      border-radius: 8rpx;
      margin-bottom: 20rpx;
      
      .station-name {
        font-size: 28rpx;
        color: #333;
        font-weight: bold;
      }
      
      .station-city {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .empty {
    text-align: center;
    padding: 40rpx;
    color: #999;
    font-size: 28rpx;
  }
}
</style>




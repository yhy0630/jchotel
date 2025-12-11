<template>
  <view class="page">
    <!-- 搜索框 -->
    <view class="search-box">
      <input v-model="keyword" placeholder="搜索城市" @input="onSearch" />
    </view>

    <!-- 热门城市 -->
    <view class="section" v-if="hotCities.length > 0">
      <view class="section-title">热门城市</view>
      <view class="city-list">
        <view 
          v-for="city in hotCities" 
          :key="city.cityCode" 
          class="city-item"
          @click="selectCity(city)"
        >
          {{ city.cityName }}
        </view>
      </view>
    </view>

    <!-- 全部城市 -->
    <view class="section">
      <view class="section-title">全部城市</view>
      <view class="city-list">
        <view 
          v-for="city in filteredCities" 
          :key="city.cityCode" 
          class="city-item"
          @click="selectCity(city)"
        >
          {{ city.cityName }}
        </view>
      </view>
      <view v-if="filteredCities.length === 0" class="empty">暂无数据</view>
    </view>
  </view>
</template>

<script>
import { cityList } from '@/api/flight.js'

export default {
  data() {
    return {
      keyword: '',
      allCities: [],
      hotCities: [],
      filteredCities: [],
      type: '', // departure/arrival
      ticketType: '' // flight/train
    }
  },
  onLoad(options) {
    this.type = options.type || 'departure'
    this.ticketType = options.ticket_type || 'flight'
    this.loadCities()
  },
  methods: {
    async loadCities() {
      try {
        const res = await cityList({
          intl_type: 0
        })
        if (res.code === 1) {
          const list = res.data.list || res.data || []
          this.allCities = list
          this.hotCities = this.allCities.filter(city => city.isHot === 1 || city.isHot === '1')
          this.filteredCities = this.allCities
          return
        }
        // 接口未返回成功，使用本地兜底
        this.useLocalMock()
      } catch (e) {
        // 接口异常，使用本地兜底
        this.useLocalMock()
      }
    },

    // 本地兜底城市数据，接口不可用时保证可筛选
    useLocalMock() {
      const mock = [
        { cityCode: 'BJS', cityName: '北京', pinyinName: 'beijing', isHot: 1 },
        { cityCode: 'SHA', cityName: '上海', pinyinName: 'shanghai', isHot: 1 },
        { cityCode: 'CAN', cityName: '广州', pinyinName: 'guangzhou', isHot: 1 },
        { cityCode: 'SZX', cityName: '深圳', pinyinName: 'shenzhen', isHot: 1 },
        { cityCode: 'CTU', cityName: '成都', pinyinName: 'chengdu', isHot: 1 },
        { cityCode: 'CKG', cityName: '重庆', pinyinName: 'chongqing', isHot: 0 },
        { cityCode: 'HGH', cityName: '杭州', pinyinName: 'hangzhou', isHot: 0 },
        { cityCode: 'NKG', cityName: '南京', pinyinName: 'nanjing', isHot: 0 },
        { cityCode: 'TAO', cityName: '青岛', pinyinName: 'qingdao', isHot: 0 },
        { cityCode: 'XMN', cityName: '厦门', pinyinName: 'xiamen', isHot: 0 },
        { cityCode: 'SYX', cityName: '三亚', pinyinName: 'sanya', isHot: 0 },
        { cityCode: 'URC', cityName: '乌鲁木齐', pinyinName: 'wulumuqi', isHot: 0 },
      ]
      this.allCities = mock
      this.hotCities = mock.filter(c => c.isHot === 1)
      this.filteredCities = mock
      uni.showToast({ title: '城市数据使用本地缓存', icon: 'none' })
    },
    onSearch() {
      if (!this.keyword) {
        this.filteredCities = this.allCities
        return
      }
      this.filteredCities = this.allCities.filter(city => 
        city.cityName.includes(this.keyword) || 
        (city.pinyinName && city.pinyinName.toLowerCase().includes(this.keyword.toLowerCase()))
      )
    },
    selectCity(city) {
      // 返回上一页并传递选中的城市
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.$vm) {
        if (this.ticketType === 'flight') {
          if (this.type === 'departure') {
            prevPage.$vm.flightForm.departureCity = city.cityCode
            prevPage.$vm.flightForm.departureCityName = city.cityName
          } else {
            prevPage.$vm.flightForm.arrivalCity = city.cityCode
            prevPage.$vm.flightForm.arrivalCityName = city.cityName
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
  
  .city-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    
    .city-item {
      padding: 15rpx 30rpx;
      background: #fff;
      border-radius: 8rpx;
      font-size: 28rpx;
      color: #333;
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
      <input v-model="keyword" placeholder="搜索城市" @input="onSearch" />
    </view>

    <!-- 热门城市 -->
    <view class="section" v-if="hotCities.length > 0">
      <view class="section-title">热门城市</view>
      <view class="city-list">
        <view 
          v-for="city in hotCities" 
          :key="city.cityCode" 
          class="city-item"
          @click="selectCity(city)"
        >
          {{ city.cityName }}
        </view>
      </view>
    </view>

    <!-- 全部城市 -->
    <view class="section">
      <view class="section-title">全部城市</view>
      <view class="city-list">
        <view 
          v-for="city in filteredCities" 
          :key="city.cityCode" 
          class="city-item"
          @click="selectCity(city)"
        >
          {{ city.cityName }}
        </view>
      </view>
      <view v-if="filteredCities.length === 0" class="empty">暂无数据</view>
    </view>
  </view>
</template>

<script>
import { cityList } from '@/api/flight.js'

export default {
  data() {
    return {
      keyword: '',
      allCities: [],
      hotCities: [],
      filteredCities: [],
      type: '', // departure/arrival
      ticketType: '' // flight/train
    }
  },
  onLoad(options) {
    this.type = options.type || 'departure'
    this.ticketType = options.ticket_type || 'flight'
    this.loadCities()
  },
  methods: {
    async loadCities() {
      try {
        const res = await cityList({
          intl_type: 0
        })
        if (res.code === 1) {
          const list = res.data.list || res.data || []
          this.allCities = list
          this.hotCities = this.allCities.filter(city => city.isHot === 1 || city.isHot === '1')
          this.filteredCities = this.allCities
          return
        }
        // 接口未返回成功，使用本地兜底
        this.useLocalMock()
      } catch (e) {
        // 接口异常，使用本地兜底
        this.useLocalMock()
      }
    },

    // 本地兜底城市数据，接口不可用时保证可筛选
    useLocalMock() {
      const mock = [
        { cityCode: 'BJS', cityName: '北京', pinyinName: 'beijing', isHot: 1 },
        { cityCode: 'SHA', cityName: '上海', pinyinName: 'shanghai', isHot: 1 },
        { cityCode: 'CAN', cityName: '广州', pinyinName: 'guangzhou', isHot: 1 },
        { cityCode: 'SZX', cityName: '深圳', pinyinName: 'shenzhen', isHot: 1 },
        { cityCode: 'CTU', cityName: '成都', pinyinName: 'chengdu', isHot: 1 },
        { cityCode: 'CKG', cityName: '重庆', pinyinName: 'chongqing', isHot: 0 },
        { cityCode: 'HGH', cityName: '杭州', pinyinName: 'hangzhou', isHot: 0 },
        { cityCode: 'NKG', cityName: '南京', pinyinName: 'nanjing', isHot: 0 },
        { cityCode: 'TAO', cityName: '青岛', pinyinName: 'qingdao', isHot: 0 },
        { cityCode: 'XMN', cityName: '厦门', pinyinName: 'xiamen', isHot: 0 },
        { cityCode: 'SYX', cityName: '三亚', pinyinName: 'sanya', isHot: 0 },
        { cityCode: 'URC', cityName: '乌鲁木齐', pinyinName: 'wulumuqi', isHot: 0 },
      ]
      this.allCities = mock
      this.hotCities = mock.filter(c => c.isHot === 1)
      this.filteredCities = mock
      uni.showToast({ title: '城市数据使用本地缓存', icon: 'none' })
    },
    onSearch() {
      if (!this.keyword) {
        this.filteredCities = this.allCities
        return
      }
      this.filteredCities = this.allCities.filter(city => 
        city.cityName.includes(this.keyword) || 
        (city.pinyinName && city.pinyinName.toLowerCase().includes(this.keyword.toLowerCase()))
      )
    },
    selectCity(city) {
      // 返回上一页并传递选中的城市
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.$vm) {
        if (this.ticketType === 'flight') {
          if (this.type === 'departure') {
            prevPage.$vm.flightForm.departureCity = city.cityCode
            prevPage.$vm.flightForm.departureCityName = city.cityName
          } else {
            prevPage.$vm.flightForm.arrivalCity = city.cityCode
            prevPage.$vm.flightForm.arrivalCityName = city.cityName
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
  
  .city-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    
    .city-item {
      padding: 15rpx 30rpx;
      background: #fff;
      border-radius: 8rpx;
      font-size: 28rpx;
      color: #333;
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




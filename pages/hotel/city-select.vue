<template>
  <view class="page">
    <!-- 搜索框 -->
    <view class="search-box">
      <input v-model="keyword" placeholder="搜索城市" @input="onSearch" />
    </view>

    <!-- 热门城市 -->
    <view class="section">
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
import { cityList } from '../../api/hotel.js'

export default {
  data() {
    return {
      keyword: '',
      allCities: [],
      hotCities: [],
      filteredCities: []
    }
  },
  onLoad() {
    this.loadCities()
  },
  methods: {
    async loadCities() {
      try {
        const res = await cityList({
          intl_type: 0
        })
        if (res.code === 1) {
          // API返回的数据结构可能是 res.data.list 或 res.data
          const list = res.data.list || res.data || []
          this.allCities = list
          this.hotCities = this.allCities.filter(city => city.isHot === 1 || city.isHot === '1')
          this.filteredCities = this.allCities
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      }
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
        // 设置城市信息到上一页
        prevPage.$vm.cityCode = city.cityCode
        prevPage.$vm.cityName = city.cityName
        if (prevPage.$vm.form) {
          prevPage.$vm.form.city_code = city.cityCode
          prevPage.$vm.form.city_name = city.cityName
        }
        if (prevPage.$vm.loadList) {
          prevPage.$vm.page = 1
          prevPage.$vm.noMore = false
          prevPage.$vm.loadList()
        }
      }
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}
.search-box {
  background: #fff;
  padding: 20rpx;
  border-bottom: 1px solid #eee;
}
.search-box input {
  background: #f5f5f5;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}
.section {
  background: #fff;
  margin-top: 20rpx;
  padding: 20rpx;
}
.section-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}
.city-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.city-item {
  padding: 15rpx 30rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
}
.empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}
</style>


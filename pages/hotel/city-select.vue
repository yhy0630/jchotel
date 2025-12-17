<template>
  <view class="page">
    <!-- 搜索框 -->
    <view class="search-box">
      <view class="search-inner">
        <image class="search-icon" src="/static/images/Shape.png" mode="widthFix"></image>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="请输入城市名或拼音"
          placeholder-style="color:#bfc3d2"
          @input="onSearch"
        />
      </view>
    </view>

    <!-- 热门城市（仅无搜索词时显示） -->
    <view class="section" v-if="!keyword.trim()">
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
      filteredCities: [],
      searchTimer: null
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
    normalize(str = '') {
      return String(str).toLowerCase()
    },
    matchCity(city, term) {
      const name = city.cityName || ''
      const pinyin = city.pinyinName || ''
      const short = city.shortPinyin || city.py || ''
      const code = city.cityCode || ''
      const province = city.provinceName || city.province || ''
      const provincePy = city.provincePinyin || city.provincePy || ''
      const provinceCode = city.provinceCode || ''
      const lowerTerm = this.normalize(term)
      return (
        this.normalize(name).includes(lowerTerm) ||
        this.normalize(pinyin).includes(lowerTerm) ||
        this.normalize(short).includes(lowerTerm) ||
        code.includes(term) ||
        this.normalize(province).includes(lowerTerm) ||
        this.normalize(provincePy).includes(lowerTerm) ||
        provinceCode.includes(term)
      )
    },
    onSearch() {
      if (this.searchTimer) clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        const term = (this.keyword || '').trim()
        if (!term) {
        this.filteredCities = this.allCities
        return
      }
        this.filteredCities = this.allCities.filter(city => this.matchCity(city, term))
      }, 150)
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
  background: #0D1038;
}
.search-box {
  padding: 20rpx;
}
.search-inner{
  display: flex;
  align-items: center;
  gap: 14rpx;
  background: #353548;
  border-radius: 50rpx;
  padding: 14rpx 22rpx;
}
.search-icon{
  width: 36rpx;
  height: 36rpx;
}
.search-input{
  flex: 1;
  background: transparent;
  color: #f5f5f7;
  font-size: 28rpx;
}
.section {
  background: transparent;
  margin-top: 12rpx;
  padding: 0 0 12rpx 0;
}
.section-title {
  font-size: 28rpx;
  font-weight: 600;
  padding: 20rpx 32rpx 12rpx;
  color: #fcd59e;
}
.city-list {
  display: flex;
  flex-direction: column;
  background: #0D1038;
}
.city-item {
  padding: 26rpx 32rpx;
  font-size: 30rpx;
  color: #f5f5f7;
  border-bottom: 1rpx solid rgba(255,255,255,0.15);
}
.city-item:last-child{
  border-bottom: none;
}
.city-item.active{
  color: #F4BD63;
}
.empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}
</style>


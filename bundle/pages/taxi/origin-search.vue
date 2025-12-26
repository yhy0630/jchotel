<template>
  <view class="origin-search">
    <custom-navbar :title="pageTitle"></custom-navbar>
    
    <!-- 搜索框 -->
    <view class="search-box">
      <view class="search-input-wrapper">
        <view class="search-icon"></view>
        <input 
          class="search-input" 
          v-model="searchKeyword"
          placeholder="您要去哪"
          placeholder-class="search-placeholder"
          @input="handleSearchInput"
          @confirm="handleSearch"
          focus
        />
        <view class="clear-btn" v-if="searchKeyword" @click="clearSearch">
          <text>×</text>
        </view>
      </view>
    </view>

    <!-- 搜索建议列表 -->
    <scroll-view scroll-y class="suggestion-list" v-if="showSuggestions && suggestions.length > 0">
      <view 
        v-for="(item, index) in suggestions" 
        :key="`sug-${index}`"
        class="suggestion-item"
        @tap="handleSuggestionTap(index)"
      >
        <view class="suggestion-icon">
          <image src="/static/images/jiudian-3 1.png" mode="aspectFit"></image>
        </view>
        <view class="suggestion-content">
          <view class="suggestion-text">{{ item.title }}</view>
          <view class="suggestion-address" v-if="item.address">{{ item.address }}</view>
        </view>
      </view>
    </scroll-view>

    <!-- 搜索结果列表 -->
    <scroll-view scroll-y class="result-list" v-if="!showSuggestions && searchResults.length > 0">
      <view 
        v-for="(item, index) in searchResults" 
        :key="index"
        class="result-item"
        @tap="handleResultTap(index)"
      >
        <view class="item-icon">
          <image src="/static/images/jiudian-3 1.png" mode="aspectFit"></image>
        </view>
        <view class="item-content">
          <view class="item-name">{{ item.title || item.name }}</view>
          <view class="item-address">{{ item.address }}</view>
        </view>
        <view class="item-distance" v-if="item.distance">{{ item.distance }}</view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!showSuggestions && searched && searchResults.length === 0">
      <image class="empty-icon" src="/static/images/empty.png" mode="aspectFit"></image>
      <text class="empty-text">未找到相关地点</text>
    </view>

    <!-- 默认提示 -->
    <view class="default-tip" v-else-if="!showSuggestions">
      <text class="tip-text">请输入地点名称进行搜索</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      searchResults: [],
      suggestions: [],
      showSuggestions: false,
      searched: false,
      searchTimer: null,
      currentLocation: {
        latitude: '',
        longitude: ''
      },
      type: 'origin', // origin 或 destination
      pageTitle: '选择上车点'
    }
  },
  onLoad(options) {
    // 获取页面类型参数
    if (options.type === 'destination') {
      this.type = 'destination'
      this.pageTitle = '选择目的地'
    } else {
      this.type = 'origin'
      this.pageTitle = '选择上车点'
    }
    this.getCurrentLocation()
  },
  methods: {
    getCurrentLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.currentLocation = {
            latitude: res.latitude,
            longitude: res.longitude
          }
        },
        fail: () => {
          console.log('获取位置失败')
        }
      })
    },
    handleSearchInput(e) {
      // 防抖搜索建议
      clearTimeout(this.searchTimer)
      
      if (!this.searchKeyword.trim()) {
        this.suggestions = []
        this.showSuggestions = false
        this.searchResults = []
        this.searched = false
        return
      }
      
      this.searchTimer = setTimeout(() => {
        if (this.searchKeyword.trim()) {
          this.getSuggestions()
        }
      }, 300)
    },
    getSuggestions() {
      const keyword = this.searchKeyword.trim()
      if (!keyword) {
        return
      }
      
      const location = this.currentLocation.latitude && this.currentLocation.longitude 
        ? `${this.currentLocation.latitude},${this.currentLocation.longitude}`
        : ''
      
      // 使用腾讯地图输入提示API
      uni.request({
        url: 'https://apis.map.qq.com/ws/place/v1/suggestion',
        data: {
          keyword: keyword,
          region: '全国',
          location: location,
          region_fix: 0,
          key: '7ESBZ-IFMRN-IQSFQ-SFVGS-5UA35-5IBDQ'
        },
        success: (res) => {
          console.log('建议API返回:', res.data)
          if (res.data && res.data.status === 0 && res.data.data) {
            console.log('原始建议数据:', res.data.data)
            this.suggestions = res.data.data.map(item => ({
              title: item.title || '',
              address: item.address || '',
              latitude: item.location ? item.location.lat : '',
              longitude: item.location ? item.location.lng : '',
              cityName: item.city || '',
              cityId: item.ad_info ? item.ad_info.adcode : '',
              id: item.id || ''
            }))
            console.log('处理后的建议数据:', this.suggestions)
            this.showSuggestions = true
          } else {
            console.log('建议API返回状态异常:', res.data)
            this.suggestions = []
          }
        },
        fail: () => {
          this.suggestions = []
        }
      })
    },
    handleSuggestionTap(index) {
      console.log('点击建议项, index:', index)
      const item = this.suggestions[index]
      console.log('获取到的item:', item)
      if (!item) {
        console.error('suggestions[' + index + '] 为空')
        return
      }
      this.selectSuggestion(item)
    },
    handleResultTap(index) {
      console.log('点击搜索结果, index:', index)
      const item = this.searchResults[index]
      console.log('获取到的item:', item)
      if (!item) {
        console.error('searchResults[' + index + '] 为空')
        return
      }
      this.selectLocation(item)
    },
    selectSuggestion(item) {
      // 选择建议后直接选择该地点
      if (!item || !item.title) {
        console.log('selectSuggestion: item无效', item)
        return
      }
      console.log('selectSuggestion: 选中的建议', item)
      
      // 如果建议项有经纬度，直接选择该地点
      if (item.latitude && item.longitude) {
        this.selectLocation(item)
      } else {
        // 如果没有经纬度，进行详细搜索
        this.searchKeyword = item.title
        this.showSuggestions = false
        this.handleSearch()
      }
    },
    handleSearch() {
      if (!this.searchKeyword.trim()) {
        return
      }
      
      this.searched = true
      this.showSuggestions = false // 确保关闭建议列表
      
      // 使用腾讯地图POI搜索API
      const keyword = this.searchKeyword.trim()
      console.log('开始搜索:', keyword)
      const location = this.currentLocation.latitude && this.currentLocation.longitude 
        ? `${this.currentLocation.latitude},${this.currentLocation.longitude}`
        : ''
      
      uni.request({
        url: 'https://apis.map.qq.com/ws/place/v1/search',
        data: {
          keyword: keyword,
          boundary: location ? `nearby(${location},5000)` : '',
          page_size: 20,
          page_index: 1,
          key: '7ESBZ-IFMRN-IQSFQ-SFVGS-5UA35-5IBDQ'
        },
        success: (res) => {
          console.log('搜索API返回:', res.data)
          if (res.data && res.data.status === 0 && res.data.data) {
            console.log('搜索结果数量:', res.data.data.length)
            this.searchResults = res.data.data.map(item => {
              // 计算距离（如果有当前位置）
              let distance = ''
              if (this.currentLocation.latitude && item.location) {
                const dist = this.calculateDistance(
                  this.currentLocation.latitude,
                  this.currentLocation.longitude,
                  item.location.lat,
                  item.location.lng
                )
                if (dist < 1000) {
                  distance = Math.round(dist) + 'm'
                } else {
                  distance = (dist / 1000).toFixed(1) + 'km'
                }
              }
              
              return {
                title: item.title,
                name: item.title,
                address: item.address,
                latitude: item.location ? item.location.lat : '',
                longitude: item.location ? item.location.lng : '',
                cityName: item.ad_info ? item.ad_info.city : '',
                cityId: item.ad_info ? item.ad_info.adcode : '',
                distance: distance,
                addressDetail: ''
              }
            })
            console.log('处理后的searchResults:', this.searchResults)
            console.log('showSuggestions:', this.showSuggestions)
            console.log('searched:', this.searched)
          } else {
            this.searchResults = []
            uni.showToast({
              title: '搜索失败，请重试',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          console.log('搜索API失败:', err)
          this.searchResults = []
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          })
        }
      })
    },
    calculateDistance(lat1, lng1, lat2, lng2) {
      // 计算两点之间的距离（单位：米）
      const R = 6371000 // 地球半径，单位米
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLng = (lng2 - lng1) * Math.PI / 180
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    },
    selectLocation(item) {
      console.log('selectLocation 被调用, item:', item)
      
      // 检查item是否有效
      if (!item) {
        console.error('selectLocation: item为空')
        uni.showToast({
          title: '选择地点失败',
          icon: 'none'
        })
        return
      }
      
      // 将选中的地点信息存储到本地
      const locationData = {
        name: item.title || item.name || '',
        address: item.address || '',
        cityId: item.cityId || '',
        cityName: item.cityName || '',
        longitude: String(item.longitude || ''),
        latitude: String(item.latitude || ''),
        addressDetail: item.title || item.name || ''
      }
      
      // 根据类型保存到不同的key
      const storageKey = this.type === 'destination' ? 'selectedDestination' : 'selectedOrigin'
      console.log(`保存的${this.type}Data:`, locationData)
      
      try {
        uni.setStorageSync(storageKey, locationData)
        console.log(`${this.type}数据保存成功`)
        
        // 返回上一页
        uni.navigateBack({
          delta: 1
        })
      } catch (e) {
        console.error('保存数据失败:', e)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },
    clearSearch() {
      this.searchKeyword = ''
      this.searchResults = []
      this.suggestions = []
      this.showSuggestions = false
      this.searched = false
    }
  },
  onUnload() {
    clearTimeout(this.searchTimer)
  }
}
</script>

<style lang="scss" scoped>
.origin-search {
  width: 100%;
  height: 100vh;
  background: #0D1034;
  display: flex;
  flex-direction: column;
  padding-top: calc(130rpx + var(--status-bar-height));
}

.search-box {
  padding: 20rpx 24rpx;
  background: #0D1034;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: #1E1F34;
  border-radius: 50rpx;
  padding: 20rpx 30rpx;
}

.search-icon {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #FFBA48;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  color: #fff;
  font-size: 28rpx;
}

.search-placeholder {
  color: #8a8a9e;
}

.clear-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a8a9e;
  font-size: 40rpx;
  margin-left: 10rpx;
}

.suggestion-list {
  flex: 1;
  padding: 10rpx 24rpx;
  background: #1E1F34;
  box-sizing: border-box;
  border-radius: 20rpx;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  background: #1E1F34;
  border-bottom: 1rpx solid #FFF;
}

.suggestion-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  opacity: 0.6;
}

.suggestion-icon image {
  width: 100%;
  height: 100%;
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-text {
  font-size: 30rpx;
  color: #fff;
  margin-bottom: 6rpx;
  font-weight: 500;
}

.suggestion-address {
  font-size: 24rpx;
  color: #B9BABE;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-list {
  flex: 1;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.result-item {
  display: flex;
  align-items: flex-start;
  padding: 28rpx 20rpx;
  background: #1E1F34;
  border-bottom: 1rpx solid #FFF;
}

.item-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.item-icon image {
  width: 100%;
  height: 100%;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 30rpx;
  color: #fff;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.item-address {
  font-size: 24rpx;
  color: #8a8a9e;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-distance {
  font-size: 24rpx;
  color: #8a8a9e;
  margin-left: 20rpx;
  flex-shrink: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #8a8a9e;
}

.default-tip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tip-text {
  font-size: 28rpx;
  color: #8a8a9e;
}
</style>

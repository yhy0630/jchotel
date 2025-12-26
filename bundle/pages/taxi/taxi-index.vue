<template>
  <view class="taxi-index">
    <custom-navbar title="打车"></custom-navbar>

    <!-- 分段控制器 -->
    <view class="segment-control">
      <view 
        class="segment-item" 
        :class="{ active: currentTab === 'rental' }"
        @click="switchTab('rental')"
      >
        租车
      </view>
      <view 
        class="segment-item" 
        :class="{ active: currentTab === 'taxi' }"
        @click="switchTab('taxi')"
      >
        打车
      </view>
    </view>

    <!-- 地图容器 -->
    <view class="map-wrapper">
      <!-- 地图 -->
    <view class="map-container">
      <map
        id="taxiMap"
        class="map"
        :latitude="mapCenter.latitude"
        :longitude="mapCenter.longitude"
        :scale="16"
        :markers="markers"
        :polyline="polylines"
        :show-location="true"
        :enable-3D="false"
        @regionchange="handleMapRegionChange"
      />

      <!-- 定位控件（拖图后可点击重新定位） -->
      <view class="map-control" @click="recenterMap" v-if="mapDragged">
        <image class="control-icon" src="/static/images/dingwei zong.png" mode="aspectFit"></image>
      </view>

      <!-- 地址输入区域 -->
      <view class="address-input-area">
        <!-- 起点输入 -->
        <view class="origin-input" @click="handleOriginClick">
          <view class="input-dot green"></view>
          <view class="input-content">
            <text v-if="departAddress.address" class="input-text">
              从 {{ departAddress.address }}{{ departAddress.addressDetail ? ' ' + departAddress.addressDetail : '' }} 上车
            </text>
            <text v-else class="input-placeholder">从 {{ currentLocationText }} 上车</text>
          </view>
        </view>

        <!-- 目的地输入 -->
        <view class="destination-input" @click="handleDestinationClick">
          <view class="input-dot orange"></view>
          <view class="input-content">
            <text v-if="arriveAddress.address" class="input-text">
              {{ arriveAddress.address }}{{ arriveAddress.addressDetail ? ' ' + arriveAddress.addressDetail : '' }}
            </text>
            <text v-else class="input-placeholder">您想去哪儿?</text>
          </view>
        </view>

        <!-- 安全中心 -->
        <view class="safety-center">
          <image class="safety-icon" src="/static/images/depend.png" mode="aspectFit"></image>
          <text class="safety-text">安全中心</text>
        </view>
      </view>
    </view>
    </view>

    <!-- 确认上车位置弹窗 -->
    <view class="pickup-modal" v-if="showPickupPanel" @click.stop="closePickupPanel">
      <view class="pickup-modal-mask" @click="closePickupPanel"></view>
      
      <!-- 搜索框 -->
      <view class="pickup-search-box" @click.stop>
        <view class="pickup-search-input-wrapper" @click.stop>
          <view class="pickup-search-icon"></view>
          <input 
            class="pickup-search-input" 
            v-model="pickupSearchKeyword"
            placeholder="请输入起点"
            placeholder-class="pickup-search-placeholder"
            @input="handlePickupSearch"
            @focus="handlePickupSearchFocus"
            @click.stop
          />
          <view class="pickup-search-clear" v-if="pickupSearchKeyword" @click.stop="clearPickupSearch">
            <text>×</text>
          </view>
        </view>
      </view>
      
      <view class="pickup-modal-content" @click.stop>
        <view class="pickup-modal-header">
          <text class="pickup-title">请确认上车位置</text>
          <text class="pickup-subtitle">点击列表选择上车点</text>
        </view>

        <!-- 搜索建议列表 -->
        <scroll-view 
          class="pickup-scroll-list" 
          scroll-y 
          v-if="!pickupLoading && showPickupSuggestions && pickupSuggestions.length > 0"
        >
          <view
            v-for="(item, index) in pickupSuggestions"
            :key="`sug-${index}`"
            class="pickup-item suggestion-item"
            @click="handlePickupSuggestionTap(index)"
          >
            <view class="pickup-dot"></view>
            <view class="pickup-item-content">
              <text class="pickup-name">{{ item.title }}</text>
              <text class="pickup-distance" v-if="item.address">{{ item.address }}</text>
            </view>
          </view>
        </scroll-view>

        <!-- 搜索结果列表 -->
        <scroll-view 
          class="pickup-scroll-list" 
          scroll-y 
          v-if="!pickupLoading && !showPickupSuggestions && pickupSearched && pickupSearchResults.length > 0"
        >
          <view
            v-for="(item, index) in pickupSearchResults"
            :key="`result-${index}`"
            class="pickup-item"
            :class="{ active: selectedPickupIndex === index }"
            @click="selectPickupSearchResult(item, index)"
          >
            <view class="pickup-dot"></view>
            <view class="pickup-item-content">
              <text class="pickup-name">{{ item.name }}</text>
              <text class="pickup-distance" v-if="item.distance">{{ item.distance }}</text>
            </view>
          </view>
        </scroll-view>

        <!-- 默认附近上车点列表 -->
        <scroll-view 
          class="pickup-scroll-list" 
          scroll-y 
          v-if="!pickupLoading && !showPickupSuggestions && !pickupSearched"
        >
          <view
            v-for="(item, index) in pickupLocations"
            :key="index"
            class="pickup-item"
            :class="{ active: selectedPickupIndex === index }"
            @click="selectPickupLocation(item, index)"
          >
            <view class="pickup-dot"></view>
            <view class="pickup-item-content">
              <text class="pickup-name">{{ item.name }}</text>
              <text class="pickup-distance" v-if="item.distance">{{ item.distance }}</text>
            </view>
          </view>

          <view class="pickup-empty" v-if="pickupLocations.length === 0">
            <text class="pickup-empty-text">附近暂无可选上车点</text>
          </view>
        </scroll-view>

        <!-- 搜索无结果 -->
        <view class="pickup-empty" v-if="!pickupLoading && !showPickupSuggestions && pickupSearched && pickupSearchResults.length === 0">
          <text class="pickup-empty-text">未找到相关上车点</text>
        </view>

        <view class="pickup-loading" v-else>
          <text class="pickup-loading-text">加载中...</text>
        </view>

        <button class="pickup-confirm-btn" @click="confirmPickup">确认上车点</button>
      </view>
    </view>

    <!-- 底部确认上车并预估 -->
    <!-- <view class="confirm-bar" v-if="!showPricePanel">
      <button class="confirm-btn" @click="handleConfirmEstimate" :loading="priceLoading">确认上车点并预估</button>
    </view> -->

    <!-- 预估价格弹窗 -->
    <view class="price-panel" v-if="showPricePanel && priceData.length > 0">
      <view class="price-panel-header">
        <view class="price-header-left">
          <text class="price-title">预估价格</text>
          <text v-if="priceRange.min !== null" class="price-range">¥{{ priceRange.min.toFixed(2) }} - ¥{{ priceRange.max.toFixed(2) }}</text>
        </view>
        <view class="price-header-right">
          <text class="price-close" @click="closePricePanel">×</text>
        </view>
      </view>
      <scroll-view scroll-y class="price-list" :style="{ height: scrollViewHeight + 'px' }">
        <view 
          v-for="(vehicle, index) in priceData" 
          :key="index"
          class="price-vehicle-item"
        >
          <view class="vehicle-header">
            <text class="vehicle-name">{{ vehicle.vehicleName }}</text>
            <text class="vehicle-info">约{{ Math.round(vehicle.estimateTime) }}分钟 · {{ (vehicle.estimateDistance / 1000).toFixed(1) }}km</text>
          </view>
          <view class="supplier-list" v-if="vehicle.priceList && vehicle.priceList.length > 0">
            <view 
              v-for="(price, priceIndex) in vehicle.priceList" 
              :key="priceIndex"
              class="supplier-item"
              @click="handleSelectPrice(vehicle, price)"
            >
              <view class="supplier-logo-wrapper">
                <image 
                  v-if="price.supplierLogo"
                  :src="price.supplierLogo" 
                  class="supplier-logo"
                  mode="aspectFill"
                  @error="handleImageError"
                />
                <view v-else class="supplier-logo-placeholder">
                  <text class="logo-text">{{ (price.supplierName || '供').charAt(0) }}</text>
                </view>
              </view>
              <view class="supplier-name">{{ price.supplierName || '供应商' }}</view>
              <view class="supplier-price">¥{{ Number(price.totalFee || 0).toFixed(2) }}</view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 乘客信息输入弹窗 -->
    <view class="passenger-modal" v-if="showPassengerModal" @click.stop="closePassengerModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">请输入乘客信息</text>
          <text class="modal-close" @click="closePassengerModal">×</text>
        </view>
        <view class="modal-body">
          <view class="input-group">
            <text class="input-label">乘客姓名</text>
            <input 
              class="input-field" 
              v-model="passengerForm.name"
              placeholder="请输入乘客姓名"
              maxlength="20"
            />
          </view>
          <view class="input-group">
            <text class="input-label">手机号码</text>
            <input 
              class="input-field" 
              v-model="passengerForm.phone"
              type="number"
              placeholder="请输入11位手机号码"
              maxlength="11"
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="closePassengerModal">取消</button>
          <button class="modal-btn confirm" @click="confirmPassengerInfo">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { queryEstimatePrice, createOrder } from '@/api/taxi'

export default {
  data() {
    return {
      currentTab: 'taxi', // rental 或 taxi
      originText: '',
      destinationText: '',
      departAddress: {
        cityId: '',
        cityName: '',
        longitude: '',
        latitude: '',
        name: '',
        address: '',
        addressDetail: ''
      },
      arriveAddress: {
        cityId: '',
        cityName: '',
        longitude: '',
        latitude: '',
        name: '',
        address: '',
        addressDetail: ''
      },
      mapCenter: {
        latitude: 39.908823,
        longitude: 116.39747
      },
      mapDragged: false,
      showPickupPanel: false,
      showPricePanel: false,
      polylines: [],
      userLocation: {
        latitude: '',
        longitude: ''
      },
      priceRange: { min: null, max: null },
      pickupLocations: [
        { name: '北京大兴国际机场', distance: '132m' },
        { name: '北京大兴国际机场', distance: '132m' }
      ],
      priceData: [],
      priceLoading: false,
      scrollViewHeight: 400,
      showPassengerModal: false,
      passengerForm: {
        name: '',
        phone: ''
      },
      currentVehicle: null,
      currentPrice: null,
      currentLocationText: '我的位置',
      markers: [],
      pickupLoading: false,
      selectedPickupIndex: -1,
      pickupSearchKeyword: '',
      originalPickupLocations: [],
      pickupSuggestions: [],
      showPickupSuggestions: false,
      pickupSearchResults: [],
      pickupSearched: false,
      pickupSearchTimer: null
    }
  },
  onShow() {
    // 页面显示时检查是否有从地址选择页面返回的数据
    this.checkAddressSelection()
  },
  onLoad() {
    this.mapCtx = uni.createMapContext('taxiMap', this)
    this.getCurrentLocation()
    this.calculateScrollViewHeight()
  },
  onReady() {
    this.calculateScrollViewHeight()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    switchTab(tab) {
      this.currentTab = tab
      // 这里可以添加切换标签的逻辑
    },
    handleOriginClick() {
      this.openPickupPanel()
    },
    handleDestinationClick() {
      uni.navigateTo({
        url: '/bundle/pages/taxi/origin-search?type=destination'
      })
    },
    checkAddressSelection() {
      console.log('checkAddressSelection 被调用')
      let changed = false
      // 检查是否有从地址选择页面返回的数据
      try {
        const selectedOrigin = uni.getStorageSync('selectedOrigin')
        console.log('读取到的selectedOrigin:', selectedOrigin)
        if (selectedOrigin) {
          // 处理起点选择
          this.departAddress = {
            cityId: selectedOrigin.cityId || '',
            cityName: selectedOrigin.cityName || '',
            longitude: selectedOrigin.longitude || '',
            latitude: selectedOrigin.latitude || '',
            name: selectedOrigin.name || '',
            address: selectedOrigin.address || selectedOrigin.name || '',
            addressDetail: selectedOrigin.addressDetail || ''
          }
          console.log('更新后的departAddress:', this.departAddress)
          
          // 更新地图中心到选中的起点位置
          if (selectedOrigin.latitude && selectedOrigin.longitude) {
            const lat = Number(selectedOrigin.latitude)
            const lng = Number(selectedOrigin.longitude)
            console.log('更新地图中心到:', lat, lng)
            
            this.mapCenter = {
              latitude: lat,
              longitude: lng
            }
            // 更新用户位置
            this.userLocation = {
              latitude: selectedOrigin.latitude,
              longitude: selectedOrigin.longitude
            }
            
            // 使用$nextTick确保数据更新后再移动地图
            this.$nextTick(() => {
              console.log('开始移动地图，mapCenter已更新为:', this.mapCenter)
              // 地图会自动响应mapCenter的变化
              // 如果需要强制刷新，可以调用updateRoute
              this.updateRoute()
            })
          }
          
          // 清除存储的数据
          uni.removeStorageSync('selectedOrigin')
          changed = true
          // 如果起点和目的地都已选择，查询预估价格
          this.checkAndQueryPrice()
        }
      } catch (e) {
        console.error('获取起点数据失败:', e)
      }
      
      try {
        const selectedDestination = uni.getStorageSync('selectedDestination')
        if (selectedDestination) {
          // 处理目的地选择
          this.arriveAddress = {
            cityId: selectedDestination.cityId || '',
            cityName: selectedDestination.cityName || '',
            longitude: selectedDestination.longitude || '',
            latitude: selectedDestination.latitude || '',
            name: selectedDestination.name || '',
            address: selectedDestination.address || selectedDestination.name || '',
            addressDetail: selectedDestination.addressDetail || ''
          }
          // 清除存储的数据
          uni.removeStorageSync('selectedDestination')
          changed = true
          // 如果起点和目的地都已选择，查询预估价格
          this.checkAndQueryPrice()
        }
      } catch (e) {
        console.error('获取目的地数据失败:', e)
      }
      if (changed) {
        this.updateRoute()
      }
    },
    checkAndQueryPrice() {
      // 检查起点和目的地是否都已选择
      if (this.departAddress.address && this.arriveAddress.address && 
          this.departAddress.longitude && this.departAddress.latitude &&
          this.arriveAddress.longitude && this.arriveAddress.latitude) {
        // 有完整经纬度时再去预估价格
        this.queryEstimatePrice()
      }
    },
    handleConfirmEstimate() {
      if (!this.departAddress.latitude || !this.departAddress.longitude) {
        uni.showToast({ title: '请先选择起点', icon: 'none' })
        return
      }
      if (!this.arriveAddress.latitude || !this.arriveAddress.longitude) {
        uni.showToast({ title: '请先选择目的地', icon: 'none' })
        return
      }
      this.queryEstimatePrice()
    },
    async queryEstimatePrice() {
      try {
        this.priceLoading = true
        const requestData = {
          bookType: 'REAL_TIME', // 实时用车
          appointmentTime: null,
          departAddress: {
            cityId: this.departAddress.cityId,
            cityName: this.departAddress.cityName,
            longitude: this.departAddress.longitude,
            latitude: this.departAddress.latitude,
            address: this.departAddress.address,
            addressDetail: this.departAddress.addressDetail
          },
          arriveAddress: {
            cityId: this.arriveAddress.cityId,
            cityName: this.arriveAddress.cityName,
            longitude: this.arriveAddress.longitude,
            latitude: this.arriveAddress.latitude,
            address: this.arriveAddress.address,
            addressDetail: this.arriveAddress.addressDetail
          }
        }
        const res = await queryEstimatePrice(requestData)
        console.log('预估价格接口返回:', res)
        // 只要 data 是数组就认为成功（兼容后端 code 为 0 或 1 等情况）
        if (Array.isArray(res.data)) {
          this.priceData = res.data
          this.priceRange = this.computePriceRange(res.data)
          this.showPricePanel = true
          // 延迟计算高度，确保 DOM 已渲染
          this.$nextTick(() => {
            this.calculateScrollViewHeight()
          })
        } else {
          uni.showToast({
            title: res.msg || '获取预估价格失败',
            icon: 'none'
          })
        }
      } catch (e) {
        console.error('查询预估价格失败:', e)
        uni.showToast({
          title: '获取预估价格失败',
          icon: 'none'
        })
      } finally {
        this.priceLoading = false
      }
    },
    closePricePanel() {
      this.showPricePanel = false
    },
    computePriceRange(list = []) {
      const prices = []
      list.forEach((vehicle) => {
        ;(vehicle.priceList || []).forEach((p) => {
          const v = Number(p.totalFee)
          if (!Number.isNaN(v)) prices.push(v)
        })
      })
      if (!prices.length) return { min: null, max: null }
      return { min: Math.min(...prices), max: Math.max(...prices) }
    },
    handleMapRegionChange(e) {
      if (e.type === 'end') {
        this.mapDragged = true
      }
    },
    recenterMap() {
      this.mapDragged = false
      this.getCurrentLocationAndSetOrigin()
    },
    closeMapTip() {
      this.mapDragged = false
    },
    updateRoute() {
      const markers = []
      // 起点
      if (this.departAddress.latitude && this.departAddress.longitude) {
        markers.push({
          id: 1001,
          latitude: Number(this.departAddress.latitude),
          longitude: Number(this.departAddress.longitude),
          callout: {
            content: this.departAddress.name || this.departAddress.address || '起点',
            color: '#000',
            bgColor: '#fff',
            padding: 8,
            display: 'ALWAYS',
            borderRadius: 6
          }
        })
      }
      // 终点
      if (this.arriveAddress.latitude && this.arriveAddress.longitude) {
        markers.push({
          id: 1002,
          latitude: Number(this.arriveAddress.latitude),
          longitude: Number(this.arriveAddress.longitude),
          callout: {
            content: this.arriveAddress.name || this.arriveAddress.address || '终点',
            color: '#000',
            bgColor: '#fff',
            padding: 8,
            display: 'ALWAYS',
            borderRadius: 6
          }
        })
      }
      // 我的位置
      if (this.userLocation.latitude && this.userLocation.longitude) {
        markers.push({
          id: 999,
          latitude: Number(this.userLocation.latitude),
          longitude: Number(this.userLocation.longitude)
        })
      }
      this.markers = markers

      if (
        this.departAddress.latitude &&
        this.departAddress.longitude &&
        this.arriveAddress.latitude &&
        this.arriveAddress.longitude
      ) {
        console.log('updateRoute: 起点和终点都存在，调用路线规划')
        // 调用驾车路线规划API获取实际路线
        this.getDirectionRoute()
      } else {
        console.log('updateRoute: 起点或终点不存在，清空路线')
        this.polylines = []
      }

      const points = markers.map((m) => ({
        latitude: m.latitude,
        longitude: m.longitude
      }))
      if (points.length && this.mapCtx) {
        this.mapCtx.includePoints({
          points,
          padding: [50, 50, 50, 50]
        })
      } else if (this.userLocation.latitude) {
        this.mapCenter = {
          latitude: Number(this.userLocation.latitude),
          longitude: Number(this.userLocation.longitude)
        }
      }
    },
    getDirectionRoute() {
      // 调用腾讯地图驾车路线规划API
      const from = `${this.departAddress.latitude},${this.departAddress.longitude}`
      const to = `${this.arriveAddress.latitude},${this.arriveAddress.longitude}`
      
      console.log('请求驾车路线:', from, '->', to)
      
      uni.request({
        url: 'https://apis.map.qq.com/ws/direction/v1/driving/',
        data: {
          from: from,
          to: to,
          key: '7ESBZ-IFMRN-IQSFQ-SFVGS-5UA35-5IBDQ'
        },
        success: (res) => {
          console.log('路线规划API返回:', res.data)
          if (res.data && res.data.status === 0 && res.data.result && res.data.result.routes && res.data.result.routes.length > 0) {
            const route = res.data.result.routes[0]
            console.log('路线数据:', route)
            
            // 解析路线坐标（按照腾讯地图官方示例）
            const points = []
            if (route.polyline) {
              console.log('polyline类型:', typeof route.polyline)
              console.log('polyline内容:', route.polyline)
              
              // 获取坐标数组
              let coors = []
              if (typeof route.polyline === 'string') {
                coors = route.polyline.split(';')
              } else if (Array.isArray(route.polyline)) {
                coors = route.polyline
              } else {
                console.error('未知的polyline格式')
              }
              
              console.log('原始坐标数组长度:', coors.length)
              console.log('前10个坐标:', coors.slice(0, 10))
              
              // 坐标解压（返回的点串坐标，通过前向差分进行压缩）
              const kr = 1000000
              for (let i = 2; i < coors.length; i++) {
                coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr
              }
              
              // 将解压后的坐标放入点串数组points中
              for (let i = 0; i < coors.length; i += 2) {
                points.push({ 
                  latitude: coors[i], 
                  longitude: coors[i + 1] 
                })
              }
              
              console.log('解压后的前3个点:', points.slice(0, 3))
            }
            
            console.log('解析后的路线点数:', points.length)
            console.log('前3个解析后的点:', points.slice(0, 3))
            console.log('最后3个解析后的点:', points.slice(-3))
            
            // 更新地图polyline
            // 1. 解压后的 points 已经拿到
            if (!points.length) return
            
            // 设置polyline属性，将路线显示出来
            this.polylines = [{
              points: points,
              color: '#02CF62',
              width: 8,
              borderColor: '#059E47',
              borderWidth: 2
            }]
            
            console.log('===== 路线绘制成功 =====')
            console.log('polylines数据:', this.polylines)
            console.log('路线点数:', points.length)
            console.log('第一个点:', points[0])
            console.log('最后一个点:', points[points.length - 1])
            
            // 使用$nextTick确保polylines更新后再调整地图视野
            this.$nextTick(() => {
              // 收集所有需要显示的点：起点、终点标记
              const allPoints = []
              if (this.departAddress.latitude && this.departAddress.longitude) {
                allPoints.push({
                  latitude: Number(this.departAddress.latitude),
                  longitude: Number(this.departAddress.longitude)
                })
              }
              if (this.arriveAddress.latitude && this.arriveAddress.longitude) {
                allPoints.push({
                  latitude: Number(this.arriveAddress.latitude),
                  longitude: Number(this.arriveAddress.longitude)
                })
              }
              
              // 让地图自动缩放到能看见起点和终点
              if (allPoints.length > 0 && this.mapCtx) {
                this.mapCtx.includePoints({
                  points: allPoints,
                  padding: [80, 80, 80, 80]
                })
              }
            })
            
            if (false) {
              console.error('路线点为空')
              // 如果解析失败，使用直线连接
              this.polylines = [
                {
                  points: [
                    {
                      latitude: Number(this.departAddress.latitude),
                      longitude: Number(this.departAddress.longitude)
                    },
                    {
                      latitude: Number(this.arriveAddress.latitude),
                      longitude: Number(this.arriveAddress.longitude)
                    }
                  ],
                  color: '#1aad19',
                  width: 6,
                  dottedLine: false
                }
              ]
            }
          } else {
            console.error('路线规划API返回异常:', res.data)
            // API调用失败，使用直线连接
            this.polylines = [
              {
                points: [
                  {
                    latitude: Number(this.departAddress.latitude),
                    longitude: Number(this.departAddress.longitude)
                  },
                  {
                    latitude: Number(this.arriveAddress.latitude),
                    longitude: Number(this.arriveAddress.longitude)
                  }
                ],
                color: '#1aad19',
                width: 6,
                dottedLine: false
              }
            ]
          }
        },
        fail: (err) => {
          console.error('路线规划API调用失败:', err)
          // API调用失败，使用直线连接
          this.polylines = [
            {
              points: [
                {
                  latitude: Number(this.departAddress.latitude),
                  longitude: Number(this.departAddress.longitude)
                },
                {
                  latitude: Number(this.arriveAddress.latitude),
                  longitude: Number(this.arriveAddress.longitude)
                }
              ],
              color: '#000',
              width: 6,
              dottedLine: false
            }
          ]
        }
      })
    },
    getCurrentLocation() {
      console.log('开始获取当前位置...')
      uni.getLocation({
        type: 'gcj02',
        altitude: true,
        geocode: true,
        success: (res) => {
          console.log('定位成功，返回坐标:', res)
          console.log('纬度:', res.latitude, '经度:', res.longitude)
          
          this.mapCenter = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          this.userLocation = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          
          // 获取地理位置名称
          this.getLocationName(res.latitude, res.longitude)
          this.updateRoute()
        },
        fail: (err) => {
          console.error('获取位置失败:', err)
          uni.showToast({
            title: '获取位置失败，请检查定位权限',
            icon: 'none',
            duration: 2000
          })
          this.currentLocationText = '我的位置'
        }
      })
    },
    getCurrentLocationAndSetOrigin() {
      console.log('开始获取当前位置并设置为起点...')
      uni.getLocation({
        type: 'gcj02',
        altitude: true,
        geocode: true,
        success: (res) => {
          console.log('定位成功，返回坐标:', res)
          console.log('纬度:', res.latitude, '经度:', res.longitude)
          
          this.mapCenter = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          this.userLocation = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          
          // 获取地理位置名称并设置为起点
          this.getLocationNameAndSetOrigin(res.latitude, res.longitude)
        },
        fail: (err) => {
          console.error('获取位置失败:', err)
          uni.showToast({
            title: '获取位置失败，请检查定位权限',
            icon: 'none',
            duration: 2000
          })
        }
      })
    },
    getLocationName(latitude, longitude) {
      // 使用逆地理编码获取位置名称
      uni.request({
        url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=7ESBZ-IFMRN-IQSFQ-SFVGS-5UA35-5IBDQ&get_poi=1`,
        success: (res) => {
          if (res.data && res.data.result) {
            const result = res.data.result
            // 优先使用POI名称，其次使用地址
            if (result.pois && result.pois.length > 0) {
              this.currentLocationText = result.pois[0].title || '我的位置'
            } else if (result.formatted_addresses && result.formatted_addresses.recommend) {
              this.currentLocationText = result.formatted_addresses.recommend
            } else if (result.address) {
              this.currentLocationText = result.address
            } else {
              this.currentLocationText = '我的位置'
            }
          }
        },
        fail: () => {
          this.currentLocationText = '我的位置'
        }
      })
    },
    getLocationNameAndSetOrigin(latitude, longitude) {
      // 使用逆地理编码获取位置名称并设置为起点
      uni.request({
        url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=7ESBZ-IFMRN-IQSFQ-SFVGS-5UA35-5IBDQ&get_poi=1`,
        success: (res) => {
          if (res.data && res.data.result) {
            const result = res.data.result
            let locationName = '我的位置'
            let locationAddress = ''
            let cityId = ''
            let cityName = ''
            
            // 从ad_info中获取城市信息
            if (result.ad_info) {
              cityId = result.ad_info.adcode || ''
              cityName = result.ad_info.city || ''
            }
            
            // 优先使用POI名称，其次使用地址
            if (result.pois && result.pois.length > 0) {
              locationName = result.pois[0].title || '我的位置'
              locationAddress = result.pois[0].address || ''
            } else if (result.formatted_addresses && result.formatted_addresses.recommend) {
              locationName = result.formatted_addresses.recommend
              locationAddress = result.address || ''
            } else if (result.address) {
              locationName = result.address
              locationAddress = result.address || ''
            }
            
            // 更新当前位置文本
            this.currentLocationText = locationName
            
            // 设置为起点
            this.departAddress = {
              cityId: cityId,
              cityName: cityName,
              longitude: String(longitude),
              latitude: String(latitude),
              name: locationName,
              address: locationName,
              addressDetail: locationAddress
            }
            
            // 更新路线和地图
            this.updateRoute()
            this.checkAndQueryPrice()
            
            uni.showToast({
              title: '已设置为起点',
              icon: 'success',
              duration: 1500
            })
          }
        },
        fail: () => {
          this.currentLocationText = '我的位置'
          uni.showToast({
            title: '获取位置信息失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
    },
    openPickupPanel() {
      this.showPickupPanel = true
      this.selectedPickupIndex = -1
      this.fetchNearbyPickupPoints()
    },
    closePickupPanel() {
      this.showPickupPanel = false
    },
    getCurrentMapCenter() {
      return new Promise((resolve) => {
        if (!this.mapCtx || !this.mapCtx.getCenterLocation) {
          resolve({
            latitude: Number(this.mapCenter.latitude),
            longitude: Number(this.mapCenter.longitude)
          })
          return
        }
        this.mapCtx.getCenterLocation({
          success: (res) => {
            resolve({
              latitude: Number(res.latitude),
              longitude: Number(res.longitude)
            })
          },
          fail: () => {
            resolve({
              latitude: Number(this.mapCenter.latitude),
              longitude: Number(this.mapCenter.longitude)
            })
          }
        })
      })
    },
    calcDistanceMeters(lat1, lng1, lat2, lng2) {
      const toRad = (v) => (v * Math.PI) / 180
      const R = 6371000
      const dLat = toRad(lat2 - lat1)
      const dLng = toRad(lng2 - lng1)
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    },
    async fetchNearbyPickupPoints() {
      try {
        this.pickupLoading = true
        const center = await this.getCurrentMapCenter()

        uni.request({
          url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${center.latitude},${center.longitude}&key=7ESBZ-IFMRN-IQSFQ-SFVGS-5UA35-5IBDQ&get_poi=1`,
          success: (res) => {
            const result = res.data && res.data.result
            const pois = (result && result.pois) || []
            
            // 从逆地理编码结果中获取城市信息
            let cityName = ''
            let cityId = ''
            if (result && result.address_component) {
              cityName = result.address_component.city || ''
            }
            if (result && result.ad_info) {
              cityId = result.ad_info.adcode || ''
            }
            
            const list = pois
              .filter((p) => p && (p.title || p.address) && p.location)
              .slice(0, 10)
              .map((p) => {
                const dist = this.calcDistanceMeters(
                  center.latitude,
                  center.longitude,
                  Number(p.location.lat),
                  Number(p.location.lng)
                )
                return {
                  name: p.title || p.address || '',
                  address: p.address || '',
                  latitude: String(p.location.lat),
                  longitude: String(p.location.lng),
                  distance: `${Math.round(dist)}m`,
                  cityName: cityName,
                  cityId: cityId
                }
              })

            this.pickupLocations = list
            this.originalPickupLocations = [...list]
            if (list.length > 0) {
              this.selectedPickupIndex = 0
            }
          },
          fail: () => {
            this.pickupLocations = []
          },
          complete: () => {
            this.pickupLoading = false
          }
        })
      } catch (e) {
        this.pickupLocations = []
        this.pickupLoading = false
      }
    },
    selectPickupLocation(item, index) {
      this.selectedPickupIndex = index
    },
    confirmPickup() {
      let selected = null
      
      // 根据当前显示状态获取选中的项目
      if (this.showPickupSuggestions && this.pickupSuggestions.length > 0) {
        // 如果显示建议列表，但没有选中项，选择第一个建议
        selected = this.pickupSuggestions[0]
        this.selectPickupSearchLocation(selected)
        return
      } else if (this.pickupSearched && this.pickupSearchResults.length > 0) {
        // 如果显示搜索结果列表
        if (this.selectedPickupIndex < 0 || !this.pickupSearchResults[this.selectedPickupIndex]) {
          uni.showToast({ title: '请选择上车点', icon: 'none' })
          return
        }
        selected = this.pickupSearchResults[this.selectedPickupIndex]
        this.selectPickupSearchLocation(selected)
        return
      } else {
        // 默认附近上车点列表
        if (this.selectedPickupIndex < 0 || !this.pickupLocations[this.selectedPickupIndex]) {
          uni.showToast({ title: '请选择上车点', icon: 'none' })
          return
        }
        selected = this.pickupLocations[this.selectedPickupIndex]
        this.departAddress = {
          ...this.departAddress,
          longitude: selected.longitude,
          latitude: selected.latitude,
          name: selected.name,
          address: selected.name,
          addressDetail: selected.address || '',
          cityName: selected.cityName || '',
          cityId: selected.cityId || ''
        }
        this.showPickupPanel = false
        this.mapCenter = {
          latitude: Number(selected.latitude),
          longitude: Number(selected.longitude)
        }
        this.updateRoute()
        this.checkAndQueryPrice()
        
        // 清空搜索状态
        this.pickupSearchKeyword = ''
        this.pickupSuggestions = []
        this.showPickupSuggestions = false
        this.pickupSearchResults = []
        this.pickupSearched = false
      }
    },
    handlePickupSearch() {
      clearTimeout(this.pickupSearchTimer)
      
      if (!this.pickupSearchKeyword.trim()) {
        this.pickupSuggestions = []
        this.showPickupSuggestions = false
        this.pickupSearchResults = []
        this.pickupSearched = false
        this.selectedPickupIndex = this.pickupLocations.length > 0 ? 0 : -1
        return
      }
      
      this.pickupSearchTimer = setTimeout(() => {
        if (this.pickupSearchKeyword.trim()) {
          this.getPickupSuggestions()
        }
      }, 300)
    },
    getPickupSuggestions() {
      const keyword = this.pickupSearchKeyword.trim()
      if (!keyword) {
        return
      }
      
      const location = this.userLocation.latitude && this.userLocation.longitude 
        ? `${this.userLocation.latitude},${this.userLocation.longitude}`
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
          if (res.data && res.data.status === 0 && res.data.data) {
            this.pickupSuggestions = res.data.data.map(item => ({
              title: item.title || '',
              address: item.address || '',
              latitude: item.location ? item.location.lat : '',
              longitude: item.location ? item.location.lng : '',
              cityName: item.city || '',
              cityId: item.ad_info ? item.ad_info.adcode : '',
              id: item.id || ''
            }))
            this.showPickupSuggestions = true
            this.pickupSearched = false
          } else {
            this.pickupSuggestions = []
          }
        },
        fail: () => {
          this.pickupSuggestions = []
        }
      })
    },
    handlePickupSuggestionTap(index) {
      const item = this.pickupSuggestions[index]
      if (!item) {
        return
      }
      this.selectPickupSuggestion(item)
    },
    selectPickupSuggestion(item) {
      if (!item || !item.title) {
        return
      }
      
      // 如果建议项有经纬度，直接选择该地点
      if (item.latitude && item.longitude) {
        this.selectPickupSearchLocation(item)
      } else {
        // 如果没有经纬度，进行详细搜索
        this.pickupSearchKeyword = item.title
        this.showPickupSuggestions = false
        this.handlePickupDetailSearch()
      }
    },
    handlePickupDetailSearch() {
      if (!this.pickupSearchKeyword.trim()) {
        return
      }
      
      this.pickupSearched = true
      this.showPickupSuggestions = false
      
      const keyword = this.pickupSearchKeyword.trim()
      const location = this.userLocation.latitude && this.userLocation.longitude 
        ? `${this.userLocation.latitude},${this.userLocation.longitude}`
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
          if (res.data && res.data.status === 0 && res.data.data) {
            this.pickupSearchResults = res.data.data.map(item => {
              // 计算距离（如果有当前位置）
              let distance = ''
              if (this.userLocation.latitude && item.location) {
                const dist = this.calcDistanceMeters(
                  this.userLocation.latitude,
                  this.userLocation.longitude,
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
            this.selectedPickupIndex = this.pickupSearchResults.length > 0 ? 0 : -1
          } else {
            this.pickupSearchResults = []
          }
        },
        fail: () => {
          this.pickupSearchResults = []
        }
      })
    },
    selectPickupSearchResult(item, index) {
      this.selectedPickupIndex = index
    },
    selectPickupSearchLocation(item) {
      // 选择搜索到的地点作为起点
      this.departAddress = {
        cityId: item.cityId || '',
        cityName: item.cityName || '',
        longitude: String(item.longitude),
        latitude: String(item.latitude),
        name: item.title || item.name,
        address: item.title || item.name,
        addressDetail: item.address || ''
      }
      this.showPickupPanel = false
      this.mapCenter = {
        latitude: Number(item.latitude),
        longitude: Number(item.longitude)
      }
      this.updateRoute()
      this.checkAndQueryPrice()
      
      // 清空搜索状态
      this.pickupSearchKeyword = ''
      this.pickupSuggestions = []
      this.showPickupSuggestions = false
      this.pickupSearchResults = []
      this.pickupSearched = false
    },
    handlePickupSearchFocus() {
      // 搜索框获得焦点时的处理
    },
    clearPickupSearch() {
      this.pickupSearchKeyword = ''
      this.pickupSuggestions = []
      this.showPickupSuggestions = false
      this.pickupSearchResults = []
      this.pickupSearched = false
      this.selectedPickupIndex = this.pickupLocations.length > 0 ? 0 : -1
    },
    calculateScrollViewHeight() {
      // 计算滚动区域高度：屏幕高度 - 弹窗头部 - 底部安全区域
      const systemInfo = uni.getSystemInfoSync()
      const windowHeight = systemInfo.windowHeight
      // 弹窗头部约 120rpx，底部安全区域约 40rpx，转换为 px
      const headerHeight = 120 / 750 * systemInfo.windowWidth
      const safeAreaBottom = 40 / 750 * systemInfo.windowWidth
      this.scrollViewHeight = windowHeight * 0.7 - headerHeight - safeAreaBottom
    },
    handleImageError(e) {
      // 图片加载失败时使用默认占位图或隐藏
      console.log('图片加载失败:', e)
      // 如果图片加载失败，可以设置一个默认占位图
      if (e.target && e.target.src) {
        // 避免循环错误
        if (!e.target.src.includes('default-supplier')) {
          e.target.src = '/static/images/default-supplier.png'
        }
      }
    },
    async handleSelectPrice(vehicle, price) {
      // 检查必要参数
      if (!this.departAddress.address || !this.arriveAddress.address) {
        uni.showToast({
          title: '请先选择起点和目的地',
          icon: 'none'
        })
        return
      }

      if (!price.priceId) {
        uni.showToast({
          title: '价格信息不完整',
          icon: 'none'
        })
        return
      }

      // 获取用户信息（从本地存储或全局状态）
      let userInfo = {}
      try {
        userInfo = uni.getStorageSync('userInfo') || {}
      } catch (e) {
        console.error('获取用户信息失败:', e)
      }

      // 检查是否有乘客信息，如果没有则弹出输入框
      let passengerName = userInfo.nickname || userInfo.name || ''
      let passengerPhone = userInfo.mobile || userInfo.phone || ''
      let contactName = passengerName
      let contactPhone = passengerPhone

      // 如果缺少必填信息，弹出输入弹窗
      if (!passengerName || !passengerPhone) {
        this.currentVehicle = vehicle
        this.currentPrice = price
        this.passengerForm.name = passengerName || ''
        this.passengerForm.phone = passengerPhone || ''
        this.showPassengerModal = true
        return
      }

      // 询问是否创建订单
      const confirmRes = await new Promise(resolve => {
        uni.showModal({
          title: '确认下单',
          content: '确定使用当前信息创建订单并去支付？',
          success: (res) => resolve(res)
        })
      })
      if (confirmRes && confirmRes.confirm) {
        await this.submitOrder(vehicle, price, {
          passengerName,
          passengerPhone,
          contactName,
          contactPhone
        })
      }
    },
    closePassengerModal() {
      this.showPassengerModal = false
      this.passengerForm.name = ''
      this.passengerForm.phone = ''
      this.currentVehicle = null
      this.currentPrice = null
    },
    confirmPassengerInfo() {
      // 验证输入
      if (!this.passengerForm.name || !this.passengerForm.name.trim()) {
        uni.showToast({
          title: '请输入乘客姓名',
          icon: 'none'
        })
        return
      }

      if (!this.passengerForm.phone || !this.passengerForm.phone.trim()) {
        uni.showToast({
          title: '请输入手机号码',
          icon: 'none'
        })
        return
      }

      // 验证手机号格式
      const phoneReg = /^1[3-9]\d{9}$/
      if (!phoneReg.test(this.passengerForm.phone.trim())) {
        uni.showToast({
          title: '手机号格式不正确，请输入11位有效手机号',
          icon: 'none',
          duration: 2000
        })
        return
      }

      // 保存当前选择的车辆和价格信息，避免在异步操作中被清空
      const selectedVehicle = this.currentVehicle
      const selectedPrice = this.currentPrice

      // 关闭弹窗
      this.showPassengerModal = false

      // 调用创建订单前二次确认
      const passengerName = this.passengerForm.name.trim()
      const passengerPhone = this.passengerForm.phone.trim()

      uni.showModal({
        title: '确认下单',
        content: '确定使用当前信息创建订单并去支付？',
        success: async (res) => {
          if (res.confirm) {
            await this.submitOrder(selectedVehicle, selectedPrice, {
              passengerName: passengerName,
              passengerPhone: passengerPhone,
              contactName: passengerName,
              contactPhone: passengerPhone
            })
          }
          // 无论确认还是取消，都清空表单和当前选择
          this.passengerForm.name = ''
          this.passengerForm.phone = ''
          this.currentVehicle = null
          this.currentPrice = null
        }
      })
    },
    async submitOrder(vehicle, price, userInfo = {}) {
      try {
        uni.showLoading({
          title: '创建订单中...',
          mask: true
        })

        // 生成合作方订单号
        const partnerOrderNo = 'TAXI_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase()

        // 构建订单数据
        const orderData = {
          partnerOrderNo: partnerOrderNo,
          bookType: 'REAL_TIME', // 实时用车
          appointmentTime: null,
          contactName: userInfo.contactName || userInfo.passengerName || '',
          contactPhone: userInfo.contactPhone || userInfo.passengerPhone || '',
          estimateTotalFee: Number(price.totalFee || 0),
          passengerName: userInfo.passengerName || '',
          passengerPhone: userInfo.passengerPhone || '',
          priceIds: [price.priceId], // 价格ID数组
          vehicleName: vehicle.vehicleName || '快车',
          supplierName: price.supplierName || '供应商',
          estimateTime: vehicle.estimateTime || 0,
          estimateDistance: vehicle.estimateDistance || 0,
          departAddress: {
            address: this.departAddress.address,
            addressDetail: this.departAddress.addressDetail || '',
            cityId: this.departAddress.cityId,
            cityName: this.departAddress.cityName,
            latitude: String(this.departAddress.latitude),
            longitude: String(this.departAddress.longitude)
          },
          arriveAddress: {
            address: this.arriveAddress.address,
            addressDetail: this.arriveAddress.addressDetail || '',
            cityId: this.arriveAddress.cityId,
            cityName: this.arriveAddress.cityName,
            latitude: String(this.arriveAddress.latitude),
            longitude: String(this.arriveAddress.longitude)
          }
        }

        console.log('创建订单参数:', orderData)

        // 调用创建订单接口
        const res = await createOrder(orderData)

        uni.hideLoading()

        console.log('创建订单响应:', res)

        if (res.code === 1 && res.data && (res.data.order_id || res.data.orderId)) {
          uni.showToast({
            title: '订单创建成功',
            icon: 'success',
            duration: 1500
          })
          
          // 跳转到支付页面
          setTimeout(() => {
            uni.redirectTo({
              url: `/pages/payment/payment?from=taxi&order_id=${res.data.order_id || res.data.orderId}`
            })
          }, 1500)
        } else {
          uni.showToast({
            title: res.msg || '创建订单失败',
            icon: 'none',
            duration: 2000
          })
        }
      } catch (e) {
        uni.hideLoading()
        console.error('创建订单失败:', e)
        uni.showToast({
          title: e.msg || e.message || '创建订单失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.taxi-index {
  width: 100%;
  height: 100vh;
  background: #0d1034;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: calc(130rpx + var(--status-bar-height));
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: #1a1b3d;
  color: #fff;
  position: relative;
  z-index: 10;
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 500;
}

.nav-icon {
  font-size: 48rpx;
  color: #fff;
}

.nav-title {
  color: #ffb84d;
}

/* 分段控制器 */
.segment-control {
  display: flex;
  margin: 20rpx 20rpx 20rpx;
  background: #353548;
  border-radius: 50rpx;
  position: relative;
  z-index: 10;

}

.segment-item {
  flex: 1;
  text-align: center;
  padding: 25rpx 0;
  border-radius: 50rpx;
  font-size: 28rpx;
  color: #fff;
  transition: all 0.3s;
  font-weight: 500;
}

.segment-item.active {
  background: linear-gradient(90deg, #F4BD63 0%, #FDE4B4 49.71%, #F3BE66 100%);
  color: #1a1b3d;
  font-weight: 600;
  color:#380C00
}

/* 地图容器 */
.map-wrapper {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

/* 地址输入区域 - 覆盖在地图底部 */
.address-input-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1E1F34;
  border-radius: 30rpx 30rpx 0 0;
  padding: 40rpx 30rpx 30rpx;
  z-index: 5;
  height: 700rpx;
}

.origin-input,
.destination-input {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 8rpx 0;
}
.destination-input{
  background-color: #353548;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-left: 10rpx;
}
.origin-input{
  margin-left: 30rpx;
}

.input-dot {
  width: 15rpx;
  height: 15rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.input-dot.green {
  background: #04FF00;
}

.input-dot.orange {
  background: #FFBA48;
}

.input-content {
  flex: 1;
}

.input-text {
  color: #fff;
  font-size: 30rpx;
  line-height: 1.5;
}

.input-placeholder {
  color: #fff;
  font-size: 30rpx;
}

/* 安全中心 */
.safety-center {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #2a2b4d;
}

.safety-icon {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: transparent;
  color: #8a8a9e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin-right: 12rpx;
}

.safety-text {
  color: #8a8a9e;
  font-size: 28rpx;
}

.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.map {
  width: 100%;
  height: 100%;
}

.confirm-bar {
  padding: 20rpx;
}

.map-tip {
  position: absolute;
  bottom: 30rpx;
  right: 20rpx;
  background: rgba(0, 0, 0, 0.7);
  padding: 15rpx 20rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  gap: 15rpx;
  color: #fff;
  font-size: 24rpx;
}

.tip-text {
  flex: 1;
}

.tip-close,
.tip-icon {
  font-size: 32rpx;
}

.map-control {
  position: absolute;
  bottom: 720rpx;
  left:680rpx;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-icon {
  font-size: 20rpx;
}

.city-panel {
  margin: 20rpx;
  background: #1a1b3d;
  border-radius: 16rpx;
  padding: 20rpx;
  max-height: 320rpx;
}

.city-panel-title {
  font-size: 28rpx;
  color: #fff;
  margin-bottom: 10rpx;
}

.city-list {
  max-height: 260rpx;
}

.city-group {
  margin-bottom: 10rpx;
}

.city-letter {
  font-size: 26rpx;
  color: #ffb84d;
  margin-bottom: 6rpx;
}

.city-names {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx 16rpx;
}

.city-item {
  padding: 8rpx 14rpx;
  background: #2a2b4d;
  color: #fff;
  border-radius: 10rpx;
  font-size: 24rpx;
}

.pickup-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.pickup-modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.pickup-modal-content {
  width: 100%;
  background: #1E1F34;
  border-radius: 24rpx 24rpx 0 0;
  padding: 100rpx 30rpx 26rpx;
  max-height: 50vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1000;
  transform: translateY(0);
  transition: transform 0.3s ease-out;
  margin-top: 80rpx;
}

.pickup-modal-header {
  margin-bottom: 20rpx;
}

.pickup-title {
  color: #fff;
  font-size: 34rpx;
  font-weight: 600;
  display: block;
}

.pickup-subtitle {
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
  display: block;
}

.pickup-scroll-list {
  margin-top: 18rpx;
  height: 180rpx;
  flex: 1;
  overflow: hidden;
}

.pickup-item {
  background: #353548;
  border: 2rpx solid #B9BABE;
  border-radius: 16rpx;
  padding: 22rpx 20rpx;
  display: flex;
  align-items: center;
  margin-bottom: 18rpx;
}

.pickup-item.active {
  border-color: rgba(244, 189, 99, 0.9);
}

.pickup-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #04FF00;
  margin-right: 18rpx;
  flex-shrink: 0;
}

.pickup-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6rpx;
}

.pickup-name {
  color: #fff;
  font-size: 28rpx;
  line-height: 1.2;
}

.pickup-distance {
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
  line-height: 1.2;
}

.pickup-empty {
  padding: 30rpx 0;
  text-align: center;
}

.pickup-empty-text {
  color: rgba(255, 255, 255, 0.65);
  font-size: 26rpx;
}

.pickup-loading {
  padding: 30rpx 0;
  text-align: center;
}

.pickup-loading-text {
  color: rgba(255, 255, 255, 0.75);
  font-size: 26rpx;
}

.pickup-search-box {
  position: absolute;
  top: 320rpx;
  left: 20rpx;
  right: 20rpx;
  z-index: 1000;
  padding: 0 4rpx;
}

.pickup-search-input-wrapper {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 25rpx;
  padding: 40rpx 20rpx;
  height: 50rpx;
}

.pickup-search-icon {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #04FF00;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.pickup-search-input {
  flex: 1;
  color: #333;
  font-size: 26rpx;
  background: transparent;
  border: none;
  outline: none;
}

.pickup-search-placeholder {
  color: #666;
}

.pickup-search-clear {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 28rpx;
  margin-left: 10rpx;
  flex-shrink: 0;
}

.pickup-confirm-btn {
  margin-top: 22rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(90deg, #F4BD67 0%, #FEE2AE 49.04%, #F4BE6A 99.89%);
  color: #380C00;
  font-size: 30rpx;
  font-weight: 600;
}

.city-loading {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  margin-top: 10rpx;
}

.pickup-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1b3d;
  border-radius: 30rpx 30rpx 0 0;
  padding: 40rpx 30rpx;
  z-index: 100;
}

.panel-title {
  font-size: 36rpx;
  font-weight: 500;
  color: #fff;
  margin-bottom: 15rpx;
}

.panel-tip {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.location-list {
  margin-bottom: 30rpx;
}

.location-item {
  display: flex;
  align-items: center;
  padding: 25rpx;
  background: #2a2b4d;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.location-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.location-dot.green {
  background: #4caf50;
}

.location-name {
  flex: 1;
  color: #fff;
  font-size: 28rpx;
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  background: #ff6b35;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 预估价格弹窗 */
.price-panel {
  position: fixed;
  bottom: 0;
  left: 20rpx;
  right: 20rpx;
  background: #1E1F34;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 65vh;
  z-index: 200;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.3);
}

.price-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 30rpx 20rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.price-header-left {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.price-title {
  font-size: 36rpx;
  font-weight: 500;
  color: #fff;
}

.price-range {
  font-size: 26rpx;
  color: #ffb84d;
}

.price-header-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.price-close {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.price-list {
  flex: 1;
  padding: 20rpx 30rpx 36rpx;
  overflow-y: auto;
  min-height: 0;
  box-sizing: border-box;
}

.price-vehicle-item {
  margin-bottom: 24rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
}

.price-vehicle-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.vehicle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
  padding: 0 4rpx;
}

.vehicle-name {
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
}

.vehicle-info {
  font-size: 24rpx;
  color: #999;
}

.supplier-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.supplier-item {
  display: flex;
  align-items: center;
  padding: 18rpx 20rpx;
  background: #353548;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  overflow: hidden;
  min-width: 0;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.supplier-item:active {
  background: #404155;
  transform: scale(0.98);
}

.supplier-logo-wrapper {
  width: 44rpx;
  height: 44rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.supplier-logo {
  width: 44rpx;
  height: 44rpx;
  border-radius: 8rpx;
  background: #2a2b4d;
}

.supplier-logo-placeholder {
  width: 44rpx;
  height: 44rpx;
  border-radius: 8rpx;
  background: #F4BD63;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 18rpx;
  color: #380C00;
  font-weight: 600;
}

.supplier-name {
  flex: 1;
  font-size: 26rpx;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 16rpx;
  min-width: 0;
  font-weight: 400;
}

.supplier-price {
  font-size: 28rpx;
  color: #F4BD63;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 100rpx;
  text-align: right;
}

/* 乘客信息输入弹窗 */
.passenger-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 600rpx;
  background: #0d1034;
  border-radius: 20rpx;
  overflow: hidden;
  border: 1rpx solid #FCDDA6;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #2a2b4d;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #F4C06E;
}

.modal-close {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 30rpx;
}

.input-group {
  margin-bottom: 30rpx;
}

.input-group:last-child {
  margin-bottom: 0;
}

.input-label {
  display: block;
  font-size: 28rpx;
  color: #fff;
  margin-bottom: 16rpx;
}

.input-field {
  width: 100%;
  height: 80rpx;
  background: #353548;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #fff;
  box-sizing: border-box;
  border: 1rpx solid #B9BABE;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #2a2b4d;
}

.modal-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 32rpx;
  border: none;
  background: transparent;
}

.modal-btn.cancel {
  color: #999;
  border-right: 1rpx solid #2a2b4d;
}

.modal-btn.confirm {
  color: #f4C06E;
  font-weight: 500;
}
</style>


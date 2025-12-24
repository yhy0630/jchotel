<template>
  <view class="taxi-index">
    <!-- 顶部导航 -->
  <!--  <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="nav-icon">‹</text>
      </view>
      <view class="nav-title">打车</view>
      <view class="nav-right">
        <text class="nav-icon">⋯</text>
        <text class="nav-icon">◎</text>
      </view>
    </view> -->

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

    <!-- 地址输入区域 -->
    <view class="address-input-area">
      <!-- 起点输入 -->
      <view class="origin-input" @click="handleOriginClick">
        <view class="input-dot green"></view>
        <view class="input-content">
          <text v-if="departAddress.address" class="input-text">
            从 {{ departAddress.address }}{{ departAddress.addressDetail ? ' ' + departAddress.addressDetail : '' }} 上车
          </text>
          <text v-else class="input-placeholder">请输入起点</text>
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
        <view class="safety-icon">✓</view>
        <text class="safety-text">安全中心</text>
      </view>
    </view>

    <!-- 地图 -->
    <view class="map-container">
      <map
        id="taxiMap"
        class="map"
        :latitude="mapCenter.latitude"
        :longitude="mapCenter.longitude"
        :scale="16"
        :markers="markers"
        :polylines="polylines"
        :show-location="true"
        @regionchange="handleMapRegionChange"
      />

      <!-- 拖图提示 -->
      <view v-if="mapDragged" class="map-tip" @click="recenterMap">
        <text class="tip-text">您已拖图,点击可重新定位</text>
        <text class="tip-close" @click.stop="closeMapTip">×</text>
        <text class="tip-icon">◎</text>
      </view>

      <!-- 左下角控件 -->
      <view class="map-control">
        <view class="control-icon">🛡+</view>
      </view>
    </view>

    <!-- 底部确认上车并预估 -->
    <view class="confirm-bar" v-if="!showPricePanel">
      <button class="confirm-btn" @click="handleConfirmEstimate" :loading="priceLoading">确认上车点并预估</button>
    </view>

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
        address: '',
        addressDetail: ''
      },
      arriveAddress: {
        cityId: '',
        cityName: '',
        longitude: '',
        latitude: '',
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
      markers: [
        {
          id: 1,
          latitude: 39.908823,
          longitude: 116.39747,
          // 使用已有的定位图标，避免找不到 marker.png 报错
          iconPath: '/static/images/dingwei 1.png',
          width: 30,
          height: 40
        }
      ]
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
      uni.navigateTo({
        url: '/pages/taxi/origin-select'
      })
    },
    handleDestinationClick() {
      uni.navigateTo({
        url: '/pages/taxi/destination-select'
      })
    },
    checkAddressSelection() {
      let changed = false
      // 检查是否有从地址选择页面返回的数据
      try {
        const selectedOrigin = uni.getStorageSync('selectedOrigin')
        if (selectedOrigin) {
          // 处理起点选择
          this.departAddress = {
            cityId: selectedOrigin.cityId || '',
            cityName: selectedOrigin.cityName || '',
            longitude: selectedOrigin.longitude || '',
            latitude: selectedOrigin.latitude || '',
            address: selectedOrigin.address || selectedOrigin.name || '',
            addressDetail: selectedOrigin.addressDetail || ''
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
      this.getCurrentLocation()
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
          iconPath: '/static/images/dingwei 1.png',
          width: 30,
          height: 40,
          callout: {
            content: '起点',
            color: '#fff',
            bgColor: '#1a1b3d',
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
          iconPath: '/static/images/dingwei 1.png',
          width: 30,
          height: 40,
          callout: {
            content: '终点',
            color: '#fff',
            bgColor: '#ff6b35',
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
          longitude: Number(this.userLocation.longitude),
          iconPath: '/static/images/dingwei 1.png',
          width: 26,
          height: 34,
          callout: {
            content: '我',
            color: '#fff',
            bgColor: '#2a2b4d',
            padding: 6,
            display: 'ALWAYS',
            borderRadius: 6
          }
        })
      }
      this.markers = markers

      if (
        this.departAddress.latitude &&
        this.departAddress.longitude &&
        this.arriveAddress.latitude &&
        this.arriveAddress.longitude
      ) {
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
            color: '#ffb84d',
            width: 6,
            dottedLine: false
          }
        ]
      } else {
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
    getCurrentLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.mapCenter = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          this.userLocation = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          this.updateRoute()
        },
        fail: () => {
          uni.showToast({
            title: '获取位置失败',
            icon: 'none'
          })
        }
      })
    },
    selectPickupLocation(item) {
      // 这里可以记录选中的上车点
      console.log('选择上车点:', item)
      this.showPickupPanel = false
    },
    confirmPickup() {
      this.showPickupPanel = false
      uni.navigateTo({
        url: '/pages/taxi/taxi-order'
      })
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
            await this.submitOrder(this.currentVehicle, this.currentPrice, {
              passengerName: passengerName,
              passengerPhone: passengerPhone,
              contactName: passengerName,
              contactPhone: passengerPhone
            })
          }
        }
      })

      // 清空表单
      this.passengerForm.name = ''
      this.passengerForm.phone = ''
      this.currentVehicle = null
      this.currentPrice = null
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
  background: #0d1038;
  position: relative;
  overflow: hidden;
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
  margin: 20rpx;
  background: #1a1b3d;
  border-radius: 10rpx;
  padding: 6rpx;
}

.segment-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #999;
  transition: all 0.3s;
}

.segment-item.active {
  background: #ffb84d;
  color: #fff;
}

/* 地址输入区域 */
.address-input-area {
  margin: 20rpx;
  background: #1a1b3d;
  border-radius: 16rpx;
  padding: 30rpx;
}

.origin-input,
.destination-input {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.input-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.input-dot.green {
  background: #4caf50;
}

.input-dot.orange {
  background: #ff6b35;
}

.input-content {
  flex: 1;
  margin-left: 20rpx;
}

.input-text {
  color: #fff;
  font-size: 28rpx;
  line-height: 1.5;
}

.input-placeholder {
  color: #999;
  font-size: 28rpx;
}

/* 安全中心 */
.safety-center {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #2a2b4d;
}

.safety-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #4caf50;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  margin-right: 12rpx;
}

.safety-text {
  color: #fff;
  font-size: 26rpx;
}

.map-container {
  position: relative;
  width: 100%;
  height: 40vh;
  margin-top: 20rpx;
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
  bottom: 30rpx;
  left: 20rpx;
  width: 80rpx;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-icon {
  font-size: 40rpx;
  color: #fff;
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
  left: 10rpx;
  right: 10rpx;
  background: #1a1b3d;
  border-radius: 30rpx 30rpx 0 0;
  max-height: 70vh;
  z-index: 200;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8rpx 20rpx rgba(0, 0, 0, 0.4);
}

.price-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #2a2b4d;
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
  padding: 20rpx 12rpx 36rpx;
  overflow-y: auto;
}

.price-vehicle-item {
  margin-bottom: 24rpx;
  padding: 16rpx 0 20rpx;
  border-bottom: 1rpx solid #1f2142;
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
  margin-bottom: 16rpx;
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
  gap: 12rpx;
}

.supplier-item {
  display: flex;
  align-items: center;
  padding: 12rpx 14rpx;
  background: #1b1d3a;
  border-radius: 10rpx;
  overflow: hidden;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.supplier-logo-wrapper {
  width: 50rpx;
  height: 50rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.supplier-logo {
  width: 50rpx;
  height: 50rpx;
  border-radius: 8rpx;
  background: #2a2b4d;
}

.supplier-logo-placeholder {
  width: 50rpx;
  height: 50rpx;
  border-radius: 8rpx;
  background: #2a2b4d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 20rpx;
  color: #ffb84d;
  font-weight: 500;
}

.supplier-name {
  flex: 1;
  font-size: 24rpx;
  color: #f5f6fa;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 12rpx;
  min-width: 0;
}

.supplier-price {
  font-size: 26rpx;
  color: #ffb84d;
  font-weight: 500;
  flex-shrink: 0;
  max-width: 140rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  background: #1a1b3d;
  border-radius: 20rpx;
  overflow: hidden;
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
  color: #fff;
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
  background: #2a2b4d;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #fff;
  box-sizing: border-box;
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
  color: #ffb84d;
  font-weight: 500;
}
</style>


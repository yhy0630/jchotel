<template>
  <view class="page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="navbar-left" @click="goBack">
        <text class="icon-back">‹</text>
      </view>
      <view class="navbar-title" @click="toggleTypePicker(true)">
        <text>{{ typeLabel }}</text>
        <text class="icon-down">▼</text>
      </view>
    </view>

    <!-- Tab切换 -->
    <view class="tabs">
      <view :class="['tab', { active: status === '' }]" @click="switchTab('')">全部</view>
      <view :class="['tab', { active: status === '0' }]" @click="switchTab('0')">待付款</view>
      <view :class="['tab', { active: status === '1' }]" @click="switchTab('1')">待出行</view>
      <view :class="['tab', { active: status === '2' }]" @click="switchTab('2')">已完成</view>
    </view>

    <!-- 订单列表 -->
    <scroll-view scroll-y class="list" @scrolltolower="loadMore">
      <view v-for="item in list" :key="item.id" class="card" @click="goToDetail(item)">
        <view class="header">
          <image class="room-icon" :src="getOrderIcon(item)" mode="aspectFit"></image>
          <text class="type">{{ getOrderTypeText(item) }}</text>
          <text class="status">{{ getStatusText(item.status, item) }}</text>
        </view>
        <view class="room-name">{{ getOrderTitle(item) }}</view>
        <view class="location">{{ getOrderLocation(item) }}</view>
        <view class="dates">{{ getOrderDates(item) }}</view>
        <view class="price">¥ {{ item.amount_payable || item.amount_paid || item.total_price || 0 }}</view>
        <!-- 支付状态显示 -->
        <view v-if="(item._orderType || orderType) === 'hotel' && item.status === 0" class="pay-status">
          <text class="pay-status-label">支付状态：</text>
          <text :class="['pay-status-value', getPayStatusClass(item)]">
            {{ getPayStatusText(item) }}
          </text>
        </view>
        <view class="actions" @click.stop>
          <button v-if="item.status === 0 && !isPaid(item)" class="btn cancel" @click.stop="cancelOrder(item)">取消订单</button>
          <button v-if="item.status === 0 && !isPaid(item)" class="btn pay" @click.stop="goPay(item)">去支付</button>
          <button v-if="item.status === 1 && (item._orderType || orderType) === 'hotel'" class="btn cancel" @click.stop="cancelOrder(item)">取消订单</button>
          <button v-if="item.status === 2 && (item._orderType || orderType) === 'hotel'" class="btn invoice" @click.stop="applyInvoice(item)">申请开票</button>
        </view>
      </view>
      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="noMore && list.length > 0" class="no-more">没有更多了</view>
      <view v-if="!loading && list.length === 0" class="empty">暂无订单</view>
    </scroll-view>

    <!-- 订单类型选择弹窗 -->
    <view v-if="showTypePicker" class="type-picker-mask" @click="toggleTypePicker(false)">
      <view class="type-picker-panel" @click.stop>
        <view class="panel-header">
          <text class="panel-title">选择订单类型</text>
          <text class="panel-close" @click="toggleTypePicker(false)">✕</text>
        </view>
        <view class="panel-tags">
          <view
            v-for="item in allOrderTypes"
            :key="item.key"
            :class="['panel-tag', { active: isTypeSelected(item) }]"
            @click="selectOrderType(item)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { orderList, cancelOrder as cancelHotelOrder } from '@/api/hotel.js'
import { getFlightOrderList } from '@/api/flight.js'
import { getTrainOrderList } from '@/api/order.js'
import { getCarOrderList, cancelCarOrder } from '@/api/taxi.js'

export default {
  data() {
    return {
      orderType: 'hotel', // 订单类型：hotel-酒店, flight-飞机票, train-火车票, car_rental-租车, taxi-打车
      status: '',
      activeType: '', // 酒店订单子类型：''-全部, '1'-定制房, '2'-尊享房
      showTypePicker: false,
      list: [],
      page: 1,
      limit: 10,
      loading: false,
      noMore: false,
      // 全部订单的缓存数据（用于分页）
      allOrdersCache: [],
      allOrdersPage: {
        hotel: 1,
        flight: 1,
        train: 1,
        taxi: 1
      },
      allOrdersNoMore: {
        hotel: false,
        flight: false,
        train: false,
        taxi: false
      },
      // 所有订单类型选项（统一管理）
      allOrderTypes: [
        { key: 'all', label: '全部订单', orderType: 'all', activeType: '' },
        { key: 'hotel_vip', label: '尊享房', orderType: 'hotel', activeType: '2' },
        { key: 'hotel_custom', label: '定制房', orderType: 'hotel', activeType: '1' },
        { key: 'flight', label: '飞机票', orderType: 'flight', activeType: '' },
        { key: 'train', label: '火车票', orderType: 'train', activeType: '' },
        { key: 'car_rental', label: '租车', orderType: 'car_rental', activeType: '' },
        { key: 'taxi', label: '打车', orderType: 'taxi', activeType: '' }
      ]
    }
  },
  computed: {
    typeLabel() {
      // 查找当前选中的订单类型
      const selected = this.allOrderTypes.find(item => 
        item.orderType === this.orderType && item.activeType === this.activeType
      )
      return selected ? selected.label : '全部订单'
    }
  },
  onLoad(options) {
    this.orderType = options.order_type || 'hotel'
    this.status = options.status || ''
    this.activeType = options.type || ''
    this.loadList()
    // 监听支付成功事件
    uni.$on('payment', this.handlePaymentResult)
  },
  onShow() {
    // 页面显示时刷新列表，确保支付后数据是最新的
    if (this.orderType === 'hotel' && this.activeType === '1') {
      this.page = 1
      this.noMore = false
      this.loadList()
    }
  },
  onUnload() {
    // 移除支付事件监听
    uni.$off('payment', this.handlePaymentResult)
  },
  onPullDownRefresh() {
    this.page = 1
    this.noMore = false
    this.loadList()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    switchTab(status) {
      this.status = status
      this.page = 1
      this.noMore = false
      // 重置全部订单的缓存
      if (this.orderType === 'all') {
        this.allOrdersCache = []
        this.allOrdersPage = { hotel: 1, flight: 1, train: 1, taxi: 1 }
        this.allOrdersNoMore = { hotel: false, flight: false, train: false, taxi: false }
      }
      this.loadList()
    },
    toggleTypePicker(force = null) {
      if (force === null) {
        this.showTypePicker = !this.showTypePicker
      } else {
        this.showTypePicker = force
      }
      console.log('弹出框状态:', this.showTypePicker)
    },
    // 判断某个类型是否被选中
    isTypeSelected(item) {
      // 特殊处理"全部订单"
      if (item.key === 'all') {
        return this.orderType === 'all' && this.activeType === ''
      }
      return item.orderType === this.orderType && item.activeType === this.activeType
    },
    // 选择订单类型（统一处理）
    selectOrderType(item) {
      // 如果选择的是当前已选中的类型，直接关闭弹窗
      if (this.isTypeSelected(item)) {
        this.toggleTypePicker(false)
        return
      }
      
      // 更新订单类型和子类型
      this.orderType = item.orderType
      this.activeType = item.activeType
      // 切换类型时确保 loading 归零，避免上一次请求未归零导致新类型不触发
      this.loading = false
      this.noMore = false
      // 切换类型时清空当前列表，避免视觉残留
      this.list = []
      console.log('切换订单类型为:', item.orderType)

      // 关闭弹窗
      this.toggleTypePicker(false)
      
      // 重置分页并重新加载列表
      this.page = 1
      this.noMore = false
      // 重置全部订单的缓存
      if (item.orderType === 'all') {
        this.allOrdersCache = []
        this.allOrdersPage = { hotel: 1, flight: 1, train: 1, taxi: 1 }
        this.allOrdersNoMore = { hotel: false, flight: false, train: false, taxi: false }
      }
      this.loadList()
    },
    async loadList() {
      if (this.loading) return
      this.loading = true
      try {
        let res
        
        // 如果是"全部订单"，需要加载所有类型的订单并合并
        if (this.orderType === 'all') {
          res = await this.loadAllOrderTypes()
        } else if (this.orderType === 'flight') {
          // 飞机票订单列表
          const params = {
            status: this.status,
            page: this.page,
            limit: this.limit
          }
          res = await getFlightOrderList(params)
        } else if (this.orderType === 'train') {
          // 火车票订单列表
          const params = {
            status: this.status,
            page: this.page,
            limit: this.limit
          }
          res = await getTrainOrderList(params)
        } else if (this.orderType === 'car_rental' || this.orderType === 'taxi') {
          // 打车订单列表
          const params = {
            status: this.status,
            page: this.page,
            limit: this.limit
          }
          console.log('请求打车订单列表参数:', params)
          res = await getCarOrderList(params)
        } else {
          // 酒店订单列表
          const params = {
            status: this.status,
            page: this.page,
            limit: this.limit
          }
          // 如果有选择订单类型，添加type参数
          if (this.activeType) {
            params.type = this.activeType
          }
          res = await orderList(params)
        }
        
        if (res.code === 1) {
          if (this.page === 1) {
            this.list = res.data.list || []
          } else {
            this.list = this.list.concat(res.data.list || [])
          }
          
          // 对于"全部订单"，使用 hasMore 字段判断
          if (this.orderType === 'all') {
            if (res.data.hasMore === false || (res.data.list || []).length < this.limit) {
              this.noMore = true
            } else {
              this.page++
            }
          } else {
            // 其他类型的订单使用原来的逻辑
            const total = res.data.count || res.data.total || 0
            if (this.list.length >= total || (res.data.list || []).length < this.limit) {
              this.noMore = true
            } else {
              this.page++
            }
          }
        } else {
          console.warn('订单列表加载失败', res)
          uni.showToast({ title: res.msg || '加载失败', icon: 'none' })
        }
      } catch (e) {
        console.error('订单列表加载异常', e)
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
        uni.stopPullDownRefresh()
      }
    },
    // 加载所有类型的订单（用于"全部订单"）
    async loadAllOrderTypes() {
      // 如果是第一页，清空缓存
      if (this.page === 1) {
        this.allOrdersCache = []
        this.allOrdersPage = { hotel: 1, flight: 1, train: 1, taxi: 1 }
        this.allOrdersNoMore = { hotel: false, flight: false, train: false, taxi: false }
      }
      
      // 如果缓存中的数据不够当前页显示，需要加载更多
      const needCount = this.page * this.limit
      while (this.allOrdersCache.length < needCount && !this.isAllTypesNoMore()) {
        // 并行加载所有类型的订单（每个类型加载一页）
        const promises = []
        
        // 1. 酒店订单
        if (!this.allOrdersNoMore.hotel) {
          const hotelParams = {
            status: this.status,
            page: this.allOrdersPage.hotel,
            limit: this.limit,
            type: ''
          }
          promises.push(
            orderList(hotelParams)
              .then(res => ({ type: 'hotel', res }))
              .catch(e => ({ type: 'hotel', res: { code: 0, data: { list: [] } } }))
          )
        }
        
        // 2. 飞机票订单
        if (!this.allOrdersNoMore.flight) {
          const flightParams = {
            status: this.status,
            page: this.allOrdersPage.flight,
            limit: this.limit
          }
          promises.push(
            getFlightOrderList(flightParams)
              .then(res => ({ type: 'flight', res }))
              .catch(e => ({ type: 'flight', res: { code: 0, data: { list: [] } } }))
          )
        }
        
        // 3. 火车票订单
        if (!this.allOrdersNoMore.train) {
          const trainParams = {
            status: this.status,
            page: this.allOrdersPage.train,
            limit: this.limit
          }
          promises.push(
            getTrainOrderList(trainParams)
              .then(res => ({ type: 'train', res }))
              .catch(e => ({ type: 'train', res: { code: 0, data: { list: [] } } }))
          )
        }
        
        // 4. 打车订单
        if (!this.allOrdersNoMore.taxi) {
          const taxiParams = {
            status: this.status,
            page: this.allOrdersPage.taxi,
            limit: this.limit
          }
          promises.push(
            getCarOrderList(taxiParams)
              .then(res => ({ type: 'taxi', res }))
              .catch(e => ({ type: 'taxi', res: { code: 0, data: { list: [] } } }))
          )
        }

        // 如果没有需要加载的，跳出循环
        if (promises.length === 0) {
          break
        }
        
        // 等待所有请求完成
        const results = await Promise.all(promises)
        
        // 处理每个类型的结果
        results.forEach(({ type, res }) => {
          if (res.code === 1 && res.data && res.data.list && res.data.list.length > 0) {
            // 为每个订单添加类型标识
            const orders = res.data.list.map(item => ({
              ...item,
              _orderType: type
            }))
            this.allOrdersCache = this.allOrdersCache.concat(orders)
            
            // 更新该类型的页码
            this.allOrdersPage[type]++
            
            // 如果返回的数据少于 limit，说明该类型没有更多了
            if (res.data.list.length < this.limit) {
              this.allOrdersNoMore[type] = true
            }
          } else {
            // 请求失败或没有数据，标记为没有更多
            this.allOrdersNoMore[type] = true
          }
        })
      }
      
      // 按创建时间倒序排序（最新的在前）
      this.allOrdersCache.sort((a, b) => {
        const timeA = parseInt(a.create_time || a.add_time || 0)
        const timeB = parseInt(b.create_time || b.add_time || 0)
        return timeB - timeA
      })
      
      // 分页处理：返回当前页的数据
      const start = (this.page - 1) * this.limit
      const end = start + this.limit
      const paginatedList = this.allOrdersCache.slice(start, end)
      
      // 判断是否还有更多数据
      const hasMore = this.allOrdersCache.length > end || !this.isAllTypesNoMore()
      
      return {
        code: 1,
        data: {
          list: paginatedList,
          count: this.allOrdersCache.length,
          total: this.allOrdersCache.length,
          hasMore: hasMore
        }
      }
    },
    // 判断所有类型是否都没有更多数据了
    isAllTypesNoMore() {
      return this.allOrdersNoMore.hotel && this.allOrdersNoMore.flight && this.allOrdersNoMore.train && this.allOrdersNoMore.taxi
    },
    loadMore() {
      if (!this.noMore && !this.loading) {
        this.loadList()
      }
    },
    getStatusText(status, item) {
      // 如果订单有 _orderType 标识（来自"全部订单"），使用该标识；否则使用 this.orderType
      const orderType = item?._orderType || this.orderType
      
      // 打车订单状态
      if (orderType === 'taxi') {
        const map = { 0: '待支付', 1: '待接单', 2: '进行中', 3: '已完成', 4: '已取消' }
        return map[status] || item.status_text || '未知'
      }

      // 飞机票/火车票/租车订单状态
      if (['flight', 'train', 'car_rental'].includes(orderType)) {
        const map = { 0: '待支付', 1: '已支付', 2: '已出票', 3: '已取消', 4: '已退款' }
        return map[status] || '未知'
      }
      // 酒店订单状态
      const map = { 0: '待付款', 1: '待出行', 2: '已完成', 3: '已取消' }
      return map[status] || '未知'
    },
    // 判断订单是否已支付
    isPaid(item) {
      // 优先使用后端返回的 pay_status（各业务线统一）
      if (item.pay_status === 1 || item.pay_status === '1') {
        return true
      }
      // 兼容：根据金额判断（主要用于酒店订单等）
      const amountPaid = parseFloat(item.amount_paid || 0)
      const amountPayable = parseFloat(item.amount_payable || 0)
      if (amountPayable > 0 && amountPaid >= amountPayable) {
        return true
      }
      return false
    },
    // 获取支付状态文本
    getPayStatusText(item) {
      if (this.isPaid(item)) {
        return '已支付'
      }
      return '待支付'
    },
    // 获取支付状态样式类
    getPayStatusClass(item) {
      return this.isPaid(item) ? 'paid' : 'unpaid'
    },
    goToDetail(item) {
      // 根据订单类型跳转到对应的详情页面
      // 如果订单有 _orderType 标识（来自"全部订单"），使用该标识；否则使用 this.orderType
      const orderType = item._orderType || this.orderType
      
      const detailPages = {
        'flight': '/bundle/pages/ticket/flight-order-detail',
        'train': '/bundle/pages/ticket/train-order-detail',
        'car_rental': '/pages/car/order-detail',
        'taxi': '/bundle/pages/taxi/order-detail',
        'hotel': '/bundle/pages/hotel/order-detail'
      }
      
      const detailPage = detailPages[orderType] || '/bundle/pages/hotel/order-detail'
      
      // 根据订单类型传递不同的参数
      let url = `${detailPage}?order_id=${item.id}`
      if (orderType === 'flight' || orderType === 'train') {
        url += `&from=${orderType}`
      }
      if (item.order_sn) {
        url += `&order_sn=${item.order_sn}`
      }
      
      uni.navigateTo({
        url
      })
    },
    cancelOrder(item) {
      uni.showModal({
        title: '提示',
        content: '确定取消订单？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const orderType = item._orderType || this.orderType
              let cancelRes

              if (orderType === 'taxi') {
                cancelRes = await cancelCarOrder({ order_id: item.id })
              } else {
                cancelRes = await cancelHotelOrder({ order_id: item.id })
              }

              if (cancelRes.code === 1) {
                uni.showToast({ title: '订单已取消', icon: 'success' })
                setTimeout(() => {
                  this.page = 1
                  this.noMore = false
                  this.loadList()
                }, 1500)
              } else {
                uni.showToast({ title: cancelRes.msg || '取消失败', icon: 'none' })
              }
            } catch (e) {
              uni.showToast({ title: e.msg || '取消失败', icon: 'none' })
            }
          }
        }
      })
    },
    goPay(item) {
      // 根据订单类型跳转到支付页面
      const orderType = item._orderType || this.orderType
      const fromMap = {
        'flight': 'flight',
        'train': 'train',
        'car_rental': 'car_rental',
        'taxi': 'taxi',
        'hotel': 'hotel'
      }
      const from = fromMap[orderType] || 'hotel'
      uni.navigateTo({
        url: `/pages/payment/payment?from=${from}&order_id=${item.id}`
      })
    },
    applyInvoice(item) {
      // 跳转到申请开票页面，传递订单信息
      uni.navigateTo({
        url: `/bundle/pages/hotel/invoice-apply?order_id=${item.id}&order_sn=${item.order_sn || ''}`
      })
    },
    getOrderIcon(item) {
      const orderType = item?._orderType || this.orderType
      const iconMap = {
        'flight': '/static/images/飞机票.png',
        'train': '/static/images/火车票.png',
        'car_rental': '/static/images/icon_car_order.png',
        // 打车图标若缺失则回退到租车图标，避免 500 静态资源报错
        'taxi': '/static/images/icon_taxi_order.png'
      }
      const icon = iconMap[orderType] || '/static/images/jiudian-2 1.png'
      return icon
    },
    getOrderTypeText(item) {
      const orderType = item?._orderType || this.orderType
      const typeMap = {
        'flight': '飞机票',
        'train': '火车票',
        'car_rental': '租车',
        'taxi': '打车'
      }
      if (typeMap[orderType]) {
        return typeMap[orderType]
      }
      // 酒店订单：根据 type 字段判断
      return item.type === 1 ? '定制房' : '尊享房'
    },
    getOrderTitle(item) {
      const orderType = item?._orderType || this.orderType
      if (orderType === 'flight') {
        return `${item.flight_no || ''} ${item.airline_name || ''}`
      } else if (orderType === 'train') {
        return `${item.train_no || ''} ${item.train_type || ''}`
      } else if (orderType === 'taxi') {
        return `${item.vehicle_name || '快车'} - ${item.supplier_name || '供应商'}`
      }
      return item.room_name || ''
    },
    getOrderLocation(item) {
      const orderType = item?._orderType || this.orderType
      if (orderType === 'flight') {
        return `${item.departure_city_name || ''} → ${item.arrival_city_name || ''}`
      } else if (orderType === 'train') {
        return `${item.departure_station_name || item.departure_station || ''} → ${item.arrival_station_name || item.arrival_station || ''}`
      } else if (orderType === 'taxi') {
        return `${item.depart_address || ''} → ${item.arrive_address || ''}`
      }
      return item.hotel_name || ''
    },
    getOrderDates(item) {
      const orderType = item?._orderType || this.orderType
      if (orderType === 'flight') {
        return `${item.departure_date || ''} ${item.departure_time || ''} - ${item.arrival_time || ''}`
      } else if (orderType === 'train') {
        return `${item.departure_date || ''} ${item.departure_time || ''} - ${item.arrival_time || ''}`
      } else if (orderType === 'taxi') {
        const timeText = item.estimate_time ? `约${Math.round(item.estimate_time)}分钟` : ''
        const distanceText = item.estimate_distance ? `${(item.estimate_distance / 1000).toFixed(1)}km` : ''
        return `${timeText}${timeText && distanceText ? ' · ' : ''}${distanceText}`
      }
      return `${item.check_in_date} 至 ${item.check_out_date}·${item.night_num}晚${item.room_num || 1}间·${item.room_name || '大床房'}`
    },
    // 处理支付结果
    handlePaymentResult(paymentData) {
      if (paymentData.result && paymentData.from === 'hotel') {
        // 支付成功，刷新列表
        this.page = 1
        this.noMore = false
        this.loadList()
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0D1034;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 120rpx 30rpx 30rpx;
  background: #16213e;
  position: relative;
}

.navbar-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-back {
  font-size: 55rpx;
  color: #ffffff;
  line-height: 1;
}

.navbar-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 36rpx;
  font-weight: 500;
  color: #ffffff;
}

.icon-down {
  font-size: 20rpx;
  color: #999;
}

.tabs {
  display: flex;
  background: #16213e;
  border-bottom: 2px solid #0f1624;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 30rpx;
  color: #ffffff;
  font-size: 32rpx;
  position: relative;
}

.tab.active {
  color: transparent;
  background: linear-gradient(90deg, #F3C16F 0%, #FDE1AD 51.18%, #F4C271 100%);
  -webkit-background-clip: text;
  background-clip: text;
  font-weight: bold;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: linear-gradient(90deg, #F3C16F 0%, #FDE1AD 51.18%, #F4C271 100%);
  border-radius: 2rpx;
}

.list {
  height: calc(100vh - 176rpx);
  padding: 20rpx;
}

.card {
  background: #1E1F34;
  padding: 30rpx;
  margin-bottom: 20rpx;
  margin-right: 35rpx;
  border-radius: 12rpx;
  border: 2rpx solid #FCDDA6;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  gap: 16rpx;
}

.header .room-icon {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
}

.header .type {
  flex: 1;
}

.header .status {
  margin-left: auto;
}

.type {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  padding: 0;
  background: transparent;
  border: none;
}

.status {
  color: #ff9500;
  font-size: 24rpx;
}

.room-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.location, .dates {
  color: #ffffff;
  font-size: 24rpx;
  margin-bottom: 5rpx;
}

.price {
  color: #ffffff;
  font-size: 36rpx;
  font-weight: bold;
  margin: 20rpx 0;
  text-align: right;
}

.pay-status {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
  padding-top: 10rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.pay-status-label {
  color: #ffffff;
  font-size: 24rpx;
}

.pay-status-value {
  font-size: 24rpx;
  font-weight: bold;
  margin-left: 10rpx;
}

.pay-status-value.paid {
  color: #4CAF50;
}

.pay-status-value.unpaid {
  color: #FF9800;
}

.actions {
  display: flex;
  gap: 20rpx;
  justify-content: flex-end;
  margin-top: 20rpx;
}

.btn {
  padding: 15rpx 30rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  border: none;
  line-height: 1.5;
}

.btn.cancel {
  background: transparent;
  color: #FCDDA6;
  border: 2rpx solid #FCDDA6;
}

.btn.pay, .btn.invoice {
  background: transparent;
  color: #FCDDA6;
  border: 2rpx solid #FCDDA6;
}

.btn.pay:active, .btn.invoice:active {
  background: linear-gradient(90deg, #F4C06B 0%, #FDE0AB 49.59%, #F3BF6C 100%);
  color: #380C00;
  border-color: transparent;
}

.loading, .no-more, .empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}

/* 订单类型选择弹窗 */
.type-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
}

.type-picker-panel {
  width: 100%;
  background: #1F2034;
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx 30rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  max-height: 70vh;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40rpx;
  position: relative;
}

.panel-title {
  font-size: 36rpx;
  font-weight: 500;
  color: #ffffff;
  text-align: center;
}

.panel-close {
  font-size: 40rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.panel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.panel-tags.secondary {
  margin-bottom: 0;
}

.panel-tag {
  padding: 20rpx 40rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #ffffff;
  border: 2rpx solid transparent;
}

.panel-tag.active {
  background: #4E474C;
  border-color: #FFE3BB;
  color: #FFE3BB;
}

.panel-tag.disabled {
  opacity: 0.5;
  color: #666;
}
</style>

<template>
	<view class="index">
		<!-- 顶部导航栏 -->
		

		<!-- 轮播图 -->
		<view class="banner-section">
			<swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500" circular>
				<swiper-item v-for="(item, index) in bannerList" :key="index">
					<image :src="item.image" mode="aspectFill" class="banner-image"></image>
				</swiper-item>
			</swiper>
		</view>

		<!-- 选项卡 -->
		<view class="tabs-section">
			<view 
				v-for="(tab, index) in tabs" 
				:key="index"
				:class="['tab-item', { active: currentTab === index }]"
				@click="switchTab(index)"
			>
				{{ tab.label }}
								</view>
							</view>

		<!-- 地址选择区域 -->
		<view class="location-section">
			<view class="location-left" @click="selectLocation">
				<text class="location-text">{{ currentLocation || '北京' }}</text>
				<text class="location-arrow">▼</text>
					</view>
			<view class="location-right" @click="getCurrentLocation">
				<text class="location-icon">📍</text>
				<text class="location-label">当前位置</text>
				</view>
								</view>

		<!-- 时间选择区域（根据选项卡改变） -->
		<view class="date-section">
			<!-- 酒店/名宿 -->
			<view v-if="currentTab === 0" class="date-row">
				<view class="date-item" @click="selectCheckInDate">
					<text class="date-label">入住日期</text>
					<text class="date-value">{{ formatDateDisplay(checkInDate) || formatDate(new Date()) }}</text>
					</view>
				<view class="date-middle">
					<text class="date-night">共{{ nightCount }}晚</text>
								</view>
				<view class="date-item" @click="selectCheckOutDate">
					<text class="date-label">离店日期</text>
					<text class="date-value">{{ formatDateDisplay(checkOutDate) || formatDate(getTomorrow()) }}</text>
					</view>
				</view>

			<!-- 机票/火车票 -->
			<view v-if="currentTab === 1" class="date-row">
				<view class="date-item" @click="selectDepartureDate">
					<text class="date-label">出发日期</text>
					<text class="date-value">{{ departureDate || formatDate(new Date()) }}</text>
								</view>
				<view v-if="tripType === 'RT'" class="date-item" @click="selectReturnDate">
					<text class="date-label">返程日期</text>
					<text class="date-value">{{ returnDate || formatDate(getTomorrow()) }}</text>
							</view>
							</view>

			<!-- 租车/用车 -->
			<view v-if="currentTab === 2" class="date-row">
				<view class="date-item" @click="selectRentStartDate">
					<text class="date-label">取车日期</text>
					<text class="date-value">{{ rentStartDate || formatDate(new Date()) }}</text>
				</view>
				<view class="date-item" @click="selectRentEndDate">
					<text class="date-label">还车日期</text>
					<text class="date-value">{{ rentEndDate || formatDate(getTomorrow()) }}</text>
							</view>
							</view>
				</view>

		<!-- 价格/星级选择（仅酒店显示） -->
		<view v-if="currentTab === 0" class="filter-section">
			<view class="filter-item" @click="showPriceFilter">
				<text class="filter-text">价格/星级</text>
				<text class="filter-value">{{ priceFilterText || '不限' }}</text>
				<text class="filter-arrow">▼</text>
							</view>
				</view>

		<!-- 搜索按钮 -->
		<view class="search-section">
			<button class="search-btn" @click="handleSearch">{{ searchButtonText }}</button>
			</view>

		<!-- 列表区域（根据选项卡改变） -->
		<view class="list-section">
			<!-- 酒店列表 -->
			<view v-if="currentTab === 0" class="hotel-list">
				<view 
					v-for="(item, index) in hotelList" 
					:key="index" 
					class="hotel-item"
					@click="goHotelDetail(item)"
				>
					<image :src="item.image || '/static/images/default-hotel.png'" mode="aspectFill" class="hotel-image"></image>
					<view class="hotel-info">
						<view class="hotel-name">{{ item.hotelName || '酒店名称' }}</view>
						<view class="hotel-rating">
							<text class="rating-score">{{ item.rating || '4.9' }} 超棒</text>
							<text class="rating-reviews">{{ item.reviews || '5877' }}条点评</text>
					</view>
						<view class="hotel-location">
							距您直线距离{{ item.distance || '1.2' }}公里 近{{ item.area || '天安门广场' }}
				</view>
						<view class="hotel-desc">{{ item.desc || '酒店介绍:占位文字占位文字占位文字位文字占位文字占位文字.......' }}</view>
						<view class="hotel-price">
							<text class="price-item">挂牌价¥{{ formatPrice(item.listPrice || 133.2) }}起</text>
							<text class="price-item vip">尊享价¥{{ formatPrice(item.vipPrice || 133.2) }}起</text>
							<text class="price-item share">股东价¥{{ formatPrice(item.sharePrice || 133.2) }}起</text>
			</view>
					</view>
				</view>
				<view v-if="hotelLoading" class="loading">加载中...</view>
				<view v-if="hotelNoMore" class="no-more">没有更多了</view>
		</view>

			<!-- 机票/火车票列表 -->
			<view v-if="currentTab === 1" class="ticket-list">
				<view 
					v-for="(item, index) in ticketList" 
					:key="index" 
					class="ticket-item"
					@click="goTicketDetail(item)"
				>
					<view class="ticket-info">
						<view class="ticket-route">
							<text class="route-from">{{ item.departureCityName || '北京' }}</text>
							<text class="route-arrow">→</text>
							<text class="route-to">{{ item.arrivalCityName || '上海' }}</text>
							</view>
						<view class="ticket-time">
							<text class="time-departure">{{ item.departureTime || '08:00' }}</text>
							<text class="time-arrival">{{ item.arrivalTime || '10:30' }}</text>
							</view>
						<view class="ticket-detail">
							<text class="detail-text">{{ item.flightNo || item.trainNo || 'G123' }}</text>
							<text class="detail-text">{{ item.airlineName || item.trainType || '中国国航' }}</text>
						</view>
					</view>
					<view class="ticket-price">
						<text class="price-label">{{ item.priceTypeText || '尊享价' }}</text>
						<text class="price-value">¥{{ formatPrice(item.displayPrice || item.price || 580) }}</text>
						<text class="price-unit">起</text>
			</view>
				</view>
				<view v-if="ticketLoading" class="loading">加载中...</view>
				<view v-if="ticketNoMore" class="no-more">没有更多了</view>
			</view>

			<!-- 租车/用车列表 -->
			<view v-if="currentTab === 2" class="car-list">
				<view 
					v-for="(item, index) in carList" 
					:key="index" 
					class="car-item"
					@click="goCarDetail(item)"
				>
					<image :src="item.image || '/static/images/default-car.png'" mode="aspectFill" class="car-image"></image>
					<view class="car-info">
						<view class="car-name">{{ item.carName || '车型名称' }}</view>
						<view class="car-desc">{{ item.desc || '车辆描述信息' }}</view>
						<view class="car-price">
							<text class="price-label">日租</text>
							<text class="price-value">¥{{ formatPrice(item.price || 200) }}</text>
							<text class="price-unit">/天</text>
						</view>
					</view>
				</view>
				<view v-if="carLoading" class="loading">加载中...</view>
				<view v-if="carNoMore" class="no-more">没有更多了</view>
			</view>
		</view>
	</view>
</template>

<script>
import { hotelList } from '@/api/hotel.js'
import { flightList } from '@/api/flight.js'
import { trainList } from '@/api/train.js'

	export default {
		data() {
			return {
			// 选项卡
			tabs: [
				{ label: '酒店/名宿', value: 'hotel' },
				{ label: '机票/火车票', value: 'ticket' },
				{ label: '租车/用车', value: 'car' }
			],
			currentTab: 0, // 当前选中的选项卡索引
			
			// 轮播图
			bannerList: [
				{ image: '/static/images/banner1.jpg' },
				{ image: '/static/images/banner2.jpg' },
				{ image: '/static/images/banner3.jpg' }
			],
			
			// 位置信息
			currentLocation: '北京',
			locationCode: 'C1025',
			
			// 酒店相关
			checkInDate: '',
			checkOutDate: '',
			nightCount: 1,
			priceFilterText: '不限',
			hotelList: [],
			hotelPage: 1,
			hotelLoading: false,
			hotelNoMore: false,
			
			// 机票/火车票相关
			departureDate: '',
			returnDate: '',
			tripType: 'OW', // OW-单程, RT-往返
			ticketList: [],
			ticketPage: 1,
			ticketLoading: false,
			ticketNoMore: false,
			
			// 租车相关
			rentStartDate: '',
			rentEndDate: '',
			carList: [],
			carPage: 1,
			carLoading: false,
			carNoMore: false
		}
	},
	computed: {
		searchButtonText() {
			const texts = ['查询房源', '查询车票', '查询车辆']
			return texts[this.currentTab] || '查询'
		}
	},
	onLoad() {
		this.initDates()
		this.loadBanner()
		this.loadList()
		},
		onReachBottom() {
		this.loadMore()
		},
		onPullDownRefresh() {
		this.refresh()
	},
	methods: {
		// 初始化日期
		initDates() {
			const today = new Date()
			const tomorrow = this.getTomorrow()
			
			// 使用 YYYY-MM-DD 格式存储，用于API调用
			this.checkInDate = this.formatDateForApi(today)
			this.checkOutDate = this.formatDateForApi(tomorrow)
			this.departureDate = this.formatDateForApi(today)
			this.returnDate = this.formatDateForApi(tomorrow)
			this.rentStartDate = this.formatDateForApi(today)
			this.rentEndDate = this.formatDateForApi(tomorrow)
			
			this.calculateNightCount()
		},
		
		// 格式化日期为 YYYY-MM-DD 格式（用于API）
		formatDateForApi(date) {
			if (!date) return ''
			const d = new Date(date)
			const year = d.getFullYear()
			const month = String(d.getMonth() + 1).padStart(2, '0')
			const day = String(d.getDate()).padStart(2, '0')
			return `${year}-${month}-${day}`
		},
		
		// 获取明天日期
		getTomorrow() {
			const today = new Date()
			return new Date(today.getTime() + 86400000)
		},
		
		// 格式化日期（用于显示）
		formatDate(date) {
			if (!date) return ''
			const d = new Date(date)
			const month = d.getMonth() + 1
			const day = d.getDate()
			return `${month}月${day}日`
		},
		
		// 格式化日期显示（从 YYYY-MM-DD 转换为显示格式）
		formatDateDisplay(dateStr) {
			if (!dateStr) return ''
			// 如果是 YYYY-MM-DD 格式
			if (dateStr.includes('-') && dateStr.length === 10) {
				const [year, month, day] = dateStr.split('-')
				return `${parseInt(month)}月${parseInt(day)}日`
			}
			// 如果已经是显示格式，直接返回
			return dateStr
		},
		
		// 计算晚数
		calculateNightCount() {
			if (this.checkInDate && this.checkOutDate) {
				// 如果是 YYYY-MM-DD 格式
				let checkIn, checkOut
				if (this.checkInDate.includes('-') && this.checkInDate.length === 10) {
					checkIn = new Date(this.checkInDate)
					checkOut = new Date(this.checkOutDate)
					} else {
					// 如果是 "X月X日" 格式
					const today = new Date()
					const year = today.getFullYear()
					const checkInMatch = this.checkInDate.match(/(\d+)月(\d+)日/)
					const checkOutMatch = this.checkOutDate.match(/(\d+)月(\d+)日/)
					if (checkInMatch && checkOutMatch) {
						checkIn = new Date(year, parseInt(checkInMatch[1]) - 1, parseInt(checkInMatch[2]))
						checkOut = new Date(year, parseInt(checkOutMatch[1]) - 1, parseInt(checkOutMatch[2]))
					} else {
						this.nightCount = 1
						return
					}
				}
				const diff = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
				this.nightCount = diff > 0 ? diff : 1
			}
		},
		
		// 切换选项卡
		switchTab(index) {
			if (this.currentTab === index) return
			
			// 如果点击的是机票/火车票选项卡，直接跳转到搜索页面
			if (index === 1) {
				uni.navigateTo({
					url: '/pages/ticket/search',
					success: () => {
						// 跳转成功后，不更新currentTab，保持当前选项卡状态
					},
					fail: (err) => {
						console.error('跳转失败:', err)
						uni.showToast({
							title: '跳转失败',
							icon: 'none'
						})
					}
				})
				return
			}
			
			this.currentTab = index
			this.refresh()
		},
		
		// 选择位置
		selectLocation() {
				uni.navigateTo({
				url: '/pages/hotel/city-select?type=hotel'
			})
		},
		
		// 获取当前位置
		getCurrentLocation() {
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					// 这里可以调用逆地理编码API获取城市名称
					this.currentLocation = '当前位置'
					uni.showToast({
						title: '已获取当前位置',
						icon: 'success'
					})
				},
				fail: (err) => {
					uni.showToast({
						title: '获取位置失败',
						icon: 'none'
					})
					}
				})
			},
		
		// 选择入住日期
		selectCheckInDate() {
			// 使用日期选择器
			// 这里简化处理，实际应该使用日期选择组件
			uni.showToast({
				title: '选择入住日期',
				icon: 'none'
			})
		},
		
		// 选择离店日期
		selectCheckOutDate() {
			uni.showToast({
				title: '选择离店日期',
				icon: 'none'
			})
		},
		
		// 选择出发日期
		selectDepartureDate() {
			uni.showToast({
				title: '选择出发日期',
				icon: 'none'
			})
		},
		
		// 选择返程日期
		selectReturnDate() {
			uni.showToast({
				title: '选择返程日期',
				icon: 'none'
			})
		},
		
		// 选择取车日期
		selectRentStartDate() {
			uni.showToast({
				title: '选择取车日期',
				icon: 'none'
			})
		},
		
		// 选择还车日期
		selectRentEndDate() {
			uni.showToast({
				title: '选择还车日期',
				icon: 'none'
			})
		},
		
		// 显示价格筛选
		showPriceFilter() {
			uni.showToast({
				title: '价格/星级筛选',
				icon: 'none'
			})
		},
		
		// 搜索
		handleSearch() {
			if (this.currentTab === 0) {
				// 跳转到酒店列表页
				uni.navigateTo({
					url: `/pages/hotel/hotel-list?cityCode=${this.locationCode}&cityName=${this.currentLocation}&checkInDate=${this.checkInDate}&checkOutDate=${this.checkOutDate}`
				})
			} else if (this.currentTab === 1) {
				// 跳转到机票/火车票搜索页
				uni.navigateTo({
					url: '/pages/ticket/search'
				})
			} else if (this.currentTab === 2) {
				// 租车搜索
				uni.showToast({
					title: '租车功能开发中',
					icon: 'none'
				})
			}
		},
		
		// 加载轮播图
		loadBanner() {
			// 这里可以从API获取轮播图数据
			// 暂时使用默认数据
		},
		
		// 加载列表
		loadList() {
			if (this.currentTab === 0) {
				this.loadHotelList()
			} else if (this.currentTab === 1) {
				this.loadTicketList()
			} else if (this.currentTab === 2) {
				this.loadCarList()
			}
		},
		
		// 加载酒店列表
		async loadHotelList() {
			if (this.hotelLoading || this.hotelNoMore) return
			
			this.hotelLoading = true
			try {
				// 格式化日期为 YYYY-MM-DD 格式
				const formatDateForApi = (dateStr) => {
					if (!dateStr) {
						const today = new Date()
						return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
					}
					// 如果已经是 YYYY-MM-DD 格式，直接返回
					if (dateStr.includes('-') && dateStr.length === 10) {
						return dateStr
					}
					// 如果是 "X月X日" 格式，转换为 YYYY-MM-DD
					const today = new Date()
					const year = today.getFullYear()
					const match = dateStr.match(/(\d+)月(\d+)日/)
					if (match) {
						const month = String(match[1]).padStart(2, '0')
						const day = String(match[2]).padStart(2, '0')
						return `${year}-${month}-${day}`
					}
					return dateStr
				}
				
				const checkInDate = formatDateForApi(this.checkInDate)
				const checkOutDate = formatDateForApi(this.checkOutDate)
				
				const res = await hotelList({
					city_code: this.locationCode || 'C1025',
					check_in_date: checkInDate,
					check_out_date: checkOutDate,
					page: this.hotelPage,
					row: 10
				})
				
				if (res.code === 1) {
					const list = res.data.list || []
					const total = res.data.total || 0
					
					if (this.hotelPage === 1) {
						this.hotelList = list.map(item => ({
							hotelCode: item.hotelCode,
							hotelName: item.hotelName,
							rating: item.commentPoint || '4.9',
							reviews: item.commentCount || '0',
							distance: item.distince || '0',
							area: item.businessarea || '--',
							desc: item.shortDesc || '',
							listPrice: item.list_price || item.minPrice || 0,
							vipPrice: item.vip_price || item.minPrice || 0,
							sharePrice: item.share_price || item.minPrice || 0,
							image: (item.images && item.images[0] && item.images[0].url) || '/static/images/default-hotel.png'
						}))
					} else {
						const newList = list.map(item => ({
							hotelCode: item.hotelCode,
							hotelName: item.hotelName,
							rating: item.commentPoint || '4.9',
							reviews: item.commentCount || '0',
							distance: item.distince || '0',
							area: item.businessarea || '--',
							desc: item.shortDesc || '',
							listPrice: item.list_price || item.minPrice || 0,
							vipPrice: item.vip_price || item.minPrice || 0,
							sharePrice: item.share_price || item.minPrice || 0,
							image: (item.images && item.images[0] && item.images[0].url) || '/static/images/default-hotel.png'
						}))
						this.hotelList = [...this.hotelList, ...newList]
					}
					
					if (this.hotelList.length >= total) {
						this.hotelNoMore = true
					} else {
						this.hotelPage++
					}
				} else {
					uni.showToast({
						title: res.msg || '加载失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('加载酒店列表失败:', error)
				uni.showToast({
					title: error.msg || '加载失败',
					icon: 'none'
				})
			} finally {
				this.hotelLoading = false
			}
		},
		
		// 加载机票/火车票列表
		async loadTicketList() {
			if (this.ticketLoading || this.ticketNoMore) return
			
			this.ticketLoading = true
			try {
				// 这里调用机票/火车票列表API
				setTimeout(() => {
					const mockData = Array(5).fill(null).map((_, i) => ({
						departureCityName: '北京',
						arrivalCityName: '上海',
						departureTime: '08:00',
						arrivalTime: '10:30',
						flightNo: 'CA1234',
						airlineName: '中国国航',
						displayPrice: 580,
						priceTypeText: '尊享价'
					}))
					this.ticketList = [...this.ticketList, ...mockData]
					this.ticketPage++
					this.ticketLoading = false
					if (this.ticketPage > 3) {
						this.ticketNoMore = true
					}
				}, 500)
			} catch (error) {
				this.ticketLoading = false
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			}
		},
		
		// 加载租车列表
		async loadCarList() {
			if (this.carLoading || this.carNoMore) return
			
			this.carLoading = true
			try {
				setTimeout(() => {
					const mockData = Array(5).fill(null).map((_, i) => ({
						carId: `car_${i}`,
						carName: `车型${i + 1}`,
						desc: '车辆描述信息',
						price: 200,
						image: '/static/images/default-car.png'
					}))
					this.carList = [...this.carList, ...mockData]
					this.carPage++
					this.carLoading = false
					if (this.carPage > 3) {
						this.carNoMore = true
					}
				}, 500)
			} catch (error) {
				this.carLoading = false
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			}
		},
		
		// 加载更多
		loadMore() {
			this.loadList()
		},
		
		// 刷新
		refresh() {
			this.hotelList = []
			this.ticketList = []
			this.carList = []
			this.hotelPage = 1
			this.ticketPage = 1
			this.carPage = 1
			this.hotelNoMore = false
			this.ticketNoMore = false
			this.carNoMore = false
			this.loadList()
			uni.stopPullDownRefresh()
		},
		
		// 格式化价格
		formatPrice(price) {
			return Number(price).toFixed(2)
		},
		
		// 跳转到酒店详情
		goHotelDetail(item) {
			uni.navigateTo({
				url: `/pages/hotel/hotel-detail?hotelCode=${item.hotelCode}`
			})
		},
		
		// 跳转到票务详情
		goTicketDetail(item) {
			uni.navigateTo({
				url: '/pages/ticket/flight-list'
			})
		},
		
		// 跳转到租车详情
		goCarDetail(item) {
			uni.showToast({
				title: '租车功能开发中',
				icon: 'none'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.index {
	min-height: 100vh;
	background-color: #f5f5f5;
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
		}
	}
}

.banner-section {
	width: 100%;
	height: 400rpx;
	
	.banner-swiper {
		width: 100%;
		height: 100%;
		
		.banner-image {
			width: 100%;
			height: 100%;
		}
	}
}

.tabs-section {
	display: flex;
	background-color: #1A4A8F;
				padding: 0 20rpx;

	.tab-item {
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

.location-section {
						display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 40rpx;
	background-color: #fff;
	
	.location-left {
		display: flex;
		align-items: center;
		gap: 10rpx;
		
		.location-text {
			font-size: 32rpx;
			color: #333;
		}
		
		.location-arrow {
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.location-right {
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 10rpx 20rpx;
		background-color: #f5f5f5;
		border-radius: 40rpx;
		
		.location-icon {
			font-size: 28rpx;
		}
		
		.location-label {
			font-size: 28rpx;
			color: #666;
		}
	}
}

.date-section {
	padding: 30rpx 40rpx;
	background-color: #fff;
	margin-top: 20rpx;
	
	.date-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
		
		.date-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 10rpx;
			
			.date-label {
				font-size: 24rpx;
				color: #999;
			}
			
			.date-value {
				font-size: 32rpx;
				color: #333;
			}
		}
		
		.date-middle {
			.date-night {
				font-size: 28rpx;
				color: #666;
			}
		}
	}
}

.filter-section {
	padding: 20rpx 40rpx;
	background-color: #fff;
	margin-top: 20rpx;
	
	.filter-item {
		display: flex;
		align-items: center;
		gap: 10rpx;
		
		.filter-text {
			font-size: 28rpx;
			color: #666;
		}
		
		.filter-value {
			font-size: 28rpx;
			color: #333;
		}
		
		.filter-arrow {
			font-size: 24rpx;
			color: #999;
		}
	}
}

.search-section {
	padding: 30rpx 40rpx;
	background-color: #fff;
	margin-top: 20rpx;
	
	.search-btn {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(135deg, #F8D07C 0%, #E6B85C 100%);
		border-radius: 44rpx;
		font-size: 32rpx;
		color: #fff;
		font-weight: bold;
		border: none;
		
		&::after {
			border: none;
		}
	}
}

.list-section {
	padding: 20rpx;
	
	.hotel-list, .ticket-list, .car-list {
		.hotel-item, .ticket-item, .car-item {
			background-color: #fff;
			border-radius: 20rpx;
			margin-bottom: 20rpx;
			overflow: hidden;
			display: flex;
			padding: 20rpx;
			gap: 20rpx;
			
			.hotel-image, .car-image {
				width: 200rpx;
				height: 200rpx;
				border-radius: 10rpx;
			}
			
			.hotel-info, .ticket-info, .car-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 10rpx;
				
				.hotel-name, .car-name {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}
				
				.hotel-rating {
					display: flex;
					align-items: center;
					gap: 10rpx;
					
					.rating-score {
						font-size: 28rpx;
						color: #F8D07C;
					}
					
					.rating-reviews {
						font-size: 24rpx;
						color: #999;
					}
				}
				
				.hotel-location {
					font-size: 24rpx;
					color: #666;
				}
				
				.hotel-desc {
					font-size: 24rpx;
					color: #999;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				
				.hotel-price {
					display: flex;
					gap: 20rpx;
					
					.price-item {
						font-size: 24rpx;
						color: #666;
						
						&.vip {
							color: #F8D07C;
						}
						
						&.share {
							color: #1A4A8F;
						}
					}
				}
				
				.ticket-route {
					display: flex;
					align-items: center;
					gap: 10rpx;
					
					.route-from, .route-to {
						font-size: 32rpx;
						font-weight: bold;
						color: #333;
					}
					
					.route-arrow {
						font-size: 28rpx;
						color: #999;
					}
				}
				
				.ticket-time {
					display: flex;
					gap: 20rpx;
					
					.time-departure, .time-arrival {
						font-size: 28rpx;
						color: #666;
					}
				}
				
				.ticket-detail {
					display: flex;
					gap: 20rpx;
					
					.detail-text {
						font-size: 24rpx;
						color: #999;
					}
				}
				
				.car-desc {
					font-size: 24rpx;
					color: #666;
				}
				
				.car-price {
					display: flex;
					align-items: baseline;
					gap: 10rpx;
					
					.price-label {
						font-size: 24rpx;
						color: #999;
					}
					
					.price-value {
						font-size: 36rpx;
						font-weight: bold;
						color: #F8D07C;
					}
					
					.price-unit {
						font-size: 24rpx;
						color: #999;
					}
				}
			}
			
			.ticket-price {
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				justify-content: center;
				gap: 10rpx;
				
				.price-label {
					font-size: 24rpx;
					color: #999;
				}
				
				.price-value {
					font-size: 40rpx;
					font-weight: bold;
					color: #F8D07C;
				}
				
				.price-unit {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
		
		.loading, .no-more {
			text-align: center;
			padding: 40rpx 0;
			font-size: 28rpx;
			color: #999;
			}
		}
	}
</style>

	
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
		}
	}
}

.banner-section {
	width: 100%;
	height: 400rpx;
	
	.banner-swiper {
		width: 100%;
		height: 100%;
		
		.banner-image {
			width: 100%;
			height: 100%;
		}
	}
}

.tabs-section {
	display: flex;
	background-color: #1A4A8F;
				padding: 0 20rpx;

	.tab-item {
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

.location-section {
						display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 40rpx;
	background-color: #fff;
	
	.location-left {
		display: flex;
		align-items: center;
		gap: 10rpx;
		
		.location-text {
			font-size: 32rpx;
			color: #333;
		}
		
		.location-arrow {
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.location-right {
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 10rpx 20rpx;
		background-color: #f5f5f5;
		border-radius: 40rpx;
		
		.location-icon {
			font-size: 28rpx;
		}
		
		.location-label {
			font-size: 28rpx;
			color: #666;
		}
	}
}

.date-section {
	padding: 30rpx 40rpx;
	background-color: #fff;
	margin-top: 20rpx;
	
	.date-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
		
		.date-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 10rpx;
			
			.date-label {
				font-size: 24rpx;
				color: #999;
			}
			
			.date-value {
				font-size: 32rpx;
				color: #333;
			}
		}
		
		.date-middle {
			.date-night {
				font-size: 28rpx;
				color: #666;
			}
		}
	}
}

.filter-section {
	padding: 20rpx 40rpx;
	background-color: #fff;
	margin-top: 20rpx;
	
	.filter-item {
		display: flex;
		align-items: center;
		gap: 10rpx;
		
		.filter-text {
			font-size: 28rpx;
			color: #666;
		}
		
		.filter-value {
			font-size: 28rpx;
			color: #333;
		}
		
		.filter-arrow {
			font-size: 24rpx;
			color: #999;
		}
	}
}

.search-section {
	padding: 30rpx 40rpx;
	background-color: #fff;
	margin-top: 20rpx;
	
	.search-btn {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(135deg, #F8D07C 0%, #E6B85C 100%);
		border-radius: 44rpx;
		font-size: 32rpx;
		color: #fff;
		font-weight: bold;
		border: none;
		
		&::after {
			border: none;
		}
	}
}

.list-section {
	padding: 20rpx;
	
	.hotel-list, .ticket-list, .car-list {
		.hotel-item, .ticket-item, .car-item {
			background-color: #fff;
			border-radius: 20rpx;
			margin-bottom: 20rpx;
			overflow: hidden;
			display: flex;
			padding: 20rpx;
			gap: 20rpx;
			
			.hotel-image, .car-image {
				width: 200rpx;
				height: 200rpx;
				border-radius: 10rpx;
			}
			
			.hotel-info, .ticket-info, .car-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 10rpx;
				
				.hotel-name, .car-name {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}
				
				.hotel-rating {
					display: flex;
					align-items: center;
					gap: 10rpx;
					
					.rating-score {
						font-size: 28rpx;
						color: #F8D07C;
					}
					
					.rating-reviews {
						font-size: 24rpx;
						color: #999;
					}
				}
				
				.hotel-location {
					font-size: 24rpx;
					color: #666;
				}
				
				.hotel-desc {
					font-size: 24rpx;
					color: #999;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				
				.hotel-price {
					display: flex;
					gap: 20rpx;
					
					.price-item {
						font-size: 24rpx;
						color: #666;
						
						&.vip {
							color: #F8D07C;
						}
						
						&.share {
							color: #1A4A8F;
						}
					}
				}
				
				.ticket-route {
					display: flex;
					align-items: center;
					gap: 10rpx;
					
					.route-from, .route-to {
						font-size: 32rpx;
						font-weight: bold;
						color: #333;
					}
					
					.route-arrow {
						font-size: 28rpx;
						color: #999;
					}
				}
				
				.ticket-time {
					display: flex;
					gap: 20rpx;
					
					.time-departure, .time-arrival {
						font-size: 28rpx;
						color: #666;
					}
				}
				
				.ticket-detail {
					display: flex;
					gap: 20rpx;
					
					.detail-text {
						font-size: 24rpx;
						color: #999;
					}
				}
				
				.car-desc {
					font-size: 24rpx;
					color: #666;
				}
				
				.car-price {
					display: flex;
					align-items: baseline;
					gap: 10rpx;
					
					.price-label {
						font-size: 24rpx;
						color: #999;
					}
					
					.price-value {
						font-size: 36rpx;
						font-weight: bold;
						color: #F8D07C;
					}
					
					.price-unit {
						font-size: 24rpx;
						color: #999;
					}
				}
			}
			
			.ticket-price {
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				justify-content: center;
				gap: 10rpx;
				
				.price-label {
					font-size: 24rpx;
					color: #999;
				}
				
				.price-value {
					font-size: 40rpx;
					font-weight: bold;
					color: #F8D07C;
				}
				
				.price-unit {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
		
		.loading, .no-more {
			text-align: center;
			padding: 40rpx 0;
			font-size: 28rpx;
			color: #999;
			}
		}
	}
</style>

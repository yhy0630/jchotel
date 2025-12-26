<template>
	<view class="index">
		<!-- 顶部导航栏 -->
		<custom-navbar title="锦程汇" :show-back="false" ></custom-navbar>

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
				:class="['tab-item', { active: hasTabClicked && currentTab === index }]"
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
			<view class="location-divider"></view>
			<view class="location-right" @click="getCurrentLocation">
				<text class="location-label">当前位置</text>
				<image class="location-img" src="/static/images/dingwei 1.png" mode="widthFix"></image>

			</view>
		</view>

		<!-- 时间选择区域（不依赖选项卡，首页固定展示） + 价格/星级 -->
		<view class="date-section with-filter">
			<!-- 酒店/名宿 -->
			<view class="date-row">
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

			<!-- 价格/星级（仅酒店） -->
			<view class="filter-inline" @click="showPriceFilter">
				<text class="filter-text">价格/星级</text>
				<text class="filter-value">{{ priceFilterText || '不限' }}</text>
				<!-- <text class="filter-arrow">▼</text> -->
							</view>
				</view>

		<!-- 搜索按钮 -->
		<view class="search-section">
			<button class="search-btn" @click="handleSearch">{{ searchButtonText }}</button>
			</view>

		<!-- 列表区域（主页始终显示酒店列表，不依赖选项卡） -->
		<view class="list-section">
			<view class="hotel-list">
				<view 
					v-for="(item, index) in hotelList" 
					:key="index" 
					class="hotel-item"
					@click="goHotelDetail(item)"
				>
					<image :src="item.image" mode="aspectFill" class="hotel-image"></image>
					<view class="hotel-info">
						<view class="hotel-name">{{ item.hotelName }}</view>
						<view class="hotel-rating">
							<text class="rating-score">{{ item.rating  }} 超棒</text>
							<text class="rating-reviews">{{ item.reviews  }}条点评</text>
					</view>
						<view class="hotel-location">
							距您直线距离{{ item.distance  }}公里 近{{ item.area  }}
				</view>
						<view class="hotel-desc">{{ item.desc }}</view>
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
		</view>
	</view>
</template>

<script>
import { hotelList } from '@/api/hotel.js'
import { flightList } from '@/api/flight.js'
import { trainList } from '@/api/train.js'
import config from '@/config/app.js'

	export default {
		data() {
			return {
			// 选项卡
			tabs: [
				{ label: '酒店/民宿', value: 'hotel' },
				{ label: '机票/火车票', value: 'ticket' },
				{ label: '租车/用车', value: 'car' }
			],
			currentTab: 0, // 当前选中的选项卡索引
			hasTabClicked: false, // 是否点击过选项卡，用于控制默认无激活样式
			
			// 轮播图
			bannerList: [
				{ image: config.baseURL + '/uploads/images/images/酒店.png' }
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
		
		// 切换选项卡（点击后高亮当前项，机票跳转到搜索页）
		switchTab(index) {
			this.hasTabClicked = true
			
			// 先更新当前选中，用于触发 .active 样式
			if (this.currentTab !== index) {
				this.currentTab = index
			}

			// 点击酒店/民宿，跳转到酒店首页
			if (index === 0) {
				uni.navigateTo({
					url: '/bundle/pages/hotel/hotel-home'
				})
			}
			
			// 点击机票/火车票，跳转到票务搜索页
			if (index === 1) {
				uni.navigateTo({
					url: '/bundle/pages/ticket/search'
				})
			}
      // 点击租车/用车，跳转到打车页面
      if (index === 2) {
        uni.navigateTo({
          url: '/bundle/pages/taxi/taxi-index'
        })
      }

		},
		
		// 选择位置
		selectLocation() {
				uni.navigateTo({
				url: '/bundle/pages/hotel/city-select?type=hotel'
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
					url: `/bundle/pages/hotel/hotel-list?cityCode=${this.locationCode}&cityName=${this.currentLocation}&checkInDate=${this.checkInDate}&checkOutDate=${this.checkOutDate}`
				})
			} else if (this.currentTab === 1) {
				// 跳转到机票/火车票搜索页
				uni.navigateTo({
					url: '/bundle/pages/ticket/search'
				})
			} else if (this.currentTab === 2) {
				// 跳转到打车页面
				uni.navigateTo({
					url: '/bundle/pages/taxi/taxi-index'
				})
			}
		},
		
		// 加载轮播图
		loadBanner() {
			// 这里可以从API获取轮播图数据
			// 暂时使用默认数据
		},
		
		// 加载列表（首页始终加载酒店列表）
		loadList() {
				this.loadHotelList()
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
		
		// 加载更多（仅酒店）
		loadMore() {
			this.loadHotelList()
		},
		
		// 刷新（仅酒店）
		refresh() {
			this.hotelList = []
			this.hotelPage = 1
			this.hotelNoMore = false
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
				url: `/bundle/pages/hotel/hotel-detail?hotelCode=${item.hotelCode}`
			})
		},
		
		// 跳转到票务详情
		goTicketDetail(item) {
			uni.navigateTo({
				url: '/bundle/pages/ticket/flight-list'
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
	background-color: #0c0d21;
	padding: 20rpx 20rpx 40rpx;
	box-sizing: border-box;

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
	width: calc(100% + 40rpx);
	height: 400rpx;
	margin-left: -20rpx;
	margin-right: -20rpx;
	margin-top: 50rpx;

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
	gap: 12rpx;
	padding: 0 6rpx;
	margin-top: 10rpx;
	margin-bottom: 20rpx;
	background-color: #353548;
	color: #ffffff;
	border-radius: 48rpx;

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 20rpx 0;
		font-size: 30rpx;
		color: #ffffff;
		position: relative;
		background-color: #353548;
		border-radius: 48rpx;
		transition: all .2s;
		border: 1rpx solid transparent;
		
		&.active {
			color: #1b1f35;
			font-weight: 700;
			background: linear-gradient(90deg, #F3BC62 0%, #FEE6B6 50.34%, #F3BD64 100%)
		
		}
	}
}

.location-section {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 30rpx;
	background-color: #1b1f35;
	border-radius: 18rpx;
	border: 1rpx solid rgba(255,255,255,0.08);
	color: #f5f5f7;
	
	.location-left {
		display: flex;
		align-items: center;
		gap: 10rpx;
		
		.location-text {
			font-size: 32rpx;
			color: #f5f5f7;
			font-weight: 600;
		}
		
		.location-arrow {
			font-size: 22rpx;
			color: #c8cbd9;
		}
	}
	
	.location-divider {
		width: 1rpx;
		height: 40rpx;
		background-color: #C3C3C3;
		margin-left: 300rpx;
	}
	
	.location-right {
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 10rpx 18rpx;
		border-radius: 40rpx;
		
		.location-img {
			width: 32rpx;
			height: 32rpx;
		}
		
		.location-label {
			font-size: 26rpx;
			color: #EDD7BC;
			font-weight: 600;
		}
	}
}

.date-section {
	padding: 24rpx 30rpx;
	background-color: #1b1f35;
	margin-top: 18rpx;
	border-radius: 18rpx;
	border: 1rpx solid rgba(255,255,255,0.08);
	color: #f5f5f7;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	
	&.with-filter {
		.filter-inline {
			display: flex;
		}
	}
	
	.date-row {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 20rpx;
		
		.date-item {
			flex: 0;
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			gap: 8rpx;
			text-align: center;
			white-space: nowrap;
			
			.date-label {
				font-size: 24rpx;
				color: #FFE3BB;
			}
			
			.date-value {
				font-size: 34rpx;
				color: #FFE3BB;
				font-weight: 700;
			}
		}
		
		.date-middle {
			margin: 0 12rpx;
			.date-night {
				font-size: 26rpx;
				color: #021742;
				padding: 10rpx 25rpx;
                background: linear-gradient(90deg, #F3BD63 -18.87%, #FDE3B1 48.55%, #F3BD63 122.64%);
				border-radius: 42rpx;
			}
		}
	}
	
	.filter-inline {
		display: none;
		flex-direction: column;
		gap: 8rpx;
		padding-left: 24rpx;
		border-left: 1px solid #E6E6E6;
		white-space: nowrap;
		
		.filter-text {
			font-size: 23rpx;
			color: #D2BCA0;
		}
		
		.filter-value {
			font-size: 28rpx;
			color: #FFE3BB;
			font-weight: 700;
		}
		
		.filter-arrow {
			font-size: 22rpx;
			color: #c8cbd9;
		}
	}
}

.filter-section {
	padding: 20rpx 30rpx;
	background-color: #1b1f35;
	margin-top: 16rpx;
	border-radius: 14rpx;
	border: 1rpx solid rgba(255,255,255,0.08);
	
	.filter-item {
		display: flex;
		align-items: center;
		gap: 10rpx;
		
		.filter-text {
			font-size: 26rpx;
			color: #c8cbd9;
		}
		
		.filter-value {
			font-size: 28rpx;
			color: #f5f5f7;
			font-weight: 700;
		}
		
		.filter-arrow {
			font-size: 22rpx;
			color: #c8cbd9;
		}
	}
}

.search-section {
	padding: 26rpx 0;
	margin-top: 10rpx;
	
	.search-btn {
		width: 100%;
		height: 96rpx;
		background: linear-gradient(90deg, #F4BD63 0%, #FFE3BB 50.4%, #F3BD64 100%);
		border-radius: 20rpx;
		font-size: 32rpx;
		color: #380C00;
		text-align: center;
		font-weight: 800;
		border: none;
		box-shadow: 0 8rpx 20rpx rgba(240,190,99,0.35);
		
		&::after {
			border: none;
		}
	}
}

.list-section {
	padding: 10rpx 0 0;
	
	.hotel-list, .ticket-list, .car-list {
		.hotel-item, .ticket-item, .car-item {
			background-color: #1b1f35;
			border-radius: 20rpx;
			margin-bottom: 20rpx;
			overflow: hidden;
			display: flex;
			padding: 22rpx;
			gap: 24rpx;
			border: 1rpx solid rgba(255,255,255,0.08);
			color: #f5f5f7;
			
			.hotel-image, .car-image {
				width: 260rpx;
				height: 380rpx;
				border-radius: 16rpx;
			}
			
			.hotel-info, .ticket-info, .car-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 12rpx;
				
				.hotel-name, .car-name {
					font-size: 33rpx;
					font-weight: 700;
					color: #f5f5f7;
				}
				
				.hotel-rating {
					display: flex;
					align-items: center;
					gap: 14rpx;
					
					.rating-score {
						font-size: 23rpx;
						color: #380C00;
						background: linear-gradient(90deg, #F4BD63 0%, #FFE3BB 50.4%, #F3BD64 100%);
						padding: 6rpx 16rpx;
						border-radius: 20rpx;
						font-weight: 600;
					}
					
					.rating-reviews {
						font-size: 26rpx;
						color: #c8cbd9;
					}
				}
				
				.hotel-location {
					font-size: 26rpx;
					color: #c8cbd9;
				}
				
				.hotel-desc {
					font-size: 30rpx;
					color: #f5f5f7;
					line-height: 1.5;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					overflow: hidden;
				}
				
				.hotel-price {
					display: flex;
					flex-direction: column;
					align-items: flex-start;
					gap: 8rpx;
					
					.price-item {
						font-size: 30rpx;
						color: #c8cbd9;
						font-weight: 700;
						
						&.vip {
							background: linear-gradient(90deg, #F3BC63 0%, #FDE3B1 100%);
							-webkit-background-clip: text;
							-webkit-text-fill-color: transparent;
							background-clip: text;
						}
						
						&.share {
							color: #c8cbd9;
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
						color: #f5f5f7;
					}
					
					.route-arrow {
						font-size: 28rpx;
						color: #c8cbd9;
					}
				}
				
				.ticket-time {
					display: flex;
					gap: 20rpx;
					
					.time-departure, .time-arrival {
						font-size: 28rpx;
						color: #c8cbd9;
					}
				}
				
				.ticket-detail {
					display: flex;
					gap: 20rpx;
					
					.detail-text {
						font-size: 24rpx;
						color: #c8cbd9;
					}
				}
				
				.car-desc {
					font-size: 24rpx;
					color: #c8cbd9;
				}
				
				.car-price {
					display: flex;
					align-items: baseline;
					gap: 10rpx;
					
					.price-label {
						font-size: 24rpx;
						color: #c8cbd9;
					}
					
					.price-value {
						font-size: 36rpx;
						font-weight: bold;
						color: #f7d390;
					}
					
					.price-unit {
						font-size: 24rpx;
						color: #c8cbd9;
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
					color: #c8cbd9;
				}
				
				.price-value {
					font-size: 40rpx;
					font-weight: bold;
					color: #f7d390;
				}
				
				.price-unit {
					font-size: 24rpx;
					color: #c8cbd9;
				}
			}
		}
		
		.loading, .no-more {
			text-align: center;
			padding: 40rpx 0;
			font-size: 28rpx;
			color: #c8cbd9;
			}
		}
	}
</style>

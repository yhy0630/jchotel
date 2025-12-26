<template>
	<view class="destination-select">
		<custom-navbar title="打车"></custom-navbar>
		<!-- 搜索输入框 -->
		<view class="search-input">
			<view class="input-dot orange"></view>
			<input 
				class="input-field" 
				placeholder="您要去哪" 
				v-model="searchText"
				@input="handleSearch"
			/>
		</view>

		<!-- 目的地列表 / 城市列表 -->
		<scroll-view 
			scroll-y 
			class="destination-list"
			@scrolltolower="loadMoreCities"
			lower-threshold="120"
		>
			<view 
				v-for="(item, index) in cityListVisible" 
				:key="index"
				class="destination-item"
				@click="selectDestination(item)"
			>
				<view class="item-icon">🏢</view>
				<view class="item-content">
					<view class="item-name">{{ item.cityName || item.name }}</view>
					<view class="item-address">
						{{ item.address || item.provinceName || '' }}{{ item.addressDetail ? ' · ' + item.addressDetail : '' }}
					</view>
				</view>
				<view class="item-distance" v-if="item.distance">{{ item.distance }}</view>
			</view>
			<view class="load-text" v-if="citiesLoading">加载中...</view>
			<view class="load-text" v-else-if="citiesFinished && cityListVisible.length">已加载全部</view>
		</scroll-view>
	</view>
</template>

<script>
import { queryCities } from '@/api/taxi'

export default {
	data() {
		return {
			searchText: '',
			cityListAll: [],
			cityListFiltered: [],
			cityListVisible: [],
			citiesLoading: false,
			citiesFinished: false,
			pageSize: 40,
			pageNum: 1,
			currentLocation: {
				latitude: '',
				longitude: ''
			}
		}
	},
	onLoad() {
		this.loadCities()
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
				fail: () => {}
			})
		},
		handleSearch() {
			const keyword = (this.searchText || '').trim()
			if (!keyword) {
				this.cityListFiltered = [...this.cityListAll]
			} else {
				this.cityListFiltered = this.cityListAll.filter(
					(item) =>
						(item.cityName || '').includes(keyword) ||
						(item.firstChar || '').toUpperCase().includes(keyword.toUpperCase())
				)
			}
			this.resetPagination()
		},
		selectDestination(item) {
			// 先选城市，再在地图中选择精确位置
			uni.chooseLocation({
				success: (res) => {
					const destinationData = {
						name: res.name || item.cityName || item.name,
						address: res.address || item.address || item.cityName || item.name,
						cityId: item.cityId || '',
						cityName: item.cityName || '',
						longitude: String(res.longitude || item.longitude || this.currentLocation.longitude || ''),
						latitude: String(res.latitude || item.latitude || this.currentLocation.latitude || ''),
						addressDetail: res.name || item.addressDetail || ''
					}
					uni.setStorageSync('selectedDestination', destinationData)
					uni.navigateBack({
						delta: 1
					})
				},
				fail: () => {
					// chooseLocation 未声明或用户取消，兜底用城市或当前位置
					const destinationData = {
						name: item.cityName || item.name,
						address: item.address || item.cityName || item.name,
						cityId: item.cityId || '',
						cityName: item.cityName || '',
						longitude: String(item.longitude || this.currentLocation.longitude || ''),
						latitude: String(item.latitude || this.currentLocation.latitude || ''),
						addressDetail: item.addressDetail || ''
					}
					uni.setStorageSync('selectedDestination', destinationData)
					uni.showToast({
						title: (destinationData.longitude && destinationData.latitude) ? '已使用大致位置' : '已选择城市',
						icon: 'none'
					})
					uni.navigateBack({
						delta: 1
					})
				}
			})
		},
		async loadCities() {
			if (this.citiesLoading) return
			this.citiesLoading = true
			try {
				const res = await queryCities()
				if ((res.code === 0 || Array.isArray(res.data)) && Array.isArray(res.data)) {
					this.cityListAll = res.data
					this.cityListFiltered = [...res.data]
					this.resetPagination()
				} else {
					uni.showToast({
						title: res.msg || '获取城市列表失败',
						icon: 'none'
					})
				}
			} catch (error) {
				uni.showToast({
					title: '获取城市列表失败',
					icon: 'none'
				})
			} finally {
				this.citiesLoading = false
			}
		},
		resetPagination() {
			this.pageNum = 1
			this.citiesFinished = false
			this.cityListVisible = this.cityListFiltered.slice(0, this.pageSize)
			if (this.cityListVisible.length >= this.cityListFiltered.length) {
				this.citiesFinished = true
			}
		},
		loadMoreCities() {
			if (this.citiesFinished || this.citiesLoading) return
			this.pageNum += 1
			const next = this.cityListFiltered.slice(0, this.pageNum * this.pageSize)
			this.cityListVisible = next
			if (this.cityListVisible.length >= this.cityListFiltered.length) {
				this.citiesFinished = true
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.destination-select {
	width: 100%;
	height: 100vh;
	background: #0D1034;
	display: flex;
	flex-direction: column;
	padding-bottom: 20rpx;
	padding-top: calc(130rpx + var(--status-bar-height));
}

.navbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background: #1A1B3D;
	color: #fff;
}

.nav-left, .nav-right {
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

.search-input {
	display: flex;
	align-items: center;
	padding: 20rpx 28rpx;
	background: #121432;
	margin: 20rpx 24rpx 12rpx;
	border-radius: 14rpx;
}

.input-dot {
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	margin-right: 20rpx;
}

.input-dot.orange {
	background: #ff6b35;
}

.input-field {
	flex: 1;
	color: #fff;
	font-size: 28rpx;
}

.destination-list {
	flex: 1;
	margin: 0 24rpx 20rpx;
	padding: 0 20rpx;
	background: #121432;
	border-radius: 14rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.06);
}

.destination-item {
	display: flex;
	align-items: flex-start;
	padding: 28rpx 0;
	border-bottom: 1rpx solid #1f2142;
}

.item-icon {
	font-size: 32rpx;
	margin-right: 20rpx;
	margin-top: 5rpx;
	color: #fff;
}

.item-content {
	flex: 1;
}

.item-name {
	font-size: 30rpx;
	color: #f5f6fa;
	margin-bottom: 10rpx;
}

.item-address {
	font-size: 24rpx;
	color: #c6c8d4;
	line-height: 1.5;
}

.item-distance {
	font-size: 24rpx;
	color: #c6c8d4;
	margin-left: 20rpx;
}

.load-text {
	text-align: center;
	color: #c6c8d4;
	font-size: 24rpx;
	padding: 20rpx 0 24rpx;
}
</style>

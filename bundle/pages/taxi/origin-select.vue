<template>
	<view class="origin-select">
		<custom-navbar title="打车"></custom-navbar>
		<!-- 搜索输入框 -->
		<view class="search-input">
			<view class="input-dot green"></view>
			<input 
				class="input-field" 
				placeholder="请输入起点" 
				v-model="searchText"
				@input="handleSearch"
			/>
		</view>

		<!-- 地图 -->
		<view class="map-container" v-if="showMap">
			<map
				class="map"
				:latitude="mapCenter.latitude"
				:longitude="mapCenter.longitude"
				:scale="16"
				:markers="markers"
				:show-location="true"
				@regionchange="handleMapRegionChange"
				@tap="handleMapTap"
			/>
			<!-- 拖图提示 -->
			<view v-if="mapDragged" class="map-tip" @click="recenterMap">
				<text class="tip-text">您已拖图,点击可重新定位</text>
				<text class="tip-close" @click.stop="closeMapTip">×</text>
				<text class="tip-icon">◎</text>
			</view>
		</view>

		<!-- 起点/城市列表 -->
		<scroll-view 
			scroll-y 
			class="origin-list"
			@scrolltolower="loadMoreCities"
			lower-threshold="120"
		>
			<view 
				v-for="(item, index) in cityListVisible" 
				:key="index"
				class="origin-item"
				@click="selectOrigin(item)"
			>
				<view class="item-icon">📄</view>
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
			<view class="load-text" v-else-if="!cityListVisible.length && !citiesLoading">暂无城市数据</view>
		</scroll-view>
	</view>
</template>

<script>
import { queryCities } from '@/api/taxi'

export default {
	data() {
		return {
			searchText: '',
			showMap: true,
			mapDragged: false,
			mapCenter: {
				latitude: 39.908823,
				longitude: 116.39747
			},
			markers: [
				{
					id: 1,
					latitude: 39.908823,
					longitude: 116.39747,
					iconPath: '/static/images/dingwei 1.png',
					width: 30,
					height: 40
				}
			],
			// 城市列表（全量 + 当前展示）
			cityListAll: [],
			cityListFiltered: [],
			cityListVisible: [],
			citiesLoading: false,
			citiesFinished: false,
			pageSize: 40,
			pageNum: 1
		}
	},
	onLoad() {
		this.getCurrentLocation()
		this.loadCities()
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		handleSearch() {
			// 本地过滤城市，清空后回到全量
			const keyword = (this.searchText || '').trim()
			if (!keyword) {
				this.cityListFiltered = [...this.cityListAll]
			} else {
				this.cityListFiltered = this.cityListAll.filter(
					(item) => {
						const cityName = item.cityName || ''
						const firstChar = (item.firstChar || '').toUpperCase()
						const keywordUpper = keyword.toUpperCase()
						return cityName.includes(keyword) || firstChar.includes(keywordUpper)
					}
				)
			}
			this.resetPagination()
		},
		getCurrentLocation() {
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					this.mapCenter = {
						latitude: res.latitude,
						longitude: res.longitude
					}
					this.markers[0].latitude = res.latitude
					this.markers[0].longitude = res.longitude
				},
				fail: () => {
					uni.showToast({
						title: '获取位置失败，使用默认位置',
						icon: 'none'
					})
				}
			})
		},
		handleMapRegionChange(e) {
			if (e.type === 'end') {
				this.mapDragged = true
			}
		},
		handleMapTap(e) {
			// 点击地图时更新标记点
			const { latitude, longitude } = e.detail
			this.mapCenter = { latitude, longitude }
			this.markers[0].latitude = latitude
			this.markers[0].longitude = longitude
		},
		recenterMap() {
			this.mapDragged = false
			this.getCurrentLocation()
		},
		closeMapTip() {
			this.mapDragged = false
		},
		selectOrigin(item) {
			// 优先使用城市数据，再可选地图精确定位
			// 先判断是否需要调起地图选点，用户可选择是否精确定位
			uni.showModal({
				title: '选择位置',
				content: '是否需要在地图中精确定位？',
				success: (modalRes) => {
					if (modalRes.confirm) {
						// 用户确认，调起地图选点
						uni.chooseLocation({
							success: (res) => {
								// res: { name, address, latitude, longitude }
								const originData = {
									name: res.name || item.cityName || item.name,
									address: res.address || item.cityName || item.name,
									cityId: item.cityId || '',
									cityName: item.cityName || '',
									longitude: String(res.longitude || this.mapCenter.longitude || ''),
									latitude: String(res.latitude || this.mapCenter.latitude || ''),
									addressDetail: res.name || ''
								}
								uni.setStorageSync('selectedOrigin', originData)
								uni.showToast({
									title: '已选择精确位置',
									icon: 'success'
								})
								uni.navigateBack({
									delta: 1
								})
							},
							fail: (err) => {
								// 调起失败或用户取消，使用城市默认位置
								this.saveOriginData(item)
							}
						})
					} else {
						// 用户取消精确定位，直接使用城市数据
						this.saveOriginData(item)
					}
				}
			})
		},
		// 统一保存起点数据
		saveOriginData(item) {
			const originData = {
				name: item.cityName || item.name,
				address: item.cityName || item.name,
				cityId: item.cityId || '',
				cityName: item.cityName || '',
				longitude: String(item.longitude || this.mapCenter.longitude || ''),
				latitude: String(item.latitude || this.mapCenter.latitude || ''),
				addressDetail: ''
			}
			uni.setStorageSync('selectedOrigin', originData)
			uni.showToast({
				title: '已选择城市',
				icon: 'success'
			})
			uni.navigateBack({
				delta: 1
			})
		},
		async loadCities() {
			if (this.citiesLoading) return
			this.citiesLoading = true
			try {
				const res = await queryCities()
				// 修复：正确判断接口返回（code===0 且 data是数组）
				if (res && res.code === 0 && Array.isArray(res.data)) {
					this.cityListAll = res.data
					this.cityListFiltered = [...res.data]
					this.resetPagination()
				} else {
					uni.showToast({
						title: res?.msg || '获取城市列表失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('获取城市列表异常：', error)
				uni.showToast({
					title: '网络异常，获取城市失败',
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
			this.citiesFinished = this.cityListVisible.length >= this.cityListFiltered.length
		},
		loadMoreCities() {
			if (this.citiesFinished || this.citiesLoading) return
			this.pageNum += 1
			const endIndex = this.pageNum * this.pageSize
			const nextList = this.cityListFiltered.slice(0, endIndex)
			this.cityListVisible = nextList
			this.citiesFinished = this.cityListVisible.length >= this.cityListFiltered.length
		}
	}
}
</script>

<style lang="scss" scoped>
.origin-select {
	width: 100%;
	height: 100vh;
	background: #0D1038;
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

.input-dot.green {
	background: #4caf50;
}

.map-container {
	position: relative;
	width: 100%;
	height: 300rpx;
	margin: 0 24rpx 20rpx;
	border-radius: 14rpx;
	overflow: hidden;
	border: 1rpx solid rgba(255, 255, 255, 0.05);
}

.map {
	width: 100%;
	height: 100%;
}

.map-tip {
	position: absolute;
	bottom: 20rpx;
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

.input-field {
	flex: 1;
	color: #fff;
	font-size: 28rpx;
}

.origin-list {
	flex: 1;
	margin: 0 24rpx 20rpx;
	padding: 0 20rpx;
	background: #121432;
	border-radius: 14rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.06);
}

.origin-item {
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

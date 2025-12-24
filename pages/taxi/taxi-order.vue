<template>
	<view class="taxi-order">
		<!-- 导航栏 -->
		<view class="navbar">
			<view class="nav-left" @click="goBack">
				<text class="nav-icon">‹</text>
			</view>
			<view class="nav-title">打车</view>
			<view class="nav-right">
				<text class="nav-icon">⋯</text>
				<text class="nav-icon">◎</text>
			</view>
		</view>

		<!-- 服务切换 -->
		<view class="service-tabs">
			<view 
				:class="['tab-item', { active: serviceType === 'rent' }]"
				@click="switchService('rent')"
			>
				租车
			</view>
			<view 
				:class="['tab-item', { active: serviceType === 'taxi' }]"
				@click="switchService('taxi')"
			>
				打车
			</view>
		</view>

		<!-- 地图容器 -->
		<view class="map-container">
			<map
				:latitude="mapCenter.latitude"
				:longitude="mapCenter.longitude"
				:scale="16"
				:markers="markers"
				:show-location="true"
				class="map"
			></map>

			<!-- 地图定位按钮 -->
			<view class="map-locate" @click="locateMap">
				<text class="locate-icon">◎</text>
			</view>
		</view>

		<!-- 底部输入面板 -->
		<view class="input-panel">
			<!-- 起点 -->
			<view class="input-row" @click="selectOrigin">
				<view class="input-dot green"></view>
				<view class="input-content">
					<text class="input-label">从</text>
					<text class="input-value">{{ originText || '北京市大兴区国际机场' }}</text>
					<text class="input-suffix">上车</text>
				</view>
			</view>

			<!-- 目的地 -->
			<view class="input-row" @click="selectDestination">
				<view class="input-dot orange"></view>
				<input 
					class="input-field" 
					placeholder="您想去哪儿?" 
					v-model="destinationText"
					@focus="handleDestinationFocus"
				/>
			</view>

			<!-- 安全中心 -->
			<view class="safety-center">
				<view class="safety-icon">🛡✓</view>
				<text class="safety-text">安全中心</text>
			</view>

			<!-- 确认按钮 -->
			<button 
				class="confirm-btn" 
				@click="confirmRoute"
				:disabled="!originText || !destinationText"
			>
				确认路线并呼叫司机
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			serviceType: 'taxi', // rent-租车, taxi-打车
			originText: '北京市大兴区国际机场',
			destinationText: '',
			mapCenter: {
				latitude: 39.908823,
				longitude: 116.397470
			},
			markers: [
				{
					id: 1,
					latitude: 39.908823,
					longitude: 116.397470,
					iconPath: '/static/images/dingwei 1.png',
					width: 30,
					height: 40
				}
			]
		}
	},
	onLoad(options) {
		this.getCurrentLocation()
		// 接收从选择页面返回的数据
		if (options.origin) {
			this.originText = decodeURIComponent(options.origin)
		}
		if (options.destination) {
			this.destinationText = decodeURIComponent(options.destination)
		}
	},
	onShow() {
		// 从选择页面返回时更新数据
		const pages = getCurrentPages()
		const currentPage = pages[pages.length - 1]
		if (currentPage.$vm && currentPage.$vm.selectedOrigin) {
			this.originText = currentPage.$vm.selectedOrigin
		}
		if (currentPage.$vm && currentPage.$vm.selectedDestination) {
			this.destinationText = currentPage.$vm.selectedDestination
		}
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		switchService(type) {
			this.serviceType = type
		},
		selectOrigin() {
			uni.navigateTo({
				url: '/pages/taxi/origin-select'
			})
		},
		selectDestination() {
			uni.navigateTo({
				url: '/pages/taxi/destination-select'
			})
		},
		handleDestinationFocus() {
			this.selectDestination()
		},
		confirmRoute() {
			if (!this.originText || !this.destinationText) {
				uni.showToast({
					title: '请选择起点和目的地',
					icon: 'none'
				})
				return
			}

			// 确认路线，跳转到呼叫司机页面
			uni.navigateTo({
				url: `/pages/taxi/calling-driver?origin=${encodeURIComponent(this.originText)}&destination=${encodeURIComponent(this.destinationText)}`
			})
		},
		locateMap() {
			this.getCurrentLocation()
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
						title: '获取位置失败',
						icon: 'none'
					})
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.taxi-order {
	width: 100%;
	height: 100vh;
	background: #0D1038;
	display: flex;
	flex-direction: column;
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

.service-tabs {
	display: flex;
	padding: 20rpx 30rpx;
	background: #1A1B3D;
	gap: 20rpx;
}

.tab-item {
	flex: 1;
	height: 70rpx;
	line-height: 70rpx;
	text-align: center;
	border-radius: 35rpx;
	font-size: 28rpx;
	color: #999;
	background: #2A2B4D;
}

.tab-item.active {
	background: #FFB84D;
	color: #fff;
}

.map-container {
	position: relative;
	flex: 1;
	width: 100%;
}

.map {
	width: 100%;
	height: 100%;
}

.map-locate {
	position: absolute;
	right: 30rpx;
	bottom: 300rpx;
	width: 80rpx;
	height: 80rpx;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.locate-icon {
	font-size: 40rpx;
	color: #333;
}

.input-panel {
	background: #1A1B3D;
	padding: 30rpx;
	border-radius: 30rpx 30rpx 0 0;
}

.input-row {
	display: flex;
	align-items: center;
	padding: 25rpx 0;
	border-bottom: 1rpx solid #2A2B4D;
}

.input-row:last-of-type {
	border-bottom: none;
}

.input-dot {
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	margin-right: 20rpx;
}

.input-dot.green {
	background: #4CAF50;
}

.input-dot.orange {
	background: #FF6B35;
}

.input-content {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.input-label {
	font-size: 28rpx;
	color: #fff;
}

.input-value {
	flex: 1;
	font-size: 28rpx;
	color: #fff;
}

.input-suffix {
	font-size: 28rpx;
	color: #999;
}

.input-field {
	flex: 1;
	font-size: 28rpx;
	color: #fff;
}

.safety-center {
	display: flex;
	align-items: center;
	margin-top: 20rpx;
	gap: 15rpx;
}

.safety-icon {
	font-size: 32rpx;
}

.safety-text {
	font-size: 24rpx;
	color: #999;
}

.confirm-btn {
	width: 100%;
	height: 88rpx;
	background: #FF6B35;
	color: #fff;
	border-radius: 44rpx;
	font-size: 32rpx;
	border: none;
	margin-top: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.confirm-btn[disabled] {
	background: #2A2B4D;
	color: #666;
}
</style>

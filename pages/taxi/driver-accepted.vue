<template>
	<view class="driver-accepted">
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

		<!-- 地图容器 -->
		<view class="map-container">
			<map
				:latitude="mapCenter.latitude"
				:longitude="mapCenter.longitude"
				:scale="16"
				:markers="markers"
				:polyline="polyline"
				:show-location="true"
				class="map"
			></map>
		</view>

		<!-- 底部司机信息面板 -->
		<view class="driver-panel">
			<!-- 状态信息 -->
			<view class="status-header">
				<view class="status-title">{{ statusTitle }}</view>
				<view class="status-tip">{{ statusTip }}</view>
			</view>

			<!-- 车辆信息 -->
			<view class="vehicle-info">
				<view class="license-plate">冀R F19362</view>
				<view class="vehicle-desc">白色·比亚迪海豹</view>
			</view>

			<!-- 司机信息 -->
			<view class="driver-info">
				<view class="driver-name">王师傅·驾龄4年 5.0评分</view>
			</view>

			<!-- 操作按钮 -->
			<view class="action-buttons">
				<button class="btn-call" @click="callDriver">拨打电话</button>
				<view class="action-links">
					<view class="action-link" @click="callPolice">
						<text class="link-icon">💡</text>
						<text class="link-text">110报警</text>
					</view>
					<view class="action-link" @click="contactService">
						<text class="link-icon">📞</text>
						<text class="link-text">联系客服</text>
					</view>
					<view class="action-link" @click="showCancelDialog">
						<text class="link-icon">✕</text>
						<text class="link-text">取消订单</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 确认取消对话框 -->
		<view v-if="showCancelConfirm" class="cancel-dialog-mask" @click="hideCancelDialog">
			<view class="cancel-dialog" @click.stop>
				<view class="dialog-close" @click="hideCancelDialog">×</view>
				<view class="dialog-title">确定取消</view>
				<view class="dialog-content">
					司机正快马加鞭赶来,重新叫车需要等待更久,可以在等等吗?
				</view>
				<view class="dialog-buttons">
					<button class="btn-cancel" @click="confirmCancel">确认取消</button>
					<button class="btn-continue" @click="hideCancelDialog">暂不取消</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { queryDriverLocation, queryOrderStatus } from '@/api/taxi.js'

export default {
	data() {
		return {
			showCancelConfirm: false,
			orderId: '', // 订单ID
			pollingTimer: null, // 轮询定时器
			pollingInterval: 3000, // 轮询间隔3秒
			statusTitle: '特惠快车 司机正在赶来',
			statusTip: '司机正在努力赶来上车点,请您耐心等待',
			pickupLocation: {
				latitude: 39.908823,
				longitude: 116.397470
			},
			driverLocation: {
				latitude: 39.910000,
				longitude: 116.399000
			},
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
					height: 40,
					title: '上车点'
				},
				{
					id: 2,
					latitude: 39.910000,
					longitude: 116.399000,
					iconPath: '/static/images/dingwei 1.png',
					width: 30,
					height: 40,
					title: '司机位置'
				}
			],
			polyline: [
				{
					points: [
						{ latitude: 39.908823, longitude: 116.397470 },
						{ latitude: 39.910000, longitude: 116.399000 }
					],
					color: '#4CAF50',
					width: 5
				}
			],
			driverInfo: {
				name: '王师傅',
				phone: '13800138000',
				licensePlate: '冀R F19362',
				vehicle: '白色·比亚迪海豹',
				experience: '4年',
				rating: '5.0'
			}
		}
	},
	onLoad(options) {
		if (options.orderId) {
			this.orderId = options.orderId
		}
		this.getCurrentLocation()
		// 开始轮询司机位置和订单状态
		this.startTrackingDriver()
	},
	onUnload() {
		// 页面卸载时清除轮询
		this.stopPolling()
	},
	methods: {
		goBack() {
			this.stopPolling()
			uni.navigateBack()
		},
		getCurrentLocation() {
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					this.mapCenter = {
						latitude: res.latitude,
						longitude: res.longitude
					}
					this.pickupLocation = {
						latitude: res.latitude,
						longitude: res.longitude
					}
					// 更新上车点标记
					this.markers[0].latitude = res.latitude
					this.markers[0].longitude = res.longitude
				}
			})
		},
		// 开始轮询司机位置和订单状态
		startTrackingDriver() {
			if (!this.orderId) {
				console.warn('订单ID为空，无法开始追踪')
				return
			}
			
			// 设置轮询定时器
			this.pollingTimer = setInterval(() => {
				this.pollDriverLocation()
				this.pollOrderStatus()
			}, this.pollingInterval)
			
			// 立即执行一次
			this.pollDriverLocation()
			this.pollOrderStatus()
		},
		// 轮询司机位置
		async pollDriverLocation() {
			if (!this.orderId) {
				return
			}
			
			try {
				const res = await queryDriverLocation(this.orderId)
				if (res.code === 0 && res.data) {
					// 更新司机位置
					const location = res.data.location || res.data
					if (location.latitude && location.longitude) {
						this.driverLocation = {
							latitude: parseFloat(location.latitude),
							longitude: parseFloat(location.longitude)
						}
						
						// 更新司机标记位置
						this.markers[1].latitude = this.driverLocation.latitude
						this.markers[1].longitude = this.driverLocation.longitude
						
						// 更新路线
						this.polyline[0].points = [
							{ latitude: this.pickupLocation.latitude, longitude: this.pickupLocation.longitude },
							{ latitude: this.driverLocation.latitude, longitude: this.driverLocation.longitude }
						]
						
						// 更新地图中心点（可选：可以设置为司机和上车点的中点）
						this.mapCenter = {
							latitude: (this.pickupLocation.latitude + this.driverLocation.latitude) / 2,
							longitude: (this.pickupLocation.longitude + this.driverLocation.longitude) / 2
						}
					}
					
					// 更新司机信息（如果有）
					if (res.data.driverInfo) {
						Object.assign(this.driverInfo, res.data.driverInfo)
					}
				}
			} catch (error) {
				console.error('查询司机位置失败:', error)
				// 轮询失败不中断，继续下一次轮询
			}
		},
		// 轮询订单状态
		async pollOrderStatus() {
			if (!this.orderId) {
				return
			}
			
			try {
				const res = await queryOrderStatus(this.orderId)
				if (res.code === 0 && res.data) {
					const orderStatus = res.data.status
					
					// 如果订单已完成或取消，停止轮询
					if (orderStatus === 'COMPLETED' || orderStatus === 'CANCELLED' || orderStatus === 'FAILED') {
						this.stopPolling()
						
						if (orderStatus === 'COMPLETED') {
							uni.showToast({
								title: '行程已完成',
								icon: 'success'
							})
							// 可以跳转到评价页面
						} else {
							uni.showToast({
								title: '订单已取消',
								icon: 'none'
							})
						}
					}
					// 更新订单状态显示
					if (orderStatus === 'PICKED_UP') {
						// 司机已到达上车点
						this.statusTitle = '特惠快车 司机已到达上车点'
						this.statusTip = '请尽快前往上车点'
					} else if (orderStatus === 'ON_THE_WAY') {
						// 行程中
						this.statusTitle = '特惠快车 行程中'
						this.statusTip = '正在前往目的地'
					} else if (orderStatus === 'ARRIVED') {
						// 已到达目的地
						this.statusTitle = '特惠快车 已到达目的地'
						this.statusTip = '行程已完成'
					}
				}
			} catch (error) {
				console.error('查询订单状态失败:', error)
				// 轮询失败不中断，继续下一次轮询
			}
		},
		// 停止轮询
		stopPolling() {
			if (this.pollingTimer) {
				clearInterval(this.pollingTimer)
				this.pollingTimer = null
			}
		},
		callDriver() {
			uni.makePhoneCall({
				phoneNumber: this.driverInfo.phone,
				fail: (err) => {
					uni.showToast({
						title: '拨打电话失败',
						icon: 'none'
					})
				}
			})
		},
		callPolice() {
			uni.makePhoneCall({
				phoneNumber: '110',
				fail: (err) => {
					uni.showToast({
						title: '拨打失败',
						icon: 'none'
					})
				}
			})
		},
		contactService() {
			uni.showToast({
				title: '联系客服',
				icon: 'none'
			})
			// TODO: 跳转到客服页面或拨打客服电话
		},
		showCancelDialog() {
			this.showCancelConfirm = true
		},
		hideCancelDialog() {
			this.showCancelConfirm = false
		},
		confirmCancel() {
			this.stopPolling()
			this.hideCancelDialog()
			// 跳转到取消原因页面
			uni.navigateTo({
				url: `/pages/taxi/cancel-reason?orderId=${this.orderId}`
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.driver-accepted {
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

.map-container {
	flex: 1;
	width: 100%;
}

.map {
	width: 100%;
	height: 100%;
}

.driver-panel {
	background: #0D1038;
	padding: 30rpx;
	border-radius: 30rpx 30rpx 0 0;
}

.status-header {
	margin-bottom: 30rpx;
}

.status-title {
	font-size: 32rpx;
	font-weight: 500;
	color: #fff;
	margin-bottom: 10rpx;
}

.status-tip {
	font-size: 24rpx;
	color: #999;
	line-height: 1.5;
}

.vehicle-info {
	margin-bottom: 20rpx;
}

.license-plate {
	font-size: 48rpx;
	font-weight: 500;
	color: #fff;
	margin-bottom: 10rpx;
}

.vehicle-desc {
	font-size: 28rpx;
	color: #999;
}

.driver-info {
	margin-bottom: 30rpx;
}

.driver-name {
	font-size: 28rpx;
	color: #fff;
}

.action-buttons {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.btn-call {
	width: 100%;
	height: 88rpx;
	background: transparent;
	border: 1rpx solid #fff;
	color: #fff;
	border-radius: 44rpx;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.action-links {
	display: flex;
	justify-content: space-around;
	align-items: center;
}

.action-link {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10rpx;
}

.link-icon {
	font-size: 40rpx;
}

.link-text {
	font-size: 24rpx;
	color: #999;
}

.cancel-dialog-mask {
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

.cancel-dialog {
	width: 600rpx;
	background: #1A1B3D;
	border-radius: 20rpx;
	padding: 40rpx;
	position: relative;
}

.dialog-close {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	font-size: 48rpx;
	color: #fff;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dialog-title {
	font-size: 36rpx;
	font-weight: 500;
	color: #fff;
	margin-bottom: 30rpx;
	text-align: center;
}

.dialog-content {
	font-size: 28rpx;
	color: #fff;
	line-height: 1.6;
	margin-bottom: 40rpx;
	text-align: center;
}

.dialog-buttons {
	display: flex;
	gap: 20rpx;
}

.btn-cancel, .btn-continue {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	border-radius: 40rpx;
	font-size: 28rpx;
	border: none;
}

.btn-cancel {
	background: transparent;
	border: 1rpx solid #fff;
	color: #fff;
}

.btn-continue {
	background: #FFB84D;
	color: #fff;
}
</style>

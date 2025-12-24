<template>
	<view class="calling-driver">
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
				:show-location="true"
				class="map"
			></map>
		</view>

		<!-- 底部信息面板 -->
		<view class="info-panel">
			<!-- 搜索状态 -->
			<view class="search-status">
				<text class="status-text">正在为您全力寻找司机</text>
				<button class="cancel-btn" @click="showCancelDialog">取消用车</button>
			</view>

			<!-- 价格信息 -->
			<view class="price-info">
				<view class="price-row">
					<text class="price-item del">挂牌价 ¥333.2</text>
					<text class="price-item active">尊享价 ¥268.1</text>
					<text class="price-item">股东价 ¥133.2</text>
				</view>
				<view class="price-tip">已选2种车型,预估6.8-7.8元</view>
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
import { queryOrderStatus } from '@/api/taxi.js'

export default {
	data() {
		return {
			showCancelConfirm: false,
			orderId: '', // 订单ID
			pollingTimer: null, // 轮询定时器
			pollingInterval: 3000, // 轮询间隔3秒
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
		// 接收起点和目的地信息
		if (options.origin) {
			this.origin = decodeURIComponent(options.origin)
		}
		if (options.destination) {
			this.destination = decodeURIComponent(options.destination)
		}
		if (options.orderId) {
			this.orderId = options.orderId
		}
		this.startCallingDriver()
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
		startCallingDriver() {
			// 开始呼叫司机，调用后台接口
			// TODO: 调用创建订单API，获取orderId
			console.log('开始呼叫司机')
			
			// 如果已有订单ID，开始轮询订单状态
			if (this.orderId) {
				this.startPollingOrderStatus()
			} else {
				// 模拟创建订单后获取orderId
				// 实际应该调用创建订单接口
				this.orderId = 'test_order_' + Date.now()
				this.startPollingOrderStatus()
			}
		},
		// 开始轮询订单状态
		startPollingOrderStatus() {
			this.pollingTimer = setInterval(() => {
				this.checkOrderStatus()
			}, this.pollingInterval)
			
			// 立即执行一次
			this.checkOrderStatus()
		},
		// 检查订单状态
		async checkOrderStatus() {
			if (!this.orderId) {
				return
			}
			
			try {
				const res = await queryOrderStatus(this.orderId)
				if (res.code === 0 && res.data) {
					const orderStatus = res.data.status // 假设返回的状态字段
					
					// 如果订单已被接单，跳转到司机接单页面
					if (orderStatus === 'ACCEPTED' || orderStatus === 'DRIVER_ACCEPTED') {
						this.stopPolling()
						uni.redirectTo({
							url: `/pages/taxi/driver-accepted?orderId=${this.orderId}`
						})
					}
					// 如果订单被取消或失败，停止轮询
					else if (orderStatus === 'CANCELLED' || orderStatus === 'FAILED') {
						this.stopPolling()
						uni.showToast({
							title: '订单已取消',
							icon: 'none'
						})
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
.calling-driver {
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

.info-panel {
	background: #0D1038;
	padding: 30rpx;
	border-radius: 30rpx 30rpx 0 0;
}

.search-status {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 30rpx;
}

.status-text {
	font-size: 28rpx;
	color: #fff;
}

.cancel-btn {
	padding: 10rpx 30rpx;
	background: transparent;
	border: 1rpx solid #FF6B35;
	color: #FF6B35;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.price-info {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
}

.price-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.price-item {
	font-size: 24rpx;
	color: #999;
}

.price-item.del {
	text-decoration: line-through;
}

.price-item.active {
	color: #FFB84D;
	font-weight: 500;
}

.price-tip {
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

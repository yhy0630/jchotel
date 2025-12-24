<template>
	<view class="cancel-reason">
		<!-- 导航栏 -->
		<view class="navbar">
			<view class="nav-left" @click="goBack">
				<text class="nav-icon">‹</text>
			</view>
			<view class="nav-title">取消原因</view>
			<view class="nav-right">
				<text class="nav-icon">⋯</text>
				<text class="nav-icon">◎</text>
			</view>
		</view>

		<!-- 标题 -->
		<view class="header">
			<view class="header-title">行程取消成功</view>
			<view class="header-tip">请选择取消原因,我们将持续改善服务体验</view>
		</view>

		<!-- 取消原因列表 -->
		<scroll-view scroll-y class="reason-list">
			<!-- 平台相关 -->
			<view class="reason-category">
				<view class="category-bar"></view>
				<view class="category-title">平台相关</view>
			</view>
			<view 
				v-for="(item, index) in platformReasons" 
				:key="index"
				class="reason-item"
				@click="selectReason(item, 'platform')"
			>
				<view class="reason-text">{{ item }}</view>
				<view :class="['radio', { checked: selectedReason === item && selectedType === 'platform' }]"></view>
			</view>

			<!-- 司机相关 -->
			<view class="reason-category">
				<view class="category-bar"></view>
				<view class="category-title">司机相关</view>
			</view>
			<view 
				v-for="(item, index) in driverReasons" 
				:key="index"
				class="reason-item"
				@click="selectReason(item, 'driver')"
			>
				<view class="reason-text">{{ item }}</view>
				<view :class="['radio', { checked: selectedReason === item && selectedType === 'driver' }]"></view>
			</view>
		</scroll-view>

		<!-- 提交按钮 -->
		<view class="submit-bar">
			<button class="submit-btn" @click="submitReason" :disabled="!selectedReason">提交</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			selectedReason: '',
			selectedType: '',
			platformReasons: [
				'派单太远',
				'接我路程太堵',
				'推荐上车点不准确/找不到'
			],
			driverReasons: [
				'派单太远',
				'接我路程太堵',
				'推荐上车点不准确/找不到',
				'司机态度不好',
				'司机迟到',
				'司机取消订单'
			]
		}
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		selectReason(reason, type) {
			this.selectedReason = reason
			this.selectedType = type
		},
		submitReason() {
			if (!this.selectedReason) {
				uni.showToast({
					title: '请选择取消原因',
					icon: 'none'
				})
				return
			}

			// TODO: 提交取消原因到后台
			console.log('取消原因:', this.selectedReason, '类型:', this.selectedType)

			uni.showToast({
				title: '提交成功',
				icon: 'success'
			})

			// 返回首页或订单列表
			setTimeout(() => {
				uni.navigateBack({
					delta: 3 // 返回3层页面
				})
			}, 1500)
		}
	}
}
</script>

<style lang="scss" scoped>
.cancel-reason {
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
	color: #FFB84D;
}

.nav-icon {
	font-size: 48rpx;
	color: #fff;
}

.header {
	padding: 40rpx 30rpx;
}

.header-title {
	font-size: 48rpx;
	font-weight: 500;
	color: #fff;
	margin-bottom: 20rpx;
}

.header-tip {
	font-size: 24rpx;
	color: #999;
	line-height: 1.6;
}

.reason-list {
	flex: 1;
	padding: 0 30rpx;
}

.reason-category {
	display: flex;
	align-items: center;
	margin: 40rpx 0 20rpx 0;
	gap: 15rpx;
}

.category-bar {
	width: 6rpx;
	height: 30rpx;
	background: #FF6B35;
	border-radius: 3rpx;
}

.category-title {
	font-size: 28rpx;
	color: #FF6B35;
	font-weight: 500;
}

.reason-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 0;
	border-bottom: 1rpx solid #2A2B4D;
}

.reason-text {
	flex: 1;
	font-size: 28rpx;
	color: #fff;
}

.radio {
	width: 40rpx;
	height: 40rpx;
	border: 2rpx solid #666;
	border-radius: 50%;
	position: relative;
}

.radio.checked {
	border-color: #FFB84D;
}

.radio.checked::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 24rpx;
	height: 24rpx;
	background: #FFB84D;
	border-radius: 50%;
}

.submit-bar {
	padding: 30rpx;
	background: #1A1B3D;
}

.submit-btn {
	width: 100%;
	height: 88rpx;
	background: #FFB84D;
	color: #fff;
	border-radius: 44rpx;
	font-size: 32rpx;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
}

.submit-btn[disabled] {
	background: #2A2B4D;
	color: #666;
}
</style>


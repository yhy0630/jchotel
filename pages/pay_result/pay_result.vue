<template>
	<view class="pay-result-page">
		<!-- 支付成功标题 -->
		<view class="success-title">支付成功</view>
		
		<!-- 支付信息 -->
		<view class="pay-info">
			<text class="info-text">支付方式：{{payInfo.pay_way_text || '微信支付'}}</text>
			<text class="info-text" v-if="payInfo.pay_time">支付时间：{{formatPayTime(payInfo.pay_time)}}</text>
		</view>

		<!-- 操作按钮 -->
		<view class="action-buttons">
			<view class="btn btn-primary" @click="goToOrder">
				查看订单
			</view>
			<view class="btn btn-outline" @click="goToHome">
				返回首页
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getOrderDetail
	} from '@/api/order';
	import {
		orderDetail as getHotelOrderDetail
	} from '@/api/hotel';
	
	export default {
		data() {
			return {
				payInfo: {},
				from: '', // 订单来源: hotel-酒店订单; order-普通订单
				orderUrl: '/pages/user_order/user_order' // 查看订单的跳转地址
			};
		},

		onLoad: function(options) {
			this.id = options.id;
			this.from = options.from || 'order'; // 默认为普通订单
			// 根据订单来源设置查看订单的跳转地址
			if (this.from === 'hotel') {
				this.orderUrl = '/pages/hotel/order-list?status=1';
			} else if (this.from === 'flight') {
				// 飞机票订单跳转到统一订单列表页面
				this.orderUrl = '/pages/hotel/order-list?order_type=flight&status=1';
			} else if (this.from === 'train') {
				// 火车票订单跳转到统一订单列表页面
				this.orderUrl = '/pages/hotel/order-list?order_type=train&status=1';
			}
			this.getOrderResultFun();
		},

		methods: {
			getOrderResultFun() {
				// 根据订单来源调用不同的API
				if (this.from === 'hotel') {
					// 酒店订单
					getHotelOrderDetail({
						order_id: this.id
					}).then(res => {
						if (res.code == 1) {
							this.payInfo = {
								order_sn: res.data.order_sn || '',
								pay_time: res.data.pay_time || '',
								pay_way_text: res.data.pay_way_text || '余额支付',
								order_amount: res.data.amount_paid || res.data.amount_payable || 0
							}
						}
					}).catch(err => {
						console.error('获取酒店订单详情失败', err);
						// 如果获取失败，使用默认值
						this.payInfo = {
							pay_way_text: '余额支付',
							pay_time: new Date().toISOString().replace('T', ' ').substring(0, 19)
						}
					});
				} else if (this.from === 'flight' || this.from === 'train') {
					// 飞机票/火车票订单 - 使用统一的订单详情接口拉真实状态
					getOrderDetail({
						id: this.id,
						from: this.from
					}).then(res => {
						if (res.code == 1 && res.data) {
							this.payInfo = {
								order_sn: res.data.order_sn || '',
								pay_time: res.data.pay_time || new Date().toISOString().replace('T', ' ').substring(0, 19),
								pay_way_text: res.data.pay_way_text || '余额支付',
								order_amount: res.data.order_amount || res.data.total_price || 0
							}
						} else {
							this.payInfo = {
								pay_way_text: '余额支付',
								pay_time: new Date().toISOString().replace('T', ' ').substring(0, 19)
							}
						}
					}).catch(err => {
						console.error('获取订单详情失败', err);
						this.payInfo = {
							pay_way_text: '余额支付',
							pay_time: new Date().toISOString().replace('T', ' ').substring(0, 19)
						}
					})
				} else {
					// 普通订单
					getOrderDetail(this.id).then(res => {
						if (res.code == 1) {
							this.payInfo = res.data
						}
					}).catch(err => {
						console.error('获取订单详情失败', err);
						// 如果获取失败，使用默认值
						this.payInfo = {
							pay_way_text: '余额支付',
							pay_time: new Date().toISOString().replace('T', ' ').substring(0, 19)
						}
					});
				}
			},

			// 格式化支付时间
			formatPayTime(timeStr) {
				if (!timeStr) return '';
				let date;
				// 处理时间戳或字符串格式
				if (typeof timeStr === 'number') {
					// 如果是时间戳（秒），转换为毫秒
					date = new Date(timeStr * 1000);
				} else if (typeof timeStr === 'string') {
					// 如果是字符串，尝试解析
					// 如果已经是 YYYY-MM-DD HH:mm:ss 格式，直接转换
					if (timeStr.includes('-') && timeStr.includes(' ')) {
						date = new Date(timeStr.replace(/-/g, '/'));
					} else {
						date = new Date(timeStr);
					}
				} else {
					date = new Date(timeStr);
				}
				
				// 检查日期是否有效
				if (isNaN(date.getTime())) {
					return '';
				}
				
				// 将时间格式化为 2020.09.12 12:34 格式
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				return `${year}.${month}.${day} ${hours}:${minutes}`;
			},

			// 返回上一页
			goBack() {
				uni.navigateBack();
			},

			// 查看订单
			goToOrder() {
				uni.redirectTo({
					url: this.orderUrl
				});
			},

			// 返回首页
			goToHome() {
				uni.switchTab({
					url: '/pages/index/index'
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.pay-result-page {
		min-height: 100vh;
		background: #1E2139;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40rpx;
		padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
	}

	.success-title {
		font-size: 48rpx;
		font-weight: 500;
		color: #FFFFFF;
		margin-bottom: 60rpx;
		text-align: center;
	}

	.pay-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
		margin-bottom: 80rpx;

		.info-text {
			font-size: 28rpx;
			color: #FFFFFF;
			text-align: center;
			line-height: 1.6;
		}
	}

	.action-buttons {
		width: 100%;
		max-width: 540rpx;
		display: flex;
		flex-direction: column;
		gap: 30rpx;
	}

	.btn {
		width: 100%;
		height: 88rpx;
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 500;
		background: transparent;
		border: 2rpx solid #FCDDA6;
		color: #FCDDA6;
		transition: all 0.3s;

		&:active {
			background: linear-gradient(90deg, #F4C06D 0%, #FCDFA9 50.11%, #F4BF6A 100%);
			color: #333333;
			border-color: transparent;
		}
	}
</style>

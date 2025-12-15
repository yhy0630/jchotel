// +----------------------------------------------------------------------
// | likeshop开源商城系统
// +----------------------------------------------------------------------
// | 欢迎阅读学习系统程序代码，建议反馈是我们前进的动力
// | gitee下载：https://gitee.com/likeshop_gitee
// | github下载：https://github.com/likeshop-github
// | 访问官网：https://www.likeshop.cn
// | 访问社区：https://home.likeshop.cn
// | 访问手册：http://doc.likeshop.cn
// | 微信公众号：likeshop技术社区
// | likeshop系列产品在gitee、github等公开渠道开源版本可免费商用，未经许可不能去除前后端官方版权标识
// |  likeshop系列产品收费版本务必购买商业授权，购买去版权授权后，方可去除前后端官方版权标识
// | 禁止对系统程序代码以任何目的，任何形式的再发布
// | likeshop团队版权所有并拥有最终解释权
// +----------------------------------------------------------------------
// | author: likeshop.cn.team
// +----------------------------------------------------------------------

<template>
	<view class="pay-result-page">
		<!-- 导航栏 -->
		<view class="navbar">
			<view class="navbar-left" @click="goBack">
				<text class="icon-back">‹</text>
			</view>
			<view class="navbar-title">支付结果</view>
			<view class="navbar-right">
				<text class="icon-more">⋯</text>
				<text class="icon-circle">○</text>
			</view>
		</view>

		<!-- 主要内容 -->
		<view class="content">
			<!-- 支付成功标题 -->
			<view class="success-title">支付成功</view>
			
			<!-- 支付信息 -->
			<view class="pay-info">
				<view class="info-item">
					<text class="info-label">支付方式</text>
					<text class="info-value">{{payInfo.pay_way_text || '余额支付'}}</text>
				</view>
				<view class="info-item" v-if="payInfo.pay_time">
					<text class="info-label">支付时间</text>
					<text class="info-value">{{formatPayTime(payInfo.pay_time)}}</text>
				</view>
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
					// 飞机票/火车票订单 - 使用统一的订单API
					// 这里可以调用统一的订单详情接口
					this.payInfo = {
						pay_way_text: '余额支付',
						pay_time: new Date().toISOString().replace('T', ' ').substring(0, 19)
					}
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
		background: linear-gradient(180deg, #1a1f3a 0%, #0f1424 100%);
		color: #ffffff;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 88rpx;
		padding: 0 30rpx;
		position: relative;

		.navbar-left {
			width: 60rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			.icon-back {
				font-size: 48rpx;
				color: #ffffff;
				line-height: 1;
			}
		}

		.navbar-title {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			font-size: 36rpx;
			font-weight: 500;
			color: #FFA500;
		}

		.navbar-right {
			display: flex;
			align-items: center;
			gap: 20rpx;

			.icon-more,
			.icon-circle {
				width: 40rpx;
				height: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 32rpx;
				color: #ffffff;
			}
		}
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 120rpx 40rpx 80rpx;
		min-height: calc(100vh - 88rpx);
	}

	.success-title {
		font-size: 64rpx;
		font-weight: 600;
		color: #ffffff;
		margin-bottom: 100rpx;
		text-align: center;
	}

	.pay-info {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 40rpx;
		margin-bottom: 120rpx;

		.info-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 28rpx;

			.info-label {
				color: rgba(255, 255, 255, 0.8);
			}

			.info-value {
				color: #ffffff;
				font-weight: 500;
			}
		}
	}

	.action-buttons {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 30rpx;
		margin-top: auto;
	}

	.btn {
		width: 100%;
		height: 88rpx;
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		font-weight: 500;
		transition: all 0.3s;

		&.btn-primary {
			background: linear-gradient(270deg, #FFA500 0%, #FF8C00 100%);
			color: #ffffff;
			box-shadow: 0 8rpx 24rpx rgba(255, 165, 0, 0.3);

			&:active {
				opacity: 0.8;
				transform: scale(0.98);
			}
		}

		&.btn-outline {
			background: transparent;
			border: 2rpx solid #FFA500;
			color: #FFA500;

			&:active {
				background: rgba(255, 165, 0, 0.1);
			}
		}
	}
</style>

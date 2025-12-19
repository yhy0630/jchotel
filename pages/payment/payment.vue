<template>
	<view class="payment-pages">
		<view class="payment u-skeleton">
			<!-- Header -->
			<view class="payment-header">
				<view class="amount-display">
					<text class="amount-symbol">¥</text>
					<text class="amount-value">{{ formatAmount(amount) }}</text>
				</view>
				<view class="amount-detail">
					<text>机票订单 详情</text>
					<text class="detail-arrow">∨</text>
				</view>
			</view>

			<!-- Main -->
			<view class="payment-main">
				<view class="payway-container u-skeleton-fillet">
					<!-- Payway -->
					<view class="payway">
						<view :class="['payway-item', {'payway-item-selected': payway === item.pay_way}]" v-for="(item, index) in paywayList" :key="item.id"
							@click="changePayway(item.pay_way)">
							<u-image :src="item.icon" width="48" height="48" mode="scaleToFill" />
							<view class="payway-item-content">
								<text class="payway-item-content-name">{{ item.name }}</text>
							</view>
							<image v-if="payway === item.pay_way" class="check-icon" src="/static/images/编组 4.png" mode="aspectFit"></image>
							<image v-else class="check-icon" src="/static/images/椭圆形备份@3x.png" mode="aspectFit"></image>
						</view>
					</view>
					<template v-if="!paywayList.length">
						<view class="payway-empty">暂无支付方式</view>
					</template>
				</view>
			</view>

			<!-- Footer -->
			<view class="payment-footer u-skeleton-fillet">
				<view :class="['payment-submit', {'payment-submit--disabled': loadingPay}]" @tap="handlePrepay">
					<u-loading mode="circle" :show="loadingPay" />
					<text v-show="!loadingPay">支付 ¥{{ formatAmount(amount) }}</text>
				</view>
			</view>

		</view>

		<u-skeleton :loading="loadingSkeleton" :animation="true" bgColor="#0D1034" />
	</view>

</template>


<script>
	/**
	 * @description 支付页面
	 * @query {String} from 订单来源: order-商品订单; recharge-充值订单;
	 * @query {Number} order_id	订单ID
	 */
	import {
		prepay,
		getPayway
	} from '@/api/app'
	import { getOrderDetail } from '@/api/order'
	import {
		wxpay,
		alipay
	} from '@/utils/pay'

	export default {
		name: 'Payment',

		data() {
			return {
				from: '', // 订单来源
				order_id: '', // 订单ID
				amount: 0, // 支付金额
				timeout: 0, // 倒计时间戳
				payway: '', // 支付方式
				paywayList: [], // 支付方式列表

				loadingSkeleton: true, // 骨架屏Loading
				loadingPay: false, // 支付处理中Loading
				payResult: 'pending', // 支付结果: pending-待处理, success-成功, fail-失败
			}
		},

		methods: {
			// 格式化金额
			formatAmount(amount) {
				if (!amount && amount !== 0) return '0.00'
				const num = typeof amount === 'number' ? amount : parseFloat(amount)
				return num.toFixed(2)
			},
			
			// 更改支付方式
			changePayway(value) {
				this.$set(this, 'payway', value)
			},

			// 初始化页面数据
			initPageData() {
				// 获取支付方式
				getPayway({
					from: this.from,
					order_id: this.order_id,
				}).then(res => {
					// 如果订单已支付（code === 10000），直接跳转到支付成功页面
					if (res.code === 10000) {
						this.loadingSkeleton = false
						uni.showToast({ title: '订单已支付，无需重复支付', icon: 'none' })
						setTimeout(() => {
							this.handPayResult('success')
						}, 1500)
						return
					}
					if (res.code != 1) throw new Error(res.msg)
					return res.data
				}).then(data => {
					if (!data) return
					this.loadingSkeleton = false
					this.amount = data.order_amount
					this.paywayList = data.pay
					this.payway = this.paywayList[0]?.pay_way
					// 倒计时
					const startTimestamp = new Date().getTime() / 1000
					const endTimestamp = data.cancel_time * 1
					this.timeout = endTimestamp - startTimestamp
				}).catch(err => {
					console.error('获取支付信息失败:', err)
					this.loadingSkeleton = false
					uni.showToast({ title: err.message || '获取支付信息失败', icon: 'none' })
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				})
			},

			// 预支付处理
			handlePrepay() {
				if (this.loadingPay) return
				this.loadingPay = true
				// 支付前再查一次订单状态，避免已支付/已失效重复发起
				getOrderDetail({
					id: this.order_id,
					from: this.from
				}).then(res => {
					if (res.code === 1 && res.data) {
						const data = res.data
						if (data.pay_status == 1 || data.status != 0) {
							uni.showToast({ title: '订单已支付或状态已变更', icon: 'none' })
							this.handPayResult('success')
							throw new Error('订单已支付或状态已变更')
						}
					}
					return prepay({
						from: this.from,
						order_id: this.order_id,
						pay_way: this.payway,
					})
				}).then(({
					code,
					data
				}) => {
					switch (code) {
						case 1:
							this.handleWechatPay(data);
							break;
						case 10001:
							this.handleAlipayPay(data);
							break;
						case 20001:
							this.handleWalletPay();
							break;
					}
				}).catch(err => {
					console.error('预支付失败:', err)
					uni.showToast({ title: err?.message || '预支付失败', icon: 'none' })
				}).finally(() => {
					setTimeout(() => {
						this.loadingPay = false
					}, 500)
				})
			},

			// 微信支付
			handleWechatPay(data) {
				wxpay(data).then(res => {
					console.log(res)
					this.handPayResult(res)
				})
			},

			// 支付宝支付
			handleAlipayPay(data) {
				alipay(data).then(res => {
					console.log(res)
					this.handPayResult(res)
				})
			},

			// 钱包余额支付
			handleWalletPay() {
				console.log('支付成功')
				//余额支付成功，跳转到支付成功页面
				this.handPayResult('success')
			},

			// 支付后处理
			handPayResult(result) {
				if (result === 'success') {
					// 防止重复跳转
					if (this.payResult === 'success') return
					this.payResult = 'success'
					
					// 发送支付成功事件
					uni.$emit('payment', {
						result: true,
						order_id: this.order_id,
						from: this.from
					})
					
					// 跳转到支付成功页面
					uni.redirectTo({
						url: `/pages/pay_result/pay_result?id=${this.order_id}&from=${this.from}`
					})
				} else if (result === 'fail') {
					if (this.payResult === 'pending') {
						this.payResult = 'fail'
						uni.$emit('payment', {
							result: false,
							order_id: this.order_id,
							from: this.from
						})
						uni.navigateBack()
					}
				}
			}
		},

		onLoad(options) {
			const from = options.from
			const order_id = options.order_id

			try {
				if (!from && !order_id) throw new Error('页面参数有误')
				this.from = from
				this.order_id = order_id
				this.initPageData()
			} catch (err) {
				console.log(err)
				uni.navigateBack()
			}
		},

		onUnload() {
			// 如果支付结果还是pending状态，说明用户离开了支付页面，标记为失败
			if (this.payResult === 'pending') {
				this.handPayResult('fail')
			}
		},
	}
</script>


<style lang="scss">
	page {
		height: 100%;
		padding: 0;
		background: #0D1034;
	}

	.payment-pages {
		height: 100%;
		background: #0D1034;

		.payment {
			display: flex;
			flex-direction: column;
			height: calc(100% - env(safe-area-inset-bottom));
			background: #0D1034;

			&-header {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				padding: 60rpx 0 40rpx 0;
				background: #0D1034;
				color: #FFFFFF;
				
				.amount-display {
					display: flex;
					align-items: baseline;
					margin-bottom: 20rpx;
					
					.amount-symbol {
						font-size: 40rpx;
						color: #FFFFFF;
						margin-right: 10rpx;
					}
					
					.amount-value {
						font-size: 60rpx;
						font-weight: bold;
						color: #FFFFFF;
					}
				}
				
				.amount-detail {
					display: flex;
					align-items: center;
					font-size: 28rpx;
					color: #FFFFFF;
					gap: 10rpx;
					
					.detail-arrow {
						font-size: 24rpx;
					}
				}
			}

			&-main {
				flex: 1;
				padding: 20rpx;
				overflow: hidden;
			}

			&-footer {
				display: flex;
				align-items: center;
				padding: 20rpx;
				background: #0D1034;
			}

			.payway-container {
				padding: 0;
				border-radius: 12rpx;
				background: transparent;

				.payway-empty {
					display: flex;
					justify-content: center;
					padding: 20rpx 0;
					font-size: 26rpx;
					color: #999;
				}
			}

			.payway {
				width: 100%;

				&-item {
					width: 100%;
					display: flex;
					align-items: center;
					padding: 30rpx;
					margin-bottom: 20rpx;
					background: #4A4A5E;
					border-radius: 12rpx;
					border: 2rpx solid #4A4A5E;

					&-content {
						flex: 1;
						display: flex;
						flex-direction: column;
						margin-left: 20rpx;

						&-name {
							font-size: 28rpx;
							color: #FFFFFF;
						}
					}
					
					.check-icon {
						width: 48rpx;
						height: 48rpx;
					}
					
					&-selected {
						background: #353548;
						border-color: #FCDDA6;
						
						.payway-item-content-name {
							color: #FCDDA6;
						}
					}
				}
			}

			&-submit {
				flex: 1;
				position: relative;
				display: flex;
				justify-content: center;
				align-items: center;
				height: 88rpx;
				font-size: 28rpx;
				border-radius: 44rpx;
				background: linear-gradient(90deg, #F4BD65 0%, #FEE3B0 49.83%, #F3BD65 100%);
				color: #000000;

				&--disabled::before {
					position: absolute;
					top: 0;
					bottom: 0;
					left: 0;
					right: 0;
					height: 100%;
					display: block;
					content: "";
					background: rgba(255, 255, 255, .3) !important;
				}
			}

		}
	}
</style>

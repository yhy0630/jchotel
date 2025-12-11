<template>
	<view class="data-list-container" :style="{ backgroundColor: containerBgColor }">
		<!-- 数据总览区域 -->
		<view class="data-header">
			<image class="bg-image" :src="headerBgImage" mode="aspectFill"></image>
			<view class="header-content">
				<view class="title">{{ headerTitle }}</view>
				<view class="data-value">
					<text class="number">{{ mainValue }}</text>
					<text class="unit">{{ mainUnit }}</text>
				</view>
			</view>
		</view>

		<!-- 数据明细列表 -->
		<view class="data-list" :style="{ backgroundColor: listBgColor }">
			<view class="list-title">{{ listTitle }}</view>
			<view class="list-content">
				<view 
					v-for="(item, index) in dataList" 
					:key="'item-' + index + '-' + item.title" 
					class="list-item"
				>
					<view class="item-left">
						<view class="item-title">
							{{ item.title }}
							<u-icon name="arrow-right" size="24" color="#999"></u-icon>
						</view>
						<view class="item-time">{{ item.time }}</view>
					</view>
					<view :class="['item-right', getItemClass(item.value)]">
						{{ formatValue(item.value) }}
					</view>
				</view>
				
				<!-- 加载完成提示 -->
				<view v-if="!hasMore && dataList.length > 0" class="load-more">
					{{ loadMoreText }}
				</view>
				
				<!-- 空状态 -->
				<view v-if="dataList.length === 0" class="empty-state">
					<text>{{ emptyText }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'DataListCard',
	props: {
		// 容器背景颜色
		containerBgColor: {
			type: String,
			default: '#0D1038'
		},
		// 头部背景图
		headerBgImage: {
			type: String,
			required: true
		},
		// 头部标题
		headerTitle: {
			type: String,
			required: true
		},
		// 主要数值
		mainValue: {
			type: [String, Number],
			required: true
		},
		// 主要数值单位
		mainUnit: {
			type: String,
			default: '积分'
		},
		// 列表标题
		listTitle: {
			type: String,
			default: '明细'
		},
		// 数据列表
		dataList: {
			type: Array,
			default: () => []
		},
		// 是否还有更多数据
		hasMore: {
			type: Boolean,
			default: false
		},
		// 加载完成文本
		loadMoreText: {
			type: String,
			default: '已经到底啦~'
		},
		// 空状态文本
		emptyText: {
			type: String,
			default: '暂无记录'
		},
		// 列表背景颜色
		listBgColor: {
			type: String,
			default: '#1F2034'
		},
		// 正值颜色
		positiveColor: {
			type: String,
			default: '#FFE3BB'
		},
		// 负值颜色
		negativeColor: {
			type: String,
			default: '#FFFFFF'
		},
		// 值的格式化方式 (none: 不格式化, number: 数字, percent: 百分比)
		valueFormat: {
			type: String,
			default: 'none'
		},
		// 值的后缀
		valueSuffix: {
			type: String,
			default: '积分'
		}
	},
	computed: {
		dataListLength() {
			return Array.isArray(this.dataList) ? this.dataList.length : 0
		}
	},
	mounted() {
		console.log('DataListCard mounted，dataList:', this.dataList)
	},
	watch: {
		dataList: {
			handler(newVal) {
				console.log('DataListCard 接收到的 dataList:', newVal)
			},
			deep: true
		}
	},
	methods: {
		// 获取列表项的样式类
		getItemClass(value) {
			if (typeof value === 'number') {
				return value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'
			}
			return 'neutral'
		},
		// 格式化数值
		formatValue(value) {
			let formatted = value
			
			if (this.valueFormat === 'number') {
				formatted = Number(value).toFixed(2)
			} else if (this.valueFormat === 'percent') {
				formatted = (Number(value) * 100).toFixed(2) + '%'
			} else {
				// 默认情况下，如果是数字就转换为字符串
				formatted = String(value)
			}
			
			// 添加正负号
			if (typeof value === 'number' && value > 0) {
				formatted = '+' + formatted
			}
			
			return formatted + this.valueSuffix
		}
	}
}
</script>

<style lang="scss" scoped>
.data-list-container {
	min-height: 100vh;
	padding-top: 20rpx;
}

.data-header {
	position: relative;
	width: calc(100% - 60rpx);
	height: 240rpx;
	overflow: hidden;
	margin: 20rpx 30rpx 30rpx 30rpx;
	border-radius: 20rpx;
	
	.bg-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 20rpx;
	}
	
	.header-content {
		position: relative;
		z-index: 1;
		padding: 30rpx;
		
		.title {
			font-size: 32rpx;
			color: #333333;
			margin-bottom: 20rpx;
		}
		
		.data-value {
			display: flex;
			align-items: baseline;
			
			.number {
				font-size: 72rpx;
				font-weight: bold;
				color: #333333;
			}
			
			.unit {
				font-size: 28rpx;
				color: #333333;
				margin-left: 10rpx;
			}
		}
	}
}

.data-list {
	border-radius: 20rpx;
	margin: 0 30rpx 30rpx 30rpx;
	position: relative;
	z-index: 2;
	padding-bottom: 20rpx;
	
	.list-title {
		padding: 30rpx 30rpx 20rpx;
		font-size: 32rpx;
		font-weight: bold;
		color: #FFFFFF;
	}
	
	.list-content {
		padding: 0 30rpx 20rpx;
		
		.list-item {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			padding: 30rpx 0;
			border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
			min-height: 80rpx;
			width: 100%;
			box-sizing: border-box;
			
			.item-left {
				flex: 1;
				min-width: 0;
				
				.item-title {
					font-size: 28rpx;
					color: #FFFFFF;
					margin-bottom: 10rpx;
					display: flex;
					align-items: center;
					word-break: break-all;
				}
				
				.item-time {
					font-size: 24rpx;
					color: #999999;
				}
			}
			
			.item-right {
				font-size: 28rpx;
				font-weight: bold;
				margin-left: 20rpx;
				white-space: nowrap;
				flex-shrink: 0;
				color: #FFFFFF;
				
				&.positive {
					color: #FFE3BB;
				}
				
				&.negative {
					color: #FFFFFF;
				}
				
				&.neutral {
					color: #FFFFFF;
				}
			}
		}
		
		.load-more {
			text-align: center;
			padding: 40rpx 0;
			font-size: 24rpx;
			color: #999999;
		}
		
		.empty-state {
			text-align: center;
			padding: 100rpx 0;
			font-size: 28rpx;
			color: #999999;
		}
	}
}
</style>

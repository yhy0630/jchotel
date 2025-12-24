<template>
	<view class="page">
		<custom-navbar title="我的积分"></custom-navbar>
		<DataListCard
			v-if="dataListReady"
			:containerBgColor="'#0D1038'"
			:headerBgImage="headerBgImage"
			:headerTitle="'我的积分'"
			:mainValue="totalPoints"
			:mainUnit="'积分'"
			:listTitle="'积分明细'"
			:dataList="formattedPointsList"
			:hasMore="hasMore"
			:loadMoreText="'已经到底啦~'"
			:emptyText="'暂无积分记录'"
			:listBgColor="'#1F2034'"
			:positiveColor="'#FFE3BB'"
			:negativeColor="'#FFFFFF'"
			:valueSuffix="'积分'"
		/>
	</view>
</template>

<script>
import DataListCard from '@/components/DataListCard.vue'
import config from '@/config/app.js'

export default {
	components: {
		DataListCard
	},
	data() {
		return {
			totalPoints: 0,
			pointsList: [],
			page: 1,
			pageSize: 20,
			hasMore: true,
			dataListReady: false
		}
	},
	computed: {
		// 格式化积分列表数据，转换为组件所需的格式
		formattedPointsList() {
			return this.pointsList.map(item => ({
				title: item.title,
				time: item.create_time,
				value: item.points
			}))
		},
		headerBgImage() {
			return config.baseURL + '/uploads/images/images/Group 1171275124.png'
		}
	},
	onLoad() {
		this.getTotalPoints()
		this.getPointsList().then(() => {
			console.log('积分列表加载完成:', this.pointsList)
			console.log('格式化后的列表:', this.formattedPointsList)
			this.$nextTick(() => {
				console.log('nextTick后的列表:', this.formattedPointsList)
				this.dataListReady = true
			})
		})
	},
	onReachBottom() {
		if (this.hasMore) {
			this.page++
			this.getPointsList()
		}
	},
	onPullDownRefresh() {
		this.page = 1
		this.pointsList = []
		this.hasMore = true
		this.getTotalPoints()
		this.getPointsList().then(() => {
			uni.stopPullDownRefresh()
		})
	},
	methods: {
		// 获取总积分
		getTotalPoints() {
			// TODO: 调用API获取总积分
			// 示例数据
			this.totalPoints = 49185
		},
		// 获取积分明细列表
		getPointsList() {
			return new Promise((resolve) => {
				// TODO: 调用API获取积分明细
				// 示例数据
				const mockData = [
					{
						title: '积分来源名称',
						create_time: '2022-12-04 03:59:25',
						points: 24
					},
					{
						title: '积分来源名称',
						create_time: '2022-12-04 03:59:25',
						points: 0.1
					},
					{
						title: '积分来源名称',
						create_time: '2022-12-04 03:59:25',
						points: -0.1
					},
					{
						title: '积分来源名称',
						create_time: '2022-12-04 03:59:25',
						points: -0.1
					},
					{
						title: '积分来源名称',
						create_time: '2022-12-04 03:59:25',
						points: -0.1
					}
				]
				
				if (this.page === 1) {
					this.pointsList = mockData
				} else {
					this.pointsList = [...this.pointsList, ...mockData]
				}
				
				// 判断是否还有更多数据
				if (mockData.length < this.pageSize) {
					this.hasMore = false
				}
				
				resolve()
			})
		}
	}
}
</script>
<style lang="css">
	.page{
		padding-top: calc(130rpx + var(--status-bar-height));
	}
</style>

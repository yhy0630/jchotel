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
import { getIntegralList, getUser } from '@/api/user.js'

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
		async getTotalPoints() {
			try {
				const res = await getIntegralList({
					page_no: 1,
					page_size: 1
				})
				if (res.code === 1) {
					this.totalPoints = res.data.total_integral || 0
				}
			} catch (e) {
				console.error('获取总积分失败:', e)
				// 如果接口失败，尝试从用户信息获取
				try {
					const userRes = await getUser()
					if (userRes.code === 1 && userRes.data) {
						this.totalPoints = userRes.data.user_integral || 0
					}
				} catch (err) {
					console.error('获取用户信息失败:', err)
				}
			}
		},
		// 获取积分明细列表
		async getPointsList() {
			try {
				const res = await getIntegralList({
					page_no: this.page,
					page_size: this.pageSize,
					type: 0 // 0:全部, 1:增加, 2:减少
				})
				
				if (res.code === 1 && res.data) {
					const list = res.data.list || []
					
					// 格式化数据
					const formattedList = list.map(item => ({
						title: item.source_type_desc || '积分变动',
						create_time: item.create_time || '',
						points: item.change_amount || 0,
						change_type: item.change_type || 1, // 1:增加, 2:减少
						order_sn: item.order_sn || '',
						remark: item.remark || ''
					}))
					
					if (this.page === 1) {
						this.pointsList = formattedList
					} else {
						this.pointsList = [...this.pointsList, ...formattedList]
					}
					
					// 更新总积分
					if (res.data.total_integral !== undefined) {
						this.totalPoints = res.data.total_integral
					}
					
					// 判断是否还有更多数据
					this.hasMore = res.data.more || false
					
					return Promise.resolve()
				} else {
					uni.showToast({
						title: res.msg || '获取积分列表失败',
						icon: 'none'
					})
					return Promise.reject(res.msg || '获取积分列表失败')
				}
			} catch (e) {
				console.error('获取积分列表失败:', e)
				uni.showToast({
					title: '获取积分列表失败',
					icon: 'none'
				})
				return Promise.reject(e)
			}
		}
	}
}
</script>
<style lang="css">
	.page{
		padding-top: calc(130rpx + var(--status-bar-height));
	}
</style>

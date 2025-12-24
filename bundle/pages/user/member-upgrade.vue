<template>
  <view class="page-container">
    <view class="member-selector-wrap">
      <view class="member-selector">
        <view 
          class="selector-item" 
          :class="{'active': memberType === 'personal'}"
          @click="switchMemberType('personal')"
        >
          <text>个人会员</text>
        </view>
        <view 
          class="selector-item" 
          :class="{'active': memberType === 'enterprise'}"
          @click="switchMemberType('enterprise')"
        >
          <text>企业会员</text>
        </view>
      </view>
    </view>
    <view class="member-title">会员权益</view>
    <view class="table-wrap">
    <view v-for="(group,gIndex) in currentGroups" :key="group.label" class="table" :class="{'table-split': gIndex>0}">
      <!-- 左侧纵向合并列 -->
      <view class="side cell">
        <view class="side-inner">
          <text v-for="(ch,i) in chars(group.label)" :key="i">{{ ch }}</text>
        </view>
      </view>

      <!-- 右侧主体 -->
      <view class="main">
        <view class="row header">
          <view class="cell level"><text>{{ memberType === 'enterprise' ? '等级' : '级别' }}</text></view>
          <view class="cell benefit"><text>会员权益</text></view>
          <view class="cell fee"><text>年费</text></view>
          <view class="cell action"><text>获取方式</text></view>
        </view>

        <view v-for="(item,idx) in group.levels" :key="idx" class="row body">
          <view class="cell level"><text>{{ item.name }}</text></view>
          <view class="cell benefit">
            <text class="benefit-text">{{ item.benefit }}</text>
          </view>
          <view class="cell fee"><text>{{ item.fee }}</text></view>
          <view class="cell action">
            <text class="action-text">{{ item.action }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
  </view>
</template>

<script>
import { getMemberUpgradeOptions } from '@/api/member'

export default {
  data() {
    return {
      memberType: 'personal', // 'personal' 个人会员, 'enterprise' 企业会员
      personalGroups: [],
      enterpriseGroups: []
    }
  },
  computed: {
    currentGroups() {
      return this.memberType === 'enterprise' ? this.enterpriseGroups : this.personalGroups
    }
  },
  onLoad() {
    this.fetchData()
  },
  methods: {
    chars(str) {
      return [...(str || '')]
    },
    switchMemberType(type) {
      this.memberType = type
    },
    async fetchData() {
      try {
        const res = await getMemberUpgradeOptions()
        if (res.code === 1) {
          this.personalGroups = res.data.personal || []
          this.enterpriseGroups = res.data.enterprise || []
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.page-container{
  min-height: 100vh;
  background: #0D1036;
}

.member-selector-wrap{
  background: #0D1036;
  padding: 0rpx 0rpx 20rpx 0rpx ;
}

.member-selector{
  display: flex;
  width: 100%;
  height: 88rpx;
  /* border-radius: 8rpx; */
  overflow: hidden;
  background: #353548;
}

.member-title{
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
  margin-bottom: 10rpx;
  background: linear-gradient(90deg, #FCE2AF 0%, #F2BD63 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.selector-item{
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;
  transition: all 0.3s;
  cursor: pointer;
  background: #202239;
  color: #ffffff;
}

.selector-item.active{
  background: linear-gradient(90deg, #F3BE67 0%, #FEE3B0 50.1%, #F4BE66 100%);
  color: #5c3a1a;
}

.table-wrap{
  padding: 24rpx;
  background: #0D1036;
}

.table{
  position: relative;
  display: flex;
  color: #fdfdfd;
  background: #012258;
  border: 1rpx solid #ffffff;
  align-items: stretch;
  padding-left: 120rpx;
  box-sizing: border-box;
}

.table-split{
  margin-top: 20rpx;
}

.side{
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 120rpx;
  background: #012258;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1rpx solid #ffffff;
  box-sizing: border-box;
}

.side-inner{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.4;
  font-size: 30rpx;
  font-weight: 600;
}

.main{
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.row{
  display: flex;
  align-items: stretch;
}

.header{
  background: #012258;
  font-weight: 600;
}

.body{
  background: #202239;
}

.cell{
  border-right: 1rpx solid #ffffff;
  border-bottom: 1rpx solid #ffffff;
  padding: 18rpx 16rpx;
  min-height: 88rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 26rpx;
  line-height: 1.55;
}

.header .cell{
  font-size: 28rpx;
  font-weight: 700;
}

.body .cell{
  font-size: 22rpx;
  font-weight: normal;
  color: #e4e3e3;
}

.row:last-child .cell{
  border-bottom: 1rpx solid #ffffff;
}

.level{ width: 120rpx; }
.benefit{ flex: 2; min-width: 0; }
.fee{ width: 120rpx; }
.action{ width: 150rpx; }

.benefit-text{
  word-break: break-all;
}

.action-text{
  color: #FFDD9D;
  font-weight: normal;
}
</style>

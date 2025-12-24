<template>
<!--pages/message_center/message_center.wxml-->
<view class="message-center-container">
  <custom-navbar title="信息通知"></custom-navbar>
  <navigator v-for="(item, index) in list" :key="index" class="message-item row" hover-class="none" :url="'/bundle/pages/notice/notice?type=' + item.type">
    <image style="width: 76rpx;height: 76rpx;flex: none" :src="item.img"></image>
    <view class="item-info ml20 column">
      <view class="item-title">{{item.title}}</view>
      <view class="item-desc line1 muted">{{item.content}}</view>
    </view>
  </navigator>
</view>
</template>

<script>
import { getNoticeLists, getMessageLists } from '@/api/store';

export default {
  data() {
    return {
      list: []
    };
  },

  components: {},
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMessageListsFun();
  },

  methods: {
    getMessageListsFun() {
      getMessageLists().then(res => {
        if (res.code == 1) {
          this.list = res.data;
        }
      });
    }

  }
};
</script>
<style lang="scss">
/* pages/message_center/message_center.wxss */

.message-center-container {
  min-height: 100vh;
  padding: 20rpx;
  padding-top: calc(130rpx + var(--status-bar-height));
  background-color: #0D1038;
  .message-item {
    padding: 32rpx 0;
    .item-info {
      font-size: 32rpx;
      flex: 1;
      overflow: hidden;
      .item-title{
        font-size: 32rpx;
        color: #FFFFFF;
      }
      .item-desc{
        font-size: 26rpx;
        color: #FFFFFF;
      }
    }
  }
}
</style>
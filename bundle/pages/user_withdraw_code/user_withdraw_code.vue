<template>
<view class="user-withdraw-code">
  <custom-navbar title="提现记录"></custom-navbar>
    <view class="withdraw-code-container mt10">
        <view class="withdraw-code-contain">
            <navigator v-for="(item, index) in withdrawRecords" :key="index" class="withdraw-code-item bg-white" hover-class="none"
			 :url="`/bundle/pages/widthdraw_result/widthdraw_result?id=${item.id}&type=1`">
                <view class="row-between">
                    <view>{{item.desc}}</view>
                    <price-format showSubscript :subScriptSize="26" :firstSize="36" :secondSize="36" :price="item.left_money" />
                </view>
                <view class="row-between mt10">
                    <view class="muted xs time">{{item.create_time}}</view>
                    <view class="withdraw-status xs" :class="{'error-status' : item.status == 2 || item.status == 4, 'common-status': item.status == 3}">{{item.status_text}}</view>
                </view>
				  <view v-if="item.description && item.status == 4" class="primary mt10 line1 xs">{{item.description}}</view>
            </navigator>
        </view>
        <loading-footer :status="loadingStatus" slotEmpty>                
            <view class="data-null column-center" slot="empty">
                <image src="/static/images/order_null.png" class="img-null"></image>
                <text class="muted">暂无提现记录～</text>
            </view>
        </loading-footer>
    </view>
</view>
</template>

<script>
import { getWithdrawRecords } from '@/api/user';
import { loadingType } from '@/utils/type.js';
import {loadingFun} from "@/utils/tools"
export default {
  data() {
    return {
      loadingStatus: loadingType.LOADING,
      page: 1,
      withdrawRecords: []
    };
  },

  components: {
  },
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getWithdrawRecordsFun();
  },

  onReachBottom: function () {
      this.getWithdrawRecordsFun()
  },

  methods: {
    getWithdrawRecordsFun() {
      let {
        loadingStatus,
        withdrawRecords,
        page
      } = this;
      
      loadingFun(getWithdrawRecords, page, withdrawRecords, loadingStatus).then(res => {
          if(res) {
              this.page = res.page;
              this.withdrawRecords = res.dataList
              this.loadingStatus = res.status
          }
      })
    }

  }
};
</script>
<style lang="scss">
.user-withdraw-code {
   background-color: #0D1038;
	min-height: 100vh;
	padding-top: calc(130rpx + var(--status-bar-height));
    .withdraw-code-container {
        .withdraw-code-item {
            padding: 24rpx 30rpx;
            .time {
              line-height: 32rpx;
            }
            .withdraw-status {
              color: #0CC21E;
            }
            .common-status {
              color: #666666;
            }
            .error-status {
              color: $-color-primary;
            }
            &:not(:last-of-type) {
              border-bottom: var(--border);
            }
        }
    }
    .data-null {
      padding-top: 200rpx;
    }
}
</style>
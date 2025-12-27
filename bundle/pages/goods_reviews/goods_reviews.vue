<template>
<view class="goods-reviews">
  <custom-navbar title="商品评价"></custom-navbar>
  <scroll-view scroll-y class="content-wrap">
    <order-goods :list="goods" style="background-color:#1E1F34"></order-goods>
    <view class="goods-evaluate row" style="margin-top: 20rpx;background-color:#1E1F34;color:white">
        <view class="lable">服务星级</view>
        <u-rate name="goodsRate" :count="5" :size="42" active-color="#F4BE67" v-model="goodsRate" @change="goodsRateChange" />
        <view :class="'desc ' + ((goodsRate<=2)? 'muted': 'primary') + ' '" v-show="!(goodsRate == 0)">
            {{goodsRateDesc}}
        </view>
    </view>
        <!-- <view class="rate bg-white">
            <view class="item row mb20">
                <view class="lable">描述相符</view>
                <u-rate name="descRate" :size="42" active-color="#FF2C3C" v-model="descRate" />
            </view>
            <view class="item row mb20">
                <view class="lable">服务态度</view>
                <u-rate name="serverRate" :size="42" active-color="#FF2C3C" v-model="serverRate" />
            </view>
            <view class="item row">
                <view class="lable">配送服务</view>
                <u-rate name="deliveryRate" :size="42" active-color="#FF2C3C" v-model="deliveryRate" />
            </view>
        </view> -->
        <view class="goods-dec bg-white mt20" style="background-color:#1E1F34;color:white">
            <view class="textarea mb20" >
               <u-input v-model="comment"  placeholder=" (*^▽^*)  感觉怎么样，跟大家分享一下吧~" type="textarea" :clearable="false">
               </u-input>
            </view>
            <!-- <uploader preview-size="180rpx" :mutiple="true" :maxUpload="5" :file-list="fileList" @after-read="afterRead" :deletable="true" @delete="onDelete" /> -->
        </view>
  </scroll-view>
  <view class="btn-wrapper">
    <button form-type="submit" class="btn br60" size="lg" @tap="onSubmit">立即评价</button>
  </view>
</view>
</template>

<script>
import { baseURL } from '@/config/app.js';
import { goodsComment, getCommentInfo } from '@/api/user';
import { uploadFile } from '@/utils/tools.js';
export default {
  data() {
    return {
      goodsRate: 0,
      descRate: 0,
      serverRate: 0,
      deliveryRate: 0,
      goodsRateDesc: "",
      fileList: [],
      goods: [],
      comment: '',
      type: ""
    };
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.id = options.id;
    this.getCommentInfoFun();
  },

  
  methods: {
    onChange(e) {
      this.type = e.value
    },

    goodsRateChange: function (e) {
      let goodsRateDesc = "";

      if (e <= 2) {
        goodsRateDesc = "差评";
      } else if (e == 3) {
        goodsRateDesc = "中评";
      } else {
        goodsRateDesc = "好评";
      }
      this.goodsRateDesc = goodsRateDesc;
    },

    onSubmit() {
      let {
        goodsRate,
        fileList,
        comment,
        deliveryRate,
        descRate,
        serverRate
      } = this;
      let image = fileList.map(item => item.base_url);
      if (!goodsRate) return this.$toast({
        title: '请对商品进行评分'
      });
      if (!descRate) return this.$toast({
        title: '请对描述相符进行评分'
      });
      if (!serverRate) return this.$toast({
        title: '请对服务态度进行评分'
      });
      if (!deliveryRate) return this.$toast({
        title: '请对配送服务进行评分'
      });
      goodsComment({
        id: parseInt(this.id),
        goods_comment: goodsRate,
        service_comment: serverRate,
        express_comment: deliveryRate,
        description_comment: descRate,
        comment,
        image
      }).then(res => {
        if (res.code == 1) {
          this.$toast({
            title: '评价成功'
          }, {
            tab: 5,
            url: '/bundle/pages/goods_comment_list/goods_comment_list?type=1'
          });
        }
      });
    },

    onInput(e) {
        this.comment = e.detail.value
    },

    getCommentInfoFun() {
      getCommentInfo({
        id: this.id
      }).then(res => {
        if (res.code == 1) {
          this.goods.push(res.data);
        }
      });
    },

    afterRead(e) {
      const file = e
      uni.showLoading({
        title: '正在上传中...',
        mask: true
      });
      file.map(item => {
        uploadFile(item.path).then(res => {
            uni.hideLoading();
            this.fileList.push(res)
        }).catch(() => {
			uni.hideLoading();
			this.$toast({
				title: "上传失败"
			})
			
		})
      })
    },

    onDelete(index) {
      this.fileList.splice(index, 1)
    }

  }
};
</script>
<style>
.goods-reviews {
    min-height: 100vh;
    background: #0D1034;
    display: flex;
    flex-direction: column;
    padding-top: calc(130rpx + var(--status-bar-height));
}

.content-wrap {
    flex: 1;
    padding: 20rpx 0;
    padding-bottom: 140rpx;
}

.goods-reviews .rate {
    padding:  20rpx 30rpx;
}
.goods-reviews .rate .lable {
    width: 170rpx;
}
.goods-reviews .goods-dec {
    padding: 30rpx;
}
.goods-reviews .goods-dec .textarea {
    height: 240rpx;
    border-radius: 10rpx;
}
.goods-reviews .goods-dec .textarea textarea {
    width: 100%;
    height: 100%;
    padding: 20rpx;
    box-sizing: border-box;
}

.btn-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx 26rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    background: #0D1034;
    z-index: 100;
}

.goods-reviews .btn {
    width: 100%;
    margin: 0;
    background: linear-gradient(90deg, #F4BD66 0%, #FEE2AF 49.58%, #F3BD65 100%);
    color: #380C00;
    border: none;
}

.goods-reviews .btn::after {
    border: none;
}

.rate .item .desc {
    margin-left: 30rpx;
}

.goods-reviews .goods-evaluate {
    padding: 20rpx 30rpx;
}

.goods-reviews .goods-evaluate .desc {
    margin-left: 30rpx;
}

.goods-reviews .goods-evaluate .lable {
    width: 170rpx;
}
</style>
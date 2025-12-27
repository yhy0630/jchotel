<template>
	<view class="user" :style="[background]">
		<view class="header" >
			<!-- #ifndef  H5 -->
			<u-sticky offset-top="0" h5-nav-height="0" bg-color="transparent">
			 <u-navbar :is-back="false" title="个人中心" :title-bold="true" :is-fixed="false" :border-bottom="false" 
			 :background="{ background: 'rgba(256,256, 256,' + navBg + ')' }" :title-color="navBg > 0.5 ? '#000' : '#fff'"></u-navbar>
			 </u-sticky>
			 <!-- #endif -->
			<view class="user-info row-between">
				<view class="info row">
					<image class="avatar mr20 flexnone" @tap="goLogin" :src="isLogin ? userInfo.avatar : '/static/images/my_portrait_empty.png'"></image>
					<view class="white" v-if="isLogin">
						<view class="name-row">
							<view class="name xxl line1">{{userInfo.nickname}}</view>
							<view class="identity-chip" v-if="userInfo.member_category_name">{{ userInfo.member_category_name }}</view>
						</view>
						<view class="member-identity-pills" v-if="isLogin">
							<view class="identity-pill" v-if="userInfo.member_grade_name">{{ userInfo.member_grade_name }}</view>
						</view>
					</view>
					<view class="white" v-else @tap="goLogin">
						<view style="font-size: 42rpx">点击登录</view>
						<view class="sm">登录体验更多功能</view>
					</view>   
				</view>
                <view class="row" style="align-self: flex-start;">
                    <view class="user-opt" style="margin-right: 30rpx;" @tap="goPage('/bundle/pages/message_center/message_center')" >
                        <view class="dot row-center" v-if="userInfo.notice_num"></view>
                        <image style="width:50rpx;height: 58rpx;margin-top:23rpx;" src="/static/images/铃铛.png"></image>
                    </view>
                    <!-- <view class="user-opt" @tap="goPage('/bundle/pages/user_profile/user_profile')">
                        <image style="width:50rpx;height: 50rpx;margin-top:6rpx;" src="/static/images/icon_my_setting.png"></image>
                    </view> -->
                </view>
			</view>
			<!-- <view class="member column-end" @tap="goPage('/pages/user_vip/user_vip')">
				<view class="member-entery row-between">
					<view class="row">
						<image class="icon-md" src="/static/images/icon_member.png"></image>
						<view class="ml10">{{isLogin ? userInfo.level : "登录查看会员权益"}}</view>
					</view>
					<view class="row">
						<view class="sm">{{userInfo.next_level_tips || '查看会员权益'}}</view>
						<u-icon name="arrow-right"></u-icon>
					</view>
				</view>
			</view> -->
		</view>
        <view class="user-stats" v-if="isLogin">
            <view class="stat-item">
                <text class="stat-label">在网时长：</text>
                <text class="stat-value">333天</text>
            </view>
            <view class="stat-item">
                <text class="stat-label">能量分：</text>
                <text class="stat-value">500</text>
            </view>
            <view class="stat-item">
                <text class="stat-label">消费积分：</text>
                <text class="stat-value">69898</text>
            </view>
        </view>
        <!-- <view class="member-identity-card" v-if="isLogin">
            <view class="identity-row">
                <text class="identity-label">会员类别</text>
                <text class="identity-value">{{ currentMemberCategory }}</text> 
            </view>
            <view class="identity-row">
                <text class="identity-label">会员等级</text>
                <text class="identity-value">{{ currentMemberGrade }}</text>
            </view>
        </view> -->
        <!-- 会员身份选项卡与个人中心 -->
        <view class="member-tabs-box">
            <view class="member-tabs">
                <!-- 修复：始终显示所有会员类型，允许自由切换 -->
                <view
                    v-for="tab in memberTabs"
                    :key="tab.key"
                    :class="['member-tab', {active: activeMemberType === tab.key}]"
                    @tap="activeMemberType = tab.key"
                >
                    {{ tab.label }}
                </view>
            </view>
            <view class="member-actions">
                <view class="action-btn action-upgrade" @tap="goPage('/bundle/pages/user/member-upgrade')">升级会员</view>
                <view class="action-btn action-center" @tap="openMemberCenter">个人中心</view>
                <view class="action-btn action-switch" @tap="switchIdentity">切换身份</view>
            </view>
        </view>

		<!-- <view class="my-assets bg-white">
			<view class="title row lg">我的资产</view>
			<view class="nav row">
				<view class="column-center mb20 assets-item" @tap="goPage('/bundle/pages/user_wallet/user_wallet')">
					<view class="xl primary">{{userInfo.user_money}}</view>
					<view class="sm">余额</view>
				</view>
				<view class="column-center mb20 assets-item" @tap="goPage('/bundle/pages/user_sign/user_sign')">
					<view class="xl primary">{{userInfo.user_integral}}</view>
					<view class="sm">积分</view>
				</view>
				<view class="column-center mb20 assets-item" @tap="goPage('/pages/user_coupon/user_coupon')">
					<view class="xl primary">{{userInfo.coupon}}</view>
					<view class="sm">优惠券</view>
				</view>
			</view>
		</view> -->
		<!-- <view class="order-nav bg-white">
			<view class="title row-between" @tap="goPage('/pages/user_order/user_order')">
				<view class="lg">我的订单</view>
				<view class="muted sm row">
					全部订单
					<image class="icon-sm ml10" src="/static/images/arrow_right.png"></image>
				</view>
			</view>
			<view class="nav row">
				<view class="item column-center mb20" @tap="goPage('/pages/user_order/user_order?type=pay')">
					<view class="icon-contain">
						<view v-if="userInfo.wait_pay" class="badge xs row-center bg-white">
							{{userInfo.wait_pay}}
						</view>
						<image class="nav-icon" src="/static/images/icon_my_payment.png"></image>
					</view>
					<view class="sm mt10">待付款</view>
				</view>
				<view class="item column-center mb20" @tap="goPage('/pages/user_order/user_order?type=delivery')">
					<view class="icon-contain">
						<view v-if="userInfo.wait_delivery" class="badge xs row-center bg-white">
							{{userInfo.wait_delivery}}
						</view>
						<image class="nav-icon mb10" src="/static/images/icon_my_fahuo.png"></image>
					</view>
					<view class="sm">待发货</view>
				</view>
				<view class="item column-center mb20" @tap="goPage('/pages/user_order/user_order?type=receive')">
					<view class="icon-contain">
						<view v-if="userInfo.wait_take" class="badge xs row-center bg-white">
							{{userInfo.wait_take}}
						</view>
						<image class="nav-icon" src="/static/images/icon_my_shouhuo.png"></image>
					</view>
					<view class="sm mt10">待收货</view>
				</view>
				<view class="item column-center mb20" @tap="goPage('/bundle/pages/goods_comment_list/goods_comment_list')">
					<view class="icon-contain">
						<view v-if="userInfo.wait_comment" class="badge xs row-center bg-white">
							{{userInfo.wait_comment}}
						</view>
						<image class="nav-icon" src="/static/images/icon_my_pingjia.png"></image>
					</view>
					<view class="sm mt10">商品评价</view>
				</view>
				<view class="item column-center mb20" @tap="goPage('/bundle/pages/post_sale/post_sale')">
					<view class="icon-contain">
						<view v-if="userInfo.after_sale" class="badge xs row-center bg-white">
							{{userInfo.after_sale}}
						</view>
						<image class="nav-icon" src="/static/images/icon_my_shouhou.png"></image>
					</view>
					<view class="sm mt10">退款/售后</view>
				</view>
			</view>
		</view> -->
		<!-- 菜单列表 -->
		<view class="menu-list">
			<view class="menu-item" @tap="goPage('/bundle/pages/user_profile/user_profile')">
				<image class="menu-icon" src="/static/images/ISM-jichuxinxi 1.png"></image>
				<text class="menu-text">基本信息</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
			<view class="menu-item" @tap="goPage('/bundle/pages/invite_fans/invite_fans')">
				<image class="menu-icon" src="/static/images/Upload.png"></image>
				<text class="menu-text">平台分享</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
			<view class="menu-item" @tap="goPage('/pages/user_points/user_points')">
				<image class="menu-icon" src="/static/images/Ticket Star@2x.png"></image>
				<text class="menu-text">我的积分</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
			<view class="menu-item" @tap="goPage('/pages/user_coupon/user_coupon')">
				<image class="menu-icon" src="/static/images/money-recive.png"></image>
				<text class="menu-text">代金券</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
			<view class="menu-item" @tap="goPage('/bundle/pages/license/license')">
				<image class="menu-icon" src="/static/images/buildings.png"></image>
				<text class="menu-text">关于我们</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
			<view class="menu-item" @tap="goPage('/bundle/pages/user_spread/user_spread')">
				<image class="menu-icon" src="/static/images/2 User.png"></image>
				<text class="menu-text">邀请好友</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
			<view class="menu-item" @tap="goPage('/bundle/pages/hotel/custom-my')">
				<image class="menu-icon" src="/static/images/jiudian-3 1.png"></image>
				<text class="menu-text">我的发布</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
			<view class="menu-item" v-if="isMerchant" @tap="goPage('/bundle/pages/hotel/merchant-list')">
				<image class="menu-icon" src="/static/images/Work.png"></image>
				<text class="menu-text">商家接单</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
			<view class="menu-item" @tap="goPage('/bundle/pages/hotel/order-list?order_type=hotel')">
				<image class="menu-icon" src="/static/images/jiudian-3 1.png"></image>
				<text class="menu-text">酒店订单</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
			<view class="menu-item" @tap="goPage('/bundle/pages/hotel/order-list?order_type=flight')">
				<image class="menu-icon" src="/static/images/feiji_line 1.png"></image>
				<text class="menu-text">机票订单</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
			<view class="menu-item" @tap="goPage('/bundle/pages/hotel/order-list?order_type=train')">
				<image class="menu-icon" src="/static/images/huochepiao-2 1.png"></image>
				<text class="menu-text">车票订单</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
			<view class="menu-item" @tap="handleMenuClick('rental')">
				<image class="menu-icon" src="/static/images/qiche-5 1.png"></image>
				<text class="menu-text">租车订单</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
			<view class="menu-item" @tap="handleMenuClick('taxi')">
				<image class="menu-icon" src="/static/images/dache_taxi 1.png"></image>
				<text class="menu-text">打车订单</text>
				<u-icon name="arrow-right" color="#999" size="28"></u-icon>
			</view>
		</view>
		<!-- 酒店相关功能 -->
		<!-- <view class="server-nav bg-white">
			<view>
				<view class="title row-between">
					<view class="lg">酒店服务</view>
				</view>
			</view>
			<view class="nav row wrap">
				<view class="item column-center mb20" hover-class="none" @tap="goPage('/bundle/pages/hotel/order-list?order_type=hotel')" style="width: 25%;">
					<image class="nav-icon" src="/static/images/icon_hotel_order.png"></image>
					<view class="sm mt10">酒店订单</view>
				</view>
				<view class="item column-center mb20" hover-class="none" @tap="goPage('/bundle/pages/hotel/order-list?order_type=flight')" style="width: 25%;">
					<image class="nav-icon" src="/static/images/icon_hotel_order.png"></image>
					<view class="sm mt10">飞机票订单</view>
				</view>
				<view class="item column-center mb20" hover-class="none" @tap="goPage('/bundle/pages/hotel/order-list?order_type=train')" style="width: 25%;">
					<image class="nav-icon" src="/static/images/icon_hotel_order.png"></image>
					<view class="sm mt10">火车票订单</view>
				</view>
				<view class="item column-center mb20" hover-class="none" @tap="goPage('/bundle/pages/hotel/custom-my')" style="width: 25%;">
					<image class="nav-icon" src="/static/images/icon_custom_my.png"></image>
					<view class="sm mt10">我的发布</view>
				</view>
				<view class="item column-center mb20" hover-class="none" @tap="goPage('/pages/user_points/user_points')" style="width: 25%;">
					<image class="nav-icon" src="/static/images/Ticket Star@2x.png"></image>
					<view class="sm mt10">我的积分</view>
				</view>
				<view class="item column-center mb20" hover-class="none" @tap="goPage('/bundle/pages/license/license')" style="width: 25%;">
					<image class="nav-icon" src="/static/images/buildings.png"></image>
					<view class="sm mt10">关于我们</view>
				</view>
				<view v-if="isMerchant" class="item column-center mb20" hover-class="none" @tap="goPage('/bundle/pages/hotel/merchant-list')" style="width: 25%;">
					<image class="nav-icon" src="/static/images/icon_merchant_order.png"></image>
					<view class="sm mt10">商家接单</view>
				</view>
			</view>
		</view>
		<view class="server-nav bg-white" v-if="menuList && menuList.length > 0">
			<view>
				<view class="title row-between">
					<view class="lg">我的功能</view>
				</view>
			</view>
			<view class="nav row wrap">
				<button v-for="(item, index) in menuList" :key="index" class="item column-center mb20" hover-class="none"
				 :open-type="item.link_type == 3 ?'contact' :''" @tap="tapMenu(item)" style="width: 25%;">
					<image class="nav-icon" :src="item.image"></image>
					<view class="sm mt10">{{item.name}}</view>
				</button>
			</view>
		</view> -->
        <recommend/>
        
        <!-- 自定义切换身份弹窗 -->
        <custom-modal
            :show.sync="showSwitchModal"
            :title="switchModalTitle"
            :content="switchModalContent"
            :confirm-text="switchModalType === 'complete' ? '去完善' : '确认'"
            cancel-text="取消"
            @confirm="handleSwitchConfirm"
            @cancel="handleSwitchCancel"
        />
	</view>
</template>

<script>
	import CustomModal from '@/components/custom-modal/custom-modal.vue'
	import recommend from '@/components/recommend/recommend.vue'
	import {
		mapGetters,
		mapActions
	} from 'vuex'
	import {
		getUser,
        getMyMemberTypes
	} from '@/api/user';
	import {
		getMenu
	} from '@/api/store'
	import {
		toLogin,
		wxMnpLogin
	} from '@/utils/login'
	import {menuJump, copy, setTabbar} from '@/utils/tools'
	import Cache from '@/utils/cache'
	const app = getApp()
	export default {
		data() {
			return {
				showNav: false,
				navH: 0,
				navBg: 0,
				menuList: [],
				statusBarH: "",
                isMerchant: false,
                // 自定义弹窗相关
                showSwitchModal: false,
                switchModalTitle: '',
                switchModalContent: '',
                switchModalType: '', // 'confirm' 或 'complete'
                // 会员身份相关
                activeMemberType: '',
                memberTabs: [
                    { key: 'business_travel', label: '商旅会员' },
                    { key: 'channel', label: '渠道会员' },
                    { key: 'enterprise', label: '企业会员' },
                    { key: 'business', label: '商务会员' }
                ],
                memberPanels: {
                    business_travel: {
                        title: '商旅会员',
                        items: [
                            { label: '我的能量分', value: '4200万' },
                            { label: '我的消费积分', value: '4200万' },
                            { label: '待付款', value: '4200万' },
                            { label: '待出行', value: '4200万' },
                            { label: '待点评', value: '4200万' },
                            { label: '已完成', value: '4200万' },
                            { label: '投诉反馈', value: '4200万' },
                            { label: '平台信息', value: '4200万' }
                        ]
                    },
                    business: {
                        title: '商务会员',
                        items: [
                            { label: '收盘管理', value: '2500' },
                            { label: '合同管理', value: '20' },
                            { label: '待点评客人', value: '30' },
                            { label: '商旅客户', value: '573' },
                            { label: '渠道客户', value: '管理' },
                            { label: '平台信息', value: '5.0分' },
                            { label: '待审核运单', value: '5' }
                        ]
                    },
                    channel: {
                        title: '渠道会员',
                        items: [
                            { label: '小程序访客', value: '750人次' },
                            { label: '预定订单量', value: '20' },
                            { label: '在店间夜', value: '30' },
                            { label: '预定销售额', value: '4200元' },
                            { label: '安排预定房价', value: '管理' },
                            { label: '门店评分', value: '5.0分' },
                            { label: '待审核订单', value: '5' },
                            { label: '待点评客人', value: '2' },
                            { label: '平台信息', value: '2' }
                        ]
                    },
                    enterprise: {
                        title: '企业会员',
                        items: [
                            { label: '公司建档', value: '已完善' },
                            { label: '部门建档', value: '已完善' },
                            { label: '职员建档', value: '已完善' },
                            { label: '差旅制度', value: '已上传' },
                            { label: '数据报表', value: '可查看' },
                            { label: '申请审批制度', value: '已开启' },
                            { label: '报销制度', value: '已设置' },
                            { label: '信息通知', value: '开启中' },
                            { label: '发票管理', value: '正常' }
                        ]
                    }
                },
                ownedMemberTypes: [],
                memberIdentity: {
                    categoryId: 0,
                    categoryName: '',
                    gradeId: 0,
                    gradeName: ''
                }
			};
		},

		components: {
			CustomModal,
			recommend
		},
		props: {},
		watch: {
			'userInfo.member_category_code'(val) {
			if (val) {
				this.activeMemberType = val;
			}
		},
		'userInfo.member_category_name'(val) {
			if (val) {
				// 根据会员类别名称映射到对应的 key
				const nameToKeyMap = {
					'商旅会员': 'business_travel',
					'渠道会员': 'channel',
					'企业会员': 'enterprise',
					'商务会员': 'business'
				};
				const mappedKey = nameToKeyMap[val];
				if (mappedKey) {
					this.activeMemberType = mappedKey;
				}
			}
		}
	},

		onLoad(options) {
			setTabbar()
			this.getMenuFun();
		},

		onShow() {
			this.getUser();
			this.getCartNum();
			this.checkMerchantPermission();
            this.loadMemberTypes();
		},
		onPageScroll(e) {
			const top = uni.upx2px(100)
			const {
				scrollTop
			} = e
			let percent = scrollTop / top > 1 ? 1 : scrollTop / top
			this.navBg = percent
		},

		onUnload() {
		},
		onPullDownRefresh() {
			this.getUser().then(() => {
				uni.stopPullDownRefresh();
			})
			this.getMenuFun();
		},
		onShareAppMessage() {
			const shareInfo = Cache.get('shareInfo')
			return {
				title: shareInfo.mnp_share_title,
				path: "pages/index/index?invite_code=" + this.inviteCode,
				imageUrl: shareInfo.mnp_share_image
			};
		},
		methods: {
			...mapActions(['getCartNum', 'getUser']),
			goLogin() {
				let {
					isLogin
				} = this;
				if (isLogin) {
					uni.navigateTo({
						url: '/bundle/pages/user_profile/user_profile'
					});
					return;
				}
				toLogin()
			},

			goPage(url) {
				if(!this.isLogin) return toLogin()
				uni.navigateTo({
					url
				});
			},
			tapMenu(item) {
				if(!this.isLogin) return toLogin()
				console.log(item)
				menuJump(item)
			},
			async getMenuFun() {
				const {
					data,
					code
				} = await getMenu({
					type: 2,
				})
				if (code == 1) {
					this.menuList = data
				}
			},
			
			onCopy(e) {
                copy(this.userInfo.sn)
			},
			checkMerchantPermission() {
				// 检查用户是否有商家接单权限：
                // 1）保持兼容：如果后台手动赋予 is_merchant，则直接视为商家；
                // 2）新增逻辑：如果已开通"商旅会员"或"渠道会员"，也视为商家。
				if (this.isLogin && this.userInfo) {
					const baseFlag = !!this.userInfo.is_merchant;
                    const memberFlag = this.ownedMemberTypes.includes('business_travel') || this.ownedMemberTypes.includes('channel');
					this.isMerchant = baseFlag || memberFlag;
				} else {
                    this.isMerchant = false;
                }
			},
            async loadMemberTypes() {
                if (!this.isLogin) {
                    this.ownedMemberTypes = [];
                    this.memberIdentity = {
                        categoryId: 0,
                        categoryName: '',
                        gradeId: 0,
                        gradeName: ''
                    };
                    if (!this.activeMemberType) {
                        this.activeMemberType = this.memberTabs[0].key;
                    }
                    return;
                }
                try {
                    const res = await getMyMemberTypes();
                    if (res.code === 1 && res.data) {
                        const data = res.data;
                        this.ownedMemberTypes = Array.isArray(data.types) ? data.types : [];
                        this.memberIdentity = {
                            categoryId: data.member_category_id || 0,
                            categoryName: data.member_category_name || '',
                            gradeId: data.member_grade_id || 0,
                            gradeName: data.member_grade_name || ''
                        };
                        if (data.member_category_code) {
                            this.activeMemberType = data.member_category_code;
                        } else if (!this.activeMemberType && this.ownedMemberTypes.length) {
                            this.activeMemberType = this.ownedMemberTypes[0];
                        } else if (!this.activeMemberType) {
                            this.activeMemberType = this.memberTabs[0].key;
                        }
                    } else {
                        this.ownedMemberTypes = [];
                        if (!this.activeMemberType) {
                            this.activeMemberType = this.memberTabs[0].key;
                        }
                    }
                    // 会员类型加载完后，重新评估商家接单权限
                    this.checkMerchantPermission();
                } catch (e) {
                    console.error('加载会员类型失败：', e);
                    this.ownedMemberTypes = [];
                    if (!this.activeMemberType) {
                        this.activeMemberType = this.memberTabs[0].key;
                    }
                    this.checkMerchantPermission();
                }
            },
            // 切换身份：先弹出确认框，确认后判断是否已开通
            switchIdentity() {
                if (!this.isLogin) {
                    return toLogin()
                }
                
                // 修复：确保有选中的会员类型
                if (!this.activeMemberType) {
                    this.activeMemberType = this.memberTabs[0].key;
                }

                const targetType = this.activeMemberType;
                const memberLabel = this.getMemberLabel(targetType);

                // 第一步：弹出确认切换身份的提示框
                this.switchModalType = 'confirm';
                this.switchModalTitle = '切换身份';
                this.switchModalContent = `确认切换为${memberLabel}吗`;
                this.showSwitchModal = true;
            },
            
            // 处理切换身份确认弹窗的确认按钮
            handleSwitchConfirm() {
                if (this.switchModalType === 'confirm') {
                    // 第一个弹窗确认后，进行判断
                    const targetType = this.activeMemberType;
                    const memberLabel = this.getMemberLabel(targetType);
                    this.performIdentitySwitch(targetType, memberLabel);
                } else if (this.switchModalType === 'complete') {
                    // 第二个弹窗确认后，跳转到入驻表单
                    this.navigateToApplyForm();
                }
            },
            
            // 处理切换身份弹窗的取消按钮
            handleSwitchCancel() {
                // 弹窗关闭由组件的.sync自动处理
            },
            
            // 执行身份切换的实际逻辑
            performIdentitySwitch(targetType, memberLabel) {
                // 已经是该身份会员，提示已切换
                if (this.ownedMemberTypes.includes(targetType)) {
                    uni.showToast({ title: `您已是${memberLabel}，可在个人中心查看数据`, icon: 'success' });
                    return;
                }

                // 未开通，弹出温馨提示
                this.switchModalType = 'complete';
                this.switchModalTitle = '温馨提示';
                this.switchModalContent = '升级之前，需要完善您的个人信息';
                this.showSwitchModal = true;
            },
            
            // 跳转到入驻表单
            navigateToApplyForm() {
                const targetType = this.activeMemberType;
                let applyUrl = '';
                
                if (targetType === 'business_travel') {
                    applyUrl = '/bundle/pages/user/member-business-travel-apply'
                } else if (targetType === 'channel') {
                    applyUrl = '/bundle/pages/user/member-channel-apply'
                } else if (targetType === 'enterprise') {
                    applyUrl = '/bundle/pages/user/member-enterprise-apply'
                } else if (targetType === 'business') {
                    applyUrl = '/bundle/pages/user/member-business-apply'
                }
                
                if (applyUrl) {
                    uni.navigateTo({ url: applyUrl });
                } else {
                    uni.showToast({ title: '该会员类型暂不支持入驻', icon: 'none' });
                }
            },
            // 打开当前身份的个人中心面板：
            // 若已开通该身份，进入对应数据看板；否则提示先入驻，并引导到表单
            openMemberCenter() {
                if (!this.isLogin) {
                    return toLogin()
                }
                
                // 修复：确保有选中的会员类型
                if (!this.activeMemberType) {
                    this.activeMemberType = this.memberTabs[0].key;
                }

                const targetType = this.activeMemberType;
                if (!this.ownedMemberTypes.includes(targetType)) {
                    uni.showModal({
                        title: '提示',
                        content: `您还不是${this.getMemberLabel(targetType)}，请先完成入驻申请并支付会员费用。`,
                        confirmText: '去入驻',
                        cancelText: '取消',
                        success: (res) => {
                            if (res.confirm) {
                                this.switchIdentity();
                            }
                        }
                    });
                    return;
                }
                uni.navigateTo({
                    url: `/bundle/pages/user/member-center?type=${targetType}`
                })
            },
            // 辅助函数：根据会员key获取标签
            getMemberLabel(key) {
                const tab = this.memberTabs.find(tab => tab.key === key);
                return tab ? tab.label : '会员';
            },
			openApplyRecords() {
				if (!this.isLogin) {
					return toLogin();
				}
				uni.navigateTo({
					url: '/bundle/pages/user/member-apply-record'
				});
			},
			handleMenuClick(type) {
				if (!this.isLogin) {
					return toLogin();
				}
				// 根据不同菜单类型处理跳转
				switch(type) {
					case 'share':
						// 平台分享逻辑
						uni.navigateTo({ url: '/bundle/pages/invite_fans/invite_fans' });
						break;
					case 'flight':
						// 机票订单
						uni.navigateTo({ url: '/bundle/pages/ticket/search?type=flight' });
						break;
					case 'train':
						// 车票订单
						uni.navigateTo({ url: '/bundle/pages/ticket/search?type=train' });
						break;
					case 'rental':
						// 租车订单
						uni.showToast({ title: '功能开发中', icon: 'none' });
						break;
					case 'taxi':
						// 打车订单
						uni.showToast({ title: '功能开发中', icon: 'none' });
						break;
					default:
						break;
				}
			}

		},
		computed: {
			...mapGetters(["cartNum", "userInfo", "inviteCode", "appConfig", "isLogin"]),
		background() {
			const {
				center_setting
			} = this.appConfig
			const bgImage = center_setting?.top_bg_image 
			return {
				'background-image': `url(${bgImage})`,
				'background-size': '100% 420rpx',
				'background-repeat': 'no-repeat'
			}
		},
            currentMemberCategory() {
                return this.memberIdentity.categoryName || this.userInfo.member_category_name || '未设置';
            },
            currentMemberGrade() {
                return this.memberIdentity.gradeName || this.userInfo.member_grade_name || '未设置';
            },
            currentIdentityLabel() {
                if (!this.isLogin) return '';
                const key = this.activeMemberType || this.userInfo.member_category_code || '';
                const tab = this.memberTabs.find(tab => tab.key === key);
                return tab ? tab.label : '当前身份';
            }
		}
	};
</script>
<style lang="scss">
	.user {
		background-color: #0D1038;
		min-height: 100vh;
		.header {
			display: flex;
			flex-direction: column;
			height: 420rpx;
			.user-info {
				padding: 10rpx 30rpx;
				//#ifdef  H5 
				padding-top: 90rpx;
				//#endif
				.avatar {
					height: 110rpx;
					width: 110rpx;
					border-radius: 50%;
					overflow: hidden;
				}
				.name {
					text-align: left;
					margin-bottom: 5rpx;
					max-width: 400rpx;
					color: #FFE3BB;
				}
				.name-row {
					display: flex;
					align-items: center;
					flex-wrap: wrap;
					gap: 12rpx;
				}
				.identity-chip {
					padding: 8rpx 18rpx;
					border-radius: 999rpx;
					border: 2rpx solid #FDE3B1;
					color: #FDE3B1;
					font-size: 22rpx;
					font-weight: 600;
					line-height: 1;
				}

				.user-id {
					border: 1px solid white;
					border-radius: 100rpx;
					
					.copy-btn {
						background-color: #FFDFDA;
						height: 40rpx;
						width: 90rpx;
						border-radius: 100rpx;
					}
				}

				.user-opt {
					position: relative;

					.dot {
						position: absolute;
						background-color: #ee0a24;
						border: 2rpx solid #FFFFFF;
						color: $-color-primary;
						border-radius: 100%;
						top: 6rpx;
						right: 0rpx;
						font-size: 22rpx;
						min-width: 16rpx;
						height: 16rpx;
					}
				}

				.buyer-type {
					background-color: #FFA200;
					height: 38rpx;
					padding: 0 10rpx;
				}
			}
			.member {
				flex: 1;
				padding: 0 20rpx;
				.member-entery {
					color:#FFE0A1;
					padding: 0 16rpx;
					width:100%;
					height: 80rpx;
					background: url(../../static/images/bg_member_grade.png);
					background-size: 100%;
				}
			}

		}

        .user-stats {
            margin: -60rpx 30rpx 0;
            padding: 30rpx 40rpx;
            border-radius: 20rpx;
            background: linear-gradient(90deg, #FDE3B1 0%, #F2BC62 100%);
            color: #380C00;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.2);
            position: relative;
            z-index: 1;
        }
        .stat-item {
            display: flex;
            align-items: center;
            font-size: 26rpx;
            font-weight: 600;
        }
        .stat-label {
            margin-right: 6rpx;
            opacity: 0.8;
        }

		.order-nav {
			.icon-contain {
				position: relative;
			}
		}

		.order-nav,
		.my-assets {
			margin: 20rpx 20rpx 0;
			border-radius: 8rpx;
		}

		.server-nav {
			margin: 20rpx;
			border-radius: 8rpx;
		}

		.title {
			height: 88rpx;
			padding: 0 30rpx;
			border-bottom: $-dashed-border;
		}

		.nav {
			padding: 26rpx 0 0;

			.assets-item {
				flex: 1;
			}

			.item {
				width: 25%;
			}

			.badge {
				padding: 0 6rpx;
				min-width: 28rpx;
				height: 28rpx;
				border-radius: 28rpx;
				box-sizing: border-box;
				border: 1rpx solid $-color-primary;
				color: $-color-primary;
				position: absolute;
				left: 33rpx;
				top: -10rpx;
				z-index: 2;
			}

			.nav-icon {
				width: 52rpx;
				height: 52rpx;
			}
		}
	}

    .member-tabs-box {
        margin: 20rpx;
        padding: 20rpx;
        border-radius: 20rpx;
        background: #151b3a;
        box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.25);
    }
    .member-identity-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        margin-top: 12rpx;
    }
    .identity-pill {
        padding: 5rpx 26rpx;
        border-radius: 999rpx;
        background: linear-gradient(90deg, #F3BD63 0%, #FDE3B1 49.74%, #F2BC62 100%);
        color: #380C00;
        font-size: 23rpx;
        font-weight: 500;
        box-shadow: 0 6rpx 12rpx rgba(56, 12, 0, 0.08);
    }
    .member-tabs {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16rpx;
        margin-bottom: 16rpx;
    }
    .member-tab {
        text-align: center;
        font-size: 26rpx;
        color: #d8d8d8;
        padding: 18rpx 0;
        border-radius: 14rpx;
        background: #3c4156;
        font-weight: 500;
        position: relative;
        border: 2rpx solid transparent;
    }
    .member-tab.active {
		background-color:#4E474C ;       
		color: #FFE3BB;
        font-weight: 700;
        border-color: #FFE3BB;
        box-shadow: 0 6rpx 14rpx rgba(56, 12, 0, 0.12);

    }
    .member-tab.active::after {
        content: "";
        position: absolute;
        right: -2rpx;
        bottom: -2rpx;
        width: 28rpx;
        height: 28rpx;
        background: url('/static/images/勾.png') no-repeat center / contain;
		
    }
    .member-actions {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16rpx;
        margin-top: 8rpx;
    }
    .action-btn {
        text-align: center;
        border-radius: 14rpx;
        padding: 22rpx 0;
        font-size: 28rpx;
        font-weight: 700;
        color: #d8d8d8;
        background: #3c4156;
        border: 2rpx solid transparent;
    }
    .action-btn:active {
        background: linear-gradient(90deg, #F3BD64 0%, #FDE3B0 50.4%, #F2BD64 100%);
        color: #3b1c00;
        box-shadow: 0 8rpx 16rpx rgba(56, 12, 0, 0.12);
    }
    
    /* 菜单列表样式 */
    .menu-list {
        margin: 20rpx;
        background: #1F2034;
        border-radius: 16rpx;
        overflow: hidden;
    }
    
    .menu-item {
        display: flex;
        align-items: center;
        padding: 32rpx 30rpx;
        border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
    }
    
    .menu-item:last-child {
        border-bottom: none;
    }
    
    .menu-icon {
        width: 48rpx;
        height: 48rpx;
        flex-shrink: 0;
    }
    
    .menu-text {
        flex: 1;
        margin-left: 24rpx;
        font-size: 30rpx;
        color: #E4E3E3;
    }
    
    /* 底部推荐区域背景色 */
    /deep/ .recommend {
        background-color: #0D1038;
    }
    
    /* 确保页面底部背景色一致 */
    /deep/ .goods-list {
        background-color: #0D1038;
    }
</style>

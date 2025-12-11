<template>
	<view class="user-profile-container mt10">
		<view class="user-profile">
			<view class="row-info row bdb-line">
				<view class="label md">头像</view>
				<view style="flex: 1; display: flex; justify-content: flex-end; align-items: center;">
					<view class="user-avatar-box column-center">
						<button class="column column-center" hover-class="none" open-type="chooseAvatar"
							@chooseavatar="onChooseAvatar" @click="onChooseAvatar">
							<image class="user-avatar"
								:src="userInfo.avatar!=''? userInfo.avatar:'../../static/images/default_avatar.png'">
							</image>
						</button>
					</view>
					<u-icon name="arrow-right" style="margin-left: 10px;" />
				</view>
			</view>
			<view class="row-info row bdb-line">
				<view class="label md">昵称</view>
				<view class="md row" style="flex: 1; text-align: right; justify-content: flex-end; margin-right: 10px;">{{userInfo.nickname}}</view>
				<u-icon name="arrow-right" @click="changeName" />
			</view>
			<view class="row-info row bdb-line">
				<view class="label md">性别</view>
				<view class="md row" style="flex: 1; text-align: right; justify-content: flex-end; margin-right: 10px;">
					{{userInfo.sex == 0 ? '未设置' : userInfo.sex == 1 ? '男' : '女'}}
				</view>
				<u-icon name="arrow-right" @click="showSexModal" />
			</view>
			<!-- 性别选择组件 -->
			<u-popup v-model="showSexPop" :closeable="true" :maskCloseAble="false" mode="center" border-radius="14">
				<view class="modify-container column-center bg-white" style="width: 70vw;padding: 24rpx">
					<view class="title xl">选择性别</view>
					<view class="sex-options row" style="margin-top: 30rpx; margin-bottom: 30rpx;">
						<view class="sex-option column-center" @click="selectSex(1)" style="flex: 1;">
							<view class="sex-text">男</view>
						</view>
						<view class="sex-option column-center" @click="selectSex(2)" style="flex: 1;">
							<view class="sex-text">女</view>
						</view>
					</view>
					<view class="btn bg-primary white row-center" @click="closeSexPop" style="background-color: #f4c06b;">确定</view>
				</view>
			</u-popup>
			<view class="row-info row bdb-line">
				<view class="label md">手机号</view>
				<view class="md row" :class="{'muted': !userInfo.mobile}" style="flex: 1; text-align: right; justify-content: flex-end; margin-right: 10px;">
					{{userInfo.mobile ? userInfo.mobile : "未绑定"}}
				</view>
				<u-icon name="arrow-right" @click="changeMobile" />
				<!-- #ifdef H5 || APP-PLUS -->
				<!-- <view class="bd-btn br60 row-center" @click="showModifyMobile">
					{{userInfo.mobile ? '更换手机号' : '绑定手机号'}}
				</view> -->
				<!-- #endif -->
				<!-- #ifdef MP-WEIXIN -->
				<!-- <button class="bd-btn br60 row-center" size="sm" open-type="getPhoneNumber"
					@getphonenumber="getPhoneNumber">{{userInfo.mobile ? '更换手机号' : '绑定手机号'}}</button> -->
				<!-- #endif -->
			</view>
			<view class="row-info row bdb-line">
				<view class="label md">地址</view>
				<view class="md row muted" style="flex: 1; text-align: right; justify-content: flex-end; margin-right: 10px;">
					{{userInfo.address ? userInfo.address : "未设置"}}
				</view>
				<u-icon name="arrow-right" @click="goToAddress" />
			</view>
			<view class="row-info row bdb-line">
				<view class="label md">实名认证</view>
				<view class="md row" :class="{'primary': userInfo.is_real_name, 'muted': !userInfo.is_real_name}" style="flex: 1; text-align: right; justify-content: flex-end; margin-right: 10px;">
					{{userInfo.is_real_name ? '已认证' : '未认证'}}
				</view>
				<u-icon name="arrow-right" @click="goToRealName" />
			</view>
			<view class="row-info row bdb-line">
				<view class="label md">银行卡</view>
				<view class="md row muted" style="flex: 1; text-align: right; justify-content: flex-end; margin-right: 10px;">
					{{userInfo.bank_card ? userInfo.bank_card : "未绑定"}}
				</view>
				<u-icon name="arrow-right" @click="goToBankCard" />
			</view>
			<!-- #ifndef MP-WEIXIN -->
			<view class="row-info row-between">
				<view class="label md">登录密码</view>
				<view class="row">
					<view class="muted nr">点击设置</view>
					<u-icon name="arrow-right" @click="showPwdPop" />
				</view>
			</view>
			<!-- #endif -->
			<!-- <view class="row-info row-between bdb-line" @tap="toSetPayPwd">
				<view class="label md">交易密码</view>
				<u-icon name="arrow-right" />
			</view>
			<view class="row-info row-between bdb-line mt10" @click="goToExplain(0)">
				<view class="label md">服务协议</view>
				<u-icon name="arrow-right" />
			</view>
			<view class="row-info row-between bdb-line" @click="goToExplain(1)">
				<view class="label md">隐私政策</view>
				<u-icon name="arrow-right" />
			</view>
			<view class="row-info row-between bdb-line" @click="goLicense()">
				<view class="label md">版权信息</view>
				<u-icon name="arrow-right" />
			</view>
			<view class="row-info row-between">
				<view class="label md">关于我们</view>
				<view>v{{version}}</view>
			</view> -->
			<!-- #ifndef MP-WEIXIN -->
			<view class="bg-primary white save-btn row-center lg" @click="logout">退出登录</view>
			<!-- #endif -->

			<!-- 版权信息
			<view class="license xs" v-if="appConfig.copyright_info">
				<view>{{ appConfig.copyright_info }}</view>
				<view>{{ appConfig.icp_number }}</view>
			</view> -->

		</view>
		<u-popup type="center" closeable v-model="showMobile" mode="center" border-radius="14">
			<view class="modify-container column-center bg-white" v-show="showMobile">
				<view class="title xl">{{userInfo.mobile ? '更换手机号' : '绑定手机号'}}</view>
				<view class="modify-row row" v-if="userInfo.mobile">
					<view style="width: 56px;border-right: 1px solid #E5E5E5">+86</view>
					<view style="margin-left: 15px">{{userInfo.mobile}}</view>
				</view>
				<view class="modify-row row" v-else>
					<view style="width: 71px;">手机号</view>
					<input v-model="new_mobile" placeholder="请输入绑定手机号" />
				</view>
				<view class="modify-row row">
					<view style="width: 71px;">验证码</view>
					<input v-model="smsCode" style="padding-left: 5px;width: 130px;" placeholder="请输入验证码" />
					<view class="send-code-btn nr row-center" @click="$sendSms">
						<u-verification-code :keep-running="true" ref="uCode" @change="codeChange" unique-key="page-b">
						</u-verification-code>
						<view class="xs">{{tips}}</view>
					</view>
				</view>
				<view class="modify-row row" v-if="userInfo.mobile">
					<view style="width: 71px;">新手机号</view>
					<input v-model="new_mobile" placeholder="请输入新的手机号码" />
				</view>
				<view class="primary mt10">{{userInfo.mobile ? '更改' : '绑定'}}手机号码成功后，您的账号将会变更为该设置号码</view>
				<view class="btn bg-primary white row-center" @click="$changeUserMobile">确定</view>
			</view>
		</u-popup>

		<u-popup v-model="showPwd" closeable mode="center" border-radius="14">
			<view class="modify-container column-center bg-white" v-show="showPwd">
				<view class="title xl">设置密码</view>
				<view class="modify-row row">
					<view style="width: 56px;border-right: 1px solid #E5E5E5">+86</view>
					<view style="margin-left: 15px">{{userInfo.mobile}}</view>
				</view>
				<view class="modify-row row">
					<view style="width: 142rpx;">验证码</view>
					<input v-model="smsCode" style="padding-left: 10rpx;width: 260rpx;" placeholder="请输入验证码" />
					<view class="send-code-btn nr row-center" @click="$sendSms">
						<u-verification-code :keep-running="true" ref="uCode" @change="codeChange" unique-key="page-a">
						</u-verification-code>
						<view class="xs">{{tips}}</view>
					</view>
				</view>
				<view class="modify-row row">
					<view style="width: 71px;">设置密码</view>
					<input type="password" v-model="pwd" placeholder="请输入新密码" />
				</view>
				<view class="modify-row row">
					<view style="width: 71px;">确认密码</view>
					<input type="password" v-model="comfirmPwd" placeholder="再次输入新密码确认" />
				</view>
				<view class="btn bg-primary white row-center" @click="$forgetPwd">确定</view>
			</view>
		</u-popup>
		<u-picker mode="selector" v-model="showPicker" :default-selector="[0]" :range="sexList" @confirm="onConfirm" />
	</view>
</template>

<script>
	import {
		userLogout,
		getUserInfo,
		changeUserMobile,
		setUserInfo,
		setWechatInfo
	} from "@/api/user";
	import {
		version
	} from '@/config/app';
	import {
		sendSms,
		forgetPwd,
	} from '@/api/app'
	import {
		SMSType
	} from '@/utils/type'
	import {
		mapState,
		mapGetters
	} from 'vuex'
	import {
		uploadFile,
		isWeixinClient,
		trottle,
	} from '@/utils/tools'
	import {
		getWxCode,
		getUserProfile
	} from '@/utils/login'

	const FieldType = {
		NONE: '',
		SEX: 'sex',
		NICKNAME: 'nickname',
		AVATAR: 'avatar',
		MOBILE: 'mobile'
	}
	export default {
		name: 'userProfile',
		data() {
			return {
				version: version,
				fileList: [],
				userInfo: {},
				new_mobile: '',
				smsCode: '',
				sexList: ['男', '女'],
				fieldType: FieldType.NONE,
				showPicker: false,
				showMobile: false,
				showPwd: false,
				showSexPop: false,
				tips: '',
				canSendSms: true,
				pwd: '',
				comfirmPwd: '',
				smsType: SMSType.FINDPWD,
				code: ''
			}
		},
		methods: {
			codeChange(text) {
				this.tips = text;
			},
			// 显示性别选择弹出框
			showSexModal() {
				this.showSexPop = true;
			},
			// 选择性别
			selectSex(sex) {
				this.fieldType = FieldType.SEX;
				this.userInfo.sex = sex;
			},
			// 关闭性别弹出框
			closeSexPop() {
				this.$setUserInfo(this.userInfo.sex);
				this.showSexPop = false;
			},
			onChooseAvatar(e) {
				this.fieldType = FieldType.AVATAR;
				// #ifndef MP-WEIXIN
				// 此为uView的跳转方法，详见"文档-JS"部分，也可以用uni的uni.navigateTo
				uni.$u.route({
					// 关于此路径，请见下方"注意事项"
					url: '/components/uview-ui/components/u-avatar-cropper/u-avatar-cropper',
					// 内部已设置以下默认参数值，可不传这些参数
					params: {
						// 输出图片宽度，高等于宽，单位px
						destWidth: 300,
						// 裁剪框宽度，高等于宽，单位px
						rectWidth: 200,
						// 输出的图片类型，如果'png'类型发现裁剪的图片太大，改成"jpg"即可
						fileType: 'jpg',
					}
				})
				// #endif
				// #ifdef MP-WEIXIN
				if (e.detail.avatarUrl) {
					console.log(e.detail.avatarUrl)
					this.uploadImage(e.detail.avatarUrl)
				}
				// #endif
			},
			// end
			logout() {
				//  退出登录
				userLogout({
					token: this.token
				}).then(res => {
					if (res.code == 1) {
						this.$store.commit("LOGOUT");
						this.$toast({
							title: '退出成功'
						})
						setTimeout(() => {
							uni.reLaunch({
								url: "/pages/index/index"
							})
						}, 500)
					}
				})
			},
			goToExplain(value) {
				uni.navigateTo({
					url: '/bundle/pages/server_explan/server_explan?type=' + value
				})
			},
			goLicense() {
				uni.navigateTo({
					url: '/bundle/pages/license/license'
				})
			},

			toSetPayPwd() {
				if (!this.userInfo.mobile) return this.$toast({
					title: "请先设置手机号"
				})
				uni.navigateTo({
					url: '/bundle/pages/set_pay_pwd/set_pay_pwd'
				})
			},
			// 发送短信
			$sendSms(type) {
				if (!this.canSendSms) return
				sendSms({
					mobile: this.userInfo.mobile || this.new_mobile,
					key: this.smsType
				}).then(res => {
					if (res.code == 1) {
						this.$toast({
							title: res.msg
						});
						this.$refs.uCode.start();
					}
				})
			},
			$getUserInfo() {
				getUserInfo().then(res => {
					if (res.code == 1) {
						this.userInfo = res.data;
					}
				})
			},
			// 更换手机号
			showModifyMobile() {
				this.smsCode = '';
				this.new_mobile = '';
				this.showMobile = true
				this.smsType = this.userInfo.mobile ? SMSType.CHANGE_MOBILE : SMSType.BIND
			},
			$changeUserMobile() {
				if (!this.smsCode) {
					this.$toast({
						title: '请输入验证码'
					})
					return;
				}
				if (!this.new_mobile) {
					this.$toast({
						title: '请输入新的手机号码'
					})
					return;
				}
				changeUserMobile({
					mobile: this.userInfo.mobile,
					new_mobile: this.new_mobile,
					code: this.smsCode,
					action: this.userInfo.mobile ? 'change' : ''
				}).then(res => {
					if (res.code == 1) {
						this.showMobile = false;
						this.$toast({
							title: res.msg
						})
						this.$getUserInfo();
					}
				})
			},
			// end
			// 修改用户信息
			async $setUserInfo(value) {
				const res = await setUserInfo({
					field: this.fieldType,
					value: value
				})
				if (res.code == 1) {
					this.$toast({
						title: res.msg
					});
					this.$getUserInfo()
				}
			},
			// end
			timeChange(timestamp) {
				console.log(timestamp, "timestamp")
			},
			onConfirm(value) {
				this.$setUserInfo(value[0] + 1);
				this.showPicker = false;
			},
		

			// 定时器完成
			countDownFinish() {
				this.canSendSms = true;
			},
			// 修改密码
			showPwdPop() {
				if (!this.userInfo.mobile) {
					this.$toast({
						title: '请绑定手机后再设置密码'
					})
					return;
				}
				this.smsCode = '';
				this.smsType = SMSType.FINDPWD
				this.showPwd = true
			},
			$forgetPwd() {
				let {
					smsCode,
					pwd,
					comfirmPwd
				} = this;
				if (!smsCode) {
					this.$toast({
						title: '请填写短信验证码'
					});
					return;
				}
				if (!pwd) {
					this.$toast({
						title: '请输入新密码'
					});
					return;
				}
				if (!comfirmPwd) {
					this.$toast({
						title: '再次输入新密码确认'
					});
					return;
				}
				if (pwd != comfirmPwd) {
					this.$toast({
						title: '两次密码输入不一致'
					});
					return;
				}
				let data = {
					mobile: this.userInfo.mobile,
					code: smsCode,
					password: pwd,
					repassword: comfirmPwd
				};
				forgetPwd(data).then(res => {
					if (res.code == 1) {
						this.showPwd = false;
						this.$toast({
							title: '设置密码成功'
						});
						this.$getUserInfo();
					}
				})
			},
			// end
			// 修改昵称
			changeName() {
				uni.navigateTo({
					url: '/bundle/pages/change_nickname/change_nickname'
				})
			},
			changeMobile() {
				uni.navigateTo({
					url: '/bundle/pages/change_mobile/change_mobile'
				})
			},
			// end

			async getPhoneNumber(e) {
				const {
					encryptedData,
					iv
				} = e.detail;
				let data = {
					code: this.code,
					encrypted_data: encryptedData,
					iv
				}
				this.fieldType = FieldType.MOBILE
				if (encryptedData) {
					this.$changeUserMobileMP(data)
				}
			},
			$changeUserMobileMP(data) {
				changeUserMobile(data).then(res => {
					if (res.code == 1) {
						this.$toast({
							title: res.msg
						});
						this.$getUserInfo()
					}
					// #ifdef MP-WEIXIN
					getWxCode().then(res => {
						this.code = res
					})
					// #endif
				})
			},
			uploadImage(path) {
				uni.showLoading({
					title: '正在上传中...',
					mask: true
				});
				uploadFile(path).then(res => {
					uni.hideLoading()
					this.$setUserInfo(res.url)
				}).catch(() => {
					uni.hideLoading()
					this.$toast({
						title: "上传失败"
					})
				})
			},
			// 跳转到地址页面
			goToAddress() {
				uni.navigateTo({
					url: '/bundle/pages/address/address'
				})
			},
			// 跳转到实名认证页面
			goToRealName() {
				uni.navigateTo({
					url: '/bundle/pages/real_name/real_name'
				})
			},
			// 跳转到银行卡页面
			goToBankCard() {
				uni.navigateTo({
					url: '/bundle/pages/bank_card/bank_card'
				})
			}
		},
		onLoad() {
			this.$getUserInfo()
			// #ifdef MP-WEIXIN
			getWxCode().then(res => {
				this.code = res
			})
			// #endif
			// 监听从裁剪页发布的事件，获得裁剪结果
			uni.$on('uAvatarCropper', path => {
				console.log(path)
				this.uploadImage(path)
			})
			this.getUserProfile = trottle(this.getUserProfile, 500, this)
		},
		onUnload() {
			uni.$off('uAvatarCropper')
		},
		computed: {
			...mapState(['token']),
			...mapGetters(['appConfig'])
		}
	}
</script>

<style lang="scss">
	.user-profile-container {
		background-color: #0D1038;
		min-height: 100vh;
		padding-top: 10px;
		
		.user-profile {
			background-color: #1F2034;
			border-radius: 10px;
			margin-top: 15px;
			margin-left: 15px;
			margin-right: 15px;
			color: #FFFFFF;
			overflow: hidden;
			padding: 15px;

			.user-avatar-box {
				padding: 15rpx;
				background-color: #1F2034;
				border-top-left-radius: 10px;
				border-top-right-radius: 10px;

				.user-avatar {
					width: 80rpx;
					height: 80rpx;
					border-radius: 50%;
					margin-top: -20px;
					margin-bottom: -15px;

				}
			}

			.row-info {
				padding: 30rpx 20rpx;
				background-color: #1F2034;

				.label {
					width: 180rpx;
				}

				.bd-btn {
					padding: 8rpx 24rpx;
					border: 1px solid $-color-primary;
					color: $-color-primary;
				}
			}

			.license {
				margin-top: 80rpx;
				color: #a7a7a7;
				text-align: center;
			}

			.bdb-line {
				border-bottom: 1rpx solid #ECECEC;
			}

			.save-btn {
				margin-top: 40rpx;
				height: 88rpx;
				margin-left: 54rpx;
				margin-right: 54rpx;
				border-radius: 10rpx;
				box-sizing: border-box;
			}

			.updata-btn {
				margin: 0 30rpx;
				margin-top: 40rpx;
				background-color: #0CC267;
			}
		}

		.modify-container {
			padding-left: 30rpx;
			padding-right: 30rpx;
			padding-bottom: 30rpx;
			width: 580rpx;
			border-radius: 30rpx;
			background-color: $-color-white;

			.title {
				padding: 26rpx 0rpx;
			}

			.modify-row {
				padding: 32rpx 0rpx;
				width: 100%;
				border-bottom: 1rpx solid #E5E5E5;

				.send-code-btn {
					border: 1px solid $-color-primary;
					width: 184rpx;
					height: 62rpx;
					color: $-color-primary;
				}
			}

			.btn {
				height: 80rpx;
				padding: 0 180rpx;
				border-radius: 20rpx;
				margin-top: 60rpx;
			}
		}

	}

	.sex-options {
		display: flex;
		justify-content: space-around;
		gap: 30rpx;
		

		.sex-option {
			width: 170rpx;
			flex: 1;
			padding: 20rpx;
			background-color: #f0f0f0;
			border-radius: 10rpx;
			border: 2rpx solid #e0e0e0;
			cursor: pointer;
			transition: all 0.3s;

			&:active {
				background-color: #e0e0e0;
				border-color: #999;
			}

			.sex-text {
				color: #333;
				font-size: 32rpx;
				font-weight: bold;
				text-align: center;
			}
		}
	}
</style>

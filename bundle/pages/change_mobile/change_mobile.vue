<template>
	<view class="change-mobile-container">
		<view class="change-mobile">
			<view class="input-group mobile-group">
				<input 
					v-model="newMobile" 
					class="mobile-input" 
					placeholder="请填写要更换的手机号"
					maxlength="11"
				/>
				<view class="get-code-text" @click="getVerifyCode">获取验证码</view>
			</view>
			<view class="input-group">
				<input 
					v-model="verifyCode" 
					class="code-input" 
					placeholder="验证码"
					maxlength="6"
				/>
			</view>
			<view class="btn-group">
				<view class="btn row-center" @click="confirmChange">确认修改</view>
			</view>
		</view>
	</view>
</template>

<script>
import {
	setUserInfo,
	getUserInfo
} from "@/api/user";

const FieldType = {
	NONE: '',
	SEX: 'sex',
	NICKNAME: 'nickname',
	AVATAR: 'avatar',
	MOBILE: 'mobile'
}

export default {
	name: 'changeMobile',
	data() {
		return {
			newMobile: '',
			verifyCode: '',
			fieldType: FieldType.MOBILE
		}
	},
	methods: {
		// 获取验证码
		getVerifyCode() {
			if (!this.newMobile) {
				return this.$toast({
					title: '请输入手机号'
				})
			}
			if (this.newMobile.length !== 11) {
				return this.$toast({
					title: '请输入正确的手机号'
				})
			}
			// TODO: 调用获取验证码的API
			this.$toast({
				title: '验证码已发送'
			})
		},
		// 确认修改手机号
		async confirmChange() {
			if (!this.newMobile) {
				return this.$toast({
					title: '请输入手机号'
				})
			}
			if (this.newMobile.length !== 11) {
				return this.$toast({
					title: '请输入正确的手机号'
				})
			}
			if (!this.verifyCode) {
				return this.$toast({
					title: '请输入验证码'
				})
			}
			try {
				const res = await setUserInfo({
					field: this.fieldType,
					value: this.newMobile,
					code: this.verifyCode
				})
				if (res.code == 1) {
					this.$toast({
						title: res.msg || '修改成功'
					});
					// 修改成功后跳转回用户资料页面
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						})
					}, 800)
				} else {
					this.$toast({
						title: res.msg || '修改失败'
					});
				}
			} catch (error) {
				console.error('修改手机号失败:', error)
				this.$toast({
					title: '修改失败，请重试'
				});
			}
		},
		// 获取用户信息
		$getUserInfo() {
			getUserInfo().then(res => {
				if (res.code == 1) {
					// 用户信息已更新
				}
			})
		}
	},
	onLoad() {
		// 页面加载时的初始化
	}
}
</script>

<style lang="scss">
.change-mobile-container {
	background-color: #0D1038;
	min-height: 100vh;
	padding: 10rpx;
	display: flex;
	flex-direction: column;

	.change-mobile {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 20rpx;
		padding-top: 10rpx;

		.input-group {
			width: 100%;
            margin-top: 10rpx;
			margin-bottom: 40rpx;
            padding: 10rpx;

			.mobile-input,
			.code-input {
				width: 100%;
				padding: 20rpx;
				background-color: transparent;
				border: none;
				border-bottom: 1rpx solid #ECECEC;
				color: #FFFFFF;
				font-size: 32rpx;
				box-sizing: border-box;
				height: 80rpx;
				line-height: 80rpx;

				&::placeholder {
					color: #999;
				}
			}
		}

		.mobile-group {
			display: flex;
			align-items: center;
			justify-content: space-between;
			position: relative;
			border-bottom: 1rpx solid #ECECEC;
			padding-bottom: 20rpx;

			.mobile-input {
				flex: 1;
				width: auto;
				border-bottom: none;
				padding-bottom: 0;
			}

			.get-code-text {
				color: #FFE3BB;
				font-size: 28rpx;
				white-space: nowrap;
				margin-left: 20rpx;
				cursor: pointer;
				flex-shrink: 0;
			}
		}

		.btn-group {
			width: 100%;
			margin-top: 40rpx;

			.btn {
				width: 100%;
				height: 88rpx;
				border-radius: 44rpx;
				font-size: 32rpx;
				font-weight: bold;
				color: #333333;
				background: linear-gradient(90deg, #F3BD65 0%, #FDE3B0 50.11%, #F2BC64 100%);
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
}
</style>

<template>
	<view class="change-nickname-container">
		<view class="change-nickname">
			<view class="input-group">
				<input 
					v-model="newNickname" 
					class="nickname-input" 
					maxlength="20"
                    placeholder="请输入昵称"
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
	name: 'changeNickname',
	data() {
		return {
			newNickname: '',
			fieldType: FieldType.NICKNAME
		}
	},
	methods: {
		// 确认修改昵称
		async confirmChange() {
			if (!this.newNickname) {
				return this.$toast({
					title: '请输入新的昵称'
				})
			}
			if (this.newNickname.length < 2) {
				return this.$toast({
					title: '昵称长度不能少于2个字符'
				})
			}
			try {
				const res = await setUserInfo({
					field: this.fieldType,
					value: this.newNickname
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
				console.error('修改昵称失败:', error)
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
.change-nickname-container {
	background-color: #0D1038;
	min-height: 100vh;
	padding: 10rpx;
	display: flex;
	flex-direction: column;
    

	.change-nickname {
		flex: 1;
		display: flex;
		flex-direction: column;
        padding: 20rpx ;
        padding-top: 50rpx;

		.input-group {
			width: 100%;
            margin-top: 10rpx;
			margin-bottom: 40rpx;
            padding: 20rpx ;

			.nickname-input {
				width: 100%;
				padding: 0rpx;
				background-color: transparent;
				border: none;
				border-bottom: 1rpx solid #ECECEC;
				color: #FFFFFF;
				font-size: 32rpx;
				box-sizing: border-box;
                height: 80rpx;
				line-height: 80rpx;

			}
            &::placeholder {
				color: #999;
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

<script>
	import userStore from '@/stores/user'

	export default {
		onLaunch: function() {
			userStore.init()
		},
		onShow: function() {
		},
		onHide: function() {
		}
	}
</script>

<style>
	/*每个页面公共css */
	page {
		background-color: #f8f9fa;
	}

	/* 通用按钮样式 */
	.btn {
		display: inline-block;
		padding: 20rpx 40rpx;
		border-radius: 10rpx;
		text-align: center;
		font-size: 28rpx;
		border: none;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-primary {
		background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
		color: #fff;
	}

	.btn-secondary {
		background: #f5f7fa;
		color: #606266;
		border: 1rpx solid #dcdfe6;
	}

	/* 通用输入框样式 */
	.input {
		padding: 20rpx;
		border: 1rpx solid #dcdfe6;
		border-radius: 8rpx;
		font-size: 28rpx;
		background: #fff;
	}

	.input:focus {
		border-color: #3c9cff;
		outline: none;
	}

	/* 通用卡片样式 */
	.card {
		background: #fff;
		border-radius: 15rpx;
		padding: 30rpx;
		margin: 20rpx 0;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
</style>

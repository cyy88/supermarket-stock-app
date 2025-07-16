<template>
  <view class="content">
    <image class="logo" src="/static/logo.png"></image>
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>

    <!-- 用户信息显示 -->
    <view v-if="userInfo" class="user-info">
      <text class="welcome">欢迎回来，{{ userInfo.accountName }}</text>
      <text class="store">{{ userInfo.storeName }}</text>
    </view>

    <!-- 功能按钮 -->
    <view class="action-buttons">
      <button class="action-btn primary" @click="goToScan">
        📱 开始扫码
      </button>
      <button class="action-btn" @click="logout">
        🚪 退出登录
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import userStore from '@/stores/user'

// 响应式数据
const title = ref('商品扫码系统')
const userInfo = ref(null)

// 生命周期钩子
onMounted(() => {
  checkLoginStatus()
})

// 检查登录状态
const checkLoginStatus = () => {
  if (!userStore.isLoggedIn) {
    // 未登录，跳转到登录页
    uni.reLaunch({
      url: '/pages/login/login'
    })
    return
  }

  // 已登录，显示用户信息
  userInfo.value = userStore.userInfo
}

// 跳转到扫码页面
const goToScan = () => {
  uni.showToast({
    title: '扫码功能开发中...',
    icon: 'none'
  })
}

// 退出登录
const logout = async () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        await userStore.logout()
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    }
  })
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40rpx;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-bottom: 30rpx;
}

.text-area {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 48rpx;
  color: #303133;
  font-weight: bold;
}

.user-info {
  text-align: center;
  margin-bottom: 60rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  min-width: 400rpx;
}

.welcome {
  display: block;
  font-size: 32rpx;
  color: #303133;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.store {
  font-size: 26rpx;
  color: #606266;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  width: 100%;
  max-width: 400rpx;
}

.action-btn {
  height: 90rpx;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  background: #fff;
  color: #606266;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.action-btn:active {
  transform: translateY(2rpx);
}

.action-btn.primary {
  background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
  color: #fff;
}
</style>
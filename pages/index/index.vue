<template>
  <view class="home-container">
    <!-- 固定的顶部区域 -->
    <view class="fixed-header">
      <!-- 顶部装饰背景 -->
      <view class="header-bg">
        <view class="bg-decoration"></view>
        <view class="bg-decoration-2"></view>
      </view>

      <!-- 顶部标题区域 -->
      <view class="header-title">
        <view class="title-content">
          <text class="page-title">🏪 {{ title }}</text>
          <text class="page-subtitle">智能商品管理系统</text>
        </view>
      </view>

      <!-- 用户信息显示 -->
      <view v-if="userInfo" class="user-info">
        <view class="user-avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="user-details">
          <text class="welcome">{{ userInfo.realName || userInfo.accountName }}</text>
          <text class="store">{{ userInfo.storeName || '默认店铺' }}</text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-area">
      <view class="main-content">
        <!-- 功能按钮 -->
        <view class="action-buttons">
          <button class="action-btn primary" @click="goToScan" style="margin-top: 50rpx">
            <view class="btn-content">
              <text class="btn-icon">📱</text>
              <text class="btn-text">开始扫码</text>
            </view>
          </button>
          <button class="action-btn secondary" @click="goToGoodsList">
            <view class="btn-content">
              <text class="btn-icon">📦</text>
              <text class="btn-text">商品管理</text>
            </view>
          </button>
          <button class="action-btn consumables" @click="goToConsumablesList">
            <view class="btn-content">
              <text class="btn-icon">🧴</text>
              <text class="btn-text">消耗品管理</text>
            </view>
          </button>
          <button class="action-btn tertiary" @click="manualAdd">
            <view class="btn-content">
              <text class="btn-icon">➕</text>
              <text class="btn-text">手动添加</text>
            </view>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import userStore from '@/stores/user'
import goodsStore from '@/stores/goods'

const title = ref('商品扫码系统')
const userInfo = ref(null)
const statistics = ref({
  todayCount: 0,
  totalCount: 0
})

onMounted(() => {
  checkLoginStatus()
  goodsStore.init()
})

const checkLoginStatus = async () => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({
      url: '/pages/login/login'
    })
    return
  }

  userInfo.value = userStore.userInfo

  if (!userInfo.value) {
    try {
      await userStore.getUserInfo()
      userInfo.value = userStore.userInfo
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  await loadStatistics()
}

const loadStatistics = async () => {
  statistics.value = {
    todayCount: 0,
    totalCount: 0
  }
}

const goToScan = () => {
  uni.navigateTo({
    url: '/pages/scan/scan'
  })
}

const goToGoodsList = () => {
  uni.switchTab({
    url: '/pages/goods/list'
  })
}

const goToConsumablesList = () => {
  uni.navigateTo({
    url: '/pages/consumables/list'
  })
}

const manualAdd = () => {
  uni.navigateTo({
    url: '/pages/goods/add'
  })
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
  overflow: hidden;
}

/* 顶部装饰背景 */
.header-bg {
  position: relative;
  height: 200rpx;
  overflow: hidden;
  z-index: 0;
}

.bg-decoration {
  position: absolute;
  top: -100rpx;
  right: -100rpx;
  width: 300rpx;
  height: 300rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.bg-decoration-2 {
  position: absolute;
  top: 200rpx;
  left: -50rpx;
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* 顶部标题区域 */
.header-title {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  padding: 80rpx 40rpx 20rpx;
  text-align: center;
}

.title-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
}

/* 固定头部区域 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* 添加状态栏高度适配 */
  padding-top: var(--status-bar-height);
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin: 0 auto 20rpx;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  width: 80%;
  max-width: 600rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 40rpx;
  color: #fff;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.welcome {
  font-size: 32rpx;
  color: #303133;
  font-weight: bold;
}

.store {
  font-size: 26rpx;
  color: #606266;
}

/* 内容区域 */
.content-area {
  position: relative;
  z-index: 1;
  margin-top: calc(260rpx + var(--status-bar-height));
  height: calc(100vh - 260rpx - var(--status-bar-height));
  padding: 0 30rpx;
}

/* 主要内容 */
.main-content {
  padding: 0;
  position: relative;
  z-index: 10;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 滑入动画 */
@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: slideInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(30rpx);

  &:active {
    transform: translateY(-8rpx) scale(0.98);
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  }
}

.stat-icon {
  font-size: 48rpx;
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #91d5ff;
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.stat-number {
  font-size: 36rpx;
  font-weight: bold;
  color: #3c9cff;
}

.stat-label {
  font-size: 24rpx;
  color: #606266;
}

/* 功能按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  align-items: center;
  justify-content: center;
}

.action-btn {
  position: relative;
  padding: 0;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
  opacity: 1;
  width: 65%;
  max-width: 500rpx;

  &:active {
    transform: translateY(-8rpx) scale(0.98);
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  }
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 30rpx;
  padding: 25rpx 40rpx;
  justify-content: flex-start;
  width: 100%;
}

.btn-icon {
  font-size: 44rpx;
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.btn-text {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
  text-align: left;
  padding-left: 0;
}

.action-btn.primary .btn-icon {
  background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
}

.action-btn.secondary .btn-icon {
  background: linear-gradient(135deg, #19be6b 0%, #52c41a 100%);
}

.action-btn.consumables .btn-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.action-btn.tertiary .btn-icon {
  background: linear-gradient(135deg, #ff9900 0%, #ffad33 100%);
}
</style>
<template>
  <view class="content">
<!--    <image class="logo" src="/static/logo.png"></image>-->
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>

    <!-- 用户信息显示 -->
    <view v-if="userInfo" class="user-info">
      <text class="welcome">欢迎回来，{{ userInfo.realName || userInfo.accountName }}</text>
      <text class="store">{{ userInfo.storeName }}</text>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-number">{{ statistics.todayCount }}</text>
        <text class="stat-label">今日添加</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ statistics.totalCount }}</text>
        <text class="stat-label">总商品</text>
      </view>
    </view>

    <!-- 功能按钮 -->
    <view class="action-buttons">
      <button class="action-btn primary" @click="goToScan">
        📱 开始扫码
      </button>
      <button class="action-btn secondary" @click="goToGoodsList">
        📦 商品管理
      </button>
      <button class="action-btn consumables" @click="goToConsumablesList">
        🧴 消耗品管理
      </button>
      <button class="action-btn tertiary" @click="manualAdd">
        ➕ 手动添加
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import userStore from '@/stores/user'
import goodsStore from '@/stores/goods'

// 响应式数据
const title = ref('商品扫码系统')
const userInfo = ref(null)
const statistics = ref({
  todayCount: 0,
  totalCount: 0
})

// 生命周期钩子
onMounted(() => {
  checkLoginStatus()
  goodsStore.init()
})

// 检查登录状态
const checkLoginStatus = async () => {
  if (!userStore.isLoggedIn) {
    // 未登录，跳转到登录页
    uni.reLaunch({
      url: '/pages/login/login'
    })
    return
  }

  // 已登录，显示用户信息
  userInfo.value = userStore.userInfo

  // 如果本地没有用户信息，尝试从服务器获取
  if (!userInfo.value) {
    try {
      await userStore.getUserInfo()
      userInfo.value = userStore.userInfo
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  // 加载统计数据
  await loadStatistics()
}

// 加载统计数据
const loadStatistics = async () => {
  // 暂时使用默认值，避免调用不存在的统计接口
  statistics.value = {
    todayCount: 0,
    totalCount: 0
  }
}

// 跳转到扫码页面
const goToScan = () => {
  uni.navigateTo({
    url: '/pages/scan/scan'
  })
}

// 跳转到商品列表
const goToGoodsList = () => {
  uni.switchTab({
    url: '/pages/goods/list'
  })
}

// 跳转到消耗品列表
const goToConsumablesList = () => {
  uni.navigateTo({
    url: '/pages/consumables/list'
  })
}

// 手动添加商品
const manualAdd = () => {
  uni.navigateTo({
    url: '/pages/goods/add'
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

.stats-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
  width: 100%;
  max-width: 600rpx;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: 30rpx 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.stat-number {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #3c9cff;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
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

.action-btn.secondary {
  background: linear-gradient(135deg, #19be6b 0%, #52c41a 100%);
  color: #fff;
}

.action-btn.consumables {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: #fff;
}

.action-btn.tertiary {
  background: linear-gradient(135deg, #ff9900 0%, #ffad33 100%);
  color: #fff;
}
</style>
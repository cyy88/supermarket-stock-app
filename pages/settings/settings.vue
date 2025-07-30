<template>
  <view class="settings-container">
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
          <text class="page-title">⚙️ 设置中心</text>
          <text class="page-subtitle">个人信息与应用设置</text>
        </view>
      </view>

      <!-- 用户信息卡片 -->
      <view class="user-info-card">
        <view class="user-info">
          <view class="avatar-placeholder">
            <text class="avatar-text">{{ getAvatarText() }}</text>
          </view>
          <view class="user-details">
            <text class="username">{{ userInfo?.realName || userInfo?.accountName || '用户' }}</text>
            <text class="store-name">{{ userInfo?.storeName || '门店' }}</text>
            <text class="merchant-name">{{ userInfo?.merchantName || '' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-area">
      <view class="main-content">
        <!-- 应用信息 -->
        <view class="card" style="margin-top: 90rpx;">
          <view class="card-title">
            <view class="title-icon">ℹ️</view>
            <text class="title-text">应用信息</text>
          </view>
          <view class="info-list">
            <view class="info-item">
              <text class="info-label">应用名称</text>
              <text class="info-value">商品扫码系统</text>
            </view>
            <view class="info-item">
              <text class="info-label">版本号</text>
              <text class="info-value">v1.0.0</text>
            </view>
            <view class="info-item">
              <text class="info-label">服务器地址</text>
              <text class="info-value server-url">{{ serverUrl }}</text>
            </view>
          </view>
        </view>

        <!-- 退出登录 -->
        <view class="logout-section">
          <button class="logout-btn" @click="handleLogout">
            <view class="logout-content">
              <view class="logout-icon">🚪</view>
              <text class="logout-text">退出登录</text>
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

const userInfo = ref(null)
const serverUrl = ref('http://msbs-fuint-ts.qingchunnianhua.com:1880')

onMounted(async () => {
  userInfo.value = userStore.userInfo

  if (!userInfo.value) {
    try {
      await userStore.getUserInfo()
      userInfo.value = userStore.userInfo
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

})

const getAvatarText = () => {
  const name = userInfo.value?.realName || userInfo.value?.accountName || '用户'
  return name.charAt(name.length - 1)
}

const goToStockAdd = () => {
  uni.navigateTo({
    url: '/pages/stock/add'
  })
}

const goToStockList = () => {
  uni.navigateTo({
    url: '/pages/stock/list'
  })
}

const handleLogout = () => {
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

<style lang="scss" scoped>
.settings-container {
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

/* 用户信息卡片 */
.user-info-card {
  margin: 0 20rpx 20rpx;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.user-info {
  display: flex;
  align-items: center;

  .avatar-placeholder {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(60, 156, 255, 0.3);

    .avatar-text {
      font-size: 40rpx;
      font-weight: bold;
      color: #fff;
    }
  }

  .user-details {
    flex: 1;

    .username {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      color: #303133;
      margin-bottom: 8rpx;
    }

    .store-name {
      display: block;
      font-size: 26rpx;
      color: #606266;
      margin-bottom: 4rpx;
    }

    .merchant-name {
      font-size: 22rpx;
      color: #909399;
    }
  }
}



/* 内容区域 */
.content-area {
  position: relative;
  z-index: 1;
  margin-top: calc(320rpx + var(--status-bar-height));
  height: calc(100vh - 320rpx - var(--status-bar-height));
}

/* 主要内容 */
.main-content {
  padding: 20rpx 30rpx 120rpx;
  position: relative;
  z-index: 10;
  background: transparent;
}

/* 卡片样式 */
.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25rpx;
  padding: 30rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  opacity: 1;
  margin-right: 0rpx;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-title {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 30rpx;

  .title-icon {
    font-size: 32rpx;
  }

  .title-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #303133;
  }
}

.setting-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 16rpx;
  transition: all 0.3s ease;

  &:active {
    background: rgba(233, 236, 239, 0.9);
    transform: scale(0.98);
  }

  .setting-info {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .setting-icon-wrapper {
      width: 48rpx;
      height: 48rpx;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .setting-icon {
        font-size: 24rpx;
        color: #fff;
      }
    }

    .stock-icon {
      background: linear-gradient(135deg, #50C878 0%, #228B22 100%);
    }

    .record-icon {
      background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
    }

    .setting-name {
      font-size: 28rpx;
      color: #303133;
      font-weight: 500;
    }
  }

  .setting-action {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .setting-desc {
      font-size: 24rpx;
      color: #909399;
    }

    .arrow {
      font-size: 24rpx;
      color: #c0c4cc;
    }
  }
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid rgba(240, 240, 240, 0.6);

  &:last-child {
    border-bottom: none;
  }

  .info-label {
    font-size: 28rpx;
    color: #606266;
    font-weight: 500;
  }

  .info-value {
    font-size: 28rpx;
    color: #303133;

    &.server-url {
      font-size: 22rpx;
      color: #909399;
      max-width: 350rpx;
      text-align: right;
      word-break: break-all;
      line-height: 1.4;
    }
  }
}

/* 退出登录 */
.logout-section {
  padding: 20rpx 0;
  margin-right: 0rpx;
}

.logout-btn {
  width: 100%;
  padding: 0;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
  }
}

.logout-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 24rpx;
}

.logout-icon {
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, #f56c6c 0%, #ff4757 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #fff;
}

.logout-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #f56c6c;
}
</style>

<template>
  <view class="settings-container">
    <!-- 用户信息卡片 -->
    <view class="card user-card">
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

    <!-- 功能设置 -->
    <view class="card">
      <view class="card-title">⚙️ 功能设置</view>
      <view class="setting-list">
        <view class="setting-item" @click="goToStockAdd">
          <view class="setting-info">
            <text class="setting-icon">📦</text>
            <text class="setting-name">库存入库</text>
          </view>
          <view class="setting-action">
            <text class="setting-desc">添加商品库存</text>
            <text class="arrow">→</text>
          </view>
        </view>

        <view class="setting-item" @click="goToStockList">
          <view class="setting-info">
            <text class="setting-icon">📋</text>
            <text class="setting-name">入库记录</text>
          </view>
          <view class="setting-action">
            <text class="setting-desc">查看入库记录</text>
            <text class="arrow">→</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 应用信息 -->
    <view class="card">
      <view class="card-title">ℹ️ 应用信息</view>
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
        🚪 退出登录
      </button>
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
  return name.charAt(name.length - 1) // 取最后一个字符作为头像
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
  padding: 20rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
  margin-bottom: 30rpx;
}

.user-card {
  .user-info {
    display: flex;
    align-items: center;

    .avatar-placeholder {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      margin-right: 30rpx;
      background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
      display: flex;
      align-items: center;
      justify-content: center;

      .avatar-text {
        font-size: 48rpx;
        font-weight: bold;
        color: #fff;
      }
    }

    .user-details {
      flex: 1;

      .username {
        display: block;
        font-size: 36rpx;
        font-weight: bold;
        color: #303133;
        margin-bottom: 8rpx;
      }

      .store-name {
        display: block;
        font-size: 28rpx;
        color: #606266;
        margin-bottom: 4rpx;
      }

      .merchant-name {
        font-size: 24rpx;
        color: #909399;
      }
    }
  }
}



.setting-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
  transition: all 0.3s;

  &:active {
    background: #e9ecef;
    transform: scale(0.98);
  }

  .setting-info {
    display: flex;
    align-items: center;

    .setting-icon {
      font-size: 36rpx;
      margin-right: 20rpx;
    }

    .setting-name {
      font-size: 30rpx;
      color: #303133;
      font-weight: 500;
    }
  }

  .setting-action {
    display: flex;
    align-items: center;

    .setting-desc {
      font-size: 24rpx;
      color: #909399;
      margin-right: 15rpx;
    }

    .arrow {
      font-size: 28rpx;
      color: #c0c4cc;
    }
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .info-label {
    font-size: 28rpx;
    color: #606266;
  }

  .info-value {
    font-size: 28rpx;
    color: #303133;

    &.server-url {
      font-size: 24rpx;
      color: #909399;
      max-width: 400rpx;
      text-align: right;
      word-break: break-all;
    }
  }
}

.logout-section {
  padding: 40rpx 0;
}

.logout-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #f56c6c 0%, #ff4757 100%);
  color: #fff;
  border: none;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
  transition: all 0.3s;

  &:active {
    transform: translateY(2rpx);
  }
}
</style>

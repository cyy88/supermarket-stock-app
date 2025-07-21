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

    <!-- 数据统计卡片 -->
    <view class="card stats-card">
      <view class="card-title">📊 数据统计</view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-number">{{ statistics.totalCount }}</text>
          <text class="stat-label">总商品数</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ statistics.todayCount }}</text>
          <text class="stat-label">今日添加</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ statistics.unsyncedCount }}</text>
          <text class="stat-label">待同步</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ syncedCount }}</text>
          <text class="stat-label">已同步</text>
        </view>
      </view>
    </view>

    <!-- 功能设置 -->
    <view class="card">
      <view class="card-title">⚙️ 功能设置</view>
      <view class="setting-list">
        <view class="setting-item" @click="manualSync">
          <view class="setting-info">
            <text class="setting-icon">🔄</text>
            <text class="setting-name">数据同步</text>
          </view>
          <view class="setting-action">
            <text class="setting-desc">同步本地数据到服务器</text>
            <text class="arrow">→</text>
          </view>
        </view>

        <view class="setting-item" @click="clearCache">
          <view class="setting-info">
            <text class="setting-icon">🗑️</text>
            <text class="setting-name">清除缓存</text>
          </view>
          <view class="setting-action">
            <text class="setting-desc">清除本地缓存数据</text>
            <text class="arrow">→</text>
          </view>
        </view>

        <view class="setting-item" @click="exportData">
          <view class="setting-info">
            <text class="setting-icon">📤</text>
            <text class="setting-name">导出数据</text>
          </view>
          <view class="setting-action">
            <text class="setting-desc">导出商品数据</text>
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
import { ref, computed, onMounted } from 'vue'
import userStore from '@/stores/user'
import goodsStore from '@/stores/goods'

// 响应式数据
const userInfo = ref(null)
const serverUrl = ref('http://msbs-fuint-ts.qingchunnianhua.com:1880')
const statistics = ref({
  todayCount: 0,
  totalCount: 0,
  unsyncedCount: 0
})

// 计算属性
const syncedCount = computed(() => {
  return goodsStore.localGoods.filter(item => item.syncStatus === 1).length
})

// 页面加载
onMounted(async () => {
  userInfo.value = userStore.userInfo
  goodsStore.init()

  // 如果没有用户信息，尝试获取
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
})

// 加载统计数据
const loadStatistics = async () => {
  try {
    const stats = await goodsStore.fetchStatistics()
    statistics.value = stats
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 使用默认值
    statistics.value = {
      todayCount: goodsStore.todayCount,
      totalCount: goodsStore.localGoods.length,
      unsyncedCount: goodsStore.unsyncedCount
    }
  }
}

// 获取头像文字
const getAvatarText = () => {
  const name = userInfo.value?.realName || userInfo.value?.accountName || '用户'
  return name.charAt(name.length - 1) // 取最后一个字符作为头像
}

// 手动同步
const manualSync = async () => {
  const unsyncedGoods = goodsStore.getUnsyncedGoods()
  
  if (unsyncedGoods.length === 0) {
    uni.showToast({
      title: '没有待同步数据',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '数据同步',
    content: `发现 ${unsyncedGoods.length} 个待同步商品，是否立即同步？`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({
          title: '同步中...'
        })

        try {
          // 这里应该调用同步管理器
          // await SyncManager.manualSync()
          
          // 模拟同步过程
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          uni.showToast({
            title: '同步完成',
            icon: 'success'
          })
        } catch (error) {
          uni.showToast({
            title: '同步失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 清除缓存
const clearCache = () => {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除所有本地缓存数据吗？此操作不可恢复。',
    success: (res) => {
      if (res.confirm) {
        // 清除商品数据
        uni.removeStorageSync('localGoods')
        uni.removeStorageSync('categories')
        uni.removeStorageSync('recentScans')
        
        // 重新初始化
        goodsStore.init()
        
        uni.showToast({
          title: '缓存已清除',
          icon: 'success'
        })
      }
    }
  })
}

// 导出数据
const exportData = () => {
  const goods = goodsStore.localGoods
  
  if (goods.length === 0) {
    uni.showToast({
      title: '没有数据可导出',
      icon: 'none'
    })
    return
  }

  // 生成CSV格式数据
  const csvData = generateCSV(goods)
  
  // 在实际应用中，这里应该保存文件或分享数据
  uni.showModal({
    title: '导出数据',
    content: `共 ${goods.length} 条商品数据，是否复制到剪贴板？`,
    success: (res) => {
      if (res.confirm) {
        uni.setClipboardData({
          data: csvData,
          success: () => {
            uni.showToast({
              title: '已复制到剪贴板',
              icon: 'success'
            })
          }
        })
      }
    }
  })
}

// 生成CSV数据
const generateCSV = (goods) => {
  const headers = ['商品名称', '条码', '分类', '价格', '库存', '状态', '创建时间']
  const rows = goods.map(item => [
    item.name,
    item.goodsNo,
    item.cateName || '未分类',
    item.price,
    item.stock,
    item.syncStatus === 1 ? '已同步' : '待同步',
    new Date(item.createTime).toLocaleString()
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

// 退出登录
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

.stats-card {
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30rpx;
  }

  .stat-item {
    text-align: center;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 15rpx;

    .stat-number {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      color: #3c9cff;
      margin-bottom: 10rpx;
    }

    .stat-label {
      font-size: 24rpx;
      color: #909399;
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

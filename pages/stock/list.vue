<template>
  <view class="stock-list-container">
    <!-- 顶部装饰背景 -->
    <view class="header-bg">
      <view class="bg-decoration"></view>
      <view class="bg-decoration-2"></view>
    </view>

    <!-- 顶部标题区域 -->
    <view class="header-title">
      <view class="title-content">
        <text class="page-title">📦 库存管理</text>
        <text class="page-subtitle">轻松管理您的商品库存</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-container">
      <view class="search-wrapper">
        <view class="search-icon">🔍</view>
        <input
          v-model="searchKeyword"
          placeholder="搜索说明备注..."
          class="search-input"
          @confirm="handleSearch"
        />
        <view v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</view>
      </view>
    </view>

    <!-- 状态筛选标签 -->
    <view class="filter-container">
      <scroll-view class="filter-scroll" scroll-x>
        <view class="filter-tabs">
          <view
            class="filter-tab"
            :class="{ active: statusFilter === 'all' }"
            @click="setStatusFilter('all')"
          >
            <text class="filter-icon">📋</text>
            <text class="filter-text">全部</text>
          </view>
          <view
            class="filter-tab"
            :class="{ active: statusFilter === '待审核' }"
            @click="setStatusFilter('待审核')"
          >
            <text class="filter-icon">⏳</text>
            <text class="filter-text">待审核</text>
          </view>
          <view
            class="filter-tab"
            :class="{ active: statusFilter === '已通过' }"
            @click="setStatusFilter('已通过')"
          >
            <text class="filter-icon">✅</text>
            <text class="filter-text">已通过</text>
          </view>
          <view
            class="filter-tab"
            :class="{ active: statusFilter === '未通过' }"
            @click="setStatusFilter('未通过')"
          >
            <text class="filter-icon">❌</text>
            <text class="filter-text">未通过</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 入库记录列表 -->
    <scroll-view
      class="stock-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view v-if="loading" class="loading-container">
        <view class="loading-animation">
          <view class="loading-dot"></view>
          <view class="loading-dot"></view>
          <view class="loading-dot"></view>
        </view>
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="filteredList.length === 0" class="empty-container">
        <view class="empty-animation">
          <text class="empty-icon">📦</text>
          <view class="empty-circle"></view>
        </view>
        <text class="empty-title">暂无入库记录</text>
        <text class="empty-subtitle">点击右下角按钮添加新记录</text>
      </view>

      <view v-else class="list-content">
        <view
          v-for="(item, index) in filteredList"
          :key="item.id"
          class="stock-item"
          :style="{ animationDelay: index * 0.1 + 's' }"
          @click.stop="viewDetail(item)"
          @touchstart="handleTouchStart"
        >
          <!-- 卡片装饰 -->
          <view class="card-decoration" :class="getCardDecorationClass(item.reviewStatus)"></view>

          <view class="item-header">
            <view class="item-left">
              <view class="item-icon" :class="getStatusClass(item.reviewStatus)">
                {{ getStatusIcon(item.reviewStatus) }}
              </view>
              <view class="item-info">
                <text class="item-id">#{{ item.id }}</text>
                <view class="item-type-badge">
                  <text class="type-icon">{{ item.type === 'increase' ? '📈' : '📉' }}</text>
                  <text class="type-text">{{ item.type === 'increase' ? '入库' : '出库' }}</text>
                </view>
              </view>
            </view>
            <view class="status-badge" :class="getStatusClass(item.reviewStatus)">
              <text class="status-text">{{ item.reviewStatus || '待审核' }}</text>
            </view>
          </view>

          <view class="item-content">
            <view class="info-row">
              <view class="info-item">
                <text class="info-icon">🏪</text>
                <text class="info-label">店铺</text>
                <text class="info-value">{{ getStoreName(item.storeId) }}</text>
              </view>
            </view>

            <view class="info-row" v-if="item.description">
              <view class="info-item">
                <text class="info-icon">📝</text>
                <text class="info-label">说明</text>
                <text class="info-value">{{ item.description }}</text>
              </view>
            </view>

            <view class="info-row">
              <view class="info-item">
                <text class="info-icon">🕒</text>
                <text class="info-label">入库时间</text>
                <text class="info-value">{{ formatTime(item.updateTime || item.createTime) }}</text>
              </view>
            </view>

            <view class="info-row" v-if="item.reviewDesc">
              <view class="info-item review-item">
                <text class="info-icon">💬</text>
                <text class="info-label">审核说明</text>
                <text class="info-value review-desc">{{ item.reviewDesc }}</text>
              </view>
            </view>
          </view>

          <!-- 点击指示器 -->
          <view class="click-indicator">
            <text class="indicator-text">点击查看详情</text>
            <text class="indicator-arrow">→</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 分页加载 -->
    <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
      <view class="load-more-content">
        <text class="load-more-icon">⬇️</text>
        <text class="load-more-text">加载更多</text>
      </view>
    </view>

    <!-- 浮动添加按钮 -->
    <view class="fab" @click="goToAddStock">
      <view class="fab-bg"></view>
      <text class="fab-icon">+</text>
      <view class="fab-ripple"></view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getStockList } from '@/api/stock'

const loading = ref(false)
const refreshing = ref(false)
const stockList = ref([])
const searchKeyword = ref('')
const statusFilter = ref('all')
const storeOptions = ref([])
const imagePath = ref('')

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const hasMore = computed(() => {
  return stockList.value.length < pagination.total
})

const filteredList = computed(() => {
  let list = stockList.value

  if (statusFilter.value !== 'all') {
    list = list.filter(item => item.reviewStatus === statusFilter.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(item =>
      (item.description && item.description.toLowerCase().includes(keyword))
    )
  }

  return list
})

onMounted(() => {
  loadStockList()
})

const loadStockList = async (isLoadMore = false) => {
  if (loading.value) return

  loading.value = true

  try {
    const params = {
      page: isLoadMore ? pagination.page + 1 : 1,
      pageSize: pagination.pageSize,
      type: 'increase' // 只查询入库记录
    }

    const response = await getStockList(params)

    if (response.data) {
      const newList = response.data.paginationResponse.content || []

      if (isLoadMore) {
        stockList.value = [...stockList.value, ...newList]
        pagination.page++
      } else {
        stockList.value = newList
        pagination.page = 1
      }

      pagination.total = response.data.paginationResponse.totalElements || 0
      storeOptions.value = response.data.storeList || []
      imagePath.value = response.data.imagePath || ''
    }
  } catch (error) {
    uni.showToast({
      title: '获取数据失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
}

const clearSearch = () => {
  searchKeyword.value = ''
}

const setStatusFilter = (status) => {
  statusFilter.value = status
}

const onRefresh = () => {
  refreshing.value = true
  loadStockList().finally(() => {
    refreshing.value = false
  })
}

const loadMore = () => {
  if (!loading.value && hasMore.value) {
    loadStockList(true)
  }
}

const getStoreName = (storeId) => {
  if (!storeId || storeId === 0) return '公共所有'
  const store = storeOptions.value.find(s => s.id === storeId)
  return store ? store.name : '未知店铺'
}

const getStatusClass = (status) => {
  switch (status) {
    case '已通过': return 'status-success'
    case '待审核': return 'status-warning'
    case '未通过': return 'status-danger'
    default: return 'status-default'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case '已通过': return '✅'
    case '待审核': return '⏳'
    case '未通过': return '❌'
    default: return '📋'
  }
}

const getCardDecorationClass = (status) => {
  switch (status) {
    case '已通过': return 'decoration-success'
    case '待审核': return 'decoration-warning'
    case '未通过': return 'decoration-danger'
    default: return 'decoration-default'
  }
}

const formatTime = (timeStr) => {
  if (!timeStr) return '--'
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 查看详情
const viewDetail = (item) => {
  if (!item || !item.id) {
    uni.showToast({
      title: '记录ID不存在',
      icon: 'none'
    })
    return
  }

  uni.navigateTo({
    url: `/pages/stock/detail?id=${item.id}`,
    success: () => {
    },
    fail: (error) => {
      uni.showToast({
        title: '页面跳转失败',
        icon: 'none'
      })
    }
  })
}

const handleTouchStart = () => {
}

const goToAddStock = () => {
  uni.navigateTo({
    url: '/pages/stock/add'
  })
}
</script>

<style scoped>
.stock-list-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
  overflow: hidden;
}

/* 顶部装饰背景 */
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
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
  position: relative;
  z-index: 1;
  padding: 60rpx 40rpx 40rpx;
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


/* 搜索容器 */
.search-container {
  position: relative;
  z-index: 1;
  padding: 0 40rpx 30rpx;
}

.search-wrapper {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50rpx;
  padding: 20rpx 60rpx 20rpx 60rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 24rpx;
  font-size: 32rpx;
  color: #999;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 28rpx;
  color: #333;
  background: transparent;
}

.search-input::placeholder {
  color: #999;
}

.clear-icon {
  position: absolute;
  right: 24rpx;
  font-size: 24rpx;
  color: #999;
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f0f0f0;
}

/* 筛选容器 */
.filter-container {
  position: relative;
  z-index: 1;
  padding: 0 40rpx 30rpx;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-tabs {
  display: flex;
  gap: 20rpx;
  padding: 0 10rpx;
}

.filter-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 25rpx;
  min-width: 120rpx;
  backdrop-filter: blur(10px);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.filter-tab.active {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.15);
}

.filter-icon {
  font-size: 32rpx;
  margin-bottom: 8rpx;
}

.filter-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

.filter-tab.active .filter-text {
  color: #333;
}

/* 列表容器 */
.stock-list {
  position: relative;
  z-index: 1;
  padding: 0 40rpx;
  padding-bottom: 200rpx;
}

.list-content {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  padding-right: 140rpx; /* 增加右边距，避免被浮动按钮遮挡 */
}

/* 加载和空状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;
}

.loading-animation {
  display: flex;
  gap: 10rpx;
  margin-bottom: 30rpx;
}

.loading-dot {
  width: 12rpx;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: loading-bounce 1.4s ease-in-out infinite both;
}

.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes loading-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.loading-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;
}

.empty-animation {
  position: relative;
  margin-bottom: 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  position: relative;
  z-index: 2;
}

.empty-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200rpx;
  height: 200rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: empty-rotate 3s linear infinite;
}

@keyframes empty-rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.empty-title {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.empty-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;
}

/* 库存项目卡片 */
.stock-item {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: slideInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(30rpx);
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stock-item:active {
  transform: translateY(-8rpx) scale(0.98);
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
}

.card-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 8rpx;
  height: 100%;
  border-radius: 30rpx 0 0 30rpx;
}

.decoration-success {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.decoration-warning {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
}

.decoration-danger {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
}

.decoration-default {
  background: linear-gradient(135deg, #d9d9d9 0%, #f0f0f0 100%);
}

/* 卡片头部 */
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.item-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.item-icon.status-success {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
}

.item-icon.status-warning {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
  color: #fff;
}

.item-icon.status-danger {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: #fff;
}

.item-icon.status-default {
  background: linear-gradient(135deg, #d9d9d9 0%, #f0f0f0 100%);
  color: #666;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-id {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.item-type-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 16rpx;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
  border-radius: 20rpx;
  border: 1rpx solid #91d5ff;
}

.type-icon {
  font-size: 20rpx;
}

.type-text {
  font-size: 22rpx;
  color: #1890ff;
  font-weight: 500;
}

.status-badge {
  padding: 12rpx 24rpx;
  border-radius: 25rpx;
  font-size: 24rpx;
  font-weight: bold;
  border: 2rpx solid transparent;
}

.status-badge.status-success {
  background: linear-gradient(135deg, #f6ffed 0%, #f0fff4 100%);
  color: #52c41a;
  border-color: #b7eb8f;
}

.status-badge.status-warning {
  background: linear-gradient(135deg, #fffbe6 0%, #fffff0 100%);
  color: #faad14;
  border-color: #ffe58f;
}

.status-badge.status-danger {
  background: linear-gradient(135deg, #fff2f0 0%, #fff5f5 100%);
  color: #ff4d4f;
  border-color: #ffccc7;
}

.status-badge.status-default {
  background: linear-gradient(135deg, #f0f0f0 0%, #f8f8f8 100%);
  color: #666;
  border-color: #d9d9d9;
}

/* 卡片内容 */
.item-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.info-row {
  display: flex;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  flex: 1;
}

.info-icon {
  font-size: 24rpx;
  width: 32rpx;
  text-align: center;
  margin-top: 4rpx;
}

.info-label {
  font-size: 24rpx;
  color: #666;
  min-width: 80rpx;
  margin-top: 4rpx;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  line-height: 1.4;
}

.review-item {
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 15rpx;
  border-left: 4rpx solid #1890ff;
}

.review-desc {
  font-style: italic;
  color: #555;
}

/* 点击指示器 */
.click-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-top: 1rpx solid #f0f0f0;
  margin-top: 10rpx;
}

.indicator-text {
  font-size: 24rpx;
  color: #999;
}

.indicator-arrow {
  font-size: 24rpx;
  color: #1890ff;
  font-weight: bold;
}
/* 加载更多 */
.load-more {
  display: flex;
  justify-content: center;
  padding: 40rpx;
  margin-top: 20rpx;
}

.load-more-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 40rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.load-more-icon {
  font-size: 24rpx;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10rpx); }
  60% { transform: translateY(-5rpx); }
}

.load-more-text {
  font-size: 28rpx;
  color: #1890ff;
  font-weight: 500;
}

/* 浮动添加按钮 */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx; /* 向上移动，避免被底部导航栏遮挡 */
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.fab-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #ff9ff3 100%);
  border-radius: 50%;
  box-shadow: 0 8rpx 30rpx rgba(255, 107, 107, 0.4);
}

.fab-icon {
  position: relative;
  z-index: 2;
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.fab-ripple {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation: ripple 2s infinite;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.fab:active {
  transform: scale(0.9);
}

.fab:hover .fab-bg {
  box-shadow: 0 12rpx 40rpx rgba(255, 107, 107, 0.6);
}
</style>

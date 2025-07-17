<template>
  <view class="goods-list-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input 
          v-model="searchKeyword"
          placeholder="搜索商品名称或条码"
          class="search-input"
          @input="onSearchInput"
        />
        <text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
      </view>
    </view>

    <!-- 数据源切换 -->
    <view class="data-source-switch">
      <view class="switch-tabs">
        <view
          class="switch-tab"
          :class="{ active: showServerData }"
          @click="switchToServerData"
        >
          服务器数据
        </view>
        <view
          class="switch-tab"
          :class="{ active: !showServerData }"
          @click="switchToLocalData"
        >
          本地数据
        </view>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-number">{{ filteredGoods.length }}</text>
        <text class="stat-label">{{ showServerData ? '服务器商品' : '本地商品' }}</text>
      </view>
      <view v-if="!showServerData" class="stat-item">
        <text class="stat-number success">{{ syncedCount }}</text>
        <text class="stat-label">已同步</text>
      </view>
      <view v-if="!showServerData" class="stat-item">
        <text class="stat-number warning">{{ unsyncedCount }}</text>
        <text class="stat-label">待同步</text>
      </view>
      <view v-if="showServerData" class="stat-item">
        <text class="stat-number info">{{ currentPage }}</text>
        <text class="stat-label">当前页</text>
      </view>
      <view v-if="showServerData" class="stat-item">
        <text class="stat-number info">{{ totalPages }}</text>
        <text class="stat-label">总页数</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-list">
      <view 
        v-for="item in filteredGoods" 
        :key="item.id"
        class="goods-item"
        @click="goToDetail(item)"
      >
        <view class="goods-image">
          <image
            v-if="getGoodsImage(item)"
            :src="getGoodsImage(item)"
            mode="aspectFill"
            class="image"
          />
          <view v-else class="no-image">
            <text>📦</text>
          </view>
        </view>

        <view class="goods-info">
          <view class="goods-header">
            <view class="goods-name">{{ item.name }}</view>
            <text class="price">¥{{ item.price }}</text>
          </view>

          <view class="goods-details">
            <view class="detail-left">
              <view class="detail-item">
                <text class="label">条码:</text>
                <text class="value">{{ item.goodsNo }}</text>
              </view>
              <view class="detail-item">
                <text class="label">分类:</text>
                <text class="value">{{ getGoodsCategory(item) }}</text>
              </view>
            </view>

            <view class="detail-right">
              <view class="detail-item">
                <text class="label">剩余:</text>
                <text class="value stock-value" :class="getStockStatusClass(item)">{{ item.stock }}</text>
              </view>
              <view class="detail-item">
                <text class="label">安全:</text>
                <text class="value">{{ item.safetyStock || 0 }}</text>
              </view>
            </view>
          </view>

          <view class="goods-status">
            <text class="status-badge" :class="getStockStatusClass(item)">
              {{ getStockStatusText(item) }}
            </text>
          </view>
        </view>

        <view class="goods-actions">
          <view v-if="!showServerData" class="sync-status" :class="getSyncStatusClass(item.syncStatus)">
            {{ getSyncStatusText(item.syncStatus) }}
          </view>
          <text class="arrow">→</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <view v-else-if="filteredGoods.length === 0" class="empty-state">
      <text class="empty-icon">📦</text>
      <text class="empty-text">
        {{ searchKeyword ? '没有找到相关商品' : (showServerData ? '服务器暂无商品数据' : '还没有添加商品') }}
      </text>
      <button v-if="!searchKeyword && !showServerData" class="add-btn" @click="goToAdd">
        ➕ 添加第一个商品
      </button>
    </view>

    <!-- 浮动添加按钮 -->
    <view class="fab" @click="goToAdd">
      <text class="fab-icon">➕</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import goodsStore from '@/stores/goods'
import { getGoodsList } from '@/api/goods'

// 响应式数据
const searchKeyword = ref('')
const goodsList = ref([])
const serverGoodsList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const showServerData = ref(true) // 默认显示服务器数据

// 计算属性
const filteredGoods = computed(() => {
  const dataSource = showServerData.value ? serverGoodsList.value : goodsList.value

  if (!searchKeyword.value) {
    return dataSource
  }

  const keyword = searchKeyword.value.toLowerCase()
  return dataSource.filter(item =>
    item.name.toLowerCase().includes(keyword) ||
    item.goodsNo.toLowerCase().includes(keyword) ||
    (item.cateInfo?.name && item.cateInfo.name.toLowerCase().includes(keyword))
  )
})

const syncedCount = computed(() => {
  return goodsList.value.filter(item => item.syncStatus === 1).length
})

const unsyncedCount = computed(() => {
  return goodsList.value.filter(item => item.syncStatus === 0).length
})

// 页面加载
onMounted(() => {
  loadGoodsList()
  loadServerGoodsList()
})

// 加载本地商品列表
const loadGoodsList = () => {
  goodsStore.init()
  goodsList.value = goodsStore.localGoods.sort((a, b) => b.createTime - a.createTime)
}

// 加载服务器商品列表
const loadServerGoodsList = async () => {
  try {
    loading.value = true
    const res = await getGoodsList({
      page: currentPage.value,
      pageSize: 20
    })

    if (res.data && res.data.paginationResponse) {
      serverGoodsList.value = res.data.paginationResponse.content || []
      totalPages.value = res.data.paginationResponse.totalPages || 1
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    uni.showToast({
      title: '获取商品列表失败',
      icon: 'none'
    })
    // 失败时显示本地数据
    showServerData.value = false
  } finally {
    loading.value = false
  }
}

// 搜索输入
const onSearchInput = () => {
  // 实时搜索，这里可以添加防抖逻辑
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
}

// 切换到服务器数据
const switchToServerData = () => {
  showServerData.value = true
  if (serverGoodsList.value.length === 0) {
    loadServerGoodsList()
  }
}

// 切换到本地数据
const switchToLocalData = () => {
  showServerData.value = false
  loadGoodsList()
}

// 获取商品图片
const getGoodsImage = (item) => {
  if (showServerData.value) {
    return item.logo || (item.images && item.images.length > 0 ? item.images[0] : null)
  } else {
    return item.images && item.images.length > 0 ? item.images[0] : null
  }
}

// 获取商品分类
const getGoodsCategory = (item) => {
  if (showServerData.value) {
    return item.cateInfo?.name || '未分类'
  } else {
    return item.cateName || '未分类'
  }
}

// 获取库存状态样式
const getStockStatusClass = (item) => {
  const safetyStock = item.safetyStock || 0
  const currentStock = item.stock || 0

  if (currentStock <= 0) {
    return 'out-of-stock'
  } else if (currentStock <= safetyStock) {
    return 'low-stock'
  } else {
    return 'normal-stock'
  }
}

// 获取库存状态文本
const getStockStatusText = (item) => {
  const safetyStock = item.safetyStock || 0
  const currentStock = item.stock || 0

  if (currentStock <= 0) {
    return '缺货'
  } else if (currentStock <= safetyStock) {
    return '库存不足'
  } else {
    return '库存正常'
  }
}

// 获取同步状态样式类
const getSyncStatusClass = (status) => {
  switch (status) {
    case 1: return 'synced'
    case 2: return 'failed'
    default: return 'pending'
  }
}

// 获取同步状态文本
const getSyncStatusText = (status) => {
  switch (status) {
    case 1: return '已同步'
    case 2: return '同步失败'
    default: return '待同步'
  }
}

// 跳转到商品详情
const goToDetail = (item) => {
  console.log('点击商品详情，商品信息:', item)

  // 如果是服务器数据，直接跳转，让详情页面去请求服务器数据
  if (showServerData.value && item.id) {
    console.log('跳转到服务器商品详情，ID:', item.id)
    uni.navigateTo({
      url: `/pages/goods/detail?id=${item.id}&source=server`
    })
    return
  }

  // 如果是本地数据，正常跳转
  if (item.id) {
    console.log('跳转到本地商品详情，ID:', item.id)
    uni.navigateTo({
      url: `/pages/goods/detail?id=${item.id}&source=local`
    })
  } else {
    uni.showToast({
      title: '商品ID不存在',
      icon: 'none'
    })
  }
}

// 跳转到添加商品
const goToAdd = () => {
  uni.navigateTo({
    url: '/pages/goods/add'
  })
}

// 页面显示时刷新数据
// onShow(() => {
//   loadGoodsList()
// })
</script>

<style lang="scss" scoped>
.goods-list-container {
  padding: 20rpx;
  background: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 120rpx; // 为浮动按钮留空间
}

.search-bar {
  margin-bottom: 20rpx;

  .search-input-wrapper {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 50rpx;
    padding: 0 30rpx;
    height: 80rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

    .search-icon {
      font-size: 32rpx;
      color: #c0c4cc;
      margin-right: 20rpx;
    }

    .search-input {
      flex: 1;
      font-size: 28rpx;
      color: #303133;
    }

    .clear-icon {
      font-size: 28rpx;
      color: #c0c4cc;
      cursor: pointer;
    }
  }
}

.data-source-switch {
  margin-bottom: 20rpx;

  .switch-tabs {
    display: flex;
    background: #fff;
    border-radius: 50rpx;
    padding: 8rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

    .switch-tab {
      flex: 1;
      text-align: center;
      padding: 20rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      color: #606266;
      transition: all 0.3s;

      &.active {
        background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
        color: #fff;
        font-weight: bold;
      }
    }
  }
}

.stats-bar {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .stat-item {
    flex: 1;
    text-align: center;

    .stat-number {
      display: block;
      font-size: 36rpx;
      font-weight: bold;
      color: #303133;
      margin-bottom: 8rpx;

      &.success {
        color: #19be6b;
      }

      &.warning {
        color: #ff9900;
      }

      &.info {
        color: #3c9cff;
      }
    }

    .stat-label {
      font-size: 24rpx;
      color: #909399;
    }
  }
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.goods-item {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  }
}

.goods-image {
  width: 120rpx;
  height: 120rpx;
  margin-right: 30rpx;

  .image {
    width: 100%;
    height: 100%;
    border-radius: 15rpx;
  }

  .no-image {
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    border-radius: 15rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48rpx;
    color: #c0c4cc;
  }
}

.goods-info {
  flex: 1;

  .goods-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15rpx;

    .goods-name {
      flex: 1;
      font-size: 30rpx;
      font-weight: bold;
      color: #303133;
      line-height: 1.4;
      margin-right: 20rpx;
    }

    .price {
      font-size: 32rpx;
      font-weight: bold;
      color: #f56c6c;
      white-space: nowrap;
    }
  }

  .goods-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15rpx;

    .detail-left,
    .detail-right {
      flex: 1;
    }

    .detail-item {
      display: flex;
      align-items: center;
      margin-bottom: 8rpx;

      .label {
        font-size: 22rpx;
        color: #909399;
        width: 60rpx;
        flex-shrink: 0;
      }

      .value {
        font-size: 24rpx;
        color: #606266;
        flex: 1;

        &.stock-value {
          font-weight: bold;

          &.normal-stock {
            color: #19be6b;
          }

          &.low-stock {
            color: #ff9900;
          }

          &.out-of-stock {
            color: #f56c6c;
          }
        }
      }
    }
  }

  .goods-status {
    display: flex;
    justify-content: flex-end;

    .status-badge {
      font-size: 20rpx;
      padding: 6rpx 12rpx;
      border-radius: 12rpx;
      color: #fff;

      &.normal-stock {
        background: #19be6b;
      }

      &.low-stock {
        background: #ff9900;
      }

      &.out-of-stock {
        background: #f56c6c;
      }
    }
  }
}

.goods-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;

  .sync-status {
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;
    color: #fff;

    &.synced {
      background: #19be6b;
    }

    &.pending {
      background: #ff9900;
    }

    &.failed {
      background: #f56c6c;
    }
  }

  .arrow {
    font-size: 32rpx;
    color: #c0c4cc;
  }
}

.loading-state {
  text-align: center;
  padding: 100rpx 40rpx;

  .loading-text {
    font-size: 28rpx;
    color: #909399;
  }
}

.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;

  .empty-icon {
    display: block;
    font-size: 120rpx;
    color: #c0c4cc;
    margin-bottom: 30rpx;
  }

  .empty-text {
    display: block;
    font-size: 28rpx;
    color: #909399;
    margin-bottom: 40rpx;
  }

  .add-btn {
    background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
    color: #fff;
    border: none;
    border-radius: 50rpx;
    padding: 20rpx 40rpx;
    font-size: 28rpx;
  }
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(60, 156, 255, 0.3);
  z-index: 100;

  .fab-icon {
    font-size: 48rpx;
    color: #fff;
  }

  &:active {
    transform: scale(0.9);
  }
}
</style>

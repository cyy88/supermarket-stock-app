<template>
  <view class="goods-list-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchKeyword"
          placeholder="搜索商品名称或条码（不含消耗品）"
          class="search-input"
          @input="onSearchInput"
        />
        <text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
      </view>
    </view>

    <!-- 商品总数统计 -->
    <view class="total-count-bar">
      <view class="total-count">
        <text class="count-number">{{ goodsList.length }}</text>
        <text class="count-label">商品总数</text>
      </view>
    </view>

    <!-- 库存状态筛选 -->
    <view class="stock-filter">
      <view class="filter-tabs">
        <view
          class="filter-tab"
          :class="{ active: stockFilter === 'all' }"
          @click="setStockFilter('all')"
        >
          全部
        </view>
        <view
          class="filter-tab"
          :class="{ active: stockFilter === 'safe' }"
          @click="setStockFilter('safe')"
        >
          安全库存
        </view>
        <view
          class="filter-tab"
          :class="{ active: stockFilter === 'low' }"
          @click="setStockFilter('low')"
        >
          库存不足
        </view>
        <view
          class="filter-tab"
          :class="{ active: stockFilter === 'out' }"
          @click="setStockFilter('out')"
        >
          缺货
        </view>
      </view>
    </view>

    <!-- 筛选结果统计 -->
    <view v-if="hasActiveFilters" class="filter-result-bar">
      <text class="filter-result-text">筛选结果：{{ filteredGoods.length }} 件商品</text>
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
        {{ searchKeyword ? '没有找到相关商品' : '暂无商品数据' }}
      </text>
      <button v-if="!searchKeyword" class="add-btn" @click="goToAdd">
        ➕ 添加第一个商品
      </button>
    </view>

    <!-- 分类筛选悬浮按钮 -->
    <view class="category-fab" @click="showCategoryFilter = true">
      <text class="category-fab-icon">📂</text>
    </view>

    <!-- 浮动添加按钮 -->
    <view class="fab" @click="goToAdd">
      <text class="fab-icon">➕</text>
    </view>

    <!-- 分类筛选弹窗 -->
    <view v-if="showCategoryFilter" class="category-overlay" @click="showCategoryFilter = false">
      <view class="category-panel" @click.stop>
        <view class="category-header">
          <text class="category-title">选择分类</text>
          <text class="category-close" @click="showCategoryFilter = false">✕</text>
        </view>
        <view class="category-content">
          <view class="category-list">
            <view
              class="category-item"
              :class="{ active: selectedCategory === null }"
              @click="selectCategory(null)"
            >
              <view class="category-info">
                <text class="category-name">全部分类</text>
                <text class="category-count">({{ getTotalCount() }})</text>
              </view>
              <text v-if="selectedCategory === null" class="category-check">✓</text>
            </view>
            <view
              v-for="category in categories"
              :key="category.id"
              class="category-item"
              :class="{ active: selectedCategory === category.id }"
              @click="selectCategory(category.id)"
            >
              <view class="category-info">
                <text class="category-name">{{ category.name }}</text>
                <text class="category-count">({{ getCategoryCount(category.id) }})</text>
              </view>
              <text v-if="selectedCategory === category.id" class="category-check">✓</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import goodsStore from '@/stores/goods'
import { getGoodsList, getGoodsCateList } from '@/api/goods'

const searchKeyword = ref('')
const goodsList = ref([])
const loading = ref(false)
const stockFilter = ref('all')
const showCategoryFilter = ref(false)
const selectedCategory = ref(null)
const categories = ref([])

const filteredGoods = computed(() => {
  let dataSource = goodsList.value

  // 过滤掉消耗品，只显示普通商品
  dataSource = dataSource.filter(item => {
    // isItaconsumableitem 为 0 或者不存在时，表示普通商品
    return !item.isItaconsumableitem || item.isItaconsumableitem === 0
  })

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    dataSource = dataSource.filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.goodsNo.toLowerCase().includes(keyword) ||
      (item.cateInfo?.name && item.cateInfo.name.toLowerCase().includes(keyword))
    )
  }

  if (selectedCategory.value !== null) {
    dataSource = dataSource.filter(item =>
      item.cateId === selectedCategory.value ||
      item.cateInfo?.id === selectedCategory.value
    )
  }

  if (stockFilter.value !== 'all') {
    dataSource = dataSource.filter(item => {
      const stock = item.stock || 0
      const safeStock = item.safeStock || 10 // 默认安全库存为10

      switch (stockFilter.value) {
        case 'out':
          return stock === 0
        case 'low':
          return stock > 0 && stock < safeStock
        case 'safe':
          return stock >= safeStock
        default:
          return true
      }
    })
  }

  return dataSource
})

const hasActiveFilters = computed(() => {
  return searchKeyword.value || stockFilter.value !== 'all' || selectedCategory.value !== null
})

onMounted(() => {
  loadGoodsList()
  loadCategoriesIfNeeded()
})

const loadCategoriesIfNeeded = async () => {
  if (goodsStore.categories.length === 0) {
    try {
      const res = await getGoodsCateList({
        page: 1,
        pageSize: 100,
        status: 'A'
      })

      if (res.code === 200 && res.data && res.data.paginationResponse) {
        const categoriesData = res.data.paginationResponse.content || []
        goodsStore.saveCategories(categoriesData)
        categories.value = categoriesData
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  } else {
    categories.value = goodsStore.categories
  }
}

const loadGoodsList = async () => {
  try {
    loading.value = true
    const res = await getGoodsList({
      page: 1,
      pageSize: 1000
    })

    if (res.data && res.data.paginationResponse) {
      goodsList.value = res.data.paginationResponse.content || []
    }
  } catch (error) {
    uni.showToast({
      title: '获取商品列表失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}


const onSearchInput = () => {
}

const clearSearch = () => {
  searchKeyword.value = ''
}



const getGoodsImage = (item) => {
  return item.logo || (item.images && item.images.length > 0 ? item.images[0] : null)
}

const getGoodsCategory = (item) => {
  if (!item) return '未分类'

  if (item.cateInfo && item.cateInfo.name) {
    return item.cateInfo.name
  }
  if (item.cateName) {
    return item.cateName
  }

  if (item.cateId) {
    const categories = goodsStore.categories
    const category = categories.find(cat => cat.id === item.cateId)
    if (category) {
      return category.name
    }
  }
  return '未分类'
}

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



const goToDetail = (item) => {
  if (item.id) {
    uni.navigateTo({
      url: `/pages/goods/detail?id=${item.id}`
    })
  } else {
    uni.showToast({
      title: '商品ID不存在',
      icon: 'none'
    })
  }
}

const goToAdd = () => {
  uni.navigateTo({
    url: '/pages/goods/add'
  })
}

// 库存筛选方法
const setStockFilter = (filter) => {
  stockFilter.value = filter
}

// 分类筛选方法
const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  showCategoryFilter.value = false
}

// 获取分类商品数量
const getCategoryCount = (categoryId) => {
  return goodsList.value.filter(item =>
    (item.cateId === categoryId || item.cateInfo?.id === categoryId) &&
    (!item.isItaconsumableitem || item.isItaconsumableitem === 0)
  ).length
}

// 获取总商品数量
const getTotalCount = () => {
  // 只统计普通商品，排除消耗品
  return goodsList.value.filter(item => !item.isItaconsumableitem || item.isItaconsumableitem === 0).length
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
  padding-bottom: 120rpx;
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
  margin-bottom: 15rpx;

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

.total-count-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 15rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .total-count {
    display: flex;
    align-items: baseline;
    gap: 10rpx;

    .count-number {
      font-size: 48rpx;
      font-weight: bold;
      color: #3c9cff;
    }

    .count-label {
      font-size: 24rpx;
      color: #909399;
    }
  }

  .sync-stats {
    display: flex;
    gap: 30rpx;

    .sync-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .sync-number {
        font-size: 28rpx;
        font-weight: bold;
        margin-bottom: 4rpx;

        &.success {
          color: #19be6b;
        }

        &.warning {
          color: #ff9900;
        }
      }

      .sync-label {
        font-size: 20rpx;
        color: #909399;
      }
    }
  }
}

.stock-filter {
  margin-bottom: 15rpx;

  .filter-tabs {
    display: flex;
    background: #fff;
    border-radius: 20rpx;
    padding: 8rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

    .filter-tab {
      flex: 1;
      text-align: center;
      padding: 16rpx 8rpx;
      border-radius: 12rpx;
      font-size: 24rpx;
      color: #606266;
      transition: all 0.3s;

      &.active {
        background: linear-gradient(135deg, #19be6b 0%, #52c41a 100%);
        color: #fff;
        font-weight: bold;
      }
    }
  }
}

.filter-result-bar {
  background: #f8f9fa;
  border-radius: 10rpx;
  padding: 15rpx 20rpx;
  margin-bottom: 20rpx;
  border-left: 6rpx solid #3c9cff;

  .filter-result-text {
    font-size: 24rpx;
    color: #606266;
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

.category-fab {
  position: fixed;
  left: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #ff9900 0%, #ffad33 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(255, 153, 0, 0.3);
  z-index: 100;

  .category-fab-icon {
    font-size: 48rpx;
    color: #fff;
  }

  &:active {
    transform: scale(0.9);
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

.category-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.category-panel {
  width: 650rpx;
  height: 100vh;
  background: #fff;
  animation: slideInLeft 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 50rpx 30rpx 30rpx;
  background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
  box-shadow: 0 4rpx 12rpx rgba(60, 156, 255, 0.2);

  .category-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
  }

  .category-close {
    font-size: 40rpx;
    color: #fff;
    cursor: pointer;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
  }
}

.category-content {
  flex: 1;
  overflow: hidden;
}

.category-list {
  height: 100%;
  overflow-y: auto;
  padding: 20rpx 0;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: all 0.3s;
  position: relative;

  &:active {
    background: #f8f9fa;
  }

  &.active {
    background: linear-gradient(90deg, #e6f7ff 0%, #f0f9ff 100%);
    border-left: 6rpx solid #3c9cff;

    .category-name {
      color: #3c9cff;
      font-weight: bold;
    }

    .category-count {
      color: #3c9cff;
    }
  }

  .category-info {
    display: flex;
    align-items: baseline;
    gap: 15rpx;
    flex: 1;

    .category-name {
      font-size: 30rpx;
      color: #303133;
      transition: all 0.3s;
    }

    .category-count {
      font-size: 24rpx;
      color: #909399;
      transition: all 0.3s;
    }
  }

  .category-check {
    font-size: 32rpx;
    color: #3c9cff;
    font-weight: bold;
  }
}
</style>

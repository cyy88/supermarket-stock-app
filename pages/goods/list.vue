<template>
  <view class="goods-list-container">
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
          <text class="page-title">📦 商品管理</text>
          <text class="page-subtitle">轻松管理您的商品库存</text>
        </view>
      </view>

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

<!--      &lt;!&ndash; 商品总数统计 &ndash;&gt;-->
<!--      <view class="total-count-bar">-->
<!--        <view class="total-count">-->
<!--          <text class="count-number">{{ goodsList.length }}</text>-->
<!--          <text class="count-label">商品总数</text>-->
<!--        </view>-->
<!--      </view>-->

      <!-- 库存状态筛选 -->
      <view class="filter-container">
        <view class="filter-tabs">
          <view
            class="filter-tab"
            :class="{ active: stockFilter === 'all' }"
            @click="setStockFilter('all')"
          >
            <text class="filter-icon">📋</text>
            <text class="filter-text">全部</text>
          </view>
          <view
            class="filter-tab"
            :class="{ active: stockFilter === 'safe' }"
            @click="setStockFilter('safe')"
          >
            <text class="filter-icon">✅</text>
            <text class="filter-text">安全库存</text>
          </view>
          <view
            class="filter-tab"
            :class="{ active: stockFilter === 'low' }"
            @click="setStockFilter('low')"
          >
            <text class="filter-icon">⚠️</text>
            <text class="filter-text">库存不足</text>
          </view>
          <view
            class="filter-tab"
            :class="{ active: stockFilter === 'out' }"
            @click="setStockFilter('out')"
          >
            <text class="filter-icon">❌</text>
            <text class="filter-text">缺货</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 商品列表内容区域 -->
    <view class="content-area">
      <scroll-view
        class="goods-list"
        scroll-y
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
        @refresherrestore="onRefreshRestore"
        @scrolltolower="loadMore"
        :refresher-threshold="80"
        refresher-background="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
        :lower-threshold="300"
        show-scrollbar="true"
        enable-back-to-top="true"
      >
        <!-- 筛选结果统计 -->
        <view v-if="hasActiveFilters" class="filter-result-bar">
          <text class="filter-result-text">筛选结果：{{ filteredGoods.length }} 件商品</text>
        </view>

        <!-- 加载状态 -->
        <view v-if="!refreshing && loading && goodsList.length === 0" class="loading-container">
          <view class="loading-animation">
            <view class="loading-dot"></view>
            <view class="loading-dot"></view>
            <view class="loading-dot"></view>
          </view>
          <text class="loading-text">加载中...</text>
        </view>

        <!-- 空状态 -->
        <view v-else-if="!loading && !refreshing && filteredGoods.length === 0" class="empty-container">
          <view class="empty-animation">
            <text class="empty-icon">📦</text>
            <view class="empty-circle"></view>
          </view>
          <text class="empty-title">暂无商品数据</text>
          <text class="empty-subtitle">{{ searchKeyword ? '没有找到相关商品' : '点击右下角按钮添加新商品' }}</text>
        </view>

        <!-- 商品列表 -->
        <view v-else class="list-content">
          <view
            v-for="(item, index) in filteredGoods"
            :key="item.id"
            class="goods-item"
            :style="{ animationDelay: index * 0.1 + 's' }"
            @click="goToDetail(item)"
          >
            <!-- 卡片装饰 -->
            <view class="card-decoration" :class="getCardDecorationClass(item)"></view>

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
      </scroll-view>
    </view>

    <!-- 分类筛选悬浮按钮 -->
    <view class="category-fab" @click="showCategoryFilter = true">
      <text class="category-fab-icon">📂</text>
    </view>

    <!-- 浮动添加按钮 -->
    <view class="fab" @click="goToAdd">
      <view class="fab-bg"></view>
      <text class="fab-icon">+</text>
      <view class="fab-ripple"></view>
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

    <CustomToast
      v-model:visible="showToast"
      :message="toastMessage"
      :type="toastType"
      :duration="1500"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import goodsStore from '@/stores/goods'
import { getGoodsCateList, getGoodsList } from '@/api/goods'
import cacheManager, { CACHE_KEYS } from '@/utils/cache'
import CustomToast from '@/components/CustomToast.vue'

const fixMalformedUrl = (url) => {
  if (!url || typeof url !== 'string') return url
  
  const domainPattern = /(https?:\/\/[^\/]+)(https?:\/\/[^\/]+)/
  const match = url.match(domainPattern)
  
  if (match) {
    return url.replace(match[1], '')
  }
  
  return url
}

const searchKeyword = ref('')
const goodsList = ref([])
const loading = ref(false)
const refreshing = ref(false)
const stockFilter = ref('all')
const showCategoryFilter = ref(false)
const selectedCategory = ref(null)
const categories = ref([])
const hasMore = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

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
  loadGoodsListWithCache()
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

const loadGoodsListWithCache = async () => {
  try {
    loading.value = true

    const cachedData = cacheManager.getCache(CACHE_KEYS.GOODS_LIST)
    if (cachedData) {
      goodsList.value = cachedData
      loading.value = false
      return
    }

    await loadGoodsList(true)
  } catch (error) {
    console.error('加载商品列表失败:', error)
    uni.showToast({
      title: '获取商品列表失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const loadGoodsList = async (shouldCache = false) => {
  try {
    if (!shouldCache) {
      loading.value = true
    }

    const res = await getGoodsList({
      page: 1,
      pageSize: 1000,
      isItaconsumableitem: 0
    })

    if (res.data && res.data.paginationResponse) {
      const newData = res.data.paginationResponse.content || []
      goodsList.value = newData

      if (shouldCache) {
        cacheManager.setCache(CACHE_KEYS.GOODS_LIST, newData)
      }
    }
  } catch (error) {
    if (!shouldCache) {
      uni.showToast({
        title: '获取商品列表失败',
        icon: 'none'
      })
    }
    throw error
  } finally {
    if (!shouldCache) {
      loading.value = false
    }
  }
}

// 下拉刷新
const onRefresh = async () => {
  if (refreshing.value) return

  refreshing.value = true
  try {
    await loadGoodsList(true)
    await loadCategoriesIfNeeded()

    toastMessage.value = '刷新成功'
    toastType.value = 'success'
    showToast.value = true
  } catch (error) {
    console.error('刷新失败:', error)
    uni.showToast({
      title: '刷新失败',
      icon: 'none',
      duration: 1500
    })
  } finally {
    // 确保刷新状态被重置
    setTimeout(() => {
      refreshing.value = false
    }, 500)
  }
}

const onRefreshRestore = () => {
  refreshing.value = false
}

// 加载更多（暂时不实现分页，保持原有逻辑）
const loadMore = () => {
  // 暂时不实现分页加载
}


const onSearchInput = () => {
  refreshing.value = false
}

const clearSearch = () => {
  searchKeyword.value = ''
  refreshing.value = false
}



const getGoodsImage = (item) => {
  if (item.logo) {
    return fixMalformedUrl(item.logo)
  }

  if (item.images) {
    if (typeof item.images === 'string') {
      try {
        const parsedImages = JSON.parse(item.images)
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          return fixMalformedUrl(parsedImages[0])
        }
      } catch (e) {

        return fixMalformedUrl(item.images)
      }
    } else if (Array.isArray(item.images) && item.images.length > 0) {
      return fixMalformedUrl(item.images[0])
    }
  }

  return null
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

// 获取卡片装饰样式
const getCardDecorationClass = (item) => {
  const safetyStock = item.safetyStock || 0
  const currentStock = item.stock || 0

  if (currentStock <= 0) {
    return 'decoration-danger'
  } else if (currentStock <= safetyStock) {
    return 'decoration-warning'
  } else {
    return 'decoration-success'
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

// 跳转到库存入库页面
const goToAddStock = () => {
  uni.navigateTo({
    url: '/pages/stock/add'
  })
}

// 跳转到入库记录页面
const goToStockRecords = () => {
  uni.navigateTo({
    url: '/pages/stock/list'
  })
}

// 库存筛选方法
const setStockFilter = (filter) => {
  stockFilter.value = filter
  refreshing.value = false
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

.search-bar {
  padding: 0 20rpx 15rpx;

  .search-input-wrapper {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50rpx;
    padding: 0 30rpx;
    height: 80rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);

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
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15rpx;
  padding: 20rpx 30rpx;
  margin: 0 20rpx 15rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);

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


/* 筛选容器 */
.filter-container {
  padding: 0 20rpx 20rpx;
}

.filter-tabs {
  display: flex;
  justify-content: space-between;
  gap: 10rpx;
  padding: 0 10rpx;
}

.filter-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 25rpx;
  flex: 1;
  min-width: 0;
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
  font-size: 26rpx;
  margin-bottom: 6rpx;
}

.filter-text {
  font-size: 22rpx;
  color: #fff;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

.filter-tab.active .filter-text {
  color: #333;
}

/* 内容区域 */
.content-area {
  position: relative;
  z-index: 1;
  /* 动态计算顶部偏移，包含状态栏高度 */
  margin-top: calc(330rpx + var(--status-bar-height));
}

/* 列表容器 */
.goods-list {
  padding: 20rpx 30rpx 200rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.list-content {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
  padding-right: 60rpx;
  margin-top: 70rpx;
}

.filter-result-bar {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15rpx;
  padding: 15rpx 20rpx;
  margin-bottom: 20rpx;
  border-left: 6rpx solid #3c9cff;
  backdrop-filter: blur(10px);
  margin-right: 60rpx;

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

/* 商品项目卡片 */
.goods-item {
  position: relative;
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25rpx;
  padding: 30rpx;
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

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* 浮动添加按钮 */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
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

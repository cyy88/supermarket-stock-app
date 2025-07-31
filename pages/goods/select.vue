<template>
  <view class="select-goods-container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="nav-icon">←</text>
      </view>
      <view class="nav-title">选择商品</view>
      <view class="nav-right">
        <text class="selected-count">已选{{ selectedGoods.length }}件</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-container">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          v-model="searchKeyword" 
          placeholder="请输入商品关键字搜索" 
          class="search-input"
          @confirm="handleSearch"
        />
        <button v-if="searchKeyword" class="clear-btn" @click="clearSearch">×</button>
      </view>
      <button class="search-btn" @click="handleSearch">搜索</button>
    </view>

    <!-- 商品列表 -->
    <scroll-view 
      class="goods-scroll" 
      scroll-y 
      @scrolltolower="loadMore"
      refresher-enabled
      @refresherrefresh="onRefresh"
      :refresher-triggered="refreshing"
    >
      <view class="goods-list">
        <view v-if="loading && goodsList.length === 0" class="loading-container">
          <text class="loading-text">加载中...</text>
        </view>
        
        <view v-else-if="goodsList.length === 0" class="empty-container">
          <text class="empty-icon">📦</text>
          <text class="empty-text">暂无商品数据</text>
        </view>
        
        <view v-else>
          <view 
            v-for="(item, index) in goodsList" 
            :key="item.id + '_' + item.skuId" 
            class="goods-card"
            :class="{ 'selected': item.checked }"
            @click="toggleSelect(index, item)"
          >
            <!-- 选择状态指示器 -->
            <view class="select-indicator" :class="{ 'active': item.checked }">
              <text v-if="item.checked" class="check-icon">✓</text>
            </view>
            
            <!-- 商品图片 -->
            <view class="goods-image-container">
              <image
                :src="getGoodsImageUrl(item)"
                class="goods-image"
                mode="aspectFill"
                @error="handleImageError"
              />
            </view>
            
            <!-- 商品信息 -->
            <view class="goods-info">
              <view class="goods-name">{{ item.name }}</view>
              <view class="goods-no">编号：{{ item.goodsNo }}</view>
              <view v-if="item.spec" class="goods-spec">
                <text class="spec-label">规格：</text>
                <text class="spec-value">{{ item.spec }}</text>
              </view>
              <view class="goods-price">
                <text class="price-label">价格：</text>
                <text class="price-value">¥{{ item.price }}</text>
                <text class="price-unit">/{{ item.priceType === 'weight' ? '斤' : '件' }}</text>
              </view>
              <view class="stock-info">
                <text class="stock-label">库存：</text>
                <text class="stock-value" :class="{ 'low-stock': item.stock < 10 }">
                  {{ item.stock }}{{ item.priceType === 'weight' ? '斤' : '件' }}
                </text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 加载更多提示 -->
        <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
          <text class="load-more-text">点击加载更多</text>
        </view>
        
        <view v-if="loading && goodsList.length > 0" class="loading-more">
          <text class="loading-more-text">加载中...</text>
        </view>
        
        <view v-if="!hasMore && goodsList.length > 0" class="no-more">
          <text class="no-more-text">没有更多商品了</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="selected-info">
        <text class="selected-text">已选择 {{ selectedGoods.length }} 件商品</text>
      </view>
      <view class="action-buttons">
        <button class="cancel-btn" @click="goBack">取消</button>
        <button 
          class="confirm-btn" 
          :class="{ 'disabled': selectedGoods.length === 0 }"
          @click="confirmSelect"
        >
          确定选择
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { selectGoodsList } from '@/api/stock'
import { fixMalformedUrl } from '@/utils/url'

const props = defineProps({
  storeId: {
    type: [Number, String],
    default: 0
  }
})

const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const goodsList = ref([])
const selectedGoods = ref([])
const searchKeyword = ref('')
const total = ref(0)

const params = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  storeId: 0
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  
  params.storeId = options.storeId || props.storeId || 0
  
  loadGoodsList()
})

const loadGoodsList = async (isRefresh = false) => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    if (isRefresh) {
      params.page = 1
      goodsList.value = []
      hasMore.value = true
    }
    
    const response = await selectGoodsList(params)
    
    if (response.code === 200) {
      const newGoods = response.data.paginationResponse.content || []
      total.value = response.data.paginationResponse.totalElements || 0
      
      const processedGoods = newGoods.map(item => ({
        ...item,
        checked: false
      }))
      
      if (isRefresh) {
        goodsList.value = processedGoods
      } else {
        goodsList.value.push(...processedGoods)
      }
      
      hasMore.value = goodsList.value.length < total.value
    }
  } catch (error) {
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => {
  refreshing.value = true
  loadGoodsList(true)
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  
  params.page++
  loadGoodsList()
}

const handleSearch = () => {
  params.keyword = searchKeyword.value.trim()
  params.page = 1
  loadGoodsList(true)
}

const clearSearch = () => {
  searchKeyword.value = ''
  params.keyword = ''
  params.page = 1
  loadGoodsList(true)
}

const toggleSelect = (index, item) => {
  const currentItem = goodsList.value[index]
  currentItem.checked = !currentItem.checked
  
  if (currentItem.checked) {
    const isExist = selectedGoods.value.some(selected =>
      selected.id === item.id && (selected.skuId === item.skuId || (!selected.skuId && !item.skuId))
    )
    
    if (!isExist) {
      selectedGoods.value.push(JSON.parse(JSON.stringify(currentItem)))
    }
  } else {
    selectedGoods.value = selectedGoods.value.filter(selected =>
      !(selected.id === item.id && (selected.skuId === item.skuId || (!selected.skuId && !item.skuId)))
    )
  }
}

const getGoodsImageUrl = (item) => {
  if (!item.logo) return '/static/images/default-goods.png'
  return fixMalformedUrl(item.logo)
}

const handleImageError = (e) => {
}

const confirmSelect = () => {
  if (selectedGoods.value.length === 0) {
    uni.showToast({
      title: '请至少选择一个商品',
      icon: 'none'
    })
    return
  }


  try {
    uni.setStorageSync('selectedGoodsData', {
      data: selectedGoods.value,
      timestamp: Date.now()
    })

    uni.showToast({
      title: `已选择${selectedGoods.value.length}件商品`,
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '数据保存失败',
      icon: 'none'
    })
  }

  setTimeout(() => {
    uni.navigateBack()
  }, 200)
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.select-goods-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left {
  width: 80rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  font-size: 36rpx;
  color: #333;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.nav-right {
  width: 160rpx;
  text-align: right;
}

.selected-count {
  font-size: 28rpx;
  color: #007aff;
}

/* 搜索栏 */
.search-container {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  gap: 20rpx;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 50rpx;
  padding: 0 24rpx;
  height: 72rpx;
}

.search-icon {
  font-size: 32rpx;
  color: #999;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
}

.clear-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ccc;
  color: #fff;
  border-radius: 50%;
  font-size: 24rpx;
  border: none;
  margin-left: 16rpx;
}

.search-btn {
  padding: 16rpx 32rpx;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 36rpx;
  font-size: 28rpx;
}

/* 商品列表滚动区域 */
.goods-scroll {
  flex: 1;
  height: 0;
}

.goods-list {
  padding: 24rpx 32rpx;
}

/* 加载状态 */
.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 商品卡片 */
.goods-card {
  display: flex;
  align-items: flex-start;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.3s ease;
}

.goods-card.selected {
  border: 2rpx solid #007aff;
  background-color: #f0f8ff;
}

.goods-card:active {
  transform: scale(0.98);
}

/* 选择指示器 */
.select-indicator {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 48rpx;
  height: 48rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  transition: all 0.3s ease;
}

.select-indicator.active {
  background-color: #007aff;
  border-color: #007aff;
}

.check-icon {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}

/* 商品图片 */
.goods-image-container {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  overflow: hidden;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.goods-image {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}

/* 商品信息 */
.goods-info {
  flex: 1;
  padding-right: 60rpx;
}

.goods-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-no {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.goods-spec {
  margin-bottom: 8rpx;
}

.spec-label {
  font-size: 24rpx;
  color: #666;
}

.spec-value {
  font-size: 24rpx;
  color: #333;
}

.goods-price {
  margin-bottom: 8rpx;
}

.price-label {
  font-size: 24rpx;
  color: #666;
}

.price-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff6b35;
}

.price-unit {
  font-size: 24rpx;
  color: #999;
}

.stock-info {
  display: flex;
  align-items: center;
}

.stock-label {
  font-size: 24rpx;
  color: #666;
}

.stock-value {
  font-size: 24rpx;
  color: #52c41a;
  font-weight: 500;
}

.stock-value.low-stock {
  color: #ff4d4f;
}

/* 加载更多 */
.load-more,
.loading-more,
.no-more {
  text-align: center;
  padding: 40rpx 0;
}

.load-more-text {
  font-size: 28rpx;
  color: #007aff;
}

.loading-more-text,
.no-more-text {
  font-size: 28rpx;
  color: #999;
}

/* 底部操作栏 */
.bottom-bar {
  background-color: #fff;
  border-top: 1rpx solid #eee;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.selected-info {
  margin-bottom: 24rpx;
}

.selected-text {
  font-size: 28rpx;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 24rpx;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background-color: #007aff;
  color: #fff;
}

.confirm-btn.disabled {
  background-color: #ccc;
  color: #999;
}
</style>

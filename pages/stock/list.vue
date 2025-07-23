<template>
  <view class="stock-list-container">
    <!-- 顶部操作栏 -->
    <view class="header-actions">
      <view class="search-section">
        <view class="search-box">
          <input 
            v-model="searchKeyword" 
            placeholder="搜索说明备注..." 
            class="search-input"
            @confirm="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">搜索</button>
        </view>
      </view>
      
      <view class="filter-section">
        <view class="filter-tabs">
          <view 
            class="filter-tab" 
            :class="{ active: statusFilter === 'all' }"
            @click="setStatusFilter('all')"
          >
            全部
          </view>
          <view 
            class="filter-tab" 
            :class="{ active: statusFilter === '待审核' }"
            @click="setStatusFilter('待审核')"
          >
            待审核
          </view>
          <view 
            class="filter-tab" 
            :class="{ active: statusFilter === '已通过' }"
            @click="setStatusFilter('已通过')"
          >
            已通过
          </view>
          <view 
            class="filter-tab" 
            :class="{ active: statusFilter === '未通过' }"
            @click="setStatusFilter('未通过')"
          >
            未通过
          </view>
        </view>
      </view>
      
      <!-- 新增入库按钮 -->
      <view class="add-button-section">
        <button class="add-btn" @click="goToAddStock">
          <text class="add-icon">+</text>
          <text>新增入库</text>
        </button>
      </view>
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
      <view v-if="loading" class="loading">
        <text>加载中...</text>
      </view>
      
      <view v-else-if="filteredList.length === 0" class="empty">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无入库记录</text>
      </view>
      
      <view v-else>
        <view
          v-for="(item, index) in filteredList"
          :key="item.id"
          class="stock-item"
          @click.stop="viewDetail(item)"
          @touchstart="handleTouchStart"
        >
          <view class="item-header">
            <view class="item-info">
              <text class="item-id">ID: {{ item.id }}</text>
              <text class="item-type">{{ item.type === 'increase' ? '入库' : '出库' }}</text>
            </view>
            <view class="status-badge" :class="getStatusClass(item.reviewStatus)">
              {{ item.reviewStatus || '待审核' }}
            </view>
          </view>
          
          <view class="item-content">
            <view class="store-info">
              <text class="label">店铺：</text>
              <text class="value">{{ getStoreName(item.storeId) }}</text>
            </view>
            
            <view class="description-info" v-if="item.description">
              <text class="label">说明：</text>
              <text class="value">{{ item.description }}</text>
            </view>
            
            <view class="time-info">
              <text class="label">创建时间：</text>
              <text class="value">{{ formatTime(item.createTime) }}</text>
            </view>
            
            <view class="time-info" v-if="item.updateTime !== item.createTime">
              <text class="label">更新时间：</text>
              <text class="value">{{ formatTime(item.updateTime) }}</text>
            </view>
            
            <view class="review-info" v-if="item.reviewDesc">
              <text class="label">审核说明：</text>
              <text class="value">{{ item.reviewDesc }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 分页加载 -->
    <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
      <text>加载更多</text>
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

const formatTime = (timeStr) => {
  if (!timeStr) return '--'
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 查看详情
const viewDetail = (item) => {
  uni.showToast({
    title: `点击了记录 ${item.id}`,
    icon: 'none'
  })

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

// 跳转到新增入库页面
const goToAddStock = () => {
  uni.navigateTo({
    url: '/pages/stock/add'
  })
}
</script>

<style scoped>
.stock-list-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header-actions {
  background: white;
  padding: 16rpx;
  margin-bottom: 16rpx;
}

.search-section {
  margin-bottom: 16rpx;
}

.search-box {
  display: flex;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  padding: 16rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.search-btn {
  padding: 16rpx 32rpx;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.filter-section {
  margin-bottom: 16rpx;
}

.filter-tabs {
  display: flex;
  gap: 16rpx;
}

.filter-tab {
  padding: 12rpx 24rpx;
  background: #f0f0f0;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #666;
  text-align: center;
}

.filter-tab.active {
  background: #007aff;
  color: white;
}

.add-button-section {
  display: flex;
  justify-content: center;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: white;
  border: none;
  border-radius: 24rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.add-icon {
  font-size: 32rpx;
  font-weight: bold;
}

.stock-list {
  padding: 0 16rpx;
  height: calc(100vh - 300rpx);
}

.loading, .empty {
  text-align: center;
  padding: 80rpx 32rpx;
  color: #999;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
}

.stock-item {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.stock-item:active {
  background-color: #f8f8f8;
  transform: scale(0.98);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.item-info {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.item-id {
  font-size: 26rpx;
  color: #666;
}

.item-type {
  padding: 4rpx 12rpx;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 12rpx;
  font-size: 24rpx;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.status-success {
  background: #f6ffed;
  color: #52c41a;
}

.status-warning {
  background: #fffbe6;
  color: #faad14;
}

.status-danger {
  background: #fff2f0;
  color: #ff4d4f;
}

.status-default {
  background: #f0f0f0;
  color: #666;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.store-info, .description-info, .time-info, .review-info {
  display: flex;
  font-size: 26rpx;
}

.label {
  color: #666;
  min-width: 120rpx;
}

.value {
  color: #333;
  flex: 1;
}

.load-more {
  text-align: center;
  padding: 32rpx;
  color: #007aff;
  font-size: 28rpx;
}
</style>

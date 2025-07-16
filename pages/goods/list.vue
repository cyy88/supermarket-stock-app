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

    <!-- 统计信息 -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-number">{{ filteredGoods.length }}</text>
        <text class="stat-label">总商品</text>
      </view>
      <view class="stat-item">
        <text class="stat-number success">{{ syncedCount }}</text>
        <text class="stat-label">已同步</text>
      </view>
      <view class="stat-item">
        <text class="stat-number warning">{{ unsyncedCount }}</text>
        <text class="stat-label">待同步</text>
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
            v-if="item.images && item.images.length > 0"
            :src="item.images[0]" 
            mode="aspectFill"
            class="image"
          />
          <view v-else class="no-image">
            <text>📦</text>
          </view>
        </view>
        
        <view class="goods-info">
          <view class="goods-name">{{ item.name }}</view>
          <view class="goods-barcode">条码: {{ item.goodsNo }}</view>
          <view class="goods-category">分类: {{ item.cateName || '未分类' }}</view>
          <view class="goods-meta">
            <text class="price">¥{{ item.price }}</text>
            <text class="stock">库存: {{ item.stock }}</text>
          </view>
        </view>
        
        <view class="goods-actions">
          <view class="sync-status" :class="getSyncStatusClass(item.syncStatus)">
            {{ getSyncStatusText(item.syncStatus) }}
          </view>
          <text class="arrow">→</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredGoods.length === 0" class="empty-state">
      <text class="empty-icon">📦</text>
      <text class="empty-text">{{ searchKeyword ? '没有找到相关商品' : '还没有添加商品' }}</text>
      <button v-if="!searchKeyword" class="add-btn" @click="goToAdd">
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

// 响应式数据
const searchKeyword = ref('')
const goodsList = ref([])

// 计算属性
const filteredGoods = computed(() => {
  if (!searchKeyword.value) {
    return goodsList.value
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return goodsList.value.filter(item => 
    item.name.toLowerCase().includes(keyword) ||
    item.goodsNo.toLowerCase().includes(keyword) ||
    (item.cateName && item.cateName.toLowerCase().includes(keyword))
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
})

// 加载商品列表
const loadGoodsList = () => {
  goodsStore.init()
  goodsList.value = goodsStore.localGoods.sort((a, b) => b.createTime - a.createTime)
}

// 搜索输入
const onSearchInput = () => {
  // 实时搜索，这里可以添加防抖逻辑
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
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
  uni.navigateTo({
    url: `/pages/goods/detail?id=${item.id}`
  })
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
  margin-bottom: 30rpx;

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

  .goods-name {
    font-size: 30rpx;
    font-weight: bold;
    color: #303133;
    margin-bottom: 10rpx;
    line-height: 1.4;
  }

  .goods-barcode {
    font-size: 24rpx;
    color: #909399;
    margin-bottom: 8rpx;
  }

  .goods-category {
    font-size: 24rpx;
    color: #909399;
    margin-bottom: 15rpx;
  }

  .goods-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .price {
      font-size: 32rpx;
      font-weight: bold;
      color: #f56c6c;
    }

    .stock {
      font-size: 24rpx;
      color: #606266;
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

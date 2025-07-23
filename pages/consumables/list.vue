<template>
  <view class="consumables-list-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input 
          v-model="searchKeyword"
          placeholder="搜索消耗品名称或条码"
          class="search-input"
          @input="onSearchInput"
        />
        <text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
      </view>
    </view>



    <!-- 消耗品总数统计 -->
    <view class="total-count-bar">
      <view class="total-count">
        <text class="count-number">{{ getTotalDataSourceCount() }}</text>
        <text class="count-label">服务器消耗品</text>
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
      <text class="filter-result-text">筛选结果：{{ filteredConsumables.length }} 件消耗品</text>
    </view>

    <!-- 消耗品列表 -->
    <view class="consumables-list">
      <view 
        v-for="item in filteredConsumables" 
        :key="item.id"
        class="consumables-item"
        @click="goToDetail(item)"
      >
        <view class="consumables-image">
          <image
            v-if="getConsumablesImage(item)"
            :src="getConsumablesImage(item)"
            mode="aspectFill"
            class="image"
          />
          <view v-else class="no-image">
            <text>🧴</text>
          </view>
        </view>

        <view class="consumables-info">
          <view class="consumables-header">
            <view class="consumables-name">{{ item.name }}</view>
            <text class="price">¥{{ item.price }}</text>
          </view>

          <view class="consumables-details">
            <view class="detail-row">
              <text class="label">条码：</text>
              <text class="value">{{ item.goodsNo }}</text>
            </view>
            <view class="detail-row">
              <text class="label">库存：</text>
              <text class="value" :class="getStockClass(item)">{{ item.stock || 0 }}</text>
            </view>
            <view class="detail-row">
              <text class="label">安全库存：</text>
              <text class="value">{{ item.safetyStock || 0 }}</text>
            </view>
          </view>

          <view class="consumables-footer">
            <view class="status-info">
              <text class="status" :class="item.status === 'A' ? 'active' : 'inactive'">
                {{ item.status === 'A' ? '上架' : '下架' }}
              </text>
            </view>
            <view class="actions">
              <button class="edit-btn" @click.stop="goToEdit(item)">编辑</button>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredConsumables.length === 0" class="empty-state">
        <text class="empty-icon">🧴</text>
        <text class="empty-text">暂无消耗品数据</text>
      </view>
    </view>

    <!-- 添加按钮 -->
    <view class="add-btn-container">
      <button class="add-btn" @click="goToAdd">
        <text class="add-icon">+</text>
        <text class="add-text">添加消耗品</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import goodsStore from '@/stores/goods'
import { getGoodsList } from '@/api/goods'

// 修复可能包含重复域名的URL
const fixMalformedUrl = (url) => {
  if (!url || typeof url !== 'string') return url
  
  // 查找URL中是否包含重复的域名
  const domainPattern = /(https?:\/\/[^\/]+)(https?:\/\/[^\/]+)/
  const match = url.match(domainPattern)
  
  if (match) {
    // 如果找到重复的域名，只保留第二个域名
    return url.replace(match[1], '')
  }
  
  return url
}

const searchKeyword = ref('')
const consumablesList = ref([])
const loading = ref(false)
const stockFilter = ref('all')

const filteredConsumables = computed(() => {
  let dataSource = consumablesList.value

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    dataSource = dataSource.filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.goodsNo.toLowerCase().includes(keyword)
    )
  }

  if (stockFilter.value !== 'all') {
    dataSource = dataSource.filter(item => {
      const stock = item.stock || 0
      const safeStock = item.safetyStock || 10 // 默认安全库存为10

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
  return searchKeyword.value || stockFilter.value !== 'all'
})

const getTotalDataSourceCount = () => {
  return consumablesList.value.length
}

onMounted(() => {
  loadConsumablesList()
})

const loadConsumablesList = async () => {
  try {
    loading.value = true
    const res = await getGoodsList({
      page: 1,
      pageSize: 1000,
      isItaconsumableitem: 1
    })

    if (res.data && res.data.paginationResponse) {
      const allGoods = res.data.paginationResponse.content || []
      consumablesList.value = allGoods.filter(item => item.isItaconsumableitem === 1)
    }
  } catch (error) {
    uni.showToast({
      title: '获取消耗品列表失败',
      icon: 'none'
    })
    consumablesList.value = []
  } finally {
    loading.value = false
  }
}

const onSearchInput = () => {
}

const clearSearch = () => {
  searchKeyword.value = ''
}

const getConsumablesImage = (item) => {
  // 优先使用logo
  if (item.logo) {
    // 修复可能存在的重复域名问题
    return fixMalformedUrl(item.logo)
  }

  // 如果没有logo，尝试使用images数组的第一张图片
  if (item.images) {
    // 图片可能是JSON字符串
    if (typeof item.images === 'string') {
      try {
        const parsedImages = JSON.parse(item.images)
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          // 修复可能存在的重复域名问题
          return fixMalformedUrl(parsedImages[0])
        }
      } catch (e) {
        // 如果解析失败，则可能是单个URL字符串
        // 修复可能存在的重复域名问题
        return fixMalformedUrl(item.images)
      }
    } else if (Array.isArray(item.images) && item.images.length > 0) {
      // 修复可能存在的重复域名问题
      return fixMalformedUrl(item.images[0])
    }
  }

  return null
}

const getStockClass = (item) => {
  const stock = item.stock || 0
  const safeStock = item.safetyStock || 10
  
  if (stock === 0) return 'out-of-stock'
  if (stock < safeStock) return 'low-stock'
  return 'safe-stock'
}

const goToDetail = (item) => {
  if (item.id) {
    uni.navigateTo({
      url: `/pages/goods/detail?id=${item.id}&source=server`
    })
  } else {
    uni.showToast({
      title: '消耗品ID不存在',
      icon: 'none'
    })
  }
}

const goToEdit = (item) => {
  if (item.id) {
    uni.navigateTo({
      url: `/pages/goods/edit?id=${item.id}`
    })
  }
}

const goToAdd = () => {
  uni.navigateTo({
    url: '/pages/consumables/add'
  })
}

// 库存筛选方法
const setStockFilter = (filter) => {
  stockFilter.value = filter
}
</script>

<style lang="scss" scoped>
.consumables-list-container {
  padding: 20rpx;
  background: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.search-bar {
  margin-bottom: 20rpx;

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 25rpx;
    padding: 0 30rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

    .search-icon {
      font-size: 32rpx;
      color: #999;
      margin-right: 20rpx;
    }

    .search-input {
      flex: 1;
      height: 80rpx;
      font-size: 28rpx;
      border: none;
      outline: none;
    }

    .clear-icon {
      font-size: 28rpx;
      color: #999;
      padding: 10rpx;
      cursor: pointer;
    }
  }
}



.total-count-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

  .total-count {
    display: flex;
    align-items: baseline;
    gap: 10rpx;

    .count-number {
      font-size: 48rpx;
      font-weight: bold;
      color: #ff6b6b;
    }

    .count-label {
      font-size: 24rpx;
      color: #666;
    }
  }


}

.stock-filter {
  margin-bottom: 20rpx;

  .filter-tabs {
    display: flex;
    background: #fff;
    border-radius: 15rpx;
    padding: 8rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

    .filter-tab {
      flex: 1;
      text-align: center;
      padding: 15rpx 10rpx;
      font-size: 24rpx;
      color: #666;
      border-radius: 10rpx;
      transition: all 0.3s;
      cursor: pointer;

      &.active {
        background: #ff6b6b;
        color: #fff;
        font-weight: bold;
      }
    }
  }
}

.filter-result-bar {
  background: #fff3cd;
  border: 1rpx solid #ffeaa7;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;

  .filter-result-text {
    font-size: 24rpx;
    color: #856404;
  }
}

.consumables-list {
  .consumables-item {
    display: flex;
    background: #fff;
    border-radius: 15rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    transition: all 0.3s;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
    }

    .consumables-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: 10rpx;
      overflow: hidden;
      margin-right: 20rpx;

      .image {
        width: 100%;
        height: 100%;
      }

      .no-image {
        width: 100%;
        height: 100%;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48rpx;
        color: #ccc;
      }
    }

    .consumables-info {
      flex: 1;
      display: flex;
      flex-direction: column;

      .consumables-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15rpx;

        .consumables-name {
          flex: 1;
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
          line-height: 1.4;
          margin-right: 20rpx;
        }

        .price {
          font-size: 28rpx;
          font-weight: bold;
          color: #ff6b6b;
          white-space: nowrap;
        }
      }

      .consumables-details {
        margin-bottom: 15rpx;

        .detail-row {
          display: flex;
          align-items: center;
          margin-bottom: 8rpx;

          .label {
            font-size: 24rpx;
            color: #666;
            min-width: 80rpx;
          }

          .value {
            font-size: 24rpx;
            color: #333;

            &.out-of-stock {
              color: #e74c3c;
              font-weight: bold;
            }

            &.low-stock {
              color: #f39c12;
              font-weight: bold;
            }

            &.safe-stock {
              color: #27ae60;
            }
          }
        }
      }

      .consumables-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .status-info {
          display: flex;
          gap: 15rpx;

          .status {
            font-size: 22rpx;
            padding: 4rpx 12rpx;
            border-radius: 10rpx;

            &.active {
              background: #d4edda;
              color: #155724;
            }

            &.inactive {
              background: #f8d7da;
              color: #721c24;
            }
          }


        }

        .actions {
          .edit-btn {
            background: #ff6b6b;
            color: #fff;
            border: none;
            border-radius: 8rpx;
            padding: 8rpx 20rpx;
            font-size: 22rpx;
            transition: all 0.3s;

            &:active {
              background: #ee5a24;
              transform: scale(0.95);
            }
          }
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 100rpx 40rpx;

    .empty-icon {
      font-size: 120rpx;
      display: block;
      margin-bottom: 30rpx;
      opacity: 0.3;
    }

    .empty-text {
      font-size: 32rpx;
      color: #666;
      display: block;
      margin-bottom: 15rpx;
    }

    .empty-tip {
      font-size: 24rpx;
      color: #999;
      display: block;
    }
  }
}

.add-btn-container {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  z-index: 100;

  .add-btn {
    display: flex;
    align-items: center;
    gap: 10rpx;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    color: #fff;
    border: none;
    border-radius: 50rpx;
    padding: 20rpx 30rpx;
    font-size: 28rpx;
    font-weight: bold;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.3);
    transition: all 0.3s;

    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.4);
    }

    .add-icon {
      font-size: 32rpx;
      font-weight: normal;
    }
  }
}
</style>

<template>
  <view class="detail-container">
    <view v-if="goods" class="goods-detail">
      <!-- 商品图片 -->
      <view class="image-section">
        <swiper 
          v-if="goods.images && goods.images.length > 0"
          class="image-swiper"
          indicator-dots
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#fff"
        >
          <swiper-item v-for="(image, index) in goods.images" :key="index">
            <image :src="image" mode="aspectFill" class="goods-image" />
          </swiper-item>
        </swiper>
        <view v-else class="no-image">
          <text class="no-image-icon">📦</text>
          <text class="no-image-text">暂无图片</text>
        </view>
      </view>

      <!-- 商品基本信息 -->
      <view class="info-section">
        <view class="goods-name">{{ goods.name }}</view>
        <view class="goods-price">¥{{ goods.price }}</view>
        
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">商品条码</text>
            <text class="info-value">{{ goods.goodsNo }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">商品分类</text>
            <text class="info-value">{{ goods.cateName || '未分类' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">库存数量</text>
            <text class="info-value">{{ goods.stock }} 件</text>
          </view>
          <view class="info-item">
            <text class="info-label">同步状态</text>
            <text class="info-value" :class="getSyncStatusClass(goods.syncStatus)">
              {{ getSyncStatusText(goods.syncStatus) }}
            </text>
          </view>
        </view>
      </view>

      <!-- 商品描述 -->
      <view v-if="goods.description" class="desc-section">
        <view class="section-title">📝 商品描述</view>
        <view class="desc-content">{{ goods.description }}</view>
      </view>

      <!-- 时间信息 -->
      <view class="time-section">
        <view class="section-title">⏰ 时间信息</view>
        <view class="time-info">
          <view class="time-item">
            <text class="time-label">创建时间</text>
            <text class="time-value">{{ formatTime(goods.createTime) }}</text>
          </view>
          <view class="time-item">
            <text class="time-label">更新时间</text>
            <text class="time-value">{{ formatTime(goods.updateTime) }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <button class="action-btn edit" @click="editGoods">
          ✏️ 编辑商品
        </button>
        <button class="action-btn sync" @click="syncGoods" :disabled="goods.syncStatus === 1">
          🔄 {{ goods.syncStatus === 1 ? '已同步' : '立即同步' }}
        </button>
        <button class="action-btn delete" @click="deleteGoods">
          🗑️ 删除商品
        </button>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-else class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import goodsStore from '@/stores/goods'
import { saveGoods } from '@/api/goods'

// 响应式数据
const goods = ref(null)
const goodsId = ref('')

// 页面加载
onLoad((options) => {
  if (options.id) {
    goodsId.value = options.id
    loadGoodsDetail()
  }
})

// 加载商品详情
const loadGoodsDetail = () => {
  const foundGoods = goodsStore.localGoods.find(item => item.id === goodsId.value)
  if (foundGoods) {
    goods.value = foundGoods
  } else {
    uni.showToast({
      title: '商品不存在',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
}

// 获取同步状态样式类
const getSyncStatusClass = (status) => {
  switch (status) {
    case 1: return 'status-synced'
    case 2: return 'status-failed'
    default: return 'status-pending'
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

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '未知'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 编辑商品
const editGoods = () => {
  uni.navigateTo({
    url: `/pages/goods/edit?id=${goodsId.value}`
  })
}

// 同步商品
const syncGoods = async () => {
  if (goods.value.syncStatus === 1) return

  uni.showLoading({
    title: '同步中...'
  })

  try {
    const { id, createTime, updateTime, syncStatus, ...goodsData } = goods.value
    await saveGoods(goodsData)
    
    goodsStore.updateSyncStatus(goodsId.value, 1)
    goods.value.syncStatus = 1
    
    uni.showToast({
      title: '同步成功',
      icon: 'success'
    })
  } catch (error) {
    goodsStore.updateSyncStatus(goodsId.value, 2)
    goods.value.syncStatus = 2
    
    uni.showToast({
      title: '同步失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 删除商品
const deleteGoods = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个商品吗？删除后无法恢复。',
    success: (res) => {
      if (res.confirm) {
        goodsStore.deleteLocalGoods(goodsId.value)
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.detail-container {
  background: #f8f9fa;
  min-height: 100vh;
}

.image-section {
  height: 500rpx;
  background: #fff;

  .image-swiper {
    height: 100%;

    .goods-image {
      width: 100%;
      height: 100%;
    }
  }

  .no-image {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;

    .no-image-icon {
      font-size: 120rpx;
      color: #c0c4cc;
      margin-bottom: 20rpx;
    }

    .no-image-text {
      font-size: 28rpx;
      color: #909399;
    }
  }
}

.info-section {
  background: #fff;
  padding: 40rpx;
  margin-top: 20rpx;

  .goods-name {
    font-size: 36rpx;
    font-weight: bold;
    color: #303133;
    margin-bottom: 20rpx;
    line-height: 1.4;
  }

  .goods-price {
    font-size: 48rpx;
    font-weight: bold;
    color: #f56c6c;
    margin-bottom: 40rpx;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30rpx;
  }

  .info-item {
    .info-label {
      display: block;
      font-size: 24rpx;
      color: #909399;
      margin-bottom: 10rpx;
    }

    .info-value {
      font-size: 28rpx;
      color: #303133;
      font-weight: 500;

      &.status-synced {
        color: #19be6b;
      }

      &.status-pending {
        color: #ff9900;
      }

      &.status-failed {
        color: #f56c6c;
      }
    }
  }
}

.desc-section {
  background: #fff;
  padding: 40rpx;
  margin-top: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #303133;
    margin-bottom: 30rpx;
  }

  .desc-content {
    font-size: 28rpx;
    color: #606266;
    line-height: 1.6;
  }
}

.time-section {
  background: #fff;
  padding: 40rpx;
  margin-top: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #303133;
    margin-bottom: 30rpx;
  }

  .time-info {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }

  .time-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .time-label {
      font-size: 28rpx;
      color: #606266;
    }

    .time-value {
      font-size: 28rpx;
      color: #303133;
    }
  }
}

.action-section {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  height: 80rpx;
  border-radius: 15rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  transition: all 0.3s;

  &:active {
    transform: translateY(2rpx);
  }

  &.edit {
    background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
    color: #fff;
  }

  &.sync {
    background: linear-gradient(135deg, #19be6b 0%, #52c41a 100%);
    color: #fff;

    &:disabled {
      background: #c0c4cc;
    }
  }

  &.delete {
    background: linear-gradient(135deg, #f56c6c 0%, #ff4757 100%);
    color: #fff;
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;

  .loading-text {
    font-size: 28rpx;
    color: #909399;
  }
}
</style>

<template>
  <view class="detail-container">
    <view v-if="goods" class="goods-detail">
      <!-- 商品图片 -->
      <view class="image-section">
        <swiper
          v-if="getGoodsImages(goods).length > 0"
          class="image-swiper"
          indicator-dots
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#fff"
        >
          <swiper-item v-for="(image, index) in getGoodsImages(goods)" :key="index">
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
            <text class="info-value">{{ getGoodsCategory(goods) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">库存数量</text>
            <text class="info-value">{{ goods.stock }} 件</text>
          </view>
          <view class="info-item">
            <text class="info-label">安全库存</text>
            <text class="info-value">{{ goods.safetyStock || 0 }} 件</text>
          </view>
          <view v-if="isLocalGoods()" class="info-item">
            <text class="info-label">同步状态</text>
            <text class="info-value" :class="getSyncStatusClass(goods.syncStatus)">
              {{ getSyncStatusText(goods.syncStatus) }}
            </text>
          </view>
          <view v-else class="info-item">
            <text class="info-label">数据来源</text>
            <text class="info-value status-synced">服务器数据</text>
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
            <text class="time-value">{{ formatTime(getCreateTime(goods)) }}</text>
          </view>
          <view class="time-item">
            <text class="time-label">更新时间</text>
            <text class="time-value">{{ formatTime(getUpdateTime(goods)) }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <button class="action-btn edit" @click="editGoods">
          ✏️ 编辑商品
        </button>
        <button v-if="isLocalGoods()" class="action-btn sync" @click="syncGoods" :disabled="goods.syncStatus === 1">
          🔄 {{ goods.syncStatus === 1 ? '已同步' : '立即同步' }}
        </button>
        <button v-if="isLocalGoods()" class="action-btn delete" @click="deleteGoods">
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
import { onLoad, onShow } from '@dcloudio/uni-app'
import goodsStore from '@/stores/goods'
import { saveGoods, getGoodsDetail } from '@/api/goods'

// 响应式数据
const goods = ref(null)
const goodsId = ref('')

// 页面加载
onLoad((options) => {
  console.log('商品详情页面参数:', options)
  if (options.id) {
    goodsId.value = options.id
    loadGoodsDetail()
  } else {
    uni.showToast({
      title: '商品ID参数缺失',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

// 页面显示时刷新数据
onShow(() => {
  if (goodsId.value) {
    loadGoodsDetail()
  }
})

// 加载商品详情
const loadGoodsDetail = async () => {
  try {
    // 先从本地查找
    const foundGoods = goodsStore.localGoods.find(item => item.id === goodsId.value)
    if (foundGoods) {
      goods.value = foundGoods
      return
    }

    // 本地没有，尝试从服务器获取
    try {
      console.log('正在获取商品详情，ID:', goodsId.value)
      const response = await getGoodsDetail(goodsId.value)
      console.log('商品详情响应:', response)

      if (response.code === 200 && response.data && response.data.goods) {
        // 从响应中提取商品信息，并添加imagePath用于图片拼接
        const goodsData = {
          ...response.data.goods,
          imagePath: response.data.imagePath || ''
        }
        goods.value = goodsData
        console.log('设置商品数据:', goodsData)
      } else {
        throw new Error(response.message || '获取商品详情失败')
      }
    } catch (serverError) {
      console.error('从服务器获取商品详情失败:', serverError)
      uni.showToast({
        title: '商品不存在或网络错误',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    console.error('加载商品详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
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

// 获取商品分类名称
const getGoodsCategory = (item) => {
  if (!item) return '未分类'
  // 服务器数据可能有 cateInfo 对象
  if (item.cateInfo && item.cateInfo.name) {
    return item.cateInfo.name
  }
  // 本地数据直接有 cateName
  return item.cateName || '未分类'
}

// 获取商品图片列表
const getGoodsImages = (item) => {
  if (!item) return []

  const images = []

  // 优先使用logo字段（服务器数据）
  if (item.logo) {
    images.push(item.logo)
  }

  // 处理images字段
  if (item.images) {
    if (typeof item.images === 'string') {
      try {
        // 如果images是JSON字符串，解析它
        const parsedImages = JSON.parse(item.images)
        if (Array.isArray(parsedImages)) {
          parsedImages.forEach(img => {
            if (img && !images.includes(img)) {
              // 如果是相对路径，需要拼接imagePath
              if (img.startsWith('/') && item.imagePath) {
                images.push(item.imagePath + img)
              } else {
                images.push(img)
              }
            }
          })
        }
      } catch (e) {
        console.error('解析images字段失败:', e)
      }
    } else if (Array.isArray(item.images)) {
      // 如果images是数组
      item.images.forEach(img => {
        if (img && !images.includes(img)) {
          images.push(img)
        }
      })
    }
  }

  return images.filter(img => img) // 过滤空值
}

// 获取创建时间
const getCreateTime = (item) => {
  if (!item) return null
  // 根据API响应，直接使用createTime字段
  return item.createTime || item.createDate || item.createdAt || null
}

// 获取更新时间
const getUpdateTime = (item) => {
  if (!item) return null
  // 根据API响应，直接使用updateTime字段
  return item.updateTime || item.modifyDate || item.updatedAt || item.createTime || item.createDate || null
}

// 判断是否为本地商品
const isLocalGoods = () => {
  return goodsStore.localGoods.some(item => item.id === goodsId.value)
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '未知'

  let date
  // 处理不同的时间格式
  if (typeof timestamp === 'string') {
    // 如果是字符串格式的时间 "2024-01-01 12:00:00"
    date = new Date(timestamp)
  } else if (typeof timestamp === 'number') {
    // 如果是时间戳
    date = new Date(timestamp)
  } else {
    return '未知'
  }

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '未知'
  }

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
  // 如果是服务器数据，先转换为本地数据格式再编辑
  if (goods.value && !goodsStore.localGoods.find(item => item.id === goodsId.value)) {
    const localGoodsData = {
      id: goodsId.value,
      name: goods.value.name,
      goodsNo: goods.value.goodsNo,
      cateId: goods.value.cateId,
      cateName: getGoodsCategory(goods.value),
      price: goods.value.price,
      stock: goods.value.stock,
      images: getGoodsImages(goods.value),
      description: goods.value.description || '',
      status: goods.value.status,
      type: goods.value.type || 'goods',
      priceType: goods.value.priceType || 'piece',
      sort: goods.value.sort || 0,
      syncStatus: 1, // 服务器数据标记为已同步
      createTime: goods.value.createTime || Date.now(),
      updateTime: goods.value.updateTime || Date.now()
    }

    // 添加到本地存储
    goodsStore.localGoods.push(localGoodsData)
    uni.setStorageSync('localGoods', goodsStore.localGoods)
  }

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

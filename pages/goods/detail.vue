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
        <view class="goods-header">
          <view class="goods-name">{{ goods.name }}</view>
          <view class="goods-type-badge" :class="goods.type">
            {{ goods.type === 'goods' ? '实物商品' : '服务商品' }}
          </view>
        </view>

        <view class="price-section">
          <view class="goods-price">¥{{ goods.price }}</view>
          <view v-if="goods.linePrice && goods.linePrice > 0" class="line-price">
            原价：¥{{ goods.linePrice }}
          </view>
          <view class="price-type">
            {{ goods.priceType === 'piece' ? '按件计价' : '按重量计价' }}
          </view>
        </view>

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
            <text class="info-value">{{ goods.stock }} {{ getStockUnit(goods) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">安全库存</text>
            <text class="info-value">{{ goods.safetyStock || 0 }} {{ getStockUnit(goods) }}</text>
          </view>
          <view v-if="goods.weight" class="info-item">
            <text class="info-label">商品重量</text>
            <text class="info-value">{{ goods.weight }} 千克</text>
          </view>
          <view v-if="goods.salePoint" class="info-item">
            <text class="info-label">商品卖点</text>
            <text class="info-value">{{ goods.salePoint }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">商品状态</text>
            <text class="info-value" :class="goods.status === 'A' ? 'status-active' : 'status-inactive'">
              {{ goods.status === 'A' ? '上架' : '下架' }}
            </text>
          </view>

        </view>
      </view>

      <!-- 扩展信息 -->
      <view class="extend-section">
        <view class="section-title">⚙️ 扩展信息</view>
        <view class="extend-grid">
          <view class="extend-item">
            <text class="extend-label">积分抵扣</text>
            <text class="extend-value" :class="goods.canUsePoint === 'Y' ? 'status-active' : 'status-inactive'">
              {{ goods.canUsePoint === 'Y' ? '可用' : '不可用' }}
            </text>
          </view>
          <view class="extend-item">
            <text class="extend-label">会员折扣</text>
            <text class="extend-value" :class="goods.isMemberDiscount === 'Y' ? 'status-active' : 'status-inactive'">
              {{ goods.isMemberDiscount === 'Y' ? '有折扣' : '无折扣' }}
            </text>
          </view>
          <view class="extend-item">
            <text class="extend-label">规格类型</text>
            <text class="extend-value">
              {{ goods.isSingleSpec === 'Y' ? '单规格' : '多规格' }}
            </text>
          </view>
          <view v-if="goods.type === 'service' && goods.serviceTime" class="extend-item">
            <text class="extend-label">服务时长</text>
            <text class="extend-value">{{ goods.serviceTime }} 分钟</text>
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
        <button class="action-btn delete" @click="deleteGoodsHandler">
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
import { getGoodsDetail, getGoodsCateList, deleteGoods } from '@/api/goods'
import { formatTime as formatTimeUtil } from '@/utils/time'

const goods = ref(null)
const goodsId = ref('')

onLoad((options) => {
  if (options.id) {
    goodsId.value = options.id
    loadGoodsDetail()
    loadCategoriesIfNeeded()
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

const loadCategoriesIfNeeded = async () => {
  if (goodsStore.categories.length === 0) {
    try {
      const res = await getGoodsCateList({
        page: 1,
        pageSize: 100,
        status: 'A'
      })

      if (res.code === 200 && res.data && res.data.paginationResponse) {
        const categories = res.data.paginationResponse.content || []
        goodsStore.saveCategories(categories)
      }
    } catch (error) {
    }
  }
}

onShow(() => {
  if (goodsId.value) {
    loadGoodsDetail()
  }
})

const loadGoodsDetail = async () => {
  try {
    const response = await getGoodsDetail(goodsId.value)

    if (response.code === 200 && response.data && response.data.goods) {
      const goodsData = {
        ...response.data.goods,
        imagePath: response.data.imagePath || ''
      }
      goods.value = goodsData
    } else {
      throw new Error(response.message || '获取商品详情失败')
    }
  } catch (error) {
    uni.showToast({
      title: '商品不存在或网络错误',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
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

const getGoodsImages = (item) => {
  if (!item) return []

  const images = []

  if (item.logo) {
    images.push(item.logo)
  }

  if (item.images) {
    if (typeof item.images === 'string') {
      try {
        const parsedImages = JSON.parse(item.images)
        if (Array.isArray(parsedImages)) {
          parsedImages.forEach(img => {
            if (img && !images.includes(img)) {
              if (img.startsWith('/') && item.imagePath) {
                images.push(item.imagePath + img)
              } else {
                images.push(img)
              }
            }
          })
        }
      } catch (e) {
      }
    } else if (Array.isArray(item.images)) {
      item.images.forEach(img => {
        if (img && !images.includes(img)) {
          images.push(img)
        }
      })
    }
  }

  return images.filter(img => img)
}

const getCreateTime = (item) => {
  if (!item) return null
  return item.createTime || item.createDate || item.createdAt || null
}

const getUpdateTime = (item) => {
  if (!item) return null
  return item.updateTime || item.modifyDate || item.updatedAt || item.createTime || item.createDate || null
}



const formatTime = (timestamp) => {
  return formatTimeUtil(timestamp)
}

const getStockUnit = (item) => {
  if (!item) return '件'
  return item.priceType === 'weight' ? 'g' : '件'
}

const editGoods = () => {
  uni.navigateTo({
    url: `/pages/goods/edit?id=${goodsId.value}`
  })
}

const deleteGoodsHandler = async () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个商品吗？删除后无法恢复。',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '删除中...'
          })

          await deleteGoods(goodsId.value)

          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (error) {
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
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

  .goods-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30rpx;

    .goods-name {
      flex: 1;
      font-size: 36rpx;
      font-weight: bold;
      color: #303133;
      line-height: 1.4;
      margin-right: 20rpx;
    }

    .goods-type-badge {
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      color: #fff;
      white-space: nowrap;

      &.goods {
        background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
      }

      &.service {
        background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
      }
    }
  }

  .price-section {
    margin-bottom: 40rpx;

    .goods-price {
      font-size: 48rpx;
      font-weight: bold;
      color: #f56c6c;
      margin-bottom: 10rpx;
    }

    .line-price {
      font-size: 28rpx;
      color: #909399;
      text-decoration: line-through;
      margin-bottom: 10rpx;
    }

    .price-type {
      font-size: 24rpx;
      color: #67c23a;
      background: rgba(103, 194, 58, 0.1);
      padding: 4rpx 12rpx;
      border-radius: 12rpx;
      display: inline-block;
    }
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

      &.status-active {
        color: #67c23a;
      }

      &.status-inactive {
        color: #f56c6c;
      }
    }
  }
}

.extend-section {
  background: #fff;
  padding: 40rpx;
  margin-top: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #303133;
    margin-bottom: 30rpx;
  }

  .extend-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30rpx;
  }

  .extend-item {
    .extend-label {
      display: block;
      font-size: 24rpx;
      color: #909399;
      margin-bottom: 10rpx;
    }

    .extend-value {
      font-size: 28rpx;
      color: #303133;
      font-weight: 500;

      &.status-active {
        color: #67c23a;
      }

      &.status-inactive {
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

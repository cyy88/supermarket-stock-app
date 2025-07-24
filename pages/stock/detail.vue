<template>
  <view class="stock-detail-container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 详情内容 -->
    <view v-else class="detail-content">
      <!-- 状态头部 -->
      <view class="status-header">
        <view class="status-info">
          <text class="record-id">入库记录 #{{ stockInfo.id }}</text>
          <view class="status-actions">
            <view class="status-badge" :class="getStatusClass(stockInfo.reviewStatus)">
              {{ stockInfo.reviewStatus || '待审核' }}
            </view>
            <button v-if="canEdit" class="save-btn-header" @click="saveChanges" :disabled="saving">
              {{ saving ? '保存中...' : '保存修改' }}
            </button>
          </view>
        </view>
        
        <!-- 驳回说明（仅未通过状态显示） -->
        <view v-if="stockInfo.reviewStatus === '未通过' && stockInfo.reviewDesc" class="reject-notice">
          <view class="reject-header">
            <text class="reject-icon">⚠️</text>
            <text class="reject-title">驳回说明</text>
          </view>
          <text class="reject-content">{{ stockInfo.reviewDesc }}</text>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="info-section">
        <view class="section-title">基本信息</view>
        <view class="info-item">
          <text class="label">所属店铺：</text>
          <text class="value">{{ getStoreName(stockInfo.storeId) }}</text>
        </view>
        <view class="info-item">
          <text class="label">说明备注：</text>
          <textarea 
            v-if="canEdit"
            v-model="stockInfo.description"
            class="description-input"
            placeholder="请输入说明备注..."
            maxlength="200"
          />
          <text v-else class="value">{{ stockInfo.description || '无' }}</text>
        </view>
        <view class="info-item">
          <text class="label">创建时间：</text>
          <text class="value">{{ formatTime(stockInfo.createTime) }}</text>
        </view>
        <view v-if="stockInfo.updateTime !== stockInfo.createTime" class="info-item">
          <text class="label">更新时间：</text>
          <text class="value">{{ formatTime(stockInfo.updateTime) }}</text>
        </view>
      </view>

      <!-- 入库单图片 -->
      <view v-if="stockInfo.stockUrl" class="image-section">
        <view class="section-title">入库单</view>
        <view class="image-container">
          <image 
            :src="getFullImageUrl(stockInfo.stockUrl)"
            class="stock-image"
            mode="aspectFit"
            @click="previewImage(stockInfo.stockUrl)"
          />
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="goods-section">
        <view class="section-title">商品清单</view>
        <view v-if="goodsList.length === 0" class="empty-goods">
          <text>暂无商品</text>
        </view>
        <view v-else class="goods-list">
          <view 
            v-for="(item, index) in goodsList" 
            :key="index + '_' + item.id + '_' + item.skuId"
            class="goods-card"
          >
            <view class="goods-header">
              <image
                :src="getFullImageUrl(item.logo)"
                class="goods-image"
                mode="aspectFill"
                @error="handleImageError"
              />
              <view class="goods-info">
                <text class="goods-name">{{ item.name }}</text>
                <view class="goods-spec-type">
                  <text v-if="item.specList && item.specList.length > 0" class="spec-text">
                    <text v-for="spec in item.specList" :key="spec.id" class="spec-item">
                      {{ spec.value }}
                    </text>
                  </text>
                  <text v-else class="spec-text">标准规格</text>
                  <text v-if="item.priceType === 'weight'" class="type-tag weight">称重</text>
                  <text v-else class="type-tag piece">计件</text>
                </view>
              </view>
            </view>

            <view class="goods-body">
              <!-- 入库数量和损耗管理在一行 -->
              <view class="quantity-loss-row">
                <view class="quantity-section">
                  <text class="section-label">入库数量</text>
                  <view class="quantity-input-wrapper">
                    <input
                      v-if="canEdit"
                      v-model.number="item.num"
                      type="digit"
                      class="quantity-input"
                      :placeholder="item.priceType === 'weight' ? '0.00' : '1'"
                    />
                    <text v-else class="quantity-display">
                      {{ item.priceType === 'weight' ? item.num.toFixed(2) : Math.round(item.num) }}
                    </text>
                    <text class="unit">{{ item.priceType === 'weight' ? 'KG' : '件' }}</text>
                  </view>
                </view>

                <view class="loss-section">
                  <text class="section-label">损耗管理</text>
                  <view class="loss-content">
                    <view class="loss-upload-wrapper">
                      <view class="loss-upload" @click="canEdit ? uploadLossImage(index) : previewLossImage(item.lossUrl)">
                        <image
                          v-if="item.lossUrl"
                          :src="getFullImageUrl(item.lossUrl)"
                          class="loss-image"
                          mode="aspectFill"
                        />
                        <view v-else class="upload-placeholder">
                          <text class="upload-icon">📷</text>
                          <text class="upload-text">{{ canEdit ? '损耗证明' : '无' }}</text>
                        </view>
                      </view>
                      <!-- 删除按钮（仅编辑模式且有图片时显示） -->
                      <view
                        v-if="canEdit && item.lossUrl"
                        class="delete-loss-btn"
                        @click.stop="deleteLossImage(index)"
                      >
                        <text class="delete-icon">×</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
              
              <!-- 损耗说明单独一行 -->
              <view class="suggestion-row">
                <textarea
                  v-if="canEdit"
                  v-model="item.suggestion"
                  placeholder="损耗建议说明..."
                  class="suggestion-input"
                  maxlength="50"
                />
                <text v-else class="suggestion-display">{{ item.suggestion || '无损耗说明' }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>


    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStockInfo, saveStock } from '@/api/stock'
import userStore from '@/stores/user'

const fixMalformedUrl = (url) => {
  if (!url || typeof url !== 'string') return url
  
  const domainPattern = /(https?:\/\/[^\/]+)(https?:\/\/[^\/]+)/
  const match = url.match(domainPattern)
  
  if (match) {
    return url.replace(match[1], '')
  }
  
  return url
}

// 响应式数据
const loading = ref(true)
const saving = ref(false)
const stockInfo = ref({})
const goodsList = ref([])
const storeOptions = ref([])
const imagePath = ref('')
const stockId = ref(null)

// 计算属性
const canEdit = computed(() => {
  return stockInfo.value.reviewStatus === '未通过'
})

// 页面加载生命周期
onLoad((options) => {
  console.log('页面加载，接收参数:', options)
  stockId.value = options.id

  if (stockId.value) {
    console.log('开始加载入库详情, ID:', stockId.value)
    loadStockDetail()
  } else {
    console.error('未获取到入库记录ID')
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

const loadStockDetail = async () => {
  try {
    loading.value = true
    console.log('调用API获取入库详情, ID:', stockId.value)
    const response = await getStockInfo(stockId.value)

    console.log('API响应数据:', response)
    
    if (response && response.data) {
      stockInfo.value = response.data.stockInfo || {}

      // 转换商品数量：后端g转前端KG
      const rawGoodsList = response.data.goodsList || []
      goodsList.value = rawGoodsList.map(item => {
        if (item.priceType === 'weight' && typeof item.num === 'number') {
          return {
            ...item,
            num: parseFloat((item.num / 1000).toFixed(2))
          }
        }
        return {
          ...item,
          num: item.num || 0
        }
      })

      storeOptions.value = response.data.storeList || []
      imagePath.value = response.data.imagePath || ''

    } else {
      uni.showToast({
        title: 'API响应格式错误',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    })
    uni.showToast({
      title: `获取详情失败: ${error.message || '未知错误'}`,
      icon: 'none',
      duration: 3000
    })
  } finally {
    loading.value = false
  }
}

const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return ''

  return fixMalformedUrl(imageUrl)
}

const getStoreName = (storeId) => {
  if (!storeId || storeId === 0) return '公共所有'

  const userInfo = userStore.userInfo
  if (userInfo && userInfo.storeId === storeId && userInfo.storeName) {
    return userInfo.storeName
  }

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

const previewImage = (imageUrl) => {
  if (!imageUrl) return
  
  uni.previewImage({
    urls: [imageUrl],
    current: imageUrl
  })
}

const previewLossImage = (imageUrl) => {
  if (imageUrl) {
    previewImage(imageUrl)
  }
}

const uploadLossImage = (index) => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const filePath = res.tempFilePaths[0]
      uploadImageToServer(filePath, index)
    }
  })
}

const uploadImageToServer = (filePath, index) => {
  uni.showLoading({ title: '上传中...' })

  const token = uni.getStorageSync('token')

  uni.uploadFile({
    url: 'http://msbs-fuint-ts.qingchunnianhua.com:1880/backendApi/file/upload',
    filePath: filePath,
    name: 'file',
    header: {
      'Access-Token': token || '',
      'platform': 'MOBILE'
    },
    success: (uploadRes) => {
      try {
        const response = JSON.parse(uploadRes.data)
        if (response.code === 200) {
          // 始终使用完整的url字段
          let fullUrl = response.data.url
          goodsList.value[index].lossUrl = fullUrl
          uni.showToast({
            title: '上传成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: response.message || '上传失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
      }
    },
    fail: (error) => {
      uni.showToast({
        title: '上传失败',
        icon: 'none'
      })
    },
    complete: () => {
      uni.hideLoading()
    }
  })
}

const deleteLossImage = (index) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这张损耗证明图片吗？',
    success: (res) => {
      if (res.confirm) {
        goodsList.value[index].lossUrl = null
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
      }
    }
  })
}

const handleImageError = (e) => {
}

const saveChanges = async () => {
  try {
    saving.value = true
    
    if (!goodsList.value || goodsList.value.length === 0) {
      uni.showToast({
        title: '商品列表不能为空',
        icon: 'none'
      })
      return
    }
    
    // 转换商品数量：前端KG转后端g
    const convertedGoodsList = goodsList.value.map(item => {
      if (item.priceType === 'weight') {
        return {
          ...item,
          num: Math.round(item.num * 1000)
        }
      }
      return item
    })
    
    const formData = {
      ...stockInfo.value,
      goodsList: convertedGoodsList,
      reviewStatus: '待审核' // 修改后重新设为待审核
    }
    
    await saveStock(formData)
    
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  } finally {
    saving.value = false
  }
}


</script>

<style scoped>
.stock-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.loading {
  text-align: center;
  padding: 80rpx;
  color: #999;
}

.detail-content {
  padding: 16rpx;
}

.status-header {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.record-id {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
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

.save-btn-header {
  padding: 8rpx 16rpx;
  border: none;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: white;
  min-width: 120rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn-header:disabled {
  background: #d9d9d9;
  color: #999;
}

.reject-notice {
  background: #fff2f0;
  border: 2rpx solid #ffccc7;
  border-radius: 12rpx;
  padding: 16rpx;
}

.reject-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.reject-icon {
  font-size: 28rpx;
}

.reject-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.reject-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.info-section, .image-section, .goods-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-bottom: 12rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.info-item {
  display: flex;
  margin-bottom: 16rpx;
  align-items: flex-start;
  min-height: 48rpx;
}

.label {
  min-width: 140rpx;
  font-size: 26rpx;
  color: #666;
}

.value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.description-input {
  flex: 1;
  min-height: 80rpx;
  max-height: 120rpx;
  padding: 12rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 26rpx;
  background: white;
  line-height: 1.4;
}

.image-container {
  text-align: center;
}

.stock-image {
  max-width: 100%;
  max-height: 250rpx;
  border-radius: 12rpx;
}

.empty-goods {
  text-align: center;
  padding: 40rpx;
  color: #999;
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.goods-card {
  border: 2rpx solid #f0f0f0;
  border-radius: 12rpx;
  padding: 16rpx;
  background: #fafafa;
}

.goods-header {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.goods-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  background: #f0f0f0;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.goods-spec-type {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.spec-text {
  font-size: 24rpx;
  color: #666;
}

.spec-item {
  margin-right: 8rpx;
}

.type-tag {
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
  color: white;
  font-weight: bold;
}

.type-tag.weight {
  background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%);
}

.type-tag.piece {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.goods-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.quantity-loss-row {
  display: flex;
  gap: 16rpx;
}

.quantity-section, .loss-section {
  flex: 1;
  background: white;
  border-radius: 12rpx;
  padding: 16rpx;
}

.section-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
}

.quantity-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.quantity-input {
  flex: 1;
  padding: 8rpx 12rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 6rpx;
  font-size: 26rpx;
  text-align: center;
}

.quantity-display {
  flex: 1;
  padding: 8rpx 12rpx;
  font-size: 26rpx;
  text-align: center;
  color: #333;
}

.unit {
  font-size: 24rpx;
  color: #666;
}

.loss-content {
  display: flex;
  justify-content: center;
}

.loss-upload-wrapper {
  position: relative;
  display: inline-block;
}

.loss-upload {
  width: 60rpx;
  height: 60rpx;
  border: 2rpx dashed #d9d9d9;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.delete-loss-btn {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 24rpx;
  height: 24rpx;
  background: #ff4d4f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.delete-icon {
  color: white;
  font-size: 16rpx;
  font-weight: bold;
  line-height: 1;
}

.loss-image {
  width: 100%;
  height: 100%;
  border-radius: 6rpx;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.upload-icon {
  font-size: 20rpx;
  color: #999;
}

.upload-text {
  font-size: 16rpx;
  color: #999;
}

.suggestion-row {
  width: 100%;
}

.suggestion-input {
  width: 100%;
  min-height: 60rpx;
  max-height: 100rpx;
  padding: 12rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 24rpx;
  background: white;
  box-sizing: border-box;
  line-height: 1.4;
}

.suggestion-display {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}


</style>

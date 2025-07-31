<template>
  <view class="container">

    <!-- 操作按钮区域 -->
    <view class="action-section">
      <view class="action-card" @click="selectGoods">
        <view class="action-icon">📦</view>
        <text class="action-text">添加商品</text>
        <text class="action-desc">选择需要入库的商品</text>
      </view>

      <view class="action-card" @click="addInboundOrder">
        <view class="action-icon">📄</view>
        <text class="action-text">添加入库单</text>
        <text class="action-desc">上传入库单据图片</text>
      </view>
    </view>

    <!-- 已上传的入库单预览 -->
    <view v-if="form.stockUrl" class="inbound-section">
      <view class="section-title">
        <text class="title-icon">📄</text>
        <text class="title-text">入库单据</text>
      </view>
      <view class="inbound-preview">
        <image
          :src="fullStockUrl"
          class="preview-image"
          mode="aspectFill"
          @click="previewInboundOrder"
        />
        <view class="preview-status">
          <text class="status-text">✓ 已上传</text>
        </view>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-section">
      <view class="section-title">
        <text class="title-icon">📦</text>
        <text class="title-text">商品列表</text>
        <text class="goods-count">{{ goodsList.length }}件</text>
      </view>

      <view v-if="goodsList.length === 0" class="empty-state">
        <view class="empty-icon">📦</view>
        <text class="empty-text">暂无商品，请先添加商品</text>
        <text class="empty-desc">点击上方"添加商品"按钮开始</text>
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
            <view class="delete-btn" @click="deleteGoods(item)">
              <text class="delete-icon">×</text>
            </view>
          </view>

          <view class="goods-body">
            <!-- 入库数量和损耗管理在一行 -->
            <view class="quantity-loss-row">
              <view class="quantity-section">
                <text class="section-label">入库数量</text>
                <view class="quantity-input-wrapper">
                  <input
                    v-model.number="item.num"
                    type="digit"
                    class="quantity-input"
                    :placeholder="item.priceType === 'weight' ? '0.00' : '1'"
                  />
                  <text class="unit">{{ item.priceType === 'weight' ? 'KG' : '件' }}</text>
                </view>
              </view>

              <view class="loss-section">
                <text class="section-label">损耗管理</text>
                <view class="loss-content">
                  <view class="loss-upload" @click="uploadLossImage(index)">
                    <image
                      v-if="item.lossUrl"
                      :src="getFullImageUrl(item.lossUrl)"
                      class="loss-image"
                      mode="aspectFill"
                    />
                    <view v-else class="upload-placeholder">
                      <text class="upload-icon">📷</text>
                      <text class="upload-text">损耗证明</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <!-- 损耗说明单独一行，但长度缩小 -->
            <view class="suggestion-row">
              <textarea
                v-model="item.suggestion"
                placeholder="损耗建议说明..."
                class="suggestion-input"
                maxlength="50"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 备注信息 -->
      <view v-if="goodsList.length > 0" class="remark-section">
        <view class="section-title">
          <text class="title-icon">📝</text>
          <text class="title-text">备注信息</text>
        </view>
        <textarea
          v-model="form.description"
          placeholder="请输入本次入库的备注信息..."
          class="remark-input"
          maxlength="200"
        />
        <text class="char-count">{{ form.description.length }}/200</text>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <button class="submit-btn" :disabled="loading" @click="submitForm">
        <text v-if="loading">提交中...</text>
        <text v-else>提交入库</text>
      </button>
    </view>



    <!-- 添加入库单对话框 -->
    <AddInboundOrderDialog
      ref="addInboundOrderDialogRef"
      :show-dialog="showAddInboundOrderDialog"
      :image-path="imagePath"
      @close-dialog="closeInboundOrder"
      @submit="handleInboundOrderSubmit"
    />

    <!-- 确认删除弹窗 -->
    <ConfirmDialog
      v-model:visible="showDeleteDialog"
      title="确认删除"
      content="确定要删除这个商品吗？"
      type="danger"
      @confirm="confirmDeleteGoods"
      @cancel="cancelDeleteGoods"
    />
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import userStore from '@/stores/user'
import { saveStock } from '@/api/stock'

import AddInboundOrderDialog from '@/components/AddInboundOrderDialog.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const fixMalformedUrl = (url) => {
  if (!url || typeof url !== 'string') return url
  
  const domainPattern = /(https?:\/\/[^\/]+)(https?:\/\/[^\/]+)/
  const match = url.match(domainPattern)
  
  if (match) {
    return url.replace(match[1], '')
  }
  
  return url
}

const loading = ref(false)
const imagePath = ref('')
const storeOptions = ref([])
const selectedStoreIndex = ref(0)
const goodsList = ref([])

const showAddInboundOrderDialog = ref(false)
const showDeleteDialog = ref(false)
const currentDeleteItem = ref(null)


const addInboundOrderDialogRef = ref(null)

const form = reactive({
  storeId: 0,
  type: 'increase',
  description: '',
  stockUrl: '',
  status: 'A',
  goodsList: []
})

const fullStockUrl = computed(() => {
  if (!form.stockUrl) return ''
  return fixMalformedUrl(form.stockUrl)
})

const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) {
    console.log('图片URL为空')
    return ''
  }

  return fixMalformedUrl(imageUrl)
}

// 处理图片加载错误
const handleImageError = (e) => {
  console.log('图片加载失败:', e)
  console.log('失败的图片src:', e.target?.src || e.detail?.src)
}

onMounted(() => {
  initData()
})

onShow(() => {
  setTimeout(() => {
    checkSelectedGoodsData()
  }, 100)
})

const checkSelectedGoodsData = () => {
  try {
    const storedData = uni.getStorageSync('selectedGoodsData')

    if (storedData && storedData.data && storedData.timestamp) {
      const now = Date.now()
      const dataAge = now - storedData.timestamp

      if (dataAge < 5 * 60 * 1000) { // 5分钟内的数据有效
        handleSelectGoods(storedData.data)
        uni.removeStorageSync('selectedGoodsData')
      } else {
        uni.removeStorageSync('selectedGoodsData')
      }
    } else {
    }
  } catch (error) {
  }
}

const initData = () => {
  const userInfo = userStore.userInfo
  if (userInfo && userInfo.storeId) {
    form.storeId = userInfo.storeId
  } else {
    // 如果没有用户店铺信息，设置为0（公共所有）
    form.storeId = 0
  }

  // 模拟店铺数据，实际应该从API获取
  storeOptions.value = [
    { id: 0, name: '公共所有' },
    { id: 1, name: '总店' },
    { id: 2, name: '分店1' }
  ]

  imagePath.value = 'http://msbs-fuint-ts.qingchunnianhua.com:1880/'
  if (!imagePath.value.endsWith('/')) {
    imagePath.value += '/'
  }
}

const onStoreChange = (event) => {
  const index = event.detail.value
  selectedStoreIndex.value = index
  form.storeId = storeOptions.value[index].id
}

const getStoreName = (storeId) => {
  const store = storeOptions.value.find(item => item.id === storeId)
  return store ? store.name : '未知店铺'
}

const selectGoods = () => {
  uni.navigateTo({
    url: `/pages/goods/select?storeId=${form.storeId}`,
    events: {
      selectGoods: function(data) {
        handleSelectGoods(data)
      }
    },
    success: function() {
    },
    fail: function(err) {
      uni.showToast({
        title: '页面跳转失败',
        icon: 'none'
      })
    }
  })
}

const handleSelectGoods = (selectData) => {

  if (!selectData || selectData.length === 0) {
    uni.showToast({
      title: '请至少选择一个商品',
      icon: 'none'
    })
    return
  }

  try {

    const processedGoods = selectData.map(item => {
      const goodsItem = JSON.parse(JSON.stringify(item))

      goodsItem.num = goodsItem.priceType === 'weight' ? 0.00 : 1
      goodsItem.lossUrl = goodsItem.lossUrl || null
      goodsItem.suggestion = goodsItem.suggestion || ''

      return goodsItem
    })

    goodsList.value = processedGoods

    nextTick(() => {
      uni.showToast({
        title: `已添加${goodsList.value.length}件商品`,
        icon: 'success',
        duration: 1500
      })
    })
  } catch (error) {
    uni.showToast({
      title: '处理商品数据失败',
      icon: 'none'
    })
  }
}


// 添加入库单
const addInboundOrder = () => {
  showAddInboundOrderDialog.value = true
}

// 关闭入库单对话框
const closeInboundOrder = () => {
  showAddInboundOrderDialog.value = false
}

// 处理入库单提交
const handleInboundOrderSubmit = (images) => {
  if (images && images.length > 0) {
    const imageData = images[0]

    if (typeof imageData === 'object') {
      // 使用完整URL
      if (imageData.url) {
        form.stockUrl = imageData.url
      } else {
        form.stockUrl = JSON.stringify(imageData)
      }
    } else {
      form.stockUrl = imageData
    }
    nextTick(() => {})

    uni.showToast({
      title: '入库单上传成功',
      icon: 'success'
    })
  } else {
    form.stockUrl = ''
  }
}

// 预览入库单
const previewInboundOrder = () => {
  uni.previewImage({
    urls: [fullStockUrl.value],
    current: fullStockUrl.value
  })
}

// 上传损耗图片
const uploadLossImage = (index) => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uploadImage(tempFilePath, index)
    }
  })
}

// 上传图片
const uploadImage = (filePath, index) => {
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
            title: '上传失败',
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
    fail: () => {
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

// 删除商品
const deleteGoods = (item) => {
  currentDeleteItem.value = item
  showDeleteDialog.value = true
}

const confirmDeleteGoods = () => {
  if (currentDeleteItem.value) {
    goodsList.value = goodsList.value.filter(goods =>
      !(goods.id === currentDeleteItem.value.id && goods.skuId === currentDeleteItem.value.skuId)
    )
    currentDeleteItem.value = null
  }
}

const cancelDeleteGoods = () => {
  currentDeleteItem.value = null
}

// 转换商品数量（前端与后端转换）
const convertGoodsQuantity = (goodsList, direction) => {
  return goodsList.map(item => {
    if (item.priceType === 'weight') {
      if (direction === 'toBackend') {
        return { ...item, num: Math.round(item.num * 1000) }
      } else if (direction === 'toFrontend') {
        // 后端g转前端KG
        return { ...item, num: parseFloat((item.num / 1000).toFixed(2)) }
      }
    }
    return item
  })
}

const submitForm = async () => {
  if (!goodsList.value || goodsList.value.length < 1) {
    uni.showToast({
      title: '请先添加商品',
      icon: 'none'
    })
    return
  }

  if (!form.stockUrl) {
    uni.showToast({
      title: '入库操作必须上传入库单',
      icon: 'none'
    })
    return
  }

  for (let item of goodsList.value) {
    if (!item.num || item.num <= 0) {
      uni.showToast({
        title: `请输入${item.name}的数量`,
        icon: 'none'
      })
      return
    }
  }

  loading.value = true

  try {
    const convertedGoodsList = convertGoodsQuantity(goodsList.value, 'toBackend')

    const submitData = {
      ...form,
      goodsList: convertedGoodsList
    }

    await saveStock(submitData)
    
    uni.showToast({
      title: '提交成功',
      icon: 'success'
    })

    // 返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)

  } catch (error) {
    console.error('提交失败:', error)
    uni.showToast({
      title: '提交失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx;
  padding-bottom: 160rpx;
  /* 添加状态栏高度适配 */
  padding-top: calc(20rpx + var(--status-bar-height));
}

/* 操作按钮区域 */
.action-section {
  display: flex;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.action-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 40rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.action-card:active {
  transform: translateY(4rpx);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.action-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.action-desc {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

/* 入库单据区域 */
.inbound-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.title-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.goods-count {
  font-size: 24rpx;
  color: #666;
  background: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.inbound-preview {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.preview-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  border: 2rpx solid #eee;
}

.preview-status {
  flex: 1;
}

.status-text {
  font-size: 28rpx;
  color: #52c41a;
  font-weight: bold;
}

/* 商品列表区域 */
.goods-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #999;
}

/* 商品列表 */
.goods-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.goods-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  border: 2rpx solid #f0f0f0;
}

.goods-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 32rpx;
  position: relative;
}

.goods-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
  border: 2rpx solid #f0f0f0;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
  line-height: 1.4;
}

.goods-spec-type {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.spec-text {
  font-size: 24rpx;
  color: #666;
}

.spec-item {
  font-size: 24rpx;
  color: #666;
  margin-right: 8rpx;
}

.type-tag {
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
  color: white;
  font-weight: bold;
  white-space: nowrap;
}

.type-tag.weight {
  background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%);
}

.type-tag.piece {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.delete-btn {
  position: absolute;
  top: -16rpx;
  right: -16rpx;
  width: 48rpx;
  height: 48rpx;
  background: #ff4d4f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.3);
}

.delete-icon {
  color: white;
  font-size: 24rpx;
  font-weight: bold;
}

/* 商品卡片内容区域 */
.goods-body {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 数量和损耗管理在一行 */
.quantity-loss-row {
  display: flex;
  gap: 24rpx;
  align-items: flex-start;
}

/* 损耗说明单独一行 */
.suggestion-row {
  width: 100%;
}

.section-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.quantity-section {
  flex: 1;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
}

.quantity-input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12rpx;
  padding: 16rpx;
  border: 2rpx solid #e9ecef;
}

.quantity-input {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  border: none;
  background: transparent;
}

.unit {
  font-size: 24rpx;
  color: #666;
  font-weight: bold;
  margin-left: 16rpx;
}

/* 损耗管理区域 */
.loss-section {
  flex: 1;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
}

.loss-content {
  display: flex;
  justify-content: center;
}

.loss-upload {
  width: 80rpx;
  height: 80rpx;
  border: 2rpx dashed #d9d9d9;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  transition: all 0.3s ease;
}

.loss-upload:active {
  border-color: #1890ff;
  background: #f0f8ff;
}

.loss-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.upload-icon {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 4rpx;
}

.upload-text {
  font-size: 16rpx;
  color: #999;
}

.suggestion-input {
  width: 100%;
  min-height: 80rpx;
  padding: 16rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  font-size: 24rpx;
  background: white;
  line-height: 1.5;
  box-sizing: border-box;
}

/* 备注区域 */
.remark-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-top: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.remark-input {
  width: 100%;
  min-height: 120rpx;
  padding: 24rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  font-size: 28rpx;
  background: white;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.char-count {
  font-size: 22rpx;
  color: #999;
  text-align: right;
}

/* 底部操作按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 32rpx;
  border-top: 2rpx solid rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  border: none;
  border-radius: 24rpx;
  font-size: 36rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  background: #d9d9d9;
  box-shadow: none;
}
</style>

<template>
  <view class="add-goods-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <text class="page-title">📦 添加新商品</text>
        <text class="page-subtitle">填写商品信息，快速上架</text>
      </view>
      <view class="progress-bar">
        <view class="progress-step" :class="{ active: currentStep >= 1 }">
          <text class="step-number">1</text>
          <text class="step-text">基本信息</text>
        </view>
        <view class="progress-line" :class="{ active: currentStep >= 2 }"></view>
        <view class="progress-step" :class="{ active: currentStep >= 2 }">
          <text class="step-number">2</text>
          <text class="step-text">图片描述</text>
        </view>
        <view class="progress-line" :class="{ active: currentStep >= 3 }"></view>
        <view class="progress-step" :class="{ active: currentStep >= 3 }">
          <text class="step-number">3</text>
          <text class="step-text">完成</text>
        </view>
      </view>
    </view>

    <!-- 基本信息卡片 -->
    <view class="card" :class="{ active: currentStep === 1 }">
      <view class="card-header">
        <view class="card-title">
          <text class="title-icon">📋</text>
          <text class="title-text">基本信息</text>
        </view>
        <view class="card-badge required">必填</view>
      </view>
      
      <view class="form-item">
        <text class="label">商品条码</text>
        <input
            style="width: 85%;"
          v-model="form.goodsNo"
          placeholder="扫码自动填入或手动输入"
          class="input readonly"
          readonly
        />
      </view>

      <view class="form-item">
        <text class="label required">商品名称</text>
        <view class="input-with-ai">
          <input
            v-model="form.name"
            placeholder="请输入商品名称"
            class="input"
            @input="updateStep"
          />
          <button
            class="ai-btn"
            @click="showAIRecognitionModal"
            :disabled="aiRecognizing"
          >
            {{ aiRecognizing ? '🤖 识别中...' : '🤖 AI识别' }}
          </button>
        </view>
      </view>

      <view class="form-item">
        <text class="label required">商品分类</text>
        <picker
            style="width: 85%;"
          :range="categoryList"
          range-key="name"
          @change="onCategoryChange"
          :value="selectedCategoryIndex"
        >
          <view class="input select">
            <text :class="{ placeholder: !form.cateName }">
              {{ form.cateName || '请选择商品分类' }}
            </text>
            <text class="arrow">▼</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label required">商品价格</text>
        <view class="input-group"  style="width: 50%;">
          <input
            v-model="form.price"
            type="digit"
            placeholder="请输入价格"
            class="input"
            @input="updateStep"
          />
          <text class="unit">元</text>
        </view>
      </view>

      <view class="form-item">
        <text class="label">库存数量</text>
        <view class="input-group"  style="width: 50%;">
          <input 
            v-model="form.stock"
            type="number"
            placeholder="请输入库存数量"
            class="input"
          />
<!--          <text class="unit">件</text>-->
        </view>
      </view>
    </view>

    <!-- 商品图片卡片 -->
    <view class="card" :class="{ active: currentStep === 2 }">
      <view class="card-header">
        <view class="card-title">
          <text class="title-icon">🖼️</text>
          <text class="title-text">商品图片</text>
        </view>
        <view class="card-badge optional">可选</view>
      </view>
      <view class="image-upload">
        <view class="image-list">
          <view 
            v-for="(image, index) in imageList" 
            :key="index"
            class="image-item"
          >
            <image :src="image.url" mode="aspectFill" class="image" />
            <view class="image-delete" @click="deleteImage(index)">✕</view>
          </view>
          
          <view 
            v-if="imageList.length < 5" 
            class="image-add"
            @click="chooseImage"
          >
            <text class="add-icon">📷</text>
            <text class="add-text">添加图片</text>
          </view>
        </view>
        <text class="image-tip">最多可上传5张图片</text>
      </view>
    </view>

    <!-- 商品描述卡片 -->
    <view class="card" :class="{ active: currentStep === 2 }">
      <view class="card-header">
        <view class="card-title">
          <text class="title-icon">📝</text>
          <text class="title-text" >商品描述</text>
        </view>
        <view class="card-badge optional">可选</view>
      </view>
      <textarea
          style="width: 90%;"
        v-model="form.description"
        placeholder="请输入商品描述（可选）"
        class="textarea"
        maxlength="500"
        @input="updateStep"
      />
      <view class="char-count">{{ form.description.length }}/500</view>
    </view>

    <!-- 保存按钮 -->
    <view class="form-actions">
      <button
        class="save-btn"
        :class="{ loading: saving }"
        @click="handleSaveGoods"
        :disabled="saving"
      >
        {{ saving ? '保存中...' : '💾 保存商品' }}
      </button>
    </view>

    <!-- AI识别模态框 -->
    <view v-if="showAIModal" class="ai-modal-overlay" @click="closeAIModal">
      <view class="ai-modal" @click.stop>
        <view class="ai-modal-header">
          <text class="ai-modal-title">🤖 AI智能识别</text>
          <text class="ai-modal-close" @click="closeAIModal">✕</text>
        </view>

        <view class="ai-modal-content">
          <view v-if="!aiRecognizing && !aiResult" class="ai-upload-area">
            <view class="ai-upload-icon">📷</view>
            <text class="ai-upload-text">选择商品图片进行AI识别</text>
            <text class="ai-upload-tip">支持JPG、PNG格式，识别约需12秒</text>
            <button class="ai-upload-btn" @click="chooseImageForAI">选择图片</button>
          </view>

          <view v-if="aiRecognizing" class="ai-recognizing">
            <view class="ai-loading">
              <view class="ai-loading-spinner"></view>
            </view>
            <text class="ai-recognizing-text">AI正在识别中...</text>
            <text class="ai-recognizing-tip">请稍候，大约需要12秒</text>
            <view class="ai-progress">
              <view class="ai-progress-bar" :style="{ width: aiProgress + '%' }"></view>
            </view>
          </view>

          <view v-if="aiResult && !aiRecognizing" class="ai-result">
            <view v-if="aiResult.success" class="ai-result-success">
              <text class="ai-result-title">✅ 识别成功</text>
              <view class="ai-result-item">
                <text class="ai-result-label">商品名称：</text>
                <text class="ai-result-value">{{ aiResult.data.name }}</text>
              </view>
              <view class="ai-result-item">
                <text class="ai-result-label">商品条码：</text>
                <text class="ai-result-value">{{ aiResult.data.num }}</text>
              </view>
              <view class="ai-result-actions">
                <button class="ai-result-btn apply" @click="applyAIResult">应用结果</button>
                <button class="ai-result-btn retry" @click="retryAIRecognition">重新识别</button>
              </view>
            </view>

            <view v-else class="ai-result-error">
              <text class="ai-result-title">❌ 识别失败</text>
              <text class="ai-result-error-msg">{{ aiResult.error }}</text>
              <view class="ai-result-actions">
                <button class="ai-result-btn retry" @click="retryAIRecognition">重新识别</button>
                <button class="ai-result-btn cancel" @click="closeAIModal">取消</button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import goodsStore from '@/stores/goods'
import { saveGoods as saveGoodsApi, getGoodsCateList, uploadImage } from '@/api/goods'
import { recognizeProductImage } from '@/api/ai'

const saving = ref(false)
const showCategoryPicker = ref(false)
const categoryList = ref([])
const imageList = ref([])
const currentStep = ref(1)
const selectedCategoryIndex = ref(0)

// AI识别相关状态
const showAIModal = ref(false)
const aiRecognizing = ref(false)
const aiResult = ref(null)
const aiProgress = ref(0)
const aiImageUrl = ref('')
const aiProgressTimer = ref(null)

const form = reactive({
  goodsNo: '',
  name: '',
  cateId: '',
  cateName: '',
  price: '',
  stock: '',
  description: ''
})

onLoad((options) => {
  if (options.barcode) {
    form.goodsNo = decodeURIComponent(options.barcode)
  }
  loadCategoryList()
  updateStep()
})

const updateStep = () => {
  if (form.name && form.cateId && form.price) {
    currentStep.value = 2
  } else {
    currentStep.value = 1
  }

  if (form.name && form.cateId && form.price && (imageList.value.length > 0 || form.description)) {
    currentStep.value = 3
  }
}

const loadCategoryList = async () => {
  try {
    const res = await getGoodsCateList({
      page: 1,
      pageSize: 100,
      status: 'A'
    })

    if (res.code === 200 && res.data && res.data.paginationResponse) {
      const categories = res.data.paginationResponse.content || []
      categoryList.value = categories
      goodsStore.saveCategories(categoryList.value)

      if (categories.length === 0) {
        uni.showToast({
          title: '暂无可用分类',
          icon: 'none'
        })
      }
    } else {
      throw new Error(res.message || '获取分类失败')
    }
  } catch (error) {
    categoryList.value = goodsStore.categories

    if (categoryList.value.length === 0) {
      uni.showToast({
        title: '获取分类失败，请检查网络连接',
        icon: 'none'
      })
    } else {
      uni.showToast({
        title: '网络异常，使用本地缓存',
        icon: 'none'
      })
    }
  }
}

const onCategoryChange = (e) => {
  const selectedCategory = categoryList.value[e.detail.value]
  if (selectedCategory) {
    form.cateId = selectedCategory.id
    form.cateName = selectedCategory.name
    selectedCategoryIndex.value = e.detail.value
  }
  showCategoryPicker.value = false
  updateStep()
}

const chooseImage = () => {
  uni.chooseImage({
    count: 5 - imageList.value.length,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      uploadImages(res.tempFilePaths)
    }
  })
}

const uploadImages = async (filePaths) => {
  uni.showLoading({
    title: '上传中...'
  })

  try {
    for (const filePath of filePaths) {
      const response = await uploadImage(filePath)
      let imageUrl = ''
      if (typeof response === 'string') {
        imageUrl = response
      } else if (response.url) {
        imageUrl = response.url
      } else if (response.data && response.data.url) {
        imageUrl = response.data.url
      } else {
        throw new Error('图片上传失败：无法获取图片URL')
      }
      if (imageUrl && imageUrl.trim()) {
        imageList.value.push({
          url: imageUrl,
          tempPath: filePath
        })
      } else {
        throw new Error('图片URL为空')
      }
    }
    updateStep()
  } catch (error) {
    console.error('图片上传失败:', error)
    uni.showToast({
      title: error.message || '图片上传失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

const deleteImage = (index) => {
  imageList.value.splice(index, 1)
  updateStep()
}

const validateForm = () => {
  if (!form.name.trim()) {
    uni.showToast({
      title: '请输入商品名称',
      icon: 'none'
    })
    return false
  }
  
  if (!form.cateId) {
    uni.showToast({
      title: '请选择商品分类',
      icon: 'none'
    })
    return false
  }
  
  if (!form.price || parseFloat(form.price) <= 0) {
    uni.showToast({
      title: '请输入正确的商品价格',
      icon: 'none'
    })
    return false
  }
  
  return true
}

// AI识别相关方法
const showAIRecognitionModal = () => {
  showAIModal.value = true
  aiResult.value = null
  aiProgress.value = 0
}

const closeAIModal = () => {
  showAIModal.value = false
  aiRecognizing.value = false
  aiResult.value = null
  aiProgress.value = 0
  aiImageUrl.value = ''
  if (aiProgressTimer.value) {
    clearInterval(aiProgressTimer.value)
    aiProgressTimer.value = null
  }
}

const chooseImageForAI = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      const filePath = res.tempFilePaths[0]
      uploadImageForAI(filePath)
    },
    fail: (error) => {
      uni.showToast({
        title: '选择图片失败',
        icon: 'none'
      })
    }
  })
}

const uploadImageForAI = async (filePath) => {
  try {
    console.log('开始上传图片用于AI识别:', filePath);

    uni.showLoading({
      title: '上传图片中...'
    })

    const imageUrl = await uploadImage(filePath)
    console.log('图片上传成功，URL:', imageUrl);

    aiImageUrl.value = imageUrl

    uni.hideLoading()

    // 开始AI识别
    console.log('开始调用AI识别...');
    startAIRecognition(imageUrl)
  } catch (error) {
    console.error('图片上传失败:', error);
    uni.hideLoading()
    uni.showToast({
      title: '图片上传失败',
      icon: 'none'
    })
  }
}

const startAIRecognition = async (imageUrl) => {
  try {
    console.log('startAIRecognition 被调用，图片URL:', imageUrl);

    aiRecognizing.value = true
    aiProgress.value = 0

    // 启动进度条动画
    startProgressAnimation()

    console.log('开始调用 recognizeProductImage...');

    // 调用AI识别
    const result = await recognizeProductImage(imageUrl)

    console.log('AI识别完成，结果:', result);

    // 停止进度条动画
    stopProgressAnimation()

    aiRecognizing.value = false
    aiResult.value = result

    if (result.success) {
      console.log('AI识别成功');
      uni.showToast({
        title: '识别成功',
        icon: 'success'
      })
    } else {
      console.log('AI识别失败:', result.error);
      uni.showToast({
        title: '识别失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('startAIRecognition 异常:', error);
    stopProgressAnimation()
    aiRecognizing.value = false
    aiResult.value = {
      success: false,
      error: error.message || '识别失败，请重试'
    }

    uni.showToast({
      title: '识别失败',
      icon: 'none'
    })
  }
}

const startProgressAnimation = () => {
  aiProgress.value = 0
  aiProgressTimer.value = setInterval(() => {
    if (aiProgress.value < 90) {
      aiProgress.value += Math.random() * 10
    }
  }, 500)
}

const stopProgressAnimation = () => {
  if (aiProgressTimer.value) {
    clearInterval(aiProgressTimer.value)
    aiProgressTimer.value = null
  }
  aiProgress.value = 100
}

const applyAIResult = () => {
  if (aiResult.value && aiResult.value.success) {
    form.name = aiResult.value.data.name
    form.goodsNo = aiResult.value.data.num
    updateStep()
    closeAIModal()

    uni.showToast({
      title: '已应用AI识别结果',
      icon: 'success'
    })
  }
}

const retryAIRecognition = () => {
  if (aiImageUrl.value) {
    startAIRecognition(aiImageUrl.value)
  } else {
    chooseImageForAI()
  }
}

const handleSaveGoods = async () => {
  try {
    if (!validateForm()) return

    saving.value = true

    const imageUrls = imageList.value.map(item => {
      if (typeof item === 'string') {
        return item
      } else if (item && item.url) {
        return item.url
      }
      return null
    }).filter(url => url)

    const goodsData = {
      name: form.name.trim(),
      goodsNo: form.goodsNo,
      cateId: parseInt(form.cateId),
      images: imageUrls,
      type: 'goods',
      priceType: 'piece',
      status: 'A',
      price: parseFloat(form.price),
      linePrice: parseFloat(form.price) ,
      stock: parseInt(form.stock) || 0,
      canUsePoint: 'Y',
      isMemberDiscount: 'Y',
      isSingleSpec: 'Y',
      serviceTime: 0,
      weight: '',
      sort: 0,
      isItaconsumableitem: 2,
      description: form.description.trim()
    }

    const localGoods = goodsStore.saveLocalGoods({
      ...goodsData,
      cateName: form.cateName
    })

    try {
      const response = await saveGoodsApi(goodsData)
      if (response.code === 200) {
        goodsStore.updateSyncStatus(localGoods.id, 1)
        uni.showToast({
          title: '商品保存成功',
          icon: 'success'
        })
      } else {
        throw new Error(response.message || '保存失败')
      }
    } catch (error) {
      uni.showToast({
        title: '已保存到本地，稍后同步',
        icon: 'none'
      })
    }
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)

  } catch (error) {
    uni.showToast({
      title: error.message || '保存失败，请重试',
      icon: 'none'
    })
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.add-goods-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.page-header {
  padding: 40rpx 30rpx;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10rpx);
  margin-bottom: 30rpx;

  .header-content {
    text-align: center;
    margin-bottom: 40rpx;

    .page-title {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      color: #fff;
      margin-bottom: 10rpx;
    }

    .page-subtitle {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .progress-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20rpx;

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      opacity: 0.5;
      transition: all 0.3s;

      &.active {
        opacity: 1;
      }

      .step-number {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        font-weight: bold;
        margin-bottom: 10rpx;
        transition: all 0.3s;
      }

      &.active .step-number {
        background: #fff;
        color: #667eea;
        transform: scale(1.1);
      }

      .step-text {
        font-size: 22rpx;
        color: #fff;
      }
    }

    .progress-line {
      width: 80rpx;
      height: 4rpx;
      background: rgba(255, 255, 255, 0.3);
      margin: 0 20rpx;
      transition: all 0.3s;

      &.active {
        background: #fff;
      }
    }
  }
}

.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25rpx;
  padding: 0;
  margin: 0 20rpx 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
  border: 2rpx solid transparent;
  transition: all 0.3s;

  &.active {
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-4rpx);
    box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 30rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .card-title {
    display: flex;
    align-items: center;

    .title-icon {
      font-size: 36rpx;
      margin-right: 15rpx;
    }

    .title-text {
      font-size: 32rpx;
      font-weight: bold;
      color: #303133;
    }
  }

  .card-badge {
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;
    color: #fff;

    &.required {
      background: linear-gradient(135deg, #f56c6c 0%, #ff4757 100%);
    }

    &.optional {
      background: linear-gradient(135deg, #19be6b 0%, #52c41a 100%);
    }
  }
}

.card .form-item,
.card .image-upload,
.card .textarea,
.card .char-count {
  margin: 0 20rpx;
}

.card .form-item:first-of-type {
  margin-top: 30rpx;
}

.card .form-item:last-of-type,
.card .image-upload,
.card .char-count {
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
  padding: 0 10rpx;

  .label {
    display: block;
    font-size: 28rpx;
    color: #606266;
    margin-bottom: 15rpx;

    &.required::after {
      content: ' *';
      color: #f56c6c;
    }
  }

  .input {
    width: 100%;
    height: 88rpx;
    padding: 0 24rpx;
    border: 2rpx solid #e4e7ed;
    border-radius: 15rpx;
    font-size: 28rpx;
    background: #fff;
    transition: all 0.3s;

    &:focus {
      border-color: #667eea;
      outline: none;
      box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
    }

    &.readonly {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      color: #6c757d;
      border-color: #dee2e6;
    }

    &.select {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;

      .placeholder {
        color: #adb5bd;
      }

      .arrow {
        color: #6c757d;
        font-size: 24rpx;
        transition: transform 0.3s;
      }

      &:active .arrow {
        transform: rotate(180deg);
      }
    }
  }

  .input-group {
    display: flex;
    align-items: center;
    border: 2rpx solid #dcdfe6;
    border-radius: 10rpx;
    background: #fff;

    &:focus-within {
      border-color: #3c9cff;
    }

    .input {
      flex: 1;
      border: none;
      background: transparent;
    }

    .unit {
      padding: 0 20rpx;
      color: #909399;
      font-size: 28rpx;
    }
  }

  .input-with-ai {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .input {
      flex: 1;
    }

    .ai-btn {
      padding: 0 24rpx;
      height: 88rpx;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border: none;
      border-radius: 15rpx;
      font-size: 24rpx;
      white-space: nowrap;
      transition: all 0.3s;

      &:active {
        transform: scale(0.95);
      }

      &:disabled {
        background: #c0c4cc;
        transform: none;
      }
    }
  }
}

.image-upload {
  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 20rpx;
  }

  .image-item {
    position: relative;
    width: 150rpx;
    height: 150rpx;

    .image {
      width: 100%;
      height: 100%;
      border-radius: 10rpx;
    }

    .image-delete {
      position: absolute;
      top: -10rpx;
      right: -10rpx;
      width: 40rpx;
      height: 40rpx;
      background: #f56c6c;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      cursor: pointer;
    }
  }

  .image-add {
    width: 150rpx;
    height: 150rpx;
    border: 2rpx dashed #dcdfe6;
    border-radius: 10rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    .add-icon {
      font-size: 48rpx;
      color: #c0c4cc;
      margin-bottom: 10rpx;
    }

    .add-text {
      font-size: 24rpx;
      color: #c0c4cc;
    }
  }

  .image-tip {
    font-size: 24rpx;
    color: #909399;
  }
}

.textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  border: 2rpx solid #dcdfe6;
  border-radius: 10rpx;
  font-size: 28rpx;
  background: #fff;
  resize: none;

  &:focus {
    border-color: #3c9cff;
    outline: none;
  }
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #909399;
  margin-top: 10rpx;
}

.form-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  padding: 30rpx 40rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
  z-index: 100;
}

.save-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 25rpx;
  font-size: 32rpx;
  font-weight: bold;
  transition: all 0.3s;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);

    &::before {
      left: 100%;
    }
  }

  &.loading {
    background: linear-gradient(135deg, #adb5bd 0%, #6c757d 100%);
    box-shadow: none;
  }

  &:disabled {
    background: linear-gradient(135deg, #adb5bd 0%, #6c757d 100%);
    box-shadow: none;
  }
}

// AI识别模态框样式
.ai-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
}

.ai-modal {
  background: #fff;
  border-radius: 25rpx;
  width: 100%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.ai-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .ai-modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
  }

  .ai-modal-close {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    cursor: pointer;
    transition: all 0.3s;

    &:active {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0.9);
    }
  }
}

.ai-modal-content {
  padding: 40rpx 30rpx;
  min-height: 300rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ai-upload-area {
  text-align: center;

  .ai-upload-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
    opacity: 0.6;
  }

  .ai-upload-text {
    display: block;
    font-size: 32rpx;
    color: #303133;
    margin-bottom: 15rpx;
    font-weight: bold;
  }

  .ai-upload-tip {
    display: block;
    font-size: 24rpx;
    color: #909399;
    margin-bottom: 40rpx;
  }

  .ai-upload-btn {
    padding: 20rpx 60rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 50rpx;
    font-size: 28rpx;
    font-weight: bold;
    transition: all 0.3s;

    &:active {
      transform: scale(0.95);
    }
  }
}

.ai-recognizing {
  text-align: center;

  .ai-loading {
    margin-bottom: 30rpx;

    .ai-loading-spinner {
      width: 80rpx;
      height: 80rpx;
      border: 6rpx solid #f3f3f3;
      border-top: 6rpx solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
  }

  .ai-recognizing-text {
    display: block;
    font-size: 32rpx;
    color: #303133;
    margin-bottom: 15rpx;
    font-weight: bold;
  }

  .ai-recognizing-tip {
    display: block;
    font-size: 24rpx;
    color: #909399;
    margin-bottom: 30rpx;
  }

  .ai-progress {
    width: 100%;
    height: 8rpx;
    background: #f0f0f0;
    border-radius: 4rpx;
    overflow: hidden;

    .ai-progress-bar {
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
      border-radius: 4rpx;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ai-result {
  .ai-result-success,
  .ai-result-error {
    text-align: center;
  }

  .ai-result-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
  }

  .ai-result-success .ai-result-title {
    color: #19be6b;
  }

  .ai-result-error .ai-result-title {
    color: #f56c6c;
  }

  .ai-result-item {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 15rpx;

    .ai-result-label {
      font-size: 28rpx;
      color: #606266;
      min-width: 160rpx;
    }

    .ai-result-value {
      flex: 1;
      font-size: 28rpx;
      color: #303133;
      font-weight: bold;
    }
  }

  .ai-result-error-msg {
    display: block;
    font-size: 28rpx;
    color: #f56c6c;
    margin-bottom: 30rpx;
    padding: 20rpx;
    background: #fef0f0;
    border-radius: 15rpx;
  }

  .ai-result-actions {
    display: flex;
    gap: 20rpx;
    margin-top: 30rpx;

    .ai-result-btn {
      flex: 1;
      padding: 20rpx;
      border: none;
      border-radius: 15rpx;
      font-size: 28rpx;
      font-weight: bold;
      transition: all 0.3s;

      &:active {
        transform: scale(0.95);
      }

      &.apply {
        background: linear-gradient(135deg, #19be6b 0%, #52c41a 100%);
        color: #fff;
      }

      &.retry {
        background: linear-gradient(135deg, #ff9900 0%, #ffad33 100%);
        color: #fff;
      }

      &.cancel {
        background: #f5f7fa;
        color: #606266;
        border: 2rpx solid #dcdfe6;
      }
    }
  }
}
</style>

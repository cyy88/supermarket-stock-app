<template>
  <view class="add-goods-container">
    <!-- 基本信息卡片 -->
    <view class="card">
      <view class="card-title">📦 基本信息</view>
      
      <view class="form-item">
        <text class="label">商品条码</text>
        <input 
          v-model="form.goodsNo"
          placeholder="扫码自动填入或手动输入"
          class="input readonly"
          readonly
        />
      </view>

      <view class="form-item">
        <text class="label required">商品名称</text>
        <input 
          v-model="form.name"
          placeholder="请输入商品名称"
          class="input"
        />
      </view>

      <view class="form-item">
        <text class="label required">商品分类</text>
        <view class="input select" @click="showCategoryPicker = true">
          <text :class="{ placeholder: !form.cateName }">
            {{ form.cateName || '请选择商品分类' }}
          </text>
          <text class="arrow">▼</text>
        </view>
      </view>

      <view class="form-item">
        <text class="label required">商品价格</text>
        <view class="input-group">
          <input 
            v-model="form.price"
            type="digit"
            placeholder="请输入价格"
            class="input"
          />
          <text class="unit">元</text>
        </view>
      </view>

      <view class="form-item">
        <text class="label">库存数量</text>
        <view class="input-group">
          <input 
            v-model="form.stock"
            type="number"
            placeholder="请输入库存数量"
            class="input"
          />
          <text class="unit">件</text>
        </view>
      </view>
    </view>

    <!-- 商品图片卡片 -->
    <view class="card">
      <view class="card-title">🖼️ 商品图片</view>
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
    <view class="card">
      <view class="card-title">📝 商品描述</view>
      <textarea 
        v-model="form.description"
        placeholder="请输入商品描述（可选）"
        class="textarea"
        maxlength="500"
      />
      <view class="char-count">{{ form.description.length }}/500</view>
    </view>

    <!-- 保存按钮 -->
    <view class="form-actions">
      <button
        class="save-btn"
        :class="{ loading: saving }"
        @click="saveGoods"
        :disabled="saving"
      >
        {{ saving ? '保存中...' : '💾 保存商品' }}
      </button>
    </view>

    <!-- 分类选择器 -->
    <picker
      v-if="showCategoryPicker"
      :range="categoryList"
      range-key="name"
      @change="onCategoryChange"
      @cancel="showCategoryPicker = false"
    >
      <view></view>
    </picker>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import goodsStore from '@/stores/goods'
import { saveGoods, getGoodsCateList, uploadImage } from '@/api/goods'

// 响应式数据
const saving = ref(false)
const showCategoryPicker = ref(false)
const categoryList = ref([])
const imageList = ref([])

const form = reactive({
  goodsNo: '',
  name: '',
  cateId: '',
  cateName: '',
  price: '',
  stock: '',
  description: ''
})

// 页面加载
onLoad((options) => {
  if (options.barcode) {
    form.goodsNo = decodeURIComponent(options.barcode)
  }
  loadCategoryList()
})

// 加载商品分类
const loadCategoryList = async () => {
  try {
    const res = await getGoodsCateList()
    categoryList.value = res.data || []
    goodsStore.saveCategories(categoryList.value)
  } catch (error) {
    console.error('获取分类失败:', error)
    // 从本地获取缓存的分类
    categoryList.value = goodsStore.categories
    if (categoryList.value.length === 0) {
      uni.showToast({
        title: '获取分类失败',
        icon: 'none'
      })
    }
  }
}

// 分类选择
const onCategoryChange = (e) => {
  const selectedCategory = categoryList.value[e.detail.value]
  form.cateId = selectedCategory.id
  form.cateName = selectedCategory.name
  showCategoryPicker.value = false
}

// 选择图片
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

// 上传图片
const uploadImages = async (filePaths) => {
  uni.showLoading({
    title: '上传中...'
  })

  try {
    for (const filePath of filePaths) {
      const imageUrl = await uploadImage(filePath)
      imageList.value.push({
        url: imageUrl,
        name: `image_${Date.now()}`
      })
    }
  } catch (error) {
    uni.showToast({
      title: '图片上传失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 删除图片
const deleteImage = (index) => {
  imageList.value.splice(index, 1)
}

// 表单验证
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

// 保存商品
const saveGoods = async () => {
  try {
    // 表单验证
    if (!validateForm()) return

    saving.value = true

    const goodsData = {
      name: form.name.trim(),
      goodsNo: form.goodsNo,
      cateId: form.cateId,
      cateName: form.cateName,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
      images: imageList.value.map(item => item.url),
      description: form.description.trim(),
      status: 'A',
      type: 'goods',
      priceType: 'piece',
      sort: 0
    }

    // 先保存到本地
    const localGoods = goodsStore.saveLocalGoods(goodsData)

    // 尝试同步到服务器
    try {
      await saveGoods(goodsData)
      goodsStore.updateSyncStatus(localGoods.id, 1) // 同步成功

      uni.showToast({
        title: '商品保存成功',
        icon: 'success'
      })
    } catch (error) {
      // 网络失败时保持待同步状态
      uni.showToast({
        title: '已保存到本地，稍后同步',
        icon: 'none'
      })
    }

    // 返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)

  } catch (error) {
    console.error('保存失败:', error)
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
  padding: 20rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;

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
    height: 80rpx;
    padding: 0 20rpx;
    border: 2rpx solid #dcdfe6;
    border-radius: 10rpx;
    font-size: 28rpx;
    background: #fff;

    &:focus {
      border-color: #3c9cff;
      outline: none;
    }

    &.readonly {
      background: #f5f7fa;
      color: #909399;
    }

    &.select {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;

      .placeholder {
        color: #c0c4cc;
      }

      .arrow {
        color: #c0c4cc;
        font-size: 24rpx;
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
  position: sticky;
  bottom: 0;
  background: #f8f9fa;
  padding: 30rpx 0;
}

.save-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #19be6b 0%, #52c41a 100%);
  color: #fff;
  border: none;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
  transition: all 0.3s;

  &:active {
    transform: translateY(2rpx);
  }

  &.loading {
    background: #c0c4cc;
  }

  &:disabled {
    background: #c0c4cc;
  }
}
</style>

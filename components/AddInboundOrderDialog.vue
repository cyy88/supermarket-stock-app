<template>
  <view v-if="showDialog" class="dialog-overlay" @click="close">
    <view class="dialog-container" @click.stop>
      <!-- 美化的头部 -->
      <view class="dialog-header">
        <view class="header-content">
          <text class="dialog-title">📄 添加入库单</text>
          <text class="dialog-subtitle">上传入库单据图片</text>
        </view>
        <view class="close-btn" @click="close">
          <text class="close-icon">✕</text>
        </view>
      </view>

      <!-- 内容区域 -->
      <view class="content">
        <view class="upload-section">
          <view class="section-header">
            <text class="section-title">📷 入库单图片</text>
            <text class="image-count">{{ baseForm.images.length }}/{{ maxImages }}</text>
          </view>

          <view class="upload-area">
            <!-- 已上传的图片列表 -->
            <view v-if="baseForm.images.length > 0" class="image-grid">
              <view
                v-for="(img, index) in baseForm.images"
                :key="index"
                class="image-item"
              >
                <image
                  :src="img.url"
                  class="uploaded-image"
                  mode="aspectFill"
                  @click="previewImage(img.url)"
                />
                <view class="delete-btn" @click="removeImage(index)">
                  <text class="delete-icon">✕</text>
                </view>
                <view class="image-mask">
                  <text class="preview-text">预览</text>
                </view>
              </view>
            </view>

            <!-- 上传按钮 -->
            <view
              v-if="baseForm.images.length < maxImages"
              class="upload-btn"
              @click="chooseImage"
            >
              <view class="upload-icon-wrapper">
                <text class="upload-icon">📷</text>
              </view>
              <text class="upload-text">添加图片</text>
              <text class="upload-desc">点击上传</text>
            </view>
          </view>

          <!-- 上传提示 -->
          <view class="upload-tips">
            <view class="tip-item">
              <text class="tip-icon">📋</text>
              <text class="tip-text">最多可上传{{ maxImages }}张图片</text>
            </view>
            <view class="tip-item">
              <text class="tip-icon">🖼️</text>
              <text class="tip-text">支持JPG、PNG格式</text>
            </view>
            <view class="tip-item">
              <text class="tip-icon">📏</text>
              <text class="tip-text">单张图片不超过{{ maxSize }}MB</text>
            </view>
          </view>

          <!-- 错误信息 -->
          <view v-if="errorMessage" class="error-message">
            <text class="error-icon">⚠️</text>
            <text class="error-text">{{ errorMessage }}</text>
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="dialog-footer">
        <button class="cancel-btn" @click="close">
          <text class="btn-text">取消</text>
        </button>
        <button class="confirm-btn" @click="doSave" :disabled="baseForm.images.length === 0">
          <text class="btn-text">确定</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { UPLOAD_CONFIG, BUSINESS_CONFIG } from '@/config/index.js'
import { uploadImage, getFullImageUrl } from '@/utils/image.js'

const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false
  },
  imagePath: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['closeDialog', 'submit'])

const maxImages = BUSINESS_CONFIG.inbound.maxImages
const maxSize = UPLOAD_CONFIG.maxSize
const errorMessage = ref('')

const baseForm = reactive({
  images: []
})

watch(() => props.showDialog, (value) => {
  if (value) {
    resetForm()
  }
})

const resetForm = () => {
  baseForm.images = []
  errorMessage.value = ''
}

// 选择图片
const chooseImage = () => {
  const remainingCount = maxImages - baseForm.images.length
  
  uni.chooseImage({
    count: remainingCount,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      res.tempFilePaths.forEach(tempFilePath => {
        uploadImageFile(tempFilePath)
      })
    },
    fail: (error) => {
      uni.showToast({
        title: '选择图片失败',
        icon: 'none'
      })
    }
  })
}

// 上传图片
const uploadImageFile = async (filePath) => {
  // 检查文件大小
  return new Promise((resolve, reject) => {
    uni.getFileInfo({
      filePath: filePath,
      success: async (fileInfo) => {
        const fileSizeMB = fileInfo.size / (1024 * 1024)
        if (fileSizeMB > maxSize) {
          errorMessage.value = `图片大小不能超过${maxSize}MB`
          reject(new Error(`图片大小不能超过${maxSize}MB`))
          return
        }

        // 开始上传
        uni.showLoading({
          title: '上传中...'
        })

        try {
          const imageUrl = await uploadImage(filePath)
          const fileData = {
            url: imageUrl,
            fileName: `image_${Date.now()}.jpg`
          }
          baseForm.images.push(fileData)
          errorMessage.value = ''
          uni.showToast({
            title: '上传成功',
            icon: 'success'
          })
          resolve(fileData)
        } catch (error) {
          console.error('上传失败:', error)
          errorMessage.value = error.message || '上传失败'
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
          reject(error)
        } finally {
          uni.hideLoading()
        }
      },
      fail: (error) => {
        errorMessage.value = '获取文件信息失败'
        reject(error)
      }
    })
  })
}

// 移除图片
const removeImage = (index) => {
  baseForm.images.splice(index, 1)
}

// 预览图片
const previewImage = (imageUrl) => {
  const urls = baseForm.images.map(img => img.url)
  uni.previewImage({
    urls: urls,
    current: imageUrl
  })
}

// 关闭对话框
const close = () => {
  emit('closeDialog')
}

// 保存
const doSave = () => {
  if (baseForm.images.length === 0) {
    uni.showToast({
      title: '请上传入库单图片',
      icon: 'none'
    })
    return
  }
  const imageData = JSON.parse(JSON.stringify(baseForm.images))
  emit('submit', imageData)
  emit('closeDialog')
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4rpx);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.dialog-container {
  width: 100%;
  max-width: 600rpx;
  max-height: 85vh;
  background: #fff;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.header-content {
  flex: 1;
}

.dialog-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.dialog-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.close-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.9);
}

.close-icon {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 40rpx;
  background: #f8f9fa;
}

.upload-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
}

.image-count {
  font-size: 24rpx;
  color: #909399;
  background: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.upload-area {
  margin-bottom: 32rpx;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.image-item {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  border: 2rpx solid #e4e7ed;
}

.delete-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: #f56c6c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(245, 108, 108, 0.3);
  z-index: 10;
}

.delete-icon {
  font-size: 24rpx;
  color: #fff;
  font-weight: bold;
}

.image-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  padding: 8rpx;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:active .image-mask {
  opacity: 1;
}

.preview-text {
  font-size: 20rpx;
  color: #fff;
}

.upload-btn {
  width: 120rpx;
  height: 120rpx;
  border: 2rpx dashed #dcdfe6;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  transition: all 0.3s;
}

.upload-btn:active {
  border-color: #409eff;
  background: #f0f8ff;
  transform: scale(0.95);
}

.upload-icon-wrapper {
  margin-bottom: 8rpx;
}

.upload-icon {
  font-size: 32rpx;
  color: #c0c4cc;
}

.upload-text {
  font-size: 24rpx;
  color: #606266;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.upload-desc {
  font-size: 20rpx;
  color: #909399;
}

.upload-tips {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-icon {
  font-size: 24rpx;
  margin-right: 12rpx;
  width: 32rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #606266;
  line-height: 1.4;
}

.error-message {
  background: #fef0f0;
  border: 2rpx solid #fbc4c4;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
}

.error-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.error-text {
  font-size: 26rpx;
  color: #f56c6c;
  flex: 1;
}

.dialog-footer {
  display: flex;
  gap: 24rpx;
  padding: 32rpx 40rpx;
  background: #fff;
  border-top: 2rpx solid #f0f0f0;
}

.cancel-btn {
  flex: 1;
  height: 88rpx;
  background: #f5f7fa;
  border: 2rpx solid #dcdfe6;
  border-radius: 20rpx;
  font-size: 28rpx;
  color: #606266;
  transition: all 0.3s;
}

.cancel-btn:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.confirm-btn {
  flex: 1;
  height: 88rpx;
  background: linear-gradient(135deg, #409eff 0%, #1890ff 100%);
  border: none;
  border-radius: 20rpx;
  font-size: 28rpx;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 8rpx 24rpx rgba(64, 158, 255, 0.3);
  transition: all 0.3s;
}

.confirm-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(64, 158, 255, 0.4);
}

.confirm-btn:disabled {
  background: #c0c4cc;
  box-shadow: none;
  color: #fff;
}

.btn-text {
  font-size: 28rpx;
  font-weight: bold;
}
</style>

<template>
  <view v-if="showDialog" class="dialog-overlay" @click="close">
    <view class="dialog-container" @click.stop>
      <view class="dialog-header">
        <text class="dialog-title">添加入库单</text>
        <text class="close-btn" @click="close">×</text>
      </view>
      
      <view class="content">
        <view class="upload-section">
          <text class="section-title">入库单图片</text>
          <view class="upload-area">
            <view v-if="baseForm.images.length > 0" class="image-list">
              <view 
                v-for="(img, index) in baseForm.images" 
                :key="index" 
                class="image-item"
              >
                <image 
                  :src="img.domain + img.filePath" 
                  class="uploaded-image"
                  mode="aspectFill"
                  @click="previewImage(img.domain + img.filePath)"
                />
                <view class="delete-btn" @click="removeImage(index)">×</view>
              </view>
            </view>
            
            <view 
              v-if="baseForm.images.length < maxImages" 
              class="upload-btn" 
              @click="chooseImage"
            >
              <text class="upload-icon">+</text>
              <text class="upload-text">添加图片</text>
            </view>
          </view>
          
          <view class="upload-tips">
            <text class="tip-text">• 最多可上传{{ maxImages }}张图片</text>
            <text class="tip-text">• 支持JPG、PNG格式</text>
            <text class="tip-text">• 单张图片不超过{{ maxSize }}MB</text>
          </view>
          
          <view v-if="errorMessage" class="error-message">
            <text class="error-text">{{ errorMessage }}</text>
          </view>
        </view>
      </view>

      <view class="dialog-footer">
        <button class="cancel-btn" @click="close">取消</button>
        <button class="confirm-btn" @click="doSave">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

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

const maxImages = 10
const maxSize = 3 // MB
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
        uploadImage(tempFilePath)
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
const uploadImage = (filePath) => {
  // 检查文件大小
  uni.getFileInfo({
    filePath: filePath,
    success: (fileInfo) => {
      const fileSizeMB = fileInfo.size / (1024 * 1024)
      if (fileSizeMB > maxSize) {
        errorMessage.value = `图片大小不能超过${maxSize}MB`
        return
      }
      
      // 开始上传
      uni.showLoading({
        title: '上传中...'
      })
      
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
              const fileData = {
                fileName: response.data.fileName,
                filePath: response.data.filePath || response.data.fileName,
                domain: response.data.domain || 'http://msbs-fuint-ts.qingchunnianhua.com:1880/'
              }
              baseForm.images.push(fileData)
              errorMessage.value = ''
              console.log('上传成功，图片数据:', fileData)
              uni.showToast({
                title: '上传成功',
                icon: 'success'
              })
            } else {
              errorMessage.value = response.message || '上传失败'
              uni.showToast({
                title: '上传失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('解析上传响应失败:', error)
            errorMessage.value = '上传失败'
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            })
          }
        },
        fail: (error) => {
          console.error('上传失败:', error)
          errorMessage.value = '上传失败'
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
        },
        complete: () => {
          uni.hideLoading()
        }
      })
    },
    fail: (error) => {
      console.error('获取文件信息失败:', error)
      errorMessage.value = '获取文件信息失败'
    }
  })
}

// 移除图片
const removeImage = (index) => {
  baseForm.images.splice(index, 1)
}

// 预览图片
const previewImage = (imageUrl) => {
  const urls = baseForm.images.map(img => img.domain + img.filePath)
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
  emit('submit', baseForm.images)
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
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-container {
  width: 90%;
  max-width: 500px;
  max-height: 80%;
  background-color: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
}

.close-btn {
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.upload-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  display: block;
}

.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-item {
  position: relative;
  width: 80px;
  height: 80px;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
}

.upload-btn {
  width: 80px;
  height: 80px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-btn:hover {
  border-color: #007aff;
}

.upload-icon {
  font-size: 24px;
  color: #999;
  margin-bottom: 4px;
}

.upload-text {
  font-size: 12px;
  color: #999;
}

.upload-tips {
  margin-top: 12px;
}

.tip-text {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.error-message {
  margin-top: 12px;
  padding: 8px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
}

.error-text {
  font-size: 14px;
  color: #ff4d4f;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 8px 24px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.confirm-btn {
  padding: 8px 24px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>

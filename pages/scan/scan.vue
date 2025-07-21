<template>
  <view class="scan-container">
    <!-- 扫码头部 -->
    <view class="scan-header">
      <text class="scan-title">📱 扫描商品条码</text>
      <text class="scan-tip">将条码对准扫描框，支持一维条形码和二维码</text>
      <view class="scan-features">
        <view class="feature-item">
          <text class="feature-icon">📏</text>
          <text class="feature-text">横向条形码优化</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🎯</text>
          <text class="feature-text">快速识别</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">💡</text>
          <text class="feature-text">自动对焦</text>
        </view>
      </view>
    </view>

    <!-- 扫码按钮 -->
    <view class="scan-actions">
      <button class="scan-btn primary" @click="startScan">
        📷 开始扫码
      </button>
      <button class="scan-btn secondary" @click="showManualInput">
        ⌨️ 手动输入
      </button>
    </view>

    <!-- 最近扫描记录 -->
    <view v-if="recentScans.length > 0" class="recent-scans">
      <view class="section-title">📋 最近扫描</view>
      <view class="scan-list">
        <view 
          v-for="item in recentScans" 
          :key="item.barcode"
          class="scan-item"
          @click="goToAddGoods(item.barcode)"
        >
          <view class="barcode-info">
            <text class="barcode">{{ item.barcode }}</text>
            <text class="scan-time">{{ formatTime(item.time) }}</text>
          </view>
          <text class="arrow">→</text>
        </view>
      </view>
    </view>

    <!-- 手动输入弹窗 -->
    <view v-if="showModal" class="modal-overlay" @click="closeManualInput">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">手动输入条码</text>
          <text class="modal-close" @click="closeManualInput">✕</text>
        </view>
        
        <view class="modal-body">
          <input 
            v-model="modalForm.barcode"
            placeholder="请输入商品条码"
            class="modal-input"
            type="text"
            focus
          />
        </view>
        
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="closeManualInput">
            取消
          </button>
          <button class="modal-btn confirm" @click="confirmManualInput">
            确定
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { formatRelativeTime } from '@/utils/time'

const recentScans = ref([])
const showModal = ref(false)

const modalForm = reactive({
  barcode: ''
})

// 页面加载
onMounted(() => {
  loadRecentScans()
})

// 开始扫码
const startScan = () => {
  uni.scanCode({
    // 只扫描条形码和二维码
    scanType: ['barCode', 'qrCode'],
    // 是否只能从相机扫码，不允许从相册选择图片
    onlyFromCamera: true,
    // 扫码提示文字
    prompt: '将条码对准扫描框',
    // 是否显示相册按钮
    albumButton: false,
    success: (res) => {
      console.log('扫码成功:', res)
      handleScanResult(res.result)
    },
    fail: (err) => {
      console.error('扫码失败:', err)
      uni.showToast({
        title: '扫码失败，请重试',
        icon: 'none'
      })
    }
  })
}

const handleScanResult = (barcode) => {
  saveRecentScan(barcode)
  goToAddGoods(barcode)
}

// 保存扫码记录
const saveRecentScan = (barcode) => {
  const scanRecord = {
    barcode,
    time: Date.now()
  }
  let scans = uni.getStorageSync('recentScans') || []
  scans = scans.filter(item => item.barcode !== barcode)
  scans.unshift(scanRecord)
  if (scans.length > 10) {
    scans = scans.slice(0, 10)
  }

  uni.setStorageSync('recentScans', scans)
  recentScans.value = scans
}

const loadRecentScans = () => {
  recentScans.value = uni.getStorageSync('recentScans') || []
}

const showManualInput = () => {
  modalForm.barcode = ''
  showModal.value = true
}

const closeManualInput = () => {
  showModal.value = false
  modalForm.barcode = ''
}

const confirmManualInput = () => {
  if (!modalForm.barcode.trim()) {
    uni.showToast({
      title: '请输入条码',
      icon: 'none'
    })
    return
  }

  handleScanResult(modalForm.barcode.trim())
  closeManualInput()
}

const goToAddGoods = (barcode) => {
  uni.navigateTo({
    url: `/pages/goods/add?barcode=${encodeURIComponent(barcode)}`
  })
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return Math.floor(diff / 60000) + '分钟前'
  } else if (diff < 86400000) { // 1天内
    return Math.floor(diff / 3600000) + '小时前'
  } else {
    return date.toLocaleDateString()
  }
}
</script>

<style lang="scss" scoped>
.scan-container {
  padding: 40rpx;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.scan-header {
  text-align: center;
  padding: 60rpx 20rpx;

  .scan-title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #303133;
    margin-bottom: 20rpx;
  }

  .scan-tip {
    font-size: 28rpx;
    color: #909399;
    margin-bottom: 40rpx;
  }

  .scan-features {
    display: flex;
    justify-content: center;
    gap: 40rpx;
    flex-wrap: wrap;

    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10rpx;

      .feature-icon {
        font-size: 32rpx;
        margin-bottom: 5rpx;
      }

      .feature-text {
        font-size: 24rpx;
        color: #67c23a;
        font-weight: 500;
      }
    }
  }
}

.scan-actions {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  margin-bottom: 60rpx;
}

.scan-btn {
  height: 100rpx;
  border-radius: 20rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  transition: all 0.3s;
}

.scan-btn:active {
  transform: translateY(2rpx);
}

.scan-btn.primary {
  background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(60, 156, 255, 0.3);
}

.scan-btn.secondary {
  background: #fff;
  color: #606266;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.recent-scans {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
  margin-bottom: 30rpx;
}

.scan-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.scan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
  transition: all 0.3s;
}

.scan-item:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.barcode-info {
  flex: 1;

  .barcode {
    display: block;
    font-size: 30rpx;
    color: #303133;
    font-weight: bold;
    margin-bottom: 8rpx;
  }

  .scan-time {
    font-size: 24rpx;
    color: #909399;
  }
}

.arrow {
  font-size: 32rpx;
  color: #c0c4cc;
}

/* 弹窗样式 */
.modal-overlay {
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
}

.modal-content {
  background: #fff;
  border-radius: 20rpx;
  width: 600rpx;
  max-width: 90vw;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #ebeef5;

  .modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #303133;
  }

  .modal-close {
    font-size: 36rpx;
    color: #909399;
    cursor: pointer;
  }
}

.modal-body {
  padding: 40rpx 30rpx;

  .modal-input {
    width: 100%;
    height: 80rpx;
    padding: 0 20rpx;
    border: 2rpx solid #dcdfe6;
    border-radius: 10rpx;
    font-size: 28rpx;
    background: #fff;
  }

  .modal-input:focus {
    border-color: #3c9cff;
    outline: none;
  }
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #ebeef5;

  .modal-btn {
    flex: 1;
    height: 90rpx;
    border: none;
    font-size: 28rpx;
    cursor: pointer;
  }

  .modal-btn.cancel {
    background: #f5f7fa;
    color: #606266;
  }

  .modal-btn.confirm {
    background: #3c9cff;
    color: #fff;
  }
}
</style>

<template>
  <view v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
    <view class="dialog-container" @click.stop>
      <view class="dialog-decoration"></view>
      
      <view class="dialog-icon" :class="iconClass">
        <text class="icon-text">{{ iconText }}</text>
      </view>
      
      <view class="dialog-title">{{ title }}</view>
      
      <view class="dialog-content">{{ content }}</view>
      
      <view class="dialog-buttons">
        <button class="dialog-btn cancel-btn" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button class="dialog-btn confirm-btn" @click="handleConfirm">
          {{ confirmText }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认操作'
  },
  content: {
    type: String,
    default: '确定要执行此操作吗？'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  type: {
    type: String,
    default: 'warning', // warning, danger, info
    validator: (value) => ['warning', 'danger', 'info'].includes(value)
  },
  maskClosable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:visible'])

const iconClass = computed(() => {
  return `icon-${props.type}`
})

const iconText = computed(() => {
  const icons = {
    warning: '⚠️',
    danger: '🗑️',
    info: 'ℹ️'
  }
  return icons[props.type] || '⚠️'
})

const handleConfirm = () => {
  emit('confirm')
  emit('update:visible', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleOverlayClick = () => {
  if (props.maskClosable) {
    handleCancel()
  }
}
</script>

<style lang="scss" scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8rpx);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

.dialog-container {
  position: relative;
  width: 600rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx;
  padding: 60rpx 40rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  animation: slideInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}

.dialog-decoration {
  position: absolute;
  top: -50rpx;
  right: -50rpx;
  width: 150rpx;
  height: 150rpx;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100rpx;
  height: 100rpx;
  margin: 0 auto 30rpx;
  border-radius: 50%;
  
  &.icon-warning {
    background: linear-gradient(135deg, #fff7e6 0%, #ffeaa7 100%);
    border: 2rpx solid #fdcb6e;
  }
  
  &.icon-danger {
    background: linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%);
    border: 2rpx solid #ff7875;
  }
  
  &.icon-info {
    background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
    border: 2rpx solid #69c0ff;
  }
}

.icon-text {
  font-size: 40rpx;
}

.dialog-title {
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20rpx;
}

.dialog-content {
  text-align: center;
  font-size: 28rpx;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 50rpx;
}

.dialog-buttons {
  display: flex;
  gap: 20rpx;
}

.dialog-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.8);
  color: #606266;
  border: 2rpx solid #e4e7ed;
  
  &:active {
    background: rgba(240, 240, 240, 0.9);
  }
}

.confirm-btn {
  background: linear-gradient(135deg, #f56c6c 0%, #ff4757 100%);
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(245, 108, 108, 0.3);
  
  &:active {
    box-shadow: 0 4rpx 12rpx rgba(245, 108, 108, 0.4);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(100rpx) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20rpx) rotate(180deg);
  }
}
</style>

<template>
  <view class="login-container">
    <view class="login-header">
<!--      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>-->
      <text class="title">商品扫码系统</text>
      <text class="subtitle">内部员工专用</text>
    </view>

    <view class="login-form">
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">👤</text>
          <input 
            v-model="form.username"
            placeholder="请输入用户名"
            class="input-field"
            type="text"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">🔒</text>
          <input 
            v-model="form.password"
            placeholder="请输入密码"
            class="input-field"
            type="password"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="captcha-row">
          <view class="input-wrapper captcha-input">
            <text class="input-icon">✓</text>
            <input 
              v-model="form.captchaCode"
              placeholder="请输入验证码"
              class="input-field"
              type="text"
            />
          </view>
          <view class="captcha-image" @click="refreshCaptcha">
            <image
              v-if="captchaUrl"
              :src="captchaUrl"
              mode="aspectFit"
              class="captcha-img"
            />
            <view v-else class="captcha-loading">
              <text>加载中...</text>
            </view>
          </view>
        </view>
      </view>

      <view class="form-item">
        <label class="checkbox-wrapper">
          <checkbox 
            :checked="form.rememberMe"
            @change="onRememberChange"
            color="#3c9cff"
          />
          <text class="checkbox-label">记住密码</text>
        </label>
      </view>

      <button
        class="login-btn"
        :class="{ 'loading': loading }"
        @click="handleLogin"
        :disabled="loading"
      >
        {{ loading ? '登录中...' : '立即登录' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import userStore from '@/stores/user'
import { getCaptcha } from '@/api/auth'

// 响应式数据
const loading = ref(false)
const captchaUrl = ref('')

const form = reactive({
  username: '',
  password: '',
  captchaCode: '',
  uuid: '',
  rememberMe: false
})

// 页面加载
onMounted(() => {
  loadCaptcha()
  loadRememberedCredentials()
})

// 加载验证码
const loadCaptcha = async () => {
  try {
    const res = await getCaptcha()
    captchaUrl.value = res.data.captcha
    form.uuid = res.data.uuid
  } catch (error) {
    console.error('获取验证码失败:', error)
    uni.showToast({
      title: '获取验证码失败',
      icon: 'none'
    })
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  form.captchaCode = ''
  loadCaptcha()
}

// 加载记住的登录信息
const loadRememberedCredentials = () => {
  const remembered = uni.getStorageSync('rememberedLogin')
  if (remembered) {
    form.username = remembered.username || ''
    form.password = remembered.password || ''
    form.rememberMe = true
  }
}

// 记住密码选择变化
const onRememberChange = (e) => {
  form.rememberMe = e.detail.value.length > 0
}

// 保存登录信息
const saveCredentials = () => {
  if (form.rememberMe) {
    uni.setStorageSync('rememberedLogin', {
      username: form.username,
      password: form.password
    })
  } else {
    uni.removeStorageSync('rememberedLogin')
  }
}

// 表单验证
const validateForm = () => {
  if (!form.username.trim()) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    })
    return false
  }
  
  if (!form.password.trim()) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return false
  }
  
  if (!form.captchaCode.trim()) {
    uni.showToast({
      title: '请输入验证码',
      icon: 'none'
    })
    return false
  }
  
  return true
}

const handleLogin = async () => {
  try {
    if (!validateForm()) return

    loading.value = true

    await userStore.login({
      username: form.username,
      password: form.password,
      captchaCode: form.captchaCode,
      uuid: form.uuid
    })

    saveCredentials()

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    }, 1500)

  } catch (error) {

    refreshCaptcha()

    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 60rpx;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;

  .logo {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 30rpx;
  }

  .title {
    display: block;
    font-size: 48rpx;
    color: #fff;
    font-weight: bold;
    margin-bottom: 10rpx;
  }

  .subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx;
  padding: 60rpx 40rpx;
  backdrop-filter: blur(10rpx);
}

.form-item {
  margin-bottom: 40rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 15rpx;
  padding: 0 20rpx;
  height: 90rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;

  &:focus-within {
    border-color: #3c9cff;
    background: #fff;
  }

  .input-icon {
    font-size: 32rpx;
    margin-right: 20rpx;
    color: #909399;
  }

  .input-field {
    flex: 1;
    height: 100%;
    font-size: 28rpx;
    color: #303133;
  }
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 20rpx;

  .captcha-input {
    flex: 1;
  }
}

.captcha-image {
  width: 200rpx;
  height: 90rpx;
  border: 2rpx solid #e4e7ed;
  border-radius: 15rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  cursor: pointer;

  .captcha-img {
    width: 100%;
    height: 100%;
  }

  .captcha-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 24rpx;
    color: #909399;
  }
}

.checkbox-wrapper {
  display: flex;
  align-items: center;

  .checkbox-label {
    margin-left: 16rpx;
    font-size: 28rpx;
    color: #606266;
  }
}

.login-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #3c9cff 0%, #1890ff 100%);
  color: #fff;
  border: none;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 40rpx;
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

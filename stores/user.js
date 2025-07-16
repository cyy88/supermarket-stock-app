// 用户状态管理 (简化版)
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi } from '@/api/auth'

class UserStore {
  constructor() {
    this.token = ''
    this.userInfo = null
    this.init()
  }

  // 初始化
  init() {
    this.token = uni.getStorageSync('token') || ''
    this.userInfo = uni.getStorageSync('userInfo') || null
  }

  // 检查是否已登录
  get isLoggedIn() {
    return !!this.token
  }

  // 登录
  async login(loginData) {
    try {
      const res = await loginApi(loginData)

      this.token = res.data.token
      this.userInfo = res.data.userInfo

      // 保存到本地存储
      uni.setStorageSync('token', this.token)
      uni.setStorageSync('userInfo', this.userInfo)

      return res
    } catch (error) {
      throw error
    }
  }

  // 获取用户信息
  async getUserInfo() {
    try {
      const res = await getUserInfoApi()
      // 从返回的数据中提取accountInfo
      this.userInfo = res.data.accountInfo
      uni.setStorageSync('userInfo', this.userInfo)
      return res
    } catch (error) {
      throw error
    }
  }

  // 退出登录
  async logout() {
    try {
      await logoutApi()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      // 清除本地数据
      this.token = ''
      this.userInfo = null
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
    }
  }
}

// 创建单例
const userStore = new UserStore()
export default userStore

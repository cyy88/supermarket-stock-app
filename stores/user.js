import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi } from '@/api/auth'

class UserStore {
  constructor() {
    this.token = ''
    this.userInfo = null
    this.init()
  }

  init() {
    this.token = uni.getStorageSync('token') || ''
    this.userInfo = uni.getStorageSync('userInfo') || null
  }

  get isLoggedIn() {
    return !!this.token
  }

  async login(loginData) {
    try {
      const res = await loginApi(loginData)
      this.token = res.data.token
      this.userInfo = res.data.userInfo
      uni.setStorageSync('token', this.token)
      uni.setStorageSync('userInfo', this.userInfo)

      return res
    } catch (error) {
      throw error
    }
  }

  async getUserInfo() {
    try {
      const res = await getUserInfoApi()
      this.userInfo = res.data.accountInfo
      uni.setStorageSync('userInfo', this.userInfo)
      return res
    } catch (error) {
      throw error
    }
  }

  async logout() {
    try {
      await logoutApi()
    } catch (error) {
    } finally {
      this.token = ''
      this.userInfo = null
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
    }
  }
}

const userStore = new UserStore()
export default userStore

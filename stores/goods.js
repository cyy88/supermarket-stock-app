// 商品状态管理
import { getGoodsStatistics } from '@/api/goods'

class GoodsStore {
  constructor() {
    this.categories = []
    this.totalGoodsCount = 0
    this.todayAddedCount = 0
    this.init()
  }

  // 初始化
  init() {
    this.categories = uni.getStorageSync('categories') || []
  }

  // 获取今日添加数量（从服务器获取）
  get todayCount() {
    return this.todayAddedCount
  }

  // 获取总商品数（从服务器获取）
  get totalCount() {
    return this.totalGoodsCount
  }

  // 保存分类数据
  saveCategories(categories) {
    this.categories = categories
    uni.setStorageSync('categories', this.categories)
  }

  // 获取统计数据（从服务器获取）
  async fetchStatistics() {
    try {
      const response = await getGoodsStatistics()
      if (response.code === 200 && response.data) {
        this.totalGoodsCount = response.data.totalCount || 0
        this.todayAddedCount = response.data.todayCount || 0

        return {
          totalCount: this.totalGoodsCount,
          todayCount: this.todayAddedCount
        }
      } else {
        throw new Error(response.message || '获取统计数据失败')
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      // 如果API失败，返回默认值
      this.totalGoodsCount = 0
      this.todayAddedCount = 0

      return {
        totalCount: 0,
        todayCount: 0
      }
    }
  }
}

// 创建单例
const goodsStore = new GoodsStore()
export default goodsStore

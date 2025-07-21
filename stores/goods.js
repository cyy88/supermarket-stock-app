// 商品状态管理
import { saveGoods as saveGoodsApi, getGoodsList as getGoodsListApi } from '@/api/goods'

class GoodsStore {
  constructor() {
    this.localGoods = []
    this.categories = []
    this.totalGoodsCount = 0
    this.todayAddedCount = 0
    this.init()
  }

  // 初始化
  init() {
    this.localGoods = uni.getStorageSync('localGoods') || []
    this.categories = uni.getStorageSync('categories') || []
  }

  // 计算今日添加数量（本地）
  get todayCount() {
    return this.todayAddedCount
  }

  // 获取总商品数
  get totalCount() {
    return this.totalGoodsCount
  }

  // 计算待同步数量
  get unsyncedCount() {
    return this.localGoods.filter(item => item.syncStatus === 0).length
  }

  // 保存商品到本地
  saveLocalGoods(goods) {
    const newGoods = {
      ...goods,
      id: Date.now().toString(),
      createTime: Date.now(),
      updateTime: Date.now(),
      syncStatus: 0 // 待同步
    }

    this.localGoods.push(newGoods)
    uni.setStorageSync('localGoods', this.localGoods)
    return newGoods
  }

  // 更新商品同步状态
  updateSyncStatus(goodsId, status) {
    const index = this.localGoods.findIndex(item => item.id === goodsId)
    if (index !== -1) {
      this.localGoods[index].syncStatus = status
      this.localGoods[index].updateTime = Date.now()
      uni.setStorageSync('localGoods', this.localGoods)
    }
  }

  // 获取待同步商品
  getUnsyncedGoods() {
    return this.localGoods.filter(item => item.syncStatus === 0)
  }

  // 删除本地商品
  deleteLocalGoods(goodsId) {
    const index = this.localGoods.findIndex(item => item.id === goodsId)
    if (index !== -1) {
      this.localGoods.splice(index, 1)
      uni.setStorageSync('localGoods', this.localGoods)
    }
  }

  // 更新商品信息
  updateLocalGoods(goodsId, updateData) {
    const index = this.localGoods.findIndex(item => item.id === goodsId)
    if (index !== -1) {
      this.localGoods[index] = {
        ...this.localGoods[index],
        ...updateData,
        updateTime: Date.now()
      }
      uni.setStorageSync('localGoods', this.localGoods)
    }
  }

  // 保存分类数据
  saveCategories(categories) {
    this.categories = categories
    uni.setStorageSync('categories', this.categories)
  }

  // 根据条码查找商品
  findGoodsByBarcode(barcode) {
    return this.localGoods.find(item => item.goodsNo === barcode)
  }

  // 获取统计数据
  async fetchStatistics() {
    try {
      // 获取总商品数
      const response = await getGoodsListApi({ page: 1, limit: 1 })
      if (response.code === 200 && response.data) {
        this.totalGoodsCount = response.data.total || 0
      }

      // 计算今日添加数量（从本地数据计算）
      const today = new Date().toDateString()
      this.todayAddedCount = this.localGoods.filter(item =>
        new Date(item.createTime || 0).toDateString() === today
      ).length

      return {
        totalCount: this.totalGoodsCount,
        todayCount: this.todayAddedCount,
        unsyncedCount: this.unsyncedCount
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      // 如果API失败，使用本地数据
      const today = new Date().toDateString()
      this.todayAddedCount = this.localGoods.filter(item =>
        new Date(item.createTime || 0).toDateString() === today
      ).length
      this.totalGoodsCount = this.localGoods.length

      return {
        totalCount: this.totalGoodsCount,
        todayCount: this.todayAddedCount,
        unsyncedCount: this.unsyncedCount
      }
    }
  }
}

// 创建单例
const goodsStore = new GoodsStore()
export default goodsStore

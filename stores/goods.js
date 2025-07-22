// 商品状态管理

class GoodsStore {
  constructor() {
    this.categories = []
    this.totalGoodsCount = 0
    this.todayAddedCount = 0
    this._localGoods = []
    this.init()
  }

  // 初始化
  init() {
    this.categories = uni.getStorageSync('categories') || []
    this._localGoods = []
    this.clearAllLocalData()
  }

  // 清除所有本地数据
  clearAllLocalData() {
    try {
      // 清除本地商品数据
      uni.removeStorageSync('localGoods')
      uni.removeStorageSync('goodsSync')
      uni.removeStorageSync('pendingSync')
      uni.removeStorageSync('syncQueue')
      this._localGoods = []
    } catch (error) {
      console.error('清除本地数据失败:', error)
    }
  }

  // 获取本地商品列表
  get localGoods() {
    return []
  }

  // 获取未同步商品数量
  get unsyncedCount() {
    return 0
  }

  // 获取未同步商品列表
  getUnsyncedGoods() {
    return []
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

  // 保存本地商品
  saveLocalGoods(goodsData) {
    return {
      id: Date.now(),
      ...goodsData,
      syncStatus: 0,
      createTime: Date.now()
    }
  }

  updateSyncStatus(goodsId, status) {
    console.log('updateSyncStatus 已禁用，商品ID:', goodsId, '状态:', status)
  }

  // 获取统计数据（暂时返回默认值，避免调用不存在的接口）
  async fetchStatistics() {
    console.trace('fetchStatistics 调用堆栈')
    // 暂时不调用服务器接口，直接返回默认值
    this.totalGoodsCount = 0
    this.todayAddedCount = 0

    const result = {
      totalCount: 0,
      todayCount: 0
    }
    return result
  }
}

// 创建单例
const goodsStore = new GoodsStore()
export default goodsStore

// 商品状态管理
import { saveGoods as saveGoodsApi, getGoodsList as getGoodsListApi } from '@/api/goods'

class GoodsStore {
  constructor() {
    this.localGoods = []
    this.categories = []
    this.init()
  }

  // 初始化
  init() {
    this.localGoods = uni.getStorageSync('localGoods') || []
    this.categories = uni.getStorageSync('categories') || []
  }

  // 计算今日添加数量
  get todayCount() {
    const today = new Date().toDateString()
    return this.localGoods.filter(item =>
      new Date(item.createTime || 0).toDateString() === today
    ).length
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
}

// 创建单例
const goodsStore = new GoodsStore()
export default goodsStore

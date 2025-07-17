import { saveGoods as saveGoodsApi, getGoodsList as getGoodsListApi } from '@/api/goods'

class GoodsStore {
  constructor() {
    this.localGoods = []
    this.categories = []
    this.init()
  }

  init() {
    this.localGoods = uni.getStorageSync('localGoods') || []
    this.categories = uni.getStorageSync('categories') || []
  }

  get todayCount() {
    const today = new Date().toDateString()
    return this.localGoods.filter(item =>
      new Date(item.createTime || 0).toDateString() === today
    ).length
  }

  get unsyncedCount() {
    return this.localGoods.filter(item => item.syncStatus === 0).length
  }

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

  updateSyncStatus(goodsId, status) {
    const index = this.localGoods.findIndex(item => item.id === goodsId)
    if (index !== -1) {
      this.localGoods[index].syncStatus = status
      this.localGoods[index].updateTime = Date.now()
      uni.setStorageSync('localGoods', this.localGoods)
    }
  }

  getUnsyncedGoods() {
    return this.localGoods.filter(item => item.syncStatus === 0)
  }

  deleteLocalGoods(goodsId) {
    const index = this.localGoods.findIndex(item => item.id === goodsId)
    if (index !== -1) {
      this.localGoods.splice(index, 1)
      uni.setStorageSync('localGoods', this.localGoods)
    }
  }

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

  saveCategories(categories) {
    this.categories = categories
    uni.setStorageSync('categories', this.categories)
  }

  findGoodsByBarcode(barcode) {
    return this.localGoods.find(item => item.goodsNo === barcode)
  }
}

const goodsStore = new GoodsStore()
export default goodsStore

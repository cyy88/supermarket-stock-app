import { saveGoods } from '@/api/goods'
import goodsStore from '@/stores/goods'

class SyncManager {
  constructor() {
    this.isSyncing = false
  }

  async autoSync() {
    if (this.isSyncing) return

    const networkType = await this.getNetworkType()
    if (networkType === 'none') {
      return
    }

    await this.syncPendingGoods()
  }

  async syncPendingGoods() {
    this.isSyncing = true

    try {
      const unsyncedGoods = goodsStore.getUnsyncedGoods()

      if (unsyncedGoods.length === 0) {
        return { success: 0, failed: 0 }
      }

      let successCount = 0
      let failedCount = 0

      for (const goods of unsyncedGoods) {
        try {
          const { id, createTime, updateTime, syncStatus, ...goodsData } = goods
          await saveGoods(goodsData)

          goodsStore.updateSyncStatus(goods.id, 1) // 同步成功
          successCount++
        } catch (error) {
          goodsStore.updateSyncStatus(goods.id, 2) // 同步失败
          failedCount++
        }
      }

      if (successCount > 0) {
        uni.showToast({
          title: `成功同步${successCount}个商品`,
          icon: 'success'
        })
      }

      return { success: successCount, failed: failedCount }

    } catch (error) {
      console.error('同步过程出错:', error)
      return { success: 0, failed: 0 }
    } finally {
      this.isSyncing = false
    }
  }

  getNetworkType() {
    return new Promise((resolve) => {
      uni.getNetworkType({
        success: (res) => {
          resolve(res.networkType)
        },
        fail: () => {
          resolve('none')
        }
      })
    })
  }

  async manualSync() {
    uni.showLoading({
      title: '同步中...'
    })

    try {
      const result = await this.syncPendingGoods()

      if (result.success === 0 && result.failed === 0) {
        uni.showToast({
          title: '没有待同步数据',
          icon: 'none'
        })
      } else if (result.failed > 0) {
        uni.showToast({
          title: `同步完成，${result.failed}个失败`,
          icon: 'none'
        })
      }
    } catch (error) {
      uni.showToast({
        title: '同步失败',
        icon: 'none'
      })
    } finally {
      uni.hideLoading()
    }
  }

  needSync() {
    return goodsStore.getUnsyncedGoods().length > 0
  }

  getSyncStatus() {
    const unsyncedGoods = goodsStore.getUnsyncedGoods()
    const totalGoods = goodsStore.localGoods.length
    
    return {
      total: totalGoods,
      unsynced: unsyncedGoods.length,
      synced: totalGoods - unsyncedGoods.length,
      needSync: unsyncedGoods.length > 0
    }
  }
}

const syncManager = new SyncManager()
export default syncManager

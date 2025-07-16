// 数据同步管理器
import { saveGoods } from '@/api/goods'
import goodsStore from '@/stores/goods'

class SyncManager {
  constructor() {
    this.isSyncing = false
  }

  // 自动同步
  async autoSync() {
    if (this.isSyncing) return

    // 检查网络状态
    const networkType = await this.getNetworkType()
    if (networkType === 'none') {
      console.log('无网络连接，跳过同步')
      return
    }

    await this.syncPendingGoods()
  }

  // 同步待上传商品
  async syncPendingGoods() {
    this.isSyncing = true

    try {
      const unsyncedGoods = goodsStore.getUnsyncedGoods()

      if (unsyncedGoods.length === 0) {
        console.log('没有待同步商品')
        return { success: 0, failed: 0 }
      }

      let successCount = 0
      let failedCount = 0

      for (const goods of unsyncedGoods) {
        try {
          // 移除本地字段
          const { id, createTime, updateTime, syncStatus, ...goodsData } = goods
          await saveGoods(goodsData)

          goodsStore.updateSyncStatus(goods.id, 1) // 同步成功
          successCount++
        } catch (error) {
          goodsStore.updateSyncStatus(goods.id, 2) // 同步失败
          failedCount++
          console.error('商品同步失败:', goods.name, error)
        }
      }

      // 显示同步结果
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

  // 获取网络状态
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

  // 手动触发同步
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

  // 检查是否需要同步
  needSync() {
    return goodsStore.getUnsyncedGoods().length > 0
  }

  // 获取同步状态
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

// 创建单例
const syncManager = new SyncManager()
export default syncManager

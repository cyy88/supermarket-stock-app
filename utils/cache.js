/**
 * 缓存管理工具
 */

class CacheManager {
  constructor() {
    this.cachePrefix = 'app_cache_'
    this.defaultExpireTime = 5 * 60 * 1000
  }

  /**
   * 生成缓存键名
   * @param {string} key 
   * @returns {string}
   */
  getCacheKey(key) {
    return this.cachePrefix + key
  }

  /**
   * 设置缓存
   * @param {string} key 缓存键
   * @param {any} data 缓存数据
   * @param {number} expireTime 过期时间（毫秒），默认5分钟
   */
  setCache(key, data, expireTime = this.defaultExpireTime) {
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expireTime: expireTime
      }
      
      const cacheKey = this.getCacheKey(key)
      uni.setStorageSync(cacheKey, JSON.stringify(cacheData))

    } catch (error) {
      console.error('设置缓存失败:', error)
    }
  }

  /**
   * 获取缓存
   * @param {string} key 缓存键
   * @returns {any|null} 缓存数据，如果不存在或已过期返回null
   */
  getCache(key) {
    try {
      const cacheKey = this.getCacheKey(key)
      const cacheStr = uni.getStorageSync(cacheKey)
      
      if (!cacheStr) {
        return null
      }

      const cacheData = JSON.parse(cacheStr)
      const now = Date.now()
      
      if (now - cacheData.timestamp > cacheData.expireTime) {
        this.removeCache(key)
        return null
      }
      
      return cacheData.data
    } catch (error) {
      console.error('获取缓存失败:', error)
      return null
    }
  }

  /**
   * 检查缓存是否存在且未过期
   * @param {string} key 缓存键
   * @returns {boolean}
   */
  hasValidCache(key) {
    return this.getCache(key) !== null
  }

  /**
   * 删除缓存
   * @param {string} key 缓存键
   */
  removeCache(key) {
    try {
      const cacheKey = this.getCacheKey(key)
      uni.removeStorageSync(cacheKey)
    } catch (error) {
      console.error('删除缓存失败:', error)
    }
  }

  /**
   * 清除所有缓存
   */
  clearAllCache() {
    try {
      const info = uni.getStorageInfoSync()
      const keys = info.keys || []
      
      keys.forEach(key => {
        if (key.startsWith(this.cachePrefix)) {
          uni.removeStorageSync(key)
        }
      })
      
    } catch (error) {
      console.error('清除缓存失败:', error)
    }
  }

  /**
   * 获取缓存信息
   * @param {string} key 缓存键
   * @returns {object|null} 缓存信息
   */
  getCacheInfo(key) {
    try {
      const cacheKey = this.getCacheKey(key)
      const cacheStr = uni.getStorageSync(cacheKey)
      
      if (!cacheStr) {
        return null
      }

      const cacheData = JSON.parse(cacheStr)
      const now = Date.now()
      const age = now - cacheData.timestamp
      const remaining = cacheData.expireTime - age
      
      return {
        key: key,
        timestamp: cacheData.timestamp,
        age: age,
        remaining: remaining,
        expired: remaining <= 0,
        dataSize: JSON.stringify(cacheData.data).length
      }
    } catch (error) {
      console.error('获取缓存信息失败:', error)
      return null
    }
  }
}

export const CACHE_KEYS = {
  GOODS_LIST: 'goods_list',
  STOCK_LIST: 'stock_list',
  CATEGORIES: 'categories',
  STORE_OPTIONS: 'store_options'
}

const cacheManager = new CacheManager()

export default cacheManager

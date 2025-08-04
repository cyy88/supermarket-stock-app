/**
 * 统一的图片处理工具
 */

import { UPLOAD_CONFIG, IMAGE_CONFIG } from '@/config/index.js'

/**
 * 修复可能包含重复域名的URL
 * @param {string} url - 可能存在问题的URL
 * @returns {string} 修复后的URL
 */
export const fixMalformedUrl = (url) => {
  if (!url || typeof url !== 'string') return url
  
  const domainPattern = /(https?:\/\/[^\/]+)(https?:\/\/[^\/]+)/
  const match = url.match(domainPattern)
  
  if (match) {
    return url.replace(match[1], '')
  }
  
  return url
}

/**
 * 获取完整的图片URL
 * @param {string} imageUrl - 原始图片URL
 * @returns {string} 完整的图片URL
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return IMAGE_CONFIG.defaultImage

  if (imageUrl.startsWith('http')) {
    return fixMalformedUrl(imageUrl)
  }
  
  if (imageUrl.startsWith('/')) {
    return IMAGE_CONFIG.basePath + imageUrl.substring(1)
  }
  
  return IMAGE_CONFIG.basePath + imageUrl
}

/**
 * 解析图片URL数组字符串
 * @param {string|Array} urlData - 图片URL数据（可能是字符串或数组）
 * @returns {Array} 图片URL数组
 */
export const parseImageUrls = (urlData) => {
  if (!urlData) return []
  
  if (Array.isArray(urlData)) {
    return urlData.filter(url => url && url.trim())
  }
  
  if (typeof urlData === 'string') {
    try {
      const parsed = JSON.parse(urlData)
      if (Array.isArray(parsed)) {
        return parsed.filter(url => url && url.trim())
      }
    } catch (error) {
    }
    
    if (urlData.startsWith('[') && urlData.endsWith(']')) {
      const urlString = urlData.slice(1, -1)
      const urls = urlString.split(',').map(url => url.trim())
      return urls.filter(url => url.length > 0)
    }
    
    return [urlData]
  }
  
  return []
}

/**
 * 统一的图片上传函数
 * @param {string} filePath - 本地文件路径
 * @returns {Promise<string>} 上传后的图片URL
 */
export const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    
    uni.uploadFile({
      url: UPLOAD_CONFIG.uploadUrl,
      filePath: filePath,
      name: 'file',
      header: {
        'Access-Token': token || '',
        'platform': 'MOBILE'
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          
          if (data.code === 200) {
            const fullUrl = data.data.url
            resolve(fullUrl)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (error) {
          reject(new Error('响应解析失败'))
        }
      },
      fail: (error) => {
        reject(new Error('上传请求失败'))
      }
    })
  })
}

/**
 * 批量上传图片
 * @param {Array} filePaths - 本地文件路径数组
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise<Array>} 上传后的图片URL数组
 */
export const uploadImages = async (filePaths, onProgress) => {
  const imageUrls = []
  const total = filePaths.length
  
  for (let i = 0; i < filePaths.length; i++) {
    try {
      const imageUrl = await uploadImage(filePaths[i])
      imageUrls.push(imageUrl)
      
      if (onProgress) {
        onProgress(i + 1, total)
      }
    } catch (error) {
      console.error(`第${i + 1}张图片上传失败:`, error)
      throw error
    }
  }
  
  return imageUrls
}

/**
 * 预览图片
 * @param {string|Array} imageUrls - 图片URL或URL数组
 * @param {string} current - 当前显示的图片URL
 */
export const previewImage = (imageUrls, current) => {
  let urls = []
  
  if (Array.isArray(imageUrls)) {
    urls = imageUrls.map(url => getFullImageUrl(url))
  } else if (typeof imageUrls === 'string') {
    urls = [getFullImageUrl(imageUrls)]
  }
  
  if (urls.length === 0) return
  
  const currentUrl = current ? getFullImageUrl(current) : urls[0]
  
  uni.previewImage({
    urls: urls,
    current: currentUrl
  })
}

/**
 * 获取商品图片列表
 * @param {Object} goods - 商品对象
 * @returns {Array} 图片URL数组
 */
export const getGoodsImages = (goods) => {
  if (!goods) return []
  
  const images = []
  
  // 添加主图
  if (goods.logo) {
    images.push(getFullImageUrl(goods.logo))
  }
  
  // 添加其他图片
  if (goods.images) {
    const additionalImages = parseImageUrls(goods.images)
    additionalImages.forEach(img => {
      const fullUrl = getFullImageUrl(img)
      if (!images.includes(fullUrl)) {
        images.push(fullUrl)
      }
    })
  }
  
  return images.filter(img => img && img !== IMAGE_CONFIG.defaultImage)
}

/**
 * 获取商品主图
 * @param {Object} goods - 商品对象
 * @returns {string} 主图URL
 */
export const getGoodsMainImage = (goods) => {
  if (!goods) return IMAGE_CONFIG.defaultImage
  
  if (goods.logo) {
    return getFullImageUrl(goods.logo)
  }
  
  if (goods.images) {
    const images = parseImageUrls(goods.images)
    if (images.length > 0) {
      return getFullImageUrl(images[0])
    }
  }
  
  return IMAGE_CONFIG.defaultImage
}

/**
 * URL 相关工具函数
 */

/**
 * 修复可能包含重复域名的URL
 * @param {string} url - 可能存在问题的URL
 * @returns {string} 修复后的URL
 */
export const fixMalformedUrl = (url) => {
  if (!url || typeof url !== 'string') return url
  
  // 查找URL中是否包含重复的域名
  const domainPattern = /(https?:\/\/[^\/]+)(https?:\/\/[^\/]+)/
  const match = url.match(domainPattern)
  
  if (match) {
    // 如果找到重复的域名，只保留第二个域名
    return url.replace(match[1], '')
  }
  
  return url
}

/**
 * 获取完整的图片URL
 * @param {string} imageUrl - 原始图片URL
 * @param {string} basePath - 图片基础路径
 * @returns {string} 完整的图片URL
 */
export const getFullImageUrl = (imageUrl, basePath) => {
  if (!imageUrl) return ''
  
  // 如果已经是完整URL，修复可能存在的域名重复问题并返回
  if (imageUrl.startsWith('http')) {
    return fixMalformedUrl(imageUrl)
  }
  
  // 如果是相对路径，需要拼接基础路径
  if (basePath) {
    // 确保basePath以/结尾
    const baseUrl = basePath.endsWith('/') ? basePath : basePath + '/'
    // 确保imageUrl不以/开头
    const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl
    return baseUrl + cleanImageUrl
  }
  
  return imageUrl
}

/**
 * 构建查询参数字符串
 * @param {Object} params - 参数对象
 * @returns {string} - 查询参数字符串
 */
export const buildQueryString = (params = {}) => {
  const queryParams = []
  
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== null && value !== undefined && value !== '') {
      queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  })
  
  return queryParams.join('&')
}

/**
 * 解析查询参数字符串
 * @param {string} queryString - 查询参数字符串
 * @returns {Object} - 参数对象
 */
export const parseQueryString = (queryString = '') => {
  const params = {}
  
  if (!queryString) return params
  
  const cleanQuery = queryString.startsWith('?') ? queryString.slice(1) : queryString
  
  cleanQuery.split('&').forEach(pair => {
    const [key, value] = pair.split('=')
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ''
    }
  })
  
  return params
}

/**
 * 构建完整的URL
 * @param {string} baseUrl - 基础URL
 * @param {Object} params - 查询参数
 * @returns {string} - 完整URL
 */
export const buildUrl = (baseUrl, params = {}) => {
  const queryString = buildQueryString(params)
  if (!queryString) return baseUrl
  
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}${queryString}`
}

// 兼容性检查
export const checkUrlSearchParamsSupport = () => {
  try {
    return typeof URLSearchParams !== 'undefined'
  } catch (e) {
    return false
  }
}



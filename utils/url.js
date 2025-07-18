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



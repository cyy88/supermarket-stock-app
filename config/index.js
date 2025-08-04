/**
 * 项目配置文件
 */

// API基础URL配置
export const BASE_URL = 'http://shop-manage-service.qingchunnianhua.com:1880'

// 文件上传配置
export const UPLOAD_CONFIG = {
  // 上传接口地址
  uploadUrl: `${BASE_URL}/backendApi/file/upload`,
  
  // 图片上传限制
  maxSize: 3, // MB
  maxCount: 5, // 最大上传数量
  
  // 支持的文件格式
  allowedTypes: ['jpg', 'jpeg', 'png', 'gif'],
  
  // 压缩配置
  sizeType: ['compressed'], // 压缩图片
  sourceType: ['camera', 'album'] // 来源：相机、相册
}

// 图片处理配置
export const IMAGE_CONFIG = {
  // 默认图片
  defaultImage: '/static/images/default.png',
  
  // 图片基础路径
  basePath: BASE_URL + '/',
  
  // 缩略图尺寸
  thumbnailSize: {
    small: '120x120',
    medium: '300x300',
    large: '600x600'
  }
}

// 页面配置
export const PAGE_CONFIG = {
  // 分页配置
  pageSize: 20,
  
  // 搜索防抖时间
  searchDebounce: 500,
  
  // 缓存时间（毫秒）
  cacheTime: 5 * 60 * 1000 // 5分钟
}

// 业务配置
export const BUSINESS_CONFIG = {
  // 入库单配置
  inbound: {
    maxImages: 5, // 最多上传5张入库单图片
    requiredImages: 1 // 至少需要1张图片
  },
  
  // 损耗管理配置
  loss: {
    maxImages: 3, // 最多上传3张损耗图片
    maxSuggestionLength: 50 // 损耗说明最大长度
  },
  
  // 商品配置
  goods: {
    maxImages: 10, // 商品最多10张图片
    maxSpecCount: 20 // 最多20个规格
  }
}

// 主题配置
export const THEME_CONFIG = {
  // 主色调
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  
  // 状态颜色
  successColor: '#52c41a',
  warningColor: '#faad14',
  errorColor: '#f5222d',
  infoColor: '#1890ff',
  
  // 渐变色
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
    warning: 'linear-gradient(135deg, #ff9500 0%, #ff6b35 100%)',
    info: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
  }
}

// 导出默认配置
export default {
  BASE_URL,
  UPLOAD_CONFIG,
  IMAGE_CONFIG,
  PAGE_CONFIG,
  BUSINESS_CONFIG,
  THEME_CONFIG
}

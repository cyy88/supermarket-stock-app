import request from '@/utils/request'
import { buildQueryString } from '@/utils/url'

// 保存商品
export const saveGoods = (data) => {
  return request({
    url: '/backendApi/goods/goods/save',
    method: 'POST',
    data
  })
}

// 更新商品 - 使用POST方法，与新增商品相同接口
export const updateGoods = (data) => {
  return request({
    url: '/backendApi/goods/goods/save',
    method: 'POST',
    data,
    header: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取商品列表
export const getGoodsList = (data = {}) => {
  // 默认参数
  const params = {
    page: 1,
    pageSize: 20,
    name: '',
    cateId: '',
    isItaconsumableitem: 1,
    ...data
  }

  return request({
    url: '/backendApi/goods/goods/list',
    method: 'POST',
    data: params
  })
}

// 获取商品详情
export const getGoodsDetail = (goodsId) => {
  return request({
    url: `/backendApi/goods/goods/info/${goodsId}`,
    method: 'GET'
  })
}

// 删除商品
export const deleteGoods = (goodsId) => {
  return request({
    url: `/backendApi/goods/goods/delete/${goodsId}`,
    method: 'DELETE'
  })
}

export const getGoodsStatistics = () => {
  console.warn('getGoodsStatistics 已禁用')
  return Promise.resolve({
    code: 200,
    data: {
      totalCount: 0,
      todayCount: 0
    }
  })
}

// 获取商品分类
export const getGoodsCateList = (params = {}) => {
  const defaultParams = {
    page: 1,
    pageSize: 100,
    name: '',
    status: ''
  }

  const finalParams = { ...defaultParams, ...params }

  const queryString = buildQueryString(finalParams)
  const fullUrl = `/backendApi/goods/cate/list?${queryString}`

  return request({
    url: fullUrl,
    method: 'GET'
  })
}

// 上传图片
export const uploadImage = (filePath) => {
  console.log('开始上传图片:', filePath);

  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    console.log('使用token:', token);

    uni.uploadFile({
      url: 'http://msbs-fuint-ts.qingchunnianhua.com:1880/backendApi/file/upload',
      filePath: filePath,
      name: 'file',
      header: {
        'Access-Token': token || '',
        'platform': 'MOBILE'
      },
      success: (res) => {
        console.log('图片上传响应:', res);
        try {
          const data = JSON.parse(res.data)
          console.log('解析后的上传响应:', data);

          if (data.code === 200) {
            // 始终使用完整的url字段
            let fullUrl = data.data.url
            console.log('图片上传成功，完整URL:', fullUrl);
            resolve(fullUrl)
          } else {
            console.error('图片上传失败:', data.message);
            reject(new Error(data.message || '上传失败'))
          }
        } catch (error) {
          console.error('解析上传响应失败:', error);
          reject(new Error('响应解析失败'))
        }
      },
      fail: (error) => {
        console.error('图片上传请求失败:', error);
        reject(new Error('上传请求失败'))
      }
    })
  })
}

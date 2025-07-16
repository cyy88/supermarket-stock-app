import request from '@/utils/request'

// 保存商品
export const saveGoods = (data) => {
  return request({
    url: '/backendApi/goods/goods/save',
    method: 'POST',
    data
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

// 获取商品分类
export const getGoodsCateList = (params = {}) => {
  // 构建查询参数
  const queryParams = new URLSearchParams({
    page: params.page || 1,
    pageSize: params.pageSize || 100,
    status: params.status || 'A',
    ...params
  }).toString()

  return request({
    url: `/backendApi/goods/cate/list?${queryParams}`,
    method: 'GET'
  })
}

// 上传图片
export const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')

    uni.uploadFile({
      url: 'http://msbs-fuint-ts.qingchunnianhua.com:1880/backendApi/file/upload',
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
            resolve(data.data)
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

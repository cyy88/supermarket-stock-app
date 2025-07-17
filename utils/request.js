const BASE_URL = 'http://msbs-fuint-ts.qingchunnianhua.com:1880'

// 请求拦截器
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = uni.getStorageSync('token')

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Access-Token': token || '',
        'platform': 'MOBILE',
        ...options.header
      },
      success: (res) => {
        const response = res.data

        if (response.code === 200) {
          resolve(response)
        } else if (response.code === 401) {
          // token过期，跳转登录
          uni.removeStorageSync('token')
          uni.reLaunch({
            url: '/pages/login/login'
          })
          reject(response)
        } else {
          uni.showToast({
            title: response.message || '请求失败',
            icon: 'none'
          })
          reject(response)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export default request

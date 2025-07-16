import request from '@/utils/request'

// 获取验证码
export const getCaptcha = () => {
  return request({
    url: '/clientApi/captcha/getCode',
    method: 'GET'
  })
}

// 登录接口
export const login = (data) => {
  return request({
    url: '/backendApi/login/doLogin',
    method: 'POST',
    data,
    header: {
      isToken: false  // 登录接口不需要token
    }
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/backendApi/login/getInfo',
    method: 'GET'
  })
}

// 退出登录
export const logout = () => {
  return request({
    url: '/backendApi/login/logout',
    method: 'POST'
  })
}

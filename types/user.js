// 用户信息类型定义
export const UserInfo = {
  accountId: 0,
  accountName: '',
  merchantId: 0,
  merchantName: '',
  storeId: 0,
  storeName: '',
  avatar: ''
}

// 登录请求类型
export const LoginRequest = {
  username: '',
  password: '',
  captchaCode: '',
  uuid: ''
}

// 登录响应类型
export const LoginResponse = {
  token: '',
  userInfo: UserInfo
}

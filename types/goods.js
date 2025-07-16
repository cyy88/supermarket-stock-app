// 商品信息类型定义
export const GoodsInfo = {
  id: '',
  name: '',
  goodsNo: '',  // 商品条码字段名
  cateId: '',
  cateName: '',
  price: 0,
  stock: 0,
  images: [],
  description: '',
  status: 'A', // A:启用 N:禁用
  type: 'goods', // goods:商品 service:服务
  priceType: 'piece', // piece:按件 weight:按重量
  sort: 0,
  syncStatus: 0, // 0:待同步 1:已同步 2:同步失败
  createTime: 0,
  updateTime: 0
}

// 商品分类信息
export const CategoryInfo = {
  id: '',
  name: '',
  status: 'A'
}

// 商品列表请求参数
export const GoodsListRequest = {
  page: 1,
  pageSize: 10,
  name: '',
  cateId: ''
}

// 扫码记录
export const ScanRecord = {
  barcode: '',
  time: 0,
  result: '' // 扫码结果
}

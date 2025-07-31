// 商品信息类型定义
export const GoodsInfo = {
  id: '',
  name: '',
  goodsNo: '',  // 商品条码字段名
  cateId: '',
  cateName: '',
  price: 0,
  linePrice: 0, // 划线价格
  stock: 0,
  safetyStock: 0, // 安全库存
  images: [],
  description: '',
  status: 'A', // A:启用 N:禁用
  type: 'goods', // goods:商品 service:服务
  priceType: 'piece', // piece:按件 weight:按重量
  weight: '', // 商品重量
  salePoint: '', // 商品卖点
  sort: 0,

  // 扩展信息
  canUsePoint: 'Y', // 积分抵扣 Y:可用 N:不可用
  isMemberDiscount: 'Y', // 会员折扣 Y:有折扣 N:无折扣
  isSingleSpec: 'Y', // 规格类型 Y:单规格 N:多规格
  serviceTime: 0, // 服务时长（分钟）

  spec: '', // 规格描述（如水多少mL）
  shape: '', // 形状描述（如杯个）
  brand: '', // 品牌
  supplier: '', // 供应商


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

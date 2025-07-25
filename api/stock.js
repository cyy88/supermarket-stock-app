import request from '@/utils/request'

// 分页查询库存管理记录列表
export function getStockList(query) {
  return request({
      url: '/backendApi/stock/list',
      method: 'get',
      params: query
  })
}

// 删除库存管理记录
export function deleteStock(id, status) {
  const data = {
    id,
    status
  }
  return request({
    url: '/backendApi/stock/delete',
    method: 'post',
    data: data
  })
}

// 保存库存管理记录
export function saveStock(data) {
  return request({
    url: '/backendApi/stock/save',
    method: 'post',
    data: data
  })
}

// 审核库存管理记录
export function audit(data) {
  return request({
    url: '/backendApi/stock/audit',
    method: 'post',
    data: data
  })
}

// 获取库存管理记录详情
export function getStockInfo(stockId) {
  return request({
    url: '/backendApi/stock/info/' + stockId,
    method: 'get'
  })
}

// 分页查询库存预警记录列表
export function getStockWarningList(data) {
  return request({
    url: '/backendApi/goods/goods/stockWarning',
    method: 'post',
    data: data
  })
}

// 获取选择商品列表
export function selectGoodsList(data) {
  return request({
     url: '/backendApi/goods/goods/selectGoods',
     method: 'post',
     data: data
  })
}

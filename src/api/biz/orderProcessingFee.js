import request from '@/utils/request'

// 查询订单手续费列表
export function listOrderProcessingFee(query) {
  return request({
    url: '/system/api/order_processing_fee/list',
    method: 'get',
    params: query
  })
}

// 查询订单手续费详细
export function getOrderProcessingFee(id) {
  return request({
    url: '/system/api/order_processing_fee/info/' + id,
    method: 'get'
  })
}

// 新增订单手续费
export function addOrderProcessingFee(data) {
  return request({
    url: '/system/api/order_processing_fee',
    method: 'post',
    data: data
  })
}

// 修改订单手续费
export function updateOrderProcessingFee(data) {
  return request({
    url: '/system/api/order_processing_fee',
    method: 'put',
    data: data
  })
}

// 删除订单手续费
export function delOrderProcessingFee(ids) {
  return request({
    url: '/system/api/order_processing_fee/' + ids,
    method: 'post'
  })
}

// 修改订单手续费每日免费次数
export function updateFreeCountForDay(count, type = 1) {
  return request({
    url: '/system/api/order_processing_fee/updateFreeCountForDay/' + count + '/' + type,
    method: 'put'
  })
}

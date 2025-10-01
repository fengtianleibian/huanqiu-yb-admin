import request from '@/utils/request'

// 查询代收代付通道列表
export function listPaymentChannel(query) {
  return request({
    url: '/system/api/payment_channel/list',
    method: 'get',
    params: query
  })
}

// 查询代收代付通道详细
export function getPaymentChannel(id) {
  return request({
    url: '/system/api/payment_channel/info/' + id,
    method: 'get'
  })
}

// 新增代收代付通道
export function addPaymentChannel(data) {
  return request({
    url: '/system/api/payment_channel',
    method: 'post',
    data: data
  })
}

// 修改代收代付通道
export function updatePaymentChannel(data) {
  return request({
    url: '/system/api/payment_channel',
    method: 'put',
    data: data
  })
}

// 删除代收代付通道
export function delPaymentChannel(ids) {
  return request({
    url: '/system/api/payment_channel/' + ids,
    method: 'post'
  })
}


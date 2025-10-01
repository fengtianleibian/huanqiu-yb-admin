import request from '@/utils/request'

// 查询三方支付渠道商列表
export function listPaymentChannelProvider(query) {
  return request({
    url: '/system/api/payment_channel_provider/list',
    method: 'get',
    params: query
  })
}

// 查询三方支付渠道商详细
export function getPaymentChannelProvider(id) {
  return request({
    url: '/system/api/payment_channel_provider/info/' + id,
    method: 'get'
  })
}

// 新增三方支付渠道商
export function addPaymentChannelProvider(data) {
  return request({
    url: '/system/api/payment_channel_provider',
    method: 'post',
    data: data
  })
}

// 修改三方支付渠道商
export function updatePaymentChannelProvider(data) {
  return request({
    url: '/system/api/payment_channel_provider',
    method: 'put',
    data: data
  })
}

// 删除三方支付渠道商
export function delPaymentChannelProvider(ids) {
  return request({
    url: '/system/api/payment_channel_provider/' + ids,
    method: 'post'
  })
}


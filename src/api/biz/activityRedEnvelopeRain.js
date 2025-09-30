import request from '@/utils/request'

// 查询红包雨列表
export function listActivityRedEnvelopeRain(query) {
  return request({
    url: '/system/api/activity_red_envelope_rain/list',
    method: 'get',
    params: query
  })
}

// 查询红包雨详细
export function getActivityRedEnvelopeRain(id) {
  return request({
    url: '/system/api/activity_red_envelope_rain/info/' + id,
    method: 'get'
  })
}

// 新增红包雨
export function addActivityRedEnvelopeRain(data) {
  return request({
    url: '/system/api/activity_red_envelope_rain',
    method: 'post',
    data: data
  })
}

// 修改红包雨
export function updateActivityRedEnvelopeRain(data) {
  return request({
    url: '/system/api/activity_red_envelope_rain',
    method: 'put',
    data: data
  })
}

// 删除红包雨
export function delActivityRedEnvelopeRain(ids) {
  return request({
    url: '/system/api/activity_red_envelope_rain/' + ids,
    method: 'post'
  })
}

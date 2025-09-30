import request from '@/utils/request'

// 查询首存三送列表
export function listActivityFirstRecharge(query) {
  return request({
    url: '/system/api/activity_first_recharge/list',
    method: 'get',
    params: query
  })
}

// 查询首存三送详细
export function getActivityFirstRecharge(id) {
  return request({
    url: '/system/api/activity_first_recharge/info/' + id,
    method: 'get'
  })
}

// 新增首存三送
export function addActivityFirstRecharge(data) {
  return request({
    url: '/system/api/activity_first_recharge',
    method: 'post',
    data: data
  })
}

// 修改首存三送
export function updateActivityFirstRecharge(data) {
  return request({
    url: '/system/api/activity_first_recharge',
    method: 'put',
    data: data
  })
}

// 删除首存三送
export function delActivityFirstRecharge(ids) {
  return request({
    url: '/system/api/activity_first_recharge/' + ids,
    method: 'post'
  })
}

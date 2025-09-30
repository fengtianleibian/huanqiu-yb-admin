import request from '@/utils/request'

// 查询每日首存列表
export function listActivityDayFirstRecharge(query) {
  return request({
    url: '/system/api/activity_day_first_recharge/list',
    method: 'get',
    params: query
  })
}

// 查询每日首存详细
export function getActivityDayFirstRecharge(id) {
  return request({
    url: '/system/api/activity_day_first_recharge/info/' + id,
    method: 'get'
  })
}

// 新增每日首存
export function addActivityDayFirstRecharge(data) {
  return request({
    url: '/system/api/activity_day_first_recharge',
    method: 'post',
    data: data
  })
}

// 修改每日首存
export function updateActivityDayFirstRecharge(data) {
  return request({
    url: '/system/api/activity_day_first_recharge',
    method: 'put',
    data: data
  })
}

// 删除每日首存
export function delActivityDayFirstRecharge(ids) {
  return request({
    url: '/system/api/activity_day_first_recharge/' + ids,
    method: 'post'
  })
}

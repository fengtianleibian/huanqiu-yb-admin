import request from '@/utils/request'

// 查询每日签到列表
export function listActivitySignEveryDay(query) {
  return request({
    url: '/system/api/activity_sign_every_day/list',
    method: 'get',
    params: query
  })
}

// 查询每日签到详细
export function getActivitySignEveryDay(id) {
  return request({
    url: '/system/api/activity_sign_every_day/info/' + id,
    method: 'get'
  })
}

// 新增每日签到
export function addActivitySignEveryDay(data) {
  return request({
    url: '/system/api/activity_sign_every_day',
    method: 'post',
    data: data
  })
}

// 修改每日签到
export function updateActivitySignEveryDay(data) {
  return request({
    url: '/system/api/activity_sign_every_day',
    method: 'put',
    data: data
  })
}

// 删除每日签到
export function delActivitySignEveryDay(ids) {
  return request({
    url: '/system/api/activity_sign_every_day/' + ids,
    method: 'post'
  })
}

// 批量修改每日签到条件
export function batchUpdateSignEveryDayCondition(data) {
  return request({
    url: '/system/api/activity_sign_every_day/batchUpdateSignEveryDayCondition',
    method: 'post',
    data: data
  })
}

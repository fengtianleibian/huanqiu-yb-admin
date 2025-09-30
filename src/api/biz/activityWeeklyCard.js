import request from '@/utils/request'

// 查询周卡列表
export function listActivityWeeklyCard(query) {
  return request({
    url: '/system/api/activity_weekly_card/list',
    method: 'get',
    params: query
  })
}

// 查询周卡详细
export function getActivityWeeklyCard(id) {
  return request({
    url: '/system/api/activity_weekly_card/info/' + id,
    method: 'get'
  })
}

// 新增周卡
export function addActivityWeeklyCard(data) {
  return request({
    url: '/system/api/activity_weekly_card',
    method: 'post',
    data: data
  })
}

// 修改周卡
export function updateActivityWeeklyCard(data) {
  return request({
    url: '/system/api/activity_weekly_card',
    method: 'put',
    data: data
  })
}

// 删除周卡
export function delActivityWeeklyCard(ids) {
  return request({
    url: '/system/api/activity_weekly_card/' + ids,
    method: 'post'
  })
}

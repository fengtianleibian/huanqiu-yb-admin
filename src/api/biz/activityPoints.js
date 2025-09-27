import request from '@/utils/request'

// 查询积分活动列表
export function listActivityPoints() {
  return request({
    url: '/system/api/activity_points/list',
    method: 'get'
  })
}

// 查询积分活动详细
export function getActivityPoints(id) {
  return request({
    url: '/system/api/activity_points/info/' + id,
    method: 'get'
  })
}

// 新增积分活动
export function addActivityPoints(data) {
  return request({
    url: '/system/api/activity_points',
    method: 'post',
    data: data
  })
}

// 修改积分活动
export function updateActivityPoints(data) {
  return request({
    url: '/system/api/activity_points',
    method: 'put',
    data: data
  })
}

// 删除积分活动
export function delActivityPoints(ids) {
  return request({
    url: '/system/api/activity_points/' + ids,
    method: 'post'
  })
}

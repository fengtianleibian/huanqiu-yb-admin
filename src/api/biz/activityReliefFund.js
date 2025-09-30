import request from '@/utils/request'

// 查询转运金列表
export function listActivityReliefFund(query) {
  return request({
    url: '/system/api/activity_relief_fund/list',
    method: 'get',
    params: query
  })
}

// 查询转运金详细
export function getActivityReliefFund(id) {
  return request({
    url: '/system/api/activity_relief_fund/info/' + id,
    method: 'get'
  })
}

// 新增转运金
export function addActivityReliefFund(data) {
  return request({
    url: '/system/api/activity_relief_fund',
    method: 'post',
    data: data
  })
}

// 修改转运金
export function updateActivityReliefFund(data) {
  return request({
    url: '/system/api/activity_relief_fund',
    method: 'put',
    data: data
  })
}

// 删除转运金
export function delActivityReliefFund(ids) {
  return request({
    url: '/system/api/activity_relief_fund/' + ids,
    method: 'post'
  })
}

import request from '@/utils/request'

// 查询用户等级列表
export function listMemberVipLevel(query) {
  return request({
    url: '/system/api/member_vip_level/list',
    method: 'get',
    params: query
  })
}

// 查询用户等级详细
export function getMemberVipLevel(id) {
  return request({
    url: '/system/api/member_vip_level/' + id,
    method: 'get'
  })
}

// 新增用户等级
export function addMemberVipLevel(data) {
  return request({
    url: '/system/api/member_vip_level',
    method: 'post',
    data: data
  })
}

// 修改用户等级
export function updateMemberVipLevel(data) {
  return request({
    url: '/system/api/member_vip_level',
    method: 'put',
    data: data
  })
}

// 删除用户等级
export function delMemberVipLevel(ids) {
  return request({
    url: '/system/api/member_vip_level/' + ids,
    method: 'post'
  })
}

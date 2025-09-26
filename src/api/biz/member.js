import request from '@/utils/request'

// 查询会员列表
export function listMember(query) {
  return request({
    url: '/system/api/member/list',
    method: 'post',
    data: query
  })
}

// 查询用户登录日志列表
export function listMemberLoginLog(query) {
  return request({
    url: '/system/api/member_login_log/list',
    method: 'post',
    data: query
  })
}

// 删除用户登录日志
export function delMemberLoginLog(ids) {
  return request({
    url: '/system/api/member_login_log/' + ids,
    method: 'post'
  })
}

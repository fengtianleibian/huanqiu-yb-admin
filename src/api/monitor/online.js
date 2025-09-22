import request from '@/utils/request'

// 查询在线用户列表
export function list(query) {
  return request({
    url: '/system/api/sys-user-online/list', method: 'get', params: query
  })
}

// 强退用户
export function forceLogout(userId) {
  return request({
    url: '/system/api/sys-user-online/' + userId, method: 'delete'
  })
}

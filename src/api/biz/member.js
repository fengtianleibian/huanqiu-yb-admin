import request from '@/utils/request'

// 查询会员列表
export function listMember(query) {
  return request({
    url: '/system/api/member/list',
    method: 'post',
    data: query
  })
}

import request from '@/utils/request'

// 查询用户银行卡信息列表
export function listMemberBank(query) {
  return request({
    url: '/system/api/member_bank/list',
    method: 'get',
    params: query
  })
}

// 新增用户银行卡信息
export function addMemberBank(data) {
  return request({
    url: '/system/api/member_bank',
    method: 'put',
    data: data
  })
}

// 修改用户银行卡信息
export function updateMemberBank(data) {
  return request({
    url: '/system/api/member_bank',
    method: 'put',
    data: data
  })
}

// 删除用户银行卡信息
export function delMemberBank(bankIds, googlePassword) {
  return request({
    url: '/system/api/member_bank/' + bankIds,
    method: 'post',
    params: {
      googlePassword: googlePassword
    }
  })
}

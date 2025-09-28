import request from '@/utils/request'

// 查询用户钱包积分日志列表
export function listMemberWalletIntegralLog(query) {
  return request({
    url: '/system/api/member_wallet_integral_log/list',
    method: 'get',
    params: query
  })
}

// 获取积分日志类型列表
export function getIntegralLogTypeList() {
  return request({
    url: '/system/api/member_wallet_integral_log/typeList',
    method: 'get'
  })
}

import request from '@/utils/request'

// 查询用户钱包余额日志列表
export function listMemberWalletBalanceLog(query) {
  return request({
    url: '/system/api/member_wallet_balance_log/list',
    method: 'get',
    params: query
  })
}

// 获取余额日志类型列表
export function getBalanceLogTypeList() {
  return request({
    url: '/system/api/member_wallet_balance_log/typeList',
    method: 'get'
  })
}

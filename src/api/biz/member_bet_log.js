import request from '@/utils/request'

// 获取用户下注日志列表
export function getMemberBetLogPage(data) {
  return request({
    url: '/system/api/member_bet_log/page',  method: 'post', data: data
  })
}

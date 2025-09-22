import request from '@/utils/request'

// 查询游戏库存金额变动日志列表
export function getOddsRealTimeInventoryLogPage(data) {
  return request({
    url: 'system/api/odds_real_time_inventory_log/page',
    method: 'post',
    data: data
  })
}

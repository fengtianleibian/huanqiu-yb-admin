import request from '@/utils/request'

// 获取游戏列表
export function getGameList() {
  return request({
    url: 'system/api/game/list',
    method: 'get'
  })
}

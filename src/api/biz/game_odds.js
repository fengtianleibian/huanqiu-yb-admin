import request from '@/utils/request'


// 初始化游戏赔率库存
export function initializeGameOdds(data) {
  return request({
    url: '/system/api/game_odds/initializeGameOdds', method: 'post', data: data
  })
}

// 查询游戏赔率列表
export function getGameOdds(data) {
  return request({
    url: '/system/api/game_odds/getGameOdds', method: 'post', data: data
  })
}

// 修改游戏赔率
export function updateGameOdds(data) {
  return request({
    url: '/system/api/game_odds/updateGameOdds', method: 'post', data: data
  })
}

// 获取游戏赔率范围列表
export function getGameOddsRange(data) {
  return request({
    url: '/system/api/game_odds_range/getGameOddsRange', method: 'post', data: data
  })
}

// 初始化游戏赔率库存
export function initializeGameOddsRange(data) {
  return request({
    url: '/system/api/game_odds_range/initializeGameOddsRange', method: 'post', data: data
  })
}

// 修改游戏赔率库存范围
export function updateGameOddsRange(data) {
  return request({
    url: '/system/api/game_odds_range/updateGameOddsRange', method: 'post', data: data
  })
}


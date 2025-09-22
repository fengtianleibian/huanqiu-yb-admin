import request from '@/utils/request'

// 获得我的站内信分页
export function getNotifyMessagePage(query) {
  return request({
    url: '/system/api/notify-message/page', method: 'get', params: query
  })
}

// 获取当前用户的最新站内信列表
export function getUnreadNotifyMessageList() {
  return request({
    url: '/system/api/notify-message/getUnreadNotifyMessageList', method: 'get'
  })
}

// 获得当前用户的未读站内信数量
export function getUnreadNotifyMessageCount() {
  return request({
    url: '/system/api/notify-message/getUnreadNotifyMessageCount', method: 'get'
  })
}

// 获得我的站内信分页
export function getMyNotifyMessagePage(query) {
  return request({
    url: '/system/api/notify-message/myPage', method: 'get', params: query
  })
}

// 批量标记已读
export function updateNotifyMessageRead(ids) {
  return request({
    url: '/system/api/notify-message/updateNotifyMessageRead/' + ids, method: 'post'
  })
}

// 标记所有站内信为已读
export function updateAllNotifyMessageRead() {
  return request({
    url: '/system/api/notify-message/updateAllNotifyMessageRead', method: 'post'
  })
}



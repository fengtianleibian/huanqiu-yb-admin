import request from '@/utils/request'

// 获得站内信模板分页
export function getNotifyTemplatePage(query) {
  return request({
    url: '/system/api/notify-template/page', method: 'get', params: query
  })
}

// 创建站内信模板
export function createNotifyTemplate(data) {
  return request({
    url: '/system/api/notify-template/add', method: 'post', data: data
  })
}

// 获得站内信模板
export function getNotifyTemplate(id) {
  return request({
    url: '/system/api/notify-template/get?id=' + id, method: 'get'
  })
}

// 更新站内信模板
export function updateNotifyTemplate(data) {
  return request({
    url: '/system/api/notify-template/update', method: 'post', data: data
  })
}

// 删除站内信模板
export function deleteNotifyTemplate(id) {
  return request({
    url: '/system/api/notify-template/delete?id=' + id, method: 'post'
  })
}

// 测试站内信模板
export function sendNotify(data) {
  return request({
    url: '/system/api/notify-template/sendNotify', method: 'post', data: data
  })
}

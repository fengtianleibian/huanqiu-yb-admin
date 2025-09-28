import request from '@/utils/request'

// 获取反馈类型列表
export function getFeedbackTypeList() {
  return request({
    url: '/system/api/member_feedback/typeList',
    method: 'get'
  })
}

// 查询用户反馈列表
export function listMemberFeedback(query) {
  return request({
    url: '/system/api/member_feedback/list',
    method: 'get',
    params: query
  })
}

// 客服反馈
export function addFeedback(data) {
  return request({
    url: '/system/api/member_feedback/feedback',
    method: 'post',
    data: data
  })
}

// 删除反馈
export function delFeedback(id) {
  return request({
    url: `/system/api/member_feedback/delFeedback/${id}`,
    method: 'post'
  })
}

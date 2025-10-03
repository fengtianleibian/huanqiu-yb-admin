import request from '@/utils/request'

// 查询活动列表
export function listActivity(query) {
  return request({
    url: '/system/api/activity/list',
    method: 'get',
    params: query
  })
}

// 查询活动详细
export function getActivity(id) {
  return request({
    url: '/system/api/activity/info/' + id,
    method: 'get'
  })
}

// 新增活动
export function addActivity(data) {
  return request({
    url: '/system/api/activity',
    method: 'post',
    data: data
  })
}

// 修改活动
export function updateActivity(data) {
  return request({
    url: '/system/api/activity',
    method: 'put',
    data: data
  })
}

// 删除活动
export function delActivity(ids) {
  return request({
    url: '/system/api/activity/' + ids,
    method: 'post'
  })
}

// 上传活动图片
export function uploadActivity(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/system/api/activity/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取活动选项
export function listActivityName() {
  return request({
    url: '/system/api/activity/listName',
    method: 'get'
  })
}

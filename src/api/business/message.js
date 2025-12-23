import request from '@/utils/request'

// 查询商户消息列表
export function listMessage(query) {
  return request({
    url: '/business/message/list',
    method: 'get',
    params: query
  })
}

// 查询商户消息详细
export function getMessage(id) {
  return request({
    url: '/business/message/' + id,
    method: 'get'
  })
}

// 新增商户消息
export function addMessage(data) {
  return request({
    url: '/business/message',
    method: 'post',
    data: data
  })
}

// 修改商户消息
export function updateMessage(data) {
  return request({
    url: '/business/message',
    method: 'put',
    data: data
  })
}

// 删除商户消息
export function delMessage(id) {
  return request({
    url: '/business/message/' + id,
    method: 'delete'
  })
}

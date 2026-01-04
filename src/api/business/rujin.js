import request from '@/utils/request'

// 查询入金渠道列表
export function listRujin(query) {
  return request({
    url: '/business/rujin/list',
    method: 'get',
    params: query
  })
}

// 查询入金渠道详细
export function getRujin(channelId) {
  return request({
    url: '/business/rujin/' + channelId,
    method: 'get'
  })
}

// 新增入金渠道
export function addRujin(data) {
  return request({
    url: '/business/rujin',
    method: 'post',
    data: data
  })
}

// 修改入金渠道
export function updateRujin(data) {
  return request({
    url: '/business/rujin',
    method: 'put',
    data: data
  })
}

// 删除入金渠道
export function delRujin(channelId) {
  return request({
    url: '/business/rujin/' + channelId,
    method: 'delete'
  })
}

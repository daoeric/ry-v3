import request from '@/utils/request'

// 查询提现订单列表
export function listWithdrawRequest(query) {
  return request({
    url: '/business/withdrawRequest/list',
    method: 'get',
    params: query
  })
}

// 查询提现订单详细
export function getWithdrawRequest(withdrawId) {
  return request({
    url: '/business/withdrawRequest/' + withdrawId,
    method: 'get'
  })
}

// 新增提现订单
export function addWithdrawRequest(data) {
  return request({
    url: '/business/withdrawRequest',
    method: 'post',
    data: data
  })
}

// 修改提现订单
export function updateWithdrawRequest(data) {
  return request({
    url: '/business/withdrawRequest',
    method: 'put',
    data: data
  })
}

// 删除提现订单
export function delWithdrawRequest(withdrawId) {
  return request({
    url: '/business/withdrawRequest/' + withdrawId,
    method: 'delete'
  })
}
export function approveWithdraw(data) {
  return request({
    url: '/business/withdrawRequest/approve',
    method: 'put',
    data: data
  })
}

export function rejectWithdraw(data) {
  return request({
    url: '/business/withdrawRequest/approve',
    method: 'put',
    data: data
  })
}

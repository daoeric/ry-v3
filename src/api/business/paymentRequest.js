import request from '@/utils/request'

// 查询存入订单列表
export function listPaymentRequest(query) {
  return request({
    url: '/business/paymentRequest/list',
    method: 'get',
    params: query
  })
}

// 查询存入订单详细
export function getPaymentRequest(requestId) {
  return request({
    url: '/business/paymentRequest/' + requestId,
    method: 'get'
  })
}

// 新增存入订单
export function addPaymentRequest(data) {
  return request({
    url: '/business/paymentRequest',
    method: 'post',
    data: data
  })
}

// 修改存入订单
export function updatePaymentRequest(data) {
  return request({
    url: '/business/paymentRequest',
    method: 'put',
    data: data
  })
}

// 删除存入订单
export function delPaymentRequest(requestId) {
  return request({
    url: '/business/paymentRequest/' + requestId,
    method: 'delete'
  })
}

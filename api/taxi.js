import request from '@/utils/request'
// 统一走自有后端接口，不在前端生成签名也不直连 openapi

// 查询用车城市
export function queryCities() {
	return request.get('car/cities')
}

// 查询预估报价
export function queryEstimatePrice(data) {
	return request.post('car/estimatePrice', data)
}

// 查询订单状态
export function queryOrderStatus(orderId, params = {}) {
	return request.post('car/queryOrderStatus', { orderId, ...params })
}

// 查询司机实时位置
export function queryDriverLocation(orderId, params = {}) {
	return request.post('car/queryDriverLocation', { orderId, ...params })
}

// 创建订单
export function createOrder(data) {
	return request.post('car/createOrder', data)
}

// 订单列表
export function getCarOrderList(data) {
	return request.post('car/orderList', data)
}

// 订单详情
export function getCarOrderDetail(data) {
	return request.post('car/orderDetail', data)
}

// 取消订单
export function cancelCarOrder(data) {
	return request.post('car/cancelOrder', data)
}


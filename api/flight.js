// +----------------------------------------------------------------------
// | 机票模块API
// +----------------------------------------------------------------------
import request from '../utils/request'

/**
 * 机票模块API
 * 接口说明：
 * - cityList: 城市列表查询
 * - flightList: 航班列表查询（支持筛选、分页）
 * - flightDetail: 航班详情查询
 */

// 城市列表
export function cityList(data) {
    return request.post('flight/cityList', data)
}

// 航班列表
export function flightList(data) {
    return request.post('flight/flightList', data)
}

// 航班详情
export function flightDetail(data) {
    return request.post('flight/flightDetail', data)
}

// 创建机票订单
export function createOrder(data) {
    return request.post('flight/createOrder', data)
}


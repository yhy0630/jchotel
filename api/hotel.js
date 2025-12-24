// +----------------------------------------------------------------------
// | likeshop开源商城系统
// +----------------------------------------------------------------------
// | 欢迎阅读学习系统程序代码，建议反馈是我们前进的动力
// | gitee下载：https://gitee.com/likeshop_gitee
// | github下载：https://github.com/likeshop-github
// | 访问官网：https://www.likeshop.cn
// | 访问社区：https://home.likeshop.cn
// | 访问手册：http://doc.likeshop.cn
// | 微信公众号：likeshop技术社区
// | likeshop系列产品在gitee、github等公开渠道开源版本可免费商用，未经许可不能去除前后端官方版权标识
// |  likeshop系列产品收费版本务必购买商业授权，购买去版权授权后，方可去除前后端官方版权标识
// | 禁止对系统程序代码以任何目的，任何形式的再发布
// | likeshop团队版权所有并拥有最终解释权
// +----------------------------------------------------------------------
// | author: likeshop.cn.team
// +----------------------------------------------------------------------
import request from '../utils/request'

/**
 * 酒店模块API
 * 接口说明：
 * - cityList: 城市列表查询（支持查询城市详情）
 * - hotelList: 酒店列表查询（支持筛选、分页）
 * - hotelDetail: 酒店详情查询（含房型列表）
 * - customPublish: 发布定制房需求
 * - customMyList: 我的发布列表
 * - customDetail: 发布详情（查看商家报价）
 * - merchantRequestList: 商家接单列表（定制需求）
 * - merchantOffer: 商家出价
 * - merchantOfferList: 我的出价列表
 * - selectOffer: 选择报价并创建订单
 * - orderList: 订单列表
 * - orderDetail: 订单详情
 */

// 城市列表
export function cityList(data) {
    return request.post('hotel/cityList', data)
}

// 酒店列表
export function hotelList(data) {
    return request.post('hotel/hotelList', data)
}

// 酒店详情
export function hotelDetail(data) {
    return request.post('hotel/hotelDetail', data)
}

// 发布定制房需求
export function customPublish(data) {
    return request.post('hotel/customPublish', data)
}

// 我的发布列表
export function customMyList(data) {
    return request.post('hotel/customMyList', data)
}

// 发布详情
export function customDetail(data) {
    return request.post('hotel/customDetail', data)
}

// 商家接单列表
export function merchantRequestList(data) {
    return request.post('hotel/merchantRequestList', data)
}

// 商家出价
export function merchantOffer(data) {
    return request.post('hotel/merchantOffer', data)
}

// 我的出价列表
export function merchantOfferList(data) {
    return request.post('hotel/merchantOfferList', data)
}

// 获取订单预览信息
export function previewOffer(data) {
    return request.post('hotel/previewOffer', data)
}

// 选择报价
export function selectOffer(data) {
    return request.post('hotel/selectOffer', data)
}

// 订单列表
export function orderList(data) {
    return request.post('hotel/orderList', data)
}

// 订单详情
export function orderDetail(data) {
    return request.post('hotel/orderDetail', data)
}

// 预检查第三方酒店预订（验证是否能下单）
export function checkBooking(data) {
    return request.post('hotel/checkBooking', data)
}

// 创建第三方酒店订单
export function createOrder(data) {
    return request.post('hotel/createOrder', data)
}

// 取消订单
export function cancelOrder(data) {
    return request.post('hotel/cancelOrder', data)
}


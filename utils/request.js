import axios from '../js_sdk/xtshadow-axios/axios.min'
import store from '../store'
import {
	paramsToStr,
	currentPage,
	tabbarList,
	acountList
} from './tools'
import Cache from './cache'
import {
	TOKEN,
	BACK_URL
} from '../config/cachekey'
import {
	baseURL
} from '../config/app'
import {
	getWxCode,
	toLogin,
	wxMnpLogin
} from './login'

let index = 0;

function checkParams(params) {
	if (typeof params != 'object') return params
	for (let key in params) {
		const value = params[key];
		if (value === null || value === undefined || value === "") {
			delete params[key];
		}
	}
	return params;
}



const service = axios.create({
	baseURL: `${baseURL}/api/`,
	timeout: 10000,
	header: {
		'content-type': 'application/json'
	},

});


// request拦截器
service.interceptors.request.use(
	config => {
		config.data = checkParams(config.data)
		config.params = checkParams(config.params)
		if (config.method == 'GET') {
			config.url += paramsToStr(config.params)
		}
		config.header.token = config.header.token || Cache.get(TOKEN)
		return config
	},
	error => {
		// Do something with request error
		console.log(error) // for debug
		Promise.reject(error)
	}
)

// response 拦截器
service.interceptors.response.use(
	async (response) => {
			if (response.data) {
				if (typeof response.data === 'string') {
					uni.showToast({
						title: '服务器返回数据格式错误',
						icon: 'none',
						duration: 2000
					})
					return Promise.reject(new Error('服务器返回数据格式错误'))
				}
				
				const {
					code,
					show,
					msg
				} = response.data;
				const {
					route,
					options
				} = currentPage()
				if (code == 0 && show && msg) {
					uni.showToast({
						title: msg,
						icon: "none"
					})
				} else if (code == -1) {
					store.commit('LOGOUT')
					//#ifdef MP-WEIXIN
					wxMnpLogin()
					// #endif
					//#ifdef H5 || APP-PLUS
					if (route && !tabbarList.includes(route)) {
						toLogin()
					}
					// #endif
					//#ifdef H5 
					if (!acountList.includes(route)) {
						Cache.set(BACK_URL, `/${route}${paramsToStr(options)}`)
					}
					// #endif
				}
			}

			return Promise.resolve(response.data)
		},
		error => {
			console.log(error)
			console.log('err' + error)
			
			let errorMsg = '网络请求失败'
			if (error.message) {
				errorMsg = error.message
			} else if (error.errMsg) {
				errorMsg = error.errMsg
			}
			
			uni.showToast({
				title: errorMsg,
				icon: 'none',
				duration: 2000
			})
			
			return Promise.reject(error)
		}
)

export default service

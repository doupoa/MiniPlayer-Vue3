import { createApp } from 'vue'
import router from './router/index.js'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import { Base64 } from 'js-base64'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'

const reqCode = {
	'100xx': '登录相关代码',
	'10001': '登录成功',
	'10002': '用户名不存在',
	'10003': '密码错误，请重试',
	'10004': '账户登录失败次数过多',
	'10005': '登录信息提交失败，请联系管理员',
	'10006': '登录账号密码不得为空',
	'10007': '服务器关闭了登录服务',

	'110xx': '注册相关代码',
	'11001': '注册成功',
	'11002': '用户名存在',
	'11003': '用户名格式不正确',
	'11004': '密码格式不正确',
	'11005': '两次输入密码不一致',
	'11006': '注册账号密码不得为空',
	'11007': '服务器关闭了注册服务',
	'11008': '注册信息提交失败，请联系管理员',
	
	'120xx': '请求相关代码',
	'12001': 'Token重新获取成功',
	
	'130xx':'用户相关代码',
	'13001':'用户只读，当前操作无效',
	'13002':'歌曲信息删除失败',
	'13003':'歌曲信息删除成功',
	'13004':'歌曲信息添加成功',
	'13005':'歌曲信息添加失败',
	'13006':'歌曲收藏成功',
	'13007':'歌曲收藏失败'
}

library.add(fas)
const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(VueAxios,axios).use(router)

app.provide('$serverUrl','http://music.doupoa.site:3456') //服务端地址
app.provide('$rsaKey',`MEgCQQCyjavchPVGtrWbVr+YkDuQpO6WxJlAi7wup73lDg6F5+SJsLv7yFMH8q72itw9FtEbDtyrPZm/wk/UiV2vz7KFAgMBAAE=`) //登录信息RSA加密公钥

app.provide('$axios',app.config.globalProperties.axios)
app.provide('$reqCode',reqCode)
app.provide('$base64',Base64)

app.mount('#app')
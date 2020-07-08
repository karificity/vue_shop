import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
// axios拦截器
axios.interceptors.request.use( config => {
	// 添加请求头
	config.headers.Authorization = window.sessionStorage.getItem('token')
	return config
})

Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)



new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

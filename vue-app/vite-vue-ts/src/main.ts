import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// 使用Pinia状态管理
app.use(createPinia())

// 使用Ant Design Vue
app.use(Antd)

// 使用路由
app.use(router)

app.mount('#app')
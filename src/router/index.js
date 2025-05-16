import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [

  // 项目自动生成的页面，已经被废弃
  {
    path: '/index',
    name: 'home',
    component: HomeView,
    meta: {
      title: "已废弃页面"
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: "已废弃页面"
    }
  },

  // 新主页，沙画转换器主页
  {
    path: '/',
    name: 'module',
    component: () => import('../views/ModuleView.vue'),
    meta: {
      title: "沙画转换"
    }
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  console.log(to, from, next);
  if (to.meta.title) {
    document.title = to.meta.title;
    next();
  }
})

export default router

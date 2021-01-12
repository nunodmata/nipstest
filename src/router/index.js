import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [{
    path: '/',
    name: 'principal',
    component: Home
  },
  {
    path: '/home',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/About.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/report',
    name: 'report',
    component: () => import('../views/Report.vue')
  },
  {
    path: '/camiao',
    name: 'camiao',
    component: () => import('../views/Camiao.vue')
  },
  {
    path: '/reportDiario',
    name: 'reportDiario',
    component: () => import('../views/reportDiario.vue')
  },
  {
    path: '/insertCircuitos',
    name: 'insertCircuitos',
    component: () => import('../views/InsertCircuitos.vue')
  },
  {
    path: '/utilizador',
    name: 'utilizador',
    component: () => import('../views/Utilizador.vue')
  },
  {
    path: '/reportRealTime',
    name: 'reportRealTime',
    component: () => import('../views/ReportsRealTime.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
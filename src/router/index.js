import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'
import ConfirmRegistrationView from '../views/ConfirmRegistrationView.vue'
import LoginView from '../views/LoginView.vue'
import CreateProgramView from '../views/admin/CreateProgramView.vue'
import ProgramView from '../views/ProgramView.vue'
import TingView from '../views/TingView.vue'
import ProgramListView from '../views/admin/ProgramListView.vue'
import TingListView from '../views/admin/TingListView.vue'
import SettingsView from '../views/admin/SettingsView.vue'
import TingPracticeListView from '../views/admin/TingPracticeListView.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/confirmRegistration',
    name: 'ConfirmRegistration',
    component: ConfirmRegistrationView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/programs/:id',
    name: 'Program',
    component: ProgramView
  },
  {
    path: '/tings/:id',
    name: 'Ting',
    component: TingView
  },
  {
    path: '/admin/createProgram',
    name: 'CreateProgram',
    component: CreateProgramView,
    meta: {
      loginRequired: true
    }
  },
  {
    path: '/admin/programs',
    name: 'ProgramList',
    component: ProgramListView,
    meta: {
      loginRequired: true
    }
  },
  {
    path: '/admin/programs/:programId/tings',
    name: 'TingList',
    component: TingListView,
    meta: {
      loginRequired: true
    }
  },
  {
    path: '/admin/tingPractices',
    name: 'TingPracticeList',
    component: TingPracticeListView,
    meta: {
      loginRequired: true
    }
  },
  {
    path: '/admin/settings',
    name: 'Settings',
    component: SettingsView,
    meta: {
      loginRequired: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.loginRequired)) {
    if (store.state.me) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router

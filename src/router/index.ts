import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Apoderado from '@/views/apoderado.vue'
import Estudiante from '@/views/estudiante.vue'
import Docente from '@/views/docente.vue'
import Aula from '@/views/aula.vue'
import Matricula from '@/views/matricula.vue'
import Login from '@/views/login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/apoderado',
      name: 'apoderado',
      component: Apoderado,
    },
    {
      path: '/estudiante',
      name: 'estudiante',
      component: Estudiante,
    }, {
      path: '/docente',
      name: 'docente',
      component: Docente,
    }, {
      path: '/aula',
      name: 'aula',
      component: Aula,
    }, {
      path: '/matricula',
      name: 'matricula',
      component: Matricula,
    }
    , {
      path: '/login',
      name: 'login',
      component: Login,
    },
  ],
})

export default router

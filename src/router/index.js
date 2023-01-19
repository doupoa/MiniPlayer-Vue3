import {
	createRouter,
	createWebHashHistory
} from "vue-router"

const routes = [{
		path: '/',
		name: 'index',
		component: () => import('../views/index.vue'),
		meta: {
			auth: true,
			index: 2
		},
	},
	{
		path: '/login',
		name: 'login',
		component: () => import('../views/login.vue'),
		meta: {
			auth: false,
			index: 1
		},
	}
]

const router = createRouter({
	history: createWebHashHistory(), // hash mode. If you need to remove '#', you need to modify it to 'createWebHistory()' mode
	routes
})
router.beforeEach((to, from, next) => {
	const token = localStorage.getItem('token')
	if (to.meta.auth) {
		if (token == '') {
			next('/login')
		}
	}
	next()
})
export default router

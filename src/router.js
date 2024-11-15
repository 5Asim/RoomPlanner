	import { createRouter, createWebHistory } from 'vue-router'
	// import RoomSetup from '@/components/Room_setup.vue'
	import RoomPlanner from '@/components/Room_Planner.vue'

	const routes = [
	{
	path: '/',
	name: 'RoomPlanner',
	component: RoomPlanner
	},
	{
	path: '/room-planner/:width/:height/:depth',
	name: 'RoomPlanner',
	component: RoomPlanner,
	props: route => ({
	width: Number(route.params.width),
	height: Number(route.params.height),
	depth: Number(route.params.depth)
	})
	}
	]

	export const router = createRouter({
	history: createWebHistory(),
	routes
	})
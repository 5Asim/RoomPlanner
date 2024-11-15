<!-- Floating Menu-->	
	<template>
		<div class="floating-menu">
		<img
		src="@/assets/menu.png"
		alt="Menu Icon"
		class="floating-icon"
		@click="toggleMenu"
		/>
		<div v-if="isMenuVisible" class="menu-overlay">
		<!-- Pass the update-dimensions event upwards -->
		<Menu 
		@close-menu="toggleMenu"  
		@update-dimensions="handleUpdateDimensions"
		@item-clicked="handleItemSelected"
		/>
		</div>
		</div>
	</template>
	
	<script>
		
		import { defineComponent, getCurrentInstance, ref } from 'vue';
		import Menu from '@/components/menu.vue';
	
		export default defineComponent({
		name: 'FloatingMenu',
		components: { Menu },
	
		setup() {
		const isMenuVisible = ref(false);
		const { emit } = getCurrentInstance();
	
		const toggleMenu = () => {
		isMenuVisible.value = !isMenuVisible.value;
		};
	
		// This will handle the dimensions change and propagate it upwards
		const handleUpdateDimensions = (width, height, depth) => {
		// Emit the update to the parent component
		// This will pass the updated dimensions to the parent
			emit('update-dimensions', width, height, depth);
		};

		const handleItemSelected = (item) => {
			emit('item-selected', item);
			console.log(item ? item.name || 'Unnamed Item' : 'No item selected');
		};
	
		return { isMenuVisible, toggleMenu, handleUpdateDimensions, handleItemSelected };
		},
		});
	</script>
	
	<style scoped>
		.floating-menu {
		position: fixed;
		top: 10px;
		left: 10px;
		}
	
		.floating-icon {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background-color: #007bff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		cursor: pointer;
		transition: transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
		}
	
		.floating-icon:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
		}
	
		.menu-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
		}
	</style>
	
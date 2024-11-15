	<!-- floating_dimension.vue -->
	<template>
		<div class="floating-controls">
		<div class="control-group">
		<div class="control-item">
		<label>
			<span class="icon">↔️</span>
			Width:
		</label>
		<input 
			type="number" 
			v-model="width" 
			@change="updateDimensions"
			min="1"
			max="50"
		/>
		</div>
		
		<div class="control-item">
		<label>
			<span class="icon">↕️</span>
			Height:
		</label>
		<input 
			type="number" 
			v-model="height" 
			@change="updateDimensions"
			min="1"
			max="20"
		/>
		</div>
		
		<div class="control-item">
		<label>
			<span class="icon">↩️</span>
			Depth:
		</label>
		<input 
			type="number" 
			v-model="depth" 
			@change="updateDimensions"
			min="1"
			max="50"
		/>
		</div>
		</div>
		</div>
	</template>
	
	<script>
	import { ref, defineComponent } from 'vue';
	
	export default defineComponent({
		name: 'FloatingDimension',
		
		setup(props, { emit }) {
		const width = ref(10);
		const height = ref(5);
		const depth = ref(10);
	
		const updateDimensions = () => {
		emit('update-dimensions', {
		width: Number(width.value),
		height: Number(height.value),
		depth: Number(depth.value)
		});
		};
	
		return {
		width,
		height,
		depth,
		updateDimensions
		};
		}
	});
	</script>
	
	<style scoped>
	.floating-controls {
		position: fixed;
		top: 20px;
		right: 20px;
		background-color: rgba(255, 255, 255, 0.9);
		padding: 15px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}
	
	.control-group {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	
	.control-item {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	
	.control-item label {
		display: flex;
		align-items: center;
		gap: 5px;
		min-width: 80px;
	}
	
	.icon {
		font-size: 1.2em;
	}
	
	input {
		width: 60px;
		padding: 4px 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	
	input:focus {
		outline: none;
		border-color: #666;
	}
	</style>
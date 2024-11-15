<!-- RoomSetup.vue -->
<template>
	<div class="room-setup-container">
		<div class="setup-card">
		<h2 class="setup-title">Room Setup</h2>
		<form @submit.prevent="handleSubmit" class="setup-form">
		<div class="form-group">
			<label for="width">Room Width (meters)</label>
			<input
			type="number"
			id="width"
			v-model.number="dimensions.width"
			min="1"
			max="20"
			step="0.1"
			required
			class="dimension-input"
			/>
			<span class="error" v-if="errors.width">{{ errors.width }}</span>
		</div>
	
		<div class="form-group">
			<label for="height">Room Height (meters)</label>
			<input
			type="number"
			id="height"
			v-model.number="dimensions.height"
			min="1"
			max="10"
			step="0.1"
			required
			class="dimension-input"
			/>
			<span class="error" v-if="errors.height">{{ errors.height }}</span>
		</div>
	
		<div class="form-group">
			<label for="depth">Room Depth (meters)</label>
			<input
			type="number"
			id="depth"
			v-model.number="dimensions.depth"
			min="1"
			max="20"
			step="0.1"
			required
			class="dimension-input"
			/>
			<span class="error" v-if="errors.depth">{{ errors.depth }}</span>
		</div>
	
		<div class="room-preview">
			<div class="preview-box" :style="previewStyle">
			<div class="dimension-label width-label">{{ dimensions.width }}m</div>
			<div class="dimension-label depth-label">{{ dimensions.depth }}m</div>
			</div>
			<div class="height-preview">
			<div class="height-bar" :style="heightPreviewStyle"></div>
			<div class="dimension-label height-label">{{ dimensions.height }}m</div>
			</div>
		</div>
	
		<div class="button-group">
			<button type="submit" class="submit-btn">Create Room</button>
		</div>
		</form>
		</div>
	</div>
</template>
      
<script>
	import { ref, computed } from 'vue';
	import { useRouter } from 'vue-router';
	
	export default {
		name: 'RoomSetup',
		setup() {
		const router = useRouter();
		const dimensions = ref({
		width: 10,
		height: 5,
		depth: 10
		});
	
		const errors = ref({
		width: '',
		height: '',
		depth: ''
		});
	
		const previewStyle = computed(() => {
		const maxSize = 300;
		const aspectRatio = dimensions.value.width / dimensions.value.depth;
		let width, height;
		
		if (aspectRatio > 1) {
		width = maxSize;
		height = maxSize / aspectRatio;
		} else {
		height = maxSize;
		width = maxSize * aspectRatio;
		}
	
		return {
		width: `${width}px`,
		height: `${height}px`
		};
		});
	
		const heightPreviewStyle = computed(() => ({
		height: `${(dimensions.value.height / 10) * 300}px`
		}));
	
		const validateDimensions = () => {
		errors.value = {
		width: '',
		height: '',
		depth: ''
		};
	
		if (dimensions.value.width < 1 || dimensions.value.width > 20) {
		errors.value.width = 'Width must be between 1 and 20 meters';
		}
	
		if (dimensions.value.height < 1 || dimensions.value.height > 10) {
		errors.value.height = 'Height must be between 1 and 10 meters';
		}
	
		if (dimensions.value.depth < 1 || dimensions.value.depth > 20) {
		errors.value.depth = 'Depth must be between 1 and 20 meters';
		}
	
		return !Object.values(errors.value).some(error => error !== '');
		};
	
		const handleSubmit = () => {
		if (validateDimensions()) {
		router.push({
			name: 'RoomPlanner',
			params: {
			width: dimensions.value.width,
			height: dimensions.value.height,
			depth: dimensions.value.depth
			}
		});
		}
		};
	
		return {
		dimensions,
		errors,
		previewStyle,
		heightPreviewStyle,
		handleSubmit
		};
		}
	};
</script>
      
<style scoped>
	.room-setup-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 20px;
	}
	
	.setup-card {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 600px;
	}
	
	.setup-title {
		text-align: center;
		margin-bottom: 2rem;
		color: #333;
	}
	
	.setup-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.dimension-input {
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}
	
	.error {
		color: #dc3545;
		font-size: 0.875rem;
	}
	
	.room-preview {
		display: flex;
		gap: 2rem;
		justify-content: center;
		align-items: center;
		margin: 2rem 0;
	}
	
	.preview-box {
		border: 2px solid #666;
		position: relative;
		background: #f8f9fa;
	}
	
	.height-preview {
		display: flex;
		align-items: flex-end;
		height: 300px;
	}
	
	.height-bar {
		width: 40px;
		background: #666;
		transition: height 0.3s ease;
	}
	
	.dimension-label {
		position: absolute;
		background: rgba(255, 255, 255, 0.8);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.875rem;
	}
	
	.width-label {
		bottom: -25px;
		left: 50%;
		transform: translateX(-50%);
	}
	
	.depth-label {
		right: -45px;
		top: 50%;
		transform: translateY(-50%);
	}
	
	.height-label {
		left: 50px;
		bottom: 0;
	}
	
	.button-group {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}
	
	.submit-btn {
		padding: 0.75rem 2rem;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.3s ease;
	}
	
	.submit-btn:hover {
		background-color: #0056b3;
	}
</style>
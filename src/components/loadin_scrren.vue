	<!-- LoadingScreen.vue -->
	<template>
		<div class="loading-overlay" v-if="show">
		<div class="loading-container">
		<div class="loading-spinner"></div>
		<div class="loading-text">
		{{ currentLoadingStep }}
		<div class="loading-progress">
			{{ Math.round(progress) }}%
		</div>
		</div>
		</div>
		</div>
	</template>
	
	<script>
	export default {
		name: 'LoadingScreen',
		props: {
		show: {
		type: Boolean,
		required: true
		},
		progress: {
		type: Number,
		default: 0
		},
		currentLoadingStep: {
		type: String,
		default: 'Loading...'
		}
		}
	}
	</script>
	
	<style scoped>
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
	}
	
	.loading-container {
		text-align: center;
		color: white;
	}
	
	.loading-spinner {
		width: 50px;
		height: 50px;
		border: 5px solid #f3f3f3;
		border-top: 5px solid #3498db;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 20px;
	}
	
	.loading-text {
		font-size: 1.2rem;
		margin-bottom: 10px;
	}
	
	.loading-progress {
		font-size: 1.5rem;
		font-weight: bold;
		color: #3498db;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	</style>
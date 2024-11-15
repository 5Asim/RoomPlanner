	<template>
		<div class="card" @click="$emit('click', item)">
			<img :src="item.src" :alt="item.name" class="card-image" />
			<div class="card-text">
				<p>{{ item.name }}</p>
			</div>
		</div>
	</template>
	
	<script>
	import { defineComponent } from 'vue';
	
	export default defineComponent({
		name: 'Card_Item',
		props: {
		item: Object,
		},
	});
</script>
	
<style scoped>
	.card {
		display: flex;
		flex-direction: column;
		background-color: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		cursor: pointer;
		transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
	}
	.card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}
	.card-image {
		width: 100%;
		height: 150px;
		object-fit: cover;
	}
	.card-text {
		padding: 4px;
		font-size: 1rem;
		font-weight: 500;
		color: #333;
		text-align: center;
	}
</style>
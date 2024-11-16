<!-- Menu.vue-->
 <template>
	<div class="menu-container">
		<div class="close-button" @click="$emit('close-menu')">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</div>
		<div class="menu">
			<div class="menu-header">
				<h2>Room Planner</h2>
				<div class="icons">
					<div
						class="icon-items"
						@click="selectedTab = 'items'"
					>
						<img src="../assets/objects.png" alt="Objects" width="20" height="20">
						<h3>Items</h3>
					</div>
					<div
						class="icon-dimension"
						@click="selectedTab = 'dimension'"
					>
						<img src="../assets/dimension.png" alt="Dimensions" width="30" height="30">
						<h3>Dimension</h3>
					</div>
				</div>
			</div>

			<!-- Show items-grid or dimension based on selectedTab -->
			<div v-if="selectedTab === 'items'" class="items-grid">
				<Card_Item
					v-for="item in items"
					:key="item.id"
					:item="item"
					@click="$emit('item-clicked', item)"
				/>
			</div>

			
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue';
import table from '@/assets/table.jpeg';
import Card_Item from '@/components/card.vue';
import fan from '@/assets/3d/fan.glb'	
// import monitor from '@/assets/3d/monitor.glb'
import table_3d from '@/assets/3d/table.glb'
import sofa from '@/assets/3d/sofa.glb'
// import door fro/m '@/assets/3d/door.glb'
// import window from '@/assets/3d/window.glb'
// import person from '@/assets/3d/Dayo.glb'

export default defineComponent({
	name: 'Dashboard_Menu',
	components: {
		Card_Item,
	},
	data() {
		return {
			selectedTab: 'items', // Initial tab
			items: [
				{
					id: 1,
					name: 'Fan',
					src: table,
					model: fan
				},
				{
					id: 2,
					name: 'Sofa',
					src: table,
					model: sofa
				},
				{
					id: 3,
					name: 'Person',
					src: table,
					model: table_3d
				},
				{
					id: 4,
					name: 'door',
					src: "@/assets/3d/fan.glb",
					model: fan
				},
				{
					id: 5,
					name: 'window',
					src: "@/assets/3d/f.anglb",
					model: table_3d
				},
			],
			
		};
	},
	
});
</script>

<style scoped>
	.menu-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 35%;
		height: 100%;
		background-color: #ffffff;
		box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
		overflow-y: auto;
		padding: 2.5rem;
		transition: transform 0.3s ease-in-out;
		z-index: 1000;
	}
	
	.menu-container::-webkit-scrollbar {
		width: 8px;
	}
	
	.menu-container::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 4px;
	}
	
	.menu-container::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 4px;
	}
	
	.menu-container::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
	
	.menu {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: 2rem;
	}
	
	.menu-header {
		width: 100%;
		text-align: left;
		margin-bottom: 2rem;
		position: relative;
	}
	
	.menu-header h2 {
		font-size: 2.2rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: #2c3e50;
		letter-spacing: -0.5px;
	}
	
	.menu-header h3 {
		font-size: 1.4rem;
		font-weight: 500;
		color: #666;
		transition: color 0.2s ease;
	}
	
	.close-button {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
		border-radius: 50%;
		background-color: #f8f9fa;
	}
	
	.close-button:hover {
		transform: rotate(90deg);
		background-color: #e9ecef;
	}
	
	.items-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		grid-gap: 1.5rem;
		width: 100%;
		padding: 1rem 0;
	}
	
	.icons {
		display: flex;
		justify-content: flex-start;
		gap: 2rem;
		margin-top: 1.5rem;
		padding: 0.5rem;
		border-bottom: 2px solid #f1f1f1;
	}
	
	.icon-items,
	.icon-dimension {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		padding: 0.8rem 1.2rem;
		border-radius: 12px;
		transition: all 0.3s ease;
		background-color: transparent;
		cursor: pointer;
	}
	
	.icon-items:hover,
	.icon-dimension:hover {
		background-color: #f8f9fa;
		transform: translateY(-2px);
	}
	
	.icon-items.active,
	.icon-dimension.active {
		background-color: #e9ecef;
	}
	
	.icon-items h3,
	.icon-dimension h3 {
		margin: 0;
		font-size: 1.4rem;
		font-weight: 500;
		color: #495057;
	}
	
	/* Responsive Design */
	@media (max-width: 1024px) {
		.menu-container {
		width: 45%;
		}
	}
	
	@media (max-width: 768px) {
		.menu-container {
		width: 100%;
		}
	
		.items-grid {
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		}
	}
	
	/* Animation for menu appearance */
	@keyframes slideIn {
		from {
		transform: translateX(-100%);
		opacity: 0;
		}
		to {
		transform: translateX(0);
		opacity: 1;
		}
	}
	
	.menu-container {
		animation: slideIn 0.3s ease-out;
	}
</style>

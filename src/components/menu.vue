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

			<div v-if="selectedTab === 'dimension'" class="dimension">
				<input type="number" placeholder="Width" />
				<input type="number" placeholder="Height" />
				<input type="number" placeholder="Depth" />
				<button @click="updateDimensions">Done</button>
			</div>
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue';
import table from '@/assets/table.jpeg';
import Card_Item from '@/components/card.vue';
import fan from '@/assets/3d/fan.glb'	
import monitor from '@/assets/3d/monitor.glb'
import table_3d from '@/assets/3d/table.glb'
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
					name: 'Monitor',
					src: table,
					model: monitor
				},
				{
					id: 3,
					name: 'Person',
					src: table,
					model: table_3d
				},
				{
					id: 4,
					name: 'Bed',
					src: "@/assets/3d/fan.glb",
					model: ""
				},
			],
			width:	10, // Default width
			height:	5,
			depth: 10 // Default height
		};
	},
	methods: {
		updateDimensions() {
			this.$emit('update-dimensions', this.width, this.height, this.depth);
		}
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
		background-color: #fff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		overflow-y: auto;
		padding: 2rem;
	}
	
	.menu {
		display: flex;
		flex-direction: column;
		align-items: start;
	}
	
	.menu-header {
		text-align: left;
		margin-bottom: 2rem;
		position: relative;
	}
	
	.menu-header h2 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}
	
	.menu-header h3 {
		font-size: 1.5rem;
		font-weight: 500;
		color: #666;
		cursor: pointer;
	}
	
	.icon-items, .icon-dimension {
		display: flex;
		align-items: center;
		cursor: pointer;
		margin-right: 1rem;
	}
	
	.close-button {
		position: absolute;
		top: 0;
		right: 0;
		width: 32px;
		height: 32px;
		display: flex;
		cursor: pointer;
		transition: transform 0.25s ease-in-out;
	}
	
	.close-button:hover {
		transform: scale(1.2);
	}
	
	.items-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		grid-gap: 1.5rem;
		width: 100%;
	}
	
	.dimension {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		padding: 1.5rem;
		background-color: #f9f9f9;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
	
	.dimension input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}
	
	.dimension button {
		align-self: flex-start;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		background-color: #4CAF50;
		color: #fff;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.3s;
	}
	
	.dimension button:hover {
		background-color: #45a049;
	}
	
	.icons {
		display: flex;
		justify-content: flex-start;
		gap: 2rem;
		margin-top: 1rem;
	}
	
	.icon-items,
	.icon-dimension {
		display: flex;
		align-items: center;
		cursor: pointer;
		gap: 0.5rem;
		color: #333;
		padding: 0.5rem;
		transition: background-color 0.3s, color 0.3s;
		border-radius: 8px;
	}
	
	.icon-items:hover,
	.icon-dimension:hover {
		background-color: #e0e0e0;
		color: #000;
	}
	
	.icon-items h3,
	.icon-dimension h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 500;
	}
	
</style>

<template>
	<div>
		<!-- Loading screen -->
		<div v-if="isLoading" class="loading-overlay">
		<div class="loading-spinner"></div>
		</div>
	
		<!-- Initial dimensions form overlay -->
		<div v-if="!isRoomInitialized" class="dimensions-overlay">
		<div class="dimensions-form">
		<h2 class="form-title">Enter Room Dimensions</h2>
		<div class="input-group">
			<label>Width (meters):</label>
			<input type="number" v-model="roomWidth" min="1" step="0.1">
		</div>
		<div class="input-group">
			<label>Height (meters):</label>
			<input type="number" v-model="roomHeight" min="1" step="0.1">
		</div>
		<div class="input-group">
			<label>Depth (meters):</label>
			<input type="number" v-model="roomDepth" min="1" step="0.1">
		</div>
		<button @click="initializeRoom" :disabled="!isValidDimensions">Create Room</button>
		</div>
		</div>
	
		<!-- Main room view -->
		<div v-show="isRoomInitialized" ref="sceneContainer" class="scene-container">
			<Floating_menu
			@item-selected="handleModelSelect"
			/>
		<div class="control-panel">
			<button @click="moveModelLeft">
				<img src="../assets/left.png" alt="left" width="20" height="20">
				
			</button>
			<button @click="moveModelRight">
				<img src="../assets/right.png" alt="right" width="20" height="20">
			</button>
			<button @click="moveModelForward">
				<img src="../assets/up.png" alt="up" width="20" height="20">
			</button>
			<button @click="moveModelBackward">
				<img src="../assets/down.png" alt="down" width="2	0" height="20">
			</button>	
			
		</div>       
		</div>
	</div>
</template>
      
<script>
	import { defineComponent, onMounted, ref, computed } from 'vue';
	import * as Three from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
	import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
	import floor from "@/assets/wooden_floor.jpg";
	import wall from "@/assets/wall_texture.jpg";
	// import fan from '@/assets/3d/fan.glb';
	import Floating_menu from './floating_menu.vue';


	
	export default defineComponent({
		name: 'RoomPlanner',
		components: { Floating_menu
		},
	
		setup() {
		const sceneContainer = ref(null);
		const isRoomInitialized = ref(false);
		const isLoading = ref(false);
		const roomWidth = ref(10);
		const roomHeight = ref(5);
		const roomDepth = ref(10);
		const modelPosition = ref({ x: 0, y: 0, z: 0 });
		const currentModelPath = ref(null);

	
		const isValidDimensions = computed(() => {
		return roomWidth.value > 0 && 
			roomHeight.value > 0 && 
			roomDepth.value > 0;
		});
	
		let scene, camera, renderer, controls;
		let textureLoader;
		let textures = {
		floor: null,
		wall: null,
		ceiling: null
		};
		let model = null;
		let roomObjects = [];
		let currentModel = null;


		const handleModelSelect = (modelPath) => {
		// Remove any existing model first
		if (currentModel) {
			scene.remove(currentModel);
			currentModel = null;
		}
		
		currentModelPath.value = modelPath;
		if (scene && isRoomInitialized.value) {
			loadModel(modelPath);
		}
		};
	
		const loadTextures = () => {
		textureLoader = new Three.TextureLoader();
	
		const loadTexture = (url) => {
			const texture = textureLoader.load(url);
			texture.wrapS = texture.wrapT = Three.RepeatWrapping;
			texture.magFilter = Three.LinearFilter;
			texture.minFilter = Three.LinearMipmapLinearFilter;
			return texture;
			};
		
			textures.floor = loadTexture(floor);
			textures.wall = loadTexture(wall);
			textures.ceiling = loadTexture('/ceiling-texture.jpg');
		};
	
		const createRoom = () => {
			if (currentModel) {
				scene.remove(currentModel);
				currentModel = null;
			}
			roomObjects.forEach(obj => scene.remove(obj));
			roomObjects = [];
		
			textures.floor.repeat.set(roomWidth.value / 10, roomDepth.value / 10);
			textures.wall.repeat.set(roomWidth.value / 10, roomHeight.value / 10);
		
			// Floor
			const floorGeometry = new Three.PlaneGeometry(roomWidth.value, roomDepth.value);
			const floorMaterial = new Three.MeshStandardMaterial({
			map: textures.floor,
			roughness: 0.8,
			metalness: 0.2,
			});
			const floor = new Three.Mesh(floorGeometry, floorMaterial);
			floor.rotation.x = -Math.PI / 2;
			scene.add(floor);
			roomObjects.push(floor);
		
			// Walls
			const wallMaterial = new Three.MeshStandardMaterial({
			map: textures.wall,
			roughness: 0.9,
			metalness: 0.1,
			});
			const wallGeometry = new Three.PlaneGeometry(roomWidth.value, roomHeight.value);
		
			// Back wall
			const backWall = new Three.Mesh(wallGeometry, wallMaterial);
			backWall.position.set(0, roomHeight.value / 2, -roomDepth.value / 2);
			backWall.receiveShadow = true;
			scene.add(backWall);
			roomObjects.push(backWall);
		
			// Front wall
			const frontWall = new Three.Mesh(wallGeometry, wallMaterial);
			frontWall.position.set(0, roomHeight.value / 2, roomDepth.value / 2);
			frontWall.rotation.y = Math.PI;
			frontWall.receiveShadow = true;
			scene.add(frontWall);
			roomObjects.push(frontWall);
		
			// Left wall
			const leftWall = new Three.Mesh(wallGeometry, wallMaterial);
			leftWall.position.set(-roomWidth.value / 2, roomHeight.value / 2, 0);
			leftWall.rotation.y = Math.PI / 2;
			leftWall.receiveShadow = true;
			scene.add(leftWall);
			roomObjects.push(leftWall);
		
			// Right wall
			const rightWall = new Three.Mesh(wallGeometry, wallMaterial);
			rightWall.position.set(roomWidth.value / 2, roomHeight.value / 2, 0);
			rightWall.rotation.y = -Math.PI / 2;
			rightWall.receiveShadow = true;
			scene.add(rightWall);
			roomObjects.push(rightWall);
		
			// Ceiling
			const ceilingGeometry = new Three.PlaneGeometry(roomWidth.value, roomDepth.value);
			const ceilingMaterial = new Three.MeshStandardMaterial({
			map: textures.ceiling,
			roughness: 0.9,
			metalness: 0.1,
			});
			const ceiling = new Three.Mesh(ceilingGeometry, ceilingMaterial);
			ceiling.position.set(0, roomHeight.value, 0);
			ceiling.rotation.x = Math.PI / 2;
			ceiling.receiveShadow = true;
			scene.add(ceiling);
			roomObjects.push(ceiling);
		
			
		};
	
		const addLights = () => {
			const ambientLight = new Three.AmbientLight(0xffffff, 0.5);
			scene.add(ambientLight);
		
			const mainLight = new Three.DirectionalLight(0xffffff, 0.8);
			mainLight.position.set(10, 10, 10);
			mainLight.castShadow = true;
			mainLight.shadow.mapSize.width = 2048;
			mainLight.shadow.mapSize.height = 2048;
			scene.add(mainLight);
		
			const pointLight1 = new Three.PointLight(0xffffff, 0.5);
			pointLight1.position.set(0, roomHeight.value - 0.5, 0);
			pointLight1.castShadow = true;
			scene.add(pointLight1);
		
			const windowLight = new Three.DirectionalLight(0x9eb7ff, 0.4);
			windowLight.position.set(-roomWidth.value / 2, roomHeight.value / 2, 0);
			scene.add(windowLight);
		};
	
		const loadModel = (modelPath) => {
			if (!modelPath?.model) return;
			isLoading.value = true;

			if (model) {
				scene.remove(model);
				model = null;
			}
			
			const dracoLoader = new DRACOLoader();
			dracoLoader.setDecoderPath('/draco/');
			dracoLoader.setDecoderConfig({ type: 'js' });
		
			const loader = new GLTFLoader();
			loader.setDRACOLoader(dracoLoader);
			loader.load(
			modelPath.model,
			(gltf) => {
				if (currentModel) {
			scene.remove(currentModel);
			}

			// Set up the new model
			currentModel = gltf.scene;
			currentModel.traverse((child) => {
			if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
			}
			});

			const scaleFactor = roomHeight.value / 2;
			currentModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

			// Reset position
			modelPosition.value = { x: 0, y: 0, z: 0 };
			currentModel.position.set(0, 0, 0);

			// Add to scene
			scene.add(currentModel);
			isLoading.value = false;
			},
			undefined,
			(error) => {
			console.error('Error loading model:', error);
			isLoading.value = false;
			}
		);
		};

		const initializeRoom = () => {
			if (!isValidDimensions.value) return;
			isRoomInitialized.value = true;
			isLoading.value = true; // Show loading screen
		
			// Wait for next tick to ensure sceneContainer is mounted
			setTimeout(() => {
			initScene();
			if (currentModelPath.value) {
			loadModel(currentModelPath.value);
			} else {
			isLoading.value = false;
			}
		}, 0);
		};
	
		const animate = () => {
			requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		};
	
		const initScene = () => {
			if (!sceneContainer.value) return;
		
			scene = new Three.Scene();
			scene.background = new Three.Color(0xf0f0f0);
		
			camera = new Three.PerspectiveCamera(
			75,
			sceneContainer.value.clientWidth / sceneContainer.value.clientHeight,
			0.1,
			2000
			);
		
			renderer = new Three.WebGLRenderer();
			renderer.setSize(sceneContainer.value.clientWidth, sceneContainer.value.clientHeight);
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.type = Three.PCFSoftShadowMap;
			sceneContainer.value.appendChild(renderer.domElement);
		
			camera.position.set(0, roomHeight.value * 2, roomWidth.value * 2);
		
			controls = new OrbitControls(camera, renderer.domElement);
			controls.enableDamping = true;
			controls.dampingFactor = 0.25;
			controls.screenSpacePanning = false;
			controls.maxPolarAngle = Math.PI / 2;
		
			loadTextures();
			createRoom();
			addLights();
		
			animate();
		};
	
		// Handle window resize
		onMounted(() => {
			window.addEventListener('resize', () => {
			if (camera && renderer && sceneContainer.value) {
				camera.aspect = sceneContainer.value.clientWidth / sceneContainer.value.clientHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(sceneContainer.value.clientWidth, sceneContainer.value.clientHeight);
			}
			});
		});
		const moveModel = (direction) => {
			if (!currentModel) return;

			// Adjust the model's position based on the direction
			switch (direction) {
				case 'left':
				modelPosition.value.x -= 1;
				break;
				case 'right':
				modelPosition.value.x += 1;
				break;
				case 'forward':
				modelPosition.value.z -= 1;
				break;
				case 'backward':
				modelPosition.value.z += 1;
				break;
			}

			// Update model position in the scene
			if (currentModel) {
			currentModel.position.set(
			modelPosition.value.x,
			modelPosition.value.y,
			modelPosition.value.z
			);
		}
			};
			const moveModelLeft = () => moveModel('left');
			const moveModelRight = () => moveModel('right');
			const moveModelForward = () => moveModel('forward');
			const moveModelBackward = () => moveModel('backward');

	
		return {
			sceneContainer,
			isRoomInitialized,
			isLoading,
			roomWidth,
			roomHeight,
			roomDepth,
			isValidDimensions,
			initializeRoom,
			moveModelLeft,
			moveModelRight,
			moveModelForward,
			moveModelBackward,
			handleModelSelect
		};
		},
	});
</script>
      
<style>
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}
	
	.loading-spinner {
		border: 16px solid #f3f3f3;
		border-top: 16px solid #3498db;
		border-radius: 50%;
		width: 120px;
		height: 120px;
		animation: spin 2s linear infinite;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.dimensions-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}
	
	.dimensions-form {
		background-color: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
	}
	
	.form-title {
		margin: 0 0 1.5rem 0;
		text-align: center;
		color: #333;
	}
	
	.input-group {
		margin-bottom: 1rem;
	}
	
	.input-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #666;
	}
	
	.input-group input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}
	
		
	.dimensions-form button {
		width: 100%;
		padding: 0.75rem;
		background-color: #007bff;
		color: white;
		border: none;
	}
	
	.scene-container {
		width: 100%;
		height: 100vh;
		overflow: hidden;
		position: relative;
		background-color: #f5f5f5; /* Light background color */
	}
	
	html, body {
		margin: 0;
		padding: 0;
		height: 100%;
		overflow: hidden; /* Prevent scrolling */
	}
	
	.control-panel {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 5px;
	position: absolute;
	top: 16%;
	right: 2% ;
	transform: translate(-50%, -50%);
	z-index: 10;
	}

	.control-panel button {
	background-color: #333;
	border: 2px solid #fff;
	border-radius: 50%;
	width: 40px;
	height: 40px;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	transition: background-color 0.3s, transform 0.2s;
	}

	.control-panel button img {
	width: 20px;
	height: 20px;
	}

	.control-panel button:hover {
	background-color: #555;
	transform: scale(1.1);
	}

	.control-panel button:active {
	background-color: #777;
	transform: scale(1.05);
	}

	.control-panel .direction-row {
	display: flex;
	justify-content: center;
	gap: 10px;
	}

	.control-panel .direction-row:nth-child(2) {
	margin-top: 10px;
	}

	/* Adding an extra gap for the middle button */
	.control-panel .direction-row > button:first-child {
	margin-bottom: 10px;
	}


</style>
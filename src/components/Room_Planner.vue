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
			<div>
				<button @click="moveModelLeft">
					<img src="../assets/left.png" alt="left" width="20" height="20">
					
				</button>
			</div>
			
			<div class="ws">
				<button @click="moveModelForward">
					<img src="../assets/up.png" alt="up" width="20" height="20">
				</button>
				<button @click="moveModelBackward">
					<img src="../assets/down.png" alt="down" width="2	0" height="20">
				</button>
			</div>


			<div>
			<button @click="moveModelRight">
				<img src="../assets/right.png" alt="right" width="20" height="20">
			</button>
			</div>
			
			<button @click="rotateModelLeft">
				<img src="../assets/rotate-left.png" alt="rotate left" width="20" height="20">
			</button>
			<button @click="rotateModelRight">
				<img src="../assets/rotate-right.png" alt="rotate right" width="20" height="20">
			</button>  
			<button v-if="selectedModelId" @click="switchWall(selectedModelId)">
				<img src="../assets/switch.png" alt="switch" width="20" height="20">
			</button>
		</div>  
		<!-- Add this to your template -->
		<div class="placed-models-list">
			<div v-for="model in placedModels" 
			:key="model.id" 
			:class="['model-item', { selected: selectedModelId === model.id }]"
			@click="selectModel(model.id)">
			<span>{{model.name}}</span>
			<button @click="removeModel(model.id)">Remove</button>

			</div>
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
	import celling from "@/assets/celling.jpg";
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
		const currentModelPath = ref(null);
	
		const isValidDimensions = computed(() => {
		return roomWidth.value > 5 && 
			roomHeight.value > 5 && 
			roomDepth.value > 5;
		});
	
		let scene, camera, renderer, controls;
		let textureLoader;
		let textures = {
		floor: null,
		wall: null,
		ceiling: null
		};
		
		let roomObjects = [];
		
		const placedModels = ref([]);
		const selectedModelId = ref(null);
		const handleModelSelect = (modelPath) => {
		if (isLoading.value) return;
		if (!modelPath?.model) return;
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
			textures.ceiling = loadTexture(celling);
		};
	
		const createRoom = () => {

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

			const dracoLoader = new DRACOLoader();
			dracoLoader.setDecoderPath('/draco/');
			dracoLoader.setDecoderConfig({ type: 'js' });

			const loader = new GLTFLoader();
			loader.setDRACOLoader(dracoLoader);
			loader.load(
			modelPath.model,
			(gltf) => {
			const newModel = gltf.scene;
			newModel.traverse((child) => {
				if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
				}
			});

			const scaleFactor = roomHeight.value / 2;
			newModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

			// Determine initial position and rotation based on model type
			let initialPosition = { x: 0, y: 0, z: 0 };
			let initialRotation = { y: 0 };
			let wall = null;

			if (modelPath.name.toLowerCase().includes('door')) {
				// Place door on front wall by default
				initialPosition = {
				x: 0,
				y: 0,
				z: roomDepth.value / 2
				};
				initialRotation = { y: Math.PI };
				wall = 'front';
			} else if (modelPath.name.toLowerCase().includes('window')) {
				// Place window on left wall by default
				initialPosition = {
				x: -roomWidth.value / 2,
				y: roomHeight.value / 2,
				z: 0
				};
				initialRotation = { y: Math.PI / 2 };
				wall = 'left';
			}

			// Set initial position and rotation
			newModel.position.set(
				initialPosition.x,
				initialPosition.y,
				initialPosition.z
			);
			newModel.rotation.y = initialRotation.y;

			// Create a unique model entry
			const modelEntry = {
				id: Date.now(),
				model: newModel,
				name: modelPath.name,
				position: initialPosition,
				rotation: initialRotation,
				type: modelPath.name.toLowerCase().includes('door') ? 'door' : 
				modelPath.name.toLowerCase().includes('window') ? 'window' : 
				'furniture',
				wall: wall
			};

			// Add to placedModels array
			placedModels.value.push(modelEntry);
			
			// Set as selected model
			selectedModelId.value = modelEntry.id;
			
			// Add to scene
			scene.add(newModel);
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
		const selectModel = (modelId) => {
		selectedModelId.value = modelId;
		};

		const removeModel = (modelId) => {
		try {
		// Find the model entry
		const modelEntry = placedModels.value.find(model => model.id === modelId);
		
		if (modelEntry) {
		// Remove from Three.js scene
		if (modelEntry.model) {
			// Remove all children and dispose of resources
			modelEntry.model.traverse((child) => {
			if (child.isMesh) {
			// Dispose of geometry
			if (child.geometry) {
			child.geometry.dispose();
			}
			
			// Dispose of materials
			if (child.material) {
			if (Array.isArray(child.material)) {
				child.material.forEach(material => {
				if (material.map) material.map.dispose();
				material.dispose();
				});
			} else {
				if (child.material.map) child.material.map.dispose();
				child.material.dispose();
			}
			}
			
			// Remove from parent
			if (child.parent) {
			child.parent.remove(child);
			}
			}
			});

			// Remove the model from the scene
			scene.remove(modelEntry.model);
			
			// Force Three.js to update the scene
			renderer.renderLists.dispose();
		}

		// Remove from placedModels array
		placedModels.value = placedModels.value.filter(model => model.id !== modelId);

		// Clear selection if this was the selected model
		if (selectedModelId.value === modelId) {
			selectedModelId.value = null;
		}

		// Force a scene update
		if (renderer) {
			renderer.render(scene, camera);
		}
		}
		} catch (error) {
		console.error('Error removing model:', error);
		}
		};
		const moveModel = (direction) => {
			if (!selectedModelId.value) return;

			const modelEntry = placedModels.value.find(
			entry => entry.id === selectedModelId.value
			);
			if (!modelEntry) return;

			const step = 0.5;
			const previousPosition = { ...modelEntry.position };

			// Handle movement based on model type and wall
			if (modelEntry.type === 'door' || modelEntry.type === 'window') {
			// Constrain movement based on wall placement
			switch (modelEntry.wall) {
			case 'front':
				// Only allow horizontal movement along front wall
				if (direction === 'left') modelEntry.position.x -= step;
				if (direction === 'right') modelEntry.position.x += step;
				// Keep fixed Z position
				modelEntry.position.z = roomDepth.value / 2;
				break;
			
			case 'back':
				// Only allow horizontal movement along back wall
				if (direction === 'left') modelEntry.position.x -= step;
				if (direction === 'right') modelEntry.position.x += step;
				// Keep fixed Z position
				modelEntry.position.z = -roomDepth.value / 2;
				break;
			
			case 'left':
				// Only allow forward/backward movement along left wall
				if (direction === 'forward') modelEntry.position.z -= step;
				if (direction === 'backward') modelEntry.position.z += step;
				// Keep fixed X position
				modelEntry.position.x = -roomWidth.value / 2;
				break;
			
			case 'right':
				// Only allow forward/backward movement along right wall
				if (direction === 'forward') modelEntry.position.z -= step;
				if (direction === 'backward') modelEntry.position.z += step;
				// Keep fixed X position
				modelEntry.position.x = roomWidth.value / 2;
				break;
			}

			// Maintain fixed height for windows and doors
			if (modelEntry.type === 'window') {
			modelEntry.position.y = roomHeight.value / 2; // Windows at mid-height
			} else if (modelEntry.type === 'door') {
			modelEntry.position.y = 0; // Doors at floor level
			}

			} else {
			// Normal movement for furniture
			switch (direction) {
			case 'left':
				modelEntry.position.x -= step;
				break;
			case 'right':
				modelEntry.position.x += step;
				break;
			case 'forward':
				modelEntry.position.z -= step;
				break;
			case 'backward':
				modelEntry.position.z += step;
				break;
			}
			}

			// Check boundaries
			const boundaryOffset = 1;
			let isOutOfBounds = false;

			if (modelEntry.type === 'door' || modelEntry.type === 'window') {
			const wallWidth = modelEntry.wall === 'front' || modelEntry.wall === 'back' 
			? roomWidth.value 
			: roomDepth.value;
			
			// Check if the model exceeds the wall boundaries
			switch (modelEntry.wall) {
			case 'front':
			case 'back':
				isOutOfBounds = Math.abs(modelEntry.position.x) > (wallWidth/2 - boundaryOffset);
				break;
			case 'left':
			case 'right':
				isOutOfBounds = Math.abs(modelEntry.position.z) > (wallWidth/2 - boundaryOffset);
				break;
			}
			} else {
			// Boundary check for furniture
			isOutOfBounds = 
			Math.abs(modelEntry.position.x) > (roomWidth.value/2 - boundaryOffset) ||
			Math.abs(modelEntry.position.z) > (roomDepth.value/2 - boundaryOffset);
			}

			// Revert position if out of bounds
			if (isOutOfBounds) {
			modelEntry.position = previousPosition;
			return;
			}

			// Update model position in the scene
			modelEntry.model.position.set(
			modelEntry.position.x,
			modelEntry.position.y,
			modelEntry.position.z
			);
			};
			const moveModelLeft = () => moveModel('left');
			const moveModelRight = () => moveModel('right');
			const moveModelForward = () => moveModel('forward');
			const moveModelBackward = () => moveModel('backward');
			
			const rotateModel = (direction) => {
				if (!selectedModelId.value) return;

				const modelEntry = placedModels.value.find(
				entry => entry.id === selectedModelId.value
				);
				if (!modelEntry) return;

				const rotationStep = Math.PI / 8; // 22.5 degrees

				// Store the current rotation
				if (!modelEntry.rotation) {
				modelEntry.rotation = { y: 0 };
				}

				// Update rotation
				if (direction === 'left') {
				modelEntry.rotation.y += rotationStep;
				} else if (direction === 'right') {
				modelEntry.rotation.y -= rotationStep;
				}

				// Apply rotation to the model
				modelEntry.model.rotation.y = modelEntry.rotation.y;
			};

			const rotateModelLeft = () => rotateModel('left');
			const rotateModelRight = () => rotateModel('right')
			;
			const switchWall = (modelId) => {
				const modelEntry = placedModels.value.find(entry => entry.id === modelId);
				if (!modelEntry || (modelEntry.type !== 'door' && modelEntry.type !== 'window')) return;
				const wallSequence = ['front', 'right', 'back', 'left'];
				const currentIndex = wallSequence.indexOf(modelEntry.wall);
				const nextWall = wallSequence[(currentIndex + 1) % wallSequence.length];

				modelEntry.wall = nextWall;
				
				// Set position based on new wall
				switch (nextWall) {
				case 'front':
				modelEntry.position.x = 0;
				modelEntry.position.z = roomDepth.value / 2;
				modelEntry.rotation.y = Math.PI;
				break;
				case 'back':
				modelEntry.position.x = 0;
				modelEntry.position.z = -roomDepth.value / 2;
				modelEntry.rotation.y = 0;
				break;
				case 'left':
				modelEntry.position.x = -roomWidth.value / 2;
				modelEntry.position.z = 0;
				modelEntry.rotation.y = Math.PI / 2;
				break;
				case 'right':
				modelEntry.position.x = roomWidth.value / 2;
				modelEntry.position.z = 0;
				modelEntry.rotation.y = -Math.PI / 2;
				break;
				}

				// Update model position and rotation in the scene
				modelEntry.model.position.set(
				modelEntry.position.x,
				modelEntry.position.y,
				modelEntry.position.z
				);
				modelEntry.model.rotation.y = modelEntry.rotation.y;
				};

			
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
			handleModelSelect,
			selectModel,
			removeModel,
			placedModels,
			selectedModelId,
			rotateModelLeft,
			rotateModelRight,
			switchWall
		};
		},
	});
</script>
      
<style>
	
</style>
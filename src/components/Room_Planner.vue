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
			<Floating_menu @item-selected="handleModelSelect"/>
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
		
		<div class="camera-panel">
			<button @click="takeScreenshot">
				
				<img src="../assets//camera.png" alt="Screenshot" width="20" height="20"/>
			</button>
			<button @click="cycleView">
				<img src="../assets//eye.png" alt="Change View" width="20" height="20"/>
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
	import wall from "@/assets/blue_wall.jpg";
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
			let originalCameraPosition = null;
			let originalControlsState = null;
			const isValidDimensions = computed(() => {
			return roomWidth.value > 4 && 
				roomHeight.value > 4 && 
				roomDepth.value > 4;
			});
		
			let scene, camera, renderer, controls;
			let textureLoader;
			let textures = {
			floor: null,
			wall: null,
			ceiling: null,
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

			const SCALE_FACTOR = 15; // 1 meter = 10 Three.js units

			const convertToSceneUnits = (meters) => meters * SCALE_FACTOR;
			// const convertToRealUnits = (sceneUnits) => sceneUnits / SCALE_FACTOR;
			//Camera View
			const currentViewIndex = ref(0);
			const views = computed(() => {
				const sceneWidth = convertToSceneUnits(roomWidth.value);
				const sceneHeight = convertToSceneUnits(roomHeight.value);
				const sceneDepth = convertToSceneUnits(roomDepth.value);
				
				// Calculate maximum dimension for scaling
				const maxDimension = Math.max(sceneWidth, sceneHeight, sceneDepth);
				
				return [
					{
					// Top view - looking down from above
					position: new Three.Vector3(
					0, 
					maxDimension * 1.2, // Reduced height multiplier
					0
					),
					lookAt: new Three.Vector3(0, 0, 0)
					},
					{
					// Corner view - isometric perspective
					position: new Three.Vector3(
					sceneWidth * 0.8,  // Reduced from 1.5
					sceneHeight * 0.8, // Reduced from 1.5
					sceneDepth * 0.8   // Reduced from 1.5
					),
					lookAt: new Three.Vector3(0, 0, 0)
					},
					{
					// Side view - from the right
					position: new Three.Vector3(
					sceneWidth * 1.2,  // Reduced from 2
					sceneHeight * 0.5, // Keep at half height
					0
					),
					lookAt: new Three.Vector3(0, sceneHeight * 0.3, 0)
					},
					{
					// Front view - from a slight angle
					position: new Three.Vector3(
					sceneWidth * 0.3,  // Slight angle
					sceneHeight * 0.8, // Reduced from 2.5
					sceneDepth * 1.2   // Reduced from 2.5
					),
					lookAt: new Three.Vector3(0, sceneHeight * 0.3, 0)
					}
				];
				});

				const cycleView = () => {
					if (!camera || !controls) return;
					
					// Update view index
					currentViewIndex.value = (currentViewIndex.value + 1) % views.value.length;
					const view = views.value[currentViewIndex.value];
					
					// Store target position and lookAt for animation
					const targetPosition = view.position;
					const targetLookAt = view.lookAt;
					
					// Temporarily disable controls
					controls.enabled = false;
					
					// Smoothly animate to new position
					const startPosition = camera.position.clone();
					const startLookAt = controls.target.clone();
					const duration = 1000; // Slightly faster animation
					const startTime = Date.now();
					
					function animate() {
						const elapsed = Date.now() - startTime;
						const progress = Math.min(elapsed / duration, 1);
						
						// Use easeOutCubic for smoother animation
						const easeProgress = 1 - Math.pow(1 - progress, 3);
						
						// Interpolate position
						camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
						
						// Interpolate lookAt point
						controls.target.lerpVectors(startLookAt, targetLookAt, easeProgress);
						controls.update();
						
						if (progress < 1) {
						requestAnimationFrame(animate);
						} else {
						// Re-enable controls after animation
						controls.enabled = true;
						}
					}
					
					animate();
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
			// textures.sides = loadTexture()

		};
	
		const createRoom = () => {

			roomObjects.forEach(obj => scene.remove(obj));
			roomObjects = [];
			const TEXTURE_SCALE = 2; 

			const sceneWidth = convertToSceneUnits(roomWidth.value);
			const sceneHeight = convertToSceneUnits(roomHeight.value);
			const sceneDepth = convertToSceneUnits(roomDepth.value);
		
			textures.floor.repeat.set(roomWidth.value / TEXTURE_SCALE, roomDepth.value / TEXTURE_SCALE);
			textures.wall.repeat.set(roomWidth.value / TEXTURE_SCALE, roomHeight.value / TEXTURE_SCALE);
			textures.ceiling.repeat.set(roomWidth.value / TEXTURE_SCALE, roomDepth.value / TEXTURE_SCALE);
		
			// Floor
			const floorGeometry = new Three.PlaneGeometry(sceneWidth, sceneDepth);
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
			// const wallGeometry = new Three.PlaneGeometry(roomWidth.value, roomHeight.value);
		
			// Back wall
			const backWallGeometry = new Three.PlaneGeometry(sceneWidth, sceneHeight);
			const backWall = new Three.Mesh(backWallGeometry, wallMaterial);
			backWall.position.set(0, sceneHeight / 2, -sceneDepth / 2);
			backWall.receiveShadow = false;
			scene.add(backWall);
			roomObjects.push(backWall);
		
			// Front wall
			const frontWall = new Three.Mesh(backWallGeometry, wallMaterial);
			frontWall.position.set(0, sceneHeight / 2, sceneDepth / 2);
			frontWall.rotation.y = Math.PI;
			frontWall.receiveShadow = false;
			scene.add(frontWall);
			roomObjects.push(frontWall);

			const sideWallGeometry = new Three.PlaneGeometry(sceneDepth, sceneHeight);
			
			// Left wall
			const leftWall = new Three.Mesh(sideWallGeometry, wallMaterial);
			leftWall.position.set(-sceneWidth / 2, sceneHeight / 2, 0);
			leftWall.rotation.y = Math.PI / 2;
			leftWall.receiveShadow = false;
			scene.add(leftWall);
			roomObjects.push(leftWall);

			
		
			// Right wall
			const rightWall = new Three.Mesh(sideWallGeometry, wallMaterial);
			rightWall.position.set(sceneWidth / 2, sceneHeight / 2, 0);
			rightWall.rotation.y = -Math.PI / 2;
			rightWall.receiveShadow = false;
			scene.add(rightWall);
			roomObjects.push(rightWall);
		
			
			// Ceiling
			const ceilingGeometry = new Three.PlaneGeometry(sceneWidth, sceneDepth);
			const ceilingMaterial = new Three.MeshStandardMaterial({
			map: textures.ceiling,
			roughness: 0.9,
			metalness: 0.1,
			});
			const ceiling = new Three.Mesh(ceilingGeometry, ceilingMaterial);
			ceiling.position.set(0, sceneHeight, 0);
			ceiling.rotation.x = Math.PI / 2;
			ceiling.receiveShadow = true;
			scene.add(ceiling);
			roomObjects.push(ceiling);
		
			
		};
		const getModelHeight = (model) => {
		const boundingBox = new Three.Box3().setFromObject(model);
		return boundingBox.max.y - boundingBox.min.y;
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

				const modelHeight = getModelHeight(newModel);
				const targetHeight = convertToSceneUnits(roomHeight.value / 2.5);
				let scaleFactor;
				if (modelPath.name.toLowerCase().includes('bottle')) {
					// Apply a much smaller scale for bottles - adjust this value as needed
					scaleFactor = (targetHeight / modelHeight) * 0.15; // Using 15% of normal scale
				} else {
					scaleFactor = targetHeight / modelHeight;
				}
				newModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

				const sceneDepth = convertToSceneUnits(roomDepth.value);
				const sceneWidth = convertToSceneUnits(roomWidth.value);
				const sceneHeight = convertToSceneUnits(roomHeight.value);


				// Determine initial position and rotation based on model type
				let initialPosition = { x: 0, y: 0, z: 0 };
				let initialRotation = { y: 0 };
				let wall = null;

				if (modelPath.name.toLowerCase().includes('door')) {
					initialPosition = {
						x: 0,
						y: 0,
						z: sceneDepth / 2
					};
					initialRotation = { y: Math.PI };
					wall = 'front';
				} else if (modelPath.name.toLowerCase().includes('window')) {
					initialPosition = {
					x: -sceneWidth / 2,
					y: sceneHeight / 2,
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
			isLoading.value = true; // Show loa	ding screen
		
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

		const sceneWidth = convertToSceneUnits(roomWidth.value);
		const sceneHeight = convertToSceneUnits(roomHeight.value);
		const sceneDepth = convertToSceneUnits(roomDepth.value);
		
		// Calculate room diagonal for better camera positioning
		const roomDiagonal = Math.sqrt(
			Math.pow(sceneWidth, 2) + 
			Math.pow(sceneHeight, 2) +
			Math.pow(sceneDepth, 2)
		);

		camera = new Three.PerspectiveCamera(
			45, // Reduced FOV for less distortion
			sceneContainer.value.clientWidth / sceneContainer.value.clientHeight,
			0.1,
			3000
		);
		
		// Set initial camera position farther back and higher up
		camera.position.set(
			sceneWidth * 1.2,    // Moved further to the side
			sceneHeight * 1.5,   // Positioned higher
			sceneDepth * 1.2     // Moved further back
		);

		renderer = new Three.WebGLRenderer({ antialias: true });
		renderer.setSize(sceneContainer.value.clientWidth, sceneContainer.value.clientHeight);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = Three.PCFSoftShadowMap;
		sceneContainer.value.appendChild(renderer.domElement);
		
		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.screenSpacePanning = false;
		controls.maxPolarAngle = Math.PI * 0.85;

		// Adjust control target to point slightly lower in the room
		controls.target.set(0, sceneHeight * 0.25, 0);
		
		// Update camera constraints
		controls.minDistance = roomDiagonal * 0.4;  // Increased minimum distance
		controls.maxDistance = roomDiagonal * 2.0;  // Increased maximum distance
		
		controls.update();
		
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



		// Modified moveModel function
		const moveModel = (direction) => {
			if (!selectedModelId.value) return;

			const modelEntry = placedModels.value.find(
				entry => entry.id === selectedModelId.value
			);
			if (!modelEntry) return;

			const MOVEMENT_STEP = convertToSceneUnits(0.25);
			const BOUNDARY_OFFSET = convertToSceneUnits(0.5);

			const newPosition = {
				x: modelEntry.model.position.x,
				y: modelEntry.model.position.y,
				z: modelEntry.model.position.z
			};

			if (modelEntry.type === 'door' || modelEntry.type === 'window') {
				const sceneWidth = convertToSceneUnits(roomWidth.value);
				const sceneDepth = convertToSceneUnits(roomDepth.value);
				const sceneHeight = convertToSceneUnits(roomHeight.value);

				switch (modelEntry.wall) {
				case 'front':
				case 'back':
					if (direction === 'left') newPosition.x -= MOVEMENT_STEP;
					if (direction === 'right') newPosition.x += MOVEMENT_STEP;
					newPosition.x = Math.max(-sceneWidth/2 + BOUNDARY_OFFSET, 
					Math.min(sceneWidth/2 - BOUNDARY_OFFSET, newPosition.x));
					newPosition.z = modelEntry.wall === 'front' ? sceneDepth/2 : -sceneDepth/2;
					break;

				case 'left':
				case 'right':
					if (direction === 'forward') newPosition.z -= MOVEMENT_STEP;
					if (direction === 'backward') newPosition.z += MOVEMENT_STEP;
					newPosition.z = Math.max(-sceneDepth/2 + BOUNDARY_OFFSET, 
					Math.min(sceneDepth/2 - BOUNDARY_OFFSET, newPosition.z));
					newPosition.x = modelEntry.wall === 'right' ? sceneWidth/2 : -sceneWidth/2;
					break;
				}

				// Maintain the height for wall-mounted objects
				newPosition.y = modelEntry.type === 'window' ? sceneHeight/2 : 0;
			} else {
				// Regular furniture movement logic
				switch (direction) {
				case 'left':
					newPosition.x -= MOVEMENT_STEP;
					break;
				case 'right':
					newPosition.x += MOVEMENT_STEP;
					break;
				case 'forward':
					newPosition.z -= MOVEMENT_STEP;
					break;
				case 'backward':
					newPosition.z += MOVEMENT_STEP;
					break;
				}

				const maxX = convertToSceneUnits(roomWidth.value/2) - BOUNDARY_OFFSET;
				const maxZ = convertToSceneUnits(roomDepth.value/2) - BOUNDARY_OFFSET;

				newPosition.x = Math.max(-maxX, Math.min(maxX, newPosition.x));
				newPosition.z = Math.max(-maxZ, Math.min(maxZ, newPosition.z));
			}

			modelEntry.model.position.set(
				newPosition.x,
				newPosition.y,
				newPosition.z
			);
			};


		// Previous imports and component definition remain the same...

		const switchWall = (modelId) => {
		const modelEntry = placedModels.value.find(entry => entry.id === modelId);
		if (!modelEntry || (modelEntry.type !== 'door' && modelEntry.type !== 'window')) return;

		const wallSequence = ['front', 'right', 'back', 'left'];
		const currentIndex = wallSequence.indexOf(modelEntry.wall);
		const nextWall = wallSequence[(currentIndex + 1) % wallSequence.length];

		const sceneWidth = convertToSceneUnits(roomWidth.value);
		const sceneDepth = convertToSceneUnits(roomDepth.value);
		const sceneHeight = convertToSceneUnits(roomHeight.value);
		
		// Calculate new position based on target wall
		const calculateNewPosition = () => {
			// Calculate positions in the middle of each wall by default
			switch (nextWall) {
			case 'front':
				return {
				x: 0,
				z: sceneDepth/2,
				rotation: Math.PI
				};
			case 'back':
				return {
				x: 0,
				z: -sceneDepth/2,
				rotation: 0
				};
			case 'left':
				return {
				x: -sceneWidth/2,
				z: 0,
				rotation: Math.PI/2
				};
			case 'right':
				return {
				x: sceneWidth/2,
				z: 0,
				rotation: -Math.PI/2
				};
			}
		};

		const newPosition = calculateNewPosition();
		modelEntry.wall = nextWall;
		
		// Update model position and rotation
		modelEntry.model.position.set(
			newPosition.x,
			modelEntry.type === 'window' ? sceneHeight/2 : 0,
			newPosition.z
		);
		modelEntry.model.rotation.y = newPosition.rotation;
		};



			// Removed duplicate switchWall function

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
			
			const takeScreenshot = () => {
				if (!scene || !camera || !controls || !renderer) return;
				
				// Store original camera and controls state
				originalCameraPosition = {
				position: camera.position.clone(),
				rotation: camera.rotation.clone()
				};
				originalControlsState = {
				enabled: controls.enabled,
				target: controls.target.clone()
				};
				
				// Calculate room dimensions in scene units
				const sceneWidth = convertToSceneUnits(roomWidth.value);
				// const sceneHeight = convertToSceneUnits(roomHeight.value);
				const sceneDepth = convertToSceneUnits(roomDepth.value);
				
				// Calculate the maximum dimension and add padding
				const maxDimension = Math.max(sceneWidth, sceneDepth);
				const padding = maxDimension * 0.2; // 20% padding
				
				// Calculate optimal camera height based on room size
				// Using FOV and desired view area to calculate required height
				const fov = camera.fov * (Math.PI / 180); // convert to radians
				const aspectRatio = renderer.domElement.width / renderer.domElement.height;
				const requiredHeight = (maxDimension + padding * 2) / (2 * Math.tan(fov / 2)) * 
				(aspectRatio > 1 ? 1 : aspectRatio);
				
				// Position camera for optimal view
				camera.position.set(
				0, // centered on x
				requiredHeight, // calculated optimal height
				0 // centered on z
				);
				camera.lookAt(0, 0, 0);
				controls.target.set(0, 0, 0);
				
				// Disable controls temporarily
				controls.enabled = false;
				
				// Ensure orthographic view for consistent scale
				const originalProjection = camera.clone();
				const orthographicSize = (maxDimension + padding * 2) / 2;
				const orthoCamera = new Three.OrthographicCamera(
				-orthographicSize * aspectRatio,
				orthographicSize * aspectRatio,
				orthographicSize,
				-orthographicSize,
				0.1,
				requiredHeight * 2
				);
				orthoCamera.position.copy(camera.position);
				orthoCamera.lookAt(0, 0, 0);
				
				// Wait for next frame to ensure camera update
				requestAnimationFrame(() => {
				// Render with orthographic camera
				renderer.render(scene, orthoCamera);
				
				// Convert the canvas to an image
				const screenshot = renderer.domElement.toDataURL('image/png');
				
				// Create download link
				const link = document.createElement('a');
				link.href = screenshot;
				const date = new Date().toISOString().split('T')[0];
				link.download = `room-plan-${date}.png`;
				link.click();
				
				// Restore original camera and controls
				camera.copy(originalProjection);
				camera.position.copy(originalCameraPosition.position);
				camera.rotation.copy(originalCameraPosition.rotation);
				controls.enabled = originalControlsState.enabled;
				controls.target.copy(originalControlsState.target);
				
				// Cleanup
				// orthoCamera.dispose();
				// originalProjection.dispose();
				
				// Re-render with original view
				renderer.render(scene, camera);
				});
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
			switchWall,
			takeScreenshot,
			cycleView,
			currentViewIndex
		};
		},
	});
</script>
      .
<style>
	
</style>
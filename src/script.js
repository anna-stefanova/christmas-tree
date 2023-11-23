import * as THREE from 'three';
import { OBJLoader} from "three/addons/loaders/OBJLoader";
import { MTLLoader} from "three/addons/loaders/MTLLoader";

import init from './init';
import './style.css';

const { sizes, camera, scene, canvas, controls, renderer } = init();
const textureLoader = new THREE.TextureLoader();

camera.position.set(0, 0, 160);
camera.lookAt(scene.position);


const disMap = textureLoader.load('/textures/heightmap.png');
disMap.wrapS = disMap.wrapT = THREE.RepeatWrapping;
disMap.repeat.set(2, -2);


const floorMaterial = new THREE.MeshStandardMaterial({
	map: textureLoader.load('/textures/snow/texture-snow.jpg'),
	displacementMap: disMap,
	displacementScale: 30.0,
	color: '#ffffff',
	side: THREE.DoubleSide,
	//wireframe: true
});



const floor = new THREE.Mesh(
	new THREE.PlaneGeometry( 1400, 1400, 300, 300),
		floorMaterial
);
floor.receiveShadow = true;
floor.position.y = -80;
floor.position.x = 0;
floor.position.z = 0;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/* AmbientLight
    -------------------------------------------------------------*/
const ambientLight = new THREE.AmbientLight(0x666666);
scene.add(ambientLight);

/* SpotLight
    -------------------------------------------------------------*/
const spotLight = new THREE.SpotLight(0xffffff, );
spotLight.distance = 2000;
spotLight.position.set(-200, 700, 0);
spotLight.castShadow = true;
scene.add(spotLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff,0.81);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 4);
dirLight.position.set( 3, 15, 15 );
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024 * 2, 1024 * 2);
dirLight.shadow.camera.top = 4;
dirLight.shadow.camera.bottom = - 4;
dirLight.shadow.camera.left = - 4;
dirLight.shadow.camera.right = 4;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
dirLight.shadow.bias= -0.002;
scene.add(dirLight);
//
// const dLightHelper = new THREE.DirectionalLightHelper(dirLight);
// scene.add(dLightHelper);
//
// const dLightShadowHelper = new THREE.CameraHelper(dirLight.shadow.camera)
// scene.add(dLightShadowHelper);

let INTERSECTED;
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const selectedObject = [];

function addSelectedObjects(object) {
	if (selectedObject.length > 0) {
		selectedObject.pop();
	}
	selectedObject.push(object);
}

const mtlLoader = new MTLLoader()
mtlLoader.load(
	'/models/Christmas_Tree/12150_Christmas_Tree_V2_L2.mtl',
	(materials) => {
		materials.preload()

		const loader = new OBJLoader();
		loader.setMaterials(materials);

		loader.load(
			'/models/Christmas_Tree/12150_Christmas_Tree_V2_L2.obj',
			(object) => {
				object.traverse(function(model) {
					if (model.isMesh) {
						model.castShadow = true;
					}
				});
				console.log('success');
				console.log(object);
				object.position.y = -80;
				//object.scale.set(0.01, 0.01, 0.01);
				object.rotation.x = -Math.PI * 0.5;
				object.castShadow = true;
				object.receiveShadow = true;
				scene.add(object);


				const handleClick = (event) => {

					pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
					pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

					raycaster.setFromCamera(pointer, camera);
					const intersects = raycaster.intersectObjects(object.children, false);

					if (intersects.length > 0) {
						if(INTERSECTED !== intersects[0].object && intersects[0].object.type === "Mesh") {
							INTERSECTED = intersects[0].object;
							addSelectedObjects(INTERSECTED);

							console.log(INTERSECTED.name);
						}
					} else {
						INTERSECTED = null;
					}
				}
				window.addEventListener('click', handleClick);
			},
			(progress) => {
				//console.log('progress');
				//console.log((progress.loaded / progress.total) * 100 + '% loaded');
			},
			(error) => {
				console.log('error');
				console.log(error);
			}
		)
	},
	(xhr) => {
		console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
	},
	(error) => {
		console.log('An error happened')
		console.log(error);
	}
)


let particles; // снежинки
let positions = [], velocities = []; // скорость (x, y, z) и позиция (x, y, z) снежинок

const numSnowFlakes = 15000; // количество снежинок

const maxRange = 1000, minRange = maxRange / 2;
const minHeight = -150;

// BufferGeometry хранит данные в виде массивов атрибутов
const geometry = new THREE.BufferGeometry();


function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const addSnowFlakes = () => {
	for (let i= 0; i < numSnowFlakes; i++) {
		positions.push(
			Math.floor(Math.random() * maxRange - minRange), // x от -500 до 500
			Math.floor(Math.random() * minRange + minHeight), // y от -500 до 500
			Math.floor(Math.random() * maxRange - minRange), // z от -500 до 500
		);
		velocities.push(
			Math.floor(Math.random() * 6 - 3) * 0.1, // x от -0.3 до 0.3
			Math.floor(Math.random() * 5 + 0.12) * 0.18, // y от -0.02 до 0.92
			Math.floor(Math.random() * 6 - 3) * 0.1, // z от -0.3 до 0.3
		);

	}

	geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

	const flakeMaterial = new THREE.PointsMaterial({
		size: 6,
		map: textureLoader.load(`/sprites/snowflaker${getRandomNumber(1, 13)}.svg`),
		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true,
		opacity: 0.7
	});

	particles = new THREE.Points(geometry, flakeMaterial);
	scene.add(particles);
};

addSnowFlakes();

const updateParticles = () => {
	for (let i = 0; i < numSnowFlakes * 3; i += 3) {
		particles.geometry.attributes.position.array[i] -= particles.geometry.attributes.velocity.array[i];
		particles.geometry.attributes.position.array[i + 1] -= particles.geometry.attributes.velocity.array[i + 1];
		particles.geometry.attributes.position.array[i + 2] -= particles.geometry.attributes.velocity.array[i + 2];

		if ( particles.geometry.attributes.position.array[i + 1] < -150) {
			particles.geometry.attributes.position.array[i] = Math.floor(Math.random() * maxRange - minRange);
			particles.geometry.attributes.position.array[i + 1] = Math.floor(Math.random() * minRange + minHeight);
			particles.geometry.attributes.position.array[i + 2] = Math.floor(Math.random() * maxRange - minRange);
		}
	}
	particles.geometry.attributes.position.needsUpdate = true;
}

const clock = new THREE.Clock();

const tick = () => {
    const delta = clock.getDelta();
	window.requestAnimationFrame(tick);
	controls.update(delta);
	updateParticles();
	renderer.render(scene, camera);
};
tick();

/** Базовые обпаботчики событий длы поддержки ресайза */
window.addEventListener('resize', () => {
	// Обновляем размеры
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Обновляем соотношение сторон камеры
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Обновляем renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, camera);
});

window.addEventListener('dblclick', () => {
	if (!document.fullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
});

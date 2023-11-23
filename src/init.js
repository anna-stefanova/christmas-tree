import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const init = () => {
	const sizes = {
		width: window.innerWidth,
		height: window.innerHeight,
	};

	const scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0x000036, 0, 500 * 3);
	scene.background = new THREE.Color('rgb(32,32,107)'); // смена цвета canvas
	const canvas = document.querySelector('.canvas');
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 2000);
	scene.add(camera);

	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	controls.autoRotate = true;
	controls.autoRotateSpeed = 1;

	const renderer = new THREE.WebGLRenderer({antialias: true, canvas });
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(new THREE.Color(0xffffff));
	renderer.shadowMapType = THREE.PCFSoftShadowMap;
	renderer.shadowMap.enabled = true;

	renderer.render(scene, camera);



	return { sizes, scene, canvas, camera, renderer, controls };
};

export default init;

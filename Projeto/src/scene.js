import * as THREE from 'three';
import { createCamera } from './camera.js';
import { createAssetInstance } from './assets.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let rainEffect = null;
let sakuraEffect = null; 
let snowEffect = null;

export function createScene() {

  const gameWindow = document.getElementById('render-target');
  const scene = new THREE.Scene();
  const camera = createCamera(gameWindow);
  const renderer = new THREE.WebGLRenderer();
  scene.background = new THREE.Color(0x87ceeb);
  renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  gameWindow.appendChild(renderer.domElement);


  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Valores importantes para o tempo
  let time = 0;

  let activeObject = undefined;
  let hoverObject = undefined;

  let buildings = [];

  const sunMesh = createAssetInstance('sun', 10, 10);
  const moonMesh = createAssetInstance('moon', 10, 10); 


  let starsAdded = false; // Flag to track whether stars have been added

  // ---------------------------- ADICIONAR NEVE A CAIR DURANTE A NOITE ------------------------------------------

  function createSnow() {
    // Setup snow particle parameters
    const snowCount = 5000;
    const snowGeometry = new THREE.BufferGeometry();
    const snowMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        transparent: false,
        opacity: 1
    });

    // Create snow particles
    const snowVertices = [];
    for (let i = 0; i < snowCount; i++) {
        const x = Math.random() * 200 - 100; // Random x position within the scene
        const y = Math.random() * 100 + 50;   // Initial y position above the scene
        const z = Math.random() * 200 - 100; // Random z position within the scene
        snowVertices.push(x, y, z);
    }
    snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowVertices, 3));
    const snow = new THREE.Points(snowGeometry, snowMaterial);
    snow.userData.ignoreSelection = true;

    // Update sakura animation
    function animateSnow() {
        const positions = snow.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.1; // Update y position to simulate snow falling
            if (positions[i] < -50) {
                positions[i] = 100; // Reset y position if snow falls out of view
            }
        }
        snow.geometry.attributes.position.needsUpdate = true; // Update particle positions
    }
    return { snow, animateSnow };
  }

  const { snow, animateSnow } = createSnow();

function startSnow() {
    if (!snowEffect) {
      const { snow, animateSnow } = createSnow(); // Assuming createSnow returns snow and animateSnow
      snowEffect = { snow, animateSnow }; // Assign snow and animateSnow to snowEffect
      scene.add(snowEffect.snow);
    }
}

function stopSnow() {
    if (snowEffect) {
        // Remove sakura from the scene
        scene.remove(snowEffect.snow);
        snowEffect = null;
    }
}



  // ---------------------------- ADICIONAR PETALAS DE SAKURA A CAIREM DURANTE O DIA -----------------------------


  function createSakura() {
    // Setup sakura particle parameters
    const sakuraCount = 5000;
    const sakuraGeometry = new THREE.BufferGeometry();
    const sakuraMaterial = new THREE.PointsMaterial({
        color: 0xffc0cb,
        size: 1,
        transparent: false,
        opacity: 1
    });

    // Create sakura particles
    const sakuraVertices = [];
    for (let i = 0; i < sakuraCount; i++) {
        const x = Math.random() * 200 - 100; // Random x position within the scene
        const y = Math.random() * 100 + 50;   // Initial y position above the scene
        const z = Math.random() * 200 - 100; // Random z position within the scene
        sakuraVertices.push(x, y, z);
    }
    sakuraGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sakuraVertices, 3));
    const sakura = new THREE.Points(sakuraGeometry, sakuraMaterial);
    sakura.userData.ignoreSelection = true;

    // Update sakura animation
    function animateSakura() {
        const positions = sakura.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.1; // Update y position to simulate sakura falling
            if (positions[i] < -50) {
                positions[i] = 100; // Reset y position if sakura petals falls out of view
            }
        }
        sakura.geometry.attributes.position.needsUpdate = true; // Update particle positions
    }
    return { sakura, animateSakura };
  }

  const { sakura, animateSakura } = createSakura();

function startSakura() {
    if (!sakuraEffect) {
      const { sakura, animateSakura } = createSakura(); // Assuming createSakura returns sakura and animateSakura
      sakuraEffect = { sakura, animateSakura }; // Assign sakura and animateSakura to sakuraEffect
      scene.add(sakuraEffect.sakura);
    }
}

function stopSakura() {
    if (sakuraEffect) {
        // Remove sakura from the scene
        scene.remove(sakuraEffect.sakura);
        sakuraEffect = null;
    }
}


  // ----------------------------- ADICIONAR CHUVA DURANTE O DIA ----------------------------------------

  function createRain() {
    // Setup rain particle parameters
    const rainCount = 9000;
    const rainGeometry = new THREE.BufferGeometry();
    const rainMaterial = new THREE.PointsMaterial({
        color: 0x7777ff,
        size: 0.5,
        transparent: true,
        opacity: 1
    });

    // Create rain particles
    const rainVertices = [];
    for (let i = 0; i < rainCount; i++) {
        const x = Math.random() * 200 - 100; // Random x position within the scene
        const y = Math.random() * 100 + 50;   // Initial y position above the scene
        const z = Math.random() * 200 - 100; // Random z position within the scene
        rainVertices.push(x, y, z);
    }
    rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainVertices, 3));
    const rain = new THREE.Points(rainGeometry, rainMaterial);
    rain.userData.ignoreSelection = true;

    // Update rain animation
    function animateRain() {
        const positions = rain.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.1; // Update y position to simulate rain falling
            if (positions[i] < -50) {
                positions[i] = 100; // Reset y position if raindrop falls out of view
            }
        }
        rain.geometry.attributes.position.needsUpdate = true; // Update particle positions
    }
    return { rain, animateRain };
  }

  const { rain, animateRain } = createRain();

function startRain() {
    if (!rainEffect) {
      const { rain, animateRain } = createRain(); // Assuming createRain returns rain and animateRain
      rainEffect = { rain, animateRain }; // Assign rain and animateRain to rainEffect
      scene.add(rainEffect.rain);
    }
}

function stopRain() {
    if (rainEffect) {
        // Remove rain from the scene
        scene.remove(rainEffect.rain);
        rainEffect = null;
    }
}

// -------------------------------------- ADICIONAR ESTRELAS AO CÉU NOTURNO ---------------------------------

function addStarsToSky() {
    if (!starsAdded && sunMesh.position.y < 0) {
        const starCount = 10000;
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
        });
        const starVertices = [];
        for (let i = 0; i < starCount; i++) {
            const x = THREE.MathUtils.randFloatSpread(2000);
            const y = THREE.MathUtils.randFloatSpread(2000);
            const z = THREE.MathUtils.randFloatSpread(2000);
            starVertices.push(x, y, z);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        stars.userData.ignoreSelection = true;
        scene.add(stars);
        starsAdded = true; // Set the flag to true indicating stars have been added
    }
}

  function initialize(city) {
    scene.clear();
    buildings = [];
  

    for (let x = 0; x < city.size; x++) {
      const column = [];
      for (let y = 0; y < city.size; y++) {
        const mesh = createAssetInstance(city.tiles[x][y].terrainId, x, y);
        scene.add(mesh);
        column.push(mesh);
      }
      buildings.push([...Array(city.size)]);
    }

   

    scene.add(sunMesh);
    scene.add(moonMesh);

    setupLights();
  }

  // Inverno -> Primavera -> Verão -> Outono
  // Neve -> Noite
  // Sakura -> Dia
  // Raining -> Noite

  let currentWeather = "Sunny/Moony Season";

function getCurrentWeather() {
    return currentWeather;
}

function updateWeatherPanel() {
    const weatherTextElement = document.getElementById('weather-text');
    weatherTextElement.textContent = currentWeather;
}

function updateBackground() {
  const isNight = !sunMesh.visible;

  if (isNight) {
      addStarsToSky();
      scene.background.setHex(0x000022);
  } else {
      scene.background.setHex(0x87ceeb);
  }

  if (currentWeather === "Sakura Season") {
      startSakura();
  } else {
      stopSakura();
  }

  if (currentWeather === "Snowing Season") {
      startSnow();
  } else {
      stopSnow();
  }

  if (currentWeather === "Rainy Season") {
      startRain();
  } else {
      stopRain();
  }
}

// Event listeners for weather buttons
document.getElementById('sunny-button').addEventListener('click', function() {
    currentWeather = "Sunny/Moony Season";
    updateWeatherPanel();
    updateBackground();
});

document.getElementById('rainy-button').addEventListener('click', function() {
    currentWeather = "Rainy Season";
    updateWeatherPanel();
    updateBackground();
});

document.getElementById('snowing-button').addEventListener('click', function() {
    currentWeather = "Snowing Season";
    updateWeatherPanel();
    updateBackground();
});

document.getElementById('sakura-button').addEventListener('click', function() {
    currentWeather = "Sakura Season";
    updateWeatherPanel();
    updateBackground();
});

// Initial setup
updateWeatherPanel();
updateBackground();


  function animate(){
    requestAnimationFrame(animate);

    // Este código serve para esconder a lua ou o sol quando este não está por cima do mundo.
    sunMesh.visible = sunMesh.position.y >= 0;
    moonMesh.visible = moonMesh.position.y >= 0;

    //time += 0.0005;
    time += 0.001;

    
    sunMesh.rotation.y += 0.01;
    moonMesh.rotation.y += 0.01;

    const sunMeshX = Math.cos(time) * 40; 
    const sunMeshY = Math.sin(time) * 40;
    const moonMeshX = Math.cos(time + Math.PI) * 40;
    const moonMeshY = Math.sin(time + Math.PI) * 40;

    sunMesh.position.set(sunMeshX, sunMeshY, sunMesh.position.z);
    moonMesh.position.set(moonMeshX, moonMeshY, moonMesh.position.z);

    updateWeatherPanel();

    if (snowEffect) {
      snowEffect.animateSnow();
    }

    if (rainEffect) {
      rainEffect.animateRain();
    }

    if (sakuraEffect) {
      sakuraEffect.animateSakura();
    }

    updateBackground();

    renderer.render(scene, camera.camera);
  }

  animate();

  function update(city) {
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.tiles[x][y];
        const existingBuildingMesh = buildings[x][y];

        if (!tile.building && existingBuildingMesh) {
          scene.remove(existingBuildingMesh);
          buildings[x][y] = undefined;
        }
        if (tile.building && tile.building.updated) {
          scene.remove(existingBuildingMesh);
          buildings[x][y] = createAssetInstance(tile.building.type, x, y, tile.building);
          scene.add(buildings[x][y]);
          tile.building.updated = false;
        }
      }
    }
  }

  function setupLights() {
    const sun = new THREE.DirectionalLight(0xffffff, 1)
    sun.position.set(20, 20, 20);
    sun.castShadow = true;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 0;
    sun.shadow.camera.bottom = -10;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  }

  function draw() {
    renderer.render(scene, camera.camera);
  }

  function start() {
    renderer.setAnimationLoop(draw);
  }

  function stop() {
    renderer.setAnimationLoop(null);
  }

  function onResize() {
    camera.camera.aspect = gameWindow.offsetWidth / gameWindow.offsetHeight;
    camera.camera.updateProjectionMatrix();
    renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
  }


  function setHighlightedObject(object) {
    if (hoverObject && hoverObject !== activeObject) {
      setObjectEmission(hoverObject, 0x000000);
    }

    hoverObject = object;

    if (hoverObject) {
      setObjectEmission(hoverObject, 0x555555);
    }
  }

  function getSelectedObject(event) {
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera.camera);

    let intersections = raycaster.intersectObjects(scene.children, false);

    if (intersections.length > 0) {
      return intersections[0].object;
    } else {
      return null;
    }
  }

  function setActiveObject(object) {

    setObjectEmission(activeObject, 0x000000);
    activeObject = object;
    setObjectEmission(activeObject, 0xaaaa55);
  }

  function setObjectEmission(object, color) {
    if (!object) return;
    if (Array.isArray(object.material)) {
      object.material.forEach(material => material.emissive?.setHex(color));
    } else {
      object.material.emissive?.setHex(color);
    }
  }



  // ------------------------------------ CARREGAR MODELOS 3D USANDO O FORMATO GLB --------------------------------------- 

  function load3DHouse(url){
    const gtlloaderHouse = new GLTFLoader();

    gtlloaderHouse.load(
      // resource URL
      './modelos/House2.glb',

      // called when the resource is loaded
      function ( gltf ) {
        const house = gltf.scene;
        const position = new THREE.Vector3(1, 0, 1);
        house.position.copy(position);
        house.scale.set(1.2, 1.2, 1.2);
        scene.add( gltf.scene );
      },
      // called while loading is progressing
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error ) {
        console.log( 'An error happened' );
      })
  }

  function load3DTree(url){
    const gtlloaderTree = new GLTFLoader();

    gtlloaderTree.load(
      //resource URL
      './modelos/Tree1.glb',
      
      //called when the resource is loaded
      function ( gltf ) {
        const tree = gltf.scene;
        const position = new THREE.Vector3(1, 0, 5);
        tree.position.copy(position);
        tree.scale.set(0.5, 0.5, 0.5);
        scene.add( gltf.scene );
      },
      //called while loading is progressing
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      //called when loading has errors
      function ( error ) {
        console.log( 'An error happened' );
      })
  }

  function load3DWindMill(url){
    const gtlloaderWindMill = new GLTFLoader();

    gtlloaderWindMill.load(
      // resource URL
      './modelos/Wind2.glb',

      // called when the resource is loaded
      function ( gltf ) {
        const windmill = gltf.scene;
        const position = new THREE.Vector3(15, 0, 14);
        windmill.position.copy(position);
        scene.add( gltf.scene );
      },
      // called while loading is progressing
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error ) {
        console.log( 'An error happened' );
      }
    )
  }

  function load3DTorii(url){
    const gtlloaderTorii = new GLTFLoader();

    gtlloaderTorii.load(
      // resource URL
      './modelos/torii4.glb',

      // called when the resource is loaded
      function ( gltf ) {
        const torii = gltf.scene;
        const position = new THREE.Vector3(7, 0, 7);
        torii.position.copy(position);
        torii.scale.set(1.4, 1.4, 1.4);
        scene.add( gltf.scene );
      },
      // called while loading is progressing
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error ) {
        console.log( 'An error happened' );
      }
    )
  }


  function load3DPlanet(url){

    const gtlloaderPlanet = new GLTFLoader();

    gtlloaderPlanet.load(
      // resource URL
      './modelos/saturn.glb',

      // called when the resource is loaded
      function ( gltf ) {
        const saturn = gltf.scene;
        const position = new THREE.Vector3(200, -20 , 200);
        saturn.position.copy(position);
        saturn.scale.set(7, 7, 7);
        saturn.rotation.y += 0.01;
        saturn.rotation.set(0, Math.PI / 2, 0);
        scene.add( gltf.scene );
      },
      // called while loading is progressing
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error ) {
        console.log( 'An error happened' );
      }
    )
  }

  

  function load3DBench(url){

    const gtlloaderBench = new GLTFLoader();

    gtlloaderBench.load(
      // resource URL
      './modelos/Bench2.glb',

      // called when the resource is loaded
      function ( gltf ) {
        const bench = gltf.scene;
        const position = new THREE.Vector3(8, 0, 8);
        bench.position.copy(position);
        bench.scale.set(1.5, 1.5, 1.5);
        scene.add( gltf.scene );
      },
      // called while loading is progressing
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error ) {
        console.log( 'An error happened' );
      }
    )
  }

  function load3DArcade(url){

    const gtlloaderArcade = new GLTFLoader();

    gtlloaderArcade.load(
      // resource URL
      './modelos/arcadeMachine.glb',

      // called when the resource is loaded
      function ( gltf ) {
        const arcade = gltf.scene;
        const position = new THREE.Vector3(0, 0, 13);
        arcade.position.copy(position);
        arcade.scale.set(0.7, 0.7, 0.7);
        scene.add( gltf.scene );
      },
      // called while loading is progressing
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error ) {
        console.log( 'An error happened' );
      }
    )
  }


  function load3DVendingMachine(url){
    const gtlloaderVendingMachine = new GLTFLoader();

    gtlloaderVendingMachine.load(
      // resource URL
      './modelos/vendingMachine1.glb',

      // called when the resource is loaded
      function ( gltf ) {
        const vendingMachine = gltf.scene;
        const position = new THREE.Vector3(4, 0, 0);
        vendingMachine.position.copy(position);
        vendingMachine.scale.set(0.4, 0.4, 0.4);
        scene.add( gltf.scene );
      },
      // called while loading is progressing
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error ) {
        console.log( 'An error happened' );
      }
    )
  }


  const arcadeButton = document.getElementById('button-arcade');
  arcadeButton.addEventListener('click', () => {load3DArcade('./modelos/arcadeMachine.glb')});

  const BenchButton = document.getElementById('button-bench');
  BenchButton.addEventListener('click', () => {load3DBench('./modelos/Bench2.glb')});

  const WindButton = document.getElementById('button-windmill');
  WindButton.addEventListener('click', () => {load3DWindMill('./modelos/Wind2.glb')});

  const vendingMachineButton = document.getElementById('button-vendingmachine');
  vendingMachineButton.addEventListener('click', () => {load3DVendingMachine('./modelos/vendingMachine.glb')});

  const toriiButton = document.getElementById('button-torii');
  toriiButton.addEventListener('click', () => {load3DTorii('./modelos/torii4.glb')});

  const treeButton = document.getElementById('button-tree');
  treeButton.addEventListener('click', () => {load3DTree('./modelos/Tree1.glb')});

  const houseButton = document.getElementById('button-home');
  houseButton.addEventListener('click', () => {load3DHouse('./modelos/House2.glb')});

  // ------------------------------------ FIM DE CARREGAR MODELOS 3D USANDO O FORMATO GLB --------------------------------------- 

  
  
  return {
    camera,
    initialize,
    startRain,
    startSakura,
    stopSakura,
    stopRain,
    animateRain,
    update,
    start,
    stop,
    onResize,
    getSelectedObject,
    setActiveObject,
    setHighlightedObject
  }
}
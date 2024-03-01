import * as THREE from 'three';
import { createCamera } from './camera.js';
import { createAssetInstance } from './assets.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let rainEffect = null;
let sakuraEffect = null; 
let snowEffect = null;
const occupiedPositions = new Set();
const loadedModels = new Map();

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





//------------------------------ Try stuff out ---------------------------------------------



let selectedPosition = null; // Variable to store the selected position
let tileSelectionModeEnabled = false;

// Add event listener to the select button
const selectButton = document.getElementById('button-select');
selectButton.addEventListener('click', function() {
  tileSelectionModeEnabled = !tileSelectionModeEnabled;
  // Enable mode for selecting a tile
  if (tileSelectionModeEnabled) {
    enableTileSelectionMode();
  }
});

// Function to enable mode for selecting a tile
function enableTileSelectionMode() {
    // Add event listener to the renderer's dom element to listen for click events
    renderer.domElement.addEventListener('click', onTileClick);
}

// Function to handle click event on a tile
function onTileClick(event) {
    // Get the mouse coordinates
    const mouseCoords = getMouseCoordinates(event);

    // Cast a ray from the camera to the clicked position
    raycaster.setFromCamera(mouseCoords, camera.camera);

    // Find intersected objects
    const intersects = raycaster.intersectObjects(scene.children);

    // Check if any object is intersected
    if (intersects.length > 0) {
        // Get the position of the intersected object (tile)
        selectedPosition = intersects[0].object.position;
        console.log('Selected position:', selectedPosition);
        updateInformationPanel();
    }
}

// Function to get mouse coordinates relative to the renderer's dom element
function getMouseCoordinates(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return new THREE.Vector2(x, y);
}

// Function to disable tile selection mode
function disableTileSelectionMode() {
    // Remove the click event listener from the renderer's dom element
    renderer.domElement.removeEventListener('click', onTileClick);
}

// Add event listener to the house button
const houseButtonupload = document.getElementById('button-home');
houseButtonupload.addEventListener('click', function() {
    // Check if a tile is selected
    if (selectedPosition) {
        // Load the house model to the selected position
        loadHouseModel(selectedPosition);
    } else {
        console.log('Please select a tile first.');
    }
});

const treeButtonupload = document.getElementById('button-tree');
treeButtonupload.addEventListener('click', function() {
    // Check if a tile is selected
    if (selectedPosition) {
        // Load the house model to the selected position
        load3DTree(selectedPosition);
    } else {
        console.log('Please select a tile first.');
    }
});

const windMillButtonupload = document.getElementById('button-windmill');
windMillButtonupload.addEventListener('click', function() {
    // Check if a tile is selected
    if (selectedPosition) {
        // Load the house model to the selected position
        load3DWindMill(selectedPosition);
    } else {
        console.log('Please select a tile first.');
    }
});

const toriiButtonupload = document.getElementById('button-torii');
toriiButtonupload.addEventListener('click', function() {
    // Check if a tile is selected
    if (selectedPosition) {
        // Load the house model to the selected position
        load3DTorii(selectedPosition);
    } else {
        console.log('Please select a tile first.');
    }
});

const benchButtonupload = document.getElementById('button-bench');
benchButtonupload.addEventListener('click', function() {
    // Check if a tile is selected
    if (selectedPosition) {
        // Load the house model to the selected position
        load3DBench(selectedPosition);
    } else {
        console.log('Please select a tile first.');
    }
});

const pagodaButtonupload = document.getElementById('button-road');
pagodaButtonupload.addEventListener('click', function() {
    // Check if a tile is selected
    if (selectedPosition) {
        // Load the house model to the selected position
        load3DPagoda(selectedPosition);
    } else {
        console.log('Please select a tile first.');
    }
});

const arcadeButtonupload = document.getElementById('button-arcade');
arcadeButtonupload.addEventListener('click', function() {
    // Check if a tile is selected
    if (selectedPosition) {
        // Load the house model to the selected position
        load3DArcade(selectedPosition);
    } else {
        console.log('Please select a tile first.');
    }
});

const vendingMachineButtonupload = document.getElementById('button-vendingmachine');
vendingMachineButtonupload.addEventListener('click', function() {
    // Check if a tile is selected
    if (selectedPosition) {
        // Load the house model to the selected position
        load3DVendingMachine(selectedPosition);
    } else {
        console.log('Please select a tile first.');
    }
});

function isPositionOccupied(position) {
  const positionKey = `${position.x},${position.y},${position.z}`;
  return occupiedPositions.has(positionKey);
}


function updateInformationPanel(customString) {
  const informationPanel = document.getElementById('info-panel');
  if (customString) {
      informationPanel.textContent = customString;
  } else {
      // Set a default string when customString is not provided
      informationPanel.textContent = "Grass: Ah, the scent of freshly cut grass, such a nostalgic embrace.";
  }
}

// Get the city name element
const cityNameElement = document.getElementById('city-name');

// Add event listener to handle changes in the city name
cityNameElement.addEventListener('input', function() {
    // Get the new city name
    const newCityName = cityNameElement.textContent.trim();
    
    // Update the city name in your application
    updateCityName(newCityName);
});

// Function to update the city name in your application
function updateCityName(newCityName) {
    // Update the city name in your application logic
    console.log('City name updated:', newCityName);
}


function deleteModel(position) {
  const positionKey = `${position.x},${position.y},${position.z}`;
  const modelToRemove = loadedModels.get(positionKey);

  if (modelToRemove) {
      scene.remove(modelToRemove);
      occupiedPositions.delete(positionKey);
      loadedModels.delete(positionKey);
      console.log(`Removed model at position: ${positionKey}`);
  } else {
      console.log(`No model found at position: ${positionKey}`);
  }
}



function rotateModel(position, angle) {
  const positionKey = `${position.x},${position.y},${position.z}`;
  const modelToRotate = loadedModels.get(positionKey);

  if (modelToRotate) {
    // Apply rotation to the model
    modelToRotate.rotation.y += angle;
    console.log(`Rotated model at position: ${positionKey}`);
  } else {
    console.log(`No model found at position: ${positionKey}`);
  }
}

const rotateButton = document.getElementById('rotate-button');
rotateButton.addEventListener('click', function() {
    // Check if a tile is selected
    if (selectedPosition) {
        rotateModel(selectedPosition, Math.PI / 2);
    } else {
        console.log('Please select a tile first.');
    }
});


const bulldozeButton = document.getElementById('button-bulldoze');
bulldozeButton.addEventListener('click', function() {
    // Check if a tile is selected
    if (selectedPosition) {
        deleteModel(selectedPosition);
    } else {
        console.log('Please select a tile first.');
    }
});

// Function to load the house model to a specific position
function loadHouseModel(position) {
  if (position.x === 0 && position.y === 0 && position.z === 0) {
    console.log('Skipping loading model at position 0,0,0.');
    return;
}
  // Check if the position is already occupied
  if (!isPositionOccupied(position)) {
      const houseUrl = './modelos/house.glb';
      const gtlloaderHouse = new GLTFLoader();

      gtlloaderHouse.load(
          houseUrl,
          function (gltf) {
              const houseModel = gltf.scene;
              houseModel.position.copy(position);
              houseModel.scale.set(1.2, 1.2, 1.2);
              houseModel.position.y = 0;
              scene.add(houseModel);

              const positionKey = `${position.x},${position.y},${position.z}`;
              occupiedPositions.add(positionKey);
              loadedModels.set(positionKey, houseModel);
              console.log("Loaded models:", loadedModels);
              updateInformationPanel("House: A good looking house, reminds me of home. I wonder who lives here.");

          },
          function (xhr) {
              console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
          },
          function (error) {
              console.log('An error happened');
          }
      );
  } else {
      console.log('This position is already occupied by a model.');
  }
}

function load3DTree(position) {

  console.log('Checking position:', position);
  console.log('Occupied positions:', occupiedPositions);

  if (position.x === 0 && position.y === 0 && position.z === 0) {
    console.log('Skipping loading model at position 0,0,0.');
    return;
  }

  // Check if the position is already occupied
  if (!isPositionOccupied(position)) {
  const gtlloaderTree = new GLTFLoader();

  gtlloaderTree.load(
      //resource URL
      './modelos/tree.glb',

      //called when the resource is loaded
      function (gltf) {
          const tree = gltf.scene;

          tree.position.copy(position);
          tree.scale.set(0.5, 0.5, 0.5);
          tree.position.y = 0;
          scene.add(gltf.scene);

          const positionKey = `${position.x},${position.y},${position.z}`;
          occupiedPositions.add(positionKey);
          loadedModels.set(positionKey, tree);
          console.log("Loaded models:", loadedModels);
          updateInformationPanel("Tree: A normal looking Tree. It looks old, maybe a few centuries old.");

      },
      //called while loading is progressing
      function (xhr) {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      //called when loading has errors
      function (error) {
          console.log('An error happened');
      }
  );
  } else {
    console.log('This position is already occupied by a model.');
  }
}


function load3DWindMill(position) {
  if (position.x === 0 && position.y === 0 && position.z === 0) {
    console.log('Skipping loading model at position 0,0,0.');
    return;
}
  // Check if the position is already occupied
  if (!isPositionOccupied(position)) {
  const gtlloaderWindMill = new GLTFLoader();
  gtlloaderWindMill.load(
      // resource URL
      './modelos/wind.glb',
      // called when the resource is loaded
      function (gltf) {
          const windmill = gltf.scene;
          windmill.position.copy(position);
          scene.add(gltf.scene);
          windmill.position.y = 0;
          
          const positionKey = `${position.x},${position.y},${position.z}`;
          occupiedPositions.add(positionKey);
          loadedModels.set(positionKey, windmill);
          console.log("Loaded models:", loadedModels);

          updateInformationPanel("Windmill: You can hear the wind blowing around you.");
      },
      // called while loading is progressing
      function (xhr) {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      // called when loading has errors
      function (error) {
          console.log('An error happened');
      }
  );
  } else {
    console.log('This position is already occupied by a model.');
  }
}

function load3DTorii(position){
  if (position.x === 0 && position.y === 0 && position.z === 0) {
    console.log('Skipping loading model at position 0,0,0.');
    return;
  }

  if (!isPositionOccupied(position)) {
  const gtlloaderTorii = new GLTFLoader();

  gtlloaderTorii.load(
    // resource URL
    './modelos/torii.glb',

    // called when the resource is loaded
    function ( gltf ) {
      const torii = gltf.scene;
      torii.position.copy(position);
      torii.scale.set(1.4, 1.4, 1.4);
      torii.position.y = 0;
      scene.add( gltf.scene );

      const positionKey = `${position.x},${position.y},${position.z}`;
      occupiedPositions.add(positionKey);
      loadedModels.set(positionKey, torii);
      console.log("Loaded models:", loadedModels);

      updateInformationPanel("Torii: The japanese entrance to a sacred place. You somehow feel calmer around it.");
    },
    // called while loading is progressing
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened' );
    }
  );
  }else{
    console.log('This position is already occupied by a model.');
  }
  }

function load3DBench(position){
  if (position.x === 0 && position.y === 0 && position.z === 0) {
    console.log('Skipping loading model at position 0,0,0.');
    return;
}

  if (!isPositionOccupied(position)) {

  const gtlloaderBench = new GLTFLoader();

  gtlloaderBench.load(
    // resource URL
    './modelos/bench.glb',

    // called when the resource is loaded
    function ( gltf ) {
      const bench = gltf.scene;
      bench.position.copy(position);
      bench.scale.set(1.5, 1.5, 1.5);
      bench.position.y = 0;
      scene.add( gltf.scene );


      const positionKey = `${position.x},${position.y},${position.z}`;
      occupiedPositions.add(positionKey);
      loadedModels.set(positionKey, bench);
      console.log("Loaded models:", loadedModels);

      updateInformationPanel("Bench: Oh nice, a bench, my legs were starting to feel a bit tired.");
    },
    // called while loading is progressing
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened' );
    }
  );
} else {
  console.log('This position is already occupied by a model.');
}
}

function load3DArcade(position) {
  if (position.x === 0 && position.y === 0 && position.z === 0) {
    console.log('Skipping loading model at position 0,0,0.');
    return;
}
  if (!isPositionOccupied(position)) {
      const gtlloaderArcade = new GLTFLoader();

      gtlloaderArcade.load(
          // resource URL
          './modelos/arcadeMachine.glb',

          // called when the resource is loaded
          function (gltf) {
              const arcade = gltf.scene;
              arcade.position.copy(position);
              arcade.scale.set(0.7, 0.7, 0.7);
              arcade.position.y = 0;
              scene.add(gltf.scene);

              const positionKey = `${position.x},${position.y},${position.z}`;
              occupiedPositions.add(positionKey);
              loadedModels.set(positionKey, arcade);
              console.log("Loaded models:", loadedModels);

              updateInformationPanel("Arcade: The oldschool way of playing games, my father used to play these with his friends back in the day.");
          },
          // called while loading is progressing
          function (xhr) {
              console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },
          // called when loading has errors
          function (error) {
              console.log('An error happened');
          }
      );
  } else {
      console.log('This position is already occupied by another building.');
  }
}


function load3DPagoda(position) {
  if (position.x === 0 && position.y === 0 && position.z === 0) {
    console.log('Skipping loading model at position 0,0,0.');
    return;
}
  if (!isPositionOccupied(position)) {
      const gtlloaderPagoda = new GLTFLoader();

      gtlloaderPagoda.load(
          // resource URL
          './modelos/pagoda.glb',

          // called when the resource is loaded
          function (gltf) {
              const pagoda = gltf.scene;
              pagoda.position.copy(position);
              pagoda.scale.set(0.05, 0.05, 0.05);
              pagoda.position.y = 0;
              scene.add(gltf.scene);

              const positionKey = `${position.x},${position.y},${position.z}`;
              occupiedPositions.add(positionKey);
              loadedModels.set(positionKey, pagoda);
              console.log("Loaded models:", loadedModels);

              updateInformationPanel("Pagoda: Woah, a pagoda, its gigantic, the multiple layers are so cool!");
          },
          // called while loading is progressing
          function (xhr) {
              console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },
          // called when loading has errors
          function (error) {
              console.log('An error happened');
          }
      );
  } else {
      console.log('This position is already occupied by another building.');
  }
}


function load3DVendingMachine(position){
  if (position.x === 0 && position.y === 0 && position.z === 0) {
    console.log('Skipping loading model at position 0,0,0.');
    return;
}

  if (!isPositionOccupied(position)) {
  const gtlloaderVendingMachine = new GLTFLoader();

  gtlloaderVendingMachine.load(
    // resource URL
    './modelos/vendingMachine.glb',

    // called when the resource is loaded
    function ( gltf ) {
      const vendingMachine = gltf.scene;
      vendingMachine.position.copy(position);
      vendingMachine.scale.set(0.4, 0.4, 0.4);
      vendingMachine.position.y = 0;
      scene.add( gltf.scene );

      const positionKey = `${position.x},${position.y},${position.z}`;
      occupiedPositions.add(positionKey);
      loadedModels.set(positionKey, vendingMachine);
      console.log("Loaded models:", loadedModels);

      updateInformationPanel("Vending Machine: A vending machine, after a closer look, its filled with snacks.");

    },
    // called while loading is progressing
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened' );
    }
  );
  } else {
    console.log('This position is already occupied by a model.');
  }
}


// ------------------------------- End try stuff out----------------------------


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
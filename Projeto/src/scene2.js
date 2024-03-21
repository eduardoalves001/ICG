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

   
    loadHouseModel1();
    loadHouseModel2();
    loadHouseModel3();
    loadHouseModel4();
    loadHouseModel5();
    loadHouseModel6();
    loadHouseModel7();
    loadHouseModel8();
    loadHouseModel9();

    // loadWall1();
    // loadWall2();
    // loadWall3();
    // loadWall4();
    // loadWall5();
    // loadWall6();
    // loadWall7();
    loadWalls();
    
    
    load3DPagoda();
    load3DTree1();
    load3DTree2();
    load3DTree3();
    load3DTree4();
    load3DTree5();
    load3DTree6();
    load3DTree7();
    load3DTree8();
    load3DTree9();
    load3DTorii1();
    load3DTorii2();
    load3DTorii3();



    scene.add(sunMesh);
    scene.add(moonMesh);

    setupLights();
  }

  function updateBackground() {
    const isNight = sunMesh.position.y <= 0;
    
    if (isNight) {
        addStarsToSky();
        scene.background.setHex(0x000022);
        if (sunMesh.position.x >= 0) {
            stopSakura();
            startRain();
            stopSnow();
        } else{
            startSnow();
            stopRain();
            stopSakura();
        }
    }else{
        scene.background.setHex(0x87ceeb);
        if(sunMesh.position.x > 0){
          stopRain();
          stopSakura();
          stopSnow();
        }else{
            startSakura();
            stopRain();
            stopSnow();
        }
    }
  }
updateBackground();

//------------------------------ Try stuff out ---------------------------------------------



let selectedPosition = null; // Variable to store the selected position


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


function updateInformationPanel(customString) {
  const informationPanel = document.getElementById('info-panel');
  if (customString) {
      informationPanel.textContent = customString;
  } else {
      informationPanel.textContent = "Grass: Ah, the scent of freshly cut grass, such a nostalgic embrace.";
  }
}



function loadHouseModel1() {
 // Verificação, se a posição já está ocupada antes de carregar o modelo
      const houseUrl = './modelos/house.glb';
      const gtlloaderHouse = new GLTFLoader();

      gtlloaderHouse.load(
          houseUrl,
          function (gltf) {
              const houseModel = gltf.scene;
              houseModel.scale.set(2, 2, 2);
              houseModel.position.set(20,0,1.5);
              scene.add(houseModel);
          },
          function (xhr) {
              console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
          },
          function (error) {
              console.log('An error happened');
          }
      );
}


function loadHouseModel2() {
  // Verificação, se a posição já está ocupada antes de carregar o modelo
       const houseUrl = './modelos/house.glb';
       const gtlloaderHouse = new GLTFLoader();
 
       gtlloaderHouse.load(
           houseUrl,
           function (gltf) {
               const houseModel = gltf.scene;
               houseModel.scale.set(2, 2, 2);
               houseModel.position.set(18,0,1.5);
               scene.add(houseModel);
           },
           function (xhr) {
               console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
           },
           function (error) {
               console.log('An error happened');
           }
       );
 }
 function loadHouseModel3() {
  // Verificação, se a posição já está ocupada antes de carregar o modelo
       const houseUrl = './modelos/house.glb';
       const gtlloaderHouse = new GLTFLoader();
 
       gtlloaderHouse.load(
           houseUrl,
           function (gltf) {
               const houseModel = gltf.scene;
               houseModel.scale.set(2, 2, 2);
               houseModel.position.set(16,0,1.5);
               scene.add(houseModel);
           },
           function (xhr) {
               console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
           },
           function (error) {
               console.log('An error happened');
           }
       );
 }
 function loadHouseModel4() {
  // Verificação, se a posição já está ocupada antes de carregar o modelo
       const houseUrl = './modelos/house.glb';
       const gtlloaderHouse = new GLTFLoader();
 
       gtlloaderHouse.load(
           houseUrl,
           function (gltf) {
               const houseModel = gltf.scene;
               houseModel.scale.set(2, 2, 2);
               houseModel.position.set(14,0,1.5);
               scene.add(houseModel);
           },
           function (xhr) {
               console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
           },
           function (error) {
               console.log('An error happened');
           }
       );
 }
 function loadHouseModel5() {
  // Verificação, se a posição já está ocupada antes de carregar o modelo
       const houseUrl = './modelos/house.glb';
       const gtlloaderHouse = new GLTFLoader();
 
       gtlloaderHouse.load(
           houseUrl,
           function (gltf) {
               const houseModel = gltf.scene;
               houseModel.scale.set(2, 2, 2);
               houseModel.position.set(12,0,1.5);
               scene.add(houseModel);
           },
           function (xhr) {
               console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
           },
           function (error) {
               console.log('An error happened');
           }
       );
 }

 function loadHouseModel6() {
  // Verificação, se a posição já está ocupada antes de carregar o modelo
       const houseUrl = './modelos/house.glb';
       const gtlloaderHouse = new GLTFLoader();
 
       gtlloaderHouse.load(
           houseUrl,
           function (gltf) {
               const houseModel = gltf.scene;
               houseModel.scale.set(2, 2, 2);
               houseModel.position.set(10,0,1.5);
               scene.add(houseModel);
           },
           function (xhr) {
               console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
           },
           function (error) {
               console.log('An error happened');
           }
       );
 }

 function loadHouseModel7() {
  // Verificação, se a posição já está ocupada antes de carregar o modelo
       const houseUrl = './modelos/house.glb';
       const gtlloaderHouse = new GLTFLoader();
 
       gtlloaderHouse.load(
           houseUrl,
           function (gltf) {
               const houseModel = gltf.scene;
               houseModel.scale.set(2, 2, 2);
               houseModel.position.set(8,0,1.5);
               scene.add(houseModel);
           },
           function (xhr) {
               console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
           },
           function (error) {
               console.log('An error happened');
           }
       );
 }

 function loadHouseModel8() {
  // Verificação, se a posição já está ocupada antes de carregar o modelo
       const houseUrl = './modelos/house.glb';
       const gtlloaderHouse = new GLTFLoader();
 
       gtlloaderHouse.load(
           houseUrl,
           function (gltf) {
               const houseModel = gltf.scene;
               houseModel.scale.set(2, 2, 2);
               houseModel.position.set(6,0,1.5);
               scene.add(houseModel);
           },
           function (xhr) {
               console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
           },
           function (error) {
               console.log('An error happened');
           }
       );
 }

 function loadHouseModel9() {
  // Verificação, se a posição já está ocupada antes de carregar o modelo
       const houseUrl = './modelos/house.glb';
       const gtlloaderHouse = new GLTFLoader();
 
       gtlloaderHouse.load(
           houseUrl,
           function (gltf) {
               const houseModel = gltf.scene;
               houseModel.scale.set(2, 2, 2);
               houseModel.position.set(4,0,1.5);
               scene.add(houseModel);
           },
           function (xhr) {
               console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
           },
           function (error) {
               console.log('An error happened');
           }
       );
 }


 // Load Walls -----------------------------------------------------------------

 function loadWalls() {
  const wallPath = './modelos/wall.glb'; // Path to the wall model

  const numWalls = 5; // Number of walls to summon

  // Loop to summon each wall
  for (let i = 0; i < numWalls; i++) {
      const position = new THREE.Vector3(29, 0, 2.6 + i * 5.95); // Adjust the position as needed
      const rotation = new THREE.Euler(0, Math.PI / 2, 0); // Adjust the rotation as needed
      const wallScale = 4; // Scale factor for the walls

      loadWall(wallPath, position, rotation, wallScale);
  }
}

// Function to load a single wall
function loadWall(wallPath, position, rotation, scale) {
  const gtlloaderWall = new GLTFLoader();

  gtlloaderWall.load(
      wallPath,
      function (gltf) {
          const wall = gltf.scene;
          wall.scale.set(scale, scale, scale);
          wall.position.copy(position);
          wall.rotation.copy(rotation);
          scene.add(wall);
      },
      function (xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      function (error) {
          console.log('An error happened');
      }
  );
}

// LOAD ARVORES ----------------------------------------------------------------------

function load3DTree1() {
  const gtlloaderTree = new GLTFLoader();

  gtlloaderTree.load(
  
      './modelos/tree.glb',

      function (gltf) {
          const tree = gltf.scene;
          tree.scale.set(0.5, 0.5, 0.5);
          tree.position.set(27, 0, 2);
          scene.add(gltf.scene);
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
}

function load3DTree2() {
  const gtlloaderTree = new GLTFLoader();

  gtlloaderTree.load(
  
      './modelos/tree.glb',

      function (gltf) {
          const tree = gltf.scene;
          tree.scale.set(0.5, 0.5, 0.5);
          tree.position.set(27, 0, 5);
          scene.add(gltf.scene);
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
}

function load3DTree9() {
  const gtlloaderTree = new GLTFLoader();

  gtlloaderTree.load(
  
      './modelos/tree.glb',

      function (gltf) {
          const tree = gltf.scene;
          tree.scale.set(0.5, 0.5, 0.5);
          tree.position.set(27, 0, 14);
          scene.add(gltf.scene);
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
}

function load3DTree3() {
  const gtlloaderTree = new GLTFLoader();

  gtlloaderTree.load(
  
      './modelos/tree.glb',

      function (gltf) {
          const tree = gltf.scene;
          tree.scale.set(0.5, 0.5, 0.5);
          tree.position.set(27, 0, 8);
          scene.add(gltf.scene);
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
}

function load3DTree4() {
  const gtlloaderTree = new GLTFLoader();
  gtlloaderTree.load(
      './modelos/tree.glb',
      function (gltf) {
          const tree = gltf.scene;
          tree.scale.set(0.5, 0.5, 0.5);
          tree.position.set(27, 0, 11);
          scene.add(gltf.scene);
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
}

function load3DTree5() {
  const gtlloaderTree = new GLTFLoader();
  gtlloaderTree.load(
      './modelos/tree.glb',
      function (gltf) {
          const tree = gltf.scene;
          tree.scale.set(0.5, 0.5, 0.5);
          tree.position.set(27, 0, 27);
          scene.add(gltf.scene);
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
}

function load3DTree6() {
  const gtlloaderTree = new GLTFLoader();
  gtlloaderTree.load(
      './modelos/tree.glb',
      function (gltf) {
          const tree = gltf.scene;
          tree.scale.set(0.5, 0.5, 0.5);
          tree.position.set(27, 0, 24);
          scene.add(gltf.scene);
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
}

function load3DTree7() {
  const gtlloaderTree = new GLTFLoader();
  gtlloaderTree.load(
      './modelos/tree.glb',
      function (gltf) {
          const tree = gltf.scene;
          tree.scale.set(0.5, 0.5, 0.5);
          tree.position.set(27, 0, 21);
          scene.add(gltf.scene);
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
}

function load3DTree8() {
  const gtlloaderTree = new GLTFLoader();
  gtlloaderTree.load(
      './modelos/tree.glb',
      function (gltf) {
          const tree = gltf.scene;
          tree.scale.set(0.5, 0.5, 0.5);
          tree.position.set(27, 0, 18);
          scene.add(gltf.scene);
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
}


function load3DWindMill() {
  const gtlloaderWindMill = new GLTFLoader();
  gtlloaderWindMill.load(
      // resource URL
      './modelos/wind.glb',
      // called when the resource is loaded
      function (gltf) {
          const windmill = gltf.scene;
          scene.add(gltf.scene);
          windmill.position.y = 0;
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
}

// LOAD TORIIs ----------------------------------------------------------------


function load3DTorii1(){
  const gtlloaderTorii = new GLTFLoader();

  gtlloaderTorii.load(
    // resource URL
    './modelos/torii.glb',

    // called when the resource is loaded
    function ( gltf ) {
      const torii = gltf.scene;
      torii.scale.set(2.5, 2.5, 2.5);
      torii.position.set(16,0,15);
      torii.rotateY(Math.PI / 2);
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
  );
}

function load3DTorii2(){
  const gtlloaderTorii = new GLTFLoader();

  gtlloaderTorii.load(
    // resource URL
    './modelos/torii.glb',

    // called when the resource is loaded
    function ( gltf ) {
      const torii = gltf.scene;
      torii.scale.set(2.5, 2.5, 2.5);
      torii.position.set(13,0,15);
      torii.rotateY(Math.PI / 2);
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
  );
}

function load3DTorii3(){
  const gtlloaderTorii = new GLTFLoader();

  gtlloaderTorii.load(
    // resource URL
    './modelos/torii.glb',

    // called when the resource is loaded
    function ( gltf ) {
      const torii = gltf.scene;
      torii.scale.set(2.5, 2.5, 2.5);
      torii.position.set(10,0,15);
      torii.rotateY(Math.PI / 2);
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
  );
}

function load3DBench(position){
  const gtlloaderBench = new GLTFLoader();

  gtlloaderBench.load(
    // resource URL
    './modelos/bench.glb',

    function ( gltf ) {
      const bench = gltf.scene;
      bench.position.copy(position);
      bench.scale.set(2, 2, 2);
      torii.position.set(15,0,15);
      scene.add( gltf.scene );
    },
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
      console.log( 'An error happened' );
    }
  );
}

function load3DArcade(position) {
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
}


function load3DPagoda() {
    const gtlloaderPagoda = new GLTFLoader();

    gtlloaderPagoda.load(

      './modelos/pagoda.glb',
      function (gltf) {
          const pagoda = gltf.scene;
          pagoda.scale.set(0.25, 0.25, 0.25);
          pagoda.position.set(22, 0, 15);
          scene.add(gltf.scene);

          },
          function (xhr) {
              console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },
          function (error) {
              console.log('An error happened');
          }
      );
}


function load3DVendingMachine(position){

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
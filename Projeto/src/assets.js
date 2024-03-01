import * as THREE from 'three';

const cube = new THREE.BoxGeometry(1, 1, 1);
const sphere = new THREE.SphereGeometry(5, 20, 20);
const sphere2 = new THREE.SphereGeometry(5, 20, 20);
let loader = new THREE.TextureLoader();


function loadTexture(url) {
  const tex = loader.load(url)
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

const textures = {
    'grass': loadTexture('./textures/relva.jpg'),
    'snow': loadTexture('./textures/neve.png'),

    'sun': loadTexture('./textures/sun.jpg'),
    'moon': loadTexture('./textures/moon.jpg'),

    'road' : loadTexture('./textures/road.jpg'),

    'home1': loadTexture('./textures/edificio1.png'),
    'home2': loadTexture('./textures/edificio1.png'),
    'home3': loadTexture('./textures/edificio1.png'),

    'tree1': loadTexture('./textures/edificio2.png'),
    'tree2': loadTexture('./textures/edificio2.png'),
    'tree3': loadTexture('./textures/edificio2.png'),

    'vendingMachine1': loadTexture('./textures/edificio3.png'),
    'vendingMachine2': loadTexture('./textures/edificio3.png'),
    'vendingMachine3': loadTexture('./textures/edificio3.png'),

    'windmill1': loadTexture('./textures/edificio3.png'),
    'windmill2': loadTexture('./textures/edificio3.png'),
    'windmill3': loadTexture('./textures/edificio3.png'),

    'torii1': loadTexture('./textures/torii.jpg'),
    'torii2': loadTexture('./textures/torii.jpg'),
    'torii3': loadTexture('./textures/torii.jpg'),

    'bench1': loadTexture('./textures/bench.jpg'),
    'bench2': loadTexture('./textures/bench.jpg'),
    'bench3': loadTexture('./textures/bench.jpg'),

    'wall1': loadTexture('./textures/edificio1.png'),
    'wall2': loadTexture('./textures/edificio1.png'),
    'wall3': loadTexture('./textures/edificio1.png'),

    'arcade1': loadTexture('./textures/edificio3.png'),
    'arcade2': loadTexture('./textures/edificio3.png'),
    'arcade3': loadTexture('./textures/edificio3.png'),

  };

function getTopMaterial() {
  return new THREE.MeshLambertMaterial({ color: 0x555555 });
}

function getSideMaterial(textureName) {
  return new THREE.MeshLambertMaterial({ map: textures[textureName].clone() })
}

export function createAssetInstance(type, x, y, data) {
  // If asset exists, configure it and return it
  if (type in assets) {
    return assets[type](x, y, data);
  } else {
    console.warn(`Asset Type ${type} is not found.`);
    return undefined;
  }
}

// Asset library
const assets = {
  'sun': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ map: textures.sun });
    const mesh = new THREE.Mesh(sphere, material);
    mesh.userData = { x, y };
    mesh.position.set(8, 40, 8);
    mesh.receiveShadow = false;
    return mesh;
  },
  

  'moon': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ map: textures.moon });
    const mesh = new THREE.Mesh(sphere2, material);
    mesh.userData = { x, y };
    mesh.position.set(8, -40, 8); 
    mesh.receiveShadow = false;
    return mesh;
  },

  'grass': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ map: textures.grass });
    const mesh = new THREE.Mesh(cube, material);
    mesh.userData = { x, y };
    mesh.position.set(x, -0.5, y);
    mesh.receiveShadow = true;
    return mesh;
  },

  'snow': (x, y) => {
    const material = new THREE.MeshLambertMaterial({ map: textures.snow });
    const mesh = new THREE.Mesh(cube, material);
    mesh.userData = { x, y };
    mesh.position.set(x, -0.5, y);
    mesh.receiveShadow = true;
    return mesh;
  },


  // 'home': (x, y, data) => createZoneMesh(x, y, data),
  // 'tree': (x, y, data) => createZoneMesh(x, y, data),
  // 'vendingMachine': (x, y, data) => createZoneMesh(x, y, data),
  // 'windmill': (x, y, data) => createZoneMesh(x, y, data),
  // 'torii': (x, y, data) => createZoneMesh(x, y, data),
  // 'bench': (x, y, data) => createZoneMesh(x, y, data),
  'wall': (x, y, data) => createZoneMesh(x, y, data),
  // 'arcade': (x, y, data) => createZoneMesh(x, y, data),

  // 'road': (x, y) => {
  //   const material = new THREE.MeshLambertMaterial({ map: textures.road });
  //   const mesh = new THREE.Mesh(cube, material);
  //   mesh.userData = { x, y };
  //   mesh.scale.set(1, 0.02, 1);
  //   mesh.position.set(x, 0.01, y);
  //   mesh.receiveShadow = true;
  //   return mesh;
  // }
}

function createZoneMesh(x, y, data) {
  const textureName = data.type + data.style;

  const topMaterial = getTopMaterial();
  const sideMaterial = getSideMaterial(textureName);
  let materialArray = [
    sideMaterial, 
    sideMaterial, 
    topMaterial, 
    topMaterial, 
    sideMaterial, 
    sideMaterial, 
  ];
  let mesh = new THREE.Mesh(cube, materialArray);
  mesh.userData = { x, y };
  mesh.scale.set(1, (data.height - 0.95) / 2, 1);
  mesh.material.forEach(material => material.map?.repeat.set(1, data.height - 1));
  mesh.position.set(x, (data.height - 0.95) / 4, y);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
import { createScene } from './scene2.js';
import { createCity } from './city.js';
import buildingFactory from './buildings.js';

window.onload = () => {
  window.game = createGame();
}
export function createGame() {
  let selectedControl = document.getElementById('button-select');
  let activeToolId = 'select';

  const scene = createScene();
  const city = createCity(30);

  scene.initialize(city);

  document.addEventListener('wheel', scene.camera.onMouseScroll, false);
  document.addEventListener('mousedown', onMouseDown, false);
  document.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('resize', scene.onResize, false);

  document.addEventListener('contextmenu', (event) => event.preventDefault(), false);

  function update() {
    city.update();
    scene.update(city);
  }




  function onMouseDown(event) {
    if (event.button === 0) {
      const selectedObject = scene.getSelectedObject(event);
      useActiveTool(selectedObject);
    }
  };

  let lastMove = new Date();

  function onMouseMove(event) {
    if (Date.now() - lastMove < (1 / 60.0)) return;
    lastMove = Date.now();
    const hoverObject = scene.getSelectedObject(event);
    scene.setHighlightedObject(hoverObject);
    if (hoverObject && event.buttons & 1) {
      useActiveTool(hoverObject);
    }
    scene.camera.onMouseMove(event);
  }

  function onToolSelected(event) {
    if (selectedControl) {
      selectedControl.classList.remove('selected');
    }
    selectedControl = event.target;
    selectedControl.classList.add('selected');

    activeToolId = selectedControl.getAttribute('data-type');
    console.log(activeToolId);
  }

  function useActiveTool(object) {
    if (!object || object.userData.ignoreSelection) {
      // updateInfoPanel(null);
      return;
    }

    const { x, y } = object.userData;
    const tile = city.tiles[x][y];

    if (activeToolId === 'select') {
      scene.setActiveObject(object);
      // updateInfoPanel(tile);
    } else if (activeToolId === 'bulldoze') {
      bulldoze(tile);
    } else if (!tile.building) {
      placeBuilding(tile);
    } else if (activeToolId === 'upgrade'){
      upgradeBuilding(tile);
    }
  }


  function upgradeBuilding(tile) {
    if (tile.building && tile.building.type == 'wall') {
      if (tile.building.height < 5) {
        tile.building.height++;
        tile.building.updated = true;
        scene.update(city);
      } else {
        console.log("Maximum height reached.");
      }
    } else if (!tile.building) {
      console.log("No building to upgrade.");
    } else {
      console.log("Cannot upgrade road.");
    }
  }


  function bulldoze(tile) {
    console.log(activeToolId);
    tile.building = undefined;
    scene.update(city);
    console.log(tile);
  }

  function placeBuilding(tile) {
    const buildingFunction = buildingFactory[activeToolId];
    if (typeof buildingFunction === 'function') {
      tile.building = buildingFunction();
      tile.building.height = 1;
      scene.update(city);
    } else if(activeToolId === 'upgrade') {
      console.log("Grass cannot be upgraded");
    } else {
      console.log("Invalid active tool id:", activeToolId);
    }
  }


  setInterval(() => {
    game.update();
  }, 1000)

  scene.start();

  return {
    update,
    onToolSelected,
    upgradeBuilding,
  };
}
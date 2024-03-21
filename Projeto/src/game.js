import { createScene } from './scene.js';
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

  // function updateInfoPanel(tile) {
  //   const infoPanel = document.getElementById('selected-object-info');
  //   if (tile) {
  //     let message;
  //     switch (tile.building?.type) {
  //       case 'sun':
  //         message = `Sun: A shining star of Fire, its light allows our eveyday daylight. It sure is beautiful.`;
  //         break;
  //       case 'home':
  //         message = `House: A good looking house, reminds me of home. I wonder who lives here.`;
  //         break;
  //       case 'tree':
  //         message = `Tree: A normal looking Tree. It looks old, maybe a few centuries old.`;
  //         break;
  //       case 'vendingMachine':
  //         message = `Vending Machine: A vending machine, after a closer look, its filled with snacks.`;
  //         break;
  //       case 'windmill':
  //         message = `Windmill: You can hear the wind blowing around you.`;
  //         break;
  //       case 'torii':
  //         message = `Torii: The japanese entrance to a sacred place. You somehow feel calmer around it.`;
  //         break;
  //       case 'bench':
  //         message = `Bench: Oh nice, a bench, my legs were starting to feel a bit tired.`;
  //         break;
  //       case 'wall':
  //         message = `Wall: A large wall, looks like its still under construction.`;
  //         break;
  //       case 'arcade':
  //         message = `Arcade: The oldschool way of playing games, my father used to play these with his friends back in the day.`;
  //         break;
  //       case 'road':
  //         message = `Road: This is a road tile, used for transportation.`;
  //         break;
  //       default:
  //         message = `Grass: Ah, the scent of freshly cut grass, such a nostalgic embrace.`;
  //         break;
  //     }
  //     infoPanel.innerHTML = message;
  //   } else {
  //     infoPanel.innerHTML = '';
  //   }
  // }

  function bulldoze(tile) {
    console.log(activeToolId);
    tile.building = undefined;
    scene.update(city);
    console.log(tile);
  }

  function placeBuilding(tile) {
    const buildingFunction = buildingFactory[activeToolId];
    if (typeof buildingFunction === 'function') {
      tile.building = buildingFunction(); // Create building object
      // Set initial height to 1
      tile.building.height = 1;
      scene.update(city); // Update scene
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
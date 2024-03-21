import * as THREE from "three";

export function createCamera(gameWindow){

    const grauParaRadiano = Math.PI/180.0;
    const botao_rato_meio = 4;
    const bota_rato_direita = 2;

    const raio_min_camera = 10;
    const raio_max_camera = 150;
    const elevacao_min_camera = 10;
    const elevacao_max_camera = 90;

    const sensibilidade_angulo = 0.2;
    const sensibilidade_elevacao = 0.2;
    const sensibilidade_zoom = 0.01;
    const sensibilidade_panorama = -0.01;

    const Y_AXIS = new THREE.Vector3(0, 1, 0);

    const camera = new THREE.PerspectiveCamera(45, gameWindow.offsetWidth / gameWindow.offsetHeight, 0.1, 1000);

    let origemCamera = new THREE.Vector3(6,0,6);
    let raioCamera = 30;
    let anguloCamera = 135;
    let elevacaoCamera = 45;

    updateCameraPosition();

    function onMouseMove(event) {
        if (event.buttons & bota_rato_direita) {
          anguloCamera += -(event.movementX * sensibilidade_angulo);
          elevacaoCamera += (event.movementY * sensibilidade_elevacao);
          elevacaoCamera = Math.min(elevacao_max_camera, Math.max(elevacao_min_camera, elevacaoCamera));
        }
    
        if (event.buttons & botao_rato_meio) {
          const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, anguloCamera * grauParaRadiano);
          const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y_AXIS, anguloCamera * grauParaRadiano);
          origemCamera.add(forward.multiplyScalar(sensibilidade_panorama * event.movementY));
          origemCamera.add(left.multiplyScalar(sensibilidade_panorama * event.movementX));
        }
    
        updateCameraPosition();
      }

      function onMouseScroll(event) {
        raioCamera += event.deltaY * sensibilidade_zoom;
        raioCamera = Math.min(raio_max_camera, Math.max(raio_min_camera, raioCamera));
      }

    function updateCameraPosition(){
        camera.position.x = raioCamera * Math.sin(anguloCamera * grauParaRadiano) * Math.cos(elevacaoCamera*grauParaRadiano);
        camera.position.y = raioCamera * Math.sin(elevacaoCamera * grauParaRadiano);
        camera.position.z = raioCamera * Math.cos(anguloCamera * grauParaRadiano) * Math.cos(elevacaoCamera*grauParaRadiano);
        camera.position.add(origemCamera);
        camera.lookAt(origemCamera);
        camera.updateMatrix();
    }

    return{
        camera, updateCameraPosition, onMouseMove, onMouseScroll
    }
}
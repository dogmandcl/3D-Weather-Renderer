import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';



let scene, camera, renderer;
const loader = new GLTFLoader();
let weatherString = "";
let cToF = false;
let locString = "";
let previousTextMesh = null;
let previousModel = null;
let geometry = new THREE.BoxGeometry();
let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
let cube = new THREE.Mesh(geometry, material);




const models = [
  { url: 'https://dogmandcl.github.io/modelingResources/CLOUDS.glb', id: 'clouds' },
  { url: 'https://dogmandcl.github.io/modelingResources/DARK_CLOUDS.glb', id: 'darkclouds' },
  { url: 'https://dogmandcl.github.io/modelingResources/rain.glb', id: 'rain' },
  { url: 'https://dogmandcl.github.io/modelingResources/snow.glb', id: 'snow' },
  { url: 'https://dogmandcl.github.io/modelingResources/SUN.glb', id: 'sun' },


];
let controls;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);


  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; 
  controls.dampingFactor = 0.05;


  camera.position.set(0, 0, 5);
  controls.update();

 
  scene.add(cube);

  animate();
}

function loadFonts() {
  let fontLoader = new FontLoader();

  if (previousTextMesh != null){
    scene.remove(previousTextMesh);
    previousTextMesh.geometry.dispose();
    previousTextMesh.material.dispose();
  }
  
  fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new TextGeometry(`${weatherString}`, {
        font: font,
        size: .3,
        depth: 0
    });


    let textMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    let textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-2, 2, 0);
    scene.add(textMesh);
    previousTextMesh = textMesh;

  });
}

function loadModelById(id) {
  scene.remove(cube)
  if (previousModel != null) {
    scene.remove(previousModel);
    previousModel.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
    previousModel = null;
  }

  const model = models.find(m => m.id === id);
  if (!model) {
    console.error('Model not found');
    return;
  }

  loader.load(model.url, function (gltf) {
    const modelScene = gltf.scene;

    if(id == 'sun'){
    modelScene.position.set(1.5, -2, 0);
    modelScene.scale.set(.3, .3, .3);
    }else{
      console.log("NOTSUN")
      modelScene.position.set(0, -.5, 0);
      modelScene.scale.set(.1, .1, .1);
    }

  

  
    scene.add(modelScene);

  
    previousModel = modelScene;

  }, undefined, function (error) {
    console.error('An error happened while loading the model', error);
  });
}



async function getLatLon(location) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
  const data = await response.json();
  if (data.length > 0) {
      const { lat, lon } = data[0];
      return { latitude: lat, longitude: lon };
  } else {
      alert("Location not found!");
  }
}


async function getWeatherData(lat, lon) {
  const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
  const weatherData = await weatherResponse.json();
  return weatherData.current_weather;
}


function displayWeatherModel(weatherCode) {
  switch (weatherCode) {
      case 0: // Clear sky
          console.log("Clear sky! Display sunny model.");
          weatherString = `${weatherString} Sunny`
          loadModelById('sun')
          break;
      case 1: // Mainly clear
          console.log("Mainly clear! Display partly cloudy model.");
          weatherString = `${weatherString} Partly Cloudy`
          loadModelById('clouds')
          
          break;
      case 2: // Partly cloudy
          console.log("Partly cloudy! Display partly cloudy model.");
          weatherString = `${weatherString} Partly Cloudy`
          loadModelById('clouds')
          
          break;
      case 3: // Overcast
          console.log("Overcast! Display cloudy model.");
          weatherString = `${weatherString}  Overcast`
          loadModelById('darkclouds')
         
          break;
      case 61: // Rainy
          console.log("Rainy! Display rain model.");
          weatherString = `${weatherString} Rainy`
          loadModelById('rain')
       
          break;
      case 80: // Rainy
          console.log("Rainy! Display rain model.");
          weatherString = `${weatherString} Rainy`
          loadModelById('rain')
       
          break;
      case 81: // Rainy
          console.log("Rainy! Display rain model.");
          weatherString = `${weatherString} Rainy`
          loadModelById('rain')
       
          break;
      default:
          console.log("Weather not recognized, default model.");
  }
}






function animate() {
  requestAnimationFrame(animate);
  controls.update();
 
  renderer.render(scene, camera);
}
document.getElementById('CF').addEventListener('click', async () => {
  if(!cToF){
    cToF = true;
  }else{
    cToF = false;
  }
});

document.getElementById('getWeather').addEventListener('click', async () => {
  const location = document.getElementById('locationInput').value;
  locString = location;
  const latLon = await getLatLon(location);
  console.log("pushed");
  if (latLon) {
      const weatherData = await getWeatherData(latLon.latitude, latLon.longitude);
      console.log(weatherData);
      if(cToF){
        weatherString = `    Weather in ${locString} is \n ${((weatherData.temperature * 9/5) + 32).toFixed(2)} degrees and`  
      }else{weatherString = `    Weather in ${locString} is \n ${weatherData.temperature} degrees and`  };;
      console.log(locString); 
      displayWeatherModel(weatherData.weathercode);
      loadFonts();
    
  }
});

init();


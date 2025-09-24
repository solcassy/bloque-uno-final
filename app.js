///////// SCAFFOLD.
// 1. Importar librerías.
console.log(THREE);
console.log(gsap);

// 2. Configurar canvas.
const canvas = document.getElementById("lienzo");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 3. Configurar escena 3D.
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvas.width, canvas.height);
renderer.setClearColor("#0a0c2c");
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);

// 3.1 Configurar mesh.
const geo = new THREE.TorusKnotGeometry(1, 0.35, 128, 5, 2);

const material = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    //wireframe: true,
});
const mesh = new THREE.Mesh(geo, material);
scene.add(mesh);
mesh.position.z = -7;

// 3.2 Crear luces.
const frontLight = new THREE.PointLight("#ffffff", 300, 100);
frontLight.position.set(7, 3, 3);
scene.add(frontLight);

const rimLight = new THREE.PointLight("#0066ff", 50, 100);
rimLight.position.set(-7, -3, -7);
scene.add(rimLight);



///////// EN CLASE.

//// A) Cargar múltiples texturas.
// 1. "Loading manager".
const manager = new THREE.LoadingManager();

manager.onStart = function (url, itemsLoaded, itemsTotal) {
   console.log(`Iniciando carga de: ${url} (${itemsLoaded + 1}/${itemsTotal})`);
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
   console.log(`Cargando: ${url} (${itemsLoaded}/${itemsTotal})`);
};

manager.onLoad = function () {
   console.log('✅ ¡Todas las texturas cargadas!');
   createMaterial();
};

manager.onError = function (url) {
   console.error(`❌ Error al cargar: ${url}`);
};

// 2. "Texture loader" para nuestros assets.
const loader = new THREE.TextureLoader(manager);

// 3. Cargamos texturas guardadas en el folder del proyecto.
const tex = {
   albedo: loader.load('./assets/texturas/beige-stonework_albedo.png'),
   ao: loader.load('./assets/texturas/beige-stonework_ao.png'),
   metalness: loader.load('./assets/texturas/beige-stonework_metallic.png'),
   normal: loader.load('./assets/texturas/beige-stonework_normal-ogl.png'),
   roughness: loader.load('./assets/texturas/beige-stonework_roughness.png'),
   displacement: loader.load('./assets/texturas/beige-stonework_height.png'),
};

// 4. Definimos variables y la función que va a crear el material al cargar las texturas.
var pbrMaterial;

function createMaterial() {
   pbrMaterial = new THREE.MeshStandardMaterial({
       map: tex.albedo,
       aoMap: tex.ao,
       metalnessMap: tex.metalness,
       normalMap: tex.normal,
       roughnessMap: tex.roughness,
       displacementMap: tex.displacement,
       displacementScale: 1,
       side: THREE.FrontSide,
       // wireframe: true,
   });

   mesh.material = pbrMaterial;
}



//// B) Rotación al scrollear.
// 1. Crear un objeto con la data referente al SCROLL para ocuparla en todos lados.
var scroll = {
    y: 0,
    lerpedY: 0,
    speed: 0.01,
    cof: 0.07
 };
 
 // 2. Escuchar el evento scroll y actualizar el valor del scroll.
 function updateScrollData(eventData) {
    scroll.y += eventData.deltaX * scroll.speed;
 }
 
 window.addEventListener("wheel", updateScrollData);
 function updateMeshRotation() {
    mesh.rotation.y = scroll.lerpedY;
 }
 

 // 5. Vamos a suavizar un poco el valor de rotación para que los cambios de dirección sean menos bruscos.
function lerpScrollY() {
    scroll.lerpedY += (scroll.y - scroll.lerpedY) * scroll.cof;
 }
 

//// C) Movimiento de cámara con mouse (fricción) aka "Gaze Camera".
var mouse = {
    x: 0,
    y: 0,
    normalOffset: {
        x: 0,
        y: 0
    },
    lerpNormalOffset: {
        x: 0,
        y: 0
    },
 
    cof: 0.07,
    gazeRange: {
        x: 70,
        y: 30
    }


 }
 function updateMouseData(eventData) {
    updateMousePosition(eventData);
    calculateNormalOffset();
 }
 function updateMousePosition(eventData) {
    mouse.x = eventData.clientX;
    mouse.y = eventData.clientY;
 }
 function calculateNormalOffset() {
    let windowCenter = {
        x: canvas.width / 2,
        y: canvas.height / 2,
    }
    mouse.normalOffset.x = ( (mouse.x - windowCenter.x) / canvas.width ) * 2;
    mouse.normalOffset.y = ( (mouse.y - windowCenter.y) / canvas.height ) * 2;
 }
 
 window.addEventListener("mousemove", updateMouseData);


 function updateCameraPosition() {
    camera.position.x = mouse.normalOffset.x * mouse.gazeRange.x;
    camera.position.y = -mouse.normalOffset.y * mouse.gazeRange.y;
 }
  

///////// FIN DE LA CLASE.





/////////
// Final. Crear loop de animación para renderizar constantemente la escena.
function animate() {
    requestAnimationFrame(animate);
    lerpScrollY()
   // mesh.rotation.x -= 0.005;
    updateMeshRotation();
    updateCameraPosition();
    camera.lookAt(mesh.position);
    renderer.render(scene, camera);
}

animate();
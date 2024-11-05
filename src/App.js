// App.js
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import GUI from "lil-gui";

const App = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Scene and Renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
    camera.position.set(0, 1.2, -2); // Adjusted camera height for first-person perspective
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(sizes.width, sizes.height);

    // PointerLockControls
    const controls = new PointerLockControls(camera, renderer.domElement);

    // Add a click event listener to enable pointer lock when the canvas is clicked
    canvasRef.current.addEventListener("click", () => {
      controls.lock();
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // GUI Controls
    const gui = new GUI();
    const ambientFolder = gui.addFolder("Ambient Light");
    ambientFolder.add(ambientLight, "intensity", 0, 1, 0.01).name("Intensity");

    const dirLightFolder = gui.addFolder("Directional Light");
    dirLightFolder.add(directionalLight.position, "x", -10, 10, 0.1).name("Position X");
    dirLightFolder.add(directionalLight.position, "y", -10, 10, 0.1).name("Position Y");
    dirLightFolder.add(directionalLight.position, "z", -10, 10, 0.1).name("Position Z");
    dirLightFolder.add(directionalLight, "intensity", 0, 2, 0.01).name("Intensity");

    // Model Loading
    const loader = new GLTFLoader();
    const modelUrl = "/scene_pro2.glb";


    let cubeBoundingBox; // Bounding box for the cube
    let roomCube; // Declare roomCube here so it's accessible in tick

    loader.load(
      modelUrl.href,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        // Log all child objects to find their names
        model.traverse((child) => {
          if (child.isMesh) {
            console.log("Found object:", child.name); // Logs the name of each object in the model
          }
        });

        // Find the cube room object specifically
        roomCube = model.children.find((child) => child.name === "Cube_1"); // Replace "Cube" with actual name if different
        if (roomCube) {
          cubeBoundingBox = new THREE.Box3().setFromObject(roomCube);
          console.log("Bounding box for the cube has been set:", cubeBoundingBox);
        } else {
          console.log("Cube not found in the model.");
        }
      },
      undefined,
      (error) => {
        console.error("An error occurred while loading the GLB model:", error);
      }
    );

    // First-Person Movement
    const movement = { forward: false, backward: false, left: false, right: false };
    const speed = 5;

    // Event Listeners for Movement
    const handleKeyDown = (event) => {
      switch (event.code) {
        case "KeyW":
          movement.forward = true;
          break;
        case "KeyS":
          movement.backward = true;
          break;
        case "KeyA":
          movement.left = true;
          break;
        case "KeyD":
          movement.right = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case "KeyW":
          movement.forward = false;
          break;
        case "KeyS":
          movement.backward = false;
          break;
        case "KeyA":
          movement.left = false;
          break;
        case "KeyD":
          movement.right = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Animation Loop
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = clock.getDelta();

      // Calculate direction
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      direction.y = 0;
      direction.normalize();

      // Calculate potential new position for collision detection
      const nextPosition = controls.object.position.clone();

      // Movement Controls
      if (movement.forward) {
        nextPosition.add(direction.clone().multiplyScalar(speed * delta));
      }
      if (movement.backward) {
        nextPosition.add(direction.clone().multiplyScalar(-speed * delta));
      }

      const sideDirection = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
      if (movement.left) {
        nextPosition.add(sideDirection.multiplyScalar(speed * delta));
      }
      if (movement.right) {
        nextPosition.add(sideDirection.multiplyScalar(-speed * delta));
      }

      // Collision detection: only update position if there’s no collision
      if (cubeBoundingBox && cubeBoundingBox.containsPoint(nextPosition)) {
        console.log("Collision detected with object:", roomCube ? roomCube.name : "Unknown Object");
      } else {
        controls.object.position.copy(nextPosition);
      }

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };

    tick();

    // Handle Window Resize
    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      gui.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="webgl" />;
};

export default App;

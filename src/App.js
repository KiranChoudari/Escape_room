// App.js
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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

    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      1000
    );
    camera.position.set(0, 1.2, -2); // Adjusted camera height for first-person perspective
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(sizes.width, sizes.height);

    // PointerLockControls
    const controls = new PointerLockControls(camera, renderer.domElement);
    canvasRef.current.addEventListener("click", () => controls.lock());

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
    dirLightFolder
      .add(directionalLight.position, "x", -10, 10, 0.1)
      .name("Position X");
    dirLightFolder
      .add(directionalLight.position, "y", -10, 10, 0.1)
      .name("Position Y");
    dirLightFolder
      .add(directionalLight.position, "z", -10, 10, 0.1)
      .name("Position Z");
    dirLightFolder
      .add(directionalLight, "intensity", 0, 2, 0.01)
      .name("Intensity");
    dirLightFolder.close(); // Close Directional Light folder by default

    // Model Loading (Room)
    const loader = new GLTFLoader();
    const modelUrl = new URL("./scene_pro2.glb", import.meta.url);

    loader.load(
      modelUrl.href,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
      },
      undefined,
      (error) => {
        console.error("An error occurred while loading the GLB model:", error);
      }
    );

    /*
    // Chair Model Loading
    const chairLoader = new GLTFLoader();
    const chairModelUrl = new URL("./furniture1.glb", import.meta.url);

    chairLoader.load(
      chairModelUrl.href,
      (gltf) => {
        const chair = gltf.scene;
        chair.position.set(-10.1, 0, 0.85); // Position it in front of the camera
        chair.scale.set(1, 1, 1);
        scene.add(chair);
        console.log("Chair model loaded successfully");
      },
      undefined,
      (error) => {
        console.error(
          "An error occurred while loading the chair model:",
          error
        );
      }
    );

    // workbench Model Loading
    const workbenchLoader = new GLTFLoader();
    const workbenchModelUrl = new URL("./workbench.glb", import.meta.url);

    workbenchLoader.load(
      workbenchModelUrl.href,
      (gltf) => {
        const workbench = gltf.scene;
        workbench.position.set(-10, 0, 8); // Position it in front of the camera
        workbench.scale.set(1, 1, 1);
        scene.add(workbench);
        console.log("workbench model loaded successfully");
      },
      undefined,
      (error) => {
        console.error(
          "An error occurred while loading the workbench model:",
          error
        );
      }
    );

    // drawer Model Loading
    const drawerLoader = new GLTFLoader();
    const drawerModelUrl = new URL("./furniture2.glb", import.meta.url);

    drawerLoader.load(
      drawerModelUrl.href,
      (gltf) => {
        const drawer = gltf.scene;
        drawer.position.set(-5.5, 0,4.09); // Position it in front of the camera
        drawer.scale.set(0.5,0.5,0.5);
        scene.add(drawer);
        console.log("drawer model loaded successfully");
      },
      undefined,
      (error) => {
        console.error("An error occurred while loading the drawer model:", error);
      }
    );


    // bag Model Loading
    const bagLoader = new GLTFLoader();
    const bagModelUrl = new URL("./bag.glb", import.meta.url);

    bagLoader.load(
      bagModelUrl.href,
      (gltf) => {
        const bag = gltf.scene;
        bag.position.set(-10.2, 0,6.5); // Position it in front of the camera
        bag.scale.set(0.2,0.2,0.2);
        scene.add(bag);
        console.log("bag model loaded successfully");
      },
      undefined,
      (error) => {
        console.error("An error occurred while loading the bag model:", error);
      }
    );

    */
    // Raycaster for detecting mouse click coordinates
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseClick = (event) => {
      // Calculate mouse position in normalized device coordinates (-1 to +1)
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update raycaster with the mouse position and camera
      raycaster.setFromCamera(mouse, camera);

      // Find intersections
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const { x, y, z } = intersect.point;
        console.log(
          `Mouse clicked at coordinates: x=${x.toFixed(2)}, y=${y.toFixed(
            2
          )}, z=${z.toFixed(2)}`
        );
      }
    };

    canvasRef.current.addEventListener("click", handleMouseClick);

    // First-Person Movement
    const movement = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };
    const speed = 5;

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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const clock = new THREE.Clock();
    const tick = () => {
      const delta = clock.getDelta();
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      direction.y = 0;
      direction.normalize();

      if (movement.forward)
        controls
          .getObject()
          .position.add(direction.clone().multiplyScalar(speed * delta));
      if (movement.backward)
        controls
          .getObject()
          .position.add(direction.clone().multiplyScalar(-speed * delta));
      const sideDirection = new THREE.Vector3()
        .crossVectors(camera.up, direction)
        .normalize();
      if (movement.left)
        controls
          .getObject()
          .position.add(sideDirection.multiplyScalar(speed * delta));
      if (movement.right)
        controls
          .getObject()
          .position.add(sideDirection.multiplyScalar(-speed * delta));

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };
    tick();

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
      canvasRef.current.removeEventListener("click", handleMouseClick);
      gui.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="webgl" />;
};

export default App;
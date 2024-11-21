import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import PuzzleOne from "./PuzzleOne"; // Assuming this is a puzzle component you're importing

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
    camera.position.set(0, 1.2, -2);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(sizes.width, sizes.height);

    // PointerLockControls
    const controls = new PointerLockControls(camera, renderer.domElement);
    canvasRef.current.addEventListener("click", () => {
      controls.lock();
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Load Model
    const loader = new GLTFLoader();
    const modelUrl = new URL("./scene.glb", import.meta.url);

    loader.load(
      modelUrl.href,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
      },
      undefined,
      (error) => {
        console.error("Error loading the GLB model:", error);
      }
    );

    // Doors and Bounding Boxes
    const doors = [];

    // Add door_1 (plane)
    const geometry = new THREE.PlaneGeometry(1, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const door1 = new THREE.Mesh(geometry, material);
    door1.position.set(0, 1,3.565);
    door1.scale.set(1, 2, 1);
    door1.name = "door_1";
    scene.add(door1);
    doors.push(new THREE.Box3().setFromObject(door1));
    const obstacles = [];

    // Wall 1 green
    const wallGeometry = new THREE.BoxGeometry(16.714, 2, 0.5);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall1.position.set(3.930, 1.001, 4.223);
    wall1.rotation.y = THREE.MathUtils.degToRad(90);
    scene.add(wall1);
    obstacles.push(new THREE.Box3().setFromObject(wall1));

    // Wall 2
    const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall2.position.set(-3.836, 1.001,-0.629);
    wall2.rotation.y = THREE.MathUtils.degToRad(90);
    scene.add(wall2);
    obstacles.push(new THREE.Box3().setFromObject(wall2));

    // Adding additional bounding boxes
    const additionalWalls = [
      {
        position: new THREE.Vector3(-3.603,0.886,4.228),
        scale: new THREE.Vector3(5.685, 2, 1),
        rotation: new THREE.Euler(0, 0, 0),
        color: 0xff00ff, // Purple
      },
      {
        position: new THREE.Vector3(0,1,-5.029),
        scale: new THREE.Vector3(7.155, 2, 0.5),
        rotation: new THREE.Euler(0, 0, 0),
        color: 0x00ffff, // Cyan
      },
      {
        position: new THREE.Vector3(2.575,0.886,4.207),
        scale: new THREE.Vector3(4.187, 2, 1),
        rotation: new THREE.Euler(0, 0, 0),
        color: 0xff0000, // Red
      },
      {
        position: new THREE.Vector3(4.189,0,886,4.207),
        scale: new THREE.Vector3(4.187, 2, 1),
        rotation: new THREE.Euler(0, 0, 0),
        color: 0x0000ff, // Blue
      },
    ];

    additionalWalls.forEach((wall) => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: wall.color, wireframe: true });
      const newWall = new THREE.Mesh(geometry, material);
      newWall.position.copy(wall.position);
      newWall.scale.copy(wall.scale);
      newWall.rotation.copy(wall.rotation);
      scene.add(newWall);
      obstacles.push(new THREE.Box3().setFromObject(newWall));
    });

    // Movement Controls
    const movement = { forward: false, backward: false, left: false, right: false };
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

    // Animation Loop
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = clock.getDelta();
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      direction.y = 0;
      direction.normalize();

      const nextPosition = controls.object.position.clone();

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

      // Check for collisions with doors and walls
      const playerBox = new THREE.Box3().setFromCenterAndSize(
        nextPosition.clone(),
        new THREE.Vector3(0.5, 1.8, 0.5) // Approximate player's size
      );

      let collision = false;
      for (const doorBox of doors) {
        if (playerBox.intersectsBox(doorBox)) {
          collision = true;
          break;
        }
      }

      for (const obstacleBox of obstacles) {
        if (playerBox.intersectsBox(obstacleBox)) {
          collision = true;
          break;
        }
      }

      // Only update position if no collision
      if (!collision) {
        controls.object.position.copy(nextPosition);
      }

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };

    tick();

    // Puzzle Initialization
    const cleanupPuzzle = PuzzleOne(scene, doors);

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
      cleanupPuzzle();
    };
  }, []);

  return <canvas ref={canvasRef} className="webgl" />;
};

export default App;

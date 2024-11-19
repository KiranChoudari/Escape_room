import * as THREE from "three";
import GUI from "lil-gui";

export default function PuzzleOne(scene, doors) {
  // Generate a random target color with 2 decimal places
  const targetColor = {
    r: parseFloat((Math.random()).toFixed(2)),
    g: parseFloat((Math.random()).toFixed(2)),
    b: parseFloat((Math.random()).toFixed(2)),
  };

  console.log("Target Color:", targetColor); // Log target color to the console

  const playerColor = { r: 0.5, g: 0.5, b: 0.5 };

  // GUI for color adjustment
  const colorGui = new GUI();
  colorGui.add(playerColor, "r", 0, 1, 0.01).name("Red").onChange(updateColor);
  colorGui.add(playerColor, "g", 0, 1, 0.01).name("Green").onChange(updateColor);
  colorGui.add(playerColor, "b", 0, 1, 0.01).name("Blue").onChange(updateColor);

  // Create target color display
  const targetMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(targetColor.r, targetColor.g, targetColor.b),
  });
  const targetDisplay = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 0.1),
    targetMaterial
  );
  targetDisplay.position.set(-2, 1, -4);
  scene.add(targetDisplay);

  // Create player color display
  const playerMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(playerColor.r, playerColor.g, playerColor.b),
  });
  const playerDisplay = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 0.1),
    playerMaterial
  );
  playerDisplay.position.set(2, 1, -4);
  scene.add(playerDisplay);

  let door; // Reference to the door
  const targetDoorPosition = new THREE.Vector3(1, 1, 4.178); // Target position for the door
  let doorMoving = false; // Flag to indicate if the door is moving

  // Find the door object
  const findDoor = () => {
    door = scene.getObjectByName("door_1");
    if (!door) {
      console.warn("Door with name 'door_1' not found in the scene.");
    }
  };

  // Update player color and check solution
  function updateColor() {
    playerMaterial.color.setRGB(playerColor.r, playerColor.g, playerColor.b);
    checkSolution();
  }

  function checkSolution() {
    if (
      Math.abs(playerColor.r - targetColor.r) < 0.05 &&
      Math.abs(playerColor.g - targetColor.g) < 0.05 &&
      Math.abs(playerColor.b - targetColor.b) < 0.05
    ) {
      console.log("Puzzle Solved! Colors Matched!");
      doorMoving = true; // Start moving the door
    }
  }

  // Animate door movement
  function animateDoor() {
    if (door && doorMoving) {
      door.position.lerp(targetDoorPosition, 0.05); // Smooth movement

      if (door.position.distanceTo(targetDoorPosition) < 0.01) {
        door.position.copy(targetDoorPosition);
        doorMoving = false; // Stop movement once the door reaches the target position
        console.log("Door has reached its target position!");
      }

      // Update door bounding box after movement
      doors[0].setFromObject(door);
    }
  }

  // Animation Loop
  function tick() {
    animateDoor();
    requestAnimationFrame(tick);
  }
  tick();

  // Wait for door to be added to the scene
  setTimeout(findDoor, 1000); // Adjust delay if necessary

  return () => {
    colorGui.destroy();
    scene.remove(targetDisplay);
    scene.remove(playerDisplay);
  };
}

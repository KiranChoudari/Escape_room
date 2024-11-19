import { GUI } from 'lil-gui'; // Import lil-gui instead of dat.gui

// Circuit logic
const circuit = {
  wire1: false,
  wire2: false,
  wire3: false,
};

// GUI for toggling wires
const gui = new GUI();
gui.add(circuit, "wire1").name("Wire 1").onChange(checkCircuit);
gui.add(circuit, "wire2").name("Wire 2").onChange(checkCircuit);
gui.add(circuit, "wire3").name("Wire 3").onChange(checkCircuit);

// Display Circuit
const circuitDiv = document.createElement("div");
circuitDiv.style.position = "absolute";
circuitDiv.style.top = "10px";
circuitDiv.style.right = "10px";
circuitDiv.style.color = "white";
circuitDiv.style.fontSize = "24px";
circuitDiv.innerHTML = "Circuit: OFF";
document.body.appendChild(circuitDiv);

// Check Circuit Completion
function checkCircuit() {
  const isComplete = circuit.wire1 && circuit.wire2 && !circuit.wire3; // Example logic
  circuitDiv.innerHTML = `Circuit: ${isComplete ? "ON" : "OFF"}`;

  if (isComplete) {
    console.log("Puzzle Solved! Circuit Completed.");
  }
}

// Export the function to be used in App.js
export default function initializeCircuitPuzzle() {
  return {
    cleanup: () => {
      gui.destroy(); // lil-gui uses `destroy()` method to clean up the GUI
      document.body.removeChild(circuitDiv);
    },
  };
}

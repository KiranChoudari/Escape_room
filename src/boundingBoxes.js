import * as THREE from 'three';

/**
 * Creates a bounding box mesh with specified parameters.
 *
 * @param {THREE.Vector3} position - The position of the bounding box.
 * @param {THREE.Euler} rotation - The rotation of the bounding box in radians.
 * @param {THREE.Vector3} scale - The scale of the bounding box.
 * @param {number} color - The color of the bounding box wireframe.
 * @returns {THREE.Mesh} - The bounding box mesh.
 */
export function createBoundingBox(position, rotation, scale, color = 0xff0000) {
    const geometry = new THREE.BoxGeometry(1, 1, 1); // Unit cube
    const material = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
    });

    const boundingBox = new THREE.Mesh(geometry, material);
    boundingBox.scale.set(scale.x, scale.y, scale.z);
    boundingBox.rotation.set(rotation.x, rotation.y, rotation.z);
    boundingBox.position.set(position.x, position.y, position.z);

    return boundingBox;
}

/**
 * List of bounding boxes for collision detection.
 */
export const boundingBoxesList = [];

/**
 * Adds predefined bounding boxes to the scene.
 *
 * @param {THREE.Scene} scene - The Three.js scene to which bounding boxes will be added.
 */
export function addBoundingBoxes(scene) {
    const boundingBoxesParams = [
        {
            position: new THREE.Vector3(3.630, 1.001, 4.223),
            rotation: new THREE.Euler(0, THREE.MathUtils.degToRad(90), 0),
            scale: new THREE.Vector3(16.714, 2, 1),
            color: 0x00ff00,
            name: 'Wall_1',
        },
        {
            position: new THREE.Vector3(-10.808, 1.001, 4.223),
            rotation: new THREE.Euler(0, THREE.MathUtils.degToRad(90), 0),
            scale: new THREE.Vector3(16.714, 2, 1),
            color: 0x0000ff, // Blue color for the new wall
            name: 'Wall_2', // Name the new wall
        },
        // Adding new bounding boxes
        {
            position: new THREE.Vector3(3.403, 0, 886.4),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(5.685, 2, 1),
            color: 0xff00ff, // Purple color for the new box
            name: 'Wall_3', // Name for the new wall
        },
        {
            position: new THREE.Vector3(3.403, 0, 886.12),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(13.949, 2, 1),
            color: 0xffff00, // Yellow color for the new box
            name: 'Wall_4', // Name for the new wall
        },
        // Additional bounding boxes
        {
            position: new THREE.Vector3(-0.855, 0, 886.045),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(13.949, 2, 1),
            color: 0x00ffff, // Cyan color for the new box
            name: 'Wall_5', // Name for the new wall
        },
        {
            position: new THREE.Vector3(2.575, 0, 886.207),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(4.187, 2, 1),
            color: 0xff0000, // Red color for the new box
            name: 'Wall_6', // Name for the new wall
        },
        {
            position: new THREE.Vector3(4.189, 0, 886.207),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(4.187, 2, 1),
            color: 0x0000ff, // Blue color for the new box
            name: 'Wall_7', // Name for the new wall
        }
    ];

    boundingBoxesParams.forEach((params) => {
        const box = createBoundingBox(params.position, params.rotation, params.scale, params.color);
        box.name = params.name || 'BoundingBox';
        scene.add(box);

        // Add bounding box to the list for collision detection
        const box3 = new THREE.Box3().setFromObject(box);
        boundingBoxesList.push(box3);
    });
}

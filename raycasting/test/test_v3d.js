var v1 = v3d(1, 2, 3);
var v2 = v3d(4, 5, 6);

console.log("v3d.js");
console.log("Add test: " + v1.clone().setAdd(v2).toString());
console.log("Sub test: " + v1.clone().setSub(v2).toString());
console.log("Scale test: " + v1.clone().setScale(10).toString());
console.log("Normalize test: " + v1.clone().setNormalize().toString());
console.log("Cross test: " + v3d().setCross(v1, v2).toString());

console.log("raycaster.js");
var ray = new Ray(v3d(0,0,0), v3d(0,0,1));
var sphere1 = new Sphere(v3d(0,0,5), 1);
var sphere2 = new Sphere(v3d(0,5,5), 1);
var result = v3d();
var intersecting = Raycaster.geometricRaycastSphere(ray, sphere1, result);
console.log("Geometric Sphere Raycast: " + intersecting + " p: " + result.toString());
var intersecting = Raycaster.geometricRaycastSphere(ray, sphere2, result);
console.log("Geometric Sphere Raycast: " + intersecting + " p: " + result.toString());
var screenRay = Raycaster.createScreenRay(16, 12, 0, 0, v3d(0,0,0), v3d(0,0,1), v3d(0,1,0), Math.PI / 4);
console.log("Create Screen Ray: " + screenRay.toString());


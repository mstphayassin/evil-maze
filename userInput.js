let cameraTargetAngle = 0
let cameraAngle = 0

let ui = {
	left: false,
	right: false,
	up: false,
	down: false,
	z: false,
	x: false,
	c: false
}

document.addEventListener('keydown', event => {
	switch (event.keyCode){
	case 37:
		ui.left = true;
		break;
	case 38: 
		ui.up = true;
		break;
	case 39: 
		ui.right = true;
		break;
	case 40:
		ui.down = true;
		break;
	case 90:
		ui.z = true;
		break;
	case 88: 
		ui.x = true;
		break;
	case 67:
		ui.c = true;
		break;
	}
})

document.addEventListener('keyup', event => {
	switch (event.keyCode){
	case 37:
		ui.left = false;
		break;
	case 38: 
		ui.up = false;
		break;
	case 39: 
		ui.right = false;
		break;
	case 40:
		ui.down = false;
		break;
	case 90:
		ui.z = false;
		break;
	case 88: 
		ui.x = false;
		break;
	case 67:
		ui.c = false;
		break;
	}
})
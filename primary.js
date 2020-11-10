
let canvas = document.getElementById("myCanvas")
let ctx = canvas.getContext('2d')

const LEFT = 1
const RIGHT = 2
const UP = 3
const DOWN = 4

let cellSize = 30
let offsetX = 100
let offsetY = 100
let mazeRows = 40
let mazeColumns = 60

const generateMaze = (m,n) => {
	let inMaze = []
	let maze = []
	for (let i = 0; i < m; i++){
		inMaze[i] = []
		maze[i] = []
		for (let j = 0; j < n; j++){
			inMaze[i][j] = false
			maze[i][j] = {
				right: false,
				left: false,
				down: false,
				up: false
			}
		}
	}
	inMaze[Math.floor(Math.random() * m)][Math.floor(Math.random() * n)] = true
	let remaining = m * n - 1
	let startX, startY
	while (remaining > 0) {
		// find valid start location
		while (true) {
			startX = Math.floor(Math.random()*n)
			startY = Math.floor(Math.random()*m)
			if (!inMaze[startY][startX]) {
				break
			}
		}
		// initialize direction hash
		let dirGrid = []
		for (let i = 0; i < m; i++){
			dirGrid[i] = []
			for (let j = 0; j < n; j++){
				dirGrid[i][j] = 0
			}
		}
		// begin random walk
		let walking = true
		let dirChosen = 0
		let curX = startX
		let curY = startY
		while (walking) {
			// choose a valid direction
			while (true) {
				dirChosen = Math.floor(Math.random()*4 + 1)
				if ((dirChosen === LEFT && curX - 1 >= 0) || 
					(dirChosen === RIGHT && curX + 1 < n) || 
					(dirChosen === UP && curY - 1 >= 0) || 
					(dirChosen === DOWN && curY + 1 < m)) {
						break
				}
			}
			// record the direction
			dirGrid[curY][curX] = dirChosen
			
			if (dirChosen === LEFT) {
				curX--
			} else if (dirChosen === RIGHT) {
				curX++
			} else if (dirChosen === UP) {
				curY--
			} else if (dirChosen === DOWN) {
				curY++
			}
			
			if (inMaze[curY][curX]) { // are we in the maze yet?
				walking = false
			}
		}
		// add path to maze, update remaining
		curX = startX
		curY = startY
		while (true) {
			if (dirGrid[curY][curX] === 0) {
				break
			}
			remaining--
			if (dirGrid[curY][curX] === LEFT) {
				maze[curY][curX].left = true
				maze[curY][curX-1].right = true
				inMaze[curY][curX] = true
				curX--
			} else if (dirGrid[curY][curX] === RIGHT) {
				maze[curY][curX].right = true
				maze[curY][curX+1].left = true
				inMaze[curY][curX] = true
				curX++
			} else if (dirGrid[curY][curX] === UP) {
				maze[curY][curX].up = true
				inMaze[curY][curX] = true
				maze[curY-1][curX].down = true
				curY--
			} else if (dirGrid[curY][curX] === DOWN) {
				maze[curY][curX].down = true
				inMaze[curY][curX] = true
				maze[curY+1][curX].up = true
				curY++
			} 
		}
	}
	return maze
}

let curLevel = []
let player = {
	x:1,
	y:1
}
let winSpot = {
	x: 1,
	y: 1
}

const setup = () => {
	curLevel = generateMaze(mazeRows,mazeColumns)
	cellSize = Math.min(800 / mazeColumns, 600 / mazeRows) - 2
	offsetX = (800 - cellSize * mazeColumns)/2
	offsetY = (600 - cellSize * mazeRows)/2
	player.x = 0
	player.y = 0
	timer = 0
	winSpot.x = mazeColumns - 1
	winSpot.y = mazeRows - 1
	if (zoomedMode) {
		ctx.scale(5,5)
		zoomedMode = false
	}
}

let now = Date.now()
let lastTime = Date.now()
let dt
let justMoved = false

let timerDisplay = document.getElementById('timer')
let timer = 0
let timerGoing = false

let lastTimeDisplay = document.getElementById('lastTime')

let zoomedMode = true
let zoomScale = 5
let impossibleMode = false
let movesSoFar = 0
let movesForASwitch = 20
let cameraX = 0
let cameraY = 0
let cameraSpeed = 1
cameraAngle = 0
cameraTargetAngle = 0
let cameraTurning = false
let cameraAngleSpeed = 5 * Math.PI / 180.0
let pukeMode = false

function pukeModeTrigger() {
	var pukeBox = document.getElementById("pukeCheck")
	if (pukeBox.checked) {
		pukeMode = true
	} else {
		pukeMode = false
	}
}

function impossibleModeTrigger() {
	var impBox = document.getElementById("impCheck")
	if (impBox.checked) {
		impossibleMode = true
	} else {
		impossibleMode = false
	}
}

const update = () => {
	now = Date.now()
	dt = (now - lastTime)/1000.0
	lastTime = now
	
	if (timerGoing) {
		timer += dt
		timerDisplay.innerHTML = 'Time: ' + Math.floor(timer*1000)/1000
	}
	
	let right = ui.right
	let left = ui.left
	let down = ui.down
	let up = ui.up

	if (Math.abs(cameraAngle  - Math.PI / 2) < cameraAngleSpeed) {
		right = ui.up
		up = ui.left
		left = ui.down
		down = ui.right
	}
	else if (Math.abs(cameraAngle - Math.PI) < cameraAngleSpeed) {
		right = ui.left
		up = ui.down
		left = ui.right
		down = ui.up
	}
	else if (Math.abs(cameraAngle - Math.PI * 3 / 2) < cameraAngleSpeed) {
		right = ui.down
		up = ui.right
		left = ui.up
		down = ui.left
	} else if (Math.abs(cameraAngle) > cameraAngleSpeed) {
		cameraTargetAngle = Math.round(cameraTargetAngle/Math.PI * 2)/2*Math.PI
	}

	if (!pukeMode) {
		right = ui.right
		left = ui.left
		down = ui.down
		up = ui.up
	}

	if (right && curLevel[player.y][player.x].right && justMoved === 0) {
		player.x++
		justMoved = RIGHT
		if (cameraTargetAngle !== Math.PI/2 && cameraTargetAngle !== 3*Math.PI/2) {cameraTurning = true; cameraTargetAngle = Math.PI/2}
		movesSoFar++
		
	} else if (left && curLevel[player.y][player.x].left && justMoved === 0) {
		player.x--
		justMoved = LEFT
		if (cameraTargetAngle !== 3*Math.PI/2 && cameraTargetAngle !== Math.PI/2) {cameraTurning = true; cameraTargetAngle = 3*Math.PI/2}
		movesSoFar++
		
	} else if (down && curLevel[player.y][player.x].down && justMoved === 0) {
		player.y++
		justMoved = DOWN
		if (cameraTargetAngle !== Math.PI && cameraTargetAngle !== 0) {cameraTurning = true; cameraTargetAngle = Math.PI}
		movesSoFar++
	} else if (up && curLevel[player.y][player.x].up && justMoved === 0) {
		player.y--
		justMoved = UP
		if (cameraTargetAngle !== 0 && cameraTargetAngle !== Math.PI) {cameraTurning = true; cameraTargetAngle = 0}
		movesSoFar++
	}

	if (movesSoFar > movesForASwitch && impossibleMode) {
		curLevel = generateMaze(mazeRows,mazeColumns)
		movesSoFar = 0
	} else if (!impossibleMode) {
		movesSoFar = 0
	}

	cameraTargetAngle = (cameraTargetAngle + Math.PI*2) % (2*Math.PI)
	cameraAngle = (cameraAngle + Math.PI * 2) % (2 * Math.PI)
	
	if (!ui.right && !ui.left && !ui.down && !ui.up) {
		justMoved = 0
	} else {
		timerGoing = true
		cameraTurning = true
	}
	
	if (player.x === winSpot.x && player.y === winSpot.y) {
		timerGoing = false
		lastTimeDisplay.innerHTML = 'Last Time: ' + Math.floor(timer*1000)/1000
		setup()
	}
	
	if (Math.abs(cameraX - player.x*cellSize) > cameraSpeed) {
		if (cameraX > player.x*cellSize) {
			cameraX -= cameraSpeed
		} else {
			cameraX += cameraSpeed
		}
	}
	if (Math.abs(cameraY - player.y*cellSize) > cameraSpeed) {
		if (cameraY > player.y*cellSize) {
			cameraY -= cameraSpeed
		} else {
			cameraY += cameraSpeed
		}
	}

	if (Math.min(Math.abs((cameraAngle - cameraTargetAngle + (2*Math.PI)) % (2*Math.PI)), Math.abs((cameraTargetAngle - cameraAngle + (2*Math.PI)) % (2*Math.PI))) > cameraAngleSpeed) {
		cameraTurning = true
		/*if (cameraAngle > cameraTargetAngle) {
			cameraAngle -= cameraAngleSpeed
		}
		if (cameraAngle < cameraTargetAngle) {
			cameraAngle += cameraAngleSpeed
		}*/
		
		if ((cameraAngle - cameraTargetAngle + 2*Math.PI) % (2 * Math.PI) < (cameraTargetAngle - cameraAngle + 2*Math.PI) % (2 * Math.PI)){
			cameraAngle -= cameraAngleSpeed
		} else {
			cameraAngle += cameraAngleSpeed
		}
	} else {
		cameraTurning = false
	}
 
	ctx.clearRect(0,0,canvas.width,canvas.height) // erase everything
	
	ctx.fillStyle = '#ffffff'; // set background color
	ctx.fillRect(0,0,canvas.width,canvas.height); // fill background
	ctx.translate(-cameraX, -cameraY)
	if (pukeMode) {
		ctx.translate(cameraX + offsetX + cellSize/2, cameraY + offsetY + cellSize/2)
		ctx.rotate(-cameraAngle)
		ctx.translate(-(cameraX + offsetX + cellSize/2), -(cameraY + offsetY + cellSize/2))
	}
	ctx.strokeStyle = '#000000'
	for (let i = 0; i < curLevel.length; i++) {
		for (let j = 0; j < curLevel[i].length; j++) {
			for (let dir in curLevel[i][j]) {
				if (!curLevel[i][j][dir]) {
					ctx.translate(j*cellSize+offsetX+cellSize/2,i*cellSize+offsetY+cellSize/2)
					if (dir === 'left') {
						ctx.beginPath()
						ctx.moveTo(-cellSize/2, -cellSize/2)
						ctx.lineTo(-cellSize/2,cellSize/2)
						ctx.stroke()
					} else if (dir === 'right') {
						ctx.beginPath()
						ctx.moveTo(cellSize/2, -cellSize/2)
						ctx.lineTo(cellSize/2,cellSize/2)
						ctx.stroke()
					} else if (dir === 'up') {
						ctx.beginPath()
						ctx.moveTo(-cellSize/2, -cellSize/2)
						ctx.lineTo(cellSize/2,-cellSize/2)
						ctx.stroke()
					} else if (dir === 'down') {
						ctx.beginPath()
						ctx.moveTo(-cellSize/2, cellSize/2)
						ctx.lineTo(cellSize/2,cellSize/2)
						ctx.stroke()
					}
					ctx.translate(-(j*cellSize+offsetX+cellSize/2),-(i*cellSize+offsetY+cellSize/2))
				}
			}
		}
	}
	
	
	ctx.fillStyle = '#991111'
	ctx.translate(cameraX + offsetX + cellSize/2, cameraY + offsetY + cellSize/2)
	ctx.fillRect(-cellSize/2 + 1, -cellSize/2 + 1, cellSize-2,cellSize-2)
	ctx.translate(-(cameraX + offsetX + cellSize/2), -(cameraY + offsetY + cellSize/2))
	
	ctx.fillStyle = '#119911'
	ctx.translate(winSpot.x * cellSize + offsetX + cellSize/2, winSpot.y * cellSize + offsetY + cellSize/2)
	ctx.fillRect(-cellSize/2, -cellSize/2, cellSize,cellSize)
	ctx.translate(-(winSpot.x * cellSize + offsetX + cellSize/2), -(winSpot.y * cellSize + offsetY + cellSize/2))
	
	if (pukeMode) {
		ctx.translate(cameraX + offsetX + cellSize/2, cameraY + offsetY + cellSize/2)
		ctx.rotate(cameraAngle)
		ctx.translate(-(cameraX + offsetX + cellSize/2), -(cameraY + offsetY + cellSize/2))
	}

	ctx.translate(cameraX,cameraY)
	window.requestAnimationFrame(update); // tell the browser to call this function again asap (this begins another frame)
}

setup();
update();
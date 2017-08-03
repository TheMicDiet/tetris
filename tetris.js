const tetris = document.getElementById("tetris")
const scoreDisplay = document.getElementById("score")
const gameover = document.getElementById("gameoverfield")
let highscore = (localStorage.getItem("highscore") === null) ? 0 : localStorage.getItem("highscore")
const highscoreDisplay = document.getElementById("highscore")
highscoreDisplay.innerText = "Highscore: " + highscore

tetris.width = 240
tetris.height = tetris.width * 1.6
 
const scaleOfBlock = tetris.width / 10
const context = tetris.getContext('2d')
context.scale(scaleOfBlock, scaleOfBlock)
context.fillStyle = "black"
context.fillRect(0,0,tetris.width,tetris.height)

const gamewidth = tetris.width/scaleOfBlock
const gameheight = tetris.height/scaleOfBlock

let gameboard = initGameboard()
let isRunning = true
const blocks = [
    [[1,1,0],
     [0,1,1],
     [0,0,0]],    

    [[0,2,0,0],
    [0,2,0,0],
    [0,2,0,0],
    [0,2,0,0]],   

    [[0,3,0],
    [0,3,0],
    [3,3,0]],

    [[0,4,0],
    [0,4,0],
    [0,4,4]],
    
    [[5,5],
    [5,5]],
    
    [[0,6,6],
    [6,6,0],
    [0,0,0]],
    
    [[0,0,0],
    [0,7,0],
    [7,7,7]],    
]


let player = {
    position: {
        x: Math.floor(gamewidth/2) -1,
        y: 0
    },
    matrix: randomBlock(),
    moveDownPlayer : function() {
        player.position.y++        
        if(collide(player.matrix, player.position, gameboard)) {            
            player.position.y--
            merge(gameboard, player)  
            sweep(gameboard)            
            player.reset()
        }
    },
    reset: function() {
        player.matrix = randomBlock()
        player.position.x =  Math.floor(gamewidth/2) -1
        player.position.y =  0
        if(collide(player.matrix, player.position, gameboard)) {
            isRunning = false  
            gameboard.forEach(row => {
                row.fill(0)           
            })
            player.score = 0
            player.matrix = {}
            player.position.x =  Math.floor(gamewidth/2) -1
            player.position.y =  0
                    
            
        }
    },
    score: 0
}

function gameOver() {
    context.fillStyle = "black"
    context.fillRect(0,0,tetris.width,tetris.height)
       
    context.font = '1px sans-serif'
    context.fillText("GAME OVER",2 ,4)
    context.font = '1px sans-serif'
    context.fillText("Retry?",3 ,6)
}

function draw() {
    context.fillStyle = "black"
    context.fillRect(0,0,tetris.width,tetris.height)
    drawMatrix(gameboard,{x:0,y:0})
    drawMatrix(player.matrix, player.position)
}


function initGameboard() {
    let gameboard = new Array(gameheight)
    for (let i = 0; i < gameheight; i++) {
        gameboard[i] = new Array(gamewidth)
        gameboard[i].fill(0)
    }
    return gameboard
}

function drawMatrix(matrix, offset) {   

    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colorChooser(value)
                context.fillRect(x + offset.x,y + offset.y, 1, 1)
            }
        })
    })    
}

function colorChooser(value) {
    switch(value) {
        case 1: return "#ff3300"
        case 2: return "#0081ff"
        case 3: return "#008000"
        case 4: return "#8f00ff"
        case 5: return "#FDEE00"
        case 6: return "#ea0bd5"
        case 7: return "#fb0101"
    }

}

function collide(matrix, position, gameboard) {
    
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if(matrix[y][x] !== 0) {
                if(y + position.y >= gameboard.length) {
                    return true
                } else if (x + position.x > gameboard[0].length || x + position.x < 0) {
                    return true
                } else if (occupied(x + position.x, y + position.y)) {
                    return true
                }
           
            }
        }
    }
    return false

}

function occupied(x, y) {
    if(gameboard[y][x] !== 0) {
        return true;
    }
    return false;
}

function merge(gameboard, player) {

    for(let y = 0; y < player.matrix.length; y++) {
        for(let x = 0; x < player.matrix[y].length; x++) {
            if(player.matrix[y][x] !== 0) {
                gameboard[y + player.position.y][x + player.position.x] = player.matrix[y][x]
            }
            
        }
    }   

}

function rotateMatrix(matrix) {
    /* let matrix = oldMatrix.slice()
    let oldpos = player.position */
    let rotated = clone(matrix)
    console.table(rotated)
    let N = rotated.length
    // Consider all squares one by one
    for (let x = 0; x < N / 2; x++) {
        // Consider elements in group of 4 in 
        // current square
        for (let y = x; y < N-x-1; y++) {
            // store current cell in temp variable
            let temp = rotated[x][y]; 
            // move values from right to top
            rotated[x][y] = rotated[y][N-1-x]; 
            // move values from bottom to right
            rotated[y][N-1-x] = rotated[N-1-x][N-1-y]; 
            // move values from left to bottom
            rotated[N-1-x][N-1-y] = rotated[N-1-y][x]; 
            // assign temp to left
            rotated[N-1-y][x] = temp;
        }
    }
    return rotated    
}

function rotatePlayer() {
    
    let newMatrix = rotateMatrix(player.matrix)

    if(collide(newMatrix, player.position, gameboard)) {
        player.position.x++
    }
    if(collide(newMatrix, player.position, gameboard)) {
        player.position.x -= 2
    }
    if(collide(newMatrix, player.position, gameboard)) {
        player.position.x++ 
    }
    if((!collide(newMatrix, player.position, gameboard))) {
        player.matrix = newMatrix
    }
    
}


let time = 0
let interval = 300
let timeOld = 0;
function update(timer = 0) {
    if(isRunning) {
        draw()
    }
    let delta = timer - timeOld
    timeOld = timer
    time += delta
    while (time >= interval){
        time -= interval
        if(isRunning) {
            player.moveDownPlayer()
        } else {
            gameOver()
        }
    }
   
    scoreDisplay.innerText = 'Score: ' + player.score       
    window.requestAnimationFrame(update)
}


function movePlayer(direction) {

    player.position.x += direction
    if(collide(player.matrix, player.position, gameboard)) {
        player.position.x -= direction
    }
    
}
//clone a 2d matrix
function clone (array) {
    return array.map(row => {return row.slice()})
}

function randomBlock() {
    let randomNumber = Math.floor(Math.random() * blocks.length)
    return blocks[randomNumber]      

}

function sweep(gameboard) {
    let scoreForRow = 10
    let score = 0
    let multiplier = 1    
    for(let i = 0; i < gameboard.length; i++) {
        if(gameboard[i].every(element => (element !== 0))) { 
            console.table(gameboard[i])           
            gameboard.splice(i,1)

            gameboard.unshift(new Array(gameboard[0].length).fill(0))            
            score += scoreForRow * multiplier
            multiplier++           
        }
        
    }
    
    player.score += score
    if(player.score > highscore) {
        highscore = player.score
        localStorage.setItem("highscore", highscore)
        highscoreDisplay.innerText = "Highscore: " + highscore
    }   
}

document.addEventListener('keydown', event => {

    if(event.keyCode === 37 && isRunning) {
         movePlayer(-1)
        
        
    } else if(event.keyCode ===  39 && isRunning) {
        
        movePlayer(1)
        
    } else if(event.keyCode ===  38 && isRunning) {
      
         rotatePlayer()  
        
              
    } else if(event.keyCode ===  40 && isRunning) {
        player.moveDownPlayer()
    } else if(event.keyCode === 40) {
        isRunning = true
        player.reset()
    }
})


//touch recognization

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;                                                        

function handleTouchStart(evt) {                                         
    xDown = evt.touches[0].clientX;                                      
    yDown = evt.touches[0].clientY;                                      
};                                                

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            /* left swipe */
            movePlayer(-1) 
        } else {
            /* right swipe */
            movePlayer(1)
        }                       
    } else {
        if ( yDiff > 0 ) {
            /* up swipe */
            rotatePlayer()
            isRunning = true 
        } else { 
            /* down swipe */
            moveDownPlayer()
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};

update()

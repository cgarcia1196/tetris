import * as pieces from './pieces.js';

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const colors = [
    '#7f7f7f', //grey
    '#00ffff', //cyan
    '#0000ff', //blue
    '#ff7f00', //orange
    '#ffff00', //yellow
    '#00ff00', //green
    '#800080', //purple
    '#ff0000', //red
]

function arenasweeep(){
    let rowCounter = 1;
    outer: for( let y = arena.length - 1; y > 0 ; y--){
        for(let x = 0; x < arena[y].length; ++x){
            if(arena[y][x] === 0){
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0); //remove arena now out at index row y
        arena.unshift(row);
        ++y;
        player.score += (rowCounter * 10);
        rowCounter *= 2;
    }
}
//drops piece one position and check that there is not collision
function playerDrop(){
    player.pos.y++;
    if(collide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenasweeep();
        updateScore();
    }
    dropCounter = 0; //reset dropCounter so piece does not drop two positions
}

//movies piece left or right and checks if there is collision
function playerMove(dir){
    player.pos.x += dir;
    if(collide(arena, player)){
        player.pos.x -= dir;
    }
}

//gives the player a random tetris piece
//positions player at top and center of arena 
//checks if the top of arena is full and resets game if so
function playerReset(){
    const p = 'iljotsz';
    player.piece = returnPiece(p[Math.floor(p.length * Math.random())]);
    player.pos.y = 0;
    player.pos.x = (Math.floor(arena[0].length / 2)) - (Math.floor(player.piece[0].length / 2));

    if(collide(arena, player)){
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

// function playerRotate(dir){
//     let offsetX = 1;
//     player.piece = rotate(player.piece, dir);
//     while(collide(arena, player)){
//         player.pos.x += offsetX;
//         offsetX -= 3;
//         console.log(offsetX)
//         if(offsetX < -3){
//             playerRotate(-dir);
//         }
//     }
// }
function playerRotate(dir){
    const pos = player.pos.x;
    let offsetX = 1;
    player.piece = rotate(player.piece, dir);
    while(collide(arena, player)){
        player.pos.x += offsetX;
        offsetX =  -(offsetX + (offsetX > 0 ? 1: -1));

        if(offsetX > player.piece[0].length){
            rotate(player.piece, -dir);
            player.pos.x = pos;
            return;
        }
    }
}
//rotates the tetris piece
function rotate(piece, dir){
    const tempMatrix = createMatrix(piece[0].length, piece.length);
    //transpose matrix
    piece.forEach((row, y) => {
        row.forEach((value, x) => {
            tempMatrix[x][y] = value;
        });
    });
    //reverse matrix
    let temp = 0;
    if(dir == "right"){ //reverse each row; rotate right
        tempMatrix.forEach((row, y) => {
            let start = 0;
            let end = row.length -1;
            while(start < end){
                temp = row[start];
                tempMatrix[y][start] = row[end];
                tempMatrix[y][end] = temp;
                start++;
                end--; 
            }
        })
    }else{ //reverse each column; rotate left
        let tempRow = [];
        let start = 0;
        let end = tempMatrix.length -1;
        while(start < end){
            tempRow = tempMatrix[start];
            tempMatrix[start] = tempMatrix[end];
            tempMatrix[end] = tempRow;
            start++;
            end--; 
        }
    }

    return tempMatrix;

}
//return true if there is collosion between dropped pieces
//or a collision with the walls of the arena 
function collide(arena, player){
    const [p, o,] = [player.piece, player.pos];
    for(let y = 0; y < p.length; ++y){
        for(let x = 0; x < p[y].length; ++x){
            if(p[y][x] !== 0 &&
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0){
                return true;
            }
        }
    }
    return false;
}
//creates empty matrix of specified height ant width
//this will store the position of fallen poieces
function createMatrix(w, h){
    const matrix = [];
    while(h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function returnPiece(type){
    switch(type){
        case 'i':
            return pieces.i;
        case 'j':
            return pieces.j;
        case 'l':
            return pieces.l;
        case 'o':
            return pieces.o;
        case 's':
            return pieces.s;
        case 't':
            return pieces.t;
        case 'z':
            return pieces.z;
        default:
            return pieces.t
    } 
}


function draw(){
    //draw the canvas background
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    //draw arena and tetris piece
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.piece, player.pos);
}

//draw the shape in correct position
function drawMatrix(shape, offset){
    const bSize = .1;//bordersize
    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value != 0){
                context.fillStyle = colors[value];
                context.fillRect((x + offset.x) - bSize, 
                                 (y + offset.y) - bSize, 
                                 1 - bSize, 
                                 1 - bSize);
            }
        })
    });
}

//merge tetris piece into the arena matrix
function merge(arena, player){
    player.piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        })
    })
}

//Drop counter will increment by deltaTime(~16 for 60fps, ~7 for 144fps) each frame untill reaching dropdInterval
//then it will cause player.pos.y to increase by 1
//Each frame the tetris piece will fall 1 position
let dropCounter = 0;
//every 1000 milliseconds(1 second) 
let dropInterval = 1000;
let lastTime = 0;
function update(time = 0){
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if(dropCounter > dropInterval){
        playerDrop();
    }
    draw();
    //requestAnimationFrame(callback) has a callback paramater that 
    //is passed, in this case to the update(time) function; time = DOMHighResTimeStamp, similar to performance.now()
    requestAnimationFrame(update);
}

function updateScore(){
    document.getElementById('score').innerText = player.score;
}

const arena = createMatrix(12, 20);
const player = {
    pos:{x: 0, y: 0},
    piece: null,
    score : 0
}

console.log(player.piece)
//check what key is being pressed
document.addEventListener('keydown', event => {
    // console.log(event);
    // console.log(event.key);
    switch (event.key){
        case "ArrowLeft":
            playerMove(-1);
            break;
        case "ArrowRight":
            playerMove(+1);
            break;
        case "ArrowUp":
            
            break;
        case "ArrowDown":
            playerDrop();
            break;

        case "]":
            playerRotate("right");
            break;
        case "[":
            playerRotate("left")
            break;
    }

})

playerReset();
updateScore()
update();

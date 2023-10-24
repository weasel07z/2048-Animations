const gameboard = document.querySelector('.gameboard');
const tiles = [];

hasK = false;
hasY = false;
hasS = false;

//var isShadowToggled = true;
//const multi = document.querySelector('.multi');
var multiplier = 2;


// Get keyboard inputs
document.addEventListener('keydown', function(key) {
    let moved = false;
    if (key.keyCode == 37 || key.keyCode == 65) { // left_arrow_key or a
        moved = moveLeft();
    } else if (key.keyCode == 38 || key.keyCode == 87) { // up_arrow_key or w
        moved = moveUp();
    } else if(key.keyCode == 39 || key.keyCode == 68) { // right_arrow_key or d
        moved = moveRight();
    } else if(key.keyCode == 40 || key.keyCode == 83) { // down_arrow_key or s
        hasS = true;
        keepYourselfSafe();
        moved = moveDown();
    } else if(key.keyCode == 82) { // r
        resetGame();
    } else if(key.keyCode == 77) { // m
        setMultiplier();
    } else if(key.keyCode == 51) { // 3
        colonThree();
    } else if(key.keyCode == 75) { // k
        hasK = true;
        keepYourselfSafe();
    } else if(key.keyCode == 89) { // y
        hasY = true;
        keepYourselfSafe();
    }
    if(moved){
      spawnRandomTile();
    }
    colors();
}, true);
window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

// Swiping
var touchStartClientX, touchStartClientY;
var gameContainer = document.getElementByClassName("container");

gameContainer.addEventListener('touchstart', function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches.length > 1) {
      return; // Ignore if touching with more than 1 finger
    }
    if (window.navigator.msPointerEnabled) {
      touchStartClientX = event.pageX;
      touchStartClientY = event.pageY;
    } else {
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
    }

    event.preventDefault();
});

gameContainer.addEventListener('touchmove', function (event) {
    event.preventDefault();
});

gameContainer.addEventListener('touchend', function (event) {
    let moved = false;

    if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches.length > 0) {
      return; // Ignore if still touching with one or more fingers
    }

    var touchEndClientX, touchEndClientY;

    if (window.navigator.msPointerEnabled) {
      touchEndClientX = event.pageX;
      touchEndClientY = event.pageY;
    } else {
      touchEndClientX = event.changedTouches[0].clientX;
      touchEndClientY = event.changedTouches[0].clientY;
    }

    var dx = touchEndClientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = touchEndClientY - touchStartClientY;
    var absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 0) {
        event.preventDefault();
      // (right : left) : (down : up)
        if(absDx > absDy){
            if(dx > 0) {
                moved = moveRight();
            } else {
                moved = moveLeft();
            }
            } else {
            if(dy > 0){
                moved = moveDown();
            } else {
                moved = moveUp();
            }
        }
      //self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    }
    if(moved){
        spawnRandomTile();
    }
    colors();
    
});

// Sliding animation :3 nvm fuck this 
/*
function moveTile(currentTile, targetTile, animationClass) {
  currentTile.classList.add(animationClass);
  setTimeout(function () {
    currentTile.classList.remove(animationClass);
    targetTile.classList.remove('new');
  }, 200);
} */

// checking for merge
function canEat(i, j, newTile){
  if(i >= 4 || j >= 4 || i < 0 || j < 0){
      return false;
  }
  return(parseInt(getTile(i,j).innerText) === parseInt(newTile.innerText));
}
// checks for open space
function canMove(i, j){
  if(i >= 4 || j >= 4 || i < 0 || j < 0 || tiles[i*4 + j].innerText !== ''){
      return false;
  }
  return true;
}
// Initializing function
function createGameboard() {
  for (let i = 0; i < 16; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    gameboard.appendChild(tile);
    tiles.push(tile);
  }
  // Spawn two random tiles at start
  spawnRandomTile();
  spawnRandomTile();
  colors();
}
// spawn random tiles
function spawnRandomTile() {
  const emptyTiles = tiles.filter(tile => !tile.innerText);
  const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
  if(multiplier != 2){
    randomTile.innerText = 2;
    randomTile.classList.add('new');
  } else {
    randomTile.innerText = Math.random() < 0.9 ? '2' : '4';
    randomTile.classList.add('new');
  } 
}
// Get tile at certain row and column
function getTile(row, col){
  return tiles[row*4 + col];
}
// Resets game to only 2 tiles
function resetGame() {
  tiles.forEach(tile => {
    tile.innerText = '';
    tile.classList.remove('new', 'merged');
  });
  spawnRandomTile();
  spawnRandomTile();
}
// Initailizing for document on load
createGameboard();

// MOVEMENT * * * * * * * * * * * * *
function moveLeft(){
    let moved = false;
    for(let i = 0; i < 4; i++){
        for(let j = 0; j < 4; j++){
            const curTile = getTile(i, j);
            if(!!curTile.innerText){
                var newI = i;
                var newJ = j;
                while(canMove(newI, newJ-1)){
                    newJ--;
                }
                if(canEat(newI, newJ-1, curTile)){
                  const newTile = getTile(newI, newJ-1);
                  newTile.innerText = parseInt(newTile.innerText)*multiplier;
                  //moveTile(curTile, newTile, 'slide-left');
                  curTile.innerText = '';
                  newTile.classList.add('merged');
                  curTile.classList.remove('new');
                  curTile.classList.remove('merged');
                  moved = true;
                } else {
                  if(newI == i && newJ == j){
                    curTile.classList.remove('merged');
                    curTile.classList.remove('new');
                    continue;
                  }
                  const newTile = getTile(newI, newJ);
                  newTile.innerText = curTile.innerText;
                  //moveTile(curTile, newTile, 'slide-left');
                  curTile.innerText = '';
                  curTile.classList.remove('merged');
                  curTile.classList.remove('new');
                  moved = true;
                }
            }
        }
    }
    return moved;
}

function moveRight(){
    let moved = false;
    for(let i = 3; i >= 0; i--){
        for(let j = 3; j >= 0; j--){
            const curTile = getTile(i, j);
            if(curTile.innerText){
                var newI = i;
                var newJ = j;
                while(canMove(newI, newJ+1)){
                    newJ++;
                }
                if(canEat(newI, newJ+1, curTile)){
                  const newTile = getTile(newI, newJ+1);
                  newTile.innerText = parseInt(newTile.innerText)*multiplier;
                  curTile.innerText = '';
                  newTile.classList.add('merged');
                  curTile.classList.remove('new');
                  curTile.classList.remove('merged');
                  //moveTile(curTile, newTile, 'slide-right');
                  moved = true;
                } else {
                  if(newI == i && newJ == j){
                    curTile.classList.remove('merged');
                    curTile.classList.remove('new');
                    continue;
                  }
                  const newTile = getTile(newI, newJ);
                  newTile.innerText = curTile.innerText;
                  curTile.innerText = '';
                  curTile.classList.remove('merged');
                  curTile.classList.remove('new');
                  //moveTile(curTile, newTile, 'slide-right');
                  moved = true;
                }
            }
        }
    }
    return moved;
}
function moveDown(){
    let moved = false;
    for(let i = 3; i >= 0; i = i-1){
        for(let j = 3; j >= 0 ; j = j-1){
            const curTile = getTile(i, j);
            if(curTile.innerText){
                var newI = i;
                var newJ = j;
                while(canMove(newI+1, newJ)){
                    newI++;
                }
                if(canEat(newI+1, newJ, curTile)){
                  const newTile = getTile(newI+1, newJ);
                  newTile.innerText = parseInt(newTile.innerText)*multiplier;
                  curTile.innerText = '';
                  newTile.classList.add('merged');
                  curTile.classList.remove('new');
                  curTile.classList.remove('merged');
                  moved = true;
                } else {
                  if(newI == i && newJ == j){
                    curTile.classList.remove('merged');
                    curTile.classList.remove('new');
                    continue;
                  }
                  const newTile = getTile(newI, newJ);
                  newTile.innerText = curTile.innerText;
                  curTile.innerText = '';
                  curTile.classList.remove('merged');
                  curTile.classList.remove('new');
                  moved = true;
                }
            }
        }
    }
    return moved;
}
function moveUp(){
    let moved = false;
    for(let i = 0; i < 4; i++){
        for(let j = 0; j < 4; j++){
            const curTile = getTile(i, j);
            if(curTile.innerText){
                var newI = i;
                var newJ = j;
                while(canMove(newI-1, newJ)){
                    newI--;
                }
                if(canEat(newI-1, newJ, curTile)){
                  const newTile = getTile(newI-1, newJ);
                  newTile.innerText = parseInt(newTile.innerText)*multiplier;
                  curTile.innerText = '';
                  newTile.classList.add('merged');
                  curTile.classList.remove('new');
                  curTile.classList.remove('merged');
                  moved = true;
                } else {
                  if(newI == i && newJ == j){
                    curTile.classList.remove('merged');
                    curTile.classList.remove('new');
                    continue;
                  }
                  const newTile = getTile(newI, newJ);
                  newTile.innerText = curTile.innerText;
                  curTile.innerText = '';
                  curTile.classList.remove('merged');
                  curTile.classList.remove('new');
                  moved = true;
                }
            }
        }
    }
    return moved;
}

// Sets the colors for each tile on the board
function colors(){
    for(var i = 0; i < 4; i++){
        for(var j = 0; j < 4; j++){
            var els = document.getElementsByClassName('tile');
            var temp = els[i*4 + j];
            if(!temp.innerText){
                removeAllClass(temp);
                temp.classList.add('zero');
            } else if(temp.innerText == 2 || temp.innerText < 4){
                removeAllClass(temp);
                temp.classList.add('two');
            } else if(temp.innerText == 4 || temp.innerText < 8){
                removeAllClass(temp);
                temp.classList.add('four');
            } else if(temp.innerText == 8 || temp.innerText < 16){
                removeAllClass(temp);
                temp.classList.add('eight');
            } else if(temp.innerText == 16 || temp.innerText < 32){
                removeAllClass(temp);
                temp.classList.add('sixteen');
            } else if(temp.innerText == 32 || temp.innerText < 64){
                removeAllClass(temp);
                temp.classList.add('thirtytwo');
            } else if(temp.innerText == 64 || temp.innerText < 128){
                removeAllClass(temp);
                temp.classList.add('sixtyfour');
            } else if(temp.innerText == 128 || temp.innerText < 256){
                removeAllClass(temp);
                temp.classList.add('onetwentyeight');
            } else if(temp.innerText == 256 || temp.innerText < 512){
                removeAllClass(temp);
                temp.classList.add('twofiftysix');
            } else if(temp.innerText == 512 || temp.innerText < 1024){
                removeAllClass(temp);
                temp.classList.add('fivetwelve');
            } else if(temp.innerText == 1024 || temp.innerText < 2048){
                removeAllClass(temp);
                temp.classList.add('tentwentyfour');
            } else if(temp.innerText == 2048){
                removeAllClass(temp);
                temp.classList.add('twentyfourtyeight');
            } else if(temp.innerText.length < 5){
                removeAllClass(temp);
                temp.classList.add('fourtyninetysix');
            } else {
                removeAllClass(temp);
                temp.classList.add('passed');
            }
        }
    }
}
// removing all the possible colors (probably a way easier way to do this but idk how)
function removeAllClass(thing){
    thing.classList.remove('zero');
    thing.classList.remove('two');
    thing.classList.remove('four');
    thing.classList.remove('eight');
    thing.classList.remove('sixteen');
    thing.classList.remove('thirtytwo');
    thing.classList.remove('sixtyfour');
    thing.classList.remove('onetwentyeight');
    thing.classList.remove('twofiftysix');
    thing.classList.remove('fivetwelve');
    thing.classList.remove('tentwentyfour');
    thing.classList.remove('twentyfourtyeight');
    thing.classList.remove('fourtyninetysix');
    thing.classList.remove('passed');
}
//<button class="multi" onclick="setMultiplier()">Current Mulitplier: 2</button>
function setMultiplier() {
    let m = prompt("Set Multiplier: ", "2");
    if(m.includes("kys")){
        const title = document.querySelector(".dipshit");
        title.innerText = "🖕"
    }
    if(m == null || m == "") {
        //pass
    } else if (isNaN(m)){
      //pass
    } else {
        if(multiplier != parseInt(m)){
            multiplier = parseInt(m);
            //multi.innerText = "Current Multiplier: " + m;
            resetGame();
        }
    }
}

function colonThree() {
    const title = document.querySelector(".dipshit");
    if(title.innerText == "2048 :3"){
        title.innerText = "2048";
    } else {
        title.innerText = "2048 :3";
    }

}
function keepYourselfSafe(){
    const title = document.querySelector(".dipshit");
    if(hasK && hasY && hasS){
        title.innerText = "🖕"
    }
}
/*
function toggleShadow(){
    var empties = document.getElementsByClassName("tile");
    if(isShadowToggled) {
        for(var i = 0; i < 4; i++){
            for(var j = 0; j < 4; j++){
                var t = empties[i*4 + j];
                if(isShadowToggled){
                    t.style.boxShadow = "#0e0e0e00 -2px 2px 4px";
                } else {
                    t.style.boxShadow = "#0e0e0e38 -2px 2px 4px";
                }
                
            }
        }
    }
    if(isShadowToggled){
        isShadowToggled = false;
    } else {
        isShadowToggled = true;
    }
}
function toggleParallax(){
    var fades = document.getElementsByClassName("fades");
    for(var i = 0; i < 8; i++){
        var t = fades[i];
        if(isParallax){
            t.style.opacity = 0;
            isParallax = false;
        } else {
            t.style.opacity = 1;
            isParallax = true;
        }
    }
    isParallax = false;
}
*/
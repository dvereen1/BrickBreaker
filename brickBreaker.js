//======== Handle Mobile Devices ========== //


const screen = document.getElementById("canvas").getContext("2d");
let screenWidth = screen.canvas.clientWidth;
let screenHeight = screen.canvas.clientHeight;
const healthBuffer = document.createElement("canvas").getContext("2d");
healthBuffer.width = 100;
healthBuffer.height = 50;


/***
 * 
 * Helper Functions
 * 
 */

/* function isColliding(obj, target){
    if(obj.getBottom() > target.getTop()
        && obj.getTop() < target.getBottom()
        && obj.getLeft() > target.getLeft()
        && obj.getRight() < target.getRight()){
        return true;
    }
    return false;
}*/

function rectColliding(obj, target){
    if(obj.y > target.y + target.height || 
        obj.y + obj.height < target.y ||
        obj.x + obj.width < target.x ||
        obj.x > target.x + target.width){
            return false;
        }
        return true;
}

function drawText(text, font, fillStyle, x, y, context, alignCenter = false, bgColor = null, width = null, height = null){
    if( bgColor && width && height){
        context.fillStyle = bgColor;
        context.fillRect(0,0, width, height);
    }
    context.font = font;
    context.fillStyle = fillStyle;
    
    if(alignCenter){
        context.textAlign ="center";
    }else{
        context.textAlign = "start";
        context.textBaseline = "top";
    }
    context.fillText(text, x ,y);
}   



/*******************
 * 
 *  Game Objects
 * 
********************/

/////////////////////////////////////
///////// Character Object /////////
///////////////////////////////////

/**
 * Parent object for game objects.
 * 
 * @param {Number}  x - the object's x coordinate
 * @param {Number} y - the object's y coordinate
 * @param {Number} width - the object's width
 * @param {Number} height - the object's height
 * @param {String} color - the objects color
 * @param {Number} vel - the object's velocity
 * 
 */

function Character(x,y,width, height, color, vel){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.velX = vel;
    this.velY = vel;
}
//Functions on the character prototype that can be reached and utilized by its children
Character.prototype = {
    draw: function(game){
        game.ctx.fillStyle = this.color;
        game.ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
    },
    getTop: function(){
        return this.y;
    },
    getBottom: function() {
        return  this.y + this.height;
    },
    getLeft: function() {
        return  this.x;
    },
    getRight: function() {
        return this.x + this.width;
    },
    getCenter: function(){
        return  {x: this.x + this.width / 2, y: this.y + this.height / 2};
    }
}
/////////////////////////////////////
///////// Player Object ////////////
///////////////////////////////////
function Player(game){  
    this.health = 3;
    this.loseLife = 1;
    this.ableFire = true;
    Character.call(this, game.width/2-30, game.height-20, 60,10, "white", 400);
}
Player.prototype = Object.create(Character.prototype);
Player.prototype.update = function(game, timestep){
    /*////console.log("This is the game state: ", game.state);*/
    if(this.getRight() > game.width){
        this.x = 0;
        //this.update("",this.velX, this.velY);
    }else if(this.getLeft() < 0){
        this.x = game.width-this.width;
    }
    if(game.move.left){
        this.x -= this.velX * timestep;
    }else if(game.move.right){
        this.x += this.velX * timestep;
    }
}
Player.prototype.draw = function(game){
    game.ctx.fillStyle = this.color;
    game.ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
    game.ctx.drawImage(healthBuffer.canvas, 10, 5);
}
Player.prototype.drawHealth = function(){
   healthBuffer.clearRect(0,0, healthBuffer.width, healthBuffer.height);
   drawText(`Lives: ${this.health}`, "20px Arial", "white", 0, 0, healthBuffer);
}
Player.prototype.updHealth = function(game, deduct){ 
    if(this.health == 1 && deduct){
        game.state = "GAMEOVER";
    }else if(deduct){
        this.health -= this.loseLife;
    }
    this.drawHealth();
}
Player.prototype.canFire = function(){
    this.ableFire = true;
}
Player.prototype.fire = function(game){
    if(!this.ableFire){
        return;
    }
    //Player can fire every 0.2 seconds
    let timeoutId = setTimeout(() => {
        this.canFire();
        clearTimeout(timeoutId);
    }, 200);
    game.gameObjects.push(new Bullet(this.getCenter().x, this.getCenter().y - this.height));
    this.ableFire = false;
}
Player.prototype.constructor = Player;

////////////////////////////////////
///////// Ball Object /////////////
//////////////////////////////////

function Ball(){
    //Character.call(this, game.width/2-5, game.height/2, 10, 10,"white", 0.15);
    Character.call(this, 300, 200, 10, 10,"white", 150);
    this.toRemove = false;
}
Ball.prototype = Object.create(Character.prototype);
Ball.prototype.update = function(game, timestep){
    this.x += this.velX * timestep;
    this.y += this.velY * timestep;
    if(this.getTop() <= 0 || rectColliding(this, game.player)){
       
       this.velY = -this.velY;
    }
    if(this.getRight() >= game.width || this.getLeft() <= 0){
        this.velX = -this.velX;
    }
    if(this.getBottom() >= game.height){
        //console.log("make ball disappear");
        //displays
        drawText("OUCH", "25px Arial", "white", game.width/2, game.height/2, game.ctx, true, "black", this.width, this.height);
        game.removeObj(this);
        //console.log("ball removed from game");
        game.player.updHealth(game, true);
        
        if(game.state === "GAMEOVER"){
            //prevents ball respawn from being called after the game is over
           return;
        }
        game.ballRespawn();
        
    }
}
Ball.prototype.constructor = Ball;

/////////////////////////////////////
/////////  Ball Bits Object ////////
///////////////////////////////////

function BallBits(x, y, velX, velY){
    Character.call(this, x, y, 8, 8, "white");
    this.velX = velX;
    this.velY = velY;
    this.toRemove = false;
}
BallBits.prototype = Object.create(Character.prototype);
BallBits.prototype.update = function(game, timestep){
   this.x += this.velX * timestep;
   this.y += this.velY * timestep;
   
   if(this.y <= 0 || this.getBottom() >= game.height || this.getRight() >= game.width || this.getLeft <= 0){
       //this.toRemove = true
       console.log("should be removing ball bits");
       game.removeObj(this);
      
   }

   game.bricks.forEach( brick => {
     if(brick && rectColliding(this, brick)){
         //Remove brick from game objects array 
         game.removeObj(brick);
         //Remove brick from the brick array
         game.removeObj(brick, game.bricks)
         //Remove ball bit from game objects array
         game.removeObj(this);
         
     }
   });
}
BallBits.prototype.constructor = BallBits;


////////////////////////////////////
///////// Bullet Object ///////////
//////////////////////////////////

function Bullet(x , y){
    this.x = x;
    this.y = y;
    Character.call(this, this.x, this.y, 10, 10, "red", 200);
    this.toRemove = false;
    //this.collided = false;
}
Bullet.prototype = Object.create(Character.prototype);
Bullet.prototype.update = function(game, timestep){
        this.y -= this.velY * timestep;
        if(this.getTop() <= 0){
            //console.log("Bullet left screen")
           //this.toRemove = true;
           game.removeObj(this);
        }
        if(/*game.ball &&*/ rectColliding(this, game.ball)){
            //Remove ball from game object's array
            game.removeObj(game.ball);
            //Remove bullet from game object's array
            game.removeObj(this);
           // this.toRemove = true;
            ////console.log("collided with ball");
            game.bulletBallSpawn();
        }
        
}
Bullet.prototype.constructor = Bullet;

///////////////////////////////////
///////// Brick Object ////////////
///////////////////////////////////

function Brick(x,y,width, height, color){
    Character.call(this, x, y, width, height, color);
    this.toRemove = false;
}
Brick.prototype = Object.create(Character.prototype);

Brick.prototype.update = function(game, timestep){

    if(/*game.ball &&*/ rectColliding(game.ball, this)){
        
        game.ball.velY = -game.ball.velY;
        game.ball.velX += 10;
        game.ball.velY += 10;

       //Remove brick from gameobjects array and bricks array if it is struck by ball
        game.removeObj(this, game.bricks);
        game.removeObj(this); 
    } 
}
//Removes current Brick instance from brick array
Brick.prototype.removeSelf = function(){
  // ////console.log("This is the index of the brick to remove: ", game.bricks.indexOf(this));
   game.bricks.splice(game.bricks.indexOf(this),1);
}

Brick.prototype.constructor = Brick;
const level1 = [
    [0, 0, 0, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
]
function generateLevel(level){
    let bricks = [];
   
    level.forEach((row, rowIndex) => {
        row.forEach((column, columnIndex) => {
            if(column != 0){
                //create new brick
               bricks.push(new Brick(80 * columnIndex, 20 * (rowIndex+2), 80, 20, "yellow"));
            }
        });
    });
    return bricks;
}


//=========================================  KEY LISTENER AND CONTROLLER  ========================================//

const move = {
    left: false,
    right: false,
    fire: false,
    //fired: {},
    moving: function(event, game){
        let keyIsDown = (event.type == "keydown") ? true : false;
        switch(event.keyCode){
            case 37: 
                this.left = keyIsDown;   
                break; 
            case 39: 
                this.right = keyIsDown;
                break;
            case 32:
                game.player.fire(game);
                //this.fire = keyIsDown;
                //keyIsDown = false;
                break;        
        }
    },
    gameStatus: function(event, game){
        switch(event.keyCode){
            case 13: //Enter key pressed
                game.start();
                break;
            case 27: //ESC key pressed
                game.pause();
                break;
        }
    },
    initKeyListen: function(game){
        window.addEventListener("keydown", event => {
            event.preventDefault();
            this.moving(event, game);
            this.gameStatus(event, game);
        });
        window.addEventListener("keyup", event => this.moving(event, game));
       // ////console.log("initKeyListen is listening;");
    }
}

//======================================   Game Object =========================================================//
/*****
 * 
 * The Glue - Game object
 * 
 *****/
function Game(width, height, ctx, move){
    this.width = width;
    this.height = height;
    this.color = "black";
    this.ctx = ctx;
    this.move = move;
    this.state = "MENU";
    this.move.initKeyListen(this);
}
Game.prototype = {
    init: function(){
        //console.log("initializing game objects.")
        this.player = new Player(this);
        this.player.updHealth(this, false);
        this.ball = new Ball();
        this.bricks = generateLevel(level1);
        this.gameObjects = [this.player, this.ball, ...this.bricks];
    },
    update: function(timestep){
        if(this.state === "PAUSED" || this.state === "GAMEOVER" || this.state === "MENU"){
            //////console.log("No longer updating game objects");
            return;
        }
        if(this.bricks.length < 1) {
            ////console.log("Game won!");
            this.state = "LEVELWON";
        }
        //this.gameObjects = this.gameObjects.filter(object => !object.toRemove);
        this.gameObjects.forEach(object => {
            object.update(this, timestep);
        });
    },
    draw: function(){
        switch(this.state){
            case "MENU":
                drawText("Press ENTER to start game", "30px Arial", "white", this.width/2, this.height/2, this.ctx, true, "black", this.width, this.height);
                this.kill = false;
                break;
            case "PAUSED":
                drawText("Paused", "30px Arial", "white", this.width / 2, this.height / 2, this.ctx, true, "rgba(0,0,0,0.01)", this.width, this.height);
                break;
            case "GAMEOVER":
                this.kill = true;
                ////console.log("Game should be over");
                drawText("Game Over", "30px Arial", "white", this.width / 2, this.height / 2, this.ctx, true, "black", this.width, this.height);
                drawText("Press ENTER to try again", "30px Arial", "white", this.width / 2, this.height / 2 + 35, this.ctx, true);
                break;
            case "LEVELWON":
                this.kill = true;
                ////console.log("Should be ending game");
                drawText("Level Complete! Press ENTER to play again", "30px Arial", "white", this.width/2, this.height/2, this.ctx, true, "black", this.width, this.height);
                break;
            default:
                this.ctx.fillStyle = this.color;
                this.ctx.fillRect(0,0,this.width, this.height);
                this.gameObjects.forEach(object => object.draw(this));
        }
    },
    drawBg: function(){
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0,0, this.width, this.height);
    },
    menu: function(){
        tick(0);
    },
    start: function(){
        if(this.state === "RUNNING"){
            ////console.log("Game running already");
            return;
        }else if(this.state === "GAMEOVER" || this.state === "LEVELWON"){
            console.log("game objects before nulling: ", this.player, this.ball, this.bricks);
            this.player = null;
            this.ball = null;
            this.bricks = null;
            console.log("game objects after nulling: ", this.player, this.ball, this.bricks);
            ////console.log("Going from gameover to main menu");
            //console.log("in game start function..gamestate is game over or level won...calling menu function");
            /*
            running this code below makes the game jump ahead, the game should restart with the ball falling from the center of the screen but if the ENTER button press is delayed..it seems the game loop simulates the amount of delay time and once the game is restarted, the update method is called until the game loop catches up with time and draws the ball at a position that is not the starting position but one that reflects the distance it "moved" in the amount of time elapsed between the game being over and pressing enter. Sometimes bricks will be missing, because the ball's path "hit" bricks during that time other times the game is right back in a gameover state because the ball "hit" the bottom of the screen and the player ran out of life during the delay.
            this.state = "RUNNING";
            this.kill = false;
            tick(0);
            this.init();*/
            /*
            The code below restarts the game at the true restart. The ball falls from the center of the screen as it should, everytime... I need to figure out why calling a function that, a few intances down the line, calls another function works when both functions contain the same three lines as those above..perhaps its the delay between actual line executions..I'm not sure.....yet
             */
            this.state = "MENU";
            this.menu();
        }else if(this.state === "MENU"){
            //////console.log("Enter key pressed");
            //console.log("in game start function..gamestate is menu..game started");
            
            //let menuTimeout = setTimeout(()=>{
                this.state = "RUNNING";
                this.init();
               /* clearTimeout(menuTimeout);
            },1000)*/
            
        }
    },
    pause: function(){
        if(this.state === "PAUSED"){
            this.state = "RUNNING";
        }else{
            this.state = "PAUSED";    
        }
    },
    //Removes provided obj from provided array of objects; gameObject array by default
    removeObj: function(obj, objArray = this.gameObjects){ 
        objArray.splice(objArray.indexOf(obj),1);
    },
    bulletBallSpawn: function(){
        let rVelX = (this.ball.velX < 0) ? this.ball.velX : -this.ball.velX;
        let rVelY = (this.ball.velY < 0) ? this.ball.velY : -this.ball.velY;

        this.gameObjects.push(new BallBits(this.ball.x, this.ball.y, rVelX, rVelY), new BallBits(this.ball.getRight(), this.ball.y, -rVelX, rVelY), new BallBits(this.ball.getCenter().x, this.ball.y, 0, rVelY));

        this.ballRespawn(true);
    },
    ballRespawn: function(wait = false){
        console.log("ball respawn called");
        if(this.ball){
            let timeoutId = setTimeout(() => {
                //this.ball.toRemove = false;
                this.ball.x = this.width/2;
                this.ball.y = this.height/2;
                this.ball.velX = -this.ball.velX;
                this.gameObjects.push(this.ball);
               //////console.log("This is the current game objects array: ", this.gameObjects);
                clearTimeout(timeoutId);
            }, 1000);
        }
        /*}else{
            this.ball.x = this.width/2;
            this.ball.y = this.height/2;
            this.ball.velX = -this.ball.velX;
            this.gameObjects.push(this.ball);
        }*/
    }
}

let game = new Game(screenWidth, screenHeight, screen, move);

let accumulatedTime = 0; //the time that has passed since last update
let currentTime = 0; //current time of update/frame
let lastTime = 0;  //the time of the previous frame
let deltaTime = 1/60; //This gives about 16.667ms per frame
let frameID;

function tick(currentTime){
    //console.log("game state: ", game.state);
    ////console.log("updating");
    accumulatedTime += (currentTime - lastTime)/1000;
    lastTime = currentTime;
    /* ////console.log("currentTime", currentTime);
    ////console.log("lastFrameTime", lastTime);
    ////console.log("CurrentTime-lastTime = ", currentTime-lastTime);*/

    //only when and while the amount of time since last frame is greater than the refresh rate do we want to update game objects continuously
    while(accumulatedTime > deltaTime){
        /*////console.log("This is the accumulatedTime: ", accumulatedTime);
        ////console.log("This is delta time: ", deltaTime);*/
        game.update(deltaTime);
        accumulatedTime -= deltaTime;
    }
    game.draw();
     
    let frameID = requestAnimationFrame(tick);
    if(game.kill){
        //console.log("should be killing game");
        cancelAnimationFrame(frameID);
        return;
    }
    //console.log("reached end of game loop");
}
function init(){
    //////console.log("init was called");
    tick(0);
}
window.onload = init();
/*function(){
    if(window.innerWidth < 642){
        alert("Your device screen will cut off parts of the game. Working on mobile support.");
    }
}*/
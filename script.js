window.addEventListener("load",function(){
    //canvas setup
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 1000;
    canvas.height = 500;
    class InputHandler{
      constructor(game){
        this.game = game;
        window.addEventListener("keydown",e =>{
            if(((e.key === "ArrowUp")||(e.key === "ArrowDown")) && this.game.keys.indexOf(e.key) === -1){
                this.game.keys.push(e.key);
            }
            else if( e.key === ' '){
                this.game.Player.shootTop();
            }
            else if( e.key === 'd'){
                this.game.debug = !this.game.debug
            }
            // console.log(this.game.keys);
        });
        

        window.addEventListener("keyup" , e=>{
            if(this.game.keys.indexOf(e.key) > -1){
              this.game.keys.splice(this.game.keys.indexOf(e.key) , 1);
            }
            // console.log(this.game.keys);
        })
      }
    }

    //fire projectile
    class Projectile{
        constructor(game,x,y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width =10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeleteation = false;
            this.image = document.getElementById("projectile");
        }
        update(){
            this.x += this.speed;
            if(this.x > this.game.width*0.8) {
                this.markedForDeleteation = true; 
            }
        }
        draw(context){
            context.drawImage(this.image,this.x,this.y);
            
        }    
    }


    class Particale{
        constructor(game,x,y){
          this.game = game;
          this.x = x;
          this.y = y;
          this.image = document.getElementById('gears');
          this.frameX = Math.floor(Math.random() * 3);
          this.frameY = Math.floor(Math.random() * 3);
          this.spriteSize = 50;
          this.sizeModifire = (Math.random() * 0.5 + 0.5).toFixed(1);
          this.size = this.spriteSize * this.sizeModifire;
          this.speedX = Math.random() * 6 - 3;
          this.speedY = Math.random() * -15;
          this.gravity = 0.5;
          this.markedForDeleteation = false;
          this.angle = 0;
          this.va = Math.random() * 0.2 - 0.1;
          this.bounced = 0;
          this.bottomBoundary = Math.random() * 80 + 60;

        }
        update(){
          this.angle += this.va;
          this.speedY += this.gravity;
          this.x -= this.speedX + this.game.speed;
          this.y += this.speedY;
          if(this.y > this.game.height + this.size || this.x < 0 - this.size) this.markedForDeleteation = true;
          if(this.y > this.game.height - this.bottomBoundary &&this.bounced<5) {
            this.bounced++;
            this.speedY *= -0.9;
          }
        }
        draw(context){
          context.save();
          context.translate(this.x,this.y);
          context.drawImage(this.image,this.frameX * this.spriteSize,this.frameY * this.spriteSize, this.spriteSize, this.spriteSize,this.size * -0.5,this.size * -0.5,this.size,this.size);
          context.restore();
        }
    }


    class Player{
      constructor(game){
        this.game = game;
        this.width = 120;
        this.height = 190;
        this.x = 20;
        this.y = 100;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 37;
        this.speedY = 0;
        this.maxSpeed = 2
        this.Projectiles = [];
        this.image = document.getElementById("player");
        this.powerUp = false;
        this.powerUpTimer = 0;
        this.powerUpLimit = 10000;
      }
      update(deltaTime){
        if(this.game.keys.includes("ArrowDown")) this.speedY = this.maxSpeed;
        else if(this.game.keys.includes("ArrowUp")) this.speedY = -this.maxSpeed;
        else this.speedY = 0;
        this.y += this.speedY;
        //vertical boundaris 
        if(this.y>this.game.height-this.height*0.5){
         this.y = this.game.height-this.height*0.5
        }else if(this.y < -this.height*0.5){
          this.y = -this.height*0.5
         }
        //handle Projectile
        this.Projectiles.forEach(Projectile=>{
            Projectile.update();
        });
        this.Projectiles = this.Projectiles.filter(Projectile => !Projectile.markedForDeleteation); 
        
        //sprite animation
        if(this.frameX<this.maxFrame){
          this.frameX++;
        }else{
          this.frameX = 0;
        }
        
        //power up
        if(this.powerUp){
          if(this.powerUpTimer>this.powerUpLimit){
            this.powerUpTimer = 0;
            this.powerUp = false;
            this.frameY = 0;
          }else{
            this.powerUpTimer += deltaTime;
            this.frameY = 1;
            this.game.ammo += 0.1;
          }
        }
      }
      draw(context){
        if(this.game.debug)context.strokeRect(this.x,this.y,this.width,this.height);        
        context.drawImage(this.image,this.frameX*this.width,this.frameY*this.height,this.width,this.height,this.x,this.y,this.width,this.height);
        this.Projectiles.forEach(Projectile=>{
            Projectile.draw(context);
        });
      }
      shootTop(){
       if(this.game.ammo>0){
        this.Projectiles.push(new Projectile(this.game , this.x+80 , this.y+30));
        // console.log(this.Projectiles);
        this.game.ammo--;
       }
       if(this.powerUp) this.shootBottom();
      }
      shootBottom(){
        if(this.game.ammo>0){
          this.Projectiles.push(new Projectile(this.game , this.x+80 , this.y+175));
          this.game.ammo--;
         }
        
      }
      enterPowerUp(){
        this.powerUpTimer = 0;
        this.powerUp = true;
        if(this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo;
      }
    }


    class Enemy{
      constructor(game){
        this.game = game;
        this.x = this.game.width;
        this.speedX = Math.random()  * -1.5 - 0.5;
        this.markedForDeleteation = false;
       
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 37;
      }
      update(){
        this.x += this.speedX - this.game.speed;
        if(this.x + this.width < 0) this.markedForDeleteation = true;
        //sprite animation
        if(this.frameX<this.maxFrame){
            this.frameX++;
        }else{
          this.frameX = 0;
        }
      }
      draw(context){
       
       if(this.game.debug) context.strokeRect(this.x,this.y,this.width,this.height);
        context.drawImage(this.image,this.frameX*this.width,this.frameY*this.height,this.width,this.height,this.x,this.y,this.width,this.height)
        if(this.game.debug){
          context.font = '20px Helvetica'
          context.fillText(this.lives,this.x,this.y);
        }
      }
    }
    
    class Angeler1 extends Enemy{
      constructor(game){
        super(game);
        this.width = 228;
        this.height = 169;
        this.y = Math.random() * (this.game.height * 0.95 - this.height);
        this.image = document.getElementById("angler1");
        this.frameY = Math.floor(Math.random()*3);
        this.lives = 4;
        this.score = this.lives;
      }
    }
    
    class Angeler2 extends Enemy{
      constructor(game){
        super(game);
        this.width = 213;
        this.height = 165;
        this.y = Math.random() * (this.game.height * 0.95 - this.height);
        this.image = document.getElementById("angler2");
        this.frameY = Math.floor(Math.random()*2);
        this.lives = 6;
        this.score = this.lives;
      }
    }

    class LuckyFish extends Enemy{
      constructor(game){
        super(game);
        this.width = 99;
        this.height = 95;
        this.y = Math.random() * (this.game.height * 0.95 - this.height);
        this.image = document.getElementById("lucky");
        this.frameY = Math.floor(Math.random()*2);
        this.lives = 3;
        this.score = 5;
        this.type = 'lucky';
      }
    }

    class HiveWhale extends Enemy{
      constructor(game){
        super(game);
        this.width = 400;
        this.height = 227;
        this.y = Math.random() * (this.game.height * 0.95 - this.height);
        this.image = document.getElementById("hiveWhale");
        this.frameY = 0;
        this.lives =20;
        this.score = this.lives;
        this.type = 'hive';
        this.speedX = Math.random() *-1.2 -0.2;
      }
    }

    class Drone extends Enemy{
      constructor(game ,x ,y){
        super(game);
        this.width =115;
        this.height = 95;
        this.x = x;
        this.y = y
        this.image = document.getElementById("drone");
        this.frameY =Math.floor( Math.random() * 2);
        this.lives = 5;
        this.score = this.lives;
        this.type = 'drone';
        this.speedX = Math.random() * -4.2 -0.5;
      }
    }


    class Layer{
     constructor(game, image, speedModifier){
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 1786;
      this.height = 500;
      this.x = 0;
      this.y = 0;
     }
     update(){
      if(this.x <= -this.width) this.x = 0;
      else this.x -= this.game.speed *this.speedModifier; 
     }
     draw(context){
      context.drawImage(this.image , this.x, this.y);
      context.drawImage(this.image , this.x+this.width, this.y);
     }
    }


    class Background{
       constructor(game) {
        this.game = game;
        this.img1 = document.getElementById('layer1');
        this.img2 = document.getElementById('layer2');
        this.img3 = document.getElementById('layer3');
        this.img4 = document.getElementById('layer4');
        this.layer1 = new Layer(this.game , this.img1, 0.2);
        this.layer2 = new Layer(this.game , this.img2, 0.4);
        this.layer3 = new Layer(this.game , this.img3, 1);
        this.layer4 = new Layer(this.game , this.img4, 1.5);
        this.layers = [this.layer1 , this.layer2,this.layer3];
       }
       update(){
        this.layers.forEach(layer=>{
          layer.update();
        })
       }
       draw(context){
        this.layers.forEach(layer=>{
          layer.draw(context);
        })
       }
    }


    class Explosion{
      constructor(game,x,y){
        this.game = game;
        this.x = x;
        this.y = y;
        this.frameX = 0;
        this.spriteWidth = 200;
        this.spriteHeight = 200;
        this.width = this.spriteWidth;
        this.height = this.spriteHeight
        this.x = x - this.width * 0.5;
        this.y = y - this.height * 0.5;
        this.fps = 30;
        this.timer = 0;
        this.interval = 1000/this.fps;
        this.markedForDeleteation = false;
        this.maxFrame = 8;
      }
      update(deltaTime){
        this.x -= this.game.speed;
        if(this.timer>this.interval){
          this.frameX++;
          this.timer = 0;
        }else{
          this.timer += deltaTime;
        }
        if(this.frameX>this.maxFrame) this.markedForDeleteation = true;
      }
      draw(context){
       context.drawImage(this.image,this.frameX *
        this.spriteWidth,0, this.spriteWidth,this.spriteHeight,this.x,this.y,this.width,this.height);
      }
    }

    class SmokeExplosion extends Explosion{
      constructor(game,x,y) {
        super(game,x,y);
        this.image = document.getElementById('smokeExplosion')
        
      }
    }

    class FireExplosion extends Explosion{
      constructor(game,x,y) {
        super(game,x,y);
        this.image = document.getElementById('fireExplosion');
      }
    }

    class UI{
      constructor(game){
        this.game = game;
        this.fontSize = 25;
        this.fontFamily = 'Bangers';
        this.color = 'White';
      }
      draw(context){
        context.save();
        context.fillStyle = this.color;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = 'black'
        context.font = this.fontSize + 'px ' + this.fontFamily;
       
        //score
        context.fillText('Score: ' + this.game.score,20,40);
        
        //timer
        const formatTime  = (this.game.gameTime * 0.001).toFixed(1);
        context.fillText('Timer: '+ formatTime,20,100);
        //gameOver message
        if(this.game.gameOver){
          context.textAlign = 'center';
          let message1;
          let message2;
          if(this.game.score > this.game.winningScore){
            message1 = 'Most Wonderous!';
            message2 = 'Well done explorer!';
          }else{
            message1 = 'Fool!!';
            message2 = 'Get my repair kit and try again';
          }
          context.font = '70px ' + this.fontFamily;
          context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20);
          context.font = '25px ' + this.fontFamily;
          context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 20);
        }
        //ammo 
        if(this.game.Player.powerUp) context.fillStyle = '#F6FDC3'      
        for(let i = 0; i<this.game.ammo;i++){
          context.fillRect(20+5*i,50,3,20);
        }
        context.restore();
      }

    }
    class Game{
       constructor(width,height){
        this.width = width;
        this.height = height;
        this.Player = new Player(this);
        this.input = new InputHandler(this);
        this.ui = new UI(this);
        this.background = new Background(this);
        this.keys = [];
        this.enemies = [];
        this.Particales = [];
        this.explosions = [];
        this.enemyTimer = 0;
        this.enemyInterval = 2000;
        this.ammo = 20;
        this.maxAmmo = 50;
        this.ammotimer = 0;
        this.ammoInterval = 350;
        this.gameOver = false;
        this.score = 0;
        this.winningScore = 200;
        this.gameTime = 0;
        this.timeLimit = 60000;
        this.speed = 1;
        this.debug = false;
       }
       update(deltaTime){
        if(!this.gameOver) this.gameTime += deltaTime;
        if(this.gameTime > this.timeLimit) this.gameOver = true;
        this.background.update();
        this.background.layer4.update();
        this.Player.update(deltaTime);
        if(this.ammotimer > this.ammoInterval){
          if(this.ammo < this.maxAmmo)this.ammo++;
          this.ammotimer = 0;
        }else{
          this.ammotimer += deltaTime;
        }
        this.Particales.forEach(Particale => Particale.update());
        this.Particales = this.Particales.filter(Particale=> !Particale.markedForDeleteation);
        this.explosions.forEach(explosion => explosion.update(deltaTime));
        this.explosions = this.explosions.filter(explosion=> !explosion.markedForDeleteation);
        
        //enemy
        this.enemies.forEach(enemy =>{
          enemy.update();
          if(this.checkCollusion(this.Player, enemy)){
            enemy.markedForDeleteation = true;
            this.addExplosion(enemy);
            for(let i = 0; i<enemy.score; i++){
              this.Particales.push(new Particale(this,enemy.x+enemy.width * 0.5,enemy.y + enemy.height * 0.5));
            }
            if(enemy.type === 'lucky') this.Player.enterPowerUp();
            else if(!this.gameOver) this.score--;
          }
          this.Player.Projectiles.forEach(projectile=>{
            if(this.checkCollusion(projectile,enemy)){
              enemy.lives--;
              projectile.markedForDeleteation = true;
              if(enemy.lives <= 0){
                for(let i = 0; i<enemy.score; i++){
                  this.Particales.push(new Particale(this,enemy.x+enemy.width * 0.5,enemy.y + enemy.height * 0.5));
                }
               enemy.markedForDeleteation = true;
               this.addExplosion(enemy);
               if(enemy.type === 'hive'){
                for(let i = 0; i<5; i++){
                  this.enemies.push(new Drone(this, enemy.x+Math.random()*enemy.width,enemy.y+Math.random()*enemy.height*0.5));
                }
                  
               }
              
               if(!this.gameOver) this.score += enemy.score;
               if(this.score>this.winningScore)this.gameOver = true;
              }
            }
          })
        });
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeleteation );
        if(this.enemyTimer > this.enemyInterval && !this.gameOver){
           this.addEnemy();
           this.enemyTimer = 0;
        }else{
          this.enemyTimer += deltaTime;
        }
       }

       draw(context){
        this.background.draw(context);
        this.ui.draw(context);
        this.Player.draw(context);
        this.Particales.forEach(Particale => Particale.draw(context));
        this.enemies.forEach(enemy =>{
          enemy.draw(context);
        });
        this.explosions.forEach(explosion =>{
          explosion.draw(context);
        });
        this.background.layer4.draw(context);
       }

       addEnemy(){
        const randomise = Math.random();
        if(randomise<0.3) this.enemies.push(new Angeler1(this));
        else if(randomise<0.6)  this.enemies.push(new Angeler2(this));
        else if(randomise<0.7) this.enemies.push(new HiveWhale(this));
        else this.enemies.push(new LuckyFish(this));
       }
       addExplosion(enemy){
        const randomise = Math.random();
        if(randomise < 0.5) this.explosions.push(new SmokeExplosion(this,enemy.x+enemy.width*0.5,enemy.y+enemy.height*0.5));
        else{
          this.explosions.push(new FireExplosion(this,enemy.x+enemy.width*0.5,enemy.y+enemy.height*0.5));
        }
       }
       checkCollusion(rect1,rect2){
        return(rect1.x<rect2.x+rect2.width&&
               rect1.x+rect1.width>rect2.x&&
               rect1.y<rect2.y+rect2.height&&
               rect1.y+rect1.height>rect2.y);
       }
    }

    const game = new Game(canvas.width,canvas.height);
    
    let lastTime = 0;
    //animation loop
    function animate(timeStamp){
      const deltaTime = timeStamp - lastTime;
      
      lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        game.draw(ctx);
        game.update(deltaTime);
        requestAnimationFrame(animate);
    }
    animate(0);
})
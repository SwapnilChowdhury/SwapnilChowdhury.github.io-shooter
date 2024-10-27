const canvas = document.querySelector("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;
const score = document.getElementById("score");
const ctx = canvas.getContext("2d");
const start = document.getElementById("start");
const scoreboard = document.getElementById("scoreboard");
const finalscore = document.getElementById("finalscore");
class Player{
    constructor(x,y,radius,color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI,false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

const friction = 0.99;
class Particle{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity=velocity;
        this.alpha=1;
    }
    draw(){
        ctx.save();
        ctx.globalAlpha = this.alpha
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI,false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    update(){
        this.draw();
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x+this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity=velocity;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI,false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update(){
        this.draw();
        this.x = this.x+this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity=velocity;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI,false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update(){
        this.draw();
        this.x = this.x+this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
let projectiles = [];
let enemies = [];
let particles = [];
let midx = canvas.width/2;
let midy =canvas.height/2;
let player = new Player(midx,midy,10,'white');
let count=0;
let animationID
let stopenemy=1;

function init(){
    projectiles = [];
    enemies = [];
    particles = [];
    midx = canvas.width/2;
    midy =canvas.height/2;
    player = new Player(midx,midy,10,'white');
    count = 0;
    score.innerHTML = 0;
    stopenemy=0;
}
//const proj1 = new Projectile(canvas.width/2,canvas.height/2,5,'green',{x:-1,y:-1});
//const proj = new Projectile(canvas.width/2,canvas.height/2,5,'red',{x:1,y:1});
function spawnEnemies(stopenemy){
    if(!stopenemy)
    {
    setInterval(()=>{
        const radius = (Math.random()*(30-8))+8
        let x;
        let y;
        if(Math.random()<0.5)
        {
            x = Math.random()<0.5?0-radius:canvas.width-radius;
            y = Math.random()*canvas.height;
        }
        else
        {
            x = Math.random()*canvas.width;
            y = Math.random()<0.5?0-radius:canvas.height-radius;
        }
        //const color = 'green'
        const color = `hsl(${Math.random()*360},50%,50%)`
        const angle = Math.atan2(midy-y,midx-x);
        const velocity = {x:Math.cos(angle)*1.5,y:Math.sin(angle)*1.5};
        enemies.push(new Enemy(x,y,radius,color,velocity))
    },3000)
    }
}
function animate(){
    animationID = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    ctx.fillRect(0,0,canvas.width,canvas.height);
    player.draw();
    particles.forEach((particle,index)=>{
        if(particle.alpha<=0)
        {
            particles.splice(index,1);
        }
        else
        {
            particle.update();
        }
    })
    projectiles.forEach((projectile,projIndex)=>{projectile.update()
        if(projectile.x+projectile.radius<0 || projectile.x+projectile.radius>canvas.width || projectile.y+projectile.radius<0 || projectile.y+projectile.radius>canvas.height)
        {
            setTimeout(()=>{
                projectiles.splice(projIndex,1);
            },0)
        }
    })
    enemies.forEach((enemy,index)=>{enemy.update()
        const dist = Math.hypot(player.x-enemy.x,player.y-enemy.y);
        //endgame
        if(dist-enemy.radius-player.radius < 1)
        {
            cancelAnimationFrame(animationID);
            finalscore.innerHTML = count;
            scoreboard.style.display = 'flex';
            projectiles=[];
            enemies=[];
            stopenemy=1;
        }
        projectiles.forEach((projectile,projIndex)=>{
            const dist = Math.hypot(projectile.x-enemy.x,projectile.y-enemy.y);
            if(dist-enemy.radius-projectile.radius < 1)
            {
                for(let i=0;i<enemy.radius*2;i++)
                {
                    particles.push(new Particle(projectile.x,projectile.y,Math.random()*3,enemy.color,{x:(Math.random()-0.5)*6,y:(Math.random()-0.5)*6}))
                }
                if(enemy.radius-10>10)
                {
                    count+=100;
                    score.innerHTML = count;
                    /*gsap.to(enemy,(
                        radius:enemy.radius-10;
                    ))*/
                    enemy.radius -= 10;
                    setTimeout(()=>{
                        projectiles.splice(projIndex,1);
                    },0)
                }
                else
                {
                    count+=200;
                    score.innerHTML = count;
                    setTimeout(()=>{
                        enemies.splice(index,1);
                        projectiles.splice(projIndex,1);
                    },0)
                }
            }
        })
    })
    console.log(enemies.length)
    //spawnEnemies();
    //projectile.update();
}


window.addEventListener("click",(evt)=>{
    const angle = Math.atan2(evt.clientY-midy,evt.clientX-midx);
    const vel = {x:Math.cos(angle)*5,y:Math.sin(angle)*5};
    projectiles.push(new Projectile(midx,midy,5,'white',vel));

});

start.addEventListener('click',(evt2)=>{
    init();
    animate();
    spawnEnemies(stopenemy);
    scoreboard.style.display = 'none';
})
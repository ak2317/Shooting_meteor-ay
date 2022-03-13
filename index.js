// importing 
const introMusic = new Audio("./music/introSong.mp3");
const shootingSound = new Audio("./music/shoooting.mp3");
const killEnemySound = new Audio("./music/killEnemy.mp3");
const gameOverSound = new Audio("./music/gameOver.mp3");
const heavyWeaponSound = new Audio("./music/heavyWeapon.mp3");
const hugeWeaponSound = new Audio("./music/hugeWeapon.mp3");

introMusic.play();
//BASIC GAME SETUP

const canvas = document.createElement("canvas");
document.querySelector(".myGame").appendChild(canvas);
canvas.width = innerWidth;
canvas.height = innerHeight;
const context = canvas.getContext("2d");
// Earth image
const earth = new Image();
earth.src = "earth.png";
const lightweapondamage = 10;
const heavyweapondamage = 20;

let difficulty = 2;
const form = document.querySelector("form");
const scoreBoard = document.querySelector(".scoreBoard");
let playerscore = 0;

//   Basic Functions

//   Event Listener for Difficulty form

document.querySelector("input").addEventListener("click", (e) => {
  e.preventDefault();

  //stoping music
  introMusic.pause();
  // making form invisble
  form.style.display = "none";
  // making scoreBoard visble
  scoreBoard.style.display = "block";

  // getting diffculty selected by user

  const userValue = document.getElementById("difficulty").value;

  if (userValue === "Easy") {
    setInterval(spawnenemy, 2000);
    return (difficulty = 4);
  }
  if (userValue === "Medium") {
    setInterval(spawnenemy, 1400);
    return (difficulty = 7);
  }
  if (userValue === "Hard") {
    setInterval(spawnenemy, 1000);
    return (difficulty = 9);
  }
  if (userValue === "Insane") {
    setInterval(spawnenemy, 700);
    return (difficulty = 11);
  }
});

// game over
const gameoverloader = () => {
  // creating endscreen div and playagin button and score with highest score

  const gameoverbanner = document.createElement("div");
  const gameoverbtn = document.createElement("button");
  const highscore = document.createElement("div");
  highscore.innerHTML = `high score: ${
    localStorage.getItem("highscore")
      ? localStorage.getItem("highscore")
      : playerscore
  }`;

  const oldhighscore =
    localStorage.getItem("highscore") && localStorage.getItem("highscore");

  if (oldhighscore < playerscore) {
    localStorage.setItem("highscore", playerscore);
    //updatingscore in score board html element
    highscore.innerHTML = `high score :${playerscore}`;
    highscore.style.color= "red";
  }

  // adding text in button
  gameoverbtn.innerText = "play again";

  gameoverbanner.appendChild(highscore);
  gameoverbanner.appendChild(gameoverbtn);

  //making reload on clicking playagin button
  gameoverbtn.onclick = () => {
    window.location.reload();
  };

  gameoverbanner.classList.add("gameover");

  document.querySelector("body").appendChild(gameoverbanner);
};

// ------------------- Creating Player, Enemy, Weapon, Etc Classes-----------------------------------

// Setting player position to center
playerPosition = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

// Creating Player Class
class player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    //context.fillStyle = this.color;
    context.fill();
    context.drawImage(
      earth,
      canvas.width / 2 - 30,
      canvas.height / 2 - 30,
      2 * this.radius,
      2 * this.radius
    ); //new
    context.restore(); //new
  }
}

// -----------------------------------------DESTROYER---------------------------------------------------------------------------------------
class weapon {
  constructor(x, y, radius, color, velocity, damage) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.damage = damage;
  }
  draw() {
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
  }
  update() {
    this.draw();

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

// creating fat bomb
class hugeweapon {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.color = "rgba(255,0,133,1)";

    
  }
  draw() {
    context.beginPath();
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, 200, canvas.height);
  }
  update() {
    this.draw();

    this.x += 20; // huge weapon speed
  }
}


//----------------------------------METEORs-------------------------------------
class enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
  }
  update() {
    this.draw();

    (this.x += this.velocity.x), (this.y += this.velocity.y);
  }
}

//creating particles class
const friction = 0.98;
class particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    context.save();
    context.globalAlpha = this.alpha;
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
    context.restore();
  }
  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;

    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}
//------------------------------MAIN LOGIC HERE----------------------------------------------------------------------------------------------------------------------------------------------------
const akash = new player(playerPosition.x, playerPosition.y, 30, "white");
const weapons = [];
const hugeweapons = [];
const enemies = [];
const particles = [];

//--------------------Function To Spawn Enemy at Random Location---------------------------------------------------------------------------------------------------------------------------
const spawnenemy = () => {
  // generating random size for enemy

  const enemySize = Math.random() * (30 - 5) + 5;

  // generating random color for enemy

  const enemyColor = `hsl(${Math.floor(Math.random() * 360)},100%,50%)`;

  // random is Enemy Spawn position

  let random;

  // Making Enemy Location Random but only from outsize of screen

  if (Math.random() < 0.5) {
    // Making X equal to very left off of screen or very right off of screen and setting Y to any where vertically

    random = {
      x: Math.random() < 0.5 ? canvas.width + enemySize : 0 - enemySize,
      y: Math.random() * canvas.height,
    };
  } else {
    // Making Y equal to very up off of screen or very down off of screen and setting X to any where horizontally
    random = {
      x: Math.random() * canvas.width,
      y: Math.random() < 0.5 ? canvas.height + enemySize : 0 - enemySize,
    };
  }

  // Finding Angle between center (means Player Position) and enemy position
  const myangle = Math.atan2(
    canvas.height / 2 - random.y,
    canvas.width / 2 - random.x
  );

  // Making velocity or speed of enemy by multipling chosen difficulty to radian
  const velocity = {
    x: Math.cos(myangle) * difficulty,
    y: Math.sin(myangle) * difficulty,
  };

  // Adding enemy to enemies array
  enemies.push(new enemy(random.x, random.y, enemySize, enemyColor, velocity));
};

// ------------------------------------Creating Animation Function --------------------------------------------------------------------------------------------------------------
let animationId;
function animation() {
  //making recursion
  animationId = requestAnimationFrame(animation);

  //updatingscore in score board html element
  scoreBoard.innerHTML = `score : ${playerscore}`;

  //   clearing canvas on each frame
  context.fillStyle = "rbga(49,49,49,0.2)";

  context.clearRect(0, 0, canvas.width, canvas.height);

  //   drawing player

  akash.draw();

  //generating particles

  particles.forEach((particle, particleIndex) => {
    if (particle.alpha <= 0) {
      particles.splice(particleIndex, 1);
    } else {
      particle.update();
    }
  });

  //generating hugeweapon
  hugeweapons.forEach((hugeweapon, hugeweaponIndex) => {
    if (hugeweapon.x > canvas.width) {
      hugeweapons.splice(hugeweaponIndex, 1);
    } else {
      hugeweapon.update();
    }
  });
  //   Generating Bullets

  weapons.forEach((weapon, weaponIndex) => {
    weapon.update();
    // removing destroyer if they are off screen
    if (
      weapon.x + weapon.radius < 1 ||
      weapon.y + weapon.radius < 1 ||
      weapon.x - weapon.radius > canvas.width ||
      weapon.y - weapon.radius > canvas.height
    ) {
      weapons.splice(weaponIndex, 1);
    }
  });

  //   Generating enemies

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();
    // finding dist between player and meteor
    const distanceBetweenweaponAndEnemy = Math.hypot(
      akash.x - enemy.x,
      akash.y - enemy.y
    );
    // stoping game if meteor hit earth
    if (distanceBetweenweaponAndEnemy - akash.radius - enemy.radius < 1) {
      //console.log("gameover");
      cancelAnimationFrame(animationId);
      gameOverSound.play();
      return gameoverloader();
    }

    hugeweapons.forEach((hugeweapon) => {
      // finding distance between huge weapon and enemy
      const distanceBetweenhugeweaponAndEnemy = hugeweapon.x - enemy.x;

      if (
        distanceBetweenhugeweaponAndEnemy <= 200 &&
        distanceBetweenhugeweaponAndEnemy >= -200
      ) {
        // upgrading score on killing the enemy
        playerscore += 10;
        //rendering score in score board html elemt
        scoreBoard.innerHTML = `score :${playerscore}`;
        setTimeout(() => {
          killEnemySound.play();
          enemies.splice(enemyIndex, 1);
        }, 0);
      }
    });

    weapons.forEach((weapon, weaponIndex) => {
      const distanceBetweenweaponAndEnemy = Math.hypot(
        weapon.x - enemy.x,
        weapon.y - enemy.y
      );
      if (distanceBetweenweaponAndEnemy - weapon.radius - enemy.radius < 1) {
        // reducing size of enemy on hit
        if (enemy.radius > weapon.damage + 5) {
          gsap.to(enemy, {
            radius: enemy.radius - weapon.damage,
          });
          setTimeout(() => {
            weapons.splice(weaponIndex, 1);
          }, 0);
        }
        //removing enemy on hit if they are below 18
        else {
          for (let i = 0; i < enemy.radius; i++) {
            particles.push(
              new particle(weapon.x, weapon.y, 3, enemy.color, {
                x: (Math.random() - 0.5) * 3,
                y: (Math.random() - 0.5) * 3,
              })
            );
          }
          // upgrading score on killing the enemy
          playerscore += 10;

          //rendering score in score board html elemt
          scoreBoard.innerHTML = `score :${playerscore}`;
          
          setTimeout(() => {
           killEnemySound.play(); 
           enemies.splice(enemyIndex, 1);
            weapons.splice(weaponIndex, 1);
          }, 0);
        }
      }
    });
  });
}

// ---------------------------------Adding Event Listeners---------------------------------------------------------------------------------------------------------------------------

// event listener for light weapon aka left click
canvas.addEventListener("click", (e) => {

  shootingSound.play();
  // finding angle between player position(center) and click co-ordinates
  const myangle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );

  // Making const speed for light weapon
  const velocity = {
    x: Math.cos(myangle) * 10,
    y: Math.sin(myangle) * 10,
  };
  // Adding light weapon in weapons array

  weapons.push(
    new weapon(
      canvas.width / 2,
      canvas.height / 2,
      8,
      "white",
      velocity,
      lightweapondamage
    )
  );
});

// event listener for heavyweapon aka right click
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();


  
  if (playerscore <= 0) {
    return;
  }
  heavyWeaponSound.play();
  // decreasing the score on use of heavy weapon
  playerscore -= 2;
  //updatingscore in score board html element
  scoreBoard.innerHTML = `score :${playerscore}`;
  // finding angle between player position(center) and click co-ordinates
  const myangle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );

  // Making const speed for light weapon
  const velocity = {
    x: Math.cos(myangle) * 3,
    y: Math.sin(myangle) * 3,
  };
  // Adding light weapon in weapons array
  weapons.push(
    new weapon(
      canvas.width / 2,
      canvas.height / 2,
      20,
      "cyan",
      velocity,
      heavyweapondamage
    )
  );
});

addEventListener("keypress", (e) => {
  if (e.key === " ") {
    if (playerscore < 20) {
      return;
    }
    // decreasing the score on use of huge weapon
    playerscore -= 30;
    //updatingscore in score board html element
    scoreBoard.innerHTML = `score :${playerscore}`;
    hugeWeaponSound.play();
    hugeweapons.push(new hugeweapon(0, 0));
  }
});

addEventListener("contextmenu", (e) => {
  e.preventDefault();
});
addEventListener("resize", () => {
  window.location.reload();
});




animation();

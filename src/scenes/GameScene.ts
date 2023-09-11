import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  // Game elements
  player!: Phaser.Physics.Arcade.Sprite;
  stars!: Phaser.Physics.Arcade.Group;
  bombs!: Phaser.Physics.Arcade.Group;
  oranges!: Phaser.Physics.Arcade.Group;
  bananas!: Phaser.Physics.Arcade.Group;
  platforms!: Phaser.Physics.Arcade.StaticGroup;

  // Game state
  score: number;
  lives: number;
  round: number;
  direction: "left" | "right";
  hasStarted: boolean;
  hasMoved: boolean;
  gameOver: boolean;

  // Gameplay
  initialPlayerPositionX: number;
  initialPlayerPositionY: number;
  playerVelocityX: number;
  playerVelocityY: number;
  playerBounce: number;
  totalStars: number;
  bombBaseVelocityX: number;
  bombVelocityMultiplierX: number;
  bombVelocityY: number;
  foodMinVelocityX: number;
  foodMaxVelocityX: number;
  foodVelocityY: number;

  // Controls
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Images
  background!: Phaser.GameObjects.Image;
  hello!: Phaser.GameObjects.Image;
  heart1!: Phaser.GameObjects.Image;
  heart2!: Phaser.GameObjects.Image;
  heart3!: Phaser.GameObjects.Image;

  // Texts
  scoreText!: Phaser.GameObjects.BitmapText;
  gameOverText!: Phaser.GameObjects.BitmapText;
  restartText!: Phaser.GameObjects.BitmapText;

  // Audio
  soundtrack!:
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.WebAudioSound;

  constructor() {
    super({ key: "GameScene" });
    // Game state
    this.score = 0;
    this.lives = 3;
    this.round = 0;
    this.direction = "right";
    this.hasStarted = false;
    this.hasMoved = false;
    this.gameOver = false;
    // Player
    this.initialPlayerPositionX = 20;
    this.initialPlayerPositionY = 150;
    this.playerVelocityX = 90;
    this.playerVelocityY = 200;
    this.playerBounce = 0.2;
    // Stars
    this.totalStars = 10;
    // Bombs
    this.bombBaseVelocityX = 20;
    this.bombVelocityMultiplierX = 3;
    this.bombVelocityY = 15;
    // Food
    this.foodMinVelocityX = 10;
    this.foodMaxVelocityX = 30;
    this.foodVelocityY = 10;
  }

  preload() {
    // Fonts
    this.load.bitmapFont(
      "Thick",
      "./assets/fonts/thick_8x8.png",
      "./assets/fonts/thick_8x8.xml"
    );
    // Images
    this.load.image("sky", "./assets/images/sky.png");
    this.load.image("ground", "./assets/images/platform.png");
    this.load.image("star", "./assets/images/star.png");
    this.load.image("bomb", "./assets/images/bomb.png");
    this.load.image("orange", "./assets/images/orange.png");
    this.load.image("banana", "./assets/images/banana.png");
    this.load.image("heart", "./assets/images/heart.png");
    this.load.image("hello", "./assets/images/hello.png");
    // Spritesheets
    this.load.spritesheet("character", "./assets/images/character.png", {
      frameWidth: 18,
      frameHeight: 17,
    });
    // Audio
    this.load.audio("soundtrack", "./assets/audio/soundtrack.mp3");
  }

  create() {
    // Soundtrack
    this.soundtrack = this.sound.add("soundtrack");
    this.soundtrack.loop = true;
    this.soundtrack.volume = 0.85;
    this.soundtrack.play();

    //  Background
    this.background = this.add.image(0, 0, "sky").setOrigin(0, 0);

    //  The platforms group contains the ground and the 3 ledges we can jump on
    this.platforms = this.physics.add.staticGroup();

    //  Ground
    this.platforms.create(100, 197, "ground");

    //  Ledges
    this.platforms.create(200, 135, "ground");
    this.platforms.create(-40, 100, "ground");
    this.platforms.create(240, 75, "ground");

    // Lives
    this.heart1 = this.add.image(186, 12, "heart");
    this.heart2 = this.add.image(166, 12, "heart");
    this.heart3 = this.add.image(146, 12, "heart");

    // Hello
    this.hello = this.add.image(35, 165, "hello");
    this.hello.setVisible(false);

    // The player and its settings
    this.player = this.physics.add.sprite(
      this.initialPlayerPositionX,
      this.initialPlayerPositionY,
      "character"
    );

    //  Player physics properties
    this.player.setBounce(this.playerBounce);
    this.player.setCollideWorldBounds(true);

    //  Player animations, turning, walking left and walking right.
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("character", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turnLeft",
      frames: [{ key: "character", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "turnRight",
      frames: [{ key: "character", frame: 5 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("character", {
        start: 6,
        end: 9,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Camera;
    // this.cameras.main.setBounds(0, 0, 400, 200); // Adjust the bounds to fit your game's dimensions
    // this.physics.world.setBounds(0, 0, 400, 200); // Adjust the bounds to fit your game's dimensions
    // this.cameras.main.startFollow(this.player);

    //  Input Events
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    //  Stars to collect, 10 in total, evenly spaced 20 pixels apart along the x axis
    this.stars = this.physics.add.group({
      key: "star",
      repeat: this.totalStars - 1,
      setXY: { x: 10, y: 0, stepX: 20 },
    });

    const starChildren =
      this.stars.getChildren() as Phaser.Physics.Arcade.Sprite[];

    starChildren.forEach((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    // Bombs to avoid
    this.bombs = this.physics.add.group();

    // Food to eat for power-ups
    this.oranges = this.physics.add.group();
    this.bananas = this.physics.add.group();

    //  The score
    this.scoreText = this.add.bitmapText(8, 8, "Thick", "SCORE 0", 12);

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.oranges, this.platforms);
    this.physics.add.collider(this.bananas, this.platforms);

    //  Checks to see if the player overlaps stars, bombs, or food, if he does call the respective collect/hit function
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      undefined,
      this
    );
    this.physics.add.collider(
      this.player,
      this.bombs,
      this.hitBomb,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.oranges,
      this.collectOrange,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.bananas,
      this.collectBanana,
      undefined,
      this
    );

    // Game over texts
    this.gameOverText = this.add.bitmapText(40, 70, "Thick", "GAME OVER", 17);
    this.gameOverText.setVisible(false);

    this.restartText = this.add.bitmapText(
      53,
      95,
      "Thick",
      "PRESS ENTER\nTO RESTART",
      11
    );
    this.restartText.setVisible(false);
  }

  update() {
    // Hide hello bubble when the player moves
    if (this.hasMoved === false) {
      setTimeout(() => {
        this.hello.setVisible(true);
      }, 1500);
    } else {
      this.hello.setVisible(false);
    }

    // Movement
    if (!this.gameOver) {
      if (this.cursors.left.isDown) {
        if (this.hasMoved === false) {
          this.hasMoved = true;
        }
        if (this.direction !== "left") {
          this.direction = "left";
        }
        this.player.setVelocityX(-this.playerVelocityX);
        this.player.anims.play("left", true);
      } else if (this.cursors.right.isDown) {
        if (this.hasMoved === false) {
          this.hasMoved = true;
        }
        if (this.direction !== "right") {
          this.direction = "right";
        }
        this.player.setVelocityX(this.playerVelocityX);
        this.player.anims.play("right", true);
      } else {
        this.player.setVelocityX(0);
        if (this.direction === "left") {
          this.player.anims.play("turnLeft");
        } else if (this.direction === "right") {
          this.player.anims.play("turnRight");
        }
      }

      if (this.player.body) {
        if (
          (this.cursors.space.isDown || this.cursors.up.isDown) &&
          this.player.body.blocked.down
        ) {
          if (this.hasMoved === false) {
            this.hasMoved = true;
          }
          this.player.setVelocityY(-this.playerVelocityY);
        }
      }
    }
  }

  // What happens when the player collects a star
  collectStar(
    _player:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile,
    star: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const starSprite = star as Phaser.Physics.Arcade.Sprite;
    starSprite.disableBody(true, true);

    //  Add and update the score
    this.score += 10 + Math.pow(this.round, 2);
    this.scoreText.setText("SCORE " + this.score);

    if (this.stars.countActive(true) === 0) {
      // Next round
      this.round += 1;

      //  A new batch of stars to collect
      const starChildren =
        this.stars.getChildren() as Phaser.Physics.Arcade.Sprite[];

      for (const child of starChildren) {
        child.enableBody(true, child.x, 0, true, true);
      }

      // Add a bomb
      this.addBomb();

      // Add food
      if (this.round > 3 && this.round % 2 === 0) {
        this.addFood();
      }
    }
  }

  addBomb() {
    const playerSprite = this.player as Phaser.Physics.Arcade.Sprite;

    let x =
      playerSprite.x < 100
        ? Phaser.Math.Between(150, 200)
        : Phaser.Math.Between(0, 50);

    let bomb = this.bombs.create(x, 4, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(
      Phaser.Math.Between(
        -this.bombBaseVelocityX - this.round * this.bombVelocityMultiplierX,
        this.bombBaseVelocityX + this.round * this.bombVelocityMultiplierX
      ),
      this.bombVelocityY
    );
  }

  // What happens when the player hits a bomb
  hitBomb(
    player: Phaser.GameObjects.GameObject | Phaser.Tilemaps.Tile,
    bomb: Phaser.GameObjects.GameObject | Phaser.Tilemaps.Tile
  ) {
    // Subract a life
    this.lives -= 1;

    // Tint the player for half a second
    const playerSprite = player as Phaser.Physics.Arcade.Sprite;

    if (this.lives !== 0) {
      playerSprite.setTint(0xff9999);

      setTimeout(() => {
        playerSprite.clearTint();
      }, 500);
    }

    // Remove the bomb
    const bombSprite = bomb as Phaser.Physics.Arcade.Sprite;
    bombSprite.disableBody(true, true);

    // Remove one heart image based on the remaining lives
    switch (this.lives) {
      case 2:
        this.heart3.setVisible(false); // Hide the third heart
        break;
      case 1:
        this.heart2.setVisible(false); // Hide the second heart
        break;
      case 0:
        this.heart1.setVisible(false); // Hide the first heart
        this.endGame(player as Phaser.GameObjects.GameObject);
        break;
    }
  }

  addFood() {
    const randomNumber = Math.random();
    if (randomNumber < 0.3) {
      this.addOrange();
    } else {
      this.addBanana();
    }
  }

  addOrange() {
    let orange = this.oranges.create(Phaser.Math.Between(0, 200), 5, "orange");
    orange.setBounce(1);
    orange.setCollideWorldBounds(true);
    orange.setVelocity(
      Phaser.Math.Between(this.foodMinVelocityX, this.foodMaxVelocityX),
      this.foodVelocityY
    );

    const orangeSprite = orange as Phaser.Physics.Arcade.Sprite;
    setTimeout(() => {
      orangeSprite.disableBody(true, true);
    }, 3000);
  }

  addBanana() {
    let banana = this.bananas.create(Phaser.Math.Between(0, 200), 4, "banana");
    banana.setBounce(1);
    banana.setCollideWorldBounds(true);
    banana.setVelocity(
      Phaser.Math.Between(this.foodMinVelocityX, this.foodMaxVelocityX),
      this.foodVelocityY
    );

    const bananaSprite = banana as Phaser.Physics.Arcade.Sprite;
    setTimeout(() => {
      bananaSprite.disableBody(true, true);
    }, 3000);
  }

  collectOrange(
    _player:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile,
    orange:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile
  ) {
    const orangeSprite = orange as Phaser.Physics.Arcade.Sprite;
    orangeSprite.disableBody(true, true);

    // const playerSprite = player as Phaser.Physics.Arcade.Sprite;

    const bombChildren =
      this.bombs.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const child of bombChildren) {
      child.disableBody(true, true);
    }
  }

  collectBanana(
    _player:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile,
    banana:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile
  ) {
    const bananaSprite = banana as Phaser.Physics.Arcade.Sprite;
    bananaSprite.disableBody(true, true);

    // const playerSprite = player as Phaser.Physics.Arcade.Sprite;

    if (this.lives < 3) {
      this.lives = 3;
      this.heart3.setVisible(true);
      this.heart2.setVisible(true);
    }
  }

  // Endgame
  endGame(player: Phaser.GameObjects.GameObject) {
    const playerSprite = player as Phaser.Physics.Arcade.Sprite;

    this.physics.pause();

    playerSprite.setTint(0xff5555);

    playerSprite.setScale(1, -1);

    const falling = this.tweens.add({
      targets: playerSprite,
      y: 220,
      duration: 4000,
      ease: "Bounce",
    });

    // Stop falling animation when restarting the game
    if (this.input.keyboard) {
      this.input.keyboard.on("keydown-ENTER", function () {
        if (falling.isPlaying()) {
          falling.stop();
        }
      });
    }

    if (this.direction === "left") {
      this.player.anims.play("turnLeft");
    } else if (this.direction === "right") {
      this.player.anims.play("turnRight");
    }

    this.soundtrack.stop();
    this.gameOver = true;
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);

    document.addEventListener("keydown", (e) => {
      if (this.gameOver === true && e.code === "Enter") {
        this.restart(this.player);
      }
    });
  }

  restart(player: Phaser.GameObjects.GameObject) {
    const playerSprite = player as Phaser.Physics.Arcade.Sprite;
    playerSprite.setScale(1, 1);
    this.soundtrack.play();
    this.gameOver = false;
    this.round = 0;
    this.direction = "right";
    this.physics.resume();
    this.lives = 3;
    this.score = 0;
    this.scoreText.setText("SCORE " + this.score);
    playerSprite.clearTint();
    this.player.setVelocityY(0);
    this.player.setPosition(
      this.initialPlayerPositionX,
      this.initialPlayerPositionY
    );
    this.heart3.setVisible(true);
    this.heart2.setVisible(true);
    this.heart1.setVisible(true);
    this.gameOverText.setVisible(false);
    this.restartText.setVisible(false);

    const bombChildren =
      this.bombs.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const child of bombChildren) {
      child.disableBody(true, true);
    }

    const orangeChildren =
      this.oranges.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const child of orangeChildren) {
      child.disableBody(true, true);
    }

    const bananaChildren =
      this.bananas.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const child of bananaChildren) {
      child.disableBody(true, true);
    }

    const starChildren =
      this.stars.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const child of starChildren) {
      child.enableBody(true, child.x, 0, true, true);
    }
  }
}

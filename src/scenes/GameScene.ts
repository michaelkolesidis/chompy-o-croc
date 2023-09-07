import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  // Game elements
  player!: Phaser.Physics.Arcade.Sprite;
  stars!: Phaser.Physics.Arcade.Group;
  bombs!: Phaser.Physics.Arcade.Group;
  platforms!: Phaser.Physics.Arcade.StaticGroup;

  // Game state
  score: number;
  lives: number;
  round: number;
  direction: "left" | "right";
  hasStarted: boolean;
  hasMoved: boolean;
  gameOver: boolean;

  // Tools
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

  constructor() {
    super({ key: "GameScene" });
    this.score = 0;
    this.lives = 3;
    this.round = 0;
    this.direction = "right";
    this.hasStarted = false;
    this.hasMoved = false;
    this.gameOver = false;
  }

  preload() {
    this.load.bitmapFont(
      "Thick",
      "./assets/fonts/thick_8x8.png",
      "./assets/fonts/thick_8x8.xml"
    );

    this.load.image("sky", "./assets/images/sky.png");
    this.load.image("ground", "./assets/images/platform.png");
    this.load.image("star", "./assets/images/star.png");
    this.load.image("bomb", "./assets/images/bomb.png");
    this.load.image("heart", "./assets/images/heart.png");
    this.load.image("hello", "./assets/images/hello.png");
    this.load.spritesheet("character", "./assets/images/character.png", {
      frameWidth: 18,
      frameHeight: 17,
    });
  }

  create() {
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
    this.player = this.physics.add.sprite(20, 150, "character");

    //  Player physics properties
    this.player.setBounce(0.2);
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

    //  Input Events
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    //  Stars to collect, 10 in total, evenly spaced 20 pixels apart along the x axis
    this.stars = this.physics.add.group({
      key: "star",
      repeat: 9,
      setXY: { x: 10, y: 0, stepX: 20 },
    });

    const starChildren =
      this.stars.getChildren() as Phaser.Physics.Arcade.Sprite[];

    starChildren.forEach((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    // The bombs group
    this.bombs = this.physics.add.group();

    //  The score
    this.scoreText = this.add.bitmapText(8, 8, "Thick", "SCORE 0", 12);

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(
      this.player,
      this.stars,
      // @ts-ignore
      this.collectStar,
      undefined,
      this
    );
    this.physics.add.collider(
      this.player,
      this.bombs,
      // @ts-ignore
      this.hitBomb,
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
        this.player.setVelocityX(-90);
        this.player.anims.play("left", true);
      } else if (this.cursors.right.isDown) {
        if (this.hasMoved === false) {
          this.hasMoved = true;
        }
        if (this.direction !== "right") {
          this.direction = "right";
        }
        this.player.setVelocityX(90);
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
          this.player.body.touching.down
        ) {
          if (this.hasMoved === false) {
            this.hasMoved = true;
          }
          this.player.setVelocityY(-200);
        }
      }
    }
  }

  // What happens when the player collects a star
  collectStar(
    player: Phaser.GameObjects.GameObject,
    star: Phaser.GameObjects.GameObject
  ) {
    const starSprite = star as Phaser.Physics.Arcade.Sprite;
    starSprite.disableBody(true, true);

    //  Add and update the score
    this.score += 10 + this.round * 2;
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
      const playerSprite = player as Phaser.Physics.Arcade.Sprite;

      let x =
        playerSprite.x < 100
          ? Phaser.Math.Between(150, 200)
          : Phaser.Math.Between(0, 50);

      let bomb = this.bombs.create(x, 4, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(
        Phaser.Math.Between(-30 - this.round * 5, 50 + this.round * 5),
        20
      );
      bomb.allowGravity = false;
    }
  }

  // What happens when the player hits a bomb
  hitBomb(
    player: Phaser.GameObjects.GameObject,
    bomb: Phaser.GameObjects.GameObject
  ) {
    // Subract a life
    this.lives -= 1;

    // Tint the player for a second
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
        this.endGame(player);
        break;
    }
  }

  // Endgame
  endGame(player: Phaser.GameObjects.GameObject) {
    const playerSprite = player as Phaser.Physics.Arcade.Sprite;

    this.physics.pause();

    playerSprite.setTint(0xff5555);

    if (this.direction === "left") {
      this.player.anims.play("turnLeft");
    } else if (this.direction === "right") {
      this.player.anims.play("turnRight");
    }

    this.gameOver = true;
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);

    document.addEventListener("keydown", (e) => {
      if (this.gameOver === true && e.code === "Enter") {
        this.gameOver = false;
        this.round = 0;
        this.direction = "right";
        this.physics.resume();
        this.lives = 3;
        this.score = 0;
        this.scoreText.setText("SCORE " + this.score);
        playerSprite.clearTint();
        this.player.setVelocityY(0);
        this.player.setPosition(20, 150);
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

        const starChildren =
          this.stars.getChildren() as Phaser.Physics.Arcade.Sprite[];
        for (const child of starChildren) {
          child.enableBody(true, child.x, 0, true, true);
        }
      }
    });
  }
}

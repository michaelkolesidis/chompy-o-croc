import Phaser from "phaser";

export default class StartScene extends Phaser.Scene {
  // Images
  background!: Phaser.GameObjects.Image;
  running!: Phaser.GameObjects.Image;

  // Texts
  title!: Phaser.GameObjects.BitmapText;
  titleShadow!: Phaser.GameObjects.BitmapText;
  copyright!: Phaser.GameObjects.BitmapText;
  promptText!: Phaser.GameObjects.BitmapText;
  blinkTween!: Phaser.Tweens.Tween;

  // Game state
  intoGame: boolean;

  constructor() {
    super({ key: "StartScene" });
    this.intoGame = false;
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
    this.load.image("running", "./assets/images/running.png");
  }

  create() {
    // Background
    this.background = this.add.image(100, 100, "sky");

    // Title with shadow
    this.titleShadow = this.add.bitmapText(
      28,
      22,
      "Thick",
      "CHOMPY\nO'CROC",
      30,
      1
    );
    this.titleShadow.setTint(0x000000);
    this.title = this.add.bitmapText(30, 20, "Thick", "CHOMPY\nO'CROC", 30, 1);

    // Character
    this.running = this.add.image(87, 12, "running").setScale(1);

    // Prompt
    this.promptText = this.add.bitmapText(38, 130, "Thick", "PRESS ENTER", 15);

    this.blinkTween = this.tweens.add({
      targets: this.promptText,
      alpha: 0, // Fade out
      duration: 500, // Duration of each fade (in milliseconds)
      yoyo: true, // Alternate between fade in and fade out
      repeat: -1, // Repeat indefinitely
    });

    // Copyright
    this.copyright = this.add.bitmapText(
      8,
      190,
      "Thick",
      "(C)2023 Michael Kolesidis",
      10
    );

    // Event handling
    document.addEventListener("keydown", (e) => {
      if (e.code === "Enter") {
        if (this.intoGame !== true) {
          this.scene.start("GameScene");
        }

        this.intoGame = true;
      }
    });
  }
}

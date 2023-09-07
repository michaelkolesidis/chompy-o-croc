import Phaser from "phaser";

export default class StartScene extends Phaser.Scene {
  // Images
  background!: Phaser.GameObjects.Image;
  head!: Phaser.GameObjects.Image;

  // Texts
  title!: Phaser.GameObjects.BitmapText;
  titleShadow!: Phaser.GameObjects.BitmapText;
  copyright!: Phaser.GameObjects.BitmapText;
  promptText!: Phaser.GameObjects.BitmapText;
  blinkTween!: Phaser.Tweens.Tween;

  constructor() {
    super({ key: "StartScene" });
  }

  preload() {
    this.load.bitmapFont(
      "Thick",
      "./assets/fonts/thick_8x8.png",
      "./assets/fonts/thick_8x8.xml"
    );
    this.load.image("sky", "./assets/images/sky.png");
    this.load.image("head", "./assets/images/head.png");
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
    this.head = this.add.image(100, 47, "head").setScale(2);

    // Prompt
    this.promptText = this.add.bitmapText(38, 150, "Thick", "PRESS ENTER", 15);

    this.blinkTween = this.tweens.add({
      targets: this.promptText,
      alpha: 0, // Fade out
      duration: 500, // Duration of each fade (in milliseconds)
      yoyo: true, // Alternate between fade in and fade out
      repeat: -1, // Repeat indefinitely
    });

    document.addEventListener("keydown", (e) => {
      if (e.code === "Enter") {
        this.scene.start("GameScene");
      }
    });

    // Copyright
    this.copyright = this.add.bitmapText(
      8,
      190,
      "Thick",
      "(C)2023 Michael Kolesidis",
      10
    );
  }
}

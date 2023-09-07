import Phaser from "phaser";
import StartScene from "./scenes/StartScene";
import GameScene from "./scenes/GameScene";
import "./style.css";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 200,
  height: 200,
  antialias: false,
  scaleMode: Phaser.Scale.ScaleModes.FIT,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [StartScene, GameScene],
};

export default new Phaser.Game(config);

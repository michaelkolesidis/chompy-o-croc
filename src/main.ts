import Phaser from 'phaser';
import StartScene from './scenes/StartScene';
import GameScene from './scenes/GameScene';
import './style.css';

// https://newdocs.phaser.io/docs/3.60.0/Phaser.Types.Core.GameConfig

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 200,
  height: 200,
  antialias: false,
  // roundPixels: true,
  // pixelArt: true, // Sets antialias to false and roundPixels to true
  disableContextMenu: true,
  banner: false,
  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x:0, y: 300 },
      debug: false,
    },
  },
  scene: [StartScene, GameScene],
};

export default new Phaser.Game(config);

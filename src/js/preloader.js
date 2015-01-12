(function() {
  'use strict';

  function Preloader() {
    this.asset = null;
    this.ready = false;
  }

  Preloader.prototype = {

    preload: function () {
      this.asset = this.add.sprite(320, 240, 'preloader');
      this.asset.anchor.setTo(0.5, 0.5);

      this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
      this.load.setPreloadSprite(this.asset);

      // GAME ASSETS

      this.load.image('mob_bullet_1', 'assets/mob_bullet_1.png');
      this.load.image('tileset_1', 'assets/tileset_1.png');

      this.load.spritesheet('player_1', 'assets/player_ship_1.png', 24, 28);
      this.load.spritesheet('player_2', 'assets/player_ship_2.png', 24, 28);
      this.load.spritesheet('player_3', 'assets/player_ship_3.png', 24, 28);
      this.load.spritesheet('player_4', 'assets/player_ship_4.png', 24, 28);

      this.load.spritesheet('player_bullet', 'assets/player_bullets.png', 16, 16);
      this.load.spritesheet('explosion_1', 'assets/explosion_1.png', 32, 32);

      this.load.spritesheet('mob_plane', 'assets/mob_planes.png', 32, 32);
      this.load.spritesheet('mob_vessel_1', 'assets/mob_vessel_1.png', 37, 28);

      this.load.spritesheet('bonus_cube', 'assets/cubes.png', 24, 24);
      this.load.spritesheet('bonus_coin', 'assets/coins.png', 12, 12);

      this.load.bitmapFont('minecraftia', 'assets/minecraftia.png', 'assets/minecraftia.xml');
    },

    create: function () {
      this.asset.cropEnabled = false;
    },

    update: function () {
      if (!!this.ready) {
        this.game.state.start('game');
      }
    },

    onLoadComplete: function () {
      this.ready = true;
    }
  };

  window['firsttry'] = window['firsttry'] || {};
  window['firsttry'].Preloader = Preloader;

}());

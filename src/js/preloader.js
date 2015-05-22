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

      // Graphics

      this.load.image('tileset_1', 'assets/tileset_1.png');
      this.load.image('tileset_1_debug', 'assets/tileset_1_debug.png');

      this.load.spritesheet('clouds', 'assets/clouds.png', 96, 168);

      this.load.spritesheet('player_1', 'assets/player_ship_1.png', 24, 28);
      this.load.spritesheet('player_2', 'assets/player_ship_2.png', 24, 28);
      this.load.spritesheet('player_3', 'assets/player_ship_3.png', 24, 28);
      this.load.spritesheet('player_4', 'assets/player_ship_4.png', 24, 28);

      this.load.spritesheet('player_bullet', 'assets/player_bullets.png', 16, 16);
      this.load.image('mob_bullet_1', 'assets/mob_bullet_1.png');
      this.load.image('mob_bullet_2', 'assets/mob_bullet_2.png');
      this.load.spritesheet('explosion_1', 'assets/explosion_1.png', 32, 32);

      this.load.spritesheet('mob_plane', 'assets/mob_planes.png', 32, 32);
      this.load.spritesheet('mob_vessel_1', 'assets/mob_vessel_1.png', 37, 28);
      this.load.spritesheet('mob_flagship_1', 'assets/mob_flagship_1.png', 93, 80);
      this.load.spritesheet('mob_turret_1', 'assets/mob_turret_1.png', 24, 28);

      this.load.spritesheet('bonus_cube', 'assets/cubes.png', 24, 24);
      this.load.spritesheet('bonus_coin', 'assets/coins.png', 12, 12);

      this.load.bitmapFont('minecraftia', 'assets/minecraftia.png', 'assets/minecraftia.xml');

      // Audio

      this.load.audio('shoot_player_1', 'assets/audio/shoot_player_1.wav');
      this.load.audio('shoot_player_2', 'assets/audio/shoot_player_2.wav');
      this.load.audio('shoot_player_3', 'assets/audio/shoot_player_3.wav');
      this.load.audio('shoot_player_4', 'assets/audio/shoot_player_4.wav');
      this.load.audio('shoot_player_5', 'assets/audio/shoot_player_5.wav');

      this.load.audio('explosion_1', 'assets/audio/explosion_1.wav');
      this.load.audio('explosion_2', 'assets/audio/explosion_2.wav');
      this.load.audio('explosion_3', 'assets/audio/explosion_3.wav');
      this.load.audio('explosion_4', 'assets/audio/explosion_4.wav');

      this.load.audio('hurt_1', 'assets/audio/hurt_1.wav');
      this.load.audio('collect_1', 'assets/audio/collect_1.wav');

      // this.load.binary('music_1', 'assets/audio/mod/4-track_from_heaven.mod');
      // this.load.audio('music_1', 'assets/audio/music_1.wav');

      // Scripts

      // /!\ PROBLEM /!\
      // loading scripts this way seems to defer them after the execution of game.js
      // leading to undefined things
      // For now, using raw <scripts> tags in index.html
      // (could be related to gulp pipeline)

      // this.load.script('spriter.js', 'js/class/spriter.js');
    },

    create: function () {
      this.asset.cropEnabled = false;
    },

    update: function () {
      if (!!this.ready) {
        this.game.state.start('menu');
      }
    },

    onLoadComplete: function () {
      this.ready = true;
    }
  };

  window['firsttry'] = window['firsttry'] || {};
  window['firsttry'].Preloader = Preloader;

}());

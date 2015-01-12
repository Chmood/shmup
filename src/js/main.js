/*globals CONFIG */

window.onload = function () {
  'use strict';

  var game
    , ns = window['firsttry'];

  game = new Phaser.Game(
  	CONFIG.GAME_WIDTH * CONFIG.PIXEL_RATIO, 
  	CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO, 
  	Phaser.AUTO, 
  	// 'firsttry-game', 
  	'', 
  	null, 
  	false, 
  	false
  	);

  game.CONFIG = CONFIG;

  game.state.add('boot', ns.Boot);
  game.state.add('preloader', ns.Preloader);
  game.state.add('menu', ns.Menu);
  game.state.add('game', ns.Game);

  game.state.start('boot');
};

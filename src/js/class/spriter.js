/*globals CONFIG */

(function() {
	'use strict';

	/************************************************************************************************
	 * SPRITER CLASS
	 * 
	 * Direct child from Phaser.Sprite class
	 * Set basic parameters common to all prites on screen
	 *
	 ************************************************************************************************/


	function Spriter(state, image) {

		this.state = state;
		this.game = state.game;

		// Call parent constructor
		Phaser.Sprite.call(this, this.game, 0, 0, image);
		// Add the object to the game world
		this.game.add.existing(this);

		// Pure common things to ALL objects
		this.anchor.setTo(0.5, 0.5);
		this.scale.setTo(CONFIG.PIXEL_RATIO, CONFIG.PIXEL_RATIO);
		this.game.physics.enable(this, Phaser.Physics.ARCADE);
	}

	Spriter.prototype = Object.create(Phaser.Sprite.prototype);
	Spriter.prototype.constructor = Spriter;


	// Export the object
	window['firsttry'] = window['firsttry'] || {};
	window['firsttry'].Spriter = Spriter;
}());
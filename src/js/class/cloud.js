/*globals CONFIG */

(function() {
	'use strict';

	/************************************************************************************************
	 * CLOUD CLASS
	 * 
	 * A specific type of (ground) Enemy
	 *
	 ************************************************************************************************/

	function Cloud(state) {

		// Call parent constructor
		window['firsttry'].Mob.call(this, state, 'clouds');

		this.speed = 0;
		this.type = 0;

    this.animations.add('idle_0', [0]);
    this.animations.add('idle_1', [1]);
    this.animations.add('idle_2', [2]);
    this.animations.add('idle_3', [3]);
    this.animations.add('idle_4', [4]);
    this.animations.add('idle_5', [5]);
    this.animations.add('idle_6', [6]);
    this.animations.add('idle_7', [7]);
	}

	Cloud.prototype = Object.create(window['firsttry'].Mob.prototype);
	Cloud.prototype.constructor = Cloud;

	Cloud.prototype.update = function () {

		// Call the parent update function
		window['firsttry'].Mob.prototype.update.call(this);
	};

	Cloud.prototype.revive = function () {

		this.reset(
			this.game.rnd.integerInRange(0, CONFIG.WORLD_WIDTH) * 24 * CONFIG.PIXEL_RATIO,
			- 3 * 28 * CONFIG.PIXEL_RATIO
			);

		this.body.velocity.y = (this.game.rnd.realInRange(- 1, 1) * CONFIG.CLOUD_WIND_SPEED + CONFIG.CLOUD_WIND_SPEED + this.state.scrollSpeed) * CONFIG.PIXEL_RATIO;

		this.type = this.game.rnd.integerInRange(0, 7);
		this.play('idle_' + this.type);

		// Call the parent revive function
		window['firsttry'].Mob.prototype.revive.call(this);
	};


	// Export the object
	window['firsttry'] = window['firsttry'] || {};
	window['firsttry'].Cloud = Cloud;
}());
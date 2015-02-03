/*globals CONFIG */

(function() {
	'use strict';

	/************************************************************************************************
	 * BULLET CLASS
	 * 
	 * Just one single enemy bullet
	 * 
	 *
	 ************************************************************************************************/

	function Bullet(state, type) {

		this.state = state;
		this.game = state.game;

		// Call parent constructor
		window['firsttry'].Spriter.call(this, state, 'mob_bullet_' + (type + 1));

		this.type = 0;

		this.energy = 30;
		this.speed = 120;
		this.shooter = undefined;

		// this.checkWorldBounds = true;
		// this.outOfBoundsKill = true;
	}

	Bullet.prototype = Object.create(window['firsttry'].Spriter.prototype);
	Bullet.prototype.constructor = Bullet;

	Bullet.prototype.revive = function (shooter, angle) {

		this.shooter = shooter;

		this.reset(shooter.x, shooter.y);
		this.body.velocity.x = (this.speed * Math.sin(angle)) * CONFIG.PIXEL_RATIO;
		this.body.velocity.y = (this.speed * Math.cos(angle)) * CONFIG.PIXEL_RATIO;
	};

	Bullet.prototype.update = function () {

		if (this.alive) {

			// Call parent update function
			window['firsttry'].Spriter.prototype.update.call(this);

			// Kill bullet if out of the screen
			var safeRange = 20;

			if (this.x < - safeRange * CONFIG.PIXEL_RATIO ||
				this.x > (CONFIG.WORLD_WIDTH * 24 + safeRange) * CONFIG.PIXEL_RATIO ||
				this.y < - safeRange * CONFIG.PIXEL_RATIO ||
				this.y > (CONFIG.GAME_HEIGHT + safeRange) * CONFIG.PIXEL_RATIO) {
				this.kill();
			}
		}
	};


	// Export the object
	window['firsttry'] = window['firsttry'] || {};
	window['firsttry'].Bullet = Bullet;
}());
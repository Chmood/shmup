/*globals*/
/*jshint -W083 */

(function() {
	'use strict';

	/************************************************************************************************
	 * SHOOT CLASS
	 * 
	 * One enemy shoot, firing one or several salve of one or several Bullets, all at once or one-by-one
	 * 
	 *
	 ************************************************************************************************/

	function Shoot(state, shooter, shootConfig) {

		this.state = state;
		this.game = state.game;

		this.shooter = shooter;
		this.shootConfig = shootConfig;

		// this.nBulletsAlive = shootConfig.nBullets;

		this.bullets = [];

		this.t = [];

		for (var j = 0; j < shootConfig.nShoots; j++) {

			// bulletDelay: 0, 
			// bulletAngle: 0, 

			// shootRotationSpeed: 0.2

			this.t[j] = window.setTimeout((function(that, x) { return function() {	// Closure

				var config = that.shootConfig;

				// Shoot angle

				var shootAngle;

				if (config.shootAngle === 999) {	// Auto-aim player

					shootAngle = that.shooter.getAngleTo(that.state.player);

				} else if (config.shootAngle === -999) {	// Random aim
					shootAngle = that.game.rnd.realInRange(0, 2 * Math.PI);

				} else {
					shootAngle = config.shootAngle;
				}

				// Shoot rotation speed

				shootAngle += x * config.shootRotationSpeed;

				// Bullets spread

				var bulletAngleStep = 0;

				if (config.nBullets > 1) {

					if (config.bulletSpread === 0) { // This is the "auto-pan" at 360° special mode
						bulletAngleStep = 2 * Math.PI / config.nBullets;

					} else {
						bulletAngleStep = config.bulletSpread;
					}
				}

				// One salve 

				for (var i = 0; i < config.nBullets; i++) {

					if (that.state.bulletPoolsMob[config.bulletType].countDead() > 0) {

						that.bullets[i] = that.state.bulletPoolsMob[config.bulletType].getFirstExists(false);

				// this.state.physics.arcade.moveToObject(bullet, this.state.player, this.bulletSpeed * CONFIG.PIXEL_RATIO);

						var angle;

						if (config.bulletSpread === 0) {
							angle = shootAngle + (i * bulletAngleStep);

						} else {
							angle = shootAngle + ((i - (config.nBullets - 1) / 2) * bulletAngleStep);
						}

						if (angle < 0 || angle >= 2 * Math.PI) {
							angle = angle % (2 * Math.PI);

						}

						that.bullets[i].revive(shooter, angle);
					}
				}
			}; })(this, j), j * shootConfig.shootDelay);
		}
	}

	Shoot.prototype.die = function (bulletCancel) {

		// Bullet cancel : kill all bullets of the shoot
		if (bulletCancel) {
			this.bullets.forEach(function(bullet) {
				bullet.kill();
			});
		}

		// Cancel all running timers
		this.t.forEach(function(timer) {
			window.clearTimeout(timer);
		});
	};


	// Export the object
	window['firsttry'] = window['firsttry'] || {};
	window['firsttry'].Shoot = Shoot;
}());




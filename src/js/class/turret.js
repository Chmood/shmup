/*globals CONFIG */

(function() {
	'use strict';

	/************************************************************************************************
	 * TURRET CLASS
	 * 
	 * A specific type of (ground) Enemy
	 *
	 ************************************************************************************************/

	function Turret(state) {

		// Call parent constructor
		window['firsttry'].Enemy.call(this, state, 'mob_turret_1');

		this.maxHealth = 150;
		this.speed = 0;
		this.isPinnedToGround = true;
		// this.groundType = 
		this.bulletType = 1;
		this.shootDelay = 5000;
		this.points = 5000;
		this.lootProbability = 0.5;

		this.shootConfig = {
			bulletType: 1,
			nBullets: 4, 
			bulletDelay: 0, 
			bulletAngle: 0, 
			bulletSpread: 0, 

			nShoots: 3, 
			shootDelay: 50, 
			shootAngle: 0, 
			shootRotationSpeed: 0.1
		};

		var preshoot = this.animations.add('pre-shoot', [0, 1, 2, 3, 4, 5, 6, 7, 8], 15, false);

		// preshoot.onStart.add(animationStarted, this);
		preshoot.onComplete.add(function (sprite) {

			// Call the parent shoot function
			window['firsttry'].Enemy.prototype.shoot.call(this, this.shootConfig);

			sprite.play('shoot');
		}, this);

		var shoot = this.animations.add('shoot', [8, 7, 6, 5, 4, 3, 2, 1, 0], 15, false);
		shoot.onComplete.add(function (sprite) {

			sprite.play('idle');
		}, this);

    this.animations.add('idle', [0], 5, true);
		// this.animations.add('pre-shoot', [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, true);
		// this.animations.add('shoot', [8, 7, 6, 5, 4, 3, 2, 1, 0], 10, true);
		this.play('idle');
	}

	Turret.prototype = Object.create(window['firsttry'].Enemy.prototype);
	Turret.prototype.constructor = Turret;

	Turret.prototype.update = function () {

		// Call the parent update function
		window['firsttry'].Enemy.prototype.update.call(this);
	};

	Turret.prototype.shoot = function() {

		this.play('pre-shoot');

		// Call the parent shoot function
		// window['firsttry'].Enemy.prototype.shoot.call(this);
	};

	Turret.prototype.revive = function (i, j) {

		this.reset(
			(i + 0.5) * 24 * CONFIG.PIXEL_RATIO,
			((j + 0.5) - CONFIG.WORLD_SWAP_HEIGHT) * 28 * CONFIG.PIXEL_RATIO
			);

		this.body.velocity.y = this.state.scrollSpeed * CONFIG.PIXEL_RATIO;

		this.nextShotAt = this.game.rnd.integerInRange(0, this.shootDelay);

		// Call the parent revive function
		window['firsttry'].Mob.prototype.revive.call(this);
	};


	// Export the object
	window['firsttry'] = window['firsttry'] || {};
	window['firsttry'].Turret = Turret;
}());
/*globals CONFIG */

(function() {
	'use strict';

	/************************************************************************************************
	 * MOB CLASS
	 * 
	 * Have health, can take damage and die
	 * Dies if below the screen
	 * Parent of both player and enemies
	 *
	 ************************************************************************************************/

	function Mob(state, image) {

		// Call parent constructor
		window['firsttry'].Actor.call(this, state, image);
	
		// Mob properties
		this.alive = true;
		this.health = 100;
		this.maxHealth = this.health;
		this.isDamaged = false;
		this.damageBlinkLast = 0;
		this.tint = 0xffffff;

		// this.speed = 160 * CONFIG.PIXEL_RATIO;
	}

	Mob.prototype = Object.create(window['firsttry'].Actor.prototype);
	Mob.prototype.constructor = Mob;

	Mob.prototype.update = function () {

		// Call parent update function
		window['firsttry'].Actor.prototype.update.call(this);

		// Kill mob if below the screen
		if (this.y > CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO + 200) {
			this.kill();
			return;
		}

		this.updateTint();
	};

	Mob.prototype.updateTint = function () {

		// Mob hit
		if (this.isDamaged) {
			this.damageBlinkLast -= 2;

			if (this.damageBlinkLast < 0) {

				this.isDamaged = false;
			}
		}

		if (this.isDamaged) {
			this.tint = 0xff0000;
		} else {
			this.tint = 0xffffff;
		}
	};

	Mob.prototype.takeDamage = function (damage) {

		this.health -= damage;

		if (this.health <= 0) {
			this.kill();

		} else {
			this.blink();
		}
	};

	Mob.prototype.blink = function () {

		this.isDamaged = true;
		this.damageBlinkLast = CONFIG.BLINK_DAMAGE_TIME;
	};

	Mob.prototype.revive = function () {

		// replenish health (dunno why, but it's always set to 1 when calling a dead sprite from a pool)
		this.health = this.maxHealth;
	};

	Mob.prototype.die = function () {

		this.kill();
	};


	// Export the object
	window['firsttry'] = window['firsttry'] || {};
	window['firsttry'].Mob = Mob;
}());
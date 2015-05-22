/*globals*/

(function() {
	'use strict';

	/************************************************************************************************
	 * PLANE CLASS
	 * 
	 * A specific type of Enemy
	 *
	 ************************************************************************************************/

	function Plane(state) {

		// Call parent constructor
		window['firsttry'].Enemy.call(this, state, 'mob_plane');

		this.maxHealth = 30;
		this.speed = 60;
		this.shootDelay = 3000;
		this.bulletSpeed = 125;
		this.points = 100;
		this.lootProbability = 0.1;

		this.shootConfig = {
			bulletType: 0,
			nBullets: 1, 
			bulletDelay: 0, 
			bulletAngle: 0, 
			bulletSpread: 0, 

			nShoots: 1, 
			shootDelay: 0, 
			shootAngle: 999, 
			shootRotationSpeed: 0
		};

		this.planeClass = state.rnd.integerInRange(0, 7);

		var offset = this.planeClass * 3;
		this.animations.add('idle', [offset + 1], 5, true);
		this.animations.add('left', [offset + 0], 5, true);
		this.animations.add('right', [offset + 2], 5, true);
		this.play('idle');
	}

	Plane.prototype = Object.create(window['firsttry'].Enemy.prototype);
	Plane.prototype.constructor = Plane;

	Plane.prototype.update = function () {

		// Call the parent update function
		window['firsttry'].Enemy.prototype.update.call(this);
	};


	/************************************************************************************************
	 * VESSEL CLASS
	 * 
	 * A specific type of (big) Enemy
	 *
	 ************************************************************************************************/

	function Vessel(state) {

		// Call parent constructor
		window['firsttry'].Enemy.call(this, state, 'mob_vessel_1');

		this.maxHealth = 100;
		this.speed = 30;
		this.shootDelay = 2000;
		this.points = 500;
		this.lootProbability = 0.5;

		this.shootConfig = {
			bulletType: 0,
			nBullets: 5, 
			bulletDelay: 0, 
			bulletAngle: 0, 
			bulletSpread: 0.2, 

			nShoots: 1, 
			shootDelay: 0, 
			shootAngle: 999, 
			shootRotationSpeed: 0
		};

		this.animations.add('idle', [0], 5, true);
		this.play('idle');
	}

	Vessel.prototype = Object.create(window['firsttry'].Enemy.prototype);
	Vessel.prototype.constructor = Vessel;

	Vessel.prototype.update = function () {

		// Call the parent update function
		window['firsttry'].Enemy.prototype.update.call(this);
	};


	/************************************************************************************************
	 * FLAGSHIP CLASS
	 * 
	 * A specific type of (huge) Enemy
	 *
	 ************************************************************************************************/

	function Flagship(state) {

		// Call parent constructor
		window['firsttry'].Enemy.call(this, state, 'mob_flagship_1');

		this.maxHealth = 750;
		this.speed = 10;
		this.shootDelay = 3000;
		this.points = 2000;
		this.lootProbability = 0.8;
		this.bulletCancel = true;

		this.shootConfig = {
			bulletType: 1,
			nBullets: 7, 
			bulletDelay: 0, 
			bulletAngle: 0, 
			bulletSpread: 0.2, 

			nShoots: 3, 
			shootDelay: 500, 
			shootAngle: 0, 
			shootRotationSpeed: 0.2
		};

		this.animations.add('idle', [0], 5, true);
		this.play('idle');
	}

	Flagship.prototype = Object.create(window['firsttry'].Enemy.prototype);
	Flagship.prototype.constructor = Flagship;

	Flagship.prototype.update = function () {

		// Call the parent update function
		window['firsttry'].Enemy.prototype.update.call(this);
	};


	// Export the objects
	window['firsttry'] = window['firsttry'] || {};
	window['firsttry'].Plane = Plane;
	window['firsttry'].Vessel = Vessel;
	window['firsttry'].Flagship = Flagship;
}());
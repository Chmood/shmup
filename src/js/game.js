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


/************************************************************************************************
	 * ACTOR CLASS
	 * 
	 * Add some common properties like beeing pinned to ground
	 * 
	 *
	 ************************************************************************************************/


	function Actor(state, image) {

		this.state = state;
		this.game = state.game;

		// Call parent constructor
		Spriter.call(this, state, image);

		this.isPinnedToGround = false;
	}

	Actor.prototype = Object.create(Spriter.prototype);
	Actor.prototype.constructor = Actor;


	/************************************************************************************************
	 * COLLECTIBLE CLASS
	 * 
	 * Can be picked
	 *
	 ************************************************************************************************/

	function Collectible(state, image) {

		// Call parent constructor
		Actor.call(this, state, image);
	
		this.alive = true;
		this.updateClass();
	}

	Collectible.prototype = Object.create(Actor.prototype);
	Collectible.prototype.constructor = Collectible;

	Collectible.prototype.update = function () {

		// Call parent update function
		Actor.prototype.update.call(this);

		// Kill mob if below the screen
		if (this.y > CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO + 200) {
			this.kill();
			return;
		}

	};

	Collectible.prototype.updateClass = function () {

		this.bonusClass = this.state.rnd.integerInRange(0, 3);

		// Ugly hack to skip the last spritesheet row (4 instead of 3)
		var fakeClass = this.bonusClass;
		if (fakeClass === 3) { fakeClass = 4; }

		var offset = fakeClass * 3;

		this.animations.add('idle', [0 + offset, 1 + offset, 2 + offset, 1 + offset], 15, true);
		this.play('idle');
	};


	/************************************************************************************************
	 * MOB CLASS
	 * 
	 * Have health, can take damage and die
	 * Parent of both player and enemies
	 *
	 ************************************************************************************************/

	function Mob(state, image) {

		// Call parent constructor
		Actor.call(this, state, image);
	
		// Mob properties
		this.alive = true;
		this.health = 100;
		this.maxHealth = this.health;
		this.isDamaged = false;
		this.damageBlinkLast = 0;
		this.tint = 0xffffff;

		// this.speed = 160 * CONFIG.PIXEL_RATIO;

	}

	Mob.prototype = Object.create(Actor.prototype);
	Mob.prototype.constructor = Mob;

	Mob.prototype.update = function () {

		// Call parent update function
		Actor.prototype.update.call(this);

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


	/************************************************************************************************
	 * ENEMY CLASS
	 * 
	 * Like Mob, plus can shoot and loot bonuses
	 *
	 ************************************************************************************************/

	function Enemy(state, image) {

		// Call parent constructor
		Mob.call(this, state, image);

		this.shootDelay = 1000;
		this.speed = 50;
		this.points = 100;
		this.bulletType = 0;
		this.bulletSpeed = 100;
	}

	Enemy.prototype = Object.create(Mob.prototype);
	Enemy.prototype.constructor = Enemy;

	Enemy.prototype.update = function () {

		// Call the parent update function
		Mob.prototype.update.call(this);

		// Mob shoot
		if (this.alive && this.state.player.alive && this.y < this.state.player.y - 100 * CONFIG.PIXEL_RATIO && this.state.time.now > this.nextShotAt && this.state.bulletPoolsMob[this.bulletType].countDead() > 0) {
			this.shoot();
		}
	};

	Enemy.prototype.shoot = function () {

		var bullet = this.state.bulletPoolsMob[this.bulletType].getFirstExists(false);
		bullet.reset(this.x, this.y);
		this.state.physics.arcade.moveToObject(bullet, this.state.player, this.bulletSpeed * CONFIG.PIXEL_RATIO);

		this.nextShotAt = this.state.time.now + this.shootDelay;
	};

	Enemy.prototype.die = function () {

		// Call the parent die function
		Mob.prototype.die.call(this);

		if (this.state.rnd.integerInRange(0, 100) < 20) {
			this.loot();
		}
	};

	Enemy.prototype.revive = function () {

		if (! this.isPinnedToGround) {

			// spawn at a random location top of the screen
			this.reset( this.game.rnd.between(16, CONFIG.WORLD_WIDTH * 24 * CONFIG.PIXEL_RATIO - 16), - 32);
			this.body.velocity.y = (this.speed + this.state.scrollSpeed) * CONFIG.PIXEL_RATIO;

		} else {
			// spawn at a random location top of the screen, aligned with ground grid
			this.reset( (this.game.rnd.integerInRange(1, CONFIG.WORLD_WIDTH) - 0.5) * 24 * CONFIG.PIXEL_RATIO, - 32);
			this.body.velocity.y = this.state.scrollSpeed * CONFIG.PIXEL_RATIO;
		}

		this.nextShotAt = this.game.rnd.integerInRange(0, this.shootDelay);

		// Call the parent revive function
		Mob.prototype.revive.call(this);
	};

	Enemy.prototype.loot = function () {

		var bonus = this.state.bonusPool.getFirstExists(false);
		bonus.updateClass();
		bonus.reset(this.x, this.y);
		bonus.body.velocity.y = 40 * CONFIG.PIXEL_RATIO;
		bonus.body.angularVelocity = 30;
	};


	/************************************************************************************************
	 * PLANE CLASS
	 * 
	 * A specific type of Enemy
	 *
	 ************************************************************************************************/

	function Plane(state) {

		// Call parent constructor
		Enemy.call(this, state, 'mob_plane');

		this.maxHealth = 30;
		this.speed = 60;
		this.shootDelay = 5000;
		this.bulletSpeed = 125;
		this.points = 100;

		this.planeClass = state.rnd.integerInRange(0, 7);

		var offset = this.planeClass * 3;
		this.animations.add('idle', [offset + 1], 5, true);
		this.animations.add('left', [offset + 0], 5, true);
		this.animations.add('right', [offset + 2], 5, true);
		this.play('idle');
	}

	Plane.prototype = Object.create(Enemy.prototype);
	Plane.prototype.constructor = Plane;

	Plane.prototype.update = function () {

		// Call the parent update function
		Enemy.prototype.update.call(this);
	};


	/************************************************************************************************
	 * VESSEL CLASS
	 * 
	 * A specific type of (big) Enemy
	 *
	 ************************************************************************************************/

	function Vessel(state) {

		// Call parent constructor
		Enemy.call(this, state, 'mob_vessel_1');

		this.maxHealth = 100;
		this.speed = 30;
		this.shootDelay = 500;
		this.points = 500;

		this.animations.add('idle', [0], 5, true);
		this.play('idle');
	}

	Vessel.prototype = Object.create(Enemy.prototype);
	Vessel.prototype.constructor = Vessel;

	Vessel.prototype.update = function () {

		// Call the parent update function
		Enemy.prototype.update.call(this);
	};


	/************************************************************************************************
	 * FLAGSHIP CLASS
	 * 
	 * A specific type of (huge) Enemy
	 *
	 ************************************************************************************************/

	function Flagship(state) {

		// Call parent constructor
		Enemy.call(this, state, 'mob_flagship_1');

		this.maxHealth = 750;
		this.speed = 10;
		this.shootDelay = 500;
		this.points = 2000;

		this.animations.add('idle', [0], 5, true);
		this.play('idle');
	}

	Flagship.prototype = Object.create(Enemy.prototype);
	Flagship.prototype.constructor = Flagship;

	Flagship.prototype.update = function () {

		// Call the parent update function
		Enemy.prototype.update.call(this);
	};


/************************************************************************************************
	 * TURRET CLASS
	 * 
	 * A specific type of (ground) Enemy
	 *
	 ************************************************************************************************/

	function Turret(state) {

		// Call parent constructor
		Enemy.call(this, state, 'mob_turret_1');

		this.maxHealth = 150;
		this.speed = 0;
		this.isPinnedToGround = true;
		this.groundType = 
		this.bulletType = 1;
		this.shootDelay = 1500;
		this.points = 2000;

		var preshoot = this.animations.add('pre-shoot', [0, 1, 2, 3, 4, 5, 6, 7, 8], 15, false);

		// preshoot.onStart.add(animationStarted, this);
		preshoot.onComplete.add(function (sprite) {

			// Call the parent shoot function
			Enemy.prototype.shoot.call(this);
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

	Turret.prototype = Object.create(Enemy.prototype);
	Turret.prototype.constructor = Turret;

	Turret.prototype.update = function () {

		// Call the parent update function
		Enemy.prototype.update.call(this);
	};

	Turret.prototype.shoot = function() {

		this.play('pre-shoot');

		// Call the parent shoot function
		// Enemy.prototype.shoot.call(this);
	};

	Turret.prototype.revive = function (i, j) {

		// spawn at a random location top of the screen, aligned with ground grid
		// this.reset(
		// 	(this.game.rnd.integerInRange(1, CONFIG.WORLD_WIDTH) - 0.5) * 24 * CONFIG.PIXEL_RATIO,
		// 	(this.state.ground.y % (28 * CONFIG.PIXEL_RATIO)) - (28 * CONFIG.PIXEL_RATIO / 2)
		// 	);

		this.reset(
			(i + 0.5) * 24 * CONFIG.PIXEL_RATIO,
			((j + 0.5) - CONFIG.WORLD_SWAP_HEIGHT) * 28 * CONFIG.PIXEL_RATIO
			);

		this.body.velocity.y = this.state.scrollSpeed * CONFIG.PIXEL_RATIO;

		this.nextShotAt = this.game.rnd.integerInRange(0, this.shootDelay);

		// Call the parent revive function
		Mob.prototype.revive.call(this);
	};


	/************************************************************************************************
	 * PLAYER CLASS
	 * 
	 * Like a Mob, plus :
	 *   - handles user inputs
	 *   - can move with inertia
	 *   - can fire (and has its own bullet pool)
	 *
	 ************************************************************************************************/

	function Player(state) {

		this.state = state;
		this.game = state.game;

		this.playerClass = this.game.rnd.between(1, 4);
		this.playerStats = CONFIG.CLASS_STATS[this.playerClass - 1];
		this.classStats = this.playerStats;

		// Phaser.Sprite.call(this, this.game, 0, 0, 'player_' + this.playerClass);
		Mob.call(this, state, 'player_' + this.playerClass);

		this.body.setSize(7 * CONFIG.PIXEL_RATIO, 7 * CONFIG.PIXEL_RATIO, 0, 3 * CONFIG.PIXEL_RATIO);

		this.spawn();

		this.animations.add('left_full', [ 0 ], 5, true);
		this.animations.add('left', [ 1 ], 5, true);
		this.animations.add('idle', [ 2 ], 5, true);
		this.animations.add('right', [ 3 ], 5, true);
		this.animations.add('right_full', [ 4 ], 5, true);
		this.play('idle');

		this.health = this.playerStats.health;

		this.updateStats();

		this.nextShotAt = 0;
		this.lastUpdate = 0;

		this.game.add.existing(this);

		// PLAYER BULLETS

		this.createBulletPool();
	}

	Player.prototype = Object.create(Mob.prototype);
	Player.prototype.constructor = Player;

	Player.prototype.spawn = function() {

		this.x = this.game.width / 2;
		this.y = this.game.height / 4 * 3;
	};

	Player.prototype.createBulletPool = function() {
	
		this.bulletPool = this.game.add.group();
		this.bulletPool.enableBody = true;
		this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
		this.bulletPool.createMultiple(100, 'player_bullet');
		this.bulletPool.setAll('anchor.x', 0.5);
		this.bulletPool.setAll('anchor.y', 0.5);
		this.bulletPool.setAll('scale.x', CONFIG.PIXEL_RATIO);
		this.bulletPool.setAll('scale.y', CONFIG.PIXEL_RATIO);
		this.bulletPool.setAll('outOfBoundsKill', true);
		this.bulletPool.setAll('checkWorldBounds', true);

		this.updateBulletPool();
	};

	Player.prototype.update = function() {

		// Call the parent update function
		Mob.prototype.update.call(this);

		this.updateInputs();
		this.updateSprite();
		this.updateBullets();
	};

	Player.prototype.updateStats = function () {

		this.speed = this.playerStats.speed * CONFIG.PIXEL_RATIO;
		this.accel = this.speed * this.playerStats.accel;
		this.strength = this.playerStats.strength;
		this.shootDelay = 1000 / this.playerStats.rate;
	};

	Player.prototype.updateInputs = function () {
		// USER INPUTS

		var cursors = this.state.cursors;
		var keyboard = this.state.input.keyboard;

		var delta = (this.game.time.now - this.lastUpdate) / 1000; //in seconds
		this.lastUpdate = this.game.time.now;

		if (cursors.left.isDown && this.x > 20 * CONFIG.PIXEL_RATIO) {
			this.moveLeft(delta);
		} else if (cursors.right.isDown && this.x < (CONFIG.WORLD_WIDTH * 24 - 20) * CONFIG.PIXEL_RATIO) {
			this.moveRight(delta);
		} else {
			this.floatH(delta);
		}

		if (cursors.up.isDown && this.y > 30 * CONFIG.PIXEL_RATIO) {
			this.moveUp(delta);
		} else if (cursors.down.isDown && this.y < (CONFIG.GAME_HEIGHT - 20) * CONFIG.PIXEL_RATIO) {
			this.moveDown(delta);
		} else {
			this.floatV(delta);
		}

		if (keyboard.isDown(Phaser.Keyboard.W)) {
			this.fire();
		}
	};

	Player.prototype.updateSprite = function () {
		var spd = this.body.velocity.x;

		if (spd < - this.speed / 4 * 3) {
			this.play('left_full');
		} else if (spd > this.speed / 4 * 3) {
			this.play('right_full');
		} else if (spd < - this.speed / 5) {
			this.play('left');
		} else if (spd > this.speed / 5) {
			this.play('right');
		} else {
			this.play('idle');
		}
	};

	Player.prototype.moveLeft = function (delta) {
		this.body.velocity.x -= this.accel * delta;
		if (this.body.velocity.x < - this.speed) {
			this.body.velocity.x = - this.speed;
		}
	};

	Player.prototype.moveRight = function (delta) {
		this.body.velocity.x += this.accel * delta;
		if (this.body.velocity.x > this.speed) {
			this.body.velocity.x = this.speed;
		}
	};

	Player.prototype.moveUp = function (delta) {
		this.body.velocity.y -= this.accel * delta;
		if (this.body.velocity.y < - this.speed) {
			this.body.velocity.y = - this.speed;
		}
	};

	Player.prototype.moveDown = function (delta) {
		this.body.velocity.y += this.accel * delta;
		if (this.body.velocity.y > this.speed) {
			this.body.velocity.y = this.speed;
		}
	};

	Player.prototype.floatH = function (delta) {

		if (this.body.velocity.x > 0) {
			this.body.velocity.x -= this.accel * delta;
			if (this.body.velocity.x < 0) {
				this.body.velocity.x = 0;
			}
		} else {
			this.body.velocity.x += this.accel * delta;
			if (this.body.velocity.x > 0) {
				this.body.velocity.x = 0;
			}
		}
	};

	Player.prototype.floatV = function (delta) {
		
		if (this.body.velocity.y > 0) {
			this.body.velocity.y -= this.accel * delta;
			if (this.body.velocity.y < 0) {
				this.body.velocity.y = 0;
			}
		} else {
			this.body.velocity.y += this.accel * delta;
			if (this.body.velocity.y > 0) {
				this.body.velocity.y = 0;
			}
		}
	};

	Player.prototype.fire = function() {

		if (this.alive) {
			if (this.nextShotAt > this.game.time.now) {
				return;
			}

			this.nextShotAt = this.game.time.now + this.shootDelay;

			var bullet = this.bulletPool.getFirstExists(false);
			bullet.reset(this.x, this.y - 20);

			bullet.body.velocity.y = -500 * CONFIG.PIXEL_RATIO;
		}
	};

	Player.prototype.updateBullets = function() {

		// PLAYER BULLETS
		// (dunno why some hi-speed bullets stay alive outside of the screen / world)

		this.bulletPool.forEachAlive(function (bullet) {
			if (bullet.y < -200) {
				bullet.kill();
				return;
			}
		}, this);
	};

	Player.prototype.updateBulletPool = function() {

		var s = this.strength,
				f;

		if (s < 100 ) { f = 0; }
			else if (s < 120 ) { f = 1; }
			else if (s < 160 ) { f = 2; }
			else { f = 3; }

		this.bulletPool.forEach(function(bullet) {
			bullet.animations.add('idle', [ f ], 5, true);
			bullet.play('idle');
		}, null);
	};

	Player.prototype.collectUpgrade = function(upgrade) {

		// TODO : relative upgrades
		// var nSteps = 7; // Number of upgrades needed for max level
		// var maxFactor = 2; // How many times the base (read class) level

		// var nParts = 0;

		// for (var i = 1; i < nSteps; i++) {
		// 	nParts += i;
		// };

		// var strengthPart = this.classStats.strength * (maxFactor - 1);

		if (upgrade === 0) {
			this.playerStats.strength += 10;

		} else if (upgrade === 1) {
			this.playerStats.rate += 1;

		} else if (upgrade === 2) {
			this.playerStats.speed += 10;

		} else {
			this.playerStats.accel += 1;
		}

		this.updateStats();
		this.updateBulletPool();
	};	


	
	/************************************************************************************************
	 * MAIN GAME CLASS
	 * 
	 *
	 ************************************************************************************************/


	function Game() {
		this.score = 0;
		this.player = null;
		this.lastUpdate = 0;
		this.delta = 0;
	}

	Game.prototype = {

		create: function () {

			this.createWorld();
			this.createGround();
			this.scrollSpeed = CONFIG.SCROLL_SPEED;

			// BONUSES

			this.bonusPool =  this.add.group();

			var i, o;

			for (i = 0; i < CONFIG.BONUSPOOL_SIZE; i++) {
				o = new Collectible(this, 'bonus_cube');
				this.bonusPool.add(o);
				o.exists = false; 
				o.alive = false;
			}

			// MOBS

			this.createEnemies();

			// PLAYER

			this.player = new Player(this);
			this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
			
			// USER ACTIONS

			this.input.onDown.add(this.onInputDown, this);
			this.cursors = this.input.keyboard.createCursorKeys();

			// GUI

			this.guiText1 = this.add.bitmapText(0, -5 * CONFIG.PIXEL_RATIO, 'minecraftia', '');
			this.guiText1.scale.setTo(CONFIG.PIXEL_RATIO / 2, CONFIG.PIXEL_RATIO / 2); 
			this.guiText1.fixedToCamera = true;

			this.guiText2 = this.add.bitmapText(0, 32, 'minecraftia', '');
			this.guiText2.scale.setTo(CONFIG.PIXEL_RATIO / 4, CONFIG.PIXEL_RATIO / 4); 
			this.guiText2.fixedToCamera = true;

			this.updateGUI();
		},

		createWorld: function () {

			this.game.physics.startSystem(Phaser.Physics.ARCADE);

			this.game.world.setBounds(0, 0, 24 * CONFIG.WORLD_WIDTH * CONFIG.PIXEL_RATIO, CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO);

			console.log('Camera size     		: ' + this.game.camera.width + '/' + this.game.camera.height);
			console.log('World size      		: ' + this.world.width + '/' + this.world.height);
		},

		createGround: function () {

			this.map = this.game.add.tilemap();

			if (CONFIG.DEBUG.tileset) {
				this.map.addTilesetImage('tileset_1', 'tileset_1_debug', 24, 28, null, null, 0);

			} else {
				this.map.addTilesetImage('tileset_1', 'tileset_1', 24, 28, null, null, 0);
			}
			
			//  Creates a new blank layer and sets the map dimensions.
			this.groundWidth = CONFIG.WORLD_WIDTH;
			this.groundHeight = Math.round(CONFIG.GAME_HEIGHT / 28) + 1 + CONFIG.WORLD_SWAP_HEIGHT;

			// this.ground = map.create('layer0', CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT, 24, 28);
			this.ground = this.map.create('layer0', this.groundWidth, this.groundHeight, 24, 28);
			this.ground.fixedToCamera = false;
			this.ground.scale.setTo(CONFIG.PIXEL_RATIO, CONFIG.PIXEL_RATIO);
			this.ground.scrollFactorX = 0.0000125; /// WTF ??? Layer seems to have double x scroll speed

			console.log('Ground real size       : ' + this.ground.width + '/' + this.ground.height);
			console.log('Ground logic size      : ' + this.groundWidth + '/' + this.groundHeight);
			
			// this.scrollMax = Math.round((this.ground.height - this.game.camera.height) / 28) * 28;
			this.scrollMax = CONFIG.WORLD_SWAP_HEIGHT * CONFIG.PIXEL_RATIO * 28 - 1;
			this.ground.y = - this.scrollMax;

			this.terrainData = this.generateTerrain();
			this.scrollCounter = 0;

			this.drawGround();
		},

		generateTerrain: function () {

			var sizeX = CONFIG.WORLD_WIDTH + 1;
			var sizeY = CONFIG.WORLD_HEIGHT + 1;

			var map = [];
			var i,j,k;

			var TILE = {
				FORREST: 		6,
				EARTH: 			6 + 15 * 1,
				WATER: 			6 + 15 * 2,
				DEEPWATER: 	6 + 15 * 3
			};

			var TILESTACK = [TILE.FORREST, TILE.EARTH, TILE.WATER, TILE.DEEPWATER];

			// Populate
			for (i = 0; i < sizeX; i++) {
				map[i] = [];
				for (j = 0; j < sizeY; j++) {
					map[i][j] = this.game.rnd.between(0, 99999);
					// map[i][j] = this.game.rnd.between(0, 90000);
					// map[i][j] = 40000;	// Only sea
				}
			}

			// Average
			for (k = 0; k < 2; k++) {

				for (i = 0; i < sizeX -1 ; i++) {
					for (j = 0; j < sizeY - 1; j++) {

						map[i][j] = (
							map[i  ][j  ] + 
							map[i+1][j  ] + 
							map[i  ][j+1] + 
							map[i+1][j+1]
							) / 4;

						map[i][j] = (
							map[(sizeX-1) - i    ][(sizeY-1) - j    ] + 
							map[(sizeX-1) - i - 1][(sizeY-1) - j    ] + 
							map[(sizeX-1) - i    ][(sizeY-1) - j - 1] + 
							map[(sizeX-1) - i - 1][(sizeY-1) - j - 1]
							) / 4;
					}
				}
			}

			// Converting to tile numbers
			for (i = 0; i < sizeX ; i++) {
				for (j = 0; j < sizeY; j++) {

					var data = map[i][j],
							val;

					if (data > 58000) {
						val = TILE.FORREST;

					} else if (data > 50000) {
						val = TILE.EARTH;

					} else if (data > 38000) {
						val = TILE.WATER;

					} else {
						val = TILE.DEEPWATER;
						// val = TILE.EARTH;
						// val = TILE.WATER;
					}
					map[i][j] = val;
				}
			}

			// Smoothing

			for (var n = 0; n < TILESTACK.length - 1; n++) {

				var tileCurrent = TILESTACK[n],
				tileAbove = -1,
				tileBelow = -1;

				if (n > 0) {
					tileAbove = TILESTACK[n - 1];
				}

				tileBelow = TILESTACK[n + 1];	// There is always a lower layer as we don't proceed last TILESTACK item

				for (i = 0; i < sizeX ; i++) {
					for (j = 0; j < sizeY; j++) {

						// Check each tile against the current layer of terrain
						if (map[i][j] === tileCurrent) {

							// Left up
							if (i > 0         && j > 0         && map[i - 1][j - 1] !== tileCurrent && map[i - 1][j - 1] !== tileAbove && map[i - 1][j - 1] !== tileBelow) { map[i - 1][j - 1] = tileBelow; }
							// Mid up
							if (                 j > 0         && map[i    ][j - 1] !== tileCurrent && map[i    ][j - 1] !== tileAbove && map[i    ][j - 1] !== tileBelow) { map[i    ][j - 1] = tileBelow; }
							// Right up
							if (i < sizeX - 1 && j > 0         && map[i + 1][j - 1] !== tileCurrent && map[i + 1][j - 1] !== tileAbove && map[i + 1][j - 1] !== tileBelow) { map[i + 1][j - 1] = tileBelow; }
							// Right mid
							if (i < sizeX - 1                  && map[i + 1][j    ] !== tileCurrent && map[i + 1][j    ] !== tileAbove && map[i + 1][j    ] !== tileBelow) { map[i + 1][j    ] = tileBelow; }
							// Right down
							if (i < sizeX - 1 && j < sizeY - 1 && map[i + 1][j + 1] !== tileCurrent && map[i + 1][j + 1] !== tileAbove && map[i + 1][j + 1] !== tileBelow) { map[i + 1][j + 1] = tileBelow; }
							// Mid down
							if (                 j < sizeY - 1 && map[i    ][j + 1] !== tileCurrent && map[i    ][j + 1] !== tileAbove && map[i    ][j + 1] !== tileBelow) { map[i    ][j + 1] = tileBelow; }
							// Left down
							if (i > 0         && j < sizeY - 1 && map[i - 1][j + 1] !== tileCurrent && map[i - 1][j + 1] !== tileAbove && map[i - 1][j + 1] !== tileBelow) { map[i - 1][j + 1] = tileBelow; }
							// Left mid
							if (i > 0                          && map[i - 1][j    ] !== tileCurrent && map[i - 1][j    ] !== tileAbove && map[i - 1][j    ] !== tileBelow) { map[i - 1][j    ] = tileBelow; }
						}
					}
				}
			}

			// Transition tiles

			var mapFinal = [];

			for (i = 0; i < sizeX - 1; i++) {
				var row = [];
				for (j = 0; j < sizeY - 1; j++) {
					row[j] = 50; // Void tile
				}
				mapFinal[i] = row;
			}


			for (n = 1; n < TILESTACK.length; n++) {
			// for (n = 2; n < 3; n++) {

				var ab = TILESTACK[n],	// Current layer tile
						cu = TILESTACK[n - 1];	// Upper layer tile

				for (i = 0; i < sizeX - 1; i++) {
					for (j = 0; j < sizeY - 1; j++) {

						var q = [[map[i][j], map[i + 1][j]],
										[map[i][j + 1], map[i + 1][j + 1]]];

						// 4 corners
						if (q.join() === [[cu,cu],[cu,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 6;

						// 3 corners
						} else if (q.join() === [[cu,cu],[cu,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 9;

						} else if (q.join() === [[cu,cu],[ab,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 8;

						} else if (q.join() === [[ab,cu],[cu,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 3;

						} else if (q.join() === [[cu,ab],[cu,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 4;

						// 2 corners
						} else if (q.join() === [[cu,cu],[ab,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 11;

						} else if (q.join() === [[ab,cu],[ab,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 5;

						} else if (q.join() === [[ab,ab],[cu,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 1;

						} else if (q.join() === [[cu,ab],[cu,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 7;

						} else if (q.join() === [[ab,cu],[cu,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 14;

						} else if (q.join() === [[cu,ab],[ab,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 13;

						// 1 corner
						} else if (q.join() === [[cu,ab],[ab,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 12;

						} else if (q.join() === [[ab,cu],[ab,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 10;

						} else if (q.join() === [[ab,ab],[ab,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 0;

						} else if (q.join() === [[ab,ab],[cu,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 2;

						// no corner
						} else if (q.join() === [[ab,ab],[ab,ab]].join()) {
							mapFinal[i][j] = n * 15 + 6;
						}

					}
				}
			}

			return mapFinal;
		},

		createEnemies: function () {

			var mob, i;

			// MOB BULLETS

			this.bulletPoolsMob = [];

			this.bulletPoolsMob[0] = this.add.group();
			this.bulletPoolsMob[0].enableBody = true;
			this.bulletPoolsMob[0].physicsBodyType = Phaser.Physics.ARCADE;
			this.bulletPoolsMob[0].createMultiple(100, 'mob_bullet_1');
			this.bulletPoolsMob[0].setAll('anchor.x', 0.5);
			this.bulletPoolsMob[0].setAll('anchor.y', 0.5);
			this.bulletPoolsMob[0].setAll('scale.x', CONFIG.PIXEL_RATIO);
			this.bulletPoolsMob[0].setAll('scale.y', CONFIG.PIXEL_RATIO);
			this.bulletPoolsMob[0].setAll('outOfBoundsKill', true);
			this.bulletPoolsMob[0].setAll('checkWorldBounds', true);

			this.bulletPoolsMob[1] = this.add.group();
			this.bulletPoolsMob[1].enableBody = true;
			this.bulletPoolsMob[1].physicsBodyType = Phaser.Physics.ARCADE;
			this.bulletPoolsMob[1].createMultiple(100, 'mob_bullet_2');
			this.bulletPoolsMob[1].setAll('anchor.x', 0.5);
			this.bulletPoolsMob[1].setAll('anchor.y', 0.5);
			this.bulletPoolsMob[1].setAll('scale.x', CONFIG.PIXEL_RATIO);
			this.bulletPoolsMob[1].setAll('scale.y', CONFIG.PIXEL_RATIO);
			this.bulletPoolsMob[1].setAll('outOfBoundsKill', true);
			this.bulletPoolsMob[1].setAll('checkWorldBounds', true);

			// GROUND ENEMIES

			this.mobPoolsGround = [];

			// Tuerrets
			this.mobPoolsGround[0] = this.add.group();

			for (i = 0; i < CONFIG.MOBPOOL_SIZE; i++) {
				mob = new Turret(this);
				this.mobPoolsGround[0].add(mob);
				mob.exists = false; 
				mob.alive = false;
			}

			// FLYING ENEMIES

			this.mobPools = [];

			// Planes
			this.mobPools[0] = this.add.group();

			for (i = 0; i < CONFIG.MOBPOOL_SIZE; i++) {
				mob = new Plane(this);
				this.mobPools[0].add(mob);
				mob.exists = false; 
				mob.alive = false;
			}

			// Vessels
			this.mobPools[1] = this.add.group();

			for (i = 0; i < CONFIG.MOBPOOL_SIZE; i++) {
				mob = new Vessel(this);
				this.mobPools[1].add(mob);
				mob.exists = false; 
				mob.alive = false;
			}

			// Flagships
			this.mobPools[2] = this.add.group();

			for (i = 0; i < CONFIG.MOBPOOL_SIZE; i++) {
				mob = new Flagship(this);
				this.mobPools[2].add(mob);
				mob.exists = false; 
				mob.alive = false;
			}


			// TODO !
			// 	createMultipleExtends(state, number, poolName, className);

			// function createMultipleExtends(number, pool, className) {
			// 	for (var i = 0; i < number; i++) {
			// 		var sprite = new Mob(this);
			// 		state[poolName].add(sprite);
			// 		sprite.exists = false; 
			// 		sprite.alive = false;
			// 	}
			// }

			//			this.mobPool.createMultiple(CONFIG.MOBPOOL_SIZE, 'mob_plane_1');
			
			this.enemyDelay = [];
			this.nextEnemyAt = [];

			this.enemyDelay[0] = 1000;
			this.enemyDelay[1] = 5000;
			this.enemyDelay[2] = 30000;

			this.nextEnemyAt = this.enemyDelay.slice();

			this.enemyDelayGround = [];
			this.nextEnemyGroundAt = [];

			this.enemyDelayGround[0] = 3000;

			this.nextEnemyGroundAt = this.enemyDelayGround.slice();
		},

		update: function () {

			this.delta = (this.game.time.now - this.lastUpdate) / 1000; //in seconds
			this.lastUpdate = this.game.time.now;

			// Enemy spawn
			this.updateEnemySpawn();

			// Collisions
			this.updateCollisions();

			// Background
			this.updateBackground(this.delta);
		},

		updateEnemySpawn: function () {

			var enemy, i;

			for (i = 0; i < this.mobPools.length; i++) {

				if (this.nextEnemyAt[i] < this.time.now && this.mobPools[i].countDead() > 0) {

					this.nextEnemyAt[i] = this.time.now + this.enemyDelay[i];

					enemy = this.mobPools[i].getFirstExists(false);
					enemy.revive();
				}
			}

			// for (i = 0; i < this.mobPoolsGround.length; i++) {

			// 	if (this.nextEnemyGroundAt[i] < this.time.now && this.mobPoolsGround[i].countDead() > 0) {

			// 		this.nextEnemyGroundAt[i] = this.time.now + this.enemyDelayGround[i];

			// 		enemy = this.mobPoolsGround[i].getFirstExists(false);
			// 		enemy.revive();
			// 	}
			// }
		},

		updateEnemySpawnGround: function () {

			var enemy, i, j, k, delta;

			delta = CONFIG.WORLD_SWAP_HEIGHT * 28 / this.scrollSpeed;

			var swapMap = [];

			for (i = 0; i < CONFIG.WORLD_WIDTH; i++) {
				swapMap[i] = [];
				for(j = 0; j < CONFIG.WORLD_SWAP_HEIGHT; j++) {

					var rowOffset = CONFIG.WORLD_HEIGHT - (this.groundHeight + this.scrollCounter) + j;

					if (rowOffset < 0) {
						rowOffset += CONFIG.WORLD_HEIGHT;
					}

					// this.map.putTile(this.terrainData[i][rowOffset],i,j,this.ground);
					swapMap[i][j] = this.terrainData[i][rowOffset];
				}
			}


			for (k = 0; k < this.mobPoolsGround.length; k++) {

				var nEnemies = Math.round(delta * 1000 / this.enemyDelayGround[k]) + 1;
				var tiles = [];

				for (i = 0; i < CONFIG.WORLD_WIDTH; i++) {
					for(j = 0; j < CONFIG.WORLD_SWAP_HEIGHT; j++) {

						if (swapMap[i][j] === 21) {	// We are on a earth tile
							tiles.push([i, j]);
						}
					}
				}

				if (tiles.length > 0 && nEnemies > 0) {

					for (var n = 0; n < tiles.length && n < nEnemies; n++) {
						var r = this.rnd.integerInRange(0, tiles.length - 1 - n);

						if (this.mobPoolsGround[k].countDead() > 0) {

							enemy = this.mobPoolsGround[k].getFirstExists(false);
							enemy.revive(tiles[r][0], tiles[r][1]);

							tiles.remove(r);
						}
					}
				}
			}
		},

		updateCollisions: function () {

			var i;

			// Flying enemies

			for (i = 0; i < this.mobPools.length; i++) {
				// Player bullets VS ennemy mobs
				this.physics.arcade.overlap(this.player.bulletPool, this.mobPools[i], this.bulletVSmob, null, this);

				// Player VS ennemy mobs
				this.physics.arcade.overlap(this.player, this.mobPools[i], this.playerVSmob, null, this);
			}

			// Ground enemies

			for (i = 0; i < this.mobPoolsGround.length; i++) {
				// Player bullets VS ennemy mobs
				this.physics.arcade.overlap(this.player.bulletPool, this.mobPoolsGround[i], this.bulletVSmob, null, this);
			}

			// Player VS ennemy bullets
			for (i = 0; i < this.bulletPoolsMob.length; i++) {
				this.physics.arcade.overlap(this.bulletPoolsMob[i], this.player, this.playerVSbullet, null, this);
			}

			// Player VS bonuses
			this.physics.arcade.overlap(this.bonusPool, this.player, this.playerVSbonus, null, this);
		},

		bulletVSmob: function (bullet, mob) {

			bullet.kill();
			mob.takeDamage(this.player.strength / 5);	// TODO: constant

			if (mob.health <= 0) {
				mob.die();
				this.explode(mob);

				this.score += mob.points;
				this.updateGUI();
			}
		},

		playerVSmob: function (player, mob) {
			player.takeDamage(20);
			mob.kill();
			this.explode(mob);
			this.updateGUI();

			if (player.health <= 0) {
				player.kill();
				player.alive = false;
				this.explode(player);
			}
		},

		playerVSbullet: function (player, bullet) {
			player.takeDamage(20);
			bullet.kill();
			this.updateGUI();

			if (player.health <= 0) {
				player.kill();
				player.alive = false;
				this.explode(player);
			}
		},

		playerVSbonus: function (player, bonus) {
			bonus.kill();
			player.collectUpgrade(bonus.bonusClass);

			this.updateGUI();
		},

		explode: function (thing) {
			var explosion = this.add.sprite(thing.x, thing.y, 'explosion_1');
			explosion.anchor.setTo(0.5, 0.5);
			explosion.scale.setTo(CONFIG.PIXEL_RATIO, CONFIG.PIXEL_RATIO);
			explosion.animations.add('boom', [ 0, 1, 2, 3, 4 ], 30, false);
			explosion.play('boom', 15, false, true);			
		},


		// MISC

		updateGUI: function () {

			var gui = '';

			var life = '';
			for (var i = 0; i < Math.round(this.player.health / 20); i++) {
				life += '@';
			}

			gui += 'HP  ' + life + '\n';

			gui += 'STR ' + this.player.playerStats.strength + '\n';
			gui += 'RAT ' + this.player.playerStats.rate + '\n';
			gui += 'SPD ' + this.player.playerStats.speed + '\n';
			gui += 'ACC ' + this.player.playerStats.accel + '\n';

			this.guiText1.setText(this.score + '');
			this.guiText2.setText(gui);
		},

		updateBackground: function (delta) {

			// SCROLLING

			this.scrollSpeed += CONFIG.SCROLL_ACCEL * delta / 60;

			// Is camera still in the buffer zone ?
			if (this.ground.y < 0 ) {

				// Let's scroll the ground
				this.ground.y += this.scrollSpeed * CONFIG.PIXEL_RATIO * delta;

			} else {

				this.scrollCounter += CONFIG.WORLD_SWAP_HEIGHT;

				if (this.scrollCounter > CONFIG.WORLD_HEIGHT) {
					this.scrollCounter = 0;
				}

				this.drawGround();
				this.updateEnemySpawnGround();

				this.ground.y = - this.scrollMax;
			}
		},

		drawGround: function () {


			for (var i = 0; i < CONFIG.WORLD_WIDTH; i++) {
				for(var j = 0; j < this.groundHeight; j++) {

					var rowOffset = CONFIG.WORLD_HEIGHT - (this.groundHeight + this.scrollCounter) + j;

					if (rowOffset < 0) {
						rowOffset += CONFIG.WORLD_HEIGHT;
					}

					this.map.putTile(this.terrainData[i][rowOffset],i,j,this.ground);
				}
			}
		},

		onInputDown: function () {

			this.game.state.start('menu');
		},

		// RENDER

		render: function () {
			// this.game.debug.body(this.player);

			if (CONFIG.DEBUG.bottomInfos) {

				this.game.debug.text(
					'ground.y : ' + Math.round(this.ground.y) + 'px | ' + 
					this.mobPools[0].countLiving() + '/' + CONFIG.MOBPOOL_SIZE + ' mobs | ' +
					(100 - this.bulletPoolsMob[0].countDead()) + ' mob bullets | ' +
					(100 - this.player.bulletPool.countDead()) + ' bullets | '
					, 
					0, CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO - 16);

				this.game.debug.text(
					// 'player.health : ' + this.player.health + ' | ' + 
					'Camera position : ' + this.camera.x + '/' + this.camera.y + ' | ' +
					'SCROLL : ' + Math.round(this.ground.y % (28 * CONFIG.PIXEL_RATIO))
					,

					0, CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO - 16 + 16);
			}
		}
	};

	window['firsttry'] = window['firsttry'] || {};
	window['firsttry'].Game = Game;

}());

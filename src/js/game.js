/*globals CONFIG */

(function() {
	'use strict';
	
	/************************************************************************************************
	 * MAIN GAME
	 * 
	 *
	 ************************************************************************************************/


	function Game() {
		this.score = 0;
		this.player = null;
		this.lastUpdate = 0;
		this.delta = 0;

		this.STATE = {
			preplay:  0,	// no enemy
			play: 		1,
			postplay: 2 	// no player
		};

		this.gameState = null;
	}

	Game.prototype = {

		create: function () {

			this.gameState = this.STATE.preplay;

			this.createWorld();
			this.createGround();
			this.scrollSpeed = CONFIG.SCROLL_SPEED;

			var i, o;

			// Clouds

			this.cloudPool = this.add.group();

			for (i = 0; i < CONFIG.CLOUDPOOL_SIZE; i++) {
				o = new window['firsttry'].Cloud(this);
				this.cloudPool.add(o);
				o.exists = false; 
				o.alive = false;
			}

			this.nextCloudAt = 0;
			this.cloudDelay = 1000;

			// BONUSES

			this.bonusPool =  this.add.group();

			for (i = 0; i < CONFIG.BONUSPOOL_SIZE; i++) {
				o = new window['firsttry'].Collectible(this, 'bonus_cube');
				this.bonusPool.add(o);
				o.exists = false; 
				o.alive = false;
			}

			// MOBS

			this.createEnemies();

			// PLAYER

			this.player = new window['firsttry'].Player(this);
			this.score = 0;

			this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
			
			// USER ACTIONS

			this.input.onDown.add(this.onInputDown, this);
			this.cursors = this.input.keyboard.createCursorKeys();

			this.createGUI();

			// AUDIO

			this.createAudio();
		},

		createGUI: function () {
			// GUI

			this.guiText0 = this.add.bitmapText(0, 0, 'minecraftia', 'Get ready');
			this.guiText0.scale.setTo(CONFIG.PIXEL_RATIO, CONFIG.PIXEL_RATIO); 
			this.guiText0.x = (this.game.width - this.guiText0.textWidth * CONFIG.PIXEL_RATIO) / 2;
			this.guiText0.y = (this.game.height- this.guiText0.textHeight * CONFIG.PIXEL_RATIO) / 2;
			this.guiText0.fixedToCamera = true;

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

			var mob, o, i;

			// MOB BULLETS

			this.bulletPoolsMob = [];

			// Small bullets
			this.bulletPoolsMob[0] = this.add.group();

			for (i = 0; i < CONFIG.BULLETPOOL_SIZE_ENNEMY; i++) {
				o = new window['firsttry'].Bullet(this, 0);
				this.bulletPoolsMob[0].add(o);
				o.exists = false; 
				o.alive = false;
			}

			// Mid bullets
			this.bulletPoolsMob[1] = this.add.group();

			for (i = 0; i < CONFIG.BULLETPOOL_SIZE_ENNEMY; i++) {
				o = new window['firsttry'].Bullet(this, 1);
				this.bulletPoolsMob[1].add(o);
				o.exists = false; 
				o.alive = false;
			}


			// GROUND ENEMIES

			this.mobPoolsGround = [];

			// Turrets
			this.mobPoolsGround[0] = this.add.group();

			for (i = 0; i < CONFIG.MOBPOOL_SIZE; i++) {
				mob = new window['firsttry'].Turret(this);
				this.mobPoolsGround[0].add(mob);
				mob.exists = false; 
				mob.alive = false;
			}

			// FLYING ENEMIES

			this.mobPools = [];

			// Planes
			this.mobPools[0] = this.add.group();

			for (i = 0; i < CONFIG.MOBPOOL_SIZE; i++) {
				mob = new window['firsttry'].Plane(this);
				this.mobPools[0].add(mob);
				mob.exists = false; 
				mob.alive = false;
			}

			// Vessels
			this.mobPools[1] = this.add.group();

			for (i = 0; i < CONFIG.MOBPOOL_SIZE; i++) {
				mob = new window['firsttry'].Vessel(this);
				this.mobPools[1].add(mob);
				mob.exists = false; 
				mob.alive = false;
			}

			// Flagships
			this.mobPools[2] = this.add.group();

			for (i = 0; i < CONFIG.MOBPOOL_SIZE; i++) {
				mob = new window['firsttry'].Flagship(this);
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

			// this.enemyDelay[0] = 100000;
			// this.enemyDelay[1] = 500000;
			// this.enemyDelay[2] = 3000000;

			this.enemyDelayGround = [];
			this.nextEnemyGroundAt = [];

			this.enemyDelayGround[0] = 5000;
		},

		createAudio: function () {
			this.sound['shoot_player_1'] = this.add.audio('shoot_player_1');
			this.sound['shoot_player_2'] = this.add.audio('shoot_player_2');
			this.sound['shoot_player_3'] = this.add.audio('shoot_player_3');
			this.sound['shoot_player_4'] = this.add.audio('shoot_player_4');
			this.sound['shoot_player_5'] = this.add.audio('shoot_player_5');

			this.sound['explosion_1'] = this.add.audio('explosion_1');
			this.sound['explosion_2'] = this.add.audio('explosion_2');
			this.sound['explosion_3'] = this.add.audio('explosion_3');
			this.sound['explosion_4'] = this.add.audio('explosion_4');

			this.sound['hurt_1'] = this.add.audio('hurt_1');
			this.sound['collect_1'] = this.add.audio('collect_1');

			// TODO : music !
			// this.sound['music_1'] = this.add.audio('music_1');
			// this.sound['music_1'].play();

    	// this.sound['shoot_player'].allowMultiple = true;
		},

		statePreplay2Play: function () {

			this.gameState = this.STATE.play;

			// Reset enemy next spawn

			this.nextEnemyAt[0] = this.time.now + this.enemyDelay[0];	// TODO in a loop
			this.nextEnemyAt[1] = this.time.now + this.enemyDelay[1];
			this.nextEnemyAt[2] = this.time.now + this.enemyDelay[2];

			this.nextEnemyGroundAt[0] = this.time.now + this.enemyDelayGround[0];

			this.guiText0.setText('');
		},

		statePlay2Postplay: function () {

			this.gameState = this.STATE.postplay;

			this.guiText0.setText('Game over');
		},

		update: function () {

			this.delta = (this.game.time.now - this.lastUpdate) / 1000; //in seconds
			this.lastUpdate = this.game.time.now;

			if (this.gameState !== this.STATE.preplay) {
				// Enemy spawn
				this.updateEnemySpawn();
			}

			// Collisions
			this.updateCollisions();

			// Cloud spawn
			// this.updateCloudSpawn();

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

		updateCloudSpawn: function () {

			var cloud;

			if (this.nextCloudAt < this.time.now && this.cloudPool.countDead() > 0) {

				this.nextCloudAt = this.time.now + this.cloudDelay;

				cloud = this.cloudPool.getFirstExists(false);
				cloud.revive();
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

			mob.kill();
			this.explode(mob);

			this.playerVSenemy(player);
		},

		playerVSbullet: function (player, bullet) {

			bullet.kill();

			this.playerVSenemy(player);
		},

		playerVSenemy: function (player) {

			player.takeDamage(10); 

			if (player.health <= 0) {
				player.kill();
				player.alive = false;
				this.explode(player);

				this.sound['explosion_3'].play();

				this.statePlay2Postplay();

			} else {
				this.sound['hurt_1'].play();
			}

			this.updateGUI();
		},

		playerVSbonus: function (player, bonus) {
			bonus.kill();
			player.collectUpgrade(bonus.bonusClass);

			this.updateGUI();
		},

		// TODO : mob method
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

			if (this.player.isAlive) {
				this.scrollSpeed += CONFIG.SCROLL_ACCEL * delta / 60;	// Accelerate scrolling speed
			}

			if (this.ground.y < 0 ) {	// Is camera still in the buffer zone ?

				// Let's scroll the ground
				this.ground.y += this.scrollSpeed * CONFIG.PIXEL_RATIO * delta;


			} else {	// Camera has reached the edge of the buffer zone, next chunk of map

				this.scrollCounter += CONFIG.WORLD_SWAP_HEIGHT;	// 

				if (this.scrollCounter > CONFIG.WORLD_HEIGHT) { // Has camera reached the end of the world ?
					this.scrollCounter = 0;
				}

				this.drawGround();

				if (this.gameState !== this.STATE.preplay) {
					this.updateEnemySpawnGround();
				}

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
					this.mobPools[0].countLiving() + '+' + this.mobPools[1].countLiving() + '+' + this.mobPools[2].countLiving() + '+' + this.mobPoolsGround[0].countLiving() + ' mobs | ' +
					this.bulletPoolsMob[0].countLiving() + '+' + this.bulletPoolsMob[1].countLiving() + ' mob bullets | ' +
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

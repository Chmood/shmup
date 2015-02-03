/*globals*/

(function() {
	'use strict';

	/************************************************************************************************
	 * ACTOR CLASS
	 * 
	 * Add some common properties like : 
	 * - beeing pinned to ground
	 * - finding direction (read angle) to another sprite
	 *
	 ************************************************************************************************/


	function Actor(state, image) {

		this.state = state;
		this.game = state.game;

		// Call parent constructor
		window['firsttry'].Spriter.call(this, state, image);

		this.isPinnedToGround = false;
	}

	Actor.prototype = Object.create(window['firsttry'].Spriter.prototype);
	Actor.prototype.constructor = Actor;

	Actor.prototype.getAngleTo = function (target) {

		var angle;
		if (target.x || target.y) {

			angle = Math.atan2(target.x - this.x, target.y - this.y);
		}

		return angle;
	};


	// Export the object
	window['firsttry'] = window['firsttry'] || {};
	window['firsttry'].Actor = Actor;
}());
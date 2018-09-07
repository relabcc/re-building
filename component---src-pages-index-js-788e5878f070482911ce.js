webpackJsonp([35783957827783],{

/***/ 661:
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Tween.js - Licensed under the MIT license
	 * https://github.com/tweenjs/tween.js
	 * ----------------------------------------------
	 *
	 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
	 * Thank you all, you're awesome!
	 */
	
	
	var _Group = function () {
		this._tweens = {};
		this._tweensAddedDuringUpdate = {};
	};
	
	_Group.prototype = {
		getAll: function () {
	
			return Object.keys(this._tweens).map(function (tweenId) {
				return this._tweens[tweenId];
			}.bind(this));
	
		},
	
		removeAll: function () {
	
			this._tweens = {};
	
		},
	
		add: function (tween) {
	
			this._tweens[tween.getId()] = tween;
			this._tweensAddedDuringUpdate[tween.getId()] = tween;
	
		},
	
		remove: function (tween) {
	
			delete this._tweens[tween.getId()];
			delete this._tweensAddedDuringUpdate[tween.getId()];
	
		},
	
		update: function (time, preserve) {
	
			var tweenIds = Object.keys(this._tweens);
	
			if (tweenIds.length === 0) {
				return false;
			}
	
			time = time !== undefined ? time : TWEEN.now();
	
			// Tweens are updated in "batches". If you add a new tween during an update, then the
			// new tween will be updated in the next batch.
			// If you remove a tween during an update, it may or may not be updated. However,
			// if the removed tween was added during the current batch, then it will not be updated.
			while (tweenIds.length > 0) {
				this._tweensAddedDuringUpdate = {};
	
				for (var i = 0; i < tweenIds.length; i++) {
	
					var tween = this._tweens[tweenIds[i]];
	
					if (tween && tween.update(time) === false) {
						tween._isPlaying = false;
	
						if (!preserve) {
							delete this._tweens[tweenIds[i]];
						}
					}
				}
	
				tweenIds = Object.keys(this._tweensAddedDuringUpdate);
			}
	
			return true;
	
		}
	};
	
	var TWEEN = new _Group();
	
	TWEEN.Group = _Group;
	TWEEN._nextId = 0;
	TWEEN.nextId = function () {
		return TWEEN._nextId++;
	};
	
	
	// Include a performance.now polyfill.
	// In node.js, use process.hrtime.
	if (typeof (window) === 'undefined' && typeof (process) !== 'undefined') {
		TWEEN.now = function () {
			var time = process.hrtime();
	
			// Convert [seconds, nanoseconds] to milliseconds.
			return time[0] * 1000 + time[1] / 1000000;
		};
	}
	// In a browser, use window.performance.now if it is available.
	else if (typeof (window) !== 'undefined' &&
	         window.performance !== undefined &&
			 window.performance.now !== undefined) {
		// This must be bound, because directly assigning this function
		// leads to an invocation exception in Chrome.
		TWEEN.now = window.performance.now.bind(window.performance);
	}
	// Use Date.now if it is available.
	else if (Date.now !== undefined) {
		TWEEN.now = Date.now;
	}
	// Otherwise, use 'new Date().getTime()'.
	else {
		TWEEN.now = function () {
			return new Date().getTime();
		};
	}
	
	
	TWEEN.Tween = function (object, group) {
		this._object = object;
		this._valuesStart = {};
		this._valuesEnd = {};
		this._valuesStartRepeat = {};
		this._duration = 1000;
		this._repeat = 0;
		this._repeatDelayTime = undefined;
		this._yoyo = false;
		this._isPlaying = false;
		this._reversed = false;
		this._delayTime = 0;
		this._startTime = null;
		this._easingFunction = TWEEN.Easing.Linear.None;
		this._interpolationFunction = TWEEN.Interpolation.Linear;
		this._chainedTweens = [];
		this._onStartCallback = null;
		this._onStartCallbackFired = false;
		this._onUpdateCallback = null;
		this._onCompleteCallback = null;
		this._onStopCallback = null;
		this._group = group || TWEEN;
		this._id = TWEEN.nextId();
	
	};
	
	TWEEN.Tween.prototype = {
		getId: function getId() {
			return this._id;
		},
	
		isPlaying: function isPlaying() {
			return this._isPlaying;
		},
	
		to: function to(properties, duration) {
	
			this._valuesEnd = properties;
	
			if (duration !== undefined) {
				this._duration = duration;
			}
	
			return this;
	
		},
	
		start: function start(time) {
	
			this._group.add(this);
	
			this._isPlaying = true;
	
			this._onStartCallbackFired = false;
	
			this._startTime = time !== undefined ? typeof time === 'string' ? TWEEN.now() + parseFloat(time) : time : TWEEN.now();
			this._startTime += this._delayTime;
	
			for (var property in this._valuesEnd) {
	
				// Check if an Array was provided as property value
				if (this._valuesEnd[property] instanceof Array) {
	
					if (this._valuesEnd[property].length === 0) {
						continue;
					}
	
					// Create a local copy of the Array with the start value at the front
					this._valuesEnd[property] = [this._object[property]].concat(this._valuesEnd[property]);
	
				}
	
				// If `to()` specifies a property that doesn't exist in the source object,
				// we should not set that property in the object
				if (this._object[property] === undefined) {
					continue;
				}
	
				// Save the starting value.
				this._valuesStart[property] = this._object[property];
	
				if ((this._valuesStart[property] instanceof Array) === false) {
					this._valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
				}
	
				this._valuesStartRepeat[property] = this._valuesStart[property] || 0;
	
			}
	
			return this;
	
		},
	
		stop: function stop() {
	
			if (!this._isPlaying) {
				return this;
			}
	
			this._group.remove(this);
			this._isPlaying = false;
	
			if (this._onStopCallback !== null) {
				this._onStopCallback(this._object);
			}
	
			this.stopChainedTweens();
			return this;
	
		},
	
		end: function end() {
	
			this.update(this._startTime + this._duration);
			return this;
	
		},
	
		stopChainedTweens: function stopChainedTweens() {
	
			for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
				this._chainedTweens[i].stop();
			}
	
		},
	
		group: function group(group) {
			this._group = group;
			return this;
		},
	
		delay: function delay(amount) {
	
			this._delayTime = amount;
			return this;
	
		},
	
		repeat: function repeat(times) {
	
			this._repeat = times;
			return this;
	
		},
	
		repeatDelay: function repeatDelay(amount) {
	
			this._repeatDelayTime = amount;
			return this;
	
		},
	
		yoyo: function yoyo(yy) {
	
			this._yoyo = yy;
			return this;
	
		},
	
		easing: function easing(eas) {
	
			this._easingFunction = eas;
			return this;
	
		},
	
		interpolation: function interpolation(inter) {
	
			this._interpolationFunction = inter;
			return this;
	
		},
	
		chain: function chain() {
	
			this._chainedTweens = arguments;
			return this;
	
		},
	
		onStart: function onStart(callback) {
	
			this._onStartCallback = callback;
			return this;
	
		},
	
		onUpdate: function onUpdate(callback) {
	
			this._onUpdateCallback = callback;
			return this;
	
		},
	
		onComplete: function onComplete(callback) {
	
			this._onCompleteCallback = callback;
			return this;
	
		},
	
		onStop: function onStop(callback) {
	
			this._onStopCallback = callback;
			return this;
	
		},
	
		update: function update(time) {
	
			var property;
			var elapsed;
			var value;
	
			if (time < this._startTime) {
				return true;
			}
	
			if (this._onStartCallbackFired === false) {
	
				if (this._onStartCallback !== null) {
					this._onStartCallback(this._object);
				}
	
				this._onStartCallbackFired = true;
			}
	
			elapsed = (time - this._startTime) / this._duration;
			elapsed = (this._duration === 0 || elapsed > 1) ? 1 : elapsed;
	
			value = this._easingFunction(elapsed);
	
			for (property in this._valuesEnd) {
	
				// Don't update properties that do not exist in the source object
				if (this._valuesStart[property] === undefined) {
					continue;
				}
	
				var start = this._valuesStart[property] || 0;
				var end = this._valuesEnd[property];
	
				if (end instanceof Array) {
	
					this._object[property] = this._interpolationFunction(end, value);
	
				} else {
	
					// Parses relative end values with start as base (e.g.: +10, -3)
					if (typeof (end) === 'string') {
	
						if (end.charAt(0) === '+' || end.charAt(0) === '-') {
							end = start + parseFloat(end);
						} else {
							end = parseFloat(end);
						}
					}
	
					// Protect against non numeric properties.
					if (typeof (end) === 'number') {
						this._object[property] = start + (end - start) * value;
					}
	
				}
	
			}
	
			if (this._onUpdateCallback !== null) {
				this._onUpdateCallback(this._object);
			}
	
			if (elapsed === 1) {
	
				if (this._repeat > 0) {
	
					if (isFinite(this._repeat)) {
						this._repeat--;
					}
	
					// Reassign starting values, restart by making startTime = now
					for (property in this._valuesStartRepeat) {
	
						if (typeof (this._valuesEnd[property]) === 'string') {
							this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
						}
	
						if (this._yoyo) {
							var tmp = this._valuesStartRepeat[property];
	
							this._valuesStartRepeat[property] = this._valuesEnd[property];
							this._valuesEnd[property] = tmp;
						}
	
						this._valuesStart[property] = this._valuesStartRepeat[property];
	
					}
	
					if (this._yoyo) {
						this._reversed = !this._reversed;
					}
	
					if (this._repeatDelayTime !== undefined) {
						this._startTime = time + this._repeatDelayTime;
					} else {
						this._startTime = time + this._delayTime;
					}
	
					return true;
	
				} else {
	
					if (this._onCompleteCallback !== null) {
	
						this._onCompleteCallback(this._object);
					}
	
					for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
						// Make the chained tweens start exactly at the time they should,
						// even if the `update()` method was called way past the duration of the tween
						this._chainedTweens[i].start(this._startTime + this._duration);
					}
	
					return false;
	
				}
	
			}
	
			return true;
	
		}
	};
	
	
	TWEEN.Easing = {
	
		Linear: {
	
			None: function (k) {
	
				return k;
	
			}
	
		},
	
		Quadratic: {
	
			In: function (k) {
	
				return k * k;
	
			},
	
			Out: function (k) {
	
				return k * (2 - k);
	
			},
	
			InOut: function (k) {
	
				if ((k *= 2) < 1) {
					return 0.5 * k * k;
				}
	
				return - 0.5 * (--k * (k - 2) - 1);
	
			}
	
		},
	
		Cubic: {
	
			In: function (k) {
	
				return k * k * k;
	
			},
	
			Out: function (k) {
	
				return --k * k * k + 1;
	
			},
	
			InOut: function (k) {
	
				if ((k *= 2) < 1) {
					return 0.5 * k * k * k;
				}
	
				return 0.5 * ((k -= 2) * k * k + 2);
	
			}
	
		},
	
		Quartic: {
	
			In: function (k) {
	
				return k * k * k * k;
	
			},
	
			Out: function (k) {
	
				return 1 - (--k * k * k * k);
	
			},
	
			InOut: function (k) {
	
				if ((k *= 2) < 1) {
					return 0.5 * k * k * k * k;
				}
	
				return - 0.5 * ((k -= 2) * k * k * k - 2);
	
			}
	
		},
	
		Quintic: {
	
			In: function (k) {
	
				return k * k * k * k * k;
	
			},
	
			Out: function (k) {
	
				return --k * k * k * k * k + 1;
	
			},
	
			InOut: function (k) {
	
				if ((k *= 2) < 1) {
					return 0.5 * k * k * k * k * k;
				}
	
				return 0.5 * ((k -= 2) * k * k * k * k + 2);
	
			}
	
		},
	
		Sinusoidal: {
	
			In: function (k) {
	
				return 1 - Math.cos(k * Math.PI / 2);
	
			},
	
			Out: function (k) {
	
				return Math.sin(k * Math.PI / 2);
	
			},
	
			InOut: function (k) {
	
				return 0.5 * (1 - Math.cos(Math.PI * k));
	
			}
	
		},
	
		Exponential: {
	
			In: function (k) {
	
				return k === 0 ? 0 : Math.pow(1024, k - 1);
	
			},
	
			Out: function (k) {
	
				return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);
	
			},
	
			InOut: function (k) {
	
				if (k === 0) {
					return 0;
				}
	
				if (k === 1) {
					return 1;
				}
	
				if ((k *= 2) < 1) {
					return 0.5 * Math.pow(1024, k - 1);
				}
	
				return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);
	
			}
	
		},
	
		Circular: {
	
			In: function (k) {
	
				return 1 - Math.sqrt(1 - k * k);
	
			},
	
			Out: function (k) {
	
				return Math.sqrt(1 - (--k * k));
	
			},
	
			InOut: function (k) {
	
				if ((k *= 2) < 1) {
					return - 0.5 * (Math.sqrt(1 - k * k) - 1);
				}
	
				return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
	
			}
	
		},
	
		Elastic: {
	
			In: function (k) {
	
				if (k === 0) {
					return 0;
				}
	
				if (k === 1) {
					return 1;
				}
	
				return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
	
			},
	
			Out: function (k) {
	
				if (k === 0) {
					return 0;
				}
	
				if (k === 1) {
					return 1;
				}
	
				return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
	
			},
	
			InOut: function (k) {
	
				if (k === 0) {
					return 0;
				}
	
				if (k === 1) {
					return 1;
				}
	
				k *= 2;
	
				if (k < 1) {
					return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
				}
	
				return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;
	
			}
	
		},
	
		Back: {
	
			In: function (k) {
	
				var s = 1.70158;
	
				return k * k * ((s + 1) * k - s);
	
			},
	
			Out: function (k) {
	
				var s = 1.70158;
	
				return --k * k * ((s + 1) * k + s) + 1;
	
			},
	
			InOut: function (k) {
	
				var s = 1.70158 * 1.525;
	
				if ((k *= 2) < 1) {
					return 0.5 * (k * k * ((s + 1) * k - s));
				}
	
				return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
	
			}
	
		},
	
		Bounce: {
	
			In: function (k) {
	
				return 1 - TWEEN.Easing.Bounce.Out(1 - k);
	
			},
	
			Out: function (k) {
	
				if (k < (1 / 2.75)) {
					return 7.5625 * k * k;
				} else if (k < (2 / 2.75)) {
					return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
				} else if (k < (2.5 / 2.75)) {
					return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
				} else {
					return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
				}
	
			},
	
			InOut: function (k) {
	
				if (k < 0.5) {
					return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
				}
	
				return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
	
			}
	
		}
	
	};
	
	TWEEN.Interpolation = {
	
		Linear: function (v, k) {
	
			var m = v.length - 1;
			var f = m * k;
			var i = Math.floor(f);
			var fn = TWEEN.Interpolation.Utils.Linear;
	
			if (k < 0) {
				return fn(v[0], v[1], f);
			}
	
			if (k > 1) {
				return fn(v[m], v[m - 1], m - f);
			}
	
			return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
	
		},
	
		Bezier: function (v, k) {
	
			var b = 0;
			var n = v.length - 1;
			var pw = Math.pow;
			var bn = TWEEN.Interpolation.Utils.Bernstein;
	
			for (var i = 0; i <= n; i++) {
				b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
			}
	
			return b;
	
		},
	
		CatmullRom: function (v, k) {
	
			var m = v.length - 1;
			var f = m * k;
			var i = Math.floor(f);
			var fn = TWEEN.Interpolation.Utils.CatmullRom;
	
			if (v[0] === v[m]) {
	
				if (k < 0) {
					i = Math.floor(f = m * (1 + k));
				}
	
				return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
	
			} else {
	
				if (k < 0) {
					return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
				}
	
				if (k > 1) {
					return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
				}
	
				return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
	
			}
	
		},
	
		Utils: {
	
			Linear: function (p0, p1, t) {
	
				return (p1 - p0) * t + p0;
	
			},
	
			Bernstein: function (n, i) {
	
				var fc = TWEEN.Interpolation.Utils.Factorial;
	
				return fc(n) / fc(i) / fc(n - i);
	
			},
	
			Factorial: (function () {
	
				var a = [1];
	
				return function (n) {
	
					var s = 1;
	
					if (a[n]) {
						return a[n];
					}
	
					for (var i = n; i > 1; i--) {
						s *= i;
					}
	
					a[n] = s;
					return s;
	
				};
	
			})(),
	
			CatmullRom: function (p0, p1, p2, p3, t) {
	
				var v0 = (p2 - p0) * 0.5;
				var v1 = (p3 - p1) * 0.5;
				var t2 = t * t;
				var t3 = t * t2;
	
				return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
	
			}
	
		}
	
	};
	
	// UMD (Universal Module Definition)
	(function (root) {
	
		if (true) {
	
			// AMD
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
				return TWEEN;
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	
		} else if (typeof module !== 'undefined' && typeof exports === 'object') {
	
			// Node.js
			module.exports = TWEEN;
	
		} else if (root !== undefined) {
	
			// Global variable
			root.TWEEN = TWEEN;
	
		}
	
	})(this);
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(46)))

/***/ }),

/***/ 738:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var utils = __webpack_require__(739);
	
	module.exports = function batchProcessorMaker(options) {
	    options             = options || {};
	    var reporter        = options.reporter;
	    var asyncProcess    = utils.getOption(options, "async", true);
	    var autoProcess     = utils.getOption(options, "auto", true);
	
	    if(autoProcess && !asyncProcess) {
	        reporter && reporter.warn("Invalid options combination. auto=true and async=false is invalid. Setting async=true.");
	        asyncProcess = true;
	    }
	
	    var batch = Batch();
	    var asyncFrameHandler;
	    var isProcessing = false;
	
	    function addFunction(level, fn) {
	        if(!isProcessing && autoProcess && asyncProcess && batch.size() === 0) {
	            // Since this is async, it is guaranteed to be executed after that the fn is added to the batch.
	            // This needs to be done before, since we're checking the size of the batch to be 0.
	            processBatchAsync();
	        }
	
	        batch.add(level, fn);
	    }
	
	    function processBatch() {
	        // Save the current batch, and create a new batch so that incoming functions are not added into the currently processing batch.
	        // Continue processing until the top-level batch is empty (functions may be added to the new batch while processing, and so on).
	        isProcessing = true;
	        while (batch.size()) {
	            var processingBatch = batch;
	            batch = Batch();
	            processingBatch.process();
	        }
	        isProcessing = false;
	    }
	
	    function forceProcessBatch(localAsyncProcess) {
	        if (isProcessing) {
	            return;
	        }
	
	        if(localAsyncProcess === undefined) {
	            localAsyncProcess = asyncProcess;
	        }
	
	        if(asyncFrameHandler) {
	            cancelFrame(asyncFrameHandler);
	            asyncFrameHandler = null;
	        }
	
	        if(localAsyncProcess) {
	            processBatchAsync();
	        } else {
	            processBatch();
	        }
	    }
	
	    function processBatchAsync() {
	        asyncFrameHandler = requestFrame(processBatch);
	    }
	
	    function clearBatch() {
	        batch           = {};
	        batchSize       = 0;
	        topLevel        = 0;
	        bottomLevel     = 0;
	    }
	
	    function cancelFrame(listener) {
	        // var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout;
	        var cancel = clearTimeout;
	        return cancel(listener);
	    }
	
	    function requestFrame(callback) {
	        // var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(fn) { return window.setTimeout(fn, 20); };
	        var raf = function(fn) { return setTimeout(fn, 0); };
	        return raf(callback);
	    }
	
	    return {
	        add: addFunction,
	        force: forceProcessBatch
	    };
	};
	
	function Batch() {
	    var batch       = {};
	    var size        = 0;
	    var topLevel    = 0;
	    var bottomLevel = 0;
	
	    function add(level, fn) {
	        if(!fn) {
	            fn = level;
	            level = 0;
	        }
	
	        if(level > topLevel) {
	            topLevel = level;
	        } else if(level < bottomLevel) {
	            bottomLevel = level;
	        }
	
	        if(!batch[level]) {
	            batch[level] = [];
	        }
	
	        batch[level].push(fn);
	        size++;
	    }
	
	    function process() {
	        for(var level = bottomLevel; level <= topLevel; level++) {
	            var fns = batch[level];
	
	            for(var i = 0; i < fns.length; i++) {
	                var fn = fns[i];
	                fn();
	            }
	        }
	    }
	
	    function getSize() {
	        return size;
	    }
	
	    return {
	        add: add,
	        process: process,
	        size: getSize
	    };
	}


/***/ }),

/***/ 739:
/***/ (function(module, exports) {

	"use strict";
	
	var utils = module.exports = {};
	
	utils.getOption = getOption;
	
	function getOption(options, name, defaultValue) {
	    var value = options[name];
	
	    if((value === undefined || value === null) && defaultValue !== undefined) {
	        return defaultValue;
	    }
	
	    return value;
	}


/***/ }),

/***/ 747:
/***/ (function(module, exports, __webpack_require__) {

	/*!
	 * Bowser - a browser detector
	 * https://github.com/ded/bowser
	 * MIT License | (c) Dustin Diaz 2015
	 */
	
	!function (root, name, definition) {
	  if (typeof module != 'undefined' && module.exports) module.exports = definition()
	  else if (true) __webpack_require__(902)(name, definition)
	  else root[name] = definition()
	}(this, 'bowser', function () {
	  /**
	    * See useragents.js for examples of navigator.userAgent
	    */
	
	  var t = true
	
	  function detect(ua) {
	
	    function getFirstMatch(regex) {
	      var match = ua.match(regex);
	      return (match && match.length > 1 && match[1]) || '';
	    }
	
	    function getSecondMatch(regex) {
	      var match = ua.match(regex);
	      return (match && match.length > 1 && match[2]) || '';
	    }
	
	    var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase()
	      , likeAndroid = /like android/i.test(ua)
	      , android = !likeAndroid && /android/i.test(ua)
	      , nexusMobile = /nexus\s*[0-6]\s*/i.test(ua)
	      , nexusTablet = !nexusMobile && /nexus\s*[0-9]+/i.test(ua)
	      , chromeos = /CrOS/.test(ua)
	      , silk = /silk/i.test(ua)
	      , sailfish = /sailfish/i.test(ua)
	      , tizen = /tizen/i.test(ua)
	      , webos = /(web|hpw)(o|0)s/i.test(ua)
	      , windowsphone = /windows phone/i.test(ua)
	      , samsungBrowser = /SamsungBrowser/i.test(ua)
	      , windows = !windowsphone && /windows/i.test(ua)
	      , mac = !iosdevice && !silk && /macintosh/i.test(ua)
	      , linux = !android && !sailfish && !tizen && !webos && /linux/i.test(ua)
	      , edgeVersion = getSecondMatch(/edg([ea]|ios)\/(\d+(\.\d+)?)/i)
	      , versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i)
	      , tablet = /tablet/i.test(ua) && !/tablet pc/i.test(ua)
	      , mobile = !tablet && /[^-]mobi/i.test(ua)
	      , xbox = /xbox/i.test(ua)
	      , result
	
	    if (/opera/i.test(ua)) {
	      //  an old Opera
	      result = {
	        name: 'Opera'
	      , opera: t
	      , version: versionIdentifier || getFirstMatch(/(?:opera|opr|opios)[\s\/](\d+(\.\d+)?)/i)
	      }
	    } else if (/opr\/|opios/i.test(ua)) {
	      // a new Opera
	      result = {
	        name: 'Opera'
	        , opera: t
	        , version: getFirstMatch(/(?:opr|opios)[\s\/](\d+(\.\d+)?)/i) || versionIdentifier
	      }
	    }
	    else if (/SamsungBrowser/i.test(ua)) {
	      result = {
	        name: 'Samsung Internet for Android'
	        , samsungBrowser: t
	        , version: versionIdentifier || getFirstMatch(/(?:SamsungBrowser)[\s\/](\d+(\.\d+)?)/i)
	      }
	    }
	    else if (/Whale/i.test(ua)) {
	      result = {
	        name: 'NAVER Whale browser'
	        , whale: t
	        , version: getFirstMatch(/(?:whale)[\s\/](\d+(?:\.\d+)+)/i)
	      }
	    }
	    else if (/MZBrowser/i.test(ua)) {
	      result = {
	        name: 'MZ Browser'
	        , mzbrowser: t
	        , version: getFirstMatch(/(?:MZBrowser)[\s\/](\d+(?:\.\d+)+)/i)
	      }
	    }
	    else if (/coast/i.test(ua)) {
	      result = {
	        name: 'Opera Coast'
	        , coast: t
	        , version: versionIdentifier || getFirstMatch(/(?:coast)[\s\/](\d+(\.\d+)?)/i)
	      }
	    }
	    else if (/focus/i.test(ua)) {
	      result = {
	        name: 'Focus'
	        , focus: t
	        , version: getFirstMatch(/(?:focus)[\s\/](\d+(?:\.\d+)+)/i)
	      }
	    }
	    else if (/yabrowser/i.test(ua)) {
	      result = {
	        name: 'Yandex Browser'
	      , yandexbrowser: t
	      , version: versionIdentifier || getFirstMatch(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i)
	      }
	    }
	    else if (/ucbrowser/i.test(ua)) {
	      result = {
	          name: 'UC Browser'
	        , ucbrowser: t
	        , version: getFirstMatch(/(?:ucbrowser)[\s\/](\d+(?:\.\d+)+)/i)
	      }
	    }
	    else if (/mxios/i.test(ua)) {
	      result = {
	        name: 'Maxthon'
	        , maxthon: t
	        , version: getFirstMatch(/(?:mxios)[\s\/](\d+(?:\.\d+)+)/i)
	      }
	    }
	    else if (/epiphany/i.test(ua)) {
	      result = {
	        name: 'Epiphany'
	        , epiphany: t
	        , version: getFirstMatch(/(?:epiphany)[\s\/](\d+(?:\.\d+)+)/i)
	      }
	    }
	    else if (/puffin/i.test(ua)) {
	      result = {
	        name: 'Puffin'
	        , puffin: t
	        , version: getFirstMatch(/(?:puffin)[\s\/](\d+(?:\.\d+)?)/i)
	      }
	    }
	    else if (/sleipnir/i.test(ua)) {
	      result = {
	        name: 'Sleipnir'
	        , sleipnir: t
	        , version: getFirstMatch(/(?:sleipnir)[\s\/](\d+(?:\.\d+)+)/i)
	      }
	    }
	    else if (/k-meleon/i.test(ua)) {
	      result = {
	        name: 'K-Meleon'
	        , kMeleon: t
	        , version: getFirstMatch(/(?:k-meleon)[\s\/](\d+(?:\.\d+)+)/i)
	      }
	    }
	    else if (windowsphone) {
	      result = {
	        name: 'Windows Phone'
	      , osname: 'Windows Phone'
	      , windowsphone: t
	      }
	      if (edgeVersion) {
	        result.msedge = t
	        result.version = edgeVersion
	      }
	      else {
	        result.msie = t
	        result.version = getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
	      }
	    }
	    else if (/msie|trident/i.test(ua)) {
	      result = {
	        name: 'Internet Explorer'
	      , msie: t
	      , version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
	      }
	    } else if (chromeos) {
	      result = {
	        name: 'Chrome'
	      , osname: 'Chrome OS'
	      , chromeos: t
	      , chromeBook: t
	      , chrome: t
	      , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
	      }
	    } else if (/edg([ea]|ios)/i.test(ua)) {
	      result = {
	        name: 'Microsoft Edge'
	      , msedge: t
	      , version: edgeVersion
	      }
	    }
	    else if (/vivaldi/i.test(ua)) {
	      result = {
	        name: 'Vivaldi'
	        , vivaldi: t
	        , version: getFirstMatch(/vivaldi\/(\d+(\.\d+)?)/i) || versionIdentifier
	      }
	    }
	    else if (sailfish) {
	      result = {
	        name: 'Sailfish'
	      , osname: 'Sailfish OS'
	      , sailfish: t
	      , version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
	      }
	    }
	    else if (/seamonkey\//i.test(ua)) {
	      result = {
	        name: 'SeaMonkey'
	      , seamonkey: t
	      , version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
	      }
	    }
	    else if (/firefox|iceweasel|fxios/i.test(ua)) {
	      result = {
	        name: 'Firefox'
	      , firefox: t
	      , version: getFirstMatch(/(?:firefox|iceweasel|fxios)[ \/](\d+(\.\d+)?)/i)
	      }
	      if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
	        result.firefoxos = t
	        result.osname = 'Firefox OS'
	      }
	    }
	    else if (silk) {
	      result =  {
	        name: 'Amazon Silk'
	      , silk: t
	      , version : getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
	      }
	    }
	    else if (/phantom/i.test(ua)) {
	      result = {
	        name: 'PhantomJS'
	      , phantom: t
	      , version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
	      }
	    }
	    else if (/slimerjs/i.test(ua)) {
	      result = {
	        name: 'SlimerJS'
	        , slimer: t
	        , version: getFirstMatch(/slimerjs\/(\d+(\.\d+)?)/i)
	      }
	    }
	    else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
	      result = {
	        name: 'BlackBerry'
	      , osname: 'BlackBerry OS'
	      , blackberry: t
	      , version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
	      }
	    }
	    else if (webos) {
	      result = {
	        name: 'WebOS'
	      , osname: 'WebOS'
	      , webos: t
	      , version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
	      };
	      /touchpad\//i.test(ua) && (result.touchpad = t)
	    }
	    else if (/bada/i.test(ua)) {
	      result = {
	        name: 'Bada'
	      , osname: 'Bada'
	      , bada: t
	      , version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
	      };
	    }
	    else if (tizen) {
	      result = {
	        name: 'Tizen'
	      , osname: 'Tizen'
	      , tizen: t
	      , version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
	      };
	    }
	    else if (/qupzilla/i.test(ua)) {
	      result = {
	        name: 'QupZilla'
	        , qupzilla: t
	        , version: getFirstMatch(/(?:qupzilla)[\s\/](\d+(?:\.\d+)+)/i) || versionIdentifier
	      }
	    }
	    else if (/chromium/i.test(ua)) {
	      result = {
	        name: 'Chromium'
	        , chromium: t
	        , version: getFirstMatch(/(?:chromium)[\s\/](\d+(?:\.\d+)?)/i) || versionIdentifier
	      }
	    }
	    else if (/chrome|crios|crmo/i.test(ua)) {
	      result = {
	        name: 'Chrome'
	        , chrome: t
	        , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
	      }
	    }
	    else if (android) {
	      result = {
	        name: 'Android'
	        , version: versionIdentifier
	      }
	    }
	    else if (/safari|applewebkit/i.test(ua)) {
	      result = {
	        name: 'Safari'
	      , safari: t
	      }
	      if (versionIdentifier) {
	        result.version = versionIdentifier
	      }
	    }
	    else if (iosdevice) {
	      result = {
	        name : iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod'
	      }
	      // WTF: version is not part of user agent in web apps
	      if (versionIdentifier) {
	        result.version = versionIdentifier
	      }
	    }
	    else if(/googlebot/i.test(ua)) {
	      result = {
	        name: 'Googlebot'
	      , googlebot: t
	      , version: getFirstMatch(/googlebot\/(\d+(\.\d+))/i) || versionIdentifier
	      }
	    }
	    else {
	      result = {
	        name: getFirstMatch(/^(.*)\/(.*) /),
	        version: getSecondMatch(/^(.*)\/(.*) /)
	     };
	   }
	
	    // set webkit or gecko flag for browsers based on these engines
	    if (!result.msedge && /(apple)?webkit/i.test(ua)) {
	      if (/(apple)?webkit\/537\.36/i.test(ua)) {
	        result.name = result.name || "Blink"
	        result.blink = t
	      } else {
	        result.name = result.name || "Webkit"
	        result.webkit = t
	      }
	      if (!result.version && versionIdentifier) {
	        result.version = versionIdentifier
	      }
	    } else if (!result.opera && /gecko\//i.test(ua)) {
	      result.name = result.name || "Gecko"
	      result.gecko = t
	      result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i)
	    }
	
	    // set OS flags for platforms that have multiple browsers
	    if (!result.windowsphone && (android || result.silk)) {
	      result.android = t
	      result.osname = 'Android'
	    } else if (!result.windowsphone && iosdevice) {
	      result[iosdevice] = t
	      result.ios = t
	      result.osname = 'iOS'
	    } else if (mac) {
	      result.mac = t
	      result.osname = 'macOS'
	    } else if (xbox) {
	      result.xbox = t
	      result.osname = 'Xbox'
	    } else if (windows) {
	      result.windows = t
	      result.osname = 'Windows'
	    } else if (linux) {
	      result.linux = t
	      result.osname = 'Linux'
	    }
	
	    function getWindowsVersion (s) {
	      switch (s) {
	        case 'NT': return 'NT'
	        case 'XP': return 'XP'
	        case 'NT 5.0': return '2000'
	        case 'NT 5.1': return 'XP'
	        case 'NT 5.2': return '2003'
	        case 'NT 6.0': return 'Vista'
	        case 'NT 6.1': return '7'
	        case 'NT 6.2': return '8'
	        case 'NT 6.3': return '8.1'
	        case 'NT 10.0': return '10'
	        default: return undefined
	      }
	    }
	
	    // OS version extraction
	    var osVersion = '';
	    if (result.windows) {
	      osVersion = getWindowsVersion(getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i))
	    } else if (result.windowsphone) {
	      osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
	    } else if (result.mac) {
	      osVersion = getFirstMatch(/Mac OS X (\d+([_\.\s]\d+)*)/i);
	      osVersion = osVersion.replace(/[_\s]/g, '.');
	    } else if (iosdevice) {
	      osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
	      osVersion = osVersion.replace(/[_\s]/g, '.');
	    } else if (android) {
	      osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
	    } else if (result.webos) {
	      osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
	    } else if (result.blackberry) {
	      osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
	    } else if (result.bada) {
	      osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
	    } else if (result.tizen) {
	      osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
	    }
	    if (osVersion) {
	      result.osversion = osVersion;
	    }
	
	    // device type extraction
	    var osMajorVersion = !result.windows && osVersion.split('.')[0];
	    if (
	         tablet
	      || nexusTablet
	      || iosdevice == 'ipad'
	      || (android && (osMajorVersion == 3 || (osMajorVersion >= 4 && !mobile)))
	      || result.silk
	    ) {
	      result.tablet = t
	    } else if (
	         mobile
	      || iosdevice == 'iphone'
	      || iosdevice == 'ipod'
	      || android
	      || nexusMobile
	      || result.blackberry
	      || result.webos
	      || result.bada
	    ) {
	      result.mobile = t
	    }
	
	    // Graded Browser Support
	    // http://developer.yahoo.com/yui/articles/gbs
	    if (result.msedge ||
	        (result.msie && result.version >= 10) ||
	        (result.yandexbrowser && result.version >= 15) ||
			    (result.vivaldi && result.version >= 1.0) ||
	        (result.chrome && result.version >= 20) ||
	        (result.samsungBrowser && result.version >= 4) ||
	        (result.whale && compareVersions([result.version, '1.0']) === 1) ||
	        (result.mzbrowser && compareVersions([result.version, '6.0']) === 1) ||
	        (result.focus && compareVersions([result.version, '1.0']) === 1) ||
	        (result.firefox && result.version >= 20.0) ||
	        (result.safari && result.version >= 6) ||
	        (result.opera && result.version >= 10.0) ||
	        (result.ios && result.osversion && result.osversion.split(".")[0] >= 6) ||
	        (result.blackberry && result.version >= 10.1)
	        || (result.chromium && result.version >= 20)
	        ) {
	      result.a = t;
	    }
	    else if ((result.msie && result.version < 10) ||
	        (result.chrome && result.version < 20) ||
	        (result.firefox && result.version < 20.0) ||
	        (result.safari && result.version < 6) ||
	        (result.opera && result.version < 10.0) ||
	        (result.ios && result.osversion && result.osversion.split(".")[0] < 6)
	        || (result.chromium && result.version < 20)
	        ) {
	      result.c = t
	    } else result.x = t
	
	    return result
	  }
	
	  var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent || '' : '')
	
	  bowser.test = function (browserList) {
	    for (var i = 0; i < browserList.length; ++i) {
	      var browserItem = browserList[i];
	      if (typeof browserItem=== 'string') {
	        if (browserItem in bowser) {
	          return true;
	        }
	      }
	    }
	    return false;
	  }
	
	  /**
	   * Get version precisions count
	   *
	   * @example
	   *   getVersionPrecision("1.10.3") // 3
	   *
	   * @param  {string} version
	   * @return {number}
	   */
	  function getVersionPrecision(version) {
	    return version.split(".").length;
	  }
	
	  /**
	   * Array::map polyfill
	   *
	   * @param  {Array} arr
	   * @param  {Function} iterator
	   * @return {Array}
	   */
	  function map(arr, iterator) {
	    var result = [], i;
	    if (Array.prototype.map) {
	      return Array.prototype.map.call(arr, iterator);
	    }
	    for (i = 0; i < arr.length; i++) {
	      result.push(iterator(arr[i]));
	    }
	    return result;
	  }
	
	  /**
	   * Calculate browser version weight
	   *
	   * @example
	   *   compareVersions(['1.10.2.1',  '1.8.2.1.90'])    // 1
	   *   compareVersions(['1.010.2.1', '1.09.2.1.90']);  // 1
	   *   compareVersions(['1.10.2.1',  '1.10.2.1']);     // 0
	   *   compareVersions(['1.10.2.1',  '1.0800.2']);     // -1
	   *
	   * @param  {Array<String>} versions versions to compare
	   * @return {Number} comparison result
	   */
	  function compareVersions(versions) {
	    // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
	    var precision = Math.max(getVersionPrecision(versions[0]), getVersionPrecision(versions[1]));
	    var chunks = map(versions, function (version) {
	      var delta = precision - getVersionPrecision(version);
	
	      // 2) "9" -> "9.0" (for precision = 2)
	      version = version + new Array(delta + 1).join(".0");
	
	      // 3) "9.0" -> ["000000000"", "000000009"]
	      return map(version.split("."), function (chunk) {
	        return new Array(20 - chunk.length).join("0") + chunk;
	      }).reverse();
	    });
	
	    // iterate in reverse order by reversed chunks array
	    while (--precision >= 0) {
	      // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
	      if (chunks[0][precision] > chunks[1][precision]) {
	        return 1;
	      }
	      else if (chunks[0][precision] === chunks[1][precision]) {
	        if (precision === 0) {
	          // all version chunks are same
	          return 0;
	        }
	      }
	      else {
	        return -1;
	      }
	    }
	  }
	
	  /**
	   * Check if browser is unsupported
	   *
	   * @example
	   *   bowser.isUnsupportedBrowser({
	   *     msie: "10",
	   *     firefox: "23",
	   *     chrome: "29",
	   *     safari: "5.1",
	   *     opera: "16",
	   *     phantom: "534"
	   *   });
	   *
	   * @param  {Object}  minVersions map of minimal version to browser
	   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
	   * @param  {String}  [ua] user agent string
	   * @return {Boolean}
	   */
	  function isUnsupportedBrowser(minVersions, strictMode, ua) {
	    var _bowser = bowser;
	
	    // make strictMode param optional with ua param usage
	    if (typeof strictMode === 'string') {
	      ua = strictMode;
	      strictMode = void(0);
	    }
	
	    if (strictMode === void(0)) {
	      strictMode = false;
	    }
	    if (ua) {
	      _bowser = detect(ua);
	    }
	
	    var version = "" + _bowser.version;
	    for (var browser in minVersions) {
	      if (minVersions.hasOwnProperty(browser)) {
	        if (_bowser[browser]) {
	          if (typeof minVersions[browser] !== 'string') {
	            throw new Error('Browser version in the minVersion map should be a string: ' + browser + ': ' + String(minVersions));
	          }
	
	          // browser version and min supported version.
	          return compareVersions([version, minVersions[browser]]) < 0;
	        }
	      }
	    }
	
	    return strictMode; // not found
	  }
	
	  /**
	   * Check if browser is supported
	   *
	   * @param  {Object} minVersions map of minimal version to browser
	   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
	   * @param  {String}  [ua] user agent string
	   * @return {Boolean}
	   */
	  function check(minVersions, strictMode, ua) {
	    return !isUnsupportedBrowser(minVersions, strictMode, ua);
	  }
	
	  bowser.isUnsupportedBrowser = isUnsupportedBrowser;
	  bowser.compareVersions = compareVersions;
	  bowser.check = check;
	
	  /*
	   * Set our detect method to the main bowser object so we can
	   * reuse it to test other user agents.
	   * This is needed to implement future tests.
	   */
	  bowser._detect = detect;
	
	  /*
	   * Set our detect public method to the main bowser object
	   * This is needed to implement bowser in server side
	   */
	  bowser.detect = detect;
	  return bowser
	});


/***/ }),

/***/ 573:
/***/ (function(module, exports) {

	"use strict";
	
	var detector = module.exports = {};
	
	detector.isIE = function(version) {
	    function isAnyIeVersion() {
	        var agent = navigator.userAgent.toLowerCase();
	        return agent.indexOf("msie") !== -1 || agent.indexOf("trident") !== -1 || agent.indexOf(" edge/") !== -1;
	    }
	
	    if(!isAnyIeVersion()) {
	        return false;
	    }
	
	    if(!version) {
	        return true;
	    }
	
	    //Shamelessly stolen from https://gist.github.com/padolsey/527683
	    var ieVersion = (function(){
	        var undef,
	            v = 3,
	            div = document.createElement("div"),
	            all = div.getElementsByTagName("i");
	
	        do {
	            div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->";
	        }
	        while (all[0]);
	
	        return v > 4 ? v : undef;
	    }());
	
	    return version === ieVersion;
	};
	
	detector.isLegacyOpera = function() {
	    return !!window.opera;
	};


/***/ }),

/***/ 574:
/***/ (function(module, exports) {

	"use strict";
	
	var utils = module.exports = {};
	
	/**
	 * Loops through the collection and calls the callback for each element. if the callback returns truthy, the loop is broken and returns the same value.
	 * @public
	 * @param {*} collection The collection to loop through. Needs to have a length property set and have indices set from 0 to length - 1.
	 * @param {function} callback The callback to be called for each element. The element will be given as a parameter to the callback. If this callback returns truthy, the loop is broken and the same value is returned.
	 * @returns {*} The value that a callback has returned (if truthy). Otherwise nothing.
	 */
	utils.forEach = function(collection, callback) {
	    for(var i = 0; i < collection.length; i++) {
	        var result = callback(collection[i]);
	        if(result) {
	            return result;
	        }
	    }
	};


/***/ }),

/***/ 847:
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Resize detection strategy that injects objects to elements in order to detect resize events.
	 * Heavily inspired by: http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
	 */
	
	"use strict";
	
	var browserDetector = __webpack_require__(573);
	
	module.exports = function(options) {
	    options             = options || {};
	    var reporter        = options.reporter;
	    var batchProcessor  = options.batchProcessor;
	    var getState        = options.stateHandler.getState;
	
	    if(!reporter) {
	        throw new Error("Missing required dependency: reporter.");
	    }
	
	    /**
	     * Adds a resize event listener to the element.
	     * @public
	     * @param {element} element The element that should have the listener added.
	     * @param {function} listener The listener callback to be called for each resize event of the element. The element will be given as a parameter to the listener callback.
	     */
	    function addListener(element, listener) {
	        if(!getObject(element)) {
	            throw new Error("Element is not detectable by this strategy.");
	        }
	
	        function listenerProxy() {
	            listener(element);
	        }
	
	        if(browserDetector.isIE(8)) {
	            //IE 8 does not support object, but supports the resize event directly on elements.
	            getState(element).object = {
	                proxy: listenerProxy
	            };
	            element.attachEvent("onresize", listenerProxy);
	        } else {
	            var object = getObject(element);
	            object.contentDocument.defaultView.addEventListener("resize", listenerProxy);
	        }
	    }
	
	    /**
	     * Makes an element detectable and ready to be listened for resize events. Will call the callback when the element is ready to be listened for resize changes.
	     * @private
	     * @param {object} options Optional options object.
	     * @param {element} element The element to make detectable
	     * @param {function} callback The callback to be called when the element is ready to be listened for resize changes. Will be called with the element as first parameter.
	     */
	    function makeDetectable(options, element, callback) {
	        if (!callback) {
	            callback = element;
	            element = options;
	            options = null;
	        }
	
	        options = options || {};
	        var debug = options.debug;
	
	        function injectObject(element, callback) {
	            var OBJECT_STYLE = "display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; padding: 0; margin: 0; opacity: 0; z-index: -1000; pointer-events: none;";
	
	            //The target element needs to be positioned (everything except static) so the absolute positioned object will be positioned relative to the target element.
	
	            // Position altering may be performed directly or on object load, depending on if style resolution is possible directly or not.
	            var positionCheckPerformed = false;
	
	            // The element may not yet be attached to the DOM, and therefore the style object may be empty in some browsers.
	            // Since the style object is a reference, it will be updated as soon as the element is attached to the DOM.
	            var style = window.getComputedStyle(element);
	            var width = element.offsetWidth;
	            var height = element.offsetHeight;
	
	            getState(element).startSize = {
	                width: width,
	                height: height
	            };
	
	            function mutateDom() {
	                function alterPositionStyles() {
	                    if(style.position === "static") {
	                        element.style.position = "relative";
	
	                        var removeRelativeStyles = function(reporter, element, style, property) {
	                            function getNumericalValue(value) {
	                                return value.replace(/[^-\d\.]/g, "");
	                            }
	
	                            var value = style[property];
	
	                            if(value !== "auto" && getNumericalValue(value) !== "0") {
	                                reporter.warn("An element that is positioned static has style." + property + "=" + value + " which is ignored due to the static positioning. The element will need to be positioned relative, so the style." + property + " will be set to 0. Element: ", element);
	                                element.style[property] = 0;
	                            }
	                        };
	
	                        //Check so that there are no accidental styles that will make the element styled differently now that is is relative.
	                        //If there are any, set them to 0 (this should be okay with the user since the style properties did nothing before [since the element was positioned static] anyway).
	                        removeRelativeStyles(reporter, element, style, "top");
	                        removeRelativeStyles(reporter, element, style, "right");
	                        removeRelativeStyles(reporter, element, style, "bottom");
	                        removeRelativeStyles(reporter, element, style, "left");
	                    }
	                }
	
	                function onObjectLoad() {
	                    // The object has been loaded, which means that the element now is guaranteed to be attached to the DOM.
	                    if (!positionCheckPerformed) {
	                        alterPositionStyles();
	                    }
	
	                    /*jshint validthis: true */
	
	                    function getDocument(element, callback) {
	                        //Opera 12 seem to call the object.onload before the actual document has been created.
	                        //So if it is not present, poll it with an timeout until it is present.
	                        //TODO: Could maybe be handled better with object.onreadystatechange or similar.
	                        if(!element.contentDocument) {
	                            setTimeout(function checkForObjectDocument() {
	                                getDocument(element, callback);
	                            }, 100);
	
	                            return;
	                        }
	
	                        callback(element.contentDocument);
	                    }
	
	                    //Mutating the object element here seems to fire another load event.
	                    //Mutating the inner document of the object element is fine though.
	                    var objectElement = this;
	
	                    //Create the style element to be added to the object.
	                    getDocument(objectElement, function onObjectDocumentReady(objectDocument) {
	                        //Notify that the element is ready to be listened to.
	                        callback(element);
	                    });
	                }
	
	                // The element may be detached from the DOM, and some browsers does not support style resolving of detached elements.
	                // The alterPositionStyles needs to be delayed until we know the element has been attached to the DOM (which we are sure of when the onObjectLoad has been fired), if style resolution is not possible.
	                if (style.position !== "") {
	                    alterPositionStyles(style);
	                    positionCheckPerformed = true;
	                }
	
	                //Add an object element as a child to the target element that will be listened to for resize events.
	                var object = document.createElement("object");
	                object.style.cssText = OBJECT_STYLE;
	                object.tabIndex = -1;
	                object.type = "text/html";
	                object.onload = onObjectLoad;
	
	                //Safari: This must occur before adding the object to the DOM.
	                //IE: Does not like that this happens before, even if it is also added after.
	                if(!browserDetector.isIE()) {
	                    object.data = "about:blank";
	                }
	
	                element.appendChild(object);
	                getState(element).object = object;
	
	                //IE: This must occur after adding the object to the DOM.
	                if(browserDetector.isIE()) {
	                    object.data = "about:blank";
	                }
	            }
	
	            if(batchProcessor) {
	                batchProcessor.add(mutateDom);
	            } else {
	                mutateDom();
	            }
	        }
	
	        if(browserDetector.isIE(8)) {
	            //IE 8 does not support objects properly. Luckily they do support the resize event.
	            //So do not inject the object and notify that the element is already ready to be listened to.
	            //The event handler for the resize event is attached in the utils.addListener instead.
	            callback(element);
	        } else {
	            injectObject(element, callback);
	        }
	    }
	
	    /**
	     * Returns the child object of the target element.
	     * @private
	     * @param {element} element The target element.
	     * @returns The object element of the target.
	     */
	    function getObject(element) {
	        return getState(element).object;
	    }
	
	    function uninstall(element) {
	        if(browserDetector.isIE(8)) {
	            element.detachEvent("onresize", getState(element).object.proxy);
	        } else {
	            element.removeChild(getObject(element));
	        }
	        delete getState(element).object;
	    }
	
	    return {
	        makeDetectable: makeDetectable,
	        addListener: addListener,
	        uninstall: uninstall
	    };
	};


/***/ }),

/***/ 848:
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Resize detection strategy that injects divs to elements in order to detect resize events on scroll events.
	 * Heavily inspired by: https://github.com/marcj/css-element-queries/blob/master/src/ResizeSensor.js
	 */
	
	"use strict";
	
	var forEach = __webpack_require__(574).forEach;
	
	module.exports = function(options) {
	    options             = options || {};
	    var reporter        = options.reporter;
	    var batchProcessor  = options.batchProcessor;
	    var getState        = options.stateHandler.getState;
	    var hasState        = options.stateHandler.hasState;
	    var idHandler       = options.idHandler;
	
	    if (!batchProcessor) {
	        throw new Error("Missing required dependency: batchProcessor");
	    }
	
	    if (!reporter) {
	        throw new Error("Missing required dependency: reporter.");
	    }
	
	    //TODO: Could this perhaps be done at installation time?
	    var scrollbarSizes = getScrollbarSizes();
	
	    // Inject the scrollbar styling that prevents them from appearing sometimes in Chrome.
	    // The injected container needs to have a class, so that it may be styled with CSS (pseudo elements).
	    var styleId = "erd_scroll_detection_scrollbar_style";
	    var detectionContainerClass = "erd_scroll_detection_container";
	    injectScrollStyle(styleId, detectionContainerClass);
	
	    function getScrollbarSizes() {
	        var width = 500;
	        var height = 500;
	
	        var child = document.createElement("div");
	        child.style.cssText = "position: absolute; width: " + width*2 + "px; height: " + height*2 + "px; visibility: hidden; margin: 0; padding: 0;";
	
	        var container = document.createElement("div");
	        container.style.cssText = "position: absolute; width: " + width + "px; height: " + height + "px; overflow: scroll; visibility: none; top: " + -width*3 + "px; left: " + -height*3 + "px; visibility: hidden; margin: 0; padding: 0;";
	
	        container.appendChild(child);
	
	        document.body.insertBefore(container, document.body.firstChild);
	
	        var widthSize = width - container.clientWidth;
	        var heightSize = height - container.clientHeight;
	
	        document.body.removeChild(container);
	
	        return {
	            width: widthSize,
	            height: heightSize
	        };
	    }
	
	    function injectScrollStyle(styleId, containerClass) {
	        function injectStyle(style, method) {
	            method = method || function (element) {
	                document.head.appendChild(element);
	            };
	
	            var styleElement = document.createElement("style");
	            styleElement.innerHTML = style;
	            styleElement.id = styleId;
	            method(styleElement);
	            return styleElement;
	        }
	
	        if (!document.getElementById(styleId)) {
	            var containerAnimationClass = containerClass + "_animation";
	            var containerAnimationActiveClass = containerClass + "_animation_active";
	            var style = "/* Created by the element-resize-detector library. */\n";
	            style += "." + containerClass + " > div::-webkit-scrollbar { display: none; }\n\n";
	            style += "." + containerAnimationActiveClass + " { -webkit-animation-duration: 0.1s; animation-duration: 0.1s; -webkit-animation-name: " + containerAnimationClass + "; animation-name: " + containerAnimationClass + "; }\n";
	            style += "@-webkit-keyframes " + containerAnimationClass +  " { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }\n";
	            style += "@keyframes " + containerAnimationClass +          " { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }";
	            injectStyle(style);
	        }
	    }
	
	    function addAnimationClass(element) {
	        element.className += " " + detectionContainerClass + "_animation_active";
	    }
	
	    function addEvent(el, name, cb) {
	        if (el.addEventListener) {
	            el.addEventListener(name, cb);
	        } else if(el.attachEvent) {
	            el.attachEvent("on" + name, cb);
	        } else {
	            return reporter.error("[scroll] Don't know how to add event listeners.");
	        }
	    }
	
	    function removeEvent(el, name, cb) {
	        if (el.removeEventListener) {
	            el.removeEventListener(name, cb);
	        } else if(el.detachEvent) {
	            el.detachEvent("on" + name, cb);
	        } else {
	            return reporter.error("[scroll] Don't know how to remove event listeners.");
	        }
	    }
	
	    function getExpandElement(element) {
	        return getState(element).container.childNodes[0].childNodes[0].childNodes[0];
	    }
	
	    function getShrinkElement(element) {
	        return getState(element).container.childNodes[0].childNodes[0].childNodes[1];
	    }
	
	    /**
	     * Adds a resize event listener to the element.
	     * @public
	     * @param {element} element The element that should have the listener added.
	     * @param {function} listener The listener callback to be called for each resize event of the element. The element will be given as a parameter to the listener callback.
	     */
	    function addListener(element, listener) {
	        var listeners = getState(element).listeners;
	
	        if (!listeners.push) {
	            throw new Error("Cannot add listener to an element that is not detectable.");
	        }
	
	        getState(element).listeners.push(listener);
	    }
	
	    /**
	     * Makes an element detectable and ready to be listened for resize events. Will call the callback when the element is ready to be listened for resize changes.
	     * @private
	     * @param {object} options Optional options object.
	     * @param {element} element The element to make detectable
	     * @param {function} callback The callback to be called when the element is ready to be listened for resize changes. Will be called with the element as first parameter.
	     */
	    function makeDetectable(options, element, callback) {
	        if (!callback) {
	            callback = element;
	            element = options;
	            options = null;
	        }
	
	        options = options || {};
	
	        function debug() {
	            if (options.debug) {
	                var args = Array.prototype.slice.call(arguments);
	                args.unshift(idHandler.get(element), "Scroll: ");
	                if (reporter.log.apply) {
	                    reporter.log.apply(null, args);
	                } else {
	                    for (var i = 0; i < args.length; i++) {
	                        reporter.log(args[i]);
	                    }
	                }
	            }
	        }
	
	        function isDetached(element) {
	            function isInDocument(element) {
	                return element === element.ownerDocument.body || element.ownerDocument.body.contains(element);
	            }
	
	            if (!isInDocument(element)) {
	                return true;
	            }
	
	            // FireFox returns null style in hidden iframes. See https://github.com/wnr/element-resize-detector/issues/68 and https://bugzilla.mozilla.org/show_bug.cgi?id=795520
	            if (window.getComputedStyle(element) === null) {
	                return true;
	            }
	
	            return false;
	        }
	
	        function isUnrendered(element) {
	            // Check the absolute positioned container since the top level container is display: inline.
	            var container = getState(element).container.childNodes[0];
	            var style = window.getComputedStyle(container);
	            return !style.width || style.width.indexOf("px") === -1; //Can only compute pixel value when rendered.
	        }
	
	        function getStyle() {
	            // Some browsers only force layouts when actually reading the style properties of the style object, so make sure that they are all read here,
	            // so that the user of the function can be sure that it will perform the layout here, instead of later (important for batching).
	            var elementStyle            = window.getComputedStyle(element);
	            var style                   = {};
	            style.position              = elementStyle.position;
	            style.width                 = element.offsetWidth;
	            style.height                = element.offsetHeight;
	            style.top                   = elementStyle.top;
	            style.right                 = elementStyle.right;
	            style.bottom                = elementStyle.bottom;
	            style.left                  = elementStyle.left;
	            style.widthCSS              = elementStyle.width;
	            style.heightCSS             = elementStyle.height;
	            return style;
	        }
	
	        function storeStartSize() {
	            var style = getStyle();
	            getState(element).startSize = {
	                width: style.width,
	                height: style.height
	            };
	            debug("Element start size", getState(element).startSize);
	        }
	
	        function initListeners() {
	            getState(element).listeners = [];
	        }
	
	        function storeStyle() {
	            debug("storeStyle invoked.");
	            if (!getState(element)) {
	                debug("Aborting because element has been uninstalled");
	                return;
	            }
	
	            var style = getStyle();
	            getState(element).style = style;
	        }
	
	        function storeCurrentSize(element, width, height) {
	            getState(element).lastWidth = width;
	            getState(element).lastHeight  = height;
	        }
	
	        function getExpandChildElement(element) {
	            return getExpandElement(element).childNodes[0];
	        }
	
	        function getWidthOffset() {
	            return 2 * scrollbarSizes.width + 1;
	        }
	
	        function getHeightOffset() {
	            return 2 * scrollbarSizes.height + 1;
	        }
	
	        function getExpandWidth(width) {
	            return width + 10 + getWidthOffset();
	        }
	
	        function getExpandHeight(height) {
	            return height + 10 + getHeightOffset();
	        }
	
	        function getShrinkWidth(width) {
	            return width * 2 + getWidthOffset();
	        }
	
	        function getShrinkHeight(height) {
	            return height * 2 + getHeightOffset();
	        }
	
	        function positionScrollbars(element, width, height) {
	            var expand          = getExpandElement(element);
	            var shrink          = getShrinkElement(element);
	            var expandWidth     = getExpandWidth(width);
	            var expandHeight    = getExpandHeight(height);
	            var shrinkWidth     = getShrinkWidth(width);
	            var shrinkHeight    = getShrinkHeight(height);
	            expand.scrollLeft   = expandWidth;
	            expand.scrollTop    = expandHeight;
	            shrink.scrollLeft   = shrinkWidth;
	            shrink.scrollTop    = shrinkHeight;
	        }
	
	        function injectContainerElement() {
	            var container = getState(element).container;
	
	            if (!container) {
	                container                   = document.createElement("div");
	                container.className         = detectionContainerClass;
	                container.style.cssText     = "visibility: hidden; display: inline; width: 0px; height: 0px; z-index: -1; overflow: hidden; margin: 0; padding: 0;";
	                getState(element).container = container;
	                addAnimationClass(container);
	                element.appendChild(container);
	
	                var onAnimationStart = function () {
	                    getState(element).onRendered && getState(element).onRendered();
	                };
	
	                addEvent(container, "animationstart", onAnimationStart);
	
	                // Store the event handler here so that they may be removed when uninstall is called.
	                // See uninstall function for an explanation why it is needed.
	                getState(element).onAnimationStart = onAnimationStart;
	            }
	
	            return container;
	        }
	
	        function injectScrollElements() {
	            function alterPositionStyles() {
	                var style = getState(element).style;
	
	                if(style.position === "static") {
	                    element.style.position = "relative";
	
	                    var removeRelativeStyles = function(reporter, element, style, property) {
	                        function getNumericalValue(value) {
	                            return value.replace(/[^-\d\.]/g, "");
	                        }
	
	                        var value = style[property];
	
	                        if(value !== "auto" && getNumericalValue(value) !== "0") {
	                            reporter.warn("An element that is positioned static has style." + property + "=" + value + " which is ignored due to the static positioning. The element will need to be positioned relative, so the style." + property + " will be set to 0. Element: ", element);
	                            element.style[property] = 0;
	                        }
	                    };
	
	                    //Check so that there are no accidental styles that will make the element styled differently now that is is relative.
	                    //If there are any, set them to 0 (this should be okay with the user since the style properties did nothing before [since the element was positioned static] anyway).
	                    removeRelativeStyles(reporter, element, style, "top");
	                    removeRelativeStyles(reporter, element, style, "right");
	                    removeRelativeStyles(reporter, element, style, "bottom");
	                    removeRelativeStyles(reporter, element, style, "left");
	                }
	            }
	
	            function getLeftTopBottomRightCssText(left, top, bottom, right) {
	                left = (!left ? "0" : (left + "px"));
	                top = (!top ? "0" : (top + "px"));
	                bottom = (!bottom ? "0" : (bottom + "px"));
	                right = (!right ? "0" : (right + "px"));
	
	                return "left: " + left + "; top: " + top + "; right: " + right + "; bottom: " + bottom + ";";
	            }
	
	            debug("Injecting elements");
	
	            if (!getState(element)) {
	                debug("Aborting because element has been uninstalled");
	                return;
	            }
	
	            alterPositionStyles();
	
	            var rootContainer = getState(element).container;
	
	            if (!rootContainer) {
	                rootContainer = injectContainerElement();
	            }
	
	            // Due to this WebKit bug https://bugs.webkit.org/show_bug.cgi?id=80808 (currently fixed in Blink, but still present in WebKit browsers such as Safari),
	            // we need to inject two containers, one that is width/height 100% and another that is left/top -1px so that the final container always is 1x1 pixels bigger than
	            // the targeted element.
	            // When the bug is resolved, "containerContainer" may be removed.
	
	            // The outer container can occasionally be less wide than the targeted when inside inline elements element in WebKit (see https://bugs.webkit.org/show_bug.cgi?id=152980).
	            // This should be no problem since the inner container either way makes sure the injected scroll elements are at least 1x1 px.
	
	            var scrollbarWidth          = scrollbarSizes.width;
	            var scrollbarHeight         = scrollbarSizes.height;
	            var containerContainerStyle = "position: absolute; flex: none; overflow: hidden; z-index: -1; visibility: hidden; width: 100%; height: 100%; left: 0px; top: 0px;";
	            var containerStyle          = "position: absolute; flex: none; overflow: hidden; z-index: -1; visibility: hidden; " + getLeftTopBottomRightCssText(-(1 + scrollbarWidth), -(1 + scrollbarHeight), -scrollbarHeight, -scrollbarWidth);
	            var expandStyle             = "position: absolute; flex: none; overflow: scroll; z-index: -1; visibility: hidden; width: 100%; height: 100%;";
	            var shrinkStyle             = "position: absolute; flex: none; overflow: scroll; z-index: -1; visibility: hidden; width: 100%; height: 100%;";
	            var expandChildStyle        = "position: absolute; left: 0; top: 0;";
	            var shrinkChildStyle        = "position: absolute; width: 200%; height: 200%;";
	
	            var containerContainer      = document.createElement("div");
	            var container               = document.createElement("div");
	            var expand                  = document.createElement("div");
	            var expandChild             = document.createElement("div");
	            var shrink                  = document.createElement("div");
	            var shrinkChild             = document.createElement("div");
	
	            // Some browsers choke on the resize system being rtl, so force it to ltr. https://github.com/wnr/element-resize-detector/issues/56
	            // However, dir should not be set on the top level container as it alters the dimensions of the target element in some browsers.
	            containerContainer.dir              = "ltr";
	
	            containerContainer.style.cssText    = containerContainerStyle;
	            containerContainer.className        = detectionContainerClass;
	            container.className                 = detectionContainerClass;
	            container.style.cssText             = containerStyle;
	            expand.style.cssText                = expandStyle;
	            expandChild.style.cssText           = expandChildStyle;
	            shrink.style.cssText                = shrinkStyle;
	            shrinkChild.style.cssText           = shrinkChildStyle;
	
	            expand.appendChild(expandChild);
	            shrink.appendChild(shrinkChild);
	            container.appendChild(expand);
	            container.appendChild(shrink);
	            containerContainer.appendChild(container);
	            rootContainer.appendChild(containerContainer);
	
	            function onExpandScroll() {
	                getState(element).onExpand && getState(element).onExpand();
	            }
	
	            function onShrinkScroll() {
	                getState(element).onShrink && getState(element).onShrink();
	            }
	
	            addEvent(expand, "scroll", onExpandScroll);
	            addEvent(shrink, "scroll", onShrinkScroll);
	
	            // Store the event handlers here so that they may be removed when uninstall is called.
	            // See uninstall function for an explanation why it is needed.
	            getState(element).onExpandScroll = onExpandScroll;
	            getState(element).onShrinkScroll = onShrinkScroll;
	        }
	
	        function registerListenersAndPositionElements() {
	            function updateChildSizes(element, width, height) {
	                var expandChild             = getExpandChildElement(element);
	                var expandWidth             = getExpandWidth(width);
	                var expandHeight            = getExpandHeight(height);
	                expandChild.style.width     = expandWidth + "px";
	                expandChild.style.height    = expandHeight + "px";
	            }
	
	            function updateDetectorElements(done) {
	                var width           = element.offsetWidth;
	                var height          = element.offsetHeight;
	
	                debug("Storing current size", width, height);
	
	                // Store the size of the element sync here, so that multiple scroll events may be ignored in the event listeners.
	                // Otherwise the if-check in handleScroll is useless.
	                storeCurrentSize(element, width, height);
	
	                // Since we delay the processing of the batch, there is a risk that uninstall has been called before the batch gets to execute.
	                // Since there is no way to cancel the fn executions, we need to add an uninstall guard to all fns of the batch.
	
	                batchProcessor.add(0, function performUpdateChildSizes() {
	                    if (!getState(element)) {
	                        debug("Aborting because element has been uninstalled");
	                        return;
	                    }
	
	                    if (!areElementsInjected()) {
	                        debug("Aborting because element container has not been initialized");
	                        return;
	                    }
	
	                    if (options.debug) {
	                        var w = element.offsetWidth;
	                        var h = element.offsetHeight;
	
	                        if (w !== width || h !== height) {
	                            reporter.warn(idHandler.get(element), "Scroll: Size changed before updating detector elements.");
	                        }
	                    }
	
	                    updateChildSizes(element, width, height);
	                });
	
	                batchProcessor.add(1, function updateScrollbars() {
	                    if (!getState(element)) {
	                        debug("Aborting because element has been uninstalled");
	                        return;
	                    }
	
	                    if (!areElementsInjected()) {
	                        debug("Aborting because element container has not been initialized");
	                        return;
	                    }
	
	                    positionScrollbars(element, width, height);
	                });
	
	                if (done) {
	                    batchProcessor.add(2, function () {
	                        if (!getState(element)) {
	                            debug("Aborting because element has been uninstalled");
	                            return;
	                        }
	
	                        if (!areElementsInjected()) {
	                          debug("Aborting because element container has not been initialized");
	                          return;
	                        }
	
	                        done();
	                    });
	                }
	            }
	
	            function areElementsInjected() {
	                return !!getState(element).container;
	            }
	
	            function notifyListenersIfNeeded() {
	                function isFirstNotify() {
	                    return getState(element).lastNotifiedWidth === undefined;
	                }
	
	                debug("notifyListenersIfNeeded invoked");
	
	                var state = getState(element);
	
	                // Don't notify the if the current size is the start size, and this is the first notification.
	                if (isFirstNotify() && state.lastWidth === state.startSize.width && state.lastHeight === state.startSize.height) {
	                    return debug("Not notifying: Size is the same as the start size, and there has been no notification yet.");
	                }
	
	                // Don't notify if the size already has been notified.
	                if (state.lastWidth === state.lastNotifiedWidth && state.lastHeight === state.lastNotifiedHeight) {
	                    return debug("Not notifying: Size already notified");
	                }
	
	
	                debug("Current size not notified, notifying...");
	                state.lastNotifiedWidth = state.lastWidth;
	                state.lastNotifiedHeight = state.lastHeight;
	                forEach(getState(element).listeners, function (listener) {
	                    listener(element);
	                });
	            }
	
	            function handleRender() {
	                debug("startanimation triggered.");
	
	                if (isUnrendered(element)) {
	                    debug("Ignoring since element is still unrendered...");
	                    return;
	                }
	
	                debug("Element rendered.");
	                var expand = getExpandElement(element);
	                var shrink = getShrinkElement(element);
	                if (expand.scrollLeft === 0 || expand.scrollTop === 0 || shrink.scrollLeft === 0 || shrink.scrollTop === 0) {
	                    debug("Scrollbars out of sync. Updating detector elements...");
	                    updateDetectorElements(notifyListenersIfNeeded);
	                }
	            }
	
	            function handleScroll() {
	                debug("Scroll detected.");
	
	                if (isUnrendered(element)) {
	                    // Element is still unrendered. Skip this scroll event.
	                    debug("Scroll event fired while unrendered. Ignoring...");
	                    return;
	                }
	
	                var width = element.offsetWidth;
	                var height = element.offsetHeight;
	
	                if (width !== getState(element).lastWidth || height !== getState(element).lastHeight) {
	                    debug("Element size changed.");
	                    updateDetectorElements(notifyListenersIfNeeded);
	                } else {
	                    debug("Element size has not changed (" + width + "x" + height + ").");
	                }
	            }
	
	            debug("registerListenersAndPositionElements invoked.");
	
	            if (!getState(element)) {
	                debug("Aborting because element has been uninstalled");
	                return;
	            }
	
	            getState(element).onRendered = handleRender;
	            getState(element).onExpand = handleScroll;
	            getState(element).onShrink = handleScroll;
	
	            var style = getState(element).style;
	            updateChildSizes(element, style.width, style.height);
	        }
	
	        function finalizeDomMutation() {
	            debug("finalizeDomMutation invoked.");
	
	            if (!getState(element)) {
	                debug("Aborting because element has been uninstalled");
	                return;
	            }
	
	            var style = getState(element).style;
	            storeCurrentSize(element, style.width, style.height);
	            positionScrollbars(element, style.width, style.height);
	        }
	
	        function ready() {
	            callback(element);
	        }
	
	        function install() {
	            debug("Installing...");
	            initListeners();
	            storeStartSize();
	
	            batchProcessor.add(0, storeStyle);
	            batchProcessor.add(1, injectScrollElements);
	            batchProcessor.add(2, registerListenersAndPositionElements);
	            batchProcessor.add(3, finalizeDomMutation);
	            batchProcessor.add(4, ready);
	        }
	
	        debug("Making detectable...");
	
	        if (isDetached(element)) {
	            debug("Element is detached");
	
	            injectContainerElement();
	
	            debug("Waiting until element is attached...");
	
	            getState(element).onRendered = function () {
	                debug("Element is now attached");
	                install();
	            };
	        } else {
	            install();
	        }
	    }
	
	    function uninstall(element) {
	        var state = getState(element);
	
	        if (!state) {
	            // Uninstall has been called on a non-erd element.
	            return;
	        }
	
	        // Uninstall may have been called in the following scenarios:
	        // (1) Right between the sync code and async batch (here state.busy = true, but nothing have been registered or injected).
	        // (2) In the ready callback of the last level of the batch by another element (here, state.busy = true, but all the stuff has been injected).
	        // (3) After the installation process (here, state.busy = false and all the stuff has been injected).
	        // So to be on the safe side, let's check for each thing before removing.
	
	        // We need to remove the event listeners, because otherwise the event might fire on an uninstall element which results in an error when trying to get the state of the element.
	        state.onExpandScroll && removeEvent(getExpandElement(element), "scroll", state.onExpandScroll);
	        state.onShrinkScroll && removeEvent(getShrinkElement(element), "scroll", state.onShrinkScroll);
	        state.onAnimationStart && removeEvent(state.container, "animationstart", state.onAnimationStart);
	
	        state.container && element.removeChild(state.container);
	    }
	
	    return {
	        makeDetectable: makeDetectable,
	        addListener: addListener,
	        uninstall: uninstall
	    };
	};


/***/ }),

/***/ 849:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var forEach                 = __webpack_require__(574).forEach;
	var elementUtilsMaker       = __webpack_require__(850);
	var listenerHandlerMaker    = __webpack_require__(853);
	var idGeneratorMaker        = __webpack_require__(851);
	var idHandlerMaker          = __webpack_require__(852);
	var reporterMaker           = __webpack_require__(854);
	var browserDetector         = __webpack_require__(573);
	var batchProcessorMaker     = __webpack_require__(738);
	var stateHandler            = __webpack_require__(855);
	
	//Detection strategies.
	var objectStrategyMaker     = __webpack_require__(847);
	var scrollStrategyMaker     = __webpack_require__(848);
	
	function isCollection(obj) {
	    return Array.isArray(obj) || obj.length !== undefined;
	}
	
	function toArray(collection) {
	    if (!Array.isArray(collection)) {
	        var array = [];
	        forEach(collection, function (obj) {
	            array.push(obj);
	        });
	        return array;
	    } else {
	        return collection;
	    }
	}
	
	function isElement(obj) {
	    return obj && obj.nodeType === 1;
	}
	
	/**
	 * @typedef idHandler
	 * @type {object}
	 * @property {function} get Gets the resize detector id of the element.
	 * @property {function} set Generate and sets the resize detector id of the element.
	 */
	
	/**
	 * @typedef Options
	 * @type {object}
	 * @property {boolean} callOnAdd    Determines if listeners should be called when they are getting added.
	                                    Default is true. If true, the listener is guaranteed to be called when it has been added.
	                                    If false, the listener will not be guarenteed to be called when it has been added (does not prevent it from being called).
	 * @property {idHandler} idHandler  A custom id handler that is responsible for generating, setting and retrieving id's for elements.
	                                    If not provided, a default id handler will be used.
	 * @property {reporter} reporter    A custom reporter that handles reporting logs, warnings and errors.
	                                    If not provided, a default id handler will be used.
	                                    If set to false, then nothing will be reported.
	 * @property {boolean} debug        If set to true, the the system will report debug messages as default for the listenTo method.
	 */
	
	/**
	 * Creates an element resize detector instance.
	 * @public
	 * @param {Options?} options Optional global options object that will decide how this instance will work.
	 */
	module.exports = function(options) {
	    options = options || {};
	
	    //idHandler is currently not an option to the listenTo function, so it should not be added to globalOptions.
	    var idHandler;
	
	    if (options.idHandler) {
	        // To maintain compatability with idHandler.get(element, readonly), make sure to wrap the given idHandler
	        // so that readonly flag always is true when it's used here. This may be removed next major version bump.
	        idHandler = {
	            get: function (element) { return options.idHandler.get(element, true); },
	            set: options.idHandler.set
	        };
	    } else {
	        var idGenerator = idGeneratorMaker();
	        var defaultIdHandler = idHandlerMaker({
	            idGenerator: idGenerator,
	            stateHandler: stateHandler
	        });
	        idHandler = defaultIdHandler;
	    }
	
	    //reporter is currently not an option to the listenTo function, so it should not be added to globalOptions.
	    var reporter = options.reporter;
	
	    if(!reporter) {
	        //If options.reporter is false, then the reporter should be quiet.
	        var quiet = reporter === false;
	        reporter = reporterMaker(quiet);
	    }
	
	    //batchProcessor is currently not an option to the listenTo function, so it should not be added to globalOptions.
	    var batchProcessor = getOption(options, "batchProcessor", batchProcessorMaker({ reporter: reporter }));
	
	    //Options to be used as default for the listenTo function.
	    var globalOptions = {};
	    globalOptions.callOnAdd     = !!getOption(options, "callOnAdd", true);
	    globalOptions.debug         = !!getOption(options, "debug", false);
	
	    var eventListenerHandler    = listenerHandlerMaker(idHandler);
	    var elementUtils            = elementUtilsMaker({
	        stateHandler: stateHandler
	    });
	
	    //The detection strategy to be used.
	    var detectionStrategy;
	    var desiredStrategy = getOption(options, "strategy", "object");
	    var strategyOptions = {
	        reporter: reporter,
	        batchProcessor: batchProcessor,
	        stateHandler: stateHandler,
	        idHandler: idHandler
	    };
	
	    if(desiredStrategy === "scroll") {
	        if (browserDetector.isLegacyOpera()) {
	            reporter.warn("Scroll strategy is not supported on legacy Opera. Changing to object strategy.");
	            desiredStrategy = "object";
	        } else if (browserDetector.isIE(9)) {
	            reporter.warn("Scroll strategy is not supported on IE9. Changing to object strategy.");
	            desiredStrategy = "object";
	        }
	    }
	
	    if(desiredStrategy === "scroll") {
	        detectionStrategy = scrollStrategyMaker(strategyOptions);
	    } else if(desiredStrategy === "object") {
	        detectionStrategy = objectStrategyMaker(strategyOptions);
	    } else {
	        throw new Error("Invalid strategy name: " + desiredStrategy);
	    }
	
	    //Calls can be made to listenTo with elements that are still being installed.
	    //Also, same elements can occur in the elements list in the listenTo function.
	    //With this map, the ready callbacks can be synchronized between the calls
	    //so that the ready callback can always be called when an element is ready - even if
	    //it wasn't installed from the function itself.
	    var onReadyCallbacks = {};
	
	    /**
	     * Makes the given elements resize-detectable and starts listening to resize events on the elements. Calls the event callback for each event for each element.
	     * @public
	     * @param {Options?} options Optional options object. These options will override the global options. Some options may not be overriden, such as idHandler.
	     * @param {element[]|element} elements The given array of elements to detect resize events of. Single element is also valid.
	     * @param {function} listener The callback to be executed for each resize event for each element.
	     */
	    function listenTo(options, elements, listener) {
	        function onResizeCallback(element) {
	            var listeners = eventListenerHandler.get(element);
	            forEach(listeners, function callListenerProxy(listener) {
	                listener(element);
	            });
	        }
	
	        function addListener(callOnAdd, element, listener) {
	            eventListenerHandler.add(element, listener);
	
	            if(callOnAdd) {
	                listener(element);
	            }
	        }
	
	        //Options object may be omitted.
	        if(!listener) {
	            listener = elements;
	            elements = options;
	            options = {};
	        }
	
	        if(!elements) {
	            throw new Error("At least one element required.");
	        }
	
	        if(!listener) {
	            throw new Error("Listener required.");
	        }
	
	        if (isElement(elements)) {
	            // A single element has been passed in.
	            elements = [elements];
	        } else if (isCollection(elements)) {
	            // Convert collection to array for plugins.
	            // TODO: May want to check so that all the elements in the collection are valid elements.
	            elements = toArray(elements);
	        } else {
	            return reporter.error("Invalid arguments. Must be a DOM element or a collection of DOM elements.");
	        }
	
	        var elementsReady = 0;
	
	        var callOnAdd = getOption(options, "callOnAdd", globalOptions.callOnAdd);
	        var onReadyCallback = getOption(options, "onReady", function noop() {});
	        var debug = getOption(options, "debug", globalOptions.debug);
	
	        forEach(elements, function attachListenerToElement(element) {
	            if (!stateHandler.getState(element)) {
	                stateHandler.initState(element);
	                idHandler.set(element);
	            }
	
	            var id = idHandler.get(element);
	
	            debug && reporter.log("Attaching listener to element", id, element);
	
	            if(!elementUtils.isDetectable(element)) {
	                debug && reporter.log(id, "Not detectable.");
	                if(elementUtils.isBusy(element)) {
	                    debug && reporter.log(id, "System busy making it detectable");
	
	                    //The element is being prepared to be detectable. Do not make it detectable.
	                    //Just add the listener, because the element will soon be detectable.
	                    addListener(callOnAdd, element, listener);
	                    onReadyCallbacks[id] = onReadyCallbacks[id] || [];
	                    onReadyCallbacks[id].push(function onReady() {
	                        elementsReady++;
	
	                        if(elementsReady === elements.length) {
	                            onReadyCallback();
	                        }
	                    });
	                    return;
	                }
	
	                debug && reporter.log(id, "Making detectable...");
	                //The element is not prepared to be detectable, so do prepare it and add a listener to it.
	                elementUtils.markBusy(element, true);
	                return detectionStrategy.makeDetectable({ debug: debug }, element, function onElementDetectable(element) {
	                    debug && reporter.log(id, "onElementDetectable");
	
	                    if (stateHandler.getState(element)) {
	                        elementUtils.markAsDetectable(element);
	                        elementUtils.markBusy(element, false);
	                        detectionStrategy.addListener(element, onResizeCallback);
	                        addListener(callOnAdd, element, listener);
	
	                        // Since the element size might have changed since the call to "listenTo", we need to check for this change,
	                        // so that a resize event may be emitted.
	                        // Having the startSize object is optional (since it does not make sense in some cases such as unrendered elements), so check for its existance before.
	                        // Also, check the state existance before since the element may have been uninstalled in the installation process.
	                        var state = stateHandler.getState(element);
	                        if (state && state.startSize) {
	                            var width = element.offsetWidth;
	                            var height = element.offsetHeight;
	                            if (state.startSize.width !== width || state.startSize.height !== height) {
	                                onResizeCallback(element);
	                            }
	                        }
	
	                        if(onReadyCallbacks[id]) {
	                            forEach(onReadyCallbacks[id], function(callback) {
	                                callback();
	                            });
	                        }
	                    } else {
	                        // The element has been unisntalled before being detectable.
	                        debug && reporter.log(id, "Element uninstalled before being detectable.");
	                    }
	
	                    delete onReadyCallbacks[id];
	
	                    elementsReady++;
	                    if(elementsReady === elements.length) {
	                        onReadyCallback();
	                    }
	                });
	            }
	
	            debug && reporter.log(id, "Already detecable, adding listener.");
	
	            //The element has been prepared to be detectable and is ready to be listened to.
	            addListener(callOnAdd, element, listener);
	            elementsReady++;
	        });
	
	        if(elementsReady === elements.length) {
	            onReadyCallback();
	        }
	    }
	
	    function uninstall(elements) {
	        if(!elements) {
	            return reporter.error("At least one element is required.");
	        }
	
	        if (isElement(elements)) {
	            // A single element has been passed in.
	            elements = [elements];
	        } else if (isCollection(elements)) {
	            // Convert collection to array for plugins.
	            // TODO: May want to check so that all the elements in the collection are valid elements.
	            elements = toArray(elements);
	        } else {
	            return reporter.error("Invalid arguments. Must be a DOM element or a collection of DOM elements.");
	        }
	
	        forEach(elements, function (element) {
	            eventListenerHandler.removeAllListeners(element);
	            detectionStrategy.uninstall(element);
	            stateHandler.cleanState(element);
	        });
	    }
	
	    return {
	        listenTo: listenTo,
	        removeListener: eventListenerHandler.removeListener,
	        removeAllListeners: eventListenerHandler.removeAllListeners,
	        uninstall: uninstall
	    };
	};
	
	function getOption(options, name, defaultValue) {
	    var value = options[name];
	
	    if((value === undefined || value === null) && defaultValue !== undefined) {
	        return defaultValue;
	    }
	
	    return value;
	}


/***/ }),

/***/ 850:
/***/ (function(module, exports) {

	"use strict";
	
	module.exports = function(options) {
	    var getState = options.stateHandler.getState;
	
	    /**
	     * Tells if the element has been made detectable and ready to be listened for resize events.
	     * @public
	     * @param {element} The element to check.
	     * @returns {boolean} True or false depending on if the element is detectable or not.
	     */
	    function isDetectable(element) {
	        var state = getState(element);
	        return state && !!state.isDetectable;
	    }
	
	    /**
	     * Marks the element that it has been made detectable and ready to be listened for resize events.
	     * @public
	     * @param {element} The element to mark.
	     */
	    function markAsDetectable(element) {
	        getState(element).isDetectable = true;
	    }
	
	    /**
	     * Tells if the element is busy or not.
	     * @public
	     * @param {element} The element to check.
	     * @returns {boolean} True or false depending on if the element is busy or not.
	     */
	    function isBusy(element) {
	        return !!getState(element).busy;
	    }
	
	    /**
	     * Marks the object is busy and should not be made detectable.
	     * @public
	     * @param {element} element The element to mark.
	     * @param {boolean} busy If the element is busy or not.
	     */
	    function markBusy(element, busy) {
	        getState(element).busy = !!busy;
	    }
	
	    return {
	        isDetectable: isDetectable,
	        markAsDetectable: markAsDetectable,
	        isBusy: isBusy,
	        markBusy: markBusy
	    };
	};


/***/ }),

/***/ 851:
/***/ (function(module, exports) {

	"use strict";
	
	module.exports = function() {
	    var idCount = 1;
	
	    /**
	     * Generates a new unique id in the context.
	     * @public
	     * @returns {number} A unique id in the context.
	     */
	    function generate() {
	        return idCount++;
	    }
	
	    return {
	        generate: generate
	    };
	};


/***/ }),

/***/ 852:
/***/ (function(module, exports) {

	"use strict";
	
	module.exports = function(options) {
	    var idGenerator     = options.idGenerator;
	    var getState        = options.stateHandler.getState;
	
	    /**
	     * Gets the resize detector id of the element.
	     * @public
	     * @param {element} element The target element to get the id of.
	     * @returns {string|number|null} The id of the element. Null if it has no id.
	     */
	    function getId(element) {
	        var state = getState(element);
	
	        if (state && state.id !== undefined) {
	            return state.id;
	        }
	
	        return null;
	    }
	
	    /**
	     * Sets the resize detector id of the element. Requires the element to have a resize detector state initialized.
	     * @public
	     * @param {element} element The target element to set the id of.
	     * @returns {string|number|null} The id of the element.
	     */
	    function setId(element) {
	        var state = getState(element);
	
	        if (!state) {
	            throw new Error("setId required the element to have a resize detection state.");
	        }
	
	        var id = idGenerator.generate();
	
	        state.id = id;
	
	        return id;
	    }
	
	    return {
	        get: getId,
	        set: setId
	    };
	};


/***/ }),

/***/ 853:
/***/ (function(module, exports) {

	"use strict";
	
	module.exports = function(idHandler) {
	    var eventListeners = {};
	
	    /**
	     * Gets all listeners for the given element.
	     * @public
	     * @param {element} element The element to get all listeners for.
	     * @returns All listeners for the given element.
	     */
	    function getListeners(element) {
	        var id = idHandler.get(element);
	
	        if (id === undefined) {
	            return [];
	        }
	
	        return eventListeners[id] || [];
	    }
	
	    /**
	     * Stores the given listener for the given element. Will not actually add the listener to the element.
	     * @public
	     * @param {element} element The element that should have the listener added.
	     * @param {function} listener The callback that the element has added.
	     */
	    function addListener(element, listener) {
	        var id = idHandler.get(element);
	
	        if(!eventListeners[id]) {
	            eventListeners[id] = [];
	        }
	
	        eventListeners[id].push(listener);
	    }
	
	    function removeListener(element, listener) {
	        var listeners = getListeners(element);
	        for (var i = 0, len = listeners.length; i < len; ++i) {
	            if (listeners[i] === listener) {
	              listeners.splice(i, 1);
	              break;
	            }
	        }
	    }
	
	    function removeAllListeners(element) {
	      var listeners = getListeners(element);
	      if (!listeners) { return; }
	      listeners.length = 0;
	    }
	
	    return {
	        get: getListeners,
	        add: addListener,
	        removeListener: removeListener,
	        removeAllListeners: removeAllListeners
	    };
	};


/***/ }),

/***/ 854:
/***/ (function(module, exports) {

	"use strict";
	
	/* global console: false */
	
	/**
	 * Reporter that handles the reporting of logs, warnings and errors.
	 * @public
	 * @param {boolean} quiet Tells if the reporter should be quiet or not.
	 */
	module.exports = function(quiet) {
	    function noop() {
	        //Does nothing.
	    }
	
	    var reporter = {
	        log: noop,
	        warn: noop,
	        error: noop
	    };
	
	    if(!quiet && window.console) {
	        var attachFunction = function(reporter, name) {
	            //The proxy is needed to be able to call the method with the console context,
	            //since we cannot use bind.
	            reporter[name] = function reporterProxy() {
	                var f = console[name];
	                if (f.apply) { //IE9 does not support console.log.apply :)
	                    f.apply(console, arguments);
	                } else {
	                    for (var i = 0; i < arguments.length; i++) {
	                        f(arguments[i]);
	                    }
	                }
	            };
	        };
	
	        attachFunction(reporter, "log");
	        attachFunction(reporter, "warn");
	        attachFunction(reporter, "error");
	    }
	
	    return reporter;
	};

/***/ }),

/***/ 855:
/***/ (function(module, exports) {

	"use strict";
	
	var prop = "_erd";
	
	function initState(element) {
	    element[prop] = {};
	    return getState(element);
	}
	
	function getState(element) {
	    return element[prop];
	}
	
	function cleanState(element) {
	    delete element[prop];
	}
	
	module.exports = {
	    initState: initState,
	    getState: getState,
	    cleanState: cleanState
	};


/***/ }),

/***/ 902:
/***/ (function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ }),

/***/ 912:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Response = __webpack_require__(585);
	var extractResponseProps = __webpack_require__(586);
	var extend = __webpack_require__(376);
	
	function RequestError(message, props) {
	  var err = new Error(message);
	  err.name = 'RequestError';
	  this.name = err.name;
	  this.message = err.message;
	  if (err.stack) {
	    this.stack = err.stack;
	  }
	
	  this.toString = function() {
	    return this.message;
	  };
	
	  for (var k in props) {
	    if (props.hasOwnProperty(k)) {
	      this[k] = props[k];
	    }
	  }
	}
	
	RequestError.prototype = extend(Error.prototype);
	RequestError.prototype.constructor = RequestError;
	
	RequestError.create = function(message, req, props) {
	  var err = new RequestError(message, props);
	  Response.call(err, extractResponseProps(req));
	  return err;
	};
	
	module.exports = RequestError;


/***/ }),

/***/ 913:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var
	  cleanURL = __webpack_require__(916),
	  XHR = __webpack_require__(915),
	  delay = __webpack_require__(914),
	  RequestError = __webpack_require__(912),
	  Response = __webpack_require__(585),
	  Request = __webpack_require__(584),
	  extend = __webpack_require__(376),
	  once = __webpack_require__(587);
	
	var i,
	    createError = RequestError.create;
	
	function factory(defaults, plugins) {
	  defaults = defaults || {};
	  plugins = plugins || [];
	
	  function http(req, cb) {
	    var xhr, plugin, done, k, timeoutId, supportsLoadAndErrorEvents;
	
	    req = new Request(extend(defaults, req));
	
	    for (i = 0; i < plugins.length; i++) {
	      plugin = plugins[i];
	      if (plugin.processRequest) {
	        plugin.processRequest(req);
	      }
	    }
	
	    // Give the plugins a chance to create the XHR object
	    for (i = 0; i < plugins.length; i++) {
	      plugin = plugins[i];
	      if (plugin.createXHR) {
	        xhr = plugin.createXHR(req);
	        break; // First come, first serve
	      }
	    }
	    xhr = xhr || new XHR();
	
	    req.xhr = xhr;
	
	    // Use a single completion callback. This can be called with or without
	    // an error. If no error is passed, the request will be examined to see
	    // if it was successful.
	    done = once(delay(function(rawError) {
	      clearTimeout(timeoutId);
	      xhr.onload = xhr.onerror = xhr.onabort = xhr.onreadystatechange = xhr.ontimeout = xhr.onprogress = null;
	
	      var err = getError(req, rawError);
	
	      var res = err || Response.fromRequest(req);
	      for (i = 0; i < plugins.length; i++) {
	        plugin = plugins[i];
	        if (plugin.processResponse) {
	          plugin.processResponse(res);
	        }
	      }
	
	      // Invoke callbacks
	      if (err && req.onerror) req.onerror(err);
	      if (!err && req.onload) req.onload(res);
	      if (cb) cb(err, err ? undefined : res);
	
	    }));
	
	    supportsLoadAndErrorEvents = ('onload' in xhr) && ('onerror' in xhr);
	    xhr.onload = function() { done(); };
	    xhr.onerror = done;
	    xhr.onabort = function() { done(); };
	
	    // We'd rather use `onload`, `onerror`, and `onabort` since they're the
	    // only way to reliably detect successes and failures but, if they
	    // aren't available, we fall back to using `onreadystatechange`.
	    xhr.onreadystatechange = function() {
	      if (xhr.readyState !== 4) return;
	
	      if (req.aborted) return done();
	
	      if (!supportsLoadAndErrorEvents) {
	        // Assume a status of 0 is an error. This could be a false
	        // positive, but there's no way to tell when using
	        // `onreadystatechange` ):
	        // See matthewwithanm/react-inlinesvg#10.
	
	        // Some browsers don't like you reading XHR properties when the
	        // XHR has been aborted. In case we've gotten here as a result
	        // of that (either our calling `about()` in the timeout handler
	        // or the user calling it directly even though they shouldn't),
	        // be careful about accessing it.
	        var status;
	        try {
	          status = xhr.status;
	        } catch (err) {}
	        var err = status === 0 ? new Error('Internal XHR Error') : null;
	        return done(err);
	      }
	    };
	
	    // IE sometimes fails if you don't specify every handler.
	    // See http://social.msdn.microsoft.com/Forums/ie/en-US/30ef3add-767c-4436-b8a9-f1ca19b4812e/ie9-rtm-xdomainrequest-issued-requests-may-abort-if-all-event-handlers-not-specified?forum=iewebdevelopment
	    xhr.ontimeout = function() { /* noop */ };
	    xhr.onprogress = function() { /* noop */ };
	
	    xhr.open(req.method, req.url);
	
	    if (req.timeout) {
	      // If we use the normal XHR timeout mechanism (`xhr.timeout` and
	      // `xhr.ontimeout`), `onreadystatechange` will be triggered before
	      // `ontimeout`. There's no way to recognize that it was triggered by
	      // a timeout, and we'd be unable to dispatch the right error.
	      timeoutId = setTimeout(function() {
	        req.timedOut = true;
	        done();
	        try {
	          xhr.abort();
	        } catch (err) {}
	      }, req.timeout);
	    }
	
	    for (k in req.headers) {
	      if (req.headers.hasOwnProperty(k)) {
	        xhr.setRequestHeader(k, req.headers[k]);
	      }
	    }
	
	    xhr.send(req.body);
	
	    return req;
	  }
	
	  var method,
	    methods = ['get', 'post', 'put', 'head', 'patch', 'delete'],
	    verb = function(method) {
	      return function(req, cb) {
	        req = new Request(req);
	        req.method = method;
	        return http(req, cb);
	      };
	    };
	  for (i = 0; i < methods.length; i++) {
	    method = methods[i];
	    http[method] = verb(method);
	  }
	
	  http.plugins = function() {
	    return plugins;
	  };
	
	  http.defaults = function(newValues) {
	    if (newValues) {
	      return factory(extend(defaults, newValues), plugins);
	    }
	    return defaults;
	  };
	
	  http.use = function() {
	    var newPlugins = Array.prototype.slice.call(arguments, 0);
	    return factory(defaults, plugins.concat(newPlugins));
	  };
	
	  http.bare = function() {
	    return factory();
	  };
	
	  http.Request = Request;
	  http.Response = Response;
	  http.RequestError = RequestError;
	
	  return http;
	}
	
	module.exports = factory({}, [cleanURL]);
	
	/**
	 * Analyze the request to see if it represents an error. If so, return it! An
	 * original error object can be passed as a hint.
	 */
	function getError(req, err) {
	  if (req.aborted) return createError('Request aborted', req, {name: 'Abort'});
	
	  if (req.timedOut) return createError('Request timeout', req, {name: 'Timeout'});
	
	  var xhr = req.xhr;
	  var type = Math.floor(xhr.status / 100);
	
	  var kind;
	  switch (type) {
	    case 0:
	    case 2:
	      // These don't represent errors unless the function was passed an
	      // error object explicitly.
	      if (!err) return;
	      return createError(err.message, req);
	    case 4:
	      // Sometimes 4XX statuses aren't errors.
	      if (xhr.status === 404 && !req.errorOn404) return;
	      kind = 'Client';
	      break;
	    case 5:
	      kind = 'Server';
	      break;
	    default:
	      kind = 'HTTP';
	  }
	  var msg = kind + ' Error: ' +
	        'The server returned a status of ' + xhr.status +
	        ' for the request "' +
	        req.method.toUpperCase() + ' ' + req.url + '"';
	  return createError(msg, req);
	}


/***/ }),

/***/ 584:
/***/ (function(module, exports) {

	'use strict';
	
	function Request(optsOrUrl) {
	  var opts = typeof optsOrUrl === 'string' ? {url: optsOrUrl} : optsOrUrl || {};
	  this.method = opts.method ? opts.method.toUpperCase() : 'GET';
	  this.url = opts.url;
	  this.headers = opts.headers || {};
	  this.body = opts.body;
	  this.timeout = opts.timeout || 0;
	  this.errorOn404 = opts.errorOn404 != null ? opts.errorOn404 : true;
	  this.onload = opts.onload;
	  this.onerror = opts.onerror;
	}
	
	Request.prototype.abort = function() {
	  if (this.aborted) return;
	  this.aborted = true;
	  this.xhr.abort();
	  return this;
	};
	
	Request.prototype.header = function(name, value) {
	  var k;
	  for (k in this.headers) {
	    if (this.headers.hasOwnProperty(k)) {
	      if (name.toLowerCase() === k.toLowerCase()) {
	        if (arguments.length === 1) {
	          return this.headers[k];
	        }
	
	        delete this.headers[k];
	        break;
	      }
	    }
	  }
	  if (value != null) {
	    this.headers[name] = value;
	    return value;
	  }
	};
	
	
	module.exports = Request;


/***/ }),

/***/ 585:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Request = __webpack_require__(584);
	var extractResponseProps = __webpack_require__(586);
	
	function Response(props) {
	  this.request = props.request;
	  this.xhr = props.xhr;
	  this.headers = props.headers || {};
	  this.status = props.status || 0;
	  this.text = props.text;
	  this.body = props.body;
	  this.contentType = props.contentType;
	  this.isHttpError = props.status >= 400;
	}
	
	Response.prototype.header = Request.prototype.header;
	
	Response.fromRequest = function(req) {
	  return new Response(extractResponseProps(req));
	};
	
	
	module.exports = Response;


/***/ }),

/***/ 914:
/***/ (function(module, exports) {

	'use strict';
	
	// Wrap a function in a `setTimeout` call. This is used to guarantee async
	// behavior, which can avoid unexpected errors.
	
	module.exports = function(fn) {
	  return function() {
	    var
	      args = Array.prototype.slice.call(arguments, 0),
	      newFunc = function() {
	        return fn.apply(null, args);
	      };
	    setTimeout(newFunc, 0);
	  };
	};


/***/ }),

/***/ 586:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var extend = __webpack_require__(376);
	
	module.exports = function(req) {
	  var xhr = req.xhr;
	  var props = {request: req, xhr: xhr};
	
	  // Try to create the response from the request. If the request was aborted,
	  // accesssing properties of the XHR may throw an error, so we wrap in a
	  // try/catch.
	  try {
	    var lines, i, m, headers = {};
	    if (xhr.getAllResponseHeaders) {
	      lines = xhr.getAllResponseHeaders().split('\n');
	      for (i = 0; i < lines.length; i++) {
	        if ((m = lines[i].match(/\s*([^\s]+):\s+([^\s]+)/))) {
	          headers[m[1]] = m[2];
	        }
	      }
	    }
	
	    props = extend(props, {
	      status: xhr.status,
	      contentType: xhr.contentType || (xhr.getResponseHeader && xhr.getResponseHeader('Content-Type')),
	      headers: headers,
	      text: xhr.responseText,
	      body: xhr.response || xhr.responseText
	    });
	  } catch (err) {}
	
	  return props;
	};


/***/ }),

/***/ 587:
/***/ (function(module, exports) {

	'use strict';
	
	// A "once" utility.
	module.exports = function(fn) {
	  var result, called = false;
	  return function() {
	    if (!called) {
	      called = true;
	      result = fn.apply(this, arguments);
	    }
	    return result;
	  };
	};


/***/ }),

/***/ 915:
/***/ (function(module, exports) {

	module.exports = window.XMLHttpRequest;


/***/ }),

/***/ 916:
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = {
	  processRequest: function(req) {
	    req.url = req.url.replace(/[^%]+/g, function(s) {
	      return encodeURI(s);
	    });
	  }
	};


/***/ }),

/***/ 917:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var
	  urllite = __webpack_require__(1258),
	  once = __webpack_require__(587);
	
	var warningShown = false;
	
	var supportsXHR = once(function() {
	  return (
	    typeof window !== 'undefined' &&
	    window !== null &&
	    window.XMLHttpRequest &&
	    'withCredentials' in new window.XMLHttpRequest()
	  );
	});
	
	// This plugin creates a Microsoft `XDomainRequest` in supporting browsers when
	// the URL being requested is on a different domain. This is necessary to
	// support IE9, which only supports CORS via its proprietary `XDomainRequest`
	// object. We need to check the URL because `XDomainRequest` *doesn't* work for
	// same domain requests (unless your server sends CORS headers).
	// `XDomainRequest` also has other limitations (no custom headers), so we try to
	// catch those and error.
	module.exports = {
	  createXHR: function(req) {
	    var a, b, k;
	
	    if (typeof window === 'undefined' || window === null) {
	      return;
	    }
	
	    a = urllite(req.url);
	    b = urllite(window.location.href);
	
	    // Don't do anything for same-domain requests.
	    if (!a.host) {
	      return;
	    }
	    if (a.protocol === b.protocol && a.host === b.host && a.port === b.port) {
	      return;
	    }
	
	    // Show a warning if there are custom headers. We do this even in
	    // browsers that won't use XDomainRequest so that users know there's an
	    // issue right away, instead of if/when they test in IE9.
	    if (!warningShown && req.headers) {
	      for (k in req.headers) {
	        if (req.headers.hasOwnProperty(k)) {
	          warningShown = true;
	          if (window && window.console && window.console.warn) {
	            window.console.warn('Request headers are ignored in old IE when using the oldiexdomain plugin.');
	          }
	          break;
	        }
	      }
	    }
	
	    // Don't do anything if we can't do anything (:
	    // Don't do anything if the browser supports proper XHR.
	    if (window.XDomainRequest && !supportsXHR()) {
	      // We've come this far. Might as well make an XDomainRequest.
	      var xdr = new window.XDomainRequest();
	      xdr.setRequestHeader = function() {}; // Ignore request headers.
	      return xdr;
	    }
	  }
	};


/***/ }),

/***/ 963:
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */
	
	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;
	
	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';
	
	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;
	
	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
	
	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;
	
	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;
	
	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
	
	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max,
	    nativeMin = Math.min;
	
	/**
	 * Gets the timestamp of the number of milliseconds that have elapsed since
	 * the Unix epoch (1 January 1970 00:00:00 UTC).
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Date
	 * @returns {number} Returns the timestamp.
	 * @example
	 *
	 * _.defer(function(stamp) {
	 *   console.log(_.now() - stamp);
	 * }, _.now());
	 * // => Logs the number of milliseconds it took for the deferred invocation.
	 */
	var now = function() {
	  return root.Date.now();
	};
	
	/**
	 * Creates a debounced function that delays invoking `func` until after `wait`
	 * milliseconds have elapsed since the last time the debounced function was
	 * invoked. The debounced function comes with a `cancel` method to cancel
	 * delayed `func` invocations and a `flush` method to immediately invoke them.
	 * Provide `options` to indicate whether `func` should be invoked on the
	 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
	 * with the last arguments provided to the debounced function. Subsequent
	 * calls to the debounced function return the result of the last `func`
	 * invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is
	 * invoked on the trailing edge of the timeout only if the debounced function
	 * is invoked more than once during the `wait` timeout.
	 *
	 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	 *
	 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	 * for details over the differences between `_.debounce` and `_.throttle`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to debounce.
	 * @param {number} [wait=0] The number of milliseconds to delay.
	 * @param {Object} [options={}] The options object.
	 * @param {boolean} [options.leading=false]
	 *  Specify invoking on the leading edge of the timeout.
	 * @param {number} [options.maxWait]
	 *  The maximum time `func` is allowed to be delayed before it's invoked.
	 * @param {boolean} [options.trailing=true]
	 *  Specify invoking on the trailing edge of the timeout.
	 * @returns {Function} Returns the new debounced function.
	 * @example
	 *
	 * // Avoid costly calculations while the window size is in flux.
	 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
	 *
	 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
	 * jQuery(element).on('click', _.debounce(sendMail, 300, {
	 *   'leading': true,
	 *   'trailing': false
	 * }));
	 *
	 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
	 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
	 * var source = new EventSource('/stream');
	 * jQuery(source).on('message', debounced);
	 *
	 * // Cancel the trailing debounced invocation.
	 * jQuery(window).on('popstate', debounced.cancel);
	 */
	function debounce(func, wait, options) {
	  var lastArgs,
	      lastThis,
	      maxWait,
	      result,
	      timerId,
	      lastCallTime,
	      lastInvokeTime = 0,
	      leading = false,
	      maxing = false,
	      trailing = true;
	
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  wait = toNumber(wait) || 0;
	  if (isObject(options)) {
	    leading = !!options.leading;
	    maxing = 'maxWait' in options;
	    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
	    trailing = 'trailing' in options ? !!options.trailing : trailing;
	  }
	
	  function invokeFunc(time) {
	    var args = lastArgs,
	        thisArg = lastThis;
	
	    lastArgs = lastThis = undefined;
	    lastInvokeTime = time;
	    result = func.apply(thisArg, args);
	    return result;
	  }
	
	  function leadingEdge(time) {
	    // Reset any `maxWait` timer.
	    lastInvokeTime = time;
	    // Start the timer for the trailing edge.
	    timerId = setTimeout(timerExpired, wait);
	    // Invoke the leading edge.
	    return leading ? invokeFunc(time) : result;
	  }
	
	  function remainingWait(time) {
	    var timeSinceLastCall = time - lastCallTime,
	        timeSinceLastInvoke = time - lastInvokeTime,
	        result = wait - timeSinceLastCall;
	
	    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
	  }
	
	  function shouldInvoke(time) {
	    var timeSinceLastCall = time - lastCallTime,
	        timeSinceLastInvoke = time - lastInvokeTime;
	
	    // Either this is the first call, activity has stopped and we're at the
	    // trailing edge, the system time has gone backwards and we're treating
	    // it as the trailing edge, or we've hit the `maxWait` limit.
	    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
	      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
	  }
	
	  function timerExpired() {
	    var time = now();
	    if (shouldInvoke(time)) {
	      return trailingEdge(time);
	    }
	    // Restart the timer.
	    timerId = setTimeout(timerExpired, remainingWait(time));
	  }
	
	  function trailingEdge(time) {
	    timerId = undefined;
	
	    // Only invoke if we have `lastArgs` which means `func` has been
	    // debounced at least once.
	    if (trailing && lastArgs) {
	      return invokeFunc(time);
	    }
	    lastArgs = lastThis = undefined;
	    return result;
	  }
	
	  function cancel() {
	    if (timerId !== undefined) {
	      clearTimeout(timerId);
	    }
	    lastInvokeTime = 0;
	    lastArgs = lastCallTime = lastThis = timerId = undefined;
	  }
	
	  function flush() {
	    return timerId === undefined ? result : trailingEdge(now());
	  }
	
	  function debounced() {
	    var time = now(),
	        isInvoking = shouldInvoke(time);
	
	    lastArgs = arguments;
	    lastThis = this;
	    lastCallTime = time;
	
	    if (isInvoking) {
	      if (timerId === undefined) {
	        return leadingEdge(lastCallTime);
	      }
	      if (maxing) {
	        // Handle invocations in a tight loop.
	        timerId = setTimeout(timerExpired, wait);
	        return invokeFunc(lastCallTime);
	      }
	    }
	    if (timerId === undefined) {
	      timerId = setTimeout(timerExpired, wait);
	    }
	    return result;
	  }
	  debounced.cancel = cancel;
	  debounced.flush = flush;
	  return debounced;
	}
	
	/**
	 * Creates a throttled function that only invokes `func` at most once per
	 * every `wait` milliseconds. The throttled function comes with a `cancel`
	 * method to cancel delayed `func` invocations and a `flush` method to
	 * immediately invoke them. Provide `options` to indicate whether `func`
	 * should be invoked on the leading and/or trailing edge of the `wait`
	 * timeout. The `func` is invoked with the last arguments provided to the
	 * throttled function. Subsequent calls to the throttled function return the
	 * result of the last `func` invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is
	 * invoked on the trailing edge of the timeout only if the throttled function
	 * is invoked more than once during the `wait` timeout.
	 *
	 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	 *
	 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	 * for details over the differences between `_.throttle` and `_.debounce`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to throttle.
	 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
	 * @param {Object} [options={}] The options object.
	 * @param {boolean} [options.leading=true]
	 *  Specify invoking on the leading edge of the timeout.
	 * @param {boolean} [options.trailing=true]
	 *  Specify invoking on the trailing edge of the timeout.
	 * @returns {Function} Returns the new throttled function.
	 * @example
	 *
	 * // Avoid excessively updating the position while scrolling.
	 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
	 *
	 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
	 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
	 * jQuery(element).on('click', throttled);
	 *
	 * // Cancel the trailing throttled invocation.
	 * jQuery(window).on('popstate', throttled.cancel);
	 */
	function throttle(func, wait, options) {
	  var leading = true,
	      trailing = true;
	
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  if (isObject(options)) {
	    leading = 'leading' in options ? !!options.leading : leading;
	    trailing = 'trailing' in options ? !!options.trailing : trailing;
	  }
	  return debounce(func, wait, {
	    'leading': leading,
	    'maxWait': wait,
	    'trailing': trailing
	  });
	}
	
	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}
	
	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}
	
	module.exports = throttle;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),

/***/ 171:
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(33),
	    root = __webpack_require__(8);
	
	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView');
	
	module.exports = DataView;


/***/ }),

/***/ 172:
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(33),
	    root = __webpack_require__(8);
	
	/* Built-in method references that are verified to be native. */
	var Promise = getNative(root, 'Promise');
	
	module.exports = Promise;


/***/ }),

/***/ 173:
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(33),
	    root = __webpack_require__(8);
	
	/* Built-in method references that are verified to be native. */
	var Set = getNative(root, 'Set');
	
	module.exports = Set;


/***/ }),

/***/ 98:
/***/ (function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(116),
	    setCacheAdd = __webpack_require__(192),
	    setCacheHas = __webpack_require__(193);
	
	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	  var index = -1,
	      length = values == null ? 0 : values.length;
	
	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}
	
	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;
	
	module.exports = SetCache;


/***/ }),

/***/ 99:
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(33),
	    root = __webpack_require__(8);
	
	/* Built-in method references that are verified to be native. */
	var WeakMap = getNative(root, 'WeakMap');
	
	module.exports = WeakMap;


/***/ }),

/***/ 67:
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.filter` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function arrayFilter(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      resIndex = 0,
	      result = [];
	
	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result[resIndex++] = value;
	    }
	  }
	  return result;
	}
	
	module.exports = arrayFilter;


/***/ }),

/***/ 18:
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      result = Array(length);
	
	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}
	
	module.exports = arrayMap;


/***/ }),

/***/ 51:
/***/ (function(module, exports) {

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;
	
	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}
	
	module.exports = arrayPush;


/***/ }),

/***/ 101:
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length;
	
	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	module.exports = arraySome;


/***/ }),

/***/ 35:
/***/ (function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(20),
	    toKey = __webpack_require__(14);
	
	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = castPath(path, object);
	
	  var index = 0,
	      length = path.length;
	
	  while (object != null && index < length) {
	    object = object[toKey(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}
	
	module.exports = baseGet;


/***/ }),

/***/ 79:
/***/ (function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(51),
	    isArray = __webpack_require__(2);
	
	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
	}
	
	module.exports = baseGetAllKeys;


/***/ }),

/***/ 176:
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHasIn(object, key) {
	  return object != null && key in Object(object);
	}
	
	module.exports = baseHasIn;


/***/ }),

/***/ 52:
/***/ (function(module, exports, __webpack_require__) {

	var baseIsEqualDeep = __webpack_require__(177),
	    isObjectLike = __webpack_require__(9);
	
	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {boolean} bitmask The bitmask flags.
	 *  1 - Unordered comparison
	 *  2 - Partial comparison
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, bitmask, customizer, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	}
	
	module.exports = baseIsEqual;


/***/ }),

/***/ 177:
/***/ (function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(66),
	    equalArrays = __webpack_require__(83),
	    equalByTag = __webpack_require__(186),
	    equalObjects = __webpack_require__(187),
	    getTag = __webpack_require__(21),
	    isArray = __webpack_require__(2),
	    isBuffer = __webpack_require__(112),
	    isTypedArray = __webpack_require__(196);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = objIsArr ? arrayTag : getTag(object),
	      othTag = othIsArr ? arrayTag : getTag(other);
	
	  objTag = objTag == argsTag ? objectTag : objTag;
	  othTag = othTag == argsTag ? objectTag : othTag;
	
	  var objIsObj = objTag == objectTag,
	      othIsObj = othTag == objectTag,
	      isSameTag = objTag == othTag;
	
	  if (isSameTag && isBuffer(object)) {
	    if (!isBuffer(other)) {
	      return false;
	    }
	    objIsArr = true;
	    objIsObj = false;
	  }
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack);
	    return (objIsArr || isTypedArray(object))
	      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
	      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }
	  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
	
	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;
	
	      stack || (stack = new Stack);
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack);
	  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}
	
	module.exports = baseIsEqualDeep;


/***/ }),

/***/ 178:
/***/ (function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(66),
	    baseIsEqual = __webpack_require__(52);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;
	
	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;
	
	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];
	
	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new Stack;
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined
	            ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}
	
	module.exports = baseIsMatch;


/***/ }),

/***/ 11:
/***/ (function(module, exports, __webpack_require__) {

	var baseMatches = __webpack_require__(179),
	    baseMatchesProperty = __webpack_require__(180),
	    identity = __webpack_require__(43),
	    isArray = __webpack_require__(2),
	    property = __webpack_require__(198);
	
	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity;
	  }
	  if (typeof value == 'object') {
	    return isArray(value)
	      ? baseMatchesProperty(value[0], value[1])
	      : baseMatches(value);
	  }
	  return property(value);
	}
	
	module.exports = baseIteratee;


/***/ }),

/***/ 53:
/***/ (function(module, exports, __webpack_require__) {

	var isPrototype = __webpack_require__(108),
	    nativeKeys = __webpack_require__(190);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = baseKeys;


/***/ }),

/***/ 179:
/***/ (function(module, exports, __webpack_require__) {

	var baseIsMatch = __webpack_require__(178),
	    getMatchData = __webpack_require__(188),
	    matchesStrictComparable = __webpack_require__(87);
	
	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
	  }
	  return function(object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}
	
	module.exports = baseMatches;


/***/ }),

/***/ 180:
/***/ (function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(52),
	    get = __webpack_require__(24),
	    hasIn = __webpack_require__(110),
	    isKey = __webpack_require__(42),
	    isStrictComparable = __webpack_require__(86),
	    matchesStrictComparable = __webpack_require__(87),
	    toKey = __webpack_require__(14);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;
	
	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  if (isKey(path) && isStrictComparable(srcValue)) {
	    return matchesStrictComparable(toKey(path), srcValue);
	  }
	  return function(object) {
	    var objValue = get(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn(object, path)
	      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
	  };
	}
	
	module.exports = baseMatchesProperty;


/***/ }),

/***/ 118:
/***/ (function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(35),
	    baseSet = __webpack_require__(63),
	    castPath = __webpack_require__(20);
	
	/**
	 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {string[]} paths The property paths to pick.
	 * @param {Function} predicate The function invoked per property.
	 * @returns {Object} Returns the new object.
	 */
	function basePickBy(object, paths, predicate) {
	  var index = -1,
	      length = paths.length,
	      result = {};
	
	  while (++index < length) {
	    var path = paths[index],
	        value = baseGet(object, path);
	
	    if (predicate(value, path)) {
	      baseSet(result, castPath(path, object), value);
	    }
	  }
	  return result;
	}
	
	module.exports = basePickBy;


/***/ }),

/***/ 69:
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}
	
	module.exports = baseProperty;


/***/ }),

/***/ 182:
/***/ (function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(35);
	
	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep(path) {
	  return function(object) {
	    return baseGet(object, path);
	  };
	}
	
	module.exports = basePropertyDeep;


/***/ }),

/***/ 63:
/***/ (function(module, exports, __webpack_require__) {

	var assignValue = __webpack_require__(77),
	    castPath = __webpack_require__(20),
	    isIndex = __webpack_require__(40),
	    isObject = __webpack_require__(5),
	    toKey = __webpack_require__(14);
	
	/**
	 * The base implementation of `_.set`.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {Array|string} path The path of the property to set.
	 * @param {*} value The value to set.
	 * @param {Function} [customizer] The function to customize path creation.
	 * @returns {Object} Returns `object`.
	 */
	function baseSet(object, path, value, customizer) {
	  if (!isObject(object)) {
	    return object;
	  }
	  path = castPath(path, object);
	
	  var index = -1,
	      length = path.length,
	      lastIndex = length - 1,
	      nested = object;
	
	  while (nested != null && ++index < length) {
	    var key = toKey(path[index]),
	        newValue = value;
	
	    if (index != lastIndex) {
	      var objValue = nested[key];
	      newValue = customizer ? customizer(objValue, key, nested) : undefined;
	      if (newValue === undefined) {
	        newValue = isObject(objValue)
	          ? objValue
	          : (isIndex(path[index + 1]) ? [] : {});
	      }
	    }
	    assignValue(nested, key, newValue);
	    nested = nested[key];
	  }
	  return object;
	}
	
	module.exports = baseSet;


/***/ }),

/***/ 183:
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(36),
	    arrayMap = __webpack_require__(18),
	    isArray = __webpack_require__(2),
	    isSymbol = __webpack_require__(37);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;
	
	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isArray(value)) {
	    // Recursively convert values (susceptible to call stack limits).
	    return arrayMap(value, baseToString) + '';
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}
	
	module.exports = baseToString;


/***/ }),

/***/ 104:
/***/ (function(module, exports) {

	/**
	 * Checks if a `cache` value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function cacheHas(cache, key) {
	  return cache.has(key);
	}
	
	module.exports = cacheHas;


/***/ }),

/***/ 20:
/***/ (function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(2),
	    isKey = __webpack_require__(42),
	    stringToPath = __webpack_require__(109),
	    toString = __webpack_require__(22);
	
	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath(value, object) {
	  if (isArray(value)) {
	    return value;
	  }
	  return isKey(value, object) ? [value] : stringToPath(toString(value));
	}
	
	module.exports = castPath;


/***/ }),

/***/ 978:
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(74),
	    toNumber = __webpack_require__(599),
	    toString = __webpack_require__(22);
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMin = Math.min;
	
	/**
	 * Creates a function like `_.round`.
	 *
	 * @private
	 * @param {string} methodName The name of the `Math` method to use when rounding.
	 * @returns {Function} Returns the new round function.
	 */
	function createRound(methodName) {
	  var func = Math[methodName];
	  return function(number, precision) {
	    number = toNumber(number);
	    precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);
	    if (precision) {
	      // Shift with exponential notation to avoid floating-point issues.
	      // See [MDN](https://mdn.io/round#Examples) for more details.
	      var pair = (toString(number) + 'e').split('e'),
	          value = func(pair[0] + 'e' + (+pair[1] + precision));
	
	      pair = (toString(value) + 'e').split('e');
	      return +(pair[0] + 'e' + (+pair[1] - precision));
	    }
	    return func(number);
	  };
	}
	
	module.exports = createRound;


/***/ }),

/***/ 83:
/***/ (function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(98),
	    arraySome = __webpack_require__(101),
	    cacheHas = __webpack_require__(104);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      arrLength = array.length,
	      othLength = other.length;
	
	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;
	
	  stack.set(array, other);
	  stack.set(other, array);
	
	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];
	
	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!arraySome(other, function(othValue, othIndex) {
	            if (!cacheHas(seen, othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	              return seen.push(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, bitmask, customizer, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}
	
	module.exports = equalArrays;


/***/ }),

/***/ 186:
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(36),
	    Uint8Array = __webpack_require__(256),
	    eq = __webpack_require__(147),
	    equalArrays = __webpack_require__(83),
	    mapToArray = __webpack_require__(122),
	    setToArray = __webpack_require__(145);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;
	
	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]';
	
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
	  switch (tag) {
	    case dataViewTag:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;
	
	    case arrayBufferTag:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;
	
	    case boolTag:
	    case dateTag:
	    case numberTag:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq(+object, +other);
	
	    case errorTag:
	      return object.name == other.name && object.message == other.message;
	
	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');
	
	    case mapTag:
	      var convert = mapToArray;
	
	    case setTag:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
	      convert || (convert = setToArray);
	
	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= COMPARE_UNORDERED_FLAG;
	
	      // Recursively compare objects (susceptible to call stack limits).
	      stack.set(object, other);
	      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	      stack['delete'](object);
	      return result;
	
	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}
	
	module.exports = equalByTag;


/***/ }),

/***/ 187:
/***/ (function(module, exports, __webpack_require__) {

	var getAllKeys = __webpack_require__(105);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      objProps = getAllKeys(object),
	      objLength = objProps.length,
	      othProps = getAllKeys(other),
	      othLength = othProps.length;
	
	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(object, other);
	  stack.set(other, object);
	
	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];
	
	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;
	
	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}
	
	module.exports = equalObjects;


/***/ }),

/***/ 105:
/***/ (function(module, exports, __webpack_require__) {

	var baseGetAllKeys = __webpack_require__(79),
	    getSymbols = __webpack_require__(56),
	    keys = __webpack_require__(19);
	
	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return baseGetAllKeys(object, keys, getSymbols);
	}
	
	module.exports = getAllKeys;


/***/ }),

/***/ 70:
/***/ (function(module, exports, __webpack_require__) {

	var baseGetAllKeys = __webpack_require__(79),
	    getSymbolsIn = __webpack_require__(106),
	    keysIn = __webpack_require__(124);
	
	/**
	 * Creates an array of own and inherited enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeysIn(object) {
	  return baseGetAllKeys(object, keysIn, getSymbolsIn);
	}
	
	module.exports = getAllKeysIn;


/***/ }),

/***/ 188:
/***/ (function(module, exports, __webpack_require__) {

	var isStrictComparable = __webpack_require__(86),
	    keys = __webpack_require__(19);
	
	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = keys(object),
	      length = result.length;
	
	  while (length--) {
	    var key = result[length],
	        value = object[key];
	
	    result[length] = [key, value, isStrictComparable(value)];
	  }
	  return result;
	}
	
	module.exports = getMatchData;


/***/ }),

/***/ 56:
/***/ (function(module, exports, __webpack_require__) {

	var arrayFilter = __webpack_require__(67),
	    stubArray = __webpack_require__(91);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;
	
	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
	  if (object == null) {
	    return [];
	  }
	  object = Object(object);
	  return arrayFilter(nativeGetSymbols(object), function(symbol) {
	    return propertyIsEnumerable.call(object, symbol);
	  });
	};
	
	module.exports = getSymbols;


/***/ }),

/***/ 106:
/***/ (function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(51),
	    getPrototype = __webpack_require__(219),
	    getSymbols = __webpack_require__(56),
	    stubArray = __webpack_require__(91);
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;
	
	/**
	 * Creates an array of the own and inherited enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
	  var result = [];
	  while (object) {
	    arrayPush(result, getSymbols(object));
	    object = getPrototype(object);
	  }
	  return result;
	};
	
	module.exports = getSymbolsIn;


/***/ }),

/***/ 21:
/***/ (function(module, exports, __webpack_require__) {

	var DataView = __webpack_require__(171),
	    Map = __webpack_require__(217),
	    Promise = __webpack_require__(172),
	    Set = __webpack_require__(173),
	    WeakMap = __webpack_require__(99),
	    baseGetTag = __webpack_require__(27),
	    toSource = __webpack_require__(305);
	
	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag = '[object Set]',
	    weakMapTag = '[object WeakMap]';
	
	var dataViewTag = '[object DataView]';
	
	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);
	
	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = baseGetTag;
	
	// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag(new Map) != mapTag) ||
	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = baseGetTag(value),
	        Ctor = result == objectTag ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : '';
	
	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}
	
	module.exports = getTag;


/***/ }),

/***/ 107:
/***/ (function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(20),
	    isArguments = __webpack_require__(111),
	    isArray = __webpack_require__(2),
	    isIndex = __webpack_require__(40),
	    isLength = __webpack_require__(224),
	    toKey = __webpack_require__(14);
	
	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath(object, path, hasFunc) {
	  path = castPath(path, object);
	
	  var index = -1,
	      length = path.length,
	      result = false;
	
	  while (++index < length) {
	    var key = toKey(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result || ++index != length) {
	    return result;
	  }
	  length = object == null ? 0 : object.length;
	  return !!length && isLength(length) && isIndex(key, length) &&
	    (isArray(object) || isArguments(object));
	}
	
	module.exports = hasPath;


/***/ }),

/***/ 42:
/***/ (function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(2),
	    isSymbol = __webpack_require__(37);
	
	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;
	
	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  if (isArray(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}
	
	module.exports = isKey;


/***/ }),

/***/ 86:
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(5);
	
	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject(value);
	}
	
	module.exports = isStrictComparable;


/***/ }),

/***/ 122:
/***/ (function(module, exports) {

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);
	
	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}
	
	module.exports = mapToArray;


/***/ }),

/***/ 87:
/***/ (function(module, exports) {

	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function matchesStrictComparable(key, srcValue) {
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue &&
	      (srcValue !== undefined || (key in Object(object)));
	  };
	}
	
	module.exports = matchesStrictComparable;


/***/ }),

/***/ 189:
/***/ (function(module, exports, __webpack_require__) {

	var memoize = __webpack_require__(197);
	
	/** Used as the maximum memoize cache size. */
	var MAX_MEMOIZE_SIZE = 500;
	
	/**
	 * A specialized version of `_.memoize` which clears the memoized function's
	 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
	 *
	 * @private
	 * @param {Function} func The function to have its output memoized.
	 * @returns {Function} Returns the new memoized function.
	 */
	function memoizeCapped(func) {
	  var result = memoize(func, function(key) {
	    if (cache.size === MAX_MEMOIZE_SIZE) {
	      cache.clear();
	    }
	    return key;
	  });
	
	  var cache = result.cache;
	  return result;
	}
	
	module.exports = memoizeCapped;


/***/ }),

/***/ 190:
/***/ (function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(299);
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = overArg(Object.keys, Object);
	
	module.exports = nativeKeys;


/***/ }),

/***/ 192:
/***/ (function(module, exports) {

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}
	
	module.exports = setCacheAdd;


/***/ }),

/***/ 193:
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}
	
	module.exports = setCacheHas;


/***/ }),

/***/ 145:
/***/ (function(module, exports) {

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);
	
	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}
	
	module.exports = setToArray;


/***/ }),

/***/ 109:
/***/ (function(module, exports, __webpack_require__) {

	var memoizeCapped = __webpack_require__(189);
	
	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
	
	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;
	
	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath = memoizeCapped(function(string) {
	  var result = [];
	  if (string.charCodeAt(0) === 46 /* . */) {
	    result.push('');
	  }
	  string.replace(rePropName, function(match, number, quote, subString) {
	    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});
	
	module.exports = stringToPath;


/***/ }),

/***/ 14:
/***/ (function(module, exports, __webpack_require__) {

	var isSymbol = __webpack_require__(37);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey(value) {
	  if (typeof value == 'string' || isSymbol(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}
	
	module.exports = toKey;


/***/ }),

/***/ 24:
/***/ (function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(35);
	
	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is returned in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get(object, path, defaultValue) {
	  var result = object == null ? undefined : baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}
	
	module.exports = get;


/***/ }),

/***/ 110:
/***/ (function(module, exports, __webpack_require__) {

	var baseHasIn = __webpack_require__(176),
	    hasPath = __webpack_require__(107);
	
	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn(object, path) {
	  return object != null && hasPath(object, path, baseHasIn);
	}
	
	module.exports = hasIn;


/***/ }),

/***/ 19:
/***/ (function(module, exports, __webpack_require__) {

	var arrayLikeKeys = __webpack_require__(259),
	    baseKeys = __webpack_require__(53),
	    isArrayLike = __webpack_require__(25);
	
	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}
	
	module.exports = keys;


/***/ }),

/***/ 197:
/***/ (function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(116);
	
	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */
	function memoize(func, resolver) {
	  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var memoized = function() {
	    var args = arguments,
	        key = resolver ? resolver.apply(this, args) : args[0],
	        cache = memoized.cache;
	
	    if (cache.has(key)) {
	      return cache.get(key);
	    }
	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result) || cache;
	    return result;
	  };
	  memoized.cache = new (memoize.Cache || MapCache);
	  return memoized;
	}
	
	// Expose `MapCache`.
	memoize.Cache = MapCache;
	
	module.exports = memoize;


/***/ }),

/***/ 225:
/***/ (function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(18),
	    baseIteratee = __webpack_require__(11),
	    basePickBy = __webpack_require__(118),
	    getAllKeysIn = __webpack_require__(70);
	
	/**
	 * Creates an object composed of the `object` properties `predicate` returns
	 * truthy for. The predicate is invoked with two arguments: (value, key).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The source object.
	 * @param {Function} [predicate=_.identity] The function invoked per property.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': '2', 'c': 3 };
	 *
	 * _.pickBy(object, _.isNumber);
	 * // => { 'a': 1, 'c': 3 }
	 */
	function pickBy(object, predicate) {
	  if (object == null) {
	    return {};
	  }
	  var props = arrayMap(getAllKeysIn(object), function(prop) {
	    return [prop];
	  });
	  predicate = baseIteratee(predicate);
	  return basePickBy(object, props, function(value, path) {
	    return predicate(value, path[0]);
	  });
	}
	
	module.exports = pickBy;


/***/ }),

/***/ 198:
/***/ (function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(69),
	    basePropertyDeep = __webpack_require__(182),
	    isKey = __webpack_require__(42),
	    toKey = __webpack_require__(14);
	
	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */
	function property(path) {
	  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
	}
	
	module.exports = property;


/***/ }),

/***/ 1017:
/***/ (function(module, exports, __webpack_require__) {

	var createRound = __webpack_require__(978);
	
	/**
	 * Computes `number` rounded to `precision`.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.10.0
	 * @category Math
	 * @param {number} number The number to round.
	 * @param {number} [precision=0] The precision to round to.
	 * @returns {number} Returns the rounded number.
	 * @example
	 *
	 * _.round(4.006);
	 * // => 4
	 *
	 * _.round(4.006, 2);
	 * // => 4.01
	 *
	 * _.round(4060, -2);
	 * // => 4100
	 */
	var round = createRound('round');
	
	module.exports = round;


/***/ }),

/***/ 91:
/***/ (function(module, exports) {

	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */
	function stubArray() {
	  return [];
	}
	
	module.exports = stubArray;


/***/ }),

/***/ 74:
/***/ (function(module, exports, __webpack_require__) {

	var toFinite = __webpack_require__(339);
	
	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3.2);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3.2');
	 * // => 3
	 */
	function toInteger(value) {
	  var result = toFinite(value),
	      remainder = result % 1;
	
	  return result === result ? (remainder ? result - remainder : result) : 0;
	}
	
	module.exports = toInteger;


/***/ }),

/***/ 22:
/***/ (function(module, exports, __webpack_require__) {

	var baseToString = __webpack_require__(183);
	
	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : baseToString(value);
	}
	
	module.exports = toString;


/***/ }),

/***/ 1026:
/***/ (function(module, exports, __webpack_require__) {

	var wrappy = __webpack_require__(1262)
	module.exports = wrappy(once)
	module.exports.strict = wrappy(onceStrict)
	
	once.proto = once(function () {
	  Object.defineProperty(Function.prototype, 'once', {
	    value: function () {
	      return once(this)
	    },
	    configurable: true
	  })
	
	  Object.defineProperty(Function.prototype, 'onceStrict', {
	    value: function () {
	      return onceStrict(this)
	    },
	    configurable: true
	  })
	})
	
	function once (fn) {
	  var f = function () {
	    if (f.called) return f.value
	    f.called = true
	    return f.value = fn.apply(this, arguments)
	  }
	  f.called = false
	  return f
	}
	
	function onceStrict (fn) {
	  var f = function () {
	    if (f.called)
	      throw new Error(f.onceError)
	    f.called = true
	    return f.value = fn.apply(this, arguments)
	  }
	  var name = fn.name || 'Function wrapped with `once`'
	  f.onceError = name + " shouldn't be called more than once"
	  f.called = false
	  return f
	}


/***/ }),

/***/ 1041:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _propTypes = __webpack_require__(3);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	var _reactDom = __webpack_require__(199);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _elementResizeDetector = __webpack_require__(849);
	
	var _elementResizeDetector2 = _interopRequireDefault(_elementResizeDetector);
	
	var _invariant = __webpack_require__(26);
	
	var _invariant2 = _interopRequireDefault(_invariant);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var ContainerDimensions = function (_Component) {
	  _inherits(ContainerDimensions, _Component);
	
	  _createClass(ContainerDimensions, null, [{
	    key: 'getDomNodeDimensions',
	    value: function getDomNodeDimensions(node) {
	      var _node$getBoundingClie = node.getBoundingClientRect(),
	          top = _node$getBoundingClie.top,
	          right = _node$getBoundingClie.right,
	          bottom = _node$getBoundingClie.bottom,
	          left = _node$getBoundingClie.left,
	          width = _node$getBoundingClie.width,
	          height = _node$getBoundingClie.height;
	
	      return { top: top, right: right, bottom: bottom, left: left, width: width, height: height };
	    }
	  }]);
	
	  function ContainerDimensions() {
	    _classCallCheck(this, ContainerDimensions);
	
	    var _this = _possibleConstructorReturn(this, (ContainerDimensions.__proto__ || Object.getPrototypeOf(ContainerDimensions)).call(this));
	
	    _this.state = {
	      initiated: false
	    };
	    _this.onResize = _this.onResize.bind(_this);
	    return _this;
	  }
	
	  _createClass(ContainerDimensions, [{
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      this.parentNode = _reactDom2.default.findDOMNode(this).parentNode;
	      this.elementResizeDetector = (0, _elementResizeDetector2.default)({
	        strategy: 'scroll',
	        callOnAdd: false
	      });
	      this.elementResizeDetector.listenTo(this.parentNode, this.onResize);
	      this.componentIsMounted = true;
	      this.onResize();
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      this.componentIsMounted = false;
	      this.elementResizeDetector.uninstall(this.parentNode);
	    }
	  }, {
	    key: 'onResize',
	    value: function onResize() {
	      var clientRect = ContainerDimensions.getDomNodeDimensions(this.parentNode);
	      if (this.componentIsMounted) {
	        this.setState(_extends({
	          initiated: true
	        }, clientRect));
	      }
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      (0, _invariant2.default)(this.props.children, 'Expected children to be one of function or React.Element');
	
	      if (!this.state.initiated) {
	        return _react2.default.createElement('div', null);
	      }
	      if (typeof this.props.children === 'function') {
	        var renderedChildren = this.props.children(this.state);
	        return renderedChildren && _react.Children.only(renderedChildren);
	      }
	      return _react.Children.only(_react2.default.cloneElement(this.props.children, this.state));
	    }
	  }]);
	
	  return ContainerDimensions;
	}(_react.Component);
	
	ContainerDimensions.propTypes = {
	  children: _propTypes2.default.oneOfType([_propTypes2.default.element, _propTypes2.default.func]).isRequired
	};
	exports.default = ContainerDimensions;

/***/ }),

/***/ 114:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _propTypes = __webpack_require__(3);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	var _httpplease = __webpack_require__(913);
	
	var _httpplease2 = _interopRequireDefault(_httpplease);
	
	var _oldiexdomain = __webpack_require__(917);
	
	var _oldiexdomain2 = _interopRequireDefault(_oldiexdomain);
	
	var _utils = __webpack_require__(1112);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var http = _httpplease2.default.use(_oldiexdomain2.default);
	
	var Status = {
	  PENDING: 'pending',
	  LOADING: 'loading',
	  LOADED: 'loaded',
	  FAILED: 'failed',
	  UNSUPPORTED: 'unsupported'
	};
	
	var getRequestsByUrl = {};
	var loadedIcons = {};
	
	var InlineSVG = function (_React$PureComponent) {
	  _inherits(InlineSVG, _React$PureComponent);
	
	  function InlineSVG(props) {
	    _classCallCheck(this, InlineSVG);
	
	    var _this = _possibleConstructorReturn(this, (InlineSVG.__proto__ || Object.getPrototypeOf(InlineSVG)).call(this, props));
	
	    _this.handleLoad = function (err, res) {
	      var isCached = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	
	      if (err) {
	        _this.fail(err);
	        return;
	      }
	
	      if (_this.isActive) {
	        _this.setState({
	          loadedText: res.text,
	          status: Status.LOADED
	        }, function () {
	          _this.props.onLoad(_this.props.src, isCached);
	        });
	      }
	    };
	
	    _this.state = {
	      status: Status.PENDING
	    };
	
	    _this.isActive = false;
	    return _this;
	  }
	
	  _createClass(InlineSVG, [{
	    key: 'componentWillMount',
	    value: function componentWillMount() {
	      this.isActive = true;
	    }
	  }, {
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      /* istanbul ignore else */
	      if (this.state.status === Status.PENDING) {
	        if (this.props.supportTest()) {
	          if (this.props.src) {
	            this.startLoad();
	          } else {
	            this.fail((0, _utils.configurationError)('Missing source'));
	          }
	        } else {
	          this.fail((0, _utils.unsupportedBrowserError)());
	        }
	      }
	    }
	  }, {
	    key: 'componentDidUpdate',
	    value: function componentDidUpdate(prevProps) {
	      if (prevProps.src !== this.props.src) {
	        if (this.props.src) {
	          this.startLoad();
	        } else {
	          this.fail((0, _utils.configurationError)('Missing source'));
	        }
	      }
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      this.isActive = false;
	    }
	  }, {
	    key: 'getFile',
	    value: function getFile(callback) {
	      var _this2 = this;
	
	      var _props = this.props,
	          cacheGetRequests = _props.cacheGetRequests,
	          src = _props.src;
	
	
	      if (cacheGetRequests) {
	        if (loadedIcons[src]) {
	          var _loadedIcons$src = _slicedToArray(loadedIcons[src], 2),
	              err = _loadedIcons$src[0],
	              res = _loadedIcons$src[1];
	
	          callback(err, res, true);
	        }
	
	        if (!getRequestsByUrl[src]) {
	          getRequestsByUrl[src] = [];
	
	          http.get(src, function (err, res) {
	            getRequestsByUrl[src].forEach(function (cb) {
	              loadedIcons[src] = [err, res];
	
	              if (src === _this2.props.src) {
	                cb(err, res);
	              }
	            });
	          });
	        }
	
	        getRequestsByUrl[src].push(callback);
	      } else {
	        http.get(src, function (err, res) {
	          if (src === _this2.props.src) {
	            callback(err, res);
	          }
	        });
	      }
	    }
	  }, {
	    key: 'fail',
	    value: function fail(error) {
	      var _this3 = this;
	
	      var status = error.isUnsupportedBrowserError ? Status.UNSUPPORTED : Status.FAILED;
	
	      /* istanbul ignore else */
	      if (this.isActive) {
	        this.setState({ status: status }, function () {
	          if (typeof _this3.props.onError === 'function') {
	            _this3.props.onError(error);
	          }
	        });
	      }
	    }
	  }, {
	    key: 'startLoad',
	    value: function startLoad() {
	      /* istanbul ignore else */
	      if (this.isActive) {
	        this.setState({
	          status: Status.LOADING
	        }, this.load);
	      }
	    }
	  }, {
	    key: 'load',
	    value: function load() {
	      var match = this.props.src.match(/data:image\/svg[^,]*?(;base64)?,(.*)/);
	
	      if (match) {
	        return this.handleLoad(null, {
	          text: match[1] ? atob(match[2]) : decodeURIComponent(match[2])
	        });
	      }
	
	      return this.getFile(this.handleLoad);
	    }
	  }, {
	    key: 'getClassName',
	    value: function getClassName() {
	      var className = 'isvg ' + this.state.status;
	
	      if (this.props.className) {
	        className += ' ' + this.props.className;
	      }
	
	      return className;
	    }
	  }, {
	    key: 'processSVG',
	    value: function processSVG(svgText) {
	      var _props2 = this.props,
	          uniquifyIDs = _props2.uniquifyIDs,
	          uniqueHash = _props2.uniqueHash,
	          baseURL = _props2.baseURL;
	
	
	      if (uniquifyIDs) {
	        return (0, _utils.uniquifySVGIDs)(svgText, uniqueHash || (0, _utils.randomString)(), baseURL);
	      }
	
	      return svgText;
	    }
	  }, {
	    key: 'renderContents',
	    value: function renderContents() {
	      switch (this.state.status) {
	        case Status.UNSUPPORTED:
	        case Status.FAILED:
	          return this.props.children;
	        default:
	          return this.props.preloader;
	      }
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var content = void 0;
	      var html = void 0;
	
	      if (this.state.loadedText) {
	        html = {
	          __html: this.processSVG(this.state.loadedText)
	        };
	      } else {
	        content = this.renderContents();
	      }
	
	      return this.props.wrapper({
	        style: this.props.style,
	        className: this.getClassName(),
	        dangerouslySetInnerHTML: html
	      }, content);
	    }
	  }]);
	
	  return InlineSVG;
	}(_react2.default.PureComponent);
	
	InlineSVG.propTypes = {
	  baseURL: _propTypes2.default.string,
	  cacheGetRequests: _propTypes2.default.bool,
	  children: _propTypes2.default.node,
	  className: _propTypes2.default.string,
	  onError: _propTypes2.default.func,
	  onLoad: _propTypes2.default.func,
	  preloader: _propTypes2.default.node,
	  src: _propTypes2.default.string.isRequired,
	  style: _propTypes2.default.object,
	  supportTest: _propTypes2.default.func,
	  uniqueHash: _propTypes2.default.string,
	  uniquifyIDs: _propTypes2.default.bool,
	  wrapper: _propTypes2.default.func
	};
	InlineSVG.defaultProps = {
	  baseURL: '',
	  cacheGetRequests: false,
	  onLoad: function onLoad() {},
	  supportTest: _utils.isSupportedEnvironment,
	  uniquifyIDs: true,
	  wrapper: _react2.default.createFactory('span')
	};
	exports.default = InlineSVG;

/***/ }),

/***/ 1112:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.configurationError = exports.unsupportedBrowserError = exports.uniquifySVGIDs = exports.randomString = exports.isSupportedEnvironment = exports.supportsInlineSVG = undefined;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _once = __webpack_require__(1026);
	
	var _once2 = _interopRequireDefault(_once);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var supportsInlineSVG = exports.supportsInlineSVG = (0, _once2.default)(function () {
	  /* istanbul ignore next */
	  if (!document) {
	    return false;
	  }
	
	  var div = document.createElement('div');
	  div.innerHTML = '<svg />';
	  return div.firstChild && div.firstChild.namespaceURI === 'http://www.w3.org/2000/svg';
	});
	
	var isSupportedEnvironment = exports.isSupportedEnvironment = (0, _once2.default)(function () {
	  return supportsInlineSVG() && typeof window !== 'undefined' && window !== null ? window.XMLHttpRequest || window.XDomainRequest : false;
	});
	
	var randomString = exports.randomString = function randomString() {
	  var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8;
	
	  var letters = 'abcdefghijklmnopqrstuvwxyz';
	  var numbers = '1234567890';
	  var charset = letters + letters.toUpperCase() + numbers;
	
	  var randomCharacter = function randomCharacter(array) {
	    return array[Math.floor(Math.random() * array.length)];
	  };
	
	  var R = '';
	  for (var i = 0; i < length; i++) {
	    R += randomCharacter(charset);
	  }
	  return R;
	};
	
	var uniquifySVGIDs = exports.uniquifySVGIDs = function () {
	  var mkAttributePattern = function mkAttributePattern(attr) {
	    return '(?:(?:\\s|\\:)' + attr + ')';
	  };
	
	  var idPattern = new RegExp('(?:(' + mkAttributePattern('id') + ')="([^"]+)")|(?:(' + mkAttributePattern('href') + '|' + mkAttributePattern('role') + '|' + mkAttributePattern('arcrole') + ')="\\#([^"]+)")|(?:="url\\(\\#([^\\)]+)\\)")|(?:url\\(\\#([^\\)]+)\\))', 'g');
	
	  return function (svgText, svgID, baseURL) {
	    var uniquifyID = function uniquifyID(id) {
	      return id + '___' + svgID;
	    };
	
	    return svgText.replace(idPattern, function (m, p1, p2, p3, p4, p5, p6) {
	      //eslint-disable-line consistent-return
	      /* istanbul ignore else */
	      if (p2) {
	        return p1 + '="' + uniquifyID(p2) + '"';
	      } else if (p4) {
	        return p3 + '="' + baseURL + '#' + uniquifyID(p4) + '"';
	      } else if (p5) {
	        return '="url(' + baseURL + '#' + uniquifyID(p5) + ')"';
	      } else if (p6) {
	        return 'url(' + baseURL + '#' + uniquifyID(p6) + ')';
	      }
	    });
	  };
	}();
	
	var InlineSVGError = function (_Error) {
	  _inherits(InlineSVGError, _Error);
	
	  function InlineSVGError(message) {
	    var _ret;
	
	    _classCallCheck(this, InlineSVGError);
	
	    var _this = _possibleConstructorReturn(this, (InlineSVGError.__proto__ || Object.getPrototypeOf(InlineSVGError)).call(this));
	
	    _this.name = 'InlineSVGError';
	    _this.isSupportedBrowser = true;
	    _this.isConfigurationError = false;
	    _this.isUnsupportedBrowserError = false;
	    _this.message = message;
	
	    return _ret = _this, _possibleConstructorReturn(_this, _ret);
	  }
	
	  return InlineSVGError;
	}(Error);
	
	var createError = function createError(message, attrs) {
	  var err = new InlineSVGError(message);
	
	  return _extends({}, err, attrs);
	};
	
	var unsupportedBrowserError = exports.unsupportedBrowserError = function unsupportedBrowserError(message) {
	  var newMessage = message;
	
	  /* istanbul ignore else */
	  if (!newMessage) {
	    newMessage = 'Unsupported Browser';
	  }
	
	  return createError(newMessage, {
	    isSupportedBrowser: false,
	    isUnsupportedBrowserError: true
	  });
	};
	
	var configurationError = exports.configurationError = function configurationError(message) {
	  return createError(message, {
	    isConfigurationError: true
	  });
	};

/***/ }),

/***/ 360:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.createProvider = createProvider;
	
	var _react = __webpack_require__(1);
	
	var _propTypes = __webpack_require__(3);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	var _PropTypes = __webpack_require__(160);
	
	var _warning = __webpack_require__(95);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var didWarnAboutReceivingStore = false;
	function warnAboutReceivingStore() {
	  if (didWarnAboutReceivingStore) {
	    return;
	  }
	  didWarnAboutReceivingStore = true;
	
	  (0, _warning2.default)('<Provider> does not support changing `store` on the fly. ' + 'It is most likely that you see this error because you updated to ' + 'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' + 'automatically. See https://github.com/reactjs/react-redux/releases/' + 'tag/v2.0.0 for the migration instructions.');
	}
	
	function createProvider() {
	  var _Provider$childContex;
	
	  var storeKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'store';
	  var subKey = arguments[1];
	
	  var subscriptionKey = subKey || storeKey + 'Subscription';
	
	  var Provider = function (_Component) {
	    _inherits(Provider, _Component);
	
	    Provider.prototype.getChildContext = function getChildContext() {
	      var _ref;
	
	      return _ref = {}, _ref[storeKey] = this[storeKey], _ref[subscriptionKey] = null, _ref;
	    };
	
	    function Provider(props, context) {
	      _classCallCheck(this, Provider);
	
	      var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));
	
	      _this[storeKey] = props.store;
	      return _this;
	    }
	
	    Provider.prototype.render = function render() {
	      return _react.Children.only(this.props.children);
	    };
	
	    return Provider;
	  }(_react.Component);
	
	  if (false) {
	    Provider.prototype.componentWillReceiveProps = function (nextProps) {
	      if (this[storeKey] !== nextProps.store) {
	        warnAboutReceivingStore();
	      }
	    };
	  }
	
	  Provider.propTypes = {
	    store: _PropTypes.storeShape.isRequired,
	    children: _propTypes2.default.element.isRequired
	  };
	  Provider.childContextTypes = (_Provider$childContex = {}, _Provider$childContex[storeKey] = _PropTypes.storeShape.isRequired, _Provider$childContex[subscriptionKey] = _PropTypes.subscriptionShape, _Provider$childContex);
	
	  return Provider;
	}
	
	exports.default = createProvider();

/***/ }),

/***/ 157:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	exports.default = connectAdvanced;
	
	var _hoistNonReactStatics = __webpack_require__(31);
	
	var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);
	
	var _invariant = __webpack_require__(26);
	
	var _invariant2 = _interopRequireDefault(_invariant);
	
	var _react = __webpack_require__(1);
	
	var _Subscription = __webpack_require__(367);
	
	var _Subscription2 = _interopRequireDefault(_Subscription);
	
	var _PropTypes = __webpack_require__(160);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	var hotReloadingVersion = 0;
	var dummyState = {};
	function noop() {}
	function makeSelectorStateful(sourceSelector, store) {
	  // wrap the selector in an object that tracks its results between runs.
	  var selector = {
	    run: function runComponentSelector(props) {
	      try {
	        var nextProps = sourceSelector(store.getState(), props);
	        if (nextProps !== selector.props || selector.error) {
	          selector.shouldComponentUpdate = true;
	          selector.props = nextProps;
	          selector.error = null;
	        }
	      } catch (error) {
	        selector.shouldComponentUpdate = true;
	        selector.error = error;
	      }
	    }
	  };
	
	  return selector;
	}
	
	function connectAdvanced(
	/*
	  selectorFactory is a func that is responsible for returning the selector function used to
	  compute new props from state, props, and dispatch. For example:
	     export default connectAdvanced((dispatch, options) => (state, props) => ({
	      thing: state.things[props.thingId],
	      saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
	    }))(YourComponent)
	   Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
	  outside of their selector as an optimization. Options passed to connectAdvanced are passed to
	  the selectorFactory, along with displayName and WrappedComponent, as the second argument.
	   Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
	  props. Do not use connectAdvanced directly without memoizing results between calls to your
	  selector, otherwise the Connect component will re-render on every state or props change.
	*/
	selectorFactory) {
	  var _contextTypes, _childContextTypes;
	
	  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	      _ref$getDisplayName = _ref.getDisplayName,
	      getDisplayName = _ref$getDisplayName === undefined ? function (name) {
	    return 'ConnectAdvanced(' + name + ')';
	  } : _ref$getDisplayName,
	      _ref$methodName = _ref.methodName,
	      methodName = _ref$methodName === undefined ? 'connectAdvanced' : _ref$methodName,
	      _ref$renderCountProp = _ref.renderCountProp,
	      renderCountProp = _ref$renderCountProp === undefined ? undefined : _ref$renderCountProp,
	      _ref$shouldHandleStat = _ref.shouldHandleStateChanges,
	      shouldHandleStateChanges = _ref$shouldHandleStat === undefined ? true : _ref$shouldHandleStat,
	      _ref$storeKey = _ref.storeKey,
	      storeKey = _ref$storeKey === undefined ? 'store' : _ref$storeKey,
	      _ref$withRef = _ref.withRef,
	      withRef = _ref$withRef === undefined ? false : _ref$withRef,
	      connectOptions = _objectWithoutProperties(_ref, ['getDisplayName', 'methodName', 'renderCountProp', 'shouldHandleStateChanges', 'storeKey', 'withRef']);
	
	  var subscriptionKey = storeKey + 'Subscription';
	  var version = hotReloadingVersion++;
	
	  var contextTypes = (_contextTypes = {}, _contextTypes[storeKey] = _PropTypes.storeShape, _contextTypes[subscriptionKey] = _PropTypes.subscriptionShape, _contextTypes);
	  var childContextTypes = (_childContextTypes = {}, _childContextTypes[subscriptionKey] = _PropTypes.subscriptionShape, _childContextTypes);
	
	  return function wrapWithConnect(WrappedComponent) {
	    (0, _invariant2.default)(typeof WrappedComponent == 'function', 'You must pass a component to the function returned by ' + (methodName + '. Instead received ' + JSON.stringify(WrappedComponent)));
	
	    var wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
	
	    var displayName = getDisplayName(wrappedComponentName);
	
	    var selectorFactoryOptions = _extends({}, connectOptions, {
	      getDisplayName: getDisplayName,
	      methodName: methodName,
	      renderCountProp: renderCountProp,
	      shouldHandleStateChanges: shouldHandleStateChanges,
	      storeKey: storeKey,
	      withRef: withRef,
	      displayName: displayName,
	      wrappedComponentName: wrappedComponentName,
	      WrappedComponent: WrappedComponent
	    });
	
	    var Connect = function (_Component) {
	      _inherits(Connect, _Component);
	
	      function Connect(props, context) {
	        _classCallCheck(this, Connect);
	
	        var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));
	
	        _this.version = version;
	        _this.state = {};
	        _this.renderCount = 0;
	        _this.store = props[storeKey] || context[storeKey];
	        _this.propsMode = Boolean(props[storeKey]);
	        _this.setWrappedInstance = _this.setWrappedInstance.bind(_this);
	
	        (0, _invariant2.default)(_this.store, 'Could not find "' + storeKey + '" in either the context or props of ' + ('"' + displayName + '". Either wrap the root component in a <Provider>, ') + ('or explicitly pass "' + storeKey + '" as a prop to "' + displayName + '".'));
	
	        _this.initSelector();
	        _this.initSubscription();
	        return _this;
	      }
	
	      Connect.prototype.getChildContext = function getChildContext() {
	        var _ref2;
	
	        // If this component received store from props, its subscription should be transparent
	        // to any descendants receiving store+subscription from context; it passes along
	        // subscription passed to it. Otherwise, it shadows the parent subscription, which allows
	        // Connect to control ordering of notifications to flow top-down.
	        var subscription = this.propsMode ? null : this.subscription;
	        return _ref2 = {}, _ref2[subscriptionKey] = subscription || this.context[subscriptionKey], _ref2;
	      };
	
	      Connect.prototype.componentDidMount = function componentDidMount() {
	        if (!shouldHandleStateChanges) return;
	
	        // componentWillMount fires during server side rendering, but componentDidMount and
	        // componentWillUnmount do not. Because of this, trySubscribe happens during ...didMount.
	        // Otherwise, unsubscription would never take place during SSR, causing a memory leak.
	        // To handle the case where a child component may have triggered a state change by
	        // dispatching an action in its componentWillMount, we have to re-run the select and maybe
	        // re-render.
	        this.subscription.trySubscribe();
	        this.selector.run(this.props);
	        if (this.selector.shouldComponentUpdate) this.forceUpdate();
	      };
	
	      Connect.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
	        this.selector.run(nextProps);
	      };
	
	      Connect.prototype.shouldComponentUpdate = function shouldComponentUpdate() {
	        return this.selector.shouldComponentUpdate;
	      };
	
	      Connect.prototype.componentWillUnmount = function componentWillUnmount() {
	        if (this.subscription) this.subscription.tryUnsubscribe();
	        this.subscription = null;
	        this.notifyNestedSubs = noop;
	        this.store = null;
	        this.selector.run = noop;
	        this.selector.shouldComponentUpdate = false;
	      };
	
	      Connect.prototype.getWrappedInstance = function getWrappedInstance() {
	        (0, _invariant2.default)(withRef, 'To access the wrapped instance, you need to specify ' + ('{ withRef: true } in the options argument of the ' + methodName + '() call.'));
	        return this.wrappedInstance;
	      };
	
	      Connect.prototype.setWrappedInstance = function setWrappedInstance(ref) {
	        this.wrappedInstance = ref;
	      };
	
	      Connect.prototype.initSelector = function initSelector() {
	        var sourceSelector = selectorFactory(this.store.dispatch, selectorFactoryOptions);
	        this.selector = makeSelectorStateful(sourceSelector, this.store);
	        this.selector.run(this.props);
	      };
	
	      Connect.prototype.initSubscription = function initSubscription() {
	        if (!shouldHandleStateChanges) return;
	
	        // parentSub's source should match where store came from: props vs. context. A component
	        // connected to the store via props shouldn't use subscription from context, or vice versa.
	        var parentSub = (this.propsMode ? this.props : this.context)[subscriptionKey];
	        this.subscription = new _Subscription2.default(this.store, parentSub, this.onStateChange.bind(this));
	
	        // `notifyNestedSubs` is duplicated to handle the case where the component is  unmounted in
	        // the middle of the notification loop, where `this.subscription` will then be null. An
	        // extra null check every change can be avoided by copying the method onto `this` and then
	        // replacing it with a no-op on unmount. This can probably be avoided if Subscription's
	        // listeners logic is changed to not call listeners that have been unsubscribed in the
	        // middle of the notification loop.
	        this.notifyNestedSubs = this.subscription.notifyNestedSubs.bind(this.subscription);
	      };
	
	      Connect.prototype.onStateChange = function onStateChange() {
	        this.selector.run(this.props);
	
	        if (!this.selector.shouldComponentUpdate) {
	          this.notifyNestedSubs();
	        } else {
	          this.componentDidUpdate = this.notifyNestedSubsOnComponentDidUpdate;
	          this.setState(dummyState);
	        }
	      };
	
	      Connect.prototype.notifyNestedSubsOnComponentDidUpdate = function notifyNestedSubsOnComponentDidUpdate() {
	        // `componentDidUpdate` is conditionally implemented when `onStateChange` determines it
	        // needs to notify nested subs. Once called, it unimplements itself until further state
	        // changes occur. Doing it this way vs having a permanent `componentDidUpdate` that does
	        // a boolean check every time avoids an extra method call most of the time, resulting
	        // in some perf boost.
	        this.componentDidUpdate = undefined;
	        this.notifyNestedSubs();
	      };
	
	      Connect.prototype.isSubscribed = function isSubscribed() {
	        return Boolean(this.subscription) && this.subscription.isSubscribed();
	      };
	
	      Connect.prototype.addExtraProps = function addExtraProps(props) {
	        if (!withRef && !renderCountProp && !(this.propsMode && this.subscription)) return props;
	        // make a shallow copy so that fields added don't leak to the original selector.
	        // this is especially important for 'ref' since that's a reference back to the component
	        // instance. a singleton memoized selector would then be holding a reference to the
	        // instance, preventing the instance from being garbage collected, and that would be bad
	        var withExtras = _extends({}, props);
	        if (withRef) withExtras.ref = this.setWrappedInstance;
	        if (renderCountProp) withExtras[renderCountProp] = this.renderCount++;
	        if (this.propsMode && this.subscription) withExtras[subscriptionKey] = this.subscription;
	        return withExtras;
	      };
	
	      Connect.prototype.render = function render() {
	        var selector = this.selector;
	        selector.shouldComponentUpdate = false;
	
	        if (selector.error) {
	          throw selector.error;
	        } else {
	          return (0, _react.createElement)(WrappedComponent, this.addExtraProps(selector.props));
	        }
	      };
	
	      return Connect;
	    }(_react.Component);
	
	    Connect.WrappedComponent = WrappedComponent;
	    Connect.displayName = displayName;
	    Connect.childContextTypes = childContextTypes;
	    Connect.contextTypes = contextTypes;
	    Connect.propTypes = contextTypes;
	
	    if (false) {
	      Connect.prototype.componentWillUpdate = function componentWillUpdate() {
	        var _this2 = this;
	
	        // We are hot reloading!
	        if (this.version !== version) {
	          this.version = version;
	          this.initSelector();
	
	          // If any connected descendants don't hot reload (and resubscribe in the process), their
	          // listeners will be lost when we unsubscribe. Unfortunately, by copying over all
	          // listeners, this does mean that the old versions of connected descendants will still be
	          // notified of state changes; however, their onStateChange function is a no-op so this
	          // isn't a huge deal.
	          var oldListeners = [];
	
	          if (this.subscription) {
	            oldListeners = this.subscription.listeners.get();
	            this.subscription.tryUnsubscribe();
	          }
	          this.initSubscription();
	          if (shouldHandleStateChanges) {
	            this.subscription.trySubscribe();
	            oldListeners.forEach(function (listener) {
	              return _this2.subscription.listeners.subscribe(listener);
	            });
	          }
	        }
	      };
	    }
	
	    return (0, _hoistNonReactStatics2.default)(Connect, WrappedComponent);
	  };
	}

/***/ }),

/***/ 361:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	exports.createConnect = createConnect;
	
	var _connectAdvanced = __webpack_require__(157);
	
	var _connectAdvanced2 = _interopRequireDefault(_connectAdvanced);
	
	var _shallowEqual = __webpack_require__(368);
	
	var _shallowEqual2 = _interopRequireDefault(_shallowEqual);
	
	var _mapDispatchToProps = __webpack_require__(362);
	
	var _mapDispatchToProps2 = _interopRequireDefault(_mapDispatchToProps);
	
	var _mapStateToProps = __webpack_require__(363);
	
	var _mapStateToProps2 = _interopRequireDefault(_mapStateToProps);
	
	var _mergeProps = __webpack_require__(364);
	
	var _mergeProps2 = _interopRequireDefault(_mergeProps);
	
	var _selectorFactory = __webpack_require__(365);
	
	var _selectorFactory2 = _interopRequireDefault(_selectorFactory);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	/*
	  connect is a facade over connectAdvanced. It turns its args into a compatible
	  selectorFactory, which has the signature:
	
	    (dispatch, options) => (nextState, nextOwnProps) => nextFinalProps
	  
	  connect passes its args to connectAdvanced as options, which will in turn pass them to
	  selectorFactory each time a Connect component instance is instantiated or hot reloaded.
	
	  selectorFactory returns a final props selector from its mapStateToProps,
	  mapStateToPropsFactories, mapDispatchToProps, mapDispatchToPropsFactories, mergeProps,
	  mergePropsFactories, and pure args.
	
	  The resulting final props selector is called by the Connect component instance whenever
	  it receives new props or store state.
	 */
	
	function match(arg, factories, name) {
	  for (var i = factories.length - 1; i >= 0; i--) {
	    var result = factories[i](arg);
	    if (result) return result;
	  }
	
	  return function (dispatch, options) {
	    throw new Error('Invalid value of type ' + typeof arg + ' for ' + name + ' argument when connecting component ' + options.wrappedComponentName + '.');
	  };
	}
	
	function strictEqual(a, b) {
	  return a === b;
	}
	
	// createConnect with default args builds the 'official' connect behavior. Calling it with
	// different options opens up some testing and extensibility scenarios
	function createConnect() {
	  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	      _ref$connectHOC = _ref.connectHOC,
	      connectHOC = _ref$connectHOC === undefined ? _connectAdvanced2.default : _ref$connectHOC,
	      _ref$mapStateToPropsF = _ref.mapStateToPropsFactories,
	      mapStateToPropsFactories = _ref$mapStateToPropsF === undefined ? _mapStateToProps2.default : _ref$mapStateToPropsF,
	      _ref$mapDispatchToPro = _ref.mapDispatchToPropsFactories,
	      mapDispatchToPropsFactories = _ref$mapDispatchToPro === undefined ? _mapDispatchToProps2.default : _ref$mapDispatchToPro,
	      _ref$mergePropsFactor = _ref.mergePropsFactories,
	      mergePropsFactories = _ref$mergePropsFactor === undefined ? _mergeProps2.default : _ref$mergePropsFactor,
	      _ref$selectorFactory = _ref.selectorFactory,
	      selectorFactory = _ref$selectorFactory === undefined ? _selectorFactory2.default : _ref$selectorFactory;
	
	  return function connect(mapStateToProps, mapDispatchToProps, mergeProps) {
	    var _ref2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
	        _ref2$pure = _ref2.pure,
	        pure = _ref2$pure === undefined ? true : _ref2$pure,
	        _ref2$areStatesEqual = _ref2.areStatesEqual,
	        areStatesEqual = _ref2$areStatesEqual === undefined ? strictEqual : _ref2$areStatesEqual,
	        _ref2$areOwnPropsEqua = _ref2.areOwnPropsEqual,
	        areOwnPropsEqual = _ref2$areOwnPropsEqua === undefined ? _shallowEqual2.default : _ref2$areOwnPropsEqua,
	        _ref2$areStatePropsEq = _ref2.areStatePropsEqual,
	        areStatePropsEqual = _ref2$areStatePropsEq === undefined ? _shallowEqual2.default : _ref2$areStatePropsEq,
	        _ref2$areMergedPropsE = _ref2.areMergedPropsEqual,
	        areMergedPropsEqual = _ref2$areMergedPropsE === undefined ? _shallowEqual2.default : _ref2$areMergedPropsE,
	        extraOptions = _objectWithoutProperties(_ref2, ['pure', 'areStatesEqual', 'areOwnPropsEqual', 'areStatePropsEqual', 'areMergedPropsEqual']);
	
	    var initMapStateToProps = match(mapStateToProps, mapStateToPropsFactories, 'mapStateToProps');
	    var initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps');
	    var initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');
	
	    return connectHOC(selectorFactory, _extends({
	      // used in error messages
	      methodName: 'connect',
	
	      // used to compute Connect's displayName from the wrapped component's displayName.
	      getDisplayName: function getDisplayName(name) {
	        return 'Connect(' + name + ')';
	      },
	
	      // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
	      shouldHandleStateChanges: Boolean(mapStateToProps),
	
	      // passed through to selectorFactory
	      initMapStateToProps: initMapStateToProps,
	      initMapDispatchToProps: initMapDispatchToProps,
	      initMergeProps: initMergeProps,
	      pure: pure,
	      areStatesEqual: areStatesEqual,
	      areOwnPropsEqual: areOwnPropsEqual,
	      areStatePropsEqual: areStatePropsEqual,
	      areMergedPropsEqual: areMergedPropsEqual
	
	    }, extraOptions));
	  };
	}
	
	exports.default = createConnect();

/***/ }),

/***/ 362:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.whenMapDispatchToPropsIsFunction = whenMapDispatchToPropsIsFunction;
	exports.whenMapDispatchToPropsIsMissing = whenMapDispatchToPropsIsMissing;
	exports.whenMapDispatchToPropsIsObject = whenMapDispatchToPropsIsObject;
	
	var _redux = __webpack_require__(130);
	
	var _wrapMapToProps = __webpack_require__(158);
	
	function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
	  return typeof mapDispatchToProps === 'function' ? (0, _wrapMapToProps.wrapMapToPropsFunc)(mapDispatchToProps, 'mapDispatchToProps') : undefined;
	}
	
	function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
	  return !mapDispatchToProps ? (0, _wrapMapToProps.wrapMapToPropsConstant)(function (dispatch) {
	    return { dispatch: dispatch };
	  }) : undefined;
	}
	
	function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
	  return mapDispatchToProps && typeof mapDispatchToProps === 'object' ? (0, _wrapMapToProps.wrapMapToPropsConstant)(function (dispatch) {
	    return (0, _redux.bindActionCreators)(mapDispatchToProps, dispatch);
	  }) : undefined;
	}
	
	exports.default = [whenMapDispatchToPropsIsFunction, whenMapDispatchToPropsIsMissing, whenMapDispatchToPropsIsObject];

/***/ }),

/***/ 363:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.whenMapStateToPropsIsFunction = whenMapStateToPropsIsFunction;
	exports.whenMapStateToPropsIsMissing = whenMapStateToPropsIsMissing;
	
	var _wrapMapToProps = __webpack_require__(158);
	
	function whenMapStateToPropsIsFunction(mapStateToProps) {
	  return typeof mapStateToProps === 'function' ? (0, _wrapMapToProps.wrapMapToPropsFunc)(mapStateToProps, 'mapStateToProps') : undefined;
	}
	
	function whenMapStateToPropsIsMissing(mapStateToProps) {
	  return !mapStateToProps ? (0, _wrapMapToProps.wrapMapToPropsConstant)(function () {
	    return {};
	  }) : undefined;
	}
	
	exports.default = [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing];

/***/ }),

/***/ 364:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	exports.defaultMergeProps = defaultMergeProps;
	exports.wrapMergePropsFunc = wrapMergePropsFunc;
	exports.whenMergePropsIsFunction = whenMergePropsIsFunction;
	exports.whenMergePropsIsOmitted = whenMergePropsIsOmitted;
	
	var _verifyPlainObject = __webpack_require__(161);
	
	var _verifyPlainObject2 = _interopRequireDefault(_verifyPlainObject);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function defaultMergeProps(stateProps, dispatchProps, ownProps) {
	  return _extends({}, ownProps, stateProps, dispatchProps);
	}
	
	function wrapMergePropsFunc(mergeProps) {
	  return function initMergePropsProxy(dispatch, _ref) {
	    var displayName = _ref.displayName,
	        pure = _ref.pure,
	        areMergedPropsEqual = _ref.areMergedPropsEqual;
	
	    var hasRunOnce = false;
	    var mergedProps = void 0;
	
	    return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
	      var nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);
	
	      if (hasRunOnce) {
	        if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps)) mergedProps = nextMergedProps;
	      } else {
	        hasRunOnce = true;
	        mergedProps = nextMergedProps;
	
	        if (false) (0, _verifyPlainObject2.default)(mergedProps, displayName, 'mergeProps');
	      }
	
	      return mergedProps;
	    };
	  };
	}
	
	function whenMergePropsIsFunction(mergeProps) {
	  return typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined;
	}
	
	function whenMergePropsIsOmitted(mergeProps) {
	  return !mergeProps ? function () {
	    return defaultMergeProps;
	  } : undefined;
	}
	
	exports.default = [whenMergePropsIsFunction, whenMergePropsIsOmitted];

/***/ }),

/***/ 365:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.impureFinalPropsSelectorFactory = impureFinalPropsSelectorFactory;
	exports.pureFinalPropsSelectorFactory = pureFinalPropsSelectorFactory;
	exports.default = finalPropsSelectorFactory;
	
	var _verifySubselectors = __webpack_require__(366);
	
	var _verifySubselectors2 = _interopRequireDefault(_verifySubselectors);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	function impureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch) {
	  return function impureFinalPropsSelector(state, ownProps) {
	    return mergeProps(mapStateToProps(state, ownProps), mapDispatchToProps(dispatch, ownProps), ownProps);
	  };
	}
	
	function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, _ref) {
	  var areStatesEqual = _ref.areStatesEqual,
	      areOwnPropsEqual = _ref.areOwnPropsEqual,
	      areStatePropsEqual = _ref.areStatePropsEqual;
	
	  var hasRunAtLeastOnce = false;
	  var state = void 0;
	  var ownProps = void 0;
	  var stateProps = void 0;
	  var dispatchProps = void 0;
	  var mergedProps = void 0;
	
	  function handleFirstCall(firstState, firstOwnProps) {
	    state = firstState;
	    ownProps = firstOwnProps;
	    stateProps = mapStateToProps(state, ownProps);
	    dispatchProps = mapDispatchToProps(dispatch, ownProps);
	    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
	    hasRunAtLeastOnce = true;
	    return mergedProps;
	  }
	
	  function handleNewPropsAndNewState() {
	    stateProps = mapStateToProps(state, ownProps);
	
	    if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
	
	    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
	    return mergedProps;
	  }
	
	  function handleNewProps() {
	    if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(state, ownProps);
	
	    if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
	
	    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
	    return mergedProps;
	  }
	
	  function handleNewState() {
	    var nextStateProps = mapStateToProps(state, ownProps);
	    var statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
	    stateProps = nextStateProps;
	
	    if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
	
	    return mergedProps;
	  }
	
	  function handleSubsequentCalls(nextState, nextOwnProps) {
	    var propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
	    var stateChanged = !areStatesEqual(nextState, state);
	    state = nextState;
	    ownProps = nextOwnProps;
	
	    if (propsChanged && stateChanged) return handleNewPropsAndNewState();
	    if (propsChanged) return handleNewProps();
	    if (stateChanged) return handleNewState();
	    return mergedProps;
	  }
	
	  return function pureFinalPropsSelector(nextState, nextOwnProps) {
	    return hasRunAtLeastOnce ? handleSubsequentCalls(nextState, nextOwnProps) : handleFirstCall(nextState, nextOwnProps);
	  };
	}
	
	// TODO: Add more comments
	
	// If pure is true, the selector returned by selectorFactory will memoize its results,
	// allowing connectAdvanced's shouldComponentUpdate to return false if final
	// props have not changed. If false, the selector will always return a new
	// object and shouldComponentUpdate will always return true.
	
	function finalPropsSelectorFactory(dispatch, _ref2) {
	  var initMapStateToProps = _ref2.initMapStateToProps,
	      initMapDispatchToProps = _ref2.initMapDispatchToProps,
	      initMergeProps = _ref2.initMergeProps,
	      options = _objectWithoutProperties(_ref2, ['initMapStateToProps', 'initMapDispatchToProps', 'initMergeProps']);
	
	  var mapStateToProps = initMapStateToProps(dispatch, options);
	  var mapDispatchToProps = initMapDispatchToProps(dispatch, options);
	  var mergeProps = initMergeProps(dispatch, options);
	
	  if (false) {
	    (0, _verifySubselectors2.default)(mapStateToProps, mapDispatchToProps, mergeProps, options.displayName);
	  }
	
	  var selectorFactory = options.pure ? pureFinalPropsSelectorFactory : impureFinalPropsSelectorFactory;
	
	  return selectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
	}

/***/ }),

/***/ 366:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.default = verifySubselectors;
	
	var _warning = __webpack_require__(95);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function verify(selector, methodName, displayName) {
	  if (!selector) {
	    throw new Error('Unexpected value for ' + methodName + ' in ' + displayName + '.');
	  } else if (methodName === 'mapStateToProps' || methodName === 'mapDispatchToProps') {
	    if (!selector.hasOwnProperty('dependsOnOwnProps')) {
	      (0, _warning2.default)('The selector for ' + methodName + ' of ' + displayName + ' did not specify a value for dependsOnOwnProps.');
	    }
	  }
	}
	
	function verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, displayName) {
	  verify(mapStateToProps, 'mapStateToProps', displayName);
	  verify(mapDispatchToProps, 'mapDispatchToProps', displayName);
	  verify(mergeProps, 'mergeProps', displayName);
	}

/***/ }),

/***/ 158:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.wrapMapToPropsConstant = wrapMapToPropsConstant;
	exports.getDependsOnOwnProps = getDependsOnOwnProps;
	exports.wrapMapToPropsFunc = wrapMapToPropsFunc;
	
	var _verifyPlainObject = __webpack_require__(161);
	
	var _verifyPlainObject2 = _interopRequireDefault(_verifyPlainObject);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function wrapMapToPropsConstant(getConstant) {
	  return function initConstantSelector(dispatch, options) {
	    var constant = getConstant(dispatch, options);
	
	    function constantSelector() {
	      return constant;
	    }
	    constantSelector.dependsOnOwnProps = false;
	    return constantSelector;
	  };
	}
	
	// dependsOnOwnProps is used by createMapToPropsProxy to determine whether to pass props as args
	// to the mapToProps function being wrapped. It is also used by makePurePropsSelector to determine
	// whether mapToProps needs to be invoked when props have changed.
	// 
	// A length of one signals that mapToProps does not depend on props from the parent component.
	// A length of zero is assumed to mean mapToProps is getting args via arguments or ...args and
	// therefore not reporting its length accurately..
	function getDependsOnOwnProps(mapToProps) {
	  return mapToProps.dependsOnOwnProps !== null && mapToProps.dependsOnOwnProps !== undefined ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
	}
	
	// Used by whenMapStateToPropsIsFunction and whenMapDispatchToPropsIsFunction,
	// this function wraps mapToProps in a proxy function which does several things:
	// 
	//  * Detects whether the mapToProps function being called depends on props, which
	//    is used by selectorFactory to decide if it should reinvoke on props changes.
	//    
	//  * On first call, handles mapToProps if returns another function, and treats that
	//    new function as the true mapToProps for subsequent calls.
	//    
	//  * On first call, verifies the first result is a plain object, in order to warn
	//    the developer that their mapToProps function is not returning a valid result.
	//    
	function wrapMapToPropsFunc(mapToProps, methodName) {
	  return function initProxySelector(dispatch, _ref) {
	    var displayName = _ref.displayName;
	
	    var proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
	      return proxy.dependsOnOwnProps ? proxy.mapToProps(stateOrDispatch, ownProps) : proxy.mapToProps(stateOrDispatch);
	    };
	
	    // allow detectFactoryAndVerify to get ownProps
	    proxy.dependsOnOwnProps = true;
	
	    proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
	      proxy.mapToProps = mapToProps;
	      proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
	      var props = proxy(stateOrDispatch, ownProps);
	
	      if (typeof props === 'function') {
	        proxy.mapToProps = props;
	        proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
	        props = proxy(stateOrDispatch, ownProps);
	      }
	
	      if (false) (0, _verifyPlainObject2.default)(props, displayName, methodName);
	
	      return props;
	    };
	
	    return proxy;
	  };
	}

/***/ }),

/***/ 159:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.connect = exports.connectAdvanced = exports.createProvider = exports.Provider = undefined;
	
	var _Provider = __webpack_require__(360);
	
	var _Provider2 = _interopRequireDefault(_Provider);
	
	var _connectAdvanced = __webpack_require__(157);
	
	var _connectAdvanced2 = _interopRequireDefault(_connectAdvanced);
	
	var _connect = __webpack_require__(361);
	
	var _connect2 = _interopRequireDefault(_connect);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.Provider = _Provider2.default;
	exports.createProvider = _Provider.createProvider;
	exports.connectAdvanced = _connectAdvanced2.default;
	exports.connect = _connect2.default;

/***/ }),

/***/ 160:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.storeShape = exports.subscriptionShape = undefined;
	
	var _propTypes = __webpack_require__(3);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var subscriptionShape = exports.subscriptionShape = _propTypes2.default.shape({
	  trySubscribe: _propTypes2.default.func.isRequired,
	  tryUnsubscribe: _propTypes2.default.func.isRequired,
	  notifyNestedSubs: _propTypes2.default.func.isRequired,
	  isSubscribed: _propTypes2.default.func.isRequired
	});
	
	var storeShape = exports.storeShape = _propTypes2.default.shape({
	  subscribe: _propTypes2.default.func.isRequired,
	  dispatch: _propTypes2.default.func.isRequired,
	  getState: _propTypes2.default.func.isRequired
	});

/***/ }),

/***/ 367:
/***/ (function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// encapsulates the subscription logic for connecting a component to the redux store, as
	// well as nesting subscriptions of descendant components, so that we can ensure the
	// ancestor components re-render before descendants
	
	var CLEARED = null;
	var nullListeners = {
	  notify: function notify() {}
	};
	
	function createListenerCollection() {
	  // the current/next pattern is copied from redux's createStore code.
	  // TODO: refactor+expose that code to be reusable here?
	  var current = [];
	  var next = [];
	
	  return {
	    clear: function clear() {
	      next = CLEARED;
	      current = CLEARED;
	    },
	    notify: function notify() {
	      var listeners = current = next;
	      for (var i = 0; i < listeners.length; i++) {
	        listeners[i]();
	      }
	    },
	    get: function get() {
	      return next;
	    },
	    subscribe: function subscribe(listener) {
	      var isSubscribed = true;
	      if (next === current) next = current.slice();
	      next.push(listener);
	
	      return function unsubscribe() {
	        if (!isSubscribed || current === CLEARED) return;
	        isSubscribed = false;
	
	        if (next === current) next = current.slice();
	        next.splice(next.indexOf(listener), 1);
	      };
	    }
	  };
	}
	
	var Subscription = function () {
	  function Subscription(store, parentSub, onStateChange) {
	    _classCallCheck(this, Subscription);
	
	    this.store = store;
	    this.parentSub = parentSub;
	    this.onStateChange = onStateChange;
	    this.unsubscribe = null;
	    this.listeners = nullListeners;
	  }
	
	  Subscription.prototype.addNestedSub = function addNestedSub(listener) {
	    this.trySubscribe();
	    return this.listeners.subscribe(listener);
	  };
	
	  Subscription.prototype.notifyNestedSubs = function notifyNestedSubs() {
	    this.listeners.notify();
	  };
	
	  Subscription.prototype.isSubscribed = function isSubscribed() {
	    return Boolean(this.unsubscribe);
	  };
	
	  Subscription.prototype.trySubscribe = function trySubscribe() {
	    if (!this.unsubscribe) {
	      this.unsubscribe = this.parentSub ? this.parentSub.addNestedSub(this.onStateChange) : this.store.subscribe(this.onStateChange);
	
	      this.listeners = createListenerCollection();
	    }
	  };
	
	  Subscription.prototype.tryUnsubscribe = function tryUnsubscribe() {
	    if (this.unsubscribe) {
	      this.unsubscribe();
	      this.unsubscribe = null;
	      this.listeners.clear();
	      this.listeners = nullListeners;
	    }
	  };
	
	  return Subscription;
	}();
	
	exports.default = Subscription;

/***/ }),

/***/ 368:
/***/ (function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports.default = shallowEqual;
	var hasOwn = Object.prototype.hasOwnProperty;
	
	function is(x, y) {
	  if (x === y) {
	    return x !== 0 || y !== 0 || 1 / x === 1 / y;
	  } else {
	    return x !== x && y !== y;
	  }
	}
	
	function shallowEqual(objA, objB) {
	  if (is(objA, objB)) return true;
	
	  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
	    return false;
	  }
	
	  var keysA = Object.keys(objA);
	  var keysB = Object.keys(objB);
	
	  if (keysA.length !== keysB.length) return false;
	
	  for (var i = 0; i < keysA.length; i++) {
	    if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
	      return false;
	    }
	  }
	
	  return true;
	}

/***/ }),

/***/ 161:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.default = verifyPlainObject;
	
	var _isPlainObject = __webpack_require__(44);
	
	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);
	
	var _warning = __webpack_require__(95);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function verifyPlainObject(value, displayName, methodName) {
	  if (!(0, _isPlainObject2.default)(value)) {
	    (0, _warning2.default)(methodName + '() in ' + displayName + ' must return a plain object. Instead received ' + value + '.');
	  }
	}

/***/ }),

/***/ 95:
/***/ (function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports.default = warning;
	/**
	 * Prints a warning in the console if it exists.
	 *
	 * @param {String} message The warning message.
	 * @returns {void}
	 */
	function warning(message) {
	  /* eslint-disable no-console */
	  if (typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error(message);
	  }
	  /* eslint-enable no-console */
	  try {
	    // This error was thrown as a convenience so that if you enable
	    // "break on all exceptions" in your console,
	    // it would pause the execution at this line.
	    throw new Error(message);
	    /* eslint-disable no-empty */
	  } catch (e) {}
	  /* eslint-enable no-empty */
	}

/***/ }),

/***/ 1136:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _scrollLink = __webpack_require__(514);
	
	var _scrollLink2 = _interopRequireDefault(_scrollLink);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var ButtonElement = function (_React$Component) {
	  _inherits(ButtonElement, _React$Component);
	
	  function ButtonElement() {
	    _classCallCheck(this, ButtonElement);
	
	    return _possibleConstructorReturn(this, (ButtonElement.__proto__ || Object.getPrototypeOf(ButtonElement)).apply(this, arguments));
	  }
	
	  _createClass(ButtonElement, [{
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        'input',
	        this.props,
	        this.props.children
	      );
	    }
	  }]);
	
	  return ButtonElement;
	}(_react2.default.Component);
	
	;
	
	exports.default = (0, _scrollLink2.default)(ButtonElement);

/***/ }),

/***/ 1137:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _scrollElement = __webpack_require__(638);
	
	var _scrollElement2 = _interopRequireDefault(_scrollElement);
	
	var _propTypes = __webpack_require__(3);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var ElementWrapper = function (_React$Component) {
	  _inherits(ElementWrapper, _React$Component);
	
	  function ElementWrapper() {
	    _classCallCheck(this, ElementWrapper);
	
	    return _possibleConstructorReturn(this, (ElementWrapper.__proto__ || Object.getPrototypeOf(ElementWrapper)).apply(this, arguments));
	  }
	
	  _createClass(ElementWrapper, [{
	    key: 'render',
	    value: function render() {
	      var _this2 = this;
	
	      // Remove `parentBindings` from props
	      var newProps = _extends({}, this.props);
	      if (newProps.parentBindings) {
	        delete newProps.parentBindings;
	      }
	
	      return _react2.default.createElement(
	        'div',
	        _extends({}, newProps, { ref: function ref(el) {
	            _this2.props.parentBindings.domNode = el;
	          } }),
	        this.props.children
	      );
	    }
	  }]);
	
	  return ElementWrapper;
	}(_react2.default.Component);
	
	;
	
	ElementWrapper.propTypes = {
	  name: _propTypes2.default.string,
	  id: _propTypes2.default.string
	};
	
	exports.default = (0, _scrollElement2.default)(ElementWrapper);

/***/ }),

/***/ 1138:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _scrollLink = __webpack_require__(514);
	
	var _scrollLink2 = _interopRequireDefault(_scrollLink);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var LinkElement = function (_React$Component) {
	  _inherits(LinkElement, _React$Component);
	
	  function LinkElement() {
	    var _ref;
	
	    var _temp, _this, _ret;
	
	    _classCallCheck(this, LinkElement);
	
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = LinkElement.__proto__ || Object.getPrototypeOf(LinkElement)).call.apply(_ref, [this].concat(args))), _this), _this.render = function () {
	      return _react2.default.createElement(
	        'a',
	        _this.props,
	        _this.props.children
	      );
	    }, _temp), _possibleConstructorReturn(_this, _ret);
	  }
	
	  return LinkElement;
	}(_react2.default.Component);
	
	;
	
	exports.default = (0, _scrollLink2.default)(LinkElement);

/***/ }),

/***/ 230:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Helpers = exports.ScrollElement = exports.ScrollLink = exports.animateScroll = exports.scrollSpy = exports.Events = exports.scroller = exports.Element = exports.Button = exports.Link = undefined;
	
	var _Link = __webpack_require__(1138);
	
	var _Link2 = _interopRequireDefault(_Link);
	
	var _Button = __webpack_require__(1136);
	
	var _Button2 = _interopRequireDefault(_Button);
	
	var _Element = __webpack_require__(1137);
	
	var _Element2 = _interopRequireDefault(_Element);
	
	var _scroller = __webpack_require__(419);
	
	var _scroller2 = _interopRequireDefault(_scroller);
	
	var _scrollEvents = __webpack_require__(513);
	
	var _scrollEvents2 = _interopRequireDefault(_scrollEvents);
	
	var _scrollSpy = __webpack_require__(515);
	
	var _scrollSpy2 = _interopRequireDefault(_scrollSpy);
	
	var _animateScroll = __webpack_require__(637);
	
	var _animateScroll2 = _interopRequireDefault(_animateScroll);
	
	var _scrollLink = __webpack_require__(514);
	
	var _scrollLink2 = _interopRequireDefault(_scrollLink);
	
	var _scrollElement = __webpack_require__(638);
	
	var _scrollElement2 = _interopRequireDefault(_scrollElement);
	
	var _Helpers = __webpack_require__(1139);
	
	var _Helpers2 = _interopRequireDefault(_Helpers);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.Link = _Link2.default;
	exports.Button = _Button2.default;
	exports.Element = _Element2.default;
	exports.scroller = _scroller2.default;
	exports.Events = _scrollEvents2.default;
	exports.scrollSpy = _scrollSpy2.default;
	exports.animateScroll = _animateScroll2.default;
	exports.ScrollLink = _scrollLink2.default;
	exports.ScrollElement = _scrollElement2.default;
	exports.Helpers = _Helpers2.default;
	exports.default = { Link: _Link2.default, Button: _Button2.default, Element: _Element2.default, scroller: _scroller2.default, Events: _scrollEvents2.default, scrollSpy: _scrollSpy2.default, animateScroll: _animateScroll2.default, ScrollLink: _scrollLink2.default, ScrollElement: _scrollElement2.default, Helpers: _Helpers2.default };

/***/ }),

/***/ 1139:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	/* DEPRECATED */
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var React = __webpack_require__(1);
	var ReactDOM = __webpack_require__(199);
	
	var utils = __webpack_require__(369);
	var scrollSpy = __webpack_require__(515);
	var defaultScroller = __webpack_require__(419);
	var PropTypes = __webpack_require__(3);
	var scrollHash = __webpack_require__(639);
	
	var protoTypes = {
	  to: PropTypes.string.isRequired,
	  containerId: PropTypes.string,
	  container: PropTypes.object,
	  activeClass: PropTypes.string,
	  spy: PropTypes.bool,
	  smooth: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	  offset: PropTypes.number,
	  delay: PropTypes.number,
	  isDynamic: PropTypes.bool,
	  onClick: PropTypes.func,
	  duration: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
	  absolute: PropTypes.bool,
	  onSetActive: PropTypes.func,
	  onSetInactive: PropTypes.func,
	  ignoreCancelEvents: PropTypes.bool,
	  hashSpy: PropTypes.bool
	};
	
	var Helpers = {
	  Scroll: function Scroll(Component, customScroller) {
	
	    console.warn("Helpers.Scroll is deprecated since v1.7.0");
	
	    var scroller = customScroller || defaultScroller;
	
	    var Scroll = function (_React$Component) {
	      _inherits(Scroll, _React$Component);
	
	      function Scroll(props) {
	        _classCallCheck(this, Scroll);
	
	        var _this = _possibleConstructorReturn(this, (Scroll.__proto__ || Object.getPrototypeOf(Scroll)).call(this, props));
	
	        _initialiseProps.call(_this);
	
	        _this.state = {
	          active: false
	        };
	        return _this;
	      }
	
	      _createClass(Scroll, [{
	        key: 'getScrollSpyContainer',
	        value: function getScrollSpyContainer() {
	          var containerId = this.props.containerId;
	          var container = this.props.container;
	
	          if (containerId) {
	            return document.getElementById(containerId);
	          }
	
	          if (container && container.nodeType) {
	            return container;
	          }
	
	          return document;
	        }
	      }, {
	        key: 'componentDidMount',
	        value: function componentDidMount() {
	          if (this.props.spy || this.props.hashSpy) {
	            var scrollSpyContainer = this.getScrollSpyContainer();
	
	            if (!scrollSpy.isMounted(scrollSpyContainer)) {
	              scrollSpy.mount(scrollSpyContainer);
	            }
	
	            if (this.props.hashSpy) {
	              if (!scrollHash.isMounted()) {
	                scrollHash.mount(scroller);
	              }
	              scrollHash.mapContainer(this.props.to, scrollSpyContainer);
	            }
	
	            if (this.props.spy) {
	              scrollSpy.addStateHandler(this.stateHandler);
	            }
	
	            scrollSpy.addSpyHandler(this.spyHandler, scrollSpyContainer);
	
	            this.setState({
	              container: scrollSpyContainer
	            });
	          }
	        }
	      }, {
	        key: 'componentWillUnmount',
	        value: function componentWillUnmount() {
	          scrollSpy.unmount(this.stateHandler, this.spyHandler);
	        }
	      }, {
	        key: 'render',
	        value: function render() {
	          var className = "";
	
	          if (this.state && this.state.active) {
	            className = ((this.props.className || "") + " " + (this.props.activeClass || "active")).trim();
	          } else {
	            className = this.props.className;
	          }
	
	          var props = _extends({}, this.props);
	
	          for (var prop in protoTypes) {
	            if (props.hasOwnProperty(prop)) {
	              delete props[prop];
	            }
	          }
	
	          props.className = className;
	          props.onClick = this.handleClick;
	
	          return React.createElement(Component, props);
	        }
	      }]);
	
	      return Scroll;
	    }(React.Component);
	
	    var _initialiseProps = function _initialiseProps() {
	      var _this2 = this;
	
	      this.scrollTo = function (to, props) {
	        scroller.scrollTo(to, _extends({}, _this2.state, props));
	      };
	
	      this.handleClick = function (event) {
	
	        /*
	         * give the posibility to override onClick
	         */
	
	        if (_this2.props.onClick) {
	          _this2.props.onClick(event);
	        }
	
	        /*
	         * dont bubble the navigation
	         */
	
	        if (event.stopPropagation) event.stopPropagation();
	        if (event.preventDefault) event.preventDefault();
	
	        /*
	         * do the magic!
	         */
	        _this2.scrollTo(_this2.props.to, _this2.props);
	      };
	
	      this.stateHandler = function () {
	        if (scroller.getActiveLink() !== _this2.props.to) {
	          if (_this2.state !== null && _this2.state.active && _this2.props.onSetInactive) {
	            _this2.props.onSetInactive();
	          }
	          _this2.setState({ active: false });
	        }
	      };
	
	      this.spyHandler = function (y) {
	
	        var scrollSpyContainer = _this2.getScrollSpyContainer();
	
	        if (scrollHash.isMounted() && !scrollHash.isInitialized()) {
	          return;
	        }
	
	        var to = _this2.props.to;
	        var element = null;
	        var elemTopBound = 0;
	        var elemBottomBound = 0;
	        var containerTop = 0;
	
	        if (scrollSpyContainer.getBoundingClientRect) {
	          var containerCords = scrollSpyContainer.getBoundingClientRect();
	          containerTop = containerCords.top;
	        }
	
	        if (!element || _this2.props.isDynamic) {
	          element = scroller.get(to);
	          if (!element) {
	            return;
	          }
	
	          var cords = element.getBoundingClientRect();
	          elemTopBound = cords.top - containerTop + y;
	          elemBottomBound = elemTopBound + cords.height;
	        }
	
	        var offsetY = y - _this2.props.offset;
	        var isInside = offsetY >= Math.floor(elemTopBound) && offsetY < Math.floor(elemBottomBound);
	        var isOutside = offsetY < Math.floor(elemTopBound) || offsetY >= Math.floor(elemBottomBound);
	        var activeLink = scroller.getActiveLink();
	
	        if (isOutside) {
	          if (to === activeLink) {
	            scroller.setActiveLink(void 0);
	          }
	
	          if (_this2.props.hashSpy && scrollHash.getHash() === to) {
	            scrollHash.changeHash();
	          }
	
	          if (_this2.props.spy && _this2.state.active) {
	            _this2.setState({ active: false });
	            _this2.props.onSetInactive && _this2.props.onSetInactive();
	          }
	
	          return scrollSpy.updateStates();
	        }
	
	        if (isInside && activeLink !== to) {
	          scroller.setActiveLink(to);
	
	          _this2.props.hashSpy && scrollHash.changeHash(to);
	
	          if (_this2.props.spy) {
	            _this2.setState({ active: true });
	            _this2.props.onSetActive && _this2.props.onSetActive(to);
	          }
	          return scrollSpy.updateStates();
	        }
	      };
	    };
	
	    ;
	
	    Scroll.propTypes = protoTypes;
	
	    Scroll.defaultProps = { offset: 0 };
	
	    return Scroll;
	  },
	  Element: function Element(Component) {
	
	    console.warn("Helpers.Element is deprecated since v1.7.0");
	
	    var Element = function (_React$Component2) {
	      _inherits(Element, _React$Component2);
	
	      function Element(props) {
	        _classCallCheck(this, Element);
	
	        var _this3 = _possibleConstructorReturn(this, (Element.__proto__ || Object.getPrototypeOf(Element)).call(this, props));
	
	        _this3.childBindings = {
	          domNode: null
	        };
	        return _this3;
	      }
	
	      _createClass(Element, [{
	        key: 'componentDidMount',
	        value: function componentDidMount() {
	          if (typeof window === 'undefined') {
	            return false;
	          }
	          this.registerElems(this.props.name);
	        }
	      }, {
	        key: 'componentWillReceiveProps',
	        value: function componentWillReceiveProps(nextProps) {
	          if (this.props.name !== nextProps.name) {
	            this.registerElems(nextProps.name);
	          }
	        }
	      }, {
	        key: 'componentWillUnmount',
	        value: function componentWillUnmount() {
	          if (typeof window === 'undefined') {
	            return false;
	          }
	          defaultScroller.unregister(this.props.name);
	        }
	      }, {
	        key: 'registerElems',
	        value: function registerElems(name) {
	          defaultScroller.register(name, this.childBindings.domNode);
	        }
	      }, {
	        key: 'render',
	        value: function render() {
	          return React.createElement(Component, _extends({}, this.props, { parentBindings: this.childBindings }));
	        }
	      }]);
	
	      return Element;
	    }(React.Component);
	
	    ;
	
	    Element.propTypes = {
	      name: PropTypes.string,
	      id: PropTypes.string
	    };
	
	    return Element;
	  }
	};
	
	module.exports = Helpers;

/***/ }),

/***/ 637:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _utils = __webpack_require__(369);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _smooth = __webpack_require__(1141);
	
	var _smooth2 = _interopRequireDefault(_smooth);
	
	var _cancelEvents = __webpack_require__(1140);
	
	var _cancelEvents2 = _interopRequireDefault(_cancelEvents);
	
	var _scrollEvents = __webpack_require__(513);
	
	var _scrollEvents2 = _interopRequireDefault(_scrollEvents);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/*
	 * Gets the easing type from the smooth prop within options.
	 */
	var getAnimationType = function getAnimationType(options) {
	  return _smooth2.default[options.smooth] || _smooth2.default.defaultEasing;
	};
	/*
	 * Function helper
	 */
	var functionWrapper = function functionWrapper(value) {
	  return typeof value === 'function' ? value : function () {
	    return value;
	  };
	};
	/*
	 * Wraps window properties to allow server side rendering
	 */
	var currentWindowProperties = function currentWindowProperties() {
	  if (typeof window !== 'undefined') {
	    return window.requestAnimationFrame || window.webkitRequestAnimationFrame;
	  }
	};
	
	/*
	 * Helper function to never extend 60fps on the webpage.
	 */
	var requestAnimationFrameHelper = function () {
	  return currentWindowProperties() || function (callback, element, delay) {
	    window.setTimeout(callback, delay || 1000 / 60, new Date().getTime());
	  };
	}();
	
	var makeData = function makeData() {
	  return {
	    currentPositionY: 0,
	    startPositionY: 0,
	    targetPositionY: 0,
	    progress: 0,
	    duration: 0,
	    cancel: false,
	
	    target: null,
	    containerElement: null,
	    to: null,
	    start: null,
	    deltaTop: null,
	    percent: null,
	    delayTimeout: null
	  };
	};
	
	var currentPositionY = function currentPositionY(options) {
	  var containerElement = options.data.containerElement;
	  if (containerElement && containerElement !== document && containerElement !== document.body) {
	    return containerElement.scrollTop;
	  } else {
	    var supportPageOffset = window.pageXOffset !== undefined;
	    var isCSS1Compat = (document.compatMode || "") === "CSS1Compat";
	    return supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
	  }
	};
	
	var scrollContainerHeight = function scrollContainerHeight(options) {
	  var containerElement = options.data.containerElement;
	  if (containerElement && containerElement !== document && containerElement !== document.body) {
	    return Math.max(containerElement.scrollHeight, containerElement.offsetHeight, containerElement.clientHeight);
	  } else {
	    var body = document.body;
	    var html = document.documentElement;
	
	    return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
	  }
	};
	
	var animateScroll = function animateScroll(easing, options, timestamp) {
	  var data = options.data;
	
	  // Cancel on specific events
	  if (!options.ignoreCancelEvents && data.cancel) {
	    if (_scrollEvents2.default.registered['end']) {
	      _scrollEvents2.default.registered['end'](data.to, data.target, data.currentPositionY);
	    }
	    return;
	  };
	
	  data.deltaTop = Math.round(data.targetPositionY - data.startPositionY);
	
	  if (data.start === null) {
	    data.start = timestamp;
	  }
	
	  data.progress = timestamp - data.start;
	
	  data.percent = data.progress >= data.duration ? 1 : easing(data.progress / data.duration);
	
	  data.currentPositionY = data.startPositionY + Math.ceil(data.deltaTop * data.percent);
	
	  if (data.containerElement && data.containerElement !== document && data.containerElement !== document.body) {
	    data.containerElement.scrollTop = data.currentPositionY;
	  } else {
	    window.scrollTo(0, data.currentPositionY);
	  }
	
	  if (data.percent < 1) {
	    var easedAnimate = animateScroll.bind(null, easing, options);
	    requestAnimationFrameHelper.call(window, easedAnimate);
	    return;
	  }
	
	  if (_scrollEvents2.default.registered['end']) {
	    _scrollEvents2.default.registered['end'](data.to, data.target, data.currentPositionY);
	  }
	};
	
	var setContainer = function setContainer(options) {
	  options.data.containerElement = !options ? null : options.containerId ? document.getElementById(options.containerId) : options.container && options.container.nodeType ? options.container : document;
	};
	
	var animateTopScroll = function animateTopScroll(y, options, to, target) {
	  options.data = options.data || makeData();
	
	  window.clearTimeout(options.data.delayTimeout);
	
	  _cancelEvents2.default.subscribe(function () {
	    options.data.cancel = true;
	  });
	
	  setContainer(options);
	
	  options.data.start = null;
	  options.data.cancel = false;
	  options.data.startPositionY = currentPositionY(options);
	  options.data.targetPositionY = options.absolute ? y : y + options.data.startPositionY;
	
	  if (options.data.startPositionY === options.data.targetPositionY) {
	    if (_scrollEvents2.default.registered['end']) {
	      _scrollEvents2.default.registered['end'](options.data.to, options.data.target, options.data.currentPositionY);
	    }
	    return;
	  }
	
	  options.data.deltaTop = Math.round(options.data.targetPositionY - options.data.startPositionY);
	
	  options.data.duration = functionWrapper(options.duration)(options.data.deltaTop);
	  options.data.duration = isNaN(parseFloat(options.data.duration)) ? 1000 : parseFloat(options.data.duration);
	  options.data.to = to;
	  options.data.target = target;
	
	  var easing = getAnimationType(options);
	  var easedAnimate = animateScroll.bind(null, easing, options);
	
	  if (options && options.delay > 0) {
	    options.data.delayTimeout = window.setTimeout(function () {
	      requestAnimationFrameHelper.call(window, easedAnimate);
	    }, options.delay);
	    return;
	  }
	
	  requestAnimationFrameHelper.call(window, easedAnimate);
	};
	
	var proceedOptions = function proceedOptions(options) {
	  options = _extends({}, options);
	  options.data = options.data || makeData();
	  options.absolute = true;
	  return options;
	};
	
	var scrollToTop = function scrollToTop(options) {
	  animateTopScroll(0, proceedOptions(options));
	};
	
	var scrollTo = function scrollTo(toY, options) {
	  animateTopScroll(toY, proceedOptions(options));
	};
	
	var scrollToBottom = function scrollToBottom(options) {
	  options = proceedOptions(options);
	  setContainer(options);
	  animateTopScroll(scrollContainerHeight(options), options);
	};
	
	var scrollMore = function scrollMore(toY, options) {
	  options = proceedOptions(options);
	  setContainer(options);
	  animateTopScroll(currentPositionY(options) + toY, options);
	};
	
	exports.default = {
	  animateTopScroll: animateTopScroll,
	  getAnimationType: getAnimationType,
	  scrollToTop: scrollToTop,
	  scrollToBottom: scrollToBottom,
	  scrollTo: scrollTo,
	  scrollMore: scrollMore
	};

/***/ }),

/***/ 1140:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _passiveEventListeners = __webpack_require__(512);
	
	var events = ['mousedown', 'mousewheel', 'touchmove', 'keydown'];
	
	exports.default = {
	  subscribe: function subscribe(cancelEvent) {
	    return typeof document !== 'undefined' && events.forEach(function (event) {
	      return (0, _passiveEventListeners.addPassiveEventListener)(document, event, cancelEvent);
	    });
	  }
	};

/***/ }),

/***/ 512:
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/*
	 * Tell the browser that the event listener won't prevent a scroll.
	 * Allowing the browser to continue scrolling without having to
	 * to wait for the listener to return.
	 */
	var addPassiveEventListener = exports.addPassiveEventListener = function addPassiveEventListener(target, eventName, listener) {
	  var supportsPassiveOption = function () {
	    var supportsPassiveOption = false;
	    try {
	      var opts = Object.defineProperty({}, 'passive', {
	        get: function get() {
	          supportsPassiveOption = true;
	        }
	      });
	      window.addEventListener('test', null, opts);
	    } catch (e) {}
	    return supportsPassiveOption;
	  }();
	  target.addEventListener(eventName, listener, supportsPassiveOption ? { passive: true } : false);
	};
	
	var removePassiveEventListener = exports.removePassiveEventListener = function removePassiveEventListener(target, eventName, listener) {
	  target.removeEventListener(eventName, listener);
	};

/***/ }),

/***/ 638:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactDom = __webpack_require__(199);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _scroller = __webpack_require__(419);
	
	var _scroller2 = _interopRequireDefault(_scroller);
	
	var _propTypes = __webpack_require__(3);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	exports.default = function (Component) {
	  var Element = function (_React$Component) {
	    _inherits(Element, _React$Component);
	
	    function Element(props) {
	      _classCallCheck(this, Element);
	
	      var _this = _possibleConstructorReturn(this, (Element.__proto__ || Object.getPrototypeOf(Element)).call(this, props));
	
	      _this.childBindings = {
	        domNode: null
	      };
	      return _this;
	    }
	
	    _createClass(Element, [{
	      key: 'componentDidMount',
	      value: function componentDidMount() {
	        if (typeof window === 'undefined') {
	          return false;
	        }
	        this.registerElems(this.props.name);
	      }
	    }, {
	      key: 'componentWillReceiveProps',
	      value: function componentWillReceiveProps(nextProps) {
	        if (this.props.name !== nextProps.name) {
	          this.registerElems(nextProps.name);
	        }
	      }
	    }, {
	      key: 'componentWillUnmount',
	      value: function componentWillUnmount() {
	        if (typeof window === 'undefined') {
	          return false;
	        }
	        _scroller2.default.unregister(this.props.name);
	      }
	    }, {
	      key: 'registerElems',
	      value: function registerElems(name) {
	        _scroller2.default.register(name, this.childBindings.domNode);
	      }
	    }, {
	      key: 'render',
	      value: function render() {
	        return _react2.default.createElement(Component, _extends({}, this.props, { parentBindings: this.childBindings }));
	      }
	    }]);
	
	    return Element;
	  }(_react2.default.Component);
	
	  ;
	
	  Element.propTypes = {
	    name: _propTypes2.default.string,
	    id: _propTypes2.default.string
	  };
	
	  return Element;
	};

/***/ }),

/***/ 513:
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var Events = {
		registered: {},
		scrollEvent: {
			register: function register(evtName, callback) {
				Events.registered[evtName] = callback;
			},
			remove: function remove(evtName) {
				Events.registered[evtName] = null;
			}
		}
	};
	
	exports.default = Events;

/***/ }),

/***/ 639:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _passiveEventListeners = __webpack_require__(512);
	
	var _utils = __webpack_require__(369);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var scrollHash = {
	  mountFlag: false,
	  initialized: false,
	  scroller: null,
	  containers: {},
	
	  mount: function mount(scroller) {
	    this.scroller = scroller;
	
	    this.handleHashChange = this.handleHashChange.bind(this);
	    window.addEventListener('hashchange', this.handleHashChange);
	
	    this.initStateFromHash();
	    this.mountFlag = true;
	  },
	  mapContainer: function mapContainer(to, container) {
	    this.containers[to] = container;
	  },
	  isMounted: function isMounted() {
	    return this.mountFlag;
	  },
	  isInitialized: function isInitialized() {
	    return this.initialized;
	  },
	  initStateFromHash: function initStateFromHash() {
	    var _this = this;
	
	    var hash = this.getHash();
	    if (hash) {
	      window.setTimeout(function () {
	        _this.scrollTo(hash, true);
	        _this.initialized = true;
	      }, 10);
	    } else {
	      this.initialized = true;
	    }
	  },
	  scrollTo: function scrollTo(to, isInit) {
	    var scroller = this.scroller;
	    var element = scroller.get(to);
	    if (element && (isInit || to !== scroller.getActiveLink())) {
	      var container = this.containers[to] || document;
	      scroller.scrollTo(to, { container: container });
	    }
	  },
	  getHash: function getHash() {
	    return _utils2.default.getHash();
	  },
	  changeHash: function changeHash(to) {
	    if (this.isInitialized() && _utils2.default.getHash() !== to) {
	      _utils2.default.pushHash(to);
	    }
	  },
	  handleHashChange: function handleHashChange() {
	    this.scrollTo(this.getHash());
	  },
	  unmount: function unmount() {
	    this.scroller = null;
	    this.containers = null;
	    window.removeEventListener('hashchange', this.handleHashChange);
	  }
	};
	
	exports.default = scrollHash;

/***/ }),

/***/ 514:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactDom = __webpack_require__(199);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _utils = __webpack_require__(369);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _scrollSpy = __webpack_require__(515);
	
	var _scrollSpy2 = _interopRequireDefault(_scrollSpy);
	
	var _scroller = __webpack_require__(419);
	
	var _scroller2 = _interopRequireDefault(_scroller);
	
	var _propTypes = __webpack_require__(3);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	var _scrollHash = __webpack_require__(639);
	
	var _scrollHash2 = _interopRequireDefault(_scrollHash);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var protoTypes = {
	  to: _propTypes2.default.string.isRequired,
	  containerId: _propTypes2.default.string,
	  container: _propTypes2.default.object,
	  activeClass: _propTypes2.default.string,
	  spy: _propTypes2.default.bool,
	  smooth: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.string]),
	  offset: _propTypes2.default.number,
	  delay: _propTypes2.default.number,
	  isDynamic: _propTypes2.default.bool,
	  onClick: _propTypes2.default.func,
	  duration: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.func]),
	  absolute: _propTypes2.default.bool,
	  onSetActive: _propTypes2.default.func,
	  onSetInactive: _propTypes2.default.func,
	  ignoreCancelEvents: _propTypes2.default.bool,
	  hashSpy: _propTypes2.default.bool
	};
	
	exports.default = function (Component, customScroller) {
	
	  var scroller = customScroller || _scroller2.default;
	
	  var Link = function (_React$PureComponent) {
	    _inherits(Link, _React$PureComponent);
	
	    function Link(props) {
	      _classCallCheck(this, Link);
	
	      var _this = _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).call(this, props));
	
	      _initialiseProps.call(_this);
	
	      _this.state = {
	        active: false
	      };
	      return _this;
	    }
	
	    _createClass(Link, [{
	      key: 'getScrollSpyContainer',
	      value: function getScrollSpyContainer() {
	        var containerId = this.props.containerId;
	        var container = this.props.container;
	
	        if (containerId && !container) {
	          return document.getElementById(containerId);
	        }
	
	        if (container && container.nodeType) {
	          return container;
	        }
	
	        return document;
	      }
	    }, {
	      key: 'componentDidMount',
	      value: function componentDidMount() {
	        if (this.props.spy || this.props.hashSpy) {
	          var scrollSpyContainer = this.getScrollSpyContainer();
	
	          if (!_scrollSpy2.default.isMounted(scrollSpyContainer)) {
	            _scrollSpy2.default.mount(scrollSpyContainer);
	          }
	
	          if (this.props.hashSpy) {
	            if (!_scrollHash2.default.isMounted()) {
	              _scrollHash2.default.mount(scroller);
	            }
	            _scrollHash2.default.mapContainer(this.props.to, scrollSpyContainer);
	          }
	
	          _scrollSpy2.default.addSpyHandler(this.spyHandler, scrollSpyContainer);
	
	          this.setState({
	            container: scrollSpyContainer
	          });
	        }
	      }
	    }, {
	      key: 'componentWillUnmount',
	      value: function componentWillUnmount() {
	        _scrollSpy2.default.unmount(this.stateHandler, this.spyHandler);
	      }
	    }, {
	      key: 'render',
	      value: function render() {
	        var className = "";
	
	        if (this.state && this.state.active) {
	          className = ((this.props.className || "") + " " + (this.props.activeClass || "active")).trim();
	        } else {
	          className = this.props.className;
	        }
	
	        var props = _extends({}, this.props);
	
	        for (var prop in protoTypes) {
	          if (props.hasOwnProperty(prop)) {
	            delete props[prop];
	          }
	        }
	
	        props.className = className;
	        props.onClick = this.handleClick;
	
	        return _react2.default.createElement(Component, props);
	      }
	    }]);
	
	    return Link;
	  }(_react2.default.PureComponent);
	
	  var _initialiseProps = function _initialiseProps() {
	    var _this2 = this;
	
	    this.scrollTo = function (to, props) {
	      scroller.scrollTo(to, _extends({}, _this2.state, props));
	    };
	
	    this.handleClick = function (event) {
	
	      /*
	       * give the posibility to override onClick
	       */
	
	      if (_this2.props.onClick) {
	        _this2.props.onClick(event);
	      }
	
	      /*
	       * dont bubble the navigation
	       */
	
	      if (event.stopPropagation) event.stopPropagation();
	      if (event.preventDefault) event.preventDefault();
	
	      /*
	       * do the magic!
	       */
	      _this2.scrollTo(_this2.props.to, _this2.props);
	    };
	
	    this.spyHandler = function (y) {
	
	      var scrollSpyContainer = _this2.getScrollSpyContainer();
	
	      if (_scrollHash2.default.isMounted() && !_scrollHash2.default.isInitialized()) {
	        return;
	      }
	
	      var to = _this2.props.to;
	      var element = null;
	      var elemTopBound = 0;
	      var elemBottomBound = 0;
	      var containerTop = 0;
	
	      if (scrollSpyContainer.getBoundingClientRect) {
	        var containerCords = scrollSpyContainer.getBoundingClientRect();
	        containerTop = containerCords.top;
	      }
	
	      if (!element || _this2.props.isDynamic) {
	        element = scroller.get(to);
	        if (!element) {
	          return;
	        }
	
	        var cords = element.getBoundingClientRect();
	        elemTopBound = cords.top - containerTop + y;
	        elemBottomBound = elemTopBound + cords.height;
	      }
	
	      var offsetY = y - _this2.props.offset;
	      var isInside = offsetY >= Math.floor(elemTopBound) && offsetY < Math.floor(elemBottomBound);
	      var isOutside = offsetY < Math.floor(elemTopBound) || offsetY >= Math.floor(elemBottomBound);
	      var activeLink = scroller.getActiveLink();
	
	      if (isOutside) {
	        if (to === activeLink) {
	          scroller.setActiveLink(void 0);
	        }
	
	        if (_this2.props.hashSpy && _scrollHash2.default.getHash() === to) {
	          _scrollHash2.default.changeHash();
	        }
	
	        if (_this2.props.spy && _this2.state.active) {
	          _this2.setState({ active: false });
	          _this2.props.onSetInactive && _this2.props.onSetInactive(to, element);
	        }
	      }
	
	      if (isInside && (activeLink !== to || _this2.state.active === false)) {
	        scroller.setActiveLink(to);
	
	        _this2.props.hashSpy && _scrollHash2.default.changeHash(to);
	
	        if (_this2.props.spy) {
	          _this2.setState({ active: true });
	          _this2.props.onSetActive && _this2.props.onSetActive(to, element);
	        }
	      }
	    };
	  };
	
	  ;
	
	  Link.propTypes = protoTypes;
	
	  Link.defaultProps = { offset: 0 };
	
	  return Link;
	};

/***/ }),

/***/ 515:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _lodash = __webpack_require__(963);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _passiveEventListeners = __webpack_require__(512);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// The eventHandler will execute at a rate of 15fps
	var eventThrottler = function eventThrottler(eventHandler) {
	  return (0, _lodash2.default)(eventHandler, 66);
	};
	
	var scrollSpy = {
	
	  spyCallbacks: [],
	  spySetState: [],
	  scrollSpyContainers: [],
	
	  mount: function mount(scrollSpyContainer) {
	    if (scrollSpyContainer) {
	      var eventHandler = eventThrottler(function (event) {
	        scrollSpy.scrollHandler(scrollSpyContainer);
	      });
	      scrollSpy.scrollSpyContainers.push(scrollSpyContainer);
	      (0, _passiveEventListeners.addPassiveEventListener)(scrollSpyContainer, 'scroll', eventHandler);
	    }
	  },
	  isMounted: function isMounted(scrollSpyContainer) {
	    return scrollSpy.scrollSpyContainers.indexOf(scrollSpyContainer) !== -1;
	  },
	  currentPositionY: function currentPositionY(scrollSpyContainer) {
	    if (scrollSpyContainer === document) {
	      var supportPageOffset = window.pageXOffset !== undefined;
	      var isCSS1Compat = (document.compatMode || "") === "CSS1Compat";
	      return supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
	    } else {
	      return scrollSpyContainer.scrollTop;
	    }
	  },
	  scrollHandler: function scrollHandler(scrollSpyContainer) {
	    var callbacks = scrollSpy.scrollSpyContainers[scrollSpy.scrollSpyContainers.indexOf(scrollSpyContainer)].spyCallbacks || [];
	    callbacks.forEach(function (c) {
	      return c(scrollSpy.currentPositionY(scrollSpyContainer));
	    });
	  },
	  addStateHandler: function addStateHandler(handler) {
	    scrollSpy.spySetState.push(handler);
	  },
	  addSpyHandler: function addSpyHandler(handler, scrollSpyContainer) {
	    var container = scrollSpy.scrollSpyContainers[scrollSpy.scrollSpyContainers.indexOf(scrollSpyContainer)];
	
	    if (!container.spyCallbacks) {
	      container.spyCallbacks = [];
	    }
	
	    container.spyCallbacks.push(handler);
	
	    handler(scrollSpy.currentPositionY(scrollSpyContainer));
	  },
	  updateStates: function updateStates() {
	    scrollSpy.spySetState.forEach(function (s) {
	      return s();
	    });
	  },
	  unmount: function unmount(stateHandler, spyHandler) {
	    scrollSpy.scrollSpyContainers.forEach(function (c) {
	      return c.spyCallbacks && c.spyCallbacks.length && c.spyCallbacks.splice(c.spyCallbacks.indexOf(spyHandler), 1);
	    });
	
	    if (scrollSpy.spySetState && scrollSpy.spySetState.length) {
	      scrollSpy.spySetState.splice(scrollSpy.spySetState.indexOf(stateHandler), 1);
	    }
	
	    document.removeEventListener('scroll', scrollSpy.scrollHandler);
	  },
	
	
	  update: function update() {
	    return scrollSpy.scrollSpyContainers.forEach(function (c) {
	      return scrollSpy.scrollHandler(c);
	    });
	  }
	};
	
	exports.default = scrollSpy;

/***/ }),

/***/ 419:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _utils = __webpack_require__(369);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _animateScroll = __webpack_require__(637);
	
	var _animateScroll2 = _interopRequireDefault(_animateScroll);
	
	var _scrollEvents = __webpack_require__(513);
	
	var _scrollEvents2 = _interopRequireDefault(_scrollEvents);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var __mapped = {};
	var __activeLink = void 0;
	
	exports.default = {
	
	  unmount: function unmount() {
	    __mapped = {};
	  },
	
	  register: function register(name, element) {
	    __mapped[name] = element;
	  },
	
	  unregister: function unregister(name) {
	    delete __mapped[name];
	  },
	
	  get: function get(name) {
	    return __mapped[name] || document.getElementById(name) || document.getElementsByName(name)[0] || document.getElementsByClassName(name)[0];
	  },
	
	  setActiveLink: function setActiveLink(link) {
	    return __activeLink = link;
	  },
	
	  getActiveLink: function getActiveLink() {
	    return __activeLink;
	  },
	
	  scrollTo: function scrollTo(to, props) {
	
	    var target = this.get(to);
	
	    if (!target) {
	      console.warn("target Element not found");
	      return;
	    }
	
	    props = _extends({}, props, { absolute: false });
	
	    var containerId = props.containerId;
	    var container = props.container;
	
	    var containerElement = void 0;
	    if (containerId) {
	      containerElement = document.getElementById(containerId);
	    } else if (container && container.nodeType) {
	      containerElement = container;
	    } else {
	      containerElement = document;
	    }
	
	    if (_scrollEvents2.default.registered.begin) {
	      _scrollEvents2.default.registered.begin(to, target);
	    }
	
	    props.absolute = true;
	
	    var scrollOffset = _utils2.default.scrollOffset(containerElement, target) + (props.offset || 0);
	
	    /*
	     * if animate is not provided just scroll into the view
	     */
	    if (!props.smooth) {
	      if (containerElement === document) {
	        window.scrollTo(0, scrollOffset);
	      } else {
	        containerElement.scrollTop = scrollOffset;
	      }
	
	      if (_scrollEvents2.default.registered['end']) {
	        _scrollEvents2.default.registered['end'](to, target);
	      }
	
	      return;
	    }
	
	    /*
	     * Animate scrolling
	     */
	
	    _animateScroll2.default.animateTopScroll(scrollOffset, props, to, target);
	  }
	};

/***/ }),

/***/ 1141:
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  /*
	   * https://github.com/oblador/angular-scroll (duScrollDefaultEasing)
	   */
	  defaultEasing: function defaultEasing(x) {
	    if (x < 0.5) {
	      return Math.pow(x * 2, 2) / 2;
	    }
	    return 1 - Math.pow((1 - x) * 2, 2) / 2;
	  },
	  /*
	   * https://gist.github.com/gre/1650294
	   */
	  // no easing, no acceleration
	  linear: function linear(x) {
	    return x;
	  },
	  // accelerating from zero velocity
	  easeInQuad: function easeInQuad(x) {
	    return x * x;
	  },
	  // decelerating to zero velocity
	  easeOutQuad: function easeOutQuad(x) {
	    return x * (2 - x);
	  },
	  // acceleration until halfway, then deceleration
	  easeInOutQuad: function easeInOutQuad(x) {
	    return x < .5 ? 2 * x * x : -1 + (4 - 2 * x) * x;
	  },
	  // accelerating from zero velocity 
	  easeInCubic: function easeInCubic(x) {
	    return x * x * x;
	  },
	  // decelerating to zero velocity π
	  easeOutCubic: function easeOutCubic(x) {
	    return --x * x * x + 1;
	  },
	  // acceleration until halfway, then deceleration 
	  easeInOutCubic: function easeInOutCubic(x) {
	    return x < .5 ? 4 * x * x * x : (x - 1) * (2 * x - 2) * (2 * x - 2) + 1;
	  },
	  // accelerating from zero velocity 
	  easeInQuart: function easeInQuart(x) {
	    return x * x * x * x;
	  },
	  // decelerating to zero velocity 
	  easeOutQuart: function easeOutQuart(x) {
	    return 1 - --x * x * x * x;
	  },
	  // acceleration until halfway, then deceleration
	  easeInOutQuart: function easeInOutQuart(x) {
	    return x < .5 ? 8 * x * x * x * x : 1 - 8 * --x * x * x * x;
	  },
	  // accelerating from zero velocity
	  easeInQuint: function easeInQuint(x) {
	    return x * x * x * x * x;
	  },
	  // decelerating to zero velocity
	  easeOutQuint: function easeOutQuint(x) {
	    return 1 + --x * x * x * x * x;
	  },
	  // acceleration until halfway, then deceleration 
	  easeInOutQuint: function easeInOutQuint(x) {
	    return x < .5 ? 16 * x * x * x * x * x : 1 + 16 * --x * x * x * x * x;
	  }
	};

/***/ }),

/***/ 369:
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var pushHash = function pushHash(hash) {
	  hash = hash ? hash.indexOf('#') === 0 ? hash : '#' + hash : '';
	
	  if (history.pushState) {
	    var loc = window.location;
	    history.pushState(null, null, hash ? loc.pathname + loc.search + hash
	    // remove hash
	    : loc.pathname + loc.search);
	  } else {
	    location.hash = hash;
	  }
	};
	
	var getHash = function getHash() {
	  return window.location.hash.replace(/^#/, '');
	};
	
	var filterElementInContainer = function filterElementInContainer(container) {
	  return function (element) {
	    return container.contains ? container != element && container.contains(element) : !!(container.compareDocumentPosition(element) & 16);
	  };
	};
	
	var scrollOffset = function scrollOffset(c, t) {
	  return c === document ? t.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) : getComputedStyle(c).position === "relative" ? t.offsetTop : t.getBoundingClientRect().top + c.scrollTop;
	};
	
	exports.default = {
	  pushHash: pushHash,
	  getHash: getHash,
	  filterElementInContainer: filterElementInContainer,
	  scrollOffset: scrollOffset
	};

/***/ }),

/***/ 130:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', { value: true });
	
	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }
	
	var $$observable = _interopDefault(__webpack_require__(374));
	
	/**
	 * These are private action types reserved by Redux.
	 * For any unknown actions, you must return the current state.
	 * If the current state is undefined, you must return the initial state.
	 * Do not reference these action types directly in your code.
	 */
	var ActionTypes = {
	  INIT: '@@redux/INIT' + Math.random().toString(36).substring(7).split('').join('.'),
	  REPLACE: '@@redux/REPLACE' + Math.random().toString(36).substring(7).split('').join('.')
	};
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};
	
	var _extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];
	
	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }
	
	  return target;
	};
	
	/**
	 * @param {any} obj The object to inspect.
	 * @returns {boolean} True if the argument appears to be a plain object.
	 */
	function isPlainObject(obj) {
	  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || obj === null) return false;
	
	  var proto = obj;
	  while (Object.getPrototypeOf(proto) !== null) {
	    proto = Object.getPrototypeOf(proto);
	  }
	
	  return Object.getPrototypeOf(obj) === proto;
	}
	
	/**
	 * Creates a Redux store that holds the state tree.
	 * The only way to change the data in the store is to call `dispatch()` on it.
	 *
	 * There should only be a single store in your app. To specify how different
	 * parts of the state tree respond to actions, you may combine several reducers
	 * into a single reducer function by using `combineReducers`.
	 *
	 * @param {Function} reducer A function that returns the next state tree, given
	 * the current state tree and the action to handle.
	 *
	 * @param {any} [preloadedState] The initial state. You may optionally specify it
	 * to hydrate the state from the server in universal apps, or to restore a
	 * previously serialized user session.
	 * If you use `combineReducers` to produce the root reducer function, this must be
	 * an object with the same shape as `combineReducers` keys.
	 *
	 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
	 * to enhance the store with third-party capabilities such as middleware,
	 * time travel, persistence, etc. The only store enhancer that ships with Redux
	 * is `applyMiddleware()`.
	 *
	 * @returns {Store} A Redux store that lets you read the state, dispatch actions
	 * and subscribe to changes.
	 */
	function createStore(reducer, preloadedState, enhancer) {
	  var _ref2;
	
	  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
	    enhancer = preloadedState;
	    preloadedState = undefined;
	  }
	
	  if (typeof enhancer !== 'undefined') {
	    if (typeof enhancer !== 'function') {
	      throw new Error('Expected the enhancer to be a function.');
	    }
	
	    return enhancer(createStore)(reducer, preloadedState);
	  }
	
	  if (typeof reducer !== 'function') {
	    throw new Error('Expected the reducer to be a function.');
	  }
	
	  var currentReducer = reducer;
	  var currentState = preloadedState;
	  var currentListeners = [];
	  var nextListeners = currentListeners;
	  var isDispatching = false;
	
	  function ensureCanMutateNextListeners() {
	    if (nextListeners === currentListeners) {
	      nextListeners = currentListeners.slice();
	    }
	  }
	
	  /**
	   * Reads the state tree managed by the store.
	   *
	   * @returns {any} The current state tree of your application.
	   */
	  function getState() {
	    if (isDispatching) {
	      throw new Error('You may not call store.getState() while the reducer is executing. ' + 'The reducer has already received the state as an argument. ' + 'Pass it down from the top reducer instead of reading it from the store.');
	    }
	
	    return currentState;
	  }
	
	  /**
	   * Adds a change listener. It will be called any time an action is dispatched,
	   * and some part of the state tree may potentially have changed. You may then
	   * call `getState()` to read the current state tree inside the callback.
	   *
	   * You may call `dispatch()` from a change listener, with the following
	   * caveats:
	   *
	   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
	   * If you subscribe or unsubscribe while the listeners are being invoked, this
	   * will not have any effect on the `dispatch()` that is currently in progress.
	   * However, the next `dispatch()` call, whether nested or not, will use a more
	   * recent snapshot of the subscription list.
	   *
	   * 2. The listener should not expect to see all state changes, as the state
	   * might have been updated multiple times during a nested `dispatch()` before
	   * the listener is called. It is, however, guaranteed that all subscribers
	   * registered before the `dispatch()` started will be called with the latest
	   * state by the time it exits.
	   *
	   * @param {Function} listener A callback to be invoked on every dispatch.
	   * @returns {Function} A function to remove this change listener.
	   */
	  function subscribe(listener) {
	    if (typeof listener !== 'function') {
	      throw new Error('Expected the listener to be a function.');
	    }
	
	    if (isDispatching) {
	      throw new Error('You may not call store.subscribe() while the reducer is executing. ' + 'If you would like to be notified after the store has been updated, subscribe from a ' + 'component and invoke store.getState() in the callback to access the latest state. ' + 'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.');
	    }
	
	    var isSubscribed = true;
	
	    ensureCanMutateNextListeners();
	    nextListeners.push(listener);
	
	    return function unsubscribe() {
	      if (!isSubscribed) {
	        return;
	      }
	
	      if (isDispatching) {
	        throw new Error('You may not unsubscribe from a store listener while the reducer is executing. ' + 'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.');
	      }
	
	      isSubscribed = false;
	
	      ensureCanMutateNextListeners();
	      var index = nextListeners.indexOf(listener);
	      nextListeners.splice(index, 1);
	    };
	  }
	
	  /**
	   * Dispatches an action. It is the only way to trigger a state change.
	   *
	   * The `reducer` function, used to create the store, will be called with the
	   * current state tree and the given `action`. Its return value will
	   * be considered the **next** state of the tree, and the change listeners
	   * will be notified.
	   *
	   * The base implementation only supports plain object actions. If you want to
	   * dispatch a Promise, an Observable, a thunk, or something else, you need to
	   * wrap your store creating function into the corresponding middleware. For
	   * example, see the documentation for the `redux-thunk` package. Even the
	   * middleware will eventually dispatch plain object actions using this method.
	   *
	   * @param {Object} action A plain object representing “what changed”. It is
	   * a good idea to keep actions serializable so you can record and replay user
	   * sessions, or use the time travelling `redux-devtools`. An action must have
	   * a `type` property which may not be `undefined`. It is a good idea to use
	   * string constants for action types.
	   *
	   * @returns {Object} For convenience, the same action object you dispatched.
	   *
	   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
	   * return something else (for example, a Promise you can await).
	   */
	  function dispatch(action) {
	    if (!isPlainObject(action)) {
	      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
	    }
	
	    if (typeof action.type === 'undefined') {
	      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
	    }
	
	    if (isDispatching) {
	      throw new Error('Reducers may not dispatch actions.');
	    }
	
	    try {
	      isDispatching = true;
	      currentState = currentReducer(currentState, action);
	    } finally {
	      isDispatching = false;
	    }
	
	    var listeners = currentListeners = nextListeners;
	    for (var i = 0; i < listeners.length; i++) {
	      var listener = listeners[i];
	      listener();
	    }
	
	    return action;
	  }
	
	  /**
	   * Replaces the reducer currently used by the store to calculate the state.
	   *
	   * You might need this if your app implements code splitting and you want to
	   * load some of the reducers dynamically. You might also need this if you
	   * implement a hot reloading mechanism for Redux.
	   *
	   * @param {Function} nextReducer The reducer for the store to use instead.
	   * @returns {void}
	   */
	  function replaceReducer(nextReducer) {
	    if (typeof nextReducer !== 'function') {
	      throw new Error('Expected the nextReducer to be a function.');
	    }
	
	    currentReducer = nextReducer;
	    dispatch({ type: ActionTypes.REPLACE });
	  }
	
	  /**
	   * Interoperability point for observable/reactive libraries.
	   * @returns {observable} A minimal observable of state changes.
	   * For more information, see the observable proposal:
	   * https://github.com/tc39/proposal-observable
	   */
	  function observable() {
	    var _ref;
	
	    var outerSubscribe = subscribe;
	    return _ref = {
	      /**
	       * The minimal observable subscription method.
	       * @param {Object} observer Any object that can be used as an observer.
	       * The observer object should have a `next` method.
	       * @returns {subscription} An object with an `unsubscribe` method that can
	       * be used to unsubscribe the observable from the store, and prevent further
	       * emission of values from the observable.
	       */
	      subscribe: function subscribe(observer) {
	        if ((typeof observer === 'undefined' ? 'undefined' : _typeof(observer)) !== 'object' || observer === null) {
	          throw new TypeError('Expected the observer to be an object.');
	        }
	
	        function observeState() {
	          if (observer.next) {
	            observer.next(getState());
	          }
	        }
	
	        observeState();
	        var unsubscribe = outerSubscribe(observeState);
	        return { unsubscribe: unsubscribe };
	      }
	    }, _ref[$$observable] = function () {
	      return this;
	    }, _ref;
	  }
	
	  // When a store is created, an "INIT" action is dispatched so that every
	  // reducer returns their initial state. This effectively populates
	  // the initial state tree.
	  dispatch({ type: ActionTypes.INIT });
	
	  return _ref2 = {
	    dispatch: dispatch,
	    subscribe: subscribe,
	    getState: getState,
	    replaceReducer: replaceReducer
	  }, _ref2[$$observable] = observable, _ref2;
	}
	
	/**
	 * Prints a warning in the console if it exists.
	 *
	 * @param {String} message The warning message.
	 * @returns {void}
	 */
	function warning(message) {
	  /* eslint-disable no-console */
	  if (typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error(message);
	  }
	  /* eslint-enable no-console */
	  try {
	    // This error was thrown as a convenience so that if you enable
	    // "break on all exceptions" in your console,
	    // it would pause the execution at this line.
	    throw new Error(message);
	  } catch (e) {} // eslint-disable-line no-empty
	}
	
	function getUndefinedStateErrorMessage(key, action) {
	  var actionType = action && action.type;
	  var actionDescription = actionType && 'action "' + String(actionType) + '"' || 'an action';
	
	  return 'Given ' + actionDescription + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state. ' + 'If you want this reducer to hold no value, you can return null instead of undefined.';
	}
	
	function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
	  var reducerKeys = Object.keys(reducers);
	  var argumentName = action && action.type === ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';
	
	  if (reducerKeys.length === 0) {
	    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
	  }
	
	  if (!isPlainObject(inputState)) {
	    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
	  }
	
	  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
	    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
	  });
	
	  unexpectedKeys.forEach(function (key) {
	    unexpectedKeyCache[key] = true;
	  });
	
	  if (action && action.type === ActionTypes.REPLACE) return;
	
	  if (unexpectedKeys.length > 0) {
	    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
	  }
	}
	
	function assertReducerShape(reducers) {
	  Object.keys(reducers).forEach(function (key) {
	    var reducer = reducers[key];
	    var initialState = reducer(undefined, { type: ActionTypes.INIT });
	
	    if (typeof initialState === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined. If you don\'t want to set a value for this reducer, ' + 'you can use null instead of undefined.');
	    }
	
	    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
	    if (typeof reducer(undefined, { type: type }) === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined, but can be null.');
	    }
	  });
	}
	
	/**
	 * Turns an object whose values are different reducer functions, into a single
	 * reducer function. It will call every child reducer, and gather their results
	 * into a single state object, whose keys correspond to the keys of the passed
	 * reducer functions.
	 *
	 * @param {Object} reducers An object whose values correspond to different
	 * reducer functions that need to be combined into one. One handy way to obtain
	 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
	 * undefined for any action. Instead, they should return their initial state
	 * if the state passed to them was undefined, and the current state for any
	 * unrecognized action.
	 *
	 * @returns {Function} A reducer function that invokes every reducer inside the
	 * passed object, and builds a state object with the same shape.
	 */
	function combineReducers(reducers) {
	  var reducerKeys = Object.keys(reducers);
	  var finalReducers = {};
	  for (var i = 0; i < reducerKeys.length; i++) {
	    var key = reducerKeys[i];
	
	    if (false) {
	      if (typeof reducers[key] === 'undefined') {
	        warning('No reducer provided for key "' + key + '"');
	      }
	    }
	
	    if (typeof reducers[key] === 'function') {
	      finalReducers[key] = reducers[key];
	    }
	  }
	  var finalReducerKeys = Object.keys(finalReducers);
	
	  var unexpectedKeyCache = void 0;
	  if (false) {
	    unexpectedKeyCache = {};
	  }
	
	  var shapeAssertionError = void 0;
	  try {
	    assertReducerShape(finalReducers);
	  } catch (e) {
	    shapeAssertionError = e;
	  }
	
	  return function combination() {
	    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var action = arguments[1];
	
	    if (shapeAssertionError) {
	      throw shapeAssertionError;
	    }
	
	    if (false) {
	      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
	      if (warningMessage) {
	        warning(warningMessage);
	      }
	    }
	
	    var hasChanged = false;
	    var nextState = {};
	    for (var _i = 0; _i < finalReducerKeys.length; _i++) {
	      var _key = finalReducerKeys[_i];
	      var reducer = finalReducers[_key];
	      var previousStateForKey = state[_key];
	      var nextStateForKey = reducer(previousStateForKey, action);
	      if (typeof nextStateForKey === 'undefined') {
	        var errorMessage = getUndefinedStateErrorMessage(_key, action);
	        throw new Error(errorMessage);
	      }
	      nextState[_key] = nextStateForKey;
	      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
	    }
	    return hasChanged ? nextState : state;
	  };
	}
	
	function bindActionCreator(actionCreator, dispatch) {
	  return function () {
	    return dispatch(actionCreator.apply(this, arguments));
	  };
	}
	
	/**
	 * Turns an object whose values are action creators, into an object with the
	 * same keys, but with every function wrapped into a `dispatch` call so they
	 * may be invoked directly. This is just a convenience method, as you can call
	 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
	 *
	 * For convenience, you can also pass a single function as the first argument,
	 * and get a function in return.
	 *
	 * @param {Function|Object} actionCreators An object whose values are action
	 * creator functions. One handy way to obtain it is to use ES6 `import * as`
	 * syntax. You may also pass a single function.
	 *
	 * @param {Function} dispatch The `dispatch` function available on your Redux
	 * store.
	 *
	 * @returns {Function|Object} The object mimicking the original object, but with
	 * every action creator wrapped into the `dispatch` call. If you passed a
	 * function as `actionCreators`, the return value will also be a single
	 * function.
	 */
	function bindActionCreators(actionCreators, dispatch) {
	  if (typeof actionCreators === 'function') {
	    return bindActionCreator(actionCreators, dispatch);
	  }
	
	  if ((typeof actionCreators === 'undefined' ? 'undefined' : _typeof(actionCreators)) !== 'object' || actionCreators === null) {
	    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators === 'undefined' ? 'undefined' : _typeof(actionCreators)) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
	  }
	
	  var keys = Object.keys(actionCreators);
	  var boundActionCreators = {};
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    var actionCreator = actionCreators[key];
	    if (typeof actionCreator === 'function') {
	      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
	    }
	  }
	  return boundActionCreators;
	}
	
	/**
	 * Composes single-argument functions from right to left. The rightmost
	 * function can take multiple arguments as it provides the signature for
	 * the resulting composite function.
	 *
	 * @param {...Function} funcs The functions to compose.
	 * @returns {Function} A function obtained by composing the argument functions
	 * from right to left. For example, compose(f, g, h) is identical to doing
	 * (...args) => f(g(h(...args))).
	 */
	
	function compose() {
	  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
	    funcs[_key] = arguments[_key];
	  }
	
	  if (funcs.length === 0) {
	    return function (arg) {
	      return arg;
	    };
	  }
	
	  if (funcs.length === 1) {
	    return funcs[0];
	  }
	
	  return funcs.reduce(function (a, b) {
	    return function () {
	      return a(b.apply(undefined, arguments));
	    };
	  });
	}
	
	/**
	 * Creates a store enhancer that applies middleware to the dispatch method
	 * of the Redux store. This is handy for a variety of tasks, such as expressing
	 * asynchronous actions in a concise manner, or logging every action payload.
	 *
	 * See `redux-thunk` package as an example of the Redux middleware.
	 *
	 * Because middleware is potentially asynchronous, this should be the first
	 * store enhancer in the composition chain.
	 *
	 * Note that each middleware will be given the `dispatch` and `getState` functions
	 * as named arguments.
	 *
	 * @param {...Function} middlewares The middleware chain to be applied.
	 * @returns {Function} A store enhancer applying the middleware.
	 */
	function applyMiddleware() {
	  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
	    middlewares[_key] = arguments[_key];
	  }
	
	  return function (createStore) {
	    return function () {
	      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	        args[_key2] = arguments[_key2];
	      }
	
	      var store = createStore.apply(undefined, args);
	      var _dispatch = function dispatch() {
	        throw new Error('Dispatching while constructing your middleware is not allowed. ' + 'Other middleware would not be applied to this dispatch.');
	      };
	
	      var middlewareAPI = {
	        getState: store.getState,
	        dispatch: function dispatch() {
	          return _dispatch.apply(undefined, arguments);
	        }
	      };
	      var chain = middlewares.map(function (middleware) {
	        return middleware(middlewareAPI);
	      });
	      _dispatch = compose.apply(undefined, chain)(store.dispatch);
	
	      return _extends({}, store, {
	        dispatch: _dispatch
	      });
	    };
	  };
	}
	
	/*
	 * This is a dummy function to check if the function name has been altered by minification.
	 * If the function has been minified and NODE_ENV !== 'production', warn the user.
	 */
	function isCrushed() {}
	
	if (false) {
	  warning("You are currently using minified code outside of NODE_ENV === 'production'. " + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
	}
	
	exports.createStore = createStore;
	exports.combineReducers = combineReducers;
	exports.bindActionCreators = bindActionCreators;
	exports.applyMiddleware = applyMiddleware;
	exports.compose = compose;
	exports.__DO_NOT_USE__ActionTypes = ActionTypes;


/***/ }),

/***/ 374:
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _ponyfill = __webpack_require__(375);
	
	var _ponyfill2 = _interopRequireDefault(_ponyfill);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var root; /* global window */
	
	
	if (typeof self !== 'undefined') {
	  root = self;
	} else if (typeof window !== 'undefined') {
	  root = window;
	} else if (typeof global !== 'undefined') {
	  root = global;
	} else if (true) {
	  root = module;
	} else {
	  root = Function('return this')();
	}
	
	var result = (0, _ponyfill2['default'])(root);
	exports['default'] = result;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(49)(module)))

/***/ }),

/***/ 375:
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports['default'] = symbolObservablePonyfill;
	function symbolObservablePonyfill(root) {
		var result;
		var _Symbol = root.Symbol;
	
		if (typeof _Symbol === 'function') {
			if (_Symbol.observable) {
				result = _Symbol.observable;
			} else {
				result = _Symbol('observable');
				_Symbol.observable = result;
			}
		} else {
			result = '@@observable';
		}
	
		return result;
	};

/***/ }),

/***/ 1258:
/***/ (function(module, exports) {

	(function() {
	  var URL, URL_PATTERN, defaults, urllite,
	    __hasProp = {}.hasOwnProperty;
	
	  URL_PATTERN = /^(?:(?:([^:\/?\#]+:)\/+|(\/\/))(?:([a-z0-9-\._~%]+)(?::([a-z0-9-\._~%]+))?@)?(([a-z0-9-\._~%!$&'()*+,;=]+)(?::([0-9]+))?)?)?([^?\#]*?)(\?[^\#]*)?(\#.*)?$/;
	
	  urllite = function(raw, opts) {
	    return urllite.URL.parse(raw, opts);
	  };
	
	  urllite.URL = URL = (function() {
	    function URL(props) {
	      var k, v, _ref;
	      for (k in defaults) {
	        if (!__hasProp.call(defaults, k)) continue;
	        v = defaults[k];
	        this[k] = (_ref = props[k]) != null ? _ref : v;
	      }
	      this.host || (this.host = this.hostname && this.port ? "" + this.hostname + ":" + this.port : this.hostname ? this.hostname : '');
	      this.origin || (this.origin = this.protocol ? "" + this.protocol + "//" + this.host : '');
	      this.isAbsolutePathRelative = !this.host && this.pathname.charAt(0) === '/';
	      this.isPathRelative = !this.host && this.pathname.charAt(0) !== '/';
	      this.isRelative = this.isSchemeRelative || this.isAbsolutePathRelative || this.isPathRelative;
	      this.isAbsolute = !this.isRelative;
	    }
	
	    URL.parse = function(raw) {
	      var m, pathname, protocol;
	      m = raw.toString().match(URL_PATTERN);
	      pathname = m[8] || '';
	      protocol = m[1];
	      return new urllite.URL({
	        protocol: protocol,
	        username: m[3],
	        password: m[4],
	        hostname: m[6],
	        port: m[7],
	        pathname: protocol && pathname.charAt(0) !== '/' ? "/" + pathname : pathname,
	        search: m[9],
	        hash: m[10],
	        isSchemeRelative: m[2] != null
	      });
	    };
	
	    return URL;
	
	  })();
	
	  defaults = {
	    protocol: '',
	    username: '',
	    password: '',
	    host: '',
	    hostname: '',
	    port: '',
	    pathname: '',
	    search: '',
	    hash: '',
	    origin: '',
	    isSchemeRelative: false
	  };
	
	  module.exports = urllite;
	
	}).call(this);


/***/ }),

/***/ 1262:
/***/ (function(module, exports) {

	// Returns a wrapper function that returns a wrapped callback
	// The wrapper function should do some stuff, and return a
	// presumably different callback function.
	// This makes sure that own properties are retained, so that
	// decorations and such are not lost along the way.
	module.exports = wrappy
	function wrappy (fn, cb) {
	  if (fn && cb) return wrappy(fn)(cb)
	
	  if (typeof fn !== 'function')
	    throw new TypeError('need wrapper function')
	
	  Object.keys(fn).forEach(function (k) {
	    wrapper[k] = fn[k]
	  })
	
	  return wrapper
	
	  function wrapper() {
	    var args = new Array(arguments.length)
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i]
	    }
	    var ret = fn.apply(this, args)
	    var cb = args[args.length-1]
	    if (typeof ret === 'function' && ret !== cb) {
	      Object.keys(cb).forEach(function (k) {
	        ret[k] = cb[k]
	      })
	    }
	    return ret
	  }
	}


/***/ }),

/***/ 376:
/***/ (function(module, exports) {

	module.exports = extend
	
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	
	function extend() {
	    var target = {}
	
	    for (var i = 0; i < arguments.length; i++) {
	        var source = arguments[i]
	
	        for (var key in source) {
	            if (hasOwnProperty.call(source, key)) {
	                target[key] = source[key]
	            }
	        }
	    }
	
	    return target
	}


/***/ }),

/***/ 671:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _propTypes = __webpack_require__(3);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _Circle = __webpack_require__(163);
	
	var _Circle2 = _interopRequireDefault(_Circle);
	
	var _Button = __webpack_require__(206);
	
	var _Button2 = _interopRequireDefault(_Button);
	
	var _Svg = __webpack_require__(539);
	
	var _Svg2 = _interopRequireDefault(_Svg);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	var NoPaddingButton = function NoPaddingButton(props) {
	  return _react2.default.createElement(_Button2.default, _extends({
	    px: '0',
	    py: '0',
	    color: 'lightBlue',
	    bg: 'white',
	    border: '1px solid',
	    borderColor: 'lightBlue',
	    hoverBg: 'yellow',
	    borderRadius: '50%'
	  }, props));
	};
	
	var ArraowDown = function ArraowDown(_ref) {
	  var children = _ref.children,
	      onClick = _ref.onClick,
	      arrowType = _ref.arrowType,
	      props = _objectWithoutProperties(_ref, ['children', 'onClick', 'arrowType']);
	
	  return _react2.default.createElement(
	    _Box2.default,
	    props,
	    _react2.default.createElement(
	      _Circle2.default,
	      {
	        lineHeight: '0',
	        onClick: onClick,
	        is: NoPaddingButton
	      },
	      _react2.default.createElement(
	        _Svg2.default,
	        { viewBox: '0 0 60 60' },
	        _react2.default.createElement('path', { fill: 'transparent', stroke: 'currentColor', d: 'M24.29 28.15L30 35.12l5.71-6.97' })
	      )
	    )
	  );
	};
	
	ArraowDown.propTypes = {
	  children: _propTypes2.default.node,
	  onClick: _propTypes2.default.func
	};
	
	exports.default = ArraowDown;
	module.exports = exports['default'];

/***/ }),

/***/ 206:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.buttonStyle = undefined;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  color: ', ';\n  background-color: ', ';\n  border-color: ', ';\n'], ['\n  color: ', ';\n  background-color: ', ';\n  border-color: ', ';\n']),
	    _templateObject2 = _taggedTemplateLiteralLoose(['\n  padding: 0;\n  border: none;\n  font-family: inherit;\n  line-height: 1;\n  text-decoration: none;\n  ', '\n  ', '\n  ', '\n  ', '\n  ', '\n  ', '\n  ', '\n  ', '\n  ', '\n  ', '\n  appearance: none;\n  transition: all ', 'ms;\n  cursor: pointer;\n  &:hover,\n  &:focus {\n    ', '\n  }\n  ', '\n  ', '\n'], ['\n  padding: 0;\n  border: none;\n  font-family: inherit;\n  line-height: 1;\n  text-decoration: none;\n  ', '\n  ', '\n  ', '\n  ', '\n  ', '\n  ', '\n  ', '\n  ', '\n  ', '\n  ', '\n  appearance: none;\n  transition: all ', 'ms;\n  cursor: pointer;\n  &:hover,\n  &:focus {\n    ', '\n  }\n  ', '\n  ', '\n']),
	    _templateObject3 = _taggedTemplateLiteralLoose(['\n  ', '\n'], ['\n  ', '\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _cleanTag = __webpack_require__(166);
	
	var _cleanTag2 = _interopRequireDefault(_cleanTag);
	
	var _getColor = __webpack_require__(381);
	
	var _blacklist = __webpack_require__(164);
	
	var _blacklist2 = _interopRequireDefault(_blacklist);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var active = (0, _styledComponents.css)(_templateObject, (0, _getColor.getColorByPropKey)('hoverColor'), (0, _getColor.getColorByPropKey)('hoverBg'), (0, _getColor.getColorByPropKey)('hoverBorder'));
	
	var buttonStyle = exports.buttonStyle = (0, _styledComponents.css)(_templateObject2, _styledSystem.fontSize, _styledSystem.position, _styledSystem.space, _styledSystem.color, _styledSystem.width, _styledSystem.borders, _styledSystem.borderColor, _styledSystem.borderRadius, _styledSystem.fontWeight, _styledSystem.letterSpacing, (0, _styledSystem.themeGet)('duration', 250), function (props) {
	  return !props.disabled && active;
	}, function (props) {
	  return props.active && !props.disabled && active;
	}, function (props) {
	  return props.disabled && '\n    cursor: not-allowed;\n    opacity: 0.5;\n  ';
	});
	
	var Button = (0, _styledComponents2.default)(_cleanTag2.default)(_templateObject3, buttonStyle);
	
	Button.defaultProps = {
	  blacklist: _blacklist2.default,
	  is: 'button',
	  f: '1em',
	  bg: 'blue',
	  color: 'white',
	  hoverColor: 'blue',
	  hoverBg: 'white',
	  px: '0.5em',
	  py: '0.25em',
	  fontWeight: 'bold'
	};
	
	Button.secondary = function (props) {
	  return _react2.default.createElement(Button, _extends({
	    bg: 'secondary',
	    borderColor: 'secondary',
	    hoverColor: 'secondary'
	  }, props));
	};
	
	Button.transparent = function (props) {
	  return _react2.default.createElement(Button, _extends({
	    border: '1px solid transparent',
	    bg: 'transparent',
	    color: 'text',
	    hoverBorder: 'blue'
	  }, props));
	};
	
	exports.default = Button;

/***/ }),

/***/ 530:
/***/ (function(module, exports) {

	module.exports = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NTIgMTc1Ij48dGl0bGU+Y2xvdWQ8L3RpdGxlPjxwYXRoIGQ9Ik0zNTAuMTcsMTM3LjE2YTYxLjc2LDYxLjc2LDAsMCwwLTEyLDEuMThBNjEuNzUsNjEuNzUsMCwwLDAsMjk3LDEwMy44Yy4yNS0yLjc4LjQtNS42LjQtOC40NUE5NC42Miw5NC42MiwwLDAsMCwxMDksODIuMjVhNjEuNjQsNjEuNjQsMCwwLDAtNTYuMjksNDYuNTFBNjEuNjYsNjEuNjYsMCwwLDAsLjA1LDE3NC41N0g0MDYuODRBNjEuNjQsNjEuNjQsMCwwLDAsMzUwLjE3LDEzNy4xNloiIGZpbGw9IiNmN2Y3ZjciLz48cGF0aCBkPSJNMzgyLjgxLDEzOC4zNGE2MS45MSw2MS45MSwwLDAsMC0yMC41OS0yNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGFjYWZmIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiLz48cGF0aCBkPSJNNDUxLjQ5LDE3NC41N2E2MS44NSw2MS44NSwwLDAsMC0zMC0zMS4zNyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGFjYWZmIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiLz48bGluZSB4MT0iMTQwLjUxIiB5MT0iMTc0LjU3IiB4Mj0iNDIzLjQzIiB5Mj0iMTc0LjU3IiBmaWxsPSJub25lIiBzdHJva2U9IiM4YWNhZmYiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIvPjxwYXRoIGQ9Ik03NSwxMzUuNzlBNjEuNzMsNjEuNzMsMCwwLDAsNDQuNywxNzQuNTciIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhhY2FmZiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIi8+PHBhdGggZD0iTTE1My42OSw4Mi4yNUE2MS42NSw2MS42NSwwLDAsMCw5Ny40LDEyOC43NiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGFjYWZmIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiLz48cGF0aCBkPSJNMjQ3LjM5LjczQTk0LjYyLDk0LjYyLDAsMCwwLDE1OS41LDYwLjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhhY2FmZiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIi8+PHBhdGggZD0iTTM0MS42MSwxMDMuOGMuMjUtMi43OC40LTUuNi40LTguNDVhOTQuMjgsOTQuMjgsMCwwLDAtMjcuNzItNjYuOSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGFjYWZmIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiLz48L3N2Zz4="

/***/ }),

/***/ 239:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _BackgroundImage = __webpack_require__(65);
	
	var _BackgroundImage2 = _interopRequireDefault(_BackgroundImage);
	
	var _cloud = __webpack_require__(530);
	
	var _cloud2 = _interopRequireDefault(_cloud);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Cloud = function Cloud(props) {
	  return _react2.default.createElement(
	    _Box2.default,
	    _extends({ position: 'absolute' }, props),
	    _react2.default.createElement(_BackgroundImage2.default, { ratio: 175 / 452, src: _cloud2.default })
	  );
	};
	
	exports.default = Cloud;
	module.exports = exports['default'];

/***/ }),

/***/ 672:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _propTypes = __webpack_require__(3);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	var _Border = __webpack_require__(39);
	
	var _Border2 = _interopRequireDefault(_Border);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	var DoubleLayerBox = function DoubleLayerBox(_ref) {
	  var m = _ref.m,
	      mx = _ref.mx,
	      my = _ref.my,
	      mt = _ref.mt,
	      ml = _ref.ml,
	      mb = _ref.mb,
	      mr = _ref.mr,
	      outerBg = _ref.outerBg,
	      border = _ref.border,
	      borderColor = _ref.borderColor,
	      w = _ref.w,
	      width = _ref.width,
	      position = _ref.position,
	      props = _objectWithoutProperties(_ref, ['m', 'mx', 'my', 'mt', 'ml', 'mb', 'mr', 'outerBg', 'border', 'borderColor', 'w', 'width', 'position']);
	
	  return (0, _react.createElement)(_Border2.default, {
	    m: m,
	    mx: mx,
	    my: my,
	    mt: mt,
	    ml: ml,
	    mb: mb,
	    mr: mr,
	    border: '1.5px solid',
	    borderColor: borderColor,
	    display: 'inline-block',
	    p: '0.25em',
	    bg: outerBg,
	    w: w,
	    width: width
	  }, _react2.default.createElement(_Border2.default, _extends({ w: 1, position: position, border: border, borderColor: borderColor }, props)));
	};
	
	var responsivePropTypes = _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string, _propTypes2.default.array]);
	
	DoubleLayerBox.propTypes = {
	  m: responsivePropTypes,
	  mx: responsivePropTypes,
	  my: responsivePropTypes,
	  mt: responsivePropTypes,
	  ml: responsivePropTypes,
	  mb: responsivePropTypes,
	  mr: responsivePropTypes,
	  w: responsivePropTypes,
	  width: responsivePropTypes,
	  outerBg: _propTypes2.default.string,
	  border: _propTypes2.default.string,
	  borderColor: _propTypes2.default.string,
	  position: _propTypes2.default.string
	};
	
	DoubleLayerBox.defaultProps = {
	  border: '1.5px solid',
	  borderColor: 'lightBlue',
	  outerBg: 'white'
	};
	
	exports.default = DoubleLayerBox;
	module.exports = exports['default'];

/***/ }),

/***/ 380:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _propTypes = __webpack_require__(3);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	var _pickBy = __webpack_require__(225);
	
	var _pickBy2 = _interopRequireDefault(_pickBy);
	
	var _Border = __webpack_require__(39);
	
	var _Border2 = _interopRequireDefault(_Border);
	
	var _Button = __webpack_require__(206);
	
	var _Button2 = _interopRequireDefault(_Button);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	var DoubleLayerCircleButton = function DoubleLayerCircleButton(_ref) {
	  var m = _ref.m,
	      mx = _ref.mx,
	      my = _ref.my,
	      mt = _ref.mt,
	      ml = _ref.ml,
	      mb = _ref.mb,
	      mr = _ref.mr,
	      outerBg = _ref.outerBg,
	      border = _ref.border,
	      borderRadius = _ref.borderRadius,
	      borderColor = _ref.borderColor,
	      w = _ref.w,
	      width = _ref.width,
	      props = _objectWithoutProperties(_ref, ['m', 'mx', 'my', 'mt', 'ml', 'mb', 'mr', 'outerBg', 'border', 'borderRadius', 'borderColor', 'w', 'width']);
	
	  var margins = {
	    m: m,
	    mx: mx,
	    my: my,
	    mt: mt,
	    ml: ml,
	    mb: mb,
	    mr: mr
	  };
	  return (0, _react.createElement)(_Border2.default, _extends({}, (0, _pickBy2.default)(margins, Boolean), {
	    display: 'inline-block',
	    border: '1.5px solid',
	    borderColor: props.disabled ? 'gray' : borderColor,
	    borderRadius: '5px',
	    p: '0.25em',
	    bg: outerBg,
	    w: w,
	    width: width
	  }), _react2.default.createElement(_Button2.default, _extends({ w: 1, border: border, borderRadius: borderRadius, borderColor: borderColor }, props)));
	};
	
	var responsivePropTypes = _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string, _propTypes2.default.array]);
	
	DoubleLayerCircleButton.propTypes = {
	  m: responsivePropTypes,
	  mx: responsivePropTypes,
	  my: responsivePropTypes,
	  mt: responsivePropTypes,
	  ml: responsivePropTypes,
	  mb: responsivePropTypes,
	  mr: responsivePropTypes,
	  w: responsivePropTypes,
	  width: responsivePropTypes,
	  outerBg: _propTypes2.default.string,
	  border: _propTypes2.default.string,
	  borderColor: _propTypes2.default.string,
	  disabled: _propTypes2.default.bool
	};
	
	DoubleLayerCircleButton.defaultProps = {
	  border: '1.5px solid',
	  borderColor: 'lightBlue',
	  borderRadius: '4px',
	  outerBg: 'white'
	};
	
	exports.default = DoubleLayerCircleButton;
	module.exports = exports['default'];

/***/ }),

/***/ 428:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _propTypes = __webpack_require__(3);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	var _pickBy = __webpack_require__(225);
	
	var _pickBy2 = _interopRequireDefault(_pickBy);
	
	var _Border = __webpack_require__(39);
	
	var _Border2 = _interopRequireDefault(_Border);
	
	var _Circle = __webpack_require__(163);
	
	var _Circle2 = _interopRequireDefault(_Circle);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	var DoubleLayerCircleButton = function DoubleLayerCircleButton(_ref) {
	  var m = _ref.m,
	      mx = _ref.mx,
	      my = _ref.my,
	      mt = _ref.mt,
	      ml = _ref.ml,
	      mb = _ref.mb,
	      mr = _ref.mr,
	      outerBg = _ref.outerBg,
	      border = _ref.border,
	      borderRadius = _ref.borderRadius,
	      borderColor = _ref.borderColor,
	      w = _ref.w,
	      width = _ref.width,
	      children = _ref.children,
	      props = _objectWithoutProperties(_ref, ['m', 'mx', 'my', 'mt', 'ml', 'mb', 'mr', 'outerBg', 'border', 'borderRadius', 'borderColor', 'w', 'width', 'children']);
	
	  var margins = {
	    m: m,
	    mx: mx,
	    my: my,
	    mt: mt,
	    ml: ml,
	    mb: mb,
	    mr: mr
	  };
	  return (0, _react.createElement)(_Border2.default, _extends({}, (0, _pickBy2.default)(margins, Boolean), {
	    display: 'inline-block',
	    border: '1.5px solid',
	    borderColor: props.disabled ? 'gray' : borderColor,
	    borderRadius: '50%',
	    p: '0.2em',
	    bg: outerBg,
	    w: w,
	    width: width,
	    lineHeight: '0'
	  }), _react2.default.createElement(
	    _Border2.default,
	    _extends({
	      w: 1,
	      border: border,
	      borderRadius: borderRadius,
	      borderColor: borderColor,
	      px: '0',
	      py: '0'
	    }, props),
	    _react2.default.createElement(
	      _Circle2.default,
	      null,
	      children
	    )
	  ));
	};
	
	var responsivePropTypes = _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string, _propTypes2.default.array]);
	
	DoubleLayerCircleButton.propTypes = {
	  m: responsivePropTypes,
	  mx: responsivePropTypes,
	  my: responsivePropTypes,
	  mt: responsivePropTypes,
	  ml: responsivePropTypes,
	  mb: responsivePropTypes,
	  mr: responsivePropTypes,
	  w: responsivePropTypes,
	  width: responsivePropTypes,
	  outerBg: _propTypes2.default.string,
	  border: _propTypes2.default.string,
	  borderColor: _propTypes2.default.string,
	  disabled: _propTypes2.default.bool
	};
	
	DoubleLayerCircleButton.defaultProps = {
	  border: '1.5px solid',
	  borderColor: 'lightBlue',
	  borderRadius: '50%',
	  outerBg: 'white'
	};
	
	exports.default = DoubleLayerCircleButton;
	module.exports = exports['default'];

/***/ }),

/***/ 674:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  ', '\n  ', '\n  ', '\n  ', '\n'], ['\n  ', '\n  ', '\n  ', '\n  ', '\n']);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _cleanTag = __webpack_require__(166);
	
	var _cleanTag2 = _interopRequireDefault(_cleanTag);
	
	var _injectProps = __webpack_require__(430);
	
	var _injectProps2 = _interopRequireDefault(_injectProps);
	
	var _blacklist = __webpack_require__(164);
	
	var _blacklist2 = _interopRequireDefault(_blacklist);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var Image = (0, _styledComponents2.default)(_cleanTag2.default.img)(_templateObject, _styledSystem.space, (0, _injectProps2.default)('verticalAlign'), _styledSystem.height, _styledSystem.width);
	
	Image.defaultProps = {
	  blacklist: _blacklist2.default,
	  w: 1
	};
	
	exports.default = Image;
	module.exports = exports['default'];

/***/ }),

/***/ 539:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  svg {\n    vertical-align: bottom;\n    width: 100%;\n  }\n'], ['\n  svg {\n    vertical-align: bottom;\n    width: 100%;\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _propTypes = __webpack_require__(3);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _reactContainerDimensions = __webpack_require__(1041);
	
	var _reactContainerDimensions2 = _interopRequireDefault(_reactContainerDimensions);
	
	var _bowser = __webpack_require__(747);
	
	var _bowser2 = _interopRequireDefault(_bowser);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var Container = (0, _styledComponents2.default)(_Box2.default.inline)(_templateObject);
	
	var parseViewbox = function parseViewbox(vb) {
	  var _vb$split = vb.split(' '),
	      x1 = _vb$split[0],
	      y1 = _vb$split[1],
	      x2 = _vb$split[2],
	      y2 = _vb$split[3];
	
	  return (y2 - y1) / (x2 - x1);
	};
	
	var isIE = _bowser2.default.msie;
	
	var SVG = function SVG(_ref) {
	  var viewBox = _ref.viewBox,
	      children = _ref.children,
	      props = _objectWithoutProperties(_ref, ['viewBox', 'children']);
	
	  return _react2.default.createElement(
	    Container,
	    props,
	    _react2.default.createElement(
	      _Box2.default,
	      null,
	      isIE ? _react2.default.createElement(
	        _reactContainerDimensions2.default,
	        null,
	        function (_ref2) {
	          var width = _ref2.width;
	          return _react2.default.createElement(
	            'svg',
	            { xmlns: 'http://www.w3.org/2000/svg', viewBox: viewBox, width: width, height: parseViewbox(viewBox) * width },
	            children
	          );
	        }
	      ) : _react2.default.createElement(
	        'svg',
	        { xmlns: 'http://www.w3.org/2000/svg', viewBox: viewBox },
	        children
	      )
	    )
	  );
	};
	
	SVG.propTypes = {
	  viewBox: _propTypes2.default.string,
	  children: _propTypes2.default.node.isRequired
	};
	
	exports.default = SVG;
	module.exports = exports['default'];

/***/ }),

/***/ 687:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  &:hover {\n    .elevator-button {\n      background: ', ';\n    }\n  }\n'], ['\n  &:hover {\n    .elevator-button {\n      background: ', ';\n    }\n  }\n']),
	    _templateObject2 = _taggedTemplateLiteralLoose(['\n  cursor: pointer;\n  &:hover {\n    color: ', ';\n    .elevator-button {\n      background: ', ';\n    }\n  }\n'], ['\n  cursor: pointer;\n  &:hover {\n    color: ', ';\n    .elevator-button {\n      background: ', ';\n    }\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactScroll = __webpack_require__(230);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _envelope = __webpack_require__(657);
	
	var _envelope2 = _interopRequireDefault(_envelope);
	
	var _relab = __webpack_require__(658);
	
	var _relab2 = _interopRequireDefault(_relab);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _Link = __webpack_require__(115);
	
	var _Link2 = _interopRequireDefault(_Link);
	
	var _Flex = __webpack_require__(47);
	
	var _Flex2 = _interopRequireDefault(_Flex);
	
	var _Text = __webpack_require__(41);
	
	var _Text2 = _interopRequireDefault(_Text);
	
	var _BackgroundImage = __webpack_require__(65);
	
	var _BackgroundImage2 = _interopRequireDefault(_BackgroundImage);
	
	var _DoubleLayerBox = __webpack_require__(672);
	
	var _DoubleLayerBox2 = _interopRequireDefault(_DoubleLayerBox);
	
	var _Border = __webpack_require__(39);
	
	var _Border2 = _interopRequireDefault(_Border);
	
	var _LinksButtonhref = __webpack_require__(540);
	
	var _LinksButtonhref2 = _interopRequireDefault(_LinksButtonhref);
	
	var _FloorButton = __webpack_require__(382);
	
	var _FloorButton2 = _interopRequireDefault(_FloorButton);
	
	var _floors = __webpack_require__(396);
	
	var _floors2 = _interopRequireDefault(_floors);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var contacts = [{
	  img: _envelope2.default,
	  text: '案件合作',
	  to: '/contact'
	}, {
	  img: _relab2.default,
	  text: '關於我們',
	  to: '/about'
	}];
	
	var StyledLink = (0, _styledComponents2.default)(_Link2.default)(_templateObject, (0, _styledSystem.themeGet)('colors.yellow'));
	
	var StyledScrollLink = (0, _styledComponents2.default)(_reactScroll.Link)(_templateObject2, (0, _styledSystem.themeGet)('colors.blue'), (0, _styledSystem.themeGet)('colors.yellow'));
	
	exports.default = function (_ref) {
	  var visible = _ref.visible,
	      onSetActiveFloor = _ref.onSetActiveFloor,
	      currentFloor = _ref.currentFloor;
	  return _react2.default.createElement(
	    _Box2.default,
	    {
	      position: 'fixed',
	      right: '2em',
	      top: '50vh',
	      transform: 'translateY(-50%)',
	      opacity: Number(visible),
	      pointerEvents: visible ? 'auto' : 'none',
	      zIndex: 99,
	      transition: 'opacity 500ms'
	    },
	    _react2.default.createElement(
	      _DoubleLayerBox2.default,
	      null,
	      _react2.default.createElement(
	        _Box2.default,
	        { px: '1em', py: '1em' },
	        _react2.default.createElement(
	          _Box2.default,
	          { bg: 'blue', p: '0.5em', w: '5em', mx: 'auto', mb: '1em' },
	          _react2.default.createElement(
	            _Border2.default,
	            { borderBottom: '1px solid white' },
	            _react2.default.createElement(
	              _Text2.default,
	              { align: 'center', f: '2em', color: 'white' },
	              currentFloor
	            )
	          )
	        ),
	        _react2.default.createElement(
	          _Box2.default,
	          null,
	          _floors2.default.map(function (f) {
	            return _react2.default.createElement(
	              StyledScrollLink,
	              {
	                key: f.floor,
	                to: f.floor,
	                spy: true,
	                smooth: true,
	                duration: 1000,
	                offset: -window.innerHeight / 4,
	                onSetActive: onSetActiveFloor
	              },
	              _react2.default.createElement(
	                _FloorButton2.default,
	                { label: f.floor, active: f.floor === currentFloor },
	                f.text
	              )
	            );
	          }),
	          ['5', 'B2'].map(function (key) {
	            return _react2.default.createElement(StyledScrollLink, {
	              key: key,
	              to: key,
	              spy: true,
	              offset: -window.innerHeight / 4,
	              onSetActive: onSetActiveFloor
	            });
	          }),
	          _react2.default.createElement(
	            StyledLink,
	            { to: '/portifolio' },
	            _react2.default.createElement(
	              _FloorButton2.default,
	              { label: 'All' },
	              '\u6240\u6709\u4F5C\u54C1'
	            )
	          )
	        ),
	        _react2.default.createElement(
	          _Flex2.default,
	          { align: 'center', justify: 'center' },
	          contacts.map(function (contact, index) {
	            return _react2.default.createElement(
	              _Box2.default,
	              { f: '0.8em', w: '4.5em', mt: '1em', key: index },
	              _react2.default.createElement(
	                _Box2.default,
	                { mx: '10%' },
	                _react2.default.createElement(
	                  _LinksButtonhref2.default,
	                  {
	                    to: contact.to,
	                    bg: 'transparent',
	                    hoverBg: 'yellow',
	                    w: 1,
	                    px: '0.25em',
	                    py: '0.125em'
	                  },
	                  _react2.default.createElement(_BackgroundImage2.default, { src: contact.img, ratio: 13 / 17 })
	                )
	              ),
	              _react2.default.createElement(
	                _Border2.default,
	                { borderBottom: '1px solid lightBlue', mx: '0.25em', mt: '0.5em' },
	                _react2.default.createElement(
	                  _Text2.default,
	                  { fontWeight: 'bold' },
	                  contact.text
	                )
	              )
	            );
	          })
	        )
	      )
	    )
	  );
	};
	
	module.exports = exports['default'];

/***/ }),

/***/ 382:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _Flex = __webpack_require__(47);
	
	var _Flex2 = _interopRequireDefault(_Flex);
	
	var _Text = __webpack_require__(41);
	
	var _Text2 = _interopRequireDefault(_Text);
	
	var _DoubleLayerCircle = __webpack_require__(428);
	
	var _DoubleLayerCircle2 = _interopRequireDefault(_DoubleLayerCircle);
	
	var _Border = __webpack_require__(39);
	
	var _Border2 = _interopRequireDefault(_Border);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	exports.default = function (_ref) {
	  var label = _ref.label,
	      active = _ref.active,
	      children = _ref.children,
	      props = _objectWithoutProperties(_ref, ['label', 'active', 'children']);
	
	  return _react2.default.createElement(
	    _Flex2.default,
	    _extends({ align: 'center', justify: 'center', mt: '0.25em' }, props),
	    _react2.default.createElement(
	      _Box2.default,
	      { w: '2.8em', f: '0.8em' },
	      _react2.default.createElement(
	        _DoubleLayerCircle2.default,
	        {
	          className: 'elevator-button',
	          bg: active ? 'yellow' : 'white',
	          fontWeight: 'bold',
	          color: 'blue',
	          w: 1
	        },
	        label
	      )
	    ),
	    children && _react2.default.createElement(
	      _Border2.default,
	      { borderBottom: '1px solid lightBlue', mx: '0.5em' },
	      _react2.default.createElement(
	        _Text2.default,
	        { fontWeight: 'bold', color: active && 'blue' },
	        children
	      )
	    )
	  );
	};
	
	module.exports = exports['default'];

/***/ }),

/***/ 540:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _propTypes = __webpack_require__(3);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	var _Link = __webpack_require__(115);
	
	var _Link2 = _interopRequireDefault(_Link);
	
	var _DoubleLayerButton = __webpack_require__(380);
	
	var _DoubleLayerButton2 = _interopRequireDefault(_DoubleLayerButton);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var LinksButton = function LinksButton(props) {
	  return _react2.default.createElement(_DoubleLayerButton2.default, _extends({
	    is: function is(p) {
	      return _react2.default.createElement(_Link2.default, _extends({
	        display: 'block'
	      }, p));
	    },
	    display: 'block'
	  }, props));
	};
	
	LinksButton.propTypes = {
	  children: _propTypes2.default.node
	};
	
	exports.default = LinksButton;
	module.exports = exports['default'];

/***/ }),

/***/ 688:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  width: 3.25em;\n  &:hover {\n    .elevator-button {\n      background: ', ';\n    }\n  }\n'], ['\n  width: 3.25em;\n  &:hover {\n    .elevator-button {\n      background: ', ';\n    }\n  }\n']),
	    _templateObject2 = _taggedTemplateLiteralLoose(['\n  cursor: pointer;\n  width: 3.25em;\n  &:hover {\n    color: ', ';\n    .elevator-button {\n      background: ', ';\n    }\n  }\n'], ['\n  cursor: pointer;\n  width: 3.25em;\n  &:hover {\n    color: ', ';\n    .elevator-button {\n      background: ', ';\n    }\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactScroll = __webpack_require__(230);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _envelope = __webpack_require__(657);
	
	var _envelope2 = _interopRequireDefault(_envelope);
	
	var _relab = __webpack_require__(658);
	
	var _relab2 = _interopRequireDefault(_relab);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _Link = __webpack_require__(115);
	
	var _Link2 = _interopRequireDefault(_Link);
	
	var _Flex = __webpack_require__(47);
	
	var _Flex2 = _interopRequireDefault(_Flex);
	
	var _BackgroundImage = __webpack_require__(65);
	
	var _BackgroundImage2 = _interopRequireDefault(_BackgroundImage);
	
	var _LinksButtonhref = __webpack_require__(540);
	
	var _LinksButtonhref2 = _interopRequireDefault(_LinksButtonhref);
	
	var _FloorButton = __webpack_require__(382);
	
	var _FloorButton2 = _interopRequireDefault(_FloorButton);
	
	var _floors = __webpack_require__(396);
	
	var _floors2 = _interopRequireDefault(_floors);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var contacts = [{
	  img: _envelope2.default,
	  text: '案件合作',
	  to: '/contact'
	}, {
	  img: _relab2.default,
	  text: '關於我們',
	  to: '/about'
	}];
	
	var StyledLink = (0, _styledComponents2.default)(_Link2.default)(_templateObject, (0, _styledSystem.themeGet)('colors.yellow'));
	
	var StyledScrollLink = (0, _styledComponents2.default)(_reactScroll.Link)(_templateObject2, (0, _styledSystem.themeGet)('colors.blue'), (0, _styledSystem.themeGet)('colors.yellow'));
	
	exports.default = function (_ref) {
	  var visible = _ref.visible,
	      onSetActiveFloor = _ref.onSetActiveFloor,
	      currentFloor = _ref.currentFloor;
	  return _react2.default.createElement(
	    _Box2.default,
	    { position: 'relative' },
	    _react2.default.createElement(
	      _Box2.default,
	      {
	        position: 'fixed',
	        top: '0',
	        opacity: Number(visible),
	        pointerEvents: visible ? 'auto' : 'none',
	        zIndex: 99,
	        transition: 'opacity 500ms',
	        my: 'auto',
	        bg: '#f7f7f7',
	        w: '100%'
	      },
	      _react2.default.createElement(
	        _Flex2.default,
	        { justify: 'center', align: 'center', my: '0.5em' },
	        _floors2.default.map(function (f) {
	          return _react2.default.createElement(
	            StyledScrollLink,
	            {
	              key: f.floor,
	              to: f.floor,
	              spy: true,
	              smooth: true,
	              duration: 1000,
	              offset: -window.innerHeight / 4,
	              onSetActive: onSetActiveFloor
	            },
	            _react2.default.createElement(_FloorButton2.default, { f: '1.3em', mx: '0.25rem', label: f.floor, active: f.floor === currentFloor })
	          );
	        }),
	        _react2.default.createElement(
	          StyledLink,
	          { to: '/portifolio' },
	          _react2.default.createElement(_FloorButton2.default, { mx: '0.25rem', f: '1.3em', label: 'All' })
	        ),
	        contacts.map(function (contact, index) {
	          return _react2.default.createElement(
	            _LinksButtonhref2.default,
	            {
	              key: index,
	              to: contact.to,
	              bg: 'transparent',
	              hoverBg: 'yellow',
	              w: '3.25em',
	              mx: '0.25rem',
	              px: '0.25em',
	              py: '0.125em'
	            },
	            _react2.default.createElement(_BackgroundImage2.default, { src: contact.img, ratio: 13 / 17 })
	          );
	        })
	      ),
	      ['5', 'B2'].map(function (key) {
	        return _react2.default.createElement(StyledScrollLink, {
	          key: key,
	          to: key,
	          spy: true,
	          offset: -window.innerHeight / 4,
	          onSetActive: onSetActiveFloor
	        });
	      })
	    )
	  );
	};
	
	module.exports = exports['default'];

/***/ }),

/***/ 657:
/***/ (function(module, exports) {

	module.exports = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OC4xOSAzNi44NSI+PGRlZnM+PHN0eWxlPi5he2ZpbGw6bm9uZTtzdHJva2U6IzhhY2FmZjtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPmVudmVsb3BlPC90aXRsZT48cmVjdCBjbGFzcz0iYSIgeD0iMTEuNDUiIHk9IjkuMzQiIHdpZHRoPSIyNS4zIiBoZWlnaHQ9IjE4LjE3Ii8+PHBvbHlsaW5lIGNsYXNzPSJhIiBwb2ludHM9IjExLjQ1IDkuMzQgMjQuMDkgMTguNDMgMzYuNzQgOS4zNCIvPjwvc3ZnPg=="

/***/ }),

/***/ 396:
/***/ (function(module, exports) {

	module.exports = [{"floor":"4","key":"redesign","text":"資訊改造"},{"floor":"3","key":"environment","text":"生態探索"},{"floor":"2","key":"diplomacy","text":"國民外交"},{"floor":"1","key":"toys","text":"無標玩具"},{"floor":"B1","text":"商業客戶"}]

/***/ }),

/***/ 658:
/***/ (function(module, exports) {

	module.exports = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OC4xOSAzNi44NSI+PGRlZnM+PHN0eWxlPi5he2ZpbGw6IzhhY2FmZjt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPnJlbGFiPC90aXRsZT48cGF0aCBjbGFzcz0iYSIgZD0iTTM1LjQxLDIwLjI2bC0yLjE1LTQuNzQtMy41OSwzLjc3LDIsLjMzYTguNTUsOC41NSwwLDEsMS04LjQ2LTkuNzUsOC40Niw4LjQ2LDAsMCwxLDQuNDMsMS4yNC45MS45MSwwLDAsMCwuNTIuMTYuOTMuOTMsMCwwLDAsLjQ5LTEuNzFsMCwwYTEwLjQsMTAuNCwwLDEsMCw0Ljg4LDEwLjM5WiIvPjxwYXRoIGNsYXNzPSJhIiBkPSJNMzIuMjIsMTMuMTlBMS4xNSwxLjE1LDAsMSwxLDMxLjA3LDEyYTEuMTQsMS4xNCwwLDAsMSwxLjE1LDEuMTUiLz48L3N2Zz4="

/***/ }),

/***/ 1213:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/floor-1.06dbd673.svg";

/***/ }),

/***/ 689:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      path:nth-of-type(2) {\n        fill: ', ';\n        stroke: white;\n      }\n      path:nth-of-type(1) {\n        fill: ', ';\n        stroke: white;\n      }\n    }\n  }\n  .floor-btn-disable {\n    cursor: not-allowed;\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      circle {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n'], ['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      path:nth-of-type(2) {\n        fill: ', ';\n        stroke: white;\n      }\n      path:nth-of-type(1) {\n        fill: ', ';\n        stroke: white;\n      }\n    }\n  }\n  .floor-btn-disable {\n    cursor: not-allowed;\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      circle {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactInlinesvg = __webpack_require__(114);
	
	var _reactInlinesvg2 = _interopRequireDefault(_reactInlinesvg);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _floor = __webpack_require__(1213);
	
	var _floor2 = _interopRequireDefault(_floor);
	
	var _getAutoLinkFloor = __webpack_require__(431);
	
	var _getAutoLinkFloor2 = _interopRequireDefault(_getAutoLinkFloor);
	
	var _Container = __webpack_require__(75);
	
	var _Container2 = _interopRequireDefault(_Container);
	
	var _Cloud = __webpack_require__(239);
	
	var _Cloud2 = _interopRequireDefault(_Cloud);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var StyledSvg = (0, _styledComponents2.default)(_reactInlinesvg2.default)(_templateObject, (0, _styledSystem.themeGet)('colors.yellow'), (0, _styledSystem.themeGet)('colors.yellow'), (0, _styledSystem.themeGet)('colors.yellow'));
	
	var AutoFloor = (0, _getAutoLinkFloor2.default)(1);
	
	var Floor1 = function (_AutoFloor) {
	  _inherits(Floor1, _AutoFloor);
	
	  function Floor1() {
	    _classCallCheck(this, Floor1);
	
	    return _possibleConstructorReturn(this, _AutoFloor.apply(this, arguments));
	  }
	
	  Floor1.prototype.render = function render() {
	    return _react2.default.createElement(
	      _Container2.default,
	      { innerRef: this.handleContainerRef },
	      _react2.default.createElement(_Cloud2.default, {
	        position: 'absolute',
	        w: '33%',
	        right: '0',
	        bottom: '35%',
	        transform: 'translateX(100%)'
	      }),
	      _react2.default.createElement(StyledSvg, {
	        src: _floor2.default,
	        onLoad: this.handleSvgLoad
	      })
	    );
	  };
	
	  return Floor1;
	}(AutoFloor);
	
	exports.default = Floor1;
	module.exports = exports['default'];

/***/ }),

/***/ 1214:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/floor-2.c5e28990.svg";

/***/ }),

/***/ 690:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      > path:nth-of-type(1) {\n        fill: ', ';\n      }\n    }\n  }\n  .floor-btn-disabled {\n    cursor: not-allowed;\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n'], ['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      > path:nth-of-type(1) {\n        fill: ', ';\n      }\n    }\n  }\n  .floor-btn-disabled {\n    cursor: not-allowed;\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactInlinesvg = __webpack_require__(114);
	
	var _reactInlinesvg2 = _interopRequireDefault(_reactInlinesvg);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _floor = __webpack_require__(1214);
	
	var _floor2 = _interopRequireDefault(_floor);
	
	var _getAutoLinkFloor = __webpack_require__(431);
	
	var _getAutoLinkFloor2 = _interopRequireDefault(_getAutoLinkFloor);
	
	var _Container = __webpack_require__(75);
	
	var _Container2 = _interopRequireDefault(_Container);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var StyledSvg = (0, _styledComponents2.default)(_reactInlinesvg2.default)(_templateObject, (0, _styledSystem.themeGet)('colors.yellow'), (0, _styledSystem.themeGet)('colors.yellow'));
	
	var AutoFloor = (0, _getAutoLinkFloor2.default)(2);
	
	var Floor2 = function (_AutoFloor) {
	  _inherits(Floor2, _AutoFloor);
	
	  function Floor2() {
	    _classCallCheck(this, Floor2);
	
	    return _possibleConstructorReturn(this, _AutoFloor.apply(this, arguments));
	  }
	
	  Floor2.prototype.render = function render() {
	    return _react2.default.createElement(
	      _Container2.default,
	      { innerRef: this.handleContainerRef },
	      _react2.default.createElement(StyledSvg, {
	        src: _floor2.default,
	        onLoad: this.handleSvgLoad
	      })
	    );
	  };
	
	  return Floor2;
	}(AutoFloor);
	
	exports.default = Floor2;
	module.exports = exports['default'];

/***/ }),

/***/ 1215:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/floor-3.e6483621.svg";

/***/ }),

/***/ 691:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n  image {\n    cursor: pointer;\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n'], ['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n  image {\n    cursor: pointer;\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactInlinesvg = __webpack_require__(114);
	
	var _reactInlinesvg2 = _interopRequireDefault(_reactInlinesvg);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _getSliderFloor = __webpack_require__(165);
	
	var _getSliderFloor2 = _interopRequireDefault(_getSliderFloor);
	
	var _floor = __webpack_require__(1215);
	
	var _floor2 = _interopRequireDefault(_floor);
	
	var _ = __webpack_require__(542);
	
	var _2 = _interopRequireDefault(_);
	
	var _Container = __webpack_require__(75);
	
	var _Container2 = _interopRequireDefault(_Container);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var StyledSvg = (0, _styledComponents2.default)(_reactInlinesvg2.default)(_templateObject, (0, _styledSystem.themeGet)('colors.yellow'), (0, _styledSystem.themeGet)('colors.yellow'));
	
	var SliderFloor = (0, _getSliderFloor2.default)(3, _2.default, 588);
	
	var Floor3 = function (_SliderFloor) {
	  _inherits(Floor3, _SliderFloor);
	
	  function Floor3() {
	    _classCallCheck(this, Floor3);
	
	    return _possibleConstructorReturn(this, _SliderFloor.apply(this, arguments));
	  }
	
	  Floor3.prototype.render = function render() {
	    return _react2.default.createElement(
	      _Container2.default,
	      { innerRef: this.handleContainerRef },
	      _react2.default.createElement(StyledSvg, {
	        src: _floor2.default,
	        onLoad: this.handleSvgLoad
	      })
	    );
	  };
	
	  return Floor3;
	}(SliderFloor);
	
	exports.default = Floor3;
	module.exports = exports['default'];

/***/ }),

/***/ 1216:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/floor-4.fcedf637.svg";

/***/ }),

/***/ 692:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n  image {\n    cursor: pointer;\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n'], ['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n  image {\n    cursor: pointer;\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactInlinesvg = __webpack_require__(114);
	
	var _reactInlinesvg2 = _interopRequireDefault(_reactInlinesvg);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _Container = __webpack_require__(75);
	
	var _Container2 = _interopRequireDefault(_Container);
	
	var _floor = __webpack_require__(1216);
	
	var _floor2 = _interopRequireDefault(_floor);
	
	var _getSliderFloor = __webpack_require__(165);
	
	var _getSliderFloor2 = _interopRequireDefault(_getSliderFloor);
	
	var _ = __webpack_require__(543);
	
	var _2 = _interopRequireDefault(_);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var StyledSvg = (0, _styledComponents2.default)(_reactInlinesvg2.default)(_templateObject, (0, _styledSystem.themeGet)('colors.yellow'), (0, _styledSystem.themeGet)('colors.yellow'));
	
	var imageContainerWidth = 755;
	
	var SliderFloor = (0, _getSliderFloor2.default)(4, _2.default, imageContainerWidth);
	
	var Floor4 = function (_SliderFloor) {
	  _inherits(Floor4, _SliderFloor);
	
	  function Floor4() {
	    var _temp, _this, _ret;
	
	    _classCallCheck(this, Floor4);
	
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _SliderFloor.call.apply(_SliderFloor, [this].concat(args))), _this), _this.updateSvgContent = function (index) {
	      _SliderFloor.prototype.updateSvgContent.call(_this, index);
	    }, _this.handleSvgLoad = function () {
	      // super，讀取 SliderFloor 中寫好的 handleSvgLoad
	      _SliderFloor.prototype.handleSvgLoad.call(_this);
	    }, _temp), _possibleConstructorReturn(_this, _ret);
	  }
	
	  // svg載入之後，從html參照中尋找目標
	
	
	  Floor4.prototype.render = function render() {
	    return _react2.default.createElement(
	      _Container2.default,
	      { innerRef: this.handleContainerRef },
	      _react2.default.createElement(StyledSvg, {
	        src: _floor2.default,
	        onLoad: this.handleSvgLoad
	      })
	    );
	  };
	
	  return Floor4;
	}(SliderFloor);
	
	exports.default = Floor4;
	module.exports = exports['default'];

/***/ }),

/***/ 1217:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/floor-b1.7f9a1925.svg";

/***/ }),

/***/ 693:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  background-size: 33% auto;\n  background-image: url(', ');\n  background-repeat: repeat;\n'], ['\n  background-size: 33% auto;\n  background-image: url(', ');\n  background-repeat: repeat;\n']),
	    _templateObject2 = _taggedTemplateLiteralLoose(['\n  .floor-btn {\n    cursor: pointer;\n    g {\n      transition: opacity 0.25s;\n    }\n    &:hover {\n      > g:nth-of-type(2) {\n        opacity: 0;\n      }\n    }\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n'], ['\n  .floor-btn {\n    cursor: pointer;\n    g {\n      transition: opacity 0.25s;\n    }\n    &:hover {\n      > g:nth-of-type(2) {\n        opacity: 0;\n      }\n    }\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactInlinesvg = __webpack_require__(114);
	
	var _reactInlinesvg2 = _interopRequireDefault(_reactInlinesvg);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _floorB = __webpack_require__(1217);
	
	var _floorB2 = _interopRequireDefault(_floorB);
	
	var _underBg = __webpack_require__(1218);
	
	var _underBg2 = _interopRequireDefault(_underBg);
	
	var _getAutoLinkFloor = __webpack_require__(431);
	
	var _getAutoLinkFloor2 = _interopRequireDefault(_getAutoLinkFloor);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _Container = __webpack_require__(75);
	
	var _Container2 = _interopRequireDefault(_Container);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var UnderBg = (0, _styledComponents2.default)(_Box2.default)(_templateObject, _underBg2.default);
	
	var StyledSvg = (0, _styledComponents2.default)(_reactInlinesvg2.default)(_templateObject2, (0, _styledSystem.themeGet)('colors.yellow'));
	
	var AutoFloor = (0, _getAutoLinkFloor2.default)('B1');
	
	var FloorB1 = function (_AutoFloor) {
	  _inherits(FloorB1, _AutoFloor);
	
	  function FloorB1() {
	    _classCallCheck(this, FloorB1);
	
	    return _possibleConstructorReturn(this, _AutoFloor.apply(this, arguments));
	  }
	
	  FloorB1.prototype.render = function render() {
	    return _react2.default.createElement(
	      UnderBg,
	      { bg: 'lightGray' },
	      _react2.default.createElement(
	        _Container2.default,
	        { innerRef: this.handleContainerRef },
	        _react2.default.createElement(StyledSvg, {
	          src: _floorB2.default,
	          onLoad: this.handleSvgLoad
	        })
	      )
	    );
	  };
	
	  return FloorB1;
	}(AutoFloor);
	
	exports.default = FloorB1;
	module.exports = exports['default'];

/***/ }),

/***/ 1218:
/***/ (function(module, exports) {

	module.exports = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgNTAwIj4KICA8dGl0bGU+dW5kZXItYmc8L3RpdGxlPgogIDxnPgogICAgPHBhdGggZD0iTTIyNS40LDc2LjY4YzMuMjIsMCwzLjIyLDEuNyw2LjQ0LDEuN3MzLjIyLTEuNyw2LjQ0LTEuNywzLjIyLDEuNyw2LjQ0LDEuNywzLjIyLTEuNyw2LjQ0LTEuNywzLjIyLDEuNyw2LjQzLDEuNywzLjIyLTEuNyw2LjQ0LTEuNywzLjIyLDEuNyw2LjQ0LDEuNywzLjIzLTEuNyw2LjQ1LTEuNywzLjIyLDEuNyw2LjQ0LDEuNywzLjIyLTEuNyw2LjQ0LTEuNywzLjIyLDEuNyw2LjQ0LDEuNywzLjIyLTEuNyw2LjQ1LTEuNywzLjIyLDEuNyw2LjQ1LDEuNywzLjIyLTEuNyw2LjQ1LTEuNyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGFjYWZmIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMC44NSIvPgogICAgPHBhdGggZD0iTTE0MS42NywzNTEuOWMyLjU0LDAsMi41NCwxLjcsNS4wOCwxLjdzMi41NC0xLjcsNS4wOC0xLjcsMi41MywxLjcsNS4wNywxLjcsMi41NC0xLjcsNS4wOC0xLjcsMi41MywxLjcsNS4wNywxLjcsMi41NC0xLjcsNS4wOC0xLjcsMi41NCwxLjcsNS4wOCwxLjcsMi41NC0xLjcsNS4wOC0xLjcsMi41NCwxLjcsNS4wOCwxLjcsMi41NC0xLjcsNS4wOC0xLjcsMi41NCwxLjcsNS4wOCwxLjcsMi41NC0xLjcsNS4wOC0xLjcsMi41NCwxLjcsNS4wOSwxLjcsMi41NC0xLjcsNS4wOC0xLjciIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhhY2FmZiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjAuODUiLz4KICAgIDxwYXRoIGQ9Ik0yMzQuOTMsNDM2Ljc1YzIuNTQsMCwyLjU0LDEuNjksNS4wOCwxLjY5czIuNTQtMS42OSw1LjA4LTEuNjksMi41NCwxLjY5LDUuMDcsMS42OSwyLjU0LTEuNjksNS4wOC0xLjY5LDIuNTQsMS42OSw1LjA4LDEuNjksMi41NC0xLjY5LDUuMDctMS42OSwyLjU0LDEuNjksNS4wOCwxLjY5LDIuNTQtMS42OSw1LjA4LTEuNjksMi41NCwxLjY5LDUuMDgsMS42OSwyLjU0LTEuNjksNS4wOC0xLjY5LDIuNTQsMS42OSw1LjA4LDEuNjksMi41NC0xLjY5LDUuMDktMS42OSwyLjU0LDEuNjksNS4wOCwxLjY5LDIuNTQtMS42OSw1LjA5LTEuNjkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhhY2FmZiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjAuODUiLz4KICA8L2c+Cjwvc3ZnPgo="

/***/ }),

/***/ 694:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactScroll = __webpack_require__(230);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _Cloud = __webpack_require__(239);
	
	var _Cloud2 = _interopRequireDefault(_Cloud);
	
	var _Floor = __webpack_require__(692);
	
	var _Floor2 = _interopRequireDefault(_Floor);
	
	var _Floor3 = __webpack_require__(691);
	
	var _Floor4 = _interopRequireDefault(_Floor3);
	
	var _Floor5 = __webpack_require__(690);
	
	var _Floor6 = _interopRequireDefault(_Floor5);
	
	var _Floor7 = __webpack_require__(689);
	
	var _Floor8 = _interopRequireDefault(_Floor7);
	
	var _FloorB = __webpack_require__(693);
	
	var _FloorB2 = _interopRequireDefault(_FloorB);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var DesktopFloors = function DesktopFloors(_ref) {
	  var currentFloor = _ref.currentFloor;
	  return _react2.default.createElement(
	    _Box2.default,
	    { position: 'relative' },
	    _react2.default.createElement(
	      _Box2.default,
	      { position: 'relative' },
	      _react2.default.createElement(_Cloud2.default, {
	        w: '15%',
	        top: '-10%',
	        right: '-2%'
	      }),
	      _react2.default.createElement(
	        _reactScroll.Element,
	        { name: '4' },
	        _react2.default.createElement(_Floor2.default, null)
	      )
	    ),
	    _react2.default.createElement(
	      _reactScroll.Element,
	      { name: '3' },
	      _react2.default.createElement(_Floor4.default, { active: currentFloor === '3' })
	    ),
	    _react2.default.createElement(
	      _reactScroll.Element,
	      { name: '2' },
	      _react2.default.createElement(_Floor6.default, null)
	    ),
	    _react2.default.createElement(
	      _reactScroll.Element,
	      { name: '1' },
	      _react2.default.createElement(_Floor8.default, null)
	    ),
	    _react2.default.createElement(
	      _reactScroll.Element,
	      { name: 'B1' },
	      _react2.default.createElement(_FloorB2.default, null)
	    )
	  );
	};
	
	exports.default = DesktopFloors;
	module.exports = exports['default'];

/***/ }),

/***/ 1219:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/floor-1.ae002d1d.svg";

/***/ }),

/***/ 695:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  image {\n    cursor: pointer;\n  }\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      circle {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n'], ['\n  image {\n    cursor: pointer;\n  }\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      circle {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactInlinesvg = __webpack_require__(114);
	
	var _reactInlinesvg2 = _interopRequireDefault(_reactInlinesvg);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _floor = __webpack_require__(1219);
	
	var _floor2 = _interopRequireDefault(_floor);
	
	var _getSliderFloor = __webpack_require__(165);
	
	var _getSliderFloor2 = _interopRequireDefault(_getSliderFloor);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _ = __webpack_require__(701);
	
	var _2 = _interopRequireDefault(_);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var StyledSvg = (0, _styledComponents2.default)(_reactInlinesvg2.default)(_templateObject, (0, _styledSystem.themeGet)('colors.yellow'), (0, _styledSystem.themeGet)('colors.yellow'));
	
	var AutoFloor = (0, _getSliderFloor2.default)(1, _2.default, 276);
	
	var Floor1 = function (_AutoFloor) {
	  _inherits(Floor1, _AutoFloor);
	
	  function Floor1() {
	    _classCallCheck(this, Floor1);
	
	    return _possibleConstructorReturn(this, _AutoFloor.apply(this, arguments));
	  }
	
	  Floor1.prototype.render = function render() {
	    return _react2.default.createElement(
	      _Box2.default,
	      { innerRef: this.handleContainerRef },
	      _react2.default.createElement(StyledSvg, {
	        src: _floor2.default,
	        onLoad: this.handleSvgLoad
	      })
	    );
	  };
	
	  return Floor1;
	}(AutoFloor);
	
	exports.default = Floor1;
	module.exports = exports['default'];

/***/ }),

/***/ 1220:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/floor-2.e675b8b3.svg";

/***/ }),

/***/ 696:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n  image {\n    cursor: pointer;\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n'], ['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n  image {\n    cursor: pointer;\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactInlinesvg = __webpack_require__(114);
	
	var _reactInlinesvg2 = _interopRequireDefault(_reactInlinesvg);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _floor = __webpack_require__(1220);
	
	var _floor2 = _interopRequireDefault(_floor);
	
	var _getSliderFloor = __webpack_require__(165);
	
	var _getSliderFloor2 = _interopRequireDefault(_getSliderFloor);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _ = __webpack_require__(702);
	
	var _2 = _interopRequireDefault(_);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var StyledSvg = (0, _styledComponents2.default)(_reactInlinesvg2.default)(_templateObject, (0, _styledSystem.themeGet)('colors.yellow'), (0, _styledSystem.themeGet)('colors.yellow'));
	
	var AutoFloor = (0, _getSliderFloor2.default)(2, _2.default, 115);
	
	var Floor2 = function (_AutoFloor) {
	  _inherits(Floor2, _AutoFloor);
	
	  function Floor2() {
	    _classCallCheck(this, Floor2);
	
	    return _possibleConstructorReturn(this, _AutoFloor.apply(this, arguments));
	  }
	
	  Floor2.prototype.render = function render() {
	    return _react2.default.createElement(
	      _Box2.default,
	      { innerRef: this.handleContainerRef },
	      _react2.default.createElement(StyledSvg, {
	        src: _floor2.default,
	        onLoad: this.handleSvgLoad
	      })
	    );
	  };
	
	  return Floor2;
	}(AutoFloor);
	
	exports.default = Floor2;
	module.exports = exports['default'];

/***/ }),

/***/ 1221:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/floor-3.d1de1177.svg";

/***/ }),

/***/ 697:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n'], ['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactInlinesvg = __webpack_require__(114);
	
	var _reactInlinesvg2 = _interopRequireDefault(_reactInlinesvg);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _tween = __webpack_require__(661);
	
	var _tween2 = _interopRequireDefault(_tween);
	
	var _getSliderFloor = __webpack_require__(165);
	
	var _getSliderFloor2 = _interopRequireDefault(_getSliderFloor);
	
	var _floor = __webpack_require__(1221);
	
	var _floor2 = _interopRequireDefault(_floor);
	
	var _ = __webpack_require__(542);
	
	var _2 = _interopRequireDefault(_);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	// import { themeGet } from 'styled-system';
	
	
	var StyledSvg = (0, _styledComponents2.default)(_reactInlinesvg2.default)(_templateObject, (0, _styledSystem.themeGet)('colors.yellow'), (0, _styledSystem.themeGet)('colors.yellow'));
	
	var SliderFloor = (0, _getSliderFloor2.default)(3, _2.default, 396);
	
	var Floor3 = function (_SliderFloor) {
	  _inherits(Floor3, _SliderFloor);
	
	  function Floor3() {
	    _classCallCheck(this, Floor3);
	
	    return _possibleConstructorReturn(this, _SliderFloor.apply(this, arguments));
	  }
	
	  Floor3.prototype.render = function render() {
	    return _react2.default.createElement(
	      _Box2.default,
	      { innerRef: this.handleContainerRef },
	      _react2.default.createElement(StyledSvg, {
	        src: _floor2.default,
	        onLoad: this.handleSvgLoad
	      })
	    );
	  };
	
	  return Floor3;
	}(SliderFloor);
	
	exports.default = Floor3;
	module.exports = exports['default'];

/***/ }),

/***/ 1222:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/floor-4.6b57306e.svg";

/***/ }),

/***/ 698:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n'], ['\n  .floor-btn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactInlinesvg = __webpack_require__(114);
	
	var _reactInlinesvg2 = _interopRequireDefault(_reactInlinesvg);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _floor = __webpack_require__(1222);
	
	var _floor2 = _interopRequireDefault(_floor);
	
	var _getSliderFloor = __webpack_require__(165);
	
	var _getSliderFloor2 = _interopRequireDefault(_getSliderFloor);
	
	var _ = __webpack_require__(543);
	
	var _2 = _interopRequireDefault(_);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var StyledSvg = (0, _styledComponents2.default)(_reactInlinesvg2.default)(_templateObject, (0, _styledSystem.themeGet)('colors.yellow'), (0, _styledSystem.themeGet)('colors.yellow'));
	
	var SliderFloor = (0, _getSliderFloor2.default)(4, _2.default, 556);
	
	var Floor4 = function (_SliderFloor) {
	  _inherits(Floor4, _SliderFloor);
	
	  function Floor4() {
	    _classCallCheck(this, Floor4);
	
	    return _possibleConstructorReturn(this, _SliderFloor.apply(this, arguments));
	  }
	
	  Floor4.prototype.render = function render() {
	    return _react2.default.createElement(
	      _Box2.default,
	      { innerRef: this.handleContainerRef },
	      _react2.default.createElement(StyledSvg, {
	        src: _floor2.default,
	        onLoad: this.handleSvgLoad
	      })
	    );
	  };
	
	  return Floor4;
	}(SliderFloor);
	
	exports.default = Floor4;
	module.exports = exports['default'];

/***/ }),

/***/ 1223:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/floor-b1.5ffc3758.svg";

/***/ }),

/***/ 699:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  .floor-btn {\n    cursor: pointer;\n    g {\n      transition: opacity 0.25s;\n    }\n    &:hover {\n      > g:nth-of-type(2) {\n        opacity: 0;\n      }\n    }\n  }\n  .floor-nextbtn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n'], ['\n  .floor-btn {\n    cursor: pointer;\n    g {\n      transition: opacity 0.25s;\n    }\n    &:hover {\n      > g:nth-of-type(2) {\n        opacity: 0;\n      }\n    }\n  }\n  .floor-nextbtn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      polygon {\n        fill: white;\n        stroke: white;\n      }\n    }\n  }\n  .floor-morebtn {\n    cursor: pointer;\n    &:hover {\n      rect:nth-of-type(2) {\n        fill: ', ';\n      }\n      text {\n        fill: black;\n      }\n    }\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactInlinesvg = __webpack_require__(114);
	
	var _reactInlinesvg2 = _interopRequireDefault(_reactInlinesvg);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _floorB = __webpack_require__(1223);
	
	var _floorB2 = _interopRequireDefault(_floorB);
	
	var _getSliderFloor = __webpack_require__(165);
	
	var _getSliderFloor2 = _interopRequireDefault(_getSliderFloor);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _b = __webpack_require__(703);
	
	var _b2 = _interopRequireDefault(_b);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var StyledSvg = (0, _styledComponents2.default)(_reactInlinesvg2.default)(_templateObject, (0, _styledSystem.themeGet)('colors.yellow'), (0, _styledSystem.themeGet)('colors.yellow'));
	
	var AutoFloor = (0, _getSliderFloor2.default)('B1', _b2.default, 286);
	
	var FloorB1 = function (_AutoFloor) {
	  _inherits(FloorB1, _AutoFloor);
	
	  function FloorB1() {
	    var _temp, _this, _ret;
	
	    _classCallCheck(this, FloorB1);
	
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _AutoFloor.call.apply(_AutoFloor, [this].concat(args))), _this), _this.handleSvgLoad = function () {
	      _AutoFloor.prototype.handleSvgLoad.call(_this);
	      _this.title2 = _this.container.querySelector('.floor-title-2');
	      _this.client = _this.container.querySelector('.floor-client');
	      _this.group = _this.container.querySelector('.floor-content');
	      _this.container.querySelector('.floor-link').addEventListener('click', function () {
	        return window.open(_b2.default[_this.state.current].link, '_blank');
	      });
	    }, _this.updateSvgContent = function (index) {
	      _AutoFloor.prototype.updateSvgContent.call(_this, index);
	      var _projects$index = _b2.default[index],
	          title = _projects$index.title,
	          client = _projects$index.client;
	
	      _this.client.innerHTML = client;
	
	      var _title$split = title.split('|'),
	          title1 = _title$split[0],
	          title2 = _title$split[1];
	
	      if (title2) {
	        _this.title.innerHTML = title1;
	        _this.title2.innerHTML = title2;
	        _this.group.setAttribute('transform', 'translate(0, 30)');
	      } else {
	        _this.title2.innerHTML = '';
	        _this.group.setAttribute('transform', '');
	      }
	    }, _temp), _possibleConstructorReturn(_this, _ret);
	  }
	
	  FloorB1.prototype.render = function render() {
	    return _react2.default.createElement(
	      _Box2.default,
	      { innerRef: this.handleContainerRef },
	      _react2.default.createElement(StyledSvg, {
	        src: _floorB2.default,
	        onLoad: this.handleSvgLoad
	      })
	    );
	  };
	
	  return FloorB1;
	}(AutoFloor);
	
	exports.default = FloorB1;
	module.exports = exports['default'];

/***/ }),

/***/ 700:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactScroll = __webpack_require__(230);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _Floor = __webpack_require__(698);
	
	var _Floor2 = _interopRequireDefault(_Floor);
	
	var _Floor3 = __webpack_require__(697);
	
	var _Floor4 = _interopRequireDefault(_Floor3);
	
	var _Floor5 = __webpack_require__(696);
	
	var _Floor6 = _interopRequireDefault(_Floor5);
	
	var _Floor7 = __webpack_require__(695);
	
	var _Floor8 = _interopRequireDefault(_Floor7);
	
	var _FloorB = __webpack_require__(699);
	
	var _FloorB2 = _interopRequireDefault(_FloorB);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var MobileFloors = function MobileFloors(_ref) {
	  var currentFloor = _ref.currentFloor;
	  return _react2.default.createElement(
	    _Box2.default,
	    { position: 'relative' },
	    _react2.default.createElement(
	      _reactScroll.Element,
	      { name: '4' },
	      _react2.default.createElement(_Floor2.default, null)
	    ),
	    _react2.default.createElement(
	      _reactScroll.Element,
	      { name: '3' },
	      _react2.default.createElement(_Floor4.default, { active: currentFloor === '3' })
	    ),
	    _react2.default.createElement(
	      _reactScroll.Element,
	      { name: '2' },
	      _react2.default.createElement(_Floor6.default, null)
	    ),
	    _react2.default.createElement(
	      _reactScroll.Element,
	      { name: '1' },
	      _react2.default.createElement(_Floor8.default, null)
	    ),
	    _react2.default.createElement(
	      _reactScroll.Element,
	      { name: 'B1' },
	      _react2.default.createElement(_FloorB2.default, null)
	    )
	  );
	};
	
	exports.default = MobileFloors;
	module.exports = exports['default'];

/***/ }),

/***/ 431:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _getFloor = __webpack_require__(541);
	
	var _getFloor2 = _interopRequireDefault(_getFloor);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	exports.default = function (floor) {
	  var Floor = (0, _getFloor2.default)(floor);
	
	  var AutoLinkFloor = function (_Floor) {
	    _inherits(AutoLinkFloor, _Floor);
	
	    function AutoLinkFloor() {
	      _classCallCheck(this, AutoLinkFloor);
	
	      return _possibleConstructorReturn(this, _Floor.apply(this, arguments));
	    }
	
	    AutoLinkFloor.prototype.handleSvgLoad = function handleSvgLoad() {
	      // super，讀取 Floor 中寫好的 handleSvgLoad
	      _Floor.prototype.handleSvgLoad.call(this);
	      var floorButtons = this.container.querySelectorAll('.floor-btn');
	      if (floorButtons) {
	        floorButtons.forEach(function (btn) {
	          btn.addEventListener('click', function () {
	            window.open('' + btn.dataset.link, '_blank');
	          });
	        });
	      }
	    };
	
	    return AutoLinkFloor;
	  }(Floor);
	
	  return AutoLinkFloor;
	};
	
	module.exports = exports['default'];

/***/ }),

/***/ 541:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _react = __webpack_require__(1);
	
	var _gatsbyLink = __webpack_require__(463);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	exports.default = function (floor) {
	  var Floor = function (_PureComponent) {
	    _inherits(Floor, _PureComponent);
	
	    function Floor(props) {
	      _classCallCheck(this, Floor);
	
	      var _this = _possibleConstructorReturn(this, _PureComponent.call(this, props));
	
	      _this.handleContainerRef = function (ref) {
	        _this.container = ref;
	      };
	
	      _this.handleSvgLoad = _this.handleSvgLoad.bind(_this);
	      return _this;
	    }
	
	    Floor.prototype.handleSvgLoad = function handleSvgLoad() {
	      var moreBtn = this.container.querySelector('.floor-morebtn');
	      if (moreBtn) {
	        moreBtn.addEventListener('click', function () {
	          (0, _gatsbyLink.push)('/portifolio/' + floor);
	        });
	      }
	    };
	
	    return Floor;
	  }(_react.PureComponent);
	
	  return Floor;
	};
	
	module.exports = exports['default'];

/***/ }),

/***/ 165:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _round = __webpack_require__(1017);
	
	var _round2 = _interopRequireDefault(_round);
	
	var _fetchBase = __webpack_require__(727);
	
	var _fetchBase2 = _interopRequireDefault(_fetchBase);
	
	var _getFloor = __webpack_require__(541);
	
	var _getFloor2 = _interopRequireDefault(_getFloor);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	exports.default = function (floor, projects, imageContainerWidth) {
	  var Floor = (0, _getFloor2.default)(floor);
	  var projectCount = projects.length;
	
	  var AutoSliderFloor = function (_Floor) {
	    _inherits(AutoSliderFloor, _Floor);
	
	    function AutoSliderFloor(props) {
	      _classCallCheck(this, AutoSliderFloor);
	
	      var _this = _possibleConstructorReturn(this, _Floor.call(this, props));
	
	      _this.state = {
	        current: 0
	      };
	
	      _this.getNewScale = function (width) {
	        var _$exec = /scale\(([^)]+)/g.exec(_this.imageTransform),
	            oldScale = _$exec[1];
	
	        return _this.imageTransform.replace(oldScale, (0, _round2.default)(imageContainerWidth / width, 2));
	      };
	
	      _this.imageUris = [];
	
	      _this.handleBtnClick = function (index) {
	        return function () {
	          var current = _this.state.current;
	
	          if (index === 0) {
	            // 向後
	            if (current === 0) {
	              _this.setState({ current: projectCount - 1 });
	            } else {
	              _this.setState({ current: current - 1 });
	            }
	          } else {
	            // 向前
	            if (current === projectCount - 1) {
	              _this.setState({ current: 0 });
	            } else {
	              _this.setState({ current: current + 1 });
	            }
	          }
	        };
	      };
	
	      _this.handleImageFetch = function (index) {
	        return function (datauri) {
	          _this.imageUris[index] = datauri;
	        };
	      };
	
	      _this.handleImageOnClick = function () {
	        return window.open(projects[_this.state.current].link, '_blank');
	      };
	
	      _this.updateSvgContent = _this.updateSvgContent.bind(_this);
	      return _this;
	    }
	
	    AutoSliderFloor.prototype.componentDidMount = function componentDidMount() {
	      var _this2 = this;
	
	      // 預先讀取全部的照片
	      projects.forEach(function (_ref, index) {
	        var src = _ref.src;
	
	        var fetcher = new _fetchBase2.default(src);
	        fetcher.fetchAsData().then(_this2.handleImageFetch(index));
	      });
	    };
	
	    // 取好預設的 this.imageUris 為空陣列
	
	
	    // 每次setState之後，即會觸發
	    AutoSliderFloor.prototype.componentWillUpdate = function componentWillUpdate(nextProps, nextState) {
	      if (this.updateSvgContent) this.updateSvgContent(nextState.current);
	    };
	
	    AutoSliderFloor.prototype.updateSvgContent = function updateSvgContent(index) {
	      if (this.title) {
	        // 更新title的文字
	        this.title.innerHTML = projects[index].title;
	      }
	
	      if (this.image) {
	        // 更新image
	        this.image.setAttribute('xlink:href', this.imageUris[index].dataurl);
	        this.image.setAttribute('width', this.imageUris[index].width);
	        this.image.setAttribute('height', this.imageUris[index].height);
	        this.image.setAttribute('transform', this.getNewScale(this.imageUris[index].width));
	      }
	    };
	
	    // 把讀到的datauri存到 this.imageUris 裡
	
	
	    AutoSliderFloor.prototype.handleSvgLoad = function handleSvgLoad() {
	      var _this3 = this;
	
	      // super，讀取 Floor 中寫好的 handleSvgLoad
	      _Floor.prototype.handleSvgLoad.call(this);
	      var floorBtns = this.container.querySelectorAll('.floor-btn');
	      if (floorBtns) {
	        floorBtns.forEach(function (btn, index) {
	          btn.addEventListener('click', _this3.handleBtnClick(index));
	        });
	      }
	      // 在html中，尋找唯一的image tag
	      this.image = this.container.querySelector('image');
	      if (this.image) {
	        this.imageTransform = this.image.getAttribute('transform');
	        this.imageOnClick = this.image.addEventListener('click', this.handleImageOnClick);
	      }
	      this.title = this.container.querySelector('.floor-title');
	    };
	
	    return AutoSliderFloor;
	  }(Floor);
	
	  return AutoSliderFloor;
	};
	
	module.exports = exports['default'];

/***/ }),

/***/ 1224:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/1-book.ba2dab25.png";

/***/ }),

/***/ 1225:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/1-cat.a333af0a.png";

/***/ }),

/***/ 1226:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/1-elf.afd57e87.png";

/***/ }),

/***/ 1227:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/1-fruit.734757c9.png";

/***/ }),

/***/ 701:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _book = __webpack_require__(1224);
	
	var _book2 = _interopRequireDefault(_book);
	
	var _cat = __webpack_require__(1225);
	
	var _cat2 = _interopRequireDefault(_cat);
	
	var _elf = __webpack_require__(1226);
	
	var _elf2 = _interopRequireDefault(_elf);
	
	var _fruit = __webpack_require__(1227);
	
	var _fruit2 = _interopRequireDefault(_fruit);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = [{
	  src: _book2.default,
	  link: 'https://designlab.re/product/%E4%BA%BA%E4%BA%BA%E9%83%BD%E8%83%BD%E4%B8%8A%E6%89%8B%E7%9A%84%E8%B3%87%E8%A8%8A%E5%9C%96%E8%A1%A8%E8%A8%AD%E8%A8%88%E8%A1%93/'
	}, {
	  src: _cat2.default,
	  link: 'https://designlab.re/product/%E6%91%BA%E7%B4%99%E8%B2%93/'
	}, {
	  src: _elf2.default,
	  link: 'https://designlab.re/product/workout/'
	}, {
	  src: _fruit2.default,
	  link: 'https://designlab.re/product/fruit-infographics-calendar-2017/'
	}];
	module.exports = exports['default'];

/***/ }),

/***/ 1228:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/2-bear.b6ed017a.png";

/***/ }),

/***/ 1229:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/2-bubble.d6b1812f.png";

/***/ }),

/***/ 1230:
/***/ (function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASYAAAEmCAYAAADPxD3aAAAACXBIWXMAABYlAAAWJQFJUiTwAAAWLklEQVR4nO3dPYxc13nG8SNHsI0AISnAiAwZISmDBAzEMFeRt5EL0e7kRlTnVFw2SReti0XKkPUUWlVBKi07d1qmkDuZLORm5IQEFMAIBZvLQIYcCJCGARI7UMDgmXkvuTv3nHPvzNyPd+b+f8CAxOyS83FnnnvOe8/HM48fPw4A4MlXOBoAvCGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAO89ySPwajcNle3LFn2dCCFs1nvAXIYS79vcHxW1ve/on4N4zjx8/5ig5YCF02YJHt3MtPat7FlrT2952uF36DaBnBFNPRuNwPoRwxW6v9vx07oQQDnXz2qoajcOO3qu97en7hQ1HMHVoNJ52xXbsdsnp0zwKIRzo5iGk7D3bDyFctbtu7G2H66VfxEYhmDpg3bSdY1+udXHHAuqgp/dNoXQ7EuI/pAu62QimFlkgXW+yq/bnfxrC1/6kdPcJ//nfIfzx/0p3r0KtqOtdBtRoPK2zKXxOl34YwkR1OIr5m4tgaoF9qfaXDaS/+LNZAJ3+2uzPU1+d/X0Z//Ffs3/08FEIj/53Flq6LamTgKoIpYKK+Jf3tqdXILFhCKYGWddDLaQ3F/lfFUS6nT01+7MLCiyFlf4swmsBCoXdNrpTNUOpQL1pQxFMDRmNp1eLDmp+oaYB9N1vhHDxuequWdvU7bv/+ez28WLtj7etBdVIq2XBULqluh0tps1EMK0octUoSQGkMHr5+eW7Zm1TSH30WQgffjrr+tVwZJfx767y1Ggp4TiCaQX2ZTqIXDU6QYGkMPr+N/tvHS1CAfXBJ7UD6tqytScL9wc1QmliXcherhKiOwTTkuyK22HVl+mVF9YvkOYtEFA397anwyIWMhpPW1vZcLdQurxqywzrgWBago1Cfif3L1VDeu1Fv122ZSicfvm7yn+4UDiNxtPWT1U3mFAaGIJpQVWhpJbRD74167ptIg01+PlvK4cc1LqUbxcM3i394CRCaYBY9mQBVaGkMUc/+c7mhlKw13j1Lytf4yW7IJBkcwXr1IoIpQEimGqqCqULZ2ahpC/uEPzo7KyrmnHVumkpdYZWXCOUhomuXA1Vl7I1BKDiS7qx1KX72a+zU2B+urd9svVUp0bHkIBhI5gq2KXsu6n1kYYcSoUa4fRS0fKpOTTgzt72k8XxMEB05aodEkp5RW0t43iXbrcilCa2EgMGjBZTxmg8/RK9FfsNQqlM4510xS7hhgVU+jdm3tjbnp4MMGAEU4JdNbobO7sXV6ZQ9v7DEH71+9LdwVpC74UQ/rr0k6fowmGKrlzafiyUNE7pyoXkvxm8zAj3r1SEUqALhwLBFGFX4V4v/2TzRnM3SUXwzMjwfyndc9LbLPyGAsEUtxu7Vwu2aZkSlOmKnK7MJWgFgpfiP5qa2DpWwBTBFBc9c2sSa6J+MmhFKGWGC/yzcr1071P7rKuE4wimCBvYd6/8k1lxV1efMFOEUmbunBaT+17p3pNyI8QxQART2o51MUp0SZxwqhVK92qsfX6T2hLmEUwJNlI5WmsKFk5aBmSoaoTSke0sXLVBJa0llBBMGbZS4o3Ub+gKlAIqU1vZSAqjg4+yoTSx5Xa/qAimI/aHQwzBVMHqTTdTv6UuXUXLYaMUrzezmuWT9ZNsXlyuG8cIb0QRTDXYiozJcFIo3fy3ze7aqVX47v3KFuL8om5Vo7jpxiGKYKrJwula7rfVtfune0vt0+aaWkl6XRVbOx1FFnXbKv3WUxPWWkIKwbQAqzm9kbpaF2ysk7o6uq17QOn563VUtJKCXX3bigRNrsVEbQlJz6Z+gDjNfLcdUrLbNhVfam1KoDXAu9phtwl67uqW1gxWTSVJXb3MtZgIJiSxusAKRuPpGJ1a24FrOou2cdJyKZmJrr0pduPVyPaahfyJ7YQbLWDb6gy5JU5+yBU5pBBMK7LW036u9TRP64Nrzp1aUX1PCC62BdefFd214yq357b35RelH5i97fBM6U7A0JVbkZ31t2xRueuxpVLmKQiKQrLWdlJA6aa/tx1U6p6pRfTwUWUxO+bIdsKNtpLm5LpxR6V7gGMIpoZowX3bFWS3xvKxTygkdCsmB6ubp4DSTX8/a1Nf1RWsG1qTP86K8H/4cvZ/6++6b4Vi/MQm2i6yAsCZ0j1PMQUFWQRTg6xrc91qTwsFVEHdKQVIESKZ9Y2mFF4tjjyfWDd1mdn/BBOWRjC1oAgoC6kdmxCcGwG9tJZC6Z6F0SoDIHNdOYIJWQRTy+zLfWBXqa5YSNUulHfoyKaIHETGIwGdIpg6Ykt7TLtFFlLFzPvLi3b3GnTHxhMdEkbwhGDqgYXUQTFXzIJqy24KqvOpvexWcM+6UAqg24whgmcEkwMWVA/mZ9tbYJ23QnKqZrNlYTNP96nW9YCF2LBuCCbHjgVWYIkQDAmTeAG4QzABcIeuHHpnG4xuWT2tWCplftzXjQVHnmONEUzow9dt4GkxZKKv4RJwimBCH/6edx051JgAuMN6THjCdjUpBnkeHzuVmud3dGw4w+1iAKftkPKPtgzx86V/1Zw79j8VY7Zu2+Oz3fiaI5gGzILo+NSYJkebf9ljqeComGpjo9wJqjVDMA2QFZ4VRq8P5NXfsvmAbBe1JgimgbDpLbu2usFQr4JNbH7iPtN0fCOYNpwFksb/XB36ezFHG5heJ6B8Ipg2lNWP9lcJpGJ5Xy3pq6V95/375yF89j+luxtRLDFc/DmvWC5YC+WtuD37TVvHnDqUIwTTBlpkY4SCgkfrixebIsTC4DhtgqkdeptSbMig51AE0iKKtdO1JLE2WlBwLWBiraf9oX92vCCYNohN7chuxHlcsdedtpOqu9GBWijv3m9ml2E9rvbZUxg1vdeeWlPaBebDTxcKqXu2LVVsGRl0iGDaENZKeqvOq1EY6Lbo7sAKJe0uXLfrpOD70dlZ8Kh1pZCQrjf+VIjq8Wu28Gg9OUAwrTmrJR3UufSvMHjlheX2rls0lF5+frY1uqddh9WK0q4zNQOqclNPtIdgWmN1u27qMqnlsuxmmouEkoLotRdnOw17pYB6/2GtDT/p2vWEYFpTFkq3cwVudaV+/O3Fu2zz6ha6VbS+cqH/bc/rUhfvvd9U1qDUtbtMOHWLYFpDNnJ7PxdKTXWl1LIodgnOUatMIeip61aHWoMffFL5GifWcmJ5444QTGvGQumd1LNusiulVpJaS1VUu9JjrrP7n89ea8UGoteY1tINgmmNVIVSk10p1ZNUV6r4om5EKBVUezr8uLKWRjh1gGBaE1ZT+tfUs22yK1W32L1JoVSoMU6LmlMHWChuDRwrdEcpIN642Fx9RzWXqlBS62zTQilYV/gn35m9pwmq6922Y4KWEEzO2Tilw1Shu+lWi1oKFYXgaSjpy7vJ9J5WhNOhHRu0gGDy73ZqAbc2ulK6fJ5TFNfX7erbMirC6RybkLaHYHJsNJ4OCYgOnmwjlNSFqxjTMx2oWTXBd5NUhNOrdozQMILJqdF4usLkm7Fnp2BQQDRJV6SqunDFpNuhqQjjN0fjJ3vhoSEEk0PH5r+VaDS36jtNd6U0kDI3NECPp6t+Q1QUxDPvOfWmhhFMPh2kit1NXn0rqOBdNW9sKHWllCKcEk6nTiRYDsHkjHXhoisFVHQplqbaUo7m2nmelNuVii7063bs0ACCyZFjy+GWqL7zcgs7tGnaSWYw4dQmjldalo5BZlL0Pl26ZhBMvuzGhga0Wd+pai0tu37TJst0a8/ZMcSKCCYnbDeTf4g9G3UfEl+Elai1lBseoMfUapM4SUGtlRsSdu1YYgUEkx/XY89E3Ya2LtFXDQ9Qt2XIBe+cTJfudOpYoj6CyQE7w0a3WcoUW1eiulJuPhytpWqZY3OVVtNqCCYfomdYtZTaGmVdbAyQQmupmo5NpjUbPaaoh2DqWa61pMJzG4qtjVJoLdWXOUa0mlZAMPUvembVmbitq2HUlpqjY5RpNXGFbkkEU49szEt0UF7mTLwyLSObk/miISJzrHYY17QcgqlfV2JTT9psLSmUckME2nzsTZVpNZ1OnXiQRzD1K9rUb2OEdyFXWwq0lpaWOWbRY4w8gqkntjRraa0ljY1pc72jXDdOKxckxuaggo5Z4rhdogi+OIKpPzuxR26zxaJQyi1twkTd1dBqag7B1J9S7UFXwtoMh6rJunTjVpM5dqVjjTyCqQfWjStN1tUHu83L9FXduERXBDXp2CXC/Ry7qiyGYOpH9Ax6ocULyxpUmbsalznbYwGZY8jyuwsgmPoRDaY+u3EEUzPOnkr+N9FjjjiCqWM24K50NS5zpm1EbsJuCFyNa4q6c4lj+WrpHiQRTN2LNukzZ9pG5IKJUGpW6liym0p9BFP3okXQxFm2MbmuHMHUrMz7STDVRDB1r/ThVPO/zWkgudZSCFyNa5rez8TV1dKxRxzB1L1SrSFzhm1EblBlIJhakXhPo61llBFMHUpNTUh8iBvz8FH+f2LSbvMSJ5vTqc8ATiKYuhX9UKaKpV1IfIGwoszJJvoZwEkEU7eiNQaNum5TbmAl2pEJpuhnACcRTN2Kni3b7kpp1HcK3bh2ZN5XFo6rgWDqVimY+u5Ktd1aG7JEq4kCeA0EU7c4Ww5IYsgAn4EaCKZulaaiUHzeXIkWU+kzgDKCCWhJosWEGgimjrBbBlAfwdSdaNGzzzFMaFeiK8dk3hoIJqAlX3+Wd3ZZBNPAMfgSHhFMA5cbfAn0hWAagFStA/CKYBoALltj3RBMA1e1VhPQB4Jp4KpWt8Ty/vAlb96yCKbu3I09UtUibk1grFQ/UqG/tx1ul+7ECQRTR/a2wxdenxtX5uANwTQAVUubMJapHdTvlkcwdeve/KPltlVqSmbRsqlUlwOrSbyvd0r3oIRg6lZv3bncWCaKtO2gxbQ8gqlbD+YfrYsWU6gYy9TVcxiaRIspehEEJxFM3SoFU+io+JxbkC7xBcIKMsfU7UUQTwimbkXPll0Un3NdOXU5Ml8kLCET9gwVqIFg6lY0mLoYy5QLpkB3rnGZYIq2mnESwdShve34hzLzIW6MrsxRZ+pO4v2cpD4DOIlg6l7pcnHiQ9y4XJ3p/uelu7CCxMkm2mJGGcHUvVKNoasaz8XnSnedeA60mpqhUEoMFSgde8QRTN2LnjU/7uBaTa7FFGg1NSYT8ARTTQRT96Ifzi4K4Koz5YrgH31WugtLSB1LJu/WRzB1zCbz9jI1JVS0mtT9oNW0ukTrt1RbRBrB1I/D+UftKhS++43SXSfQalpN5hiWjjnSCKZ+RD+kiTNto9SVy3Xn9BwYbLm8zDGkG7cAgqkHe9vTAvjR/CPrbJu4mtOoqlbTr35fugs1ZFq9R3bMURPB1J9SqynzwW5Une4cM+MXlzmxlI418gim/hzEHrmLGo9GgOfCSV+uDz8t3Y0KmZbmfukeZBFMPbGmffTqXBc1npefL911QuZLhggNqkyM9r7HNJTFEUz9ip5Jf/m70l2NUwG8augAV+jqywR59Bgjj2Dql2oPk/lnoEDootX0g2+V7npCXb1ccOEpHatEiE+oLy2HYOqRDbaMfnATH/RGKXjmhw4okP7meyG89mL1WuGYybRwDzzvjuMZwdS/67FnoK5BV7UmFcNfeSGEv/srAmlRmdZSoBu3PIKpZ1YYvTn/LFTjyZyJG6MW0t9emnXrcus1IS5zjG5S9F4eweRDtNWkM3HiSk+jCKTl6NhkWkvRY4p6CCYHUq0mef9h6S44kTk2tJZWRDD5ET3DalxT5qyMnqgGmFkRInosUR/B5ISdYW/Eno3OzImpDuiBjsUHnyQf9watpdURTL7sxyb36ovw3m8G/s448u795IniiCtxzSCYHLExL7uxZ6TlNDKji9GRii7cLuOWmkEwObO3PR1weSv2rNSlY9fc/ui9zxS8b9mxQwMIJp92YlNVQr4bgRbpPdd7nzCxY4aGEEwOWXcg+kHXduI/+3XpbrRIoaT3PLOV+w5duGYRTE5Zt+Dt2LNTl+Lnvy3djZZUdKHfpgvXvGceP368aa9po4zG03WbLsVek6aTaG4b2qMTQGYcmdZa2irdi5XRYvLvcqrepC8MLaf2VITSkR0btIBgcs5qF4RTxypCScfiCnWl9tCVWxOj8TScfpF6thfOhPDjbzMhd1XFYNbMNkzyEruetIsW05qw7aWvpZ6tvki6csSecMvTe6f3sCKUrhFK7aPFtGZG4+kwgndSz1otpjcusizuorT1krpvFWPEFErR3W3QLIJpDVWFU7CVKVn8rVoxIbdius/EppsQSh0hmNbUaDy9TK3u3enUKzj11VndidZTnOa8qZ6UGTgZLJQu033rFsG0xiycDlLjnAoa76Q1vVnLe0a1JA2arKglBdv3b4dQ6h7BtOZG43DGwun1qlcy9IBSIGmN7swwgONuMdWkPwTThhiNp8ulvFXn1SigVIOa37qpLcXmmcW249//5uw5dFX/0nQS1ZAWWAn0p3vbrKvUJ4Jpg9Tt2hUUTAoIjYFqoxWlK13qLqUCoXjsi8+VfrQytY702ArDihrScXTdnCCYNtBoPF1zejdXGJ+nQrkCotg6fJmgUjH54aPZn5nF1KIUUHrss6eWK9YriPSYah0pEBcIo2AF7uu0kvwgmDbUaBzO26L4V5d9hUVAKDBi3S6FgLppCoUFg6CSglLhqMeNdTn1uMWM/0VDcM5NVp70h2DacE0E1Ia6aa0kNg5wiGAaCAuoXVuArnYXb8NMrAa3TyD5RjANjA0vuGK3yiEGDdESIYe2g8gZC0c9/rmOHl+X/g8Zub0+CKYBOxZSl+3WZFDcsZHph6mrXHYVsXj8V0u/sLwje+zi8akfrRmCCU9YUG1ZUJy325nM8AN1jYrQUQioe/TAVkJYmC3tsmWPWSzCtpXpet6xPx/YTY97lyBafwQTAHdYjwmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYALhDMAFwh2AC4A7BBMAdggmAOwQTAHcIJgDuEEwA3CGYAPgSQvh/rGzM5Ay7+1UAAAAASUVORK5CYII="

/***/ }),

/***/ 1231:
/***/ (function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAScAAAEmCAYAAAAgBlbkAAAACXBIWXMAABYlAAAWJQFJUiTwAAAc/ElEQVR4Ae2dva8dx3mHh98WJEsOTDmQTIEKbcFJGjHFtSsrKuSKAUykMitTVcrQxa0t1beI9BeYqqQqUACrkoFISmXfhqySgLYiwpQNWzQs0TYoih83+B3uSIf37MzO7M7uvrv7PMAFiXPJc3b37Dw7887M+x7Y29tzAADWOMg3AgAWQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYBLkBAAmQU4AYJLDfC2wVHZ23Wnn3Fec+/xPt+/v67yz9vdLzrmPt7ceeA0Kc2Bvb49rCrOnEtHzlXz082yhc/6kktU71c+l7S338ca/gmyQE8ySnd1V7+ds9SMpPTbgeb7rnHtTstreWokLWoCcDFE1KD3Vn65+XGSYIT6untrig+pn0U/unV13vhLS9zd+OQ5XnXOvSFbbW6vvBxJBTiNRicgPM/yfpZ7u60ONS9UTfLbC2tldifyCcysxDdlDyuU/JCpiVWkgpwGp4h5+qFEq5pHKZefcxTkNNXZ2V1KXkH648UvbqDf10vbW6vuAAMipZ6qn+tnqyX7SyGFNeqhRXdNX+hi6HT3k3ONfuvfAazc+O+D+dPvAxr8tgL6HC9tbq/gU7AM59UT1VL9gKPYRYjJDjWoo/JJz7l83fpnB8S/tuccfuue+fGTPnXjkXq2QQnhRfXTzoLtx+4C7fvOA+/AvnZcLvltJiuD5GsipMFVA9iVDvaRUTA81dnZXvc+LbWJKktCpx+65Ew/fc19/+J47dqj8PS9BXfvzQff+jUPu+qete1mvVt/B4pciOORUjqrxvFJaSrGn+kefHnSf3d14uSumhhpVb+libg/UC+nv/upu8Pr1hXpXktR//7GVqHT9zxM0R06dqYLcktI/dnkvPdGPP7S3akiPHt1bDT1Sn/C37h5YNQI1Cv3oKT6HoUab3pKu4+njd92pR8tbuw16gFy+fl9Umby8vbXqgS8W5NSSrvEPyUcNSDEPNag+UMP48M8H2z7BPaMMNXZ2V8JPvrbqIT17fPheUip6gFy6fshd+sPhnN6uHhBnlzrMQ04tqILdF3OHcBKSGpGkpN7RkKhxSFLWhxqV9N9M7YlK7N998o5ZKe1H38N//fZwTk9Ka9aeX2KwHDllsrO76i39OOd/WXuqa+j3i98fdr+6cSg3ZvXq9tZqBrIXqiUCb6asAVNM6bkn75gZvuWi7+Bn146kDr8/qR4Oi1pygJwSyX2iK5B9+qt3VvGPPmaHStByqHG5epIXHWpUsbt3UuJLEv13vnbH7HXN4dL1w+7nv0++/i8uaeEmckogp+G4CTYeLyn1phIpOtRIvb7qLX3vqdu9xejGIrMXtRhBIacGcmaM1GheOHF78HhSKVoMNS50bSipYjr16P1rO4feUoif/+5w6gNiEYJCThGqBZU/Cf+L+2gIp57S6eN3Nn43RbRG5+1rR3ofaqSK6dtfu+O+89fzuLZNZFz72QsKOQVIFdPUe0shNNRTL+r9G/0MNVLFpGurCYUloSUg//7+0RRB/cOcZ/GQUw2pYlrCE10BW019J5AsqOr6vhITk3qjzz2xPDF5JKif/fpI07KPWS8zQE77SBGTGs73Ttye7DR2LopB/fRq0pO8UVCp1/efT302mbVLfaHeq3pQDYLqZfbUAlRfWaNaXJnUcJYiJlcNXXXOmi1r4Cc7u+F1UIgpDwX/dS2OxtdrPlv1QmcHPaeKlBiIVnifOfnZ7OJLqSQ+ycVr21srEX0OYmpPYgxqdgFy5PTFAst3YiuTJSY1nDlPZafQRlCIqTsS1BtXjsbeR/Gn03PKU46c7jeeN2MpOTScOfcMYvLkCKqSPmIqgPbjaQY1wrvbW6vQxCxYvJyqGMm/bfyigoZTT4agonB985CcGjYNz2Z4t2g5VRtNL8XiTD94hoYToqugNFR+4anbXN8MdM1fv3I0ltNcw7un5zB7t/TZuui2FC0ApOGE8bNJkkwuPobH9c1D1/zM07dj/+exKnf95FmsnKrhXDDDgBb/LXUBYA5tBMXkQjckdG0uj/DjalQwaRYpp7UslrWo8Xz3iWXs5SpB4nqcFT7GhJi6ob2cDevOgvf3VFhkzGlndzWcCxZi7DPOpI2d1/5yMFhSSDec1lFpF/7XH7k3mWFPQqD2c9Qj1ZAZupEwe/c3U15akJzAZy5U3d2gmLRfrrQQcpK6KdCpHy8u9eKU7cDyEDNHTK5qVK6K6VlDaWOuf3rQfXTzfsBZf791132eQ2pVfKIqRDE2uid0LesechUXphx/WlzPKdZrUq/l/N/e2ni9C5mZDoNYTbSWK6Z1rPSgJCQ9ON7/5GBsFuwBNDz9xqN3Vz3cMbcySUyaMQ0w6Zm7Rcmp6jX938YvKs6cLLeZV72lt64mJ25LxkomhFLrnMYUlL4bJXjr+h3pwaHvZKzerb6HyDlMdt1T8IxmSjBIqB5JKTFpq8HF/z0Wu2Fao0yJ6q1IDmORKqaUGc+EuElxfK6qhkadjHpber/XrxxbffdD03CNGdZZp5qh+2PoMDWDVGLIlJEorBNjTcfniMn3iFKGfkP1oPT9vPXBkeThWxs00zt0VtSL/3Msdk6TTEq3pJ5T8Any9YfLFLZcDeU+SEtvq5iF4hUapvkfrV1JXS8kOUgSQ/ag2ojJJWazHKIHpc94I766ughKzjd0b7Dh+p7feGUCLGm2LvgFlYrh6IZsuvFT4hMK0KohNc3ueUEN0YNqKyaPfy3Wg9LvdO6K/ZU+n7by82uJcoU29IykrnukOMLZ2MPZKosY1lVJ5P5z4xcFZ+i0fkkB8Bi5wezUoHrfm2e7immdlCFe6SFrjpj87Jt60vvzduk66LtQXvXUgqTqDSvd8BAo5hX5jia35il+18+H3ntN7/0m+NRayUONNvez/MrrWC9LqJFIHn0EY9WTKSUmlzjEKzlkTRWTpPTDb91aJRPU8dUlFNT3IXHpHM5/69bqYdO0Kv7y9UOrB9cQNFzXsxuvGGcpcgp+Mbopu6IGEOv2d03Ur8bQsJeqF0HpvV7/ZfRp/Pnx5QxfhhJUipgkFw0jczOcSlR62Jz75q3GOOHbA82uNsw2Ty7P0+zlVKXfrc08IDGVGDrEnoySSon1LxJckwC8oGLHk0rqrGPb0k19CypFTH742NCoo0ho5565FT0XXcPECjad0LFE9tshJ4NEek3hGyoVNZxQbTdfbLMUKUMnNQTFqdqu2nYDiCnn/7cRVI6YSsXpXlhV4wm/lw/2982px4LH8NjUMhXUt6p5EXxixG6mVGLBajW80rNOqbGdtttKhhJTzvvkCCpHTKW/G51LpOcSm00rRoNsT2+8Yphwy5oPtTmbNBtT4ub0G0Tr6Gs7g95XmROagrFqpNrbl8rQYsp5vxRBaSvKWGJyVRxK+x9D/GqAwLg2JUdATlaolhDUUmoDbSwQ3vAU64TeOyWHUuqCwLHElPO+MUHpHJt6JkOsqo8t6NW17XvmruGeQ06GCH4ZJx6JfonJhOIIoRu0JKmCahrq+J3tY4kp5/3rBDXG2qkYpyMzq9ciYYBSRO69r2y8YpjFyqlN3muLeEE1nU9IUHq9SUySn4aRQ+y6l6C+3TCJsC4oa2Jy1URL6IHx4Z/7b3LHAp8dCnFYZe5yqp2dUNByTmlicwS13usICWudMUo3af1QU9BfglLmB2ti8pwI9F66pphJ4fhMikYssudUspx46L1is3h9kFpowA/hFCi3KCZP6rKJGGMWUpiLIMZk7nKqXXwZGZNnE5s6Hjq3jxdU0/np6d20KNBCscsuaVTGrvASemi5AR5csc+OTRJZY7ZyqlaG904ssN5lIWRbUvfjxbBUhbeNoCyUnooJYs6fXZI595yCMxMxoeQSG0ZJTnXT3kPQdmbNYnnwHEFZqYn30c1w0woFy+FBwlcQkri/U72+ISsm8vOGtTd9kisoDVGtVuFNHQrduH1g9TM2tyKXnSrHaSCnAsQEoJQZYwzvPBJUaoxNq5stNpycrTh9po/JYegJkTnCFSyA1rXEAuNdyid1RZ+d2lDUqMcUaR1trt3YgvJJ6eqwVtrLMvVXELKJ7alyIwmqzWeOKdL9dDmWMQUVylLhkFMW4asIWdwvLRW/8YZs+F0+a2xB+bTATcfQ1NDHEpQ2IIeIpDSBfSCngii+E5u9cwM1/BKfofd477fxRZp94MUUGhZ5FOdT8D41Ad9QgtLi1tBmcA39CYang5wKopm7F566nZTKpC9B5ew1S8l/PWSJozaFFFJXkg8hKL1/bHY2NnECmyCnwqRmCigtqJyhkF9Frj9jgXw3YEXeLhVe6l7bT9+CWm1C/nW4ZqHuh1i2AtgEOfWAF1RTw1ejj8UnUskdCvkFijrOc8+kZzToa0FpidJTsd95+hJUyvGf/uqdWW02HwLk1BOpDV8J0rr0TLo27NQNw/szGpSiZE28MQSVcvy6tqVKkC0J5NQjOQ2/jaBKNezU46xL9NaFkmJa/7dNKYxLCSrl+Fc1CxuWmZRmrC1TpUFOPdOXoEo37NQNw6UE1YeYPClxvxKCUpWbpuNXSa+hZ+hiee01objxilGQ0wCUFlRfDXs125iYKleJ3to27D7F5OlbUCkr7/tOa9yG7S33sakDihC/ulCMUoIaomGnNKq2DTv1+JWqt+3xe/oSVMpM65hiCq2zmhpzltMHG69UXBsgj3MdXQW1Kg9+ZZiGnZLLO7dhp4pJn10qgFxaUCliKlXluS2hohvOuXc3XjHMbOW0vRWW05ikZqtUA3jr6hexHV+6qempWLJhp+Ty9g27qcHmiKl0w84RVOw8UsSkY1ecaUzGzshQirkP6z7ZeMVAOovU4LM2kPr1S2OVbkqdno813DHF5EkVVOg8tJWn7vV1ugylS6FeU+Q+eWfjFcPMXU61MxORbu+g5NRpi9xwK/ps2F1KoOspruD5mGLytF29r79rK08MC2Jyq/sl2qRNjiZCRM9kBtTKSUMjK2tBSjTKIRp2mxLoY1cRriNXUKH43zpWxORmtIzALUBOwSfFEPXDUunSOC02bFV2UbzMmpg8OYJqEpNih1bE5Fy03Pkn21vIyRLBL2OsGbsQbRqp5YateJlFMXlSzyOGZl3PnLQjJo0GIg/dYFuwyqzltL0VDgBazPGck+9bjWLMhn3um7c6lXS3sECxi6CsVHlZJ5aB0zn35sYrxomezUyoXdshOVnbg6T4Rqo0lc1gzClj1UZLWbNVh6WV020EZVFMLj6kc1ObqXMLkVPwS2l40gxK7t46P4s3pqBSF5WuY3FLR46gfPksa2LSgzZyP1+dWrzJLUROwe5sw5NmMCSYNlkJLJRBUiN97sm0uIsadlOedetopjcigdFoOKZgG7BM9IzmQPXEuFp3KvpCxx7a+QWKbRlbUPrcn15NO341bAs15faTuuTBU7eea2z88o0AF+tfts1SNv4Gnxxj32S60WONQkON0nvcSpHbqJ2R4eg6bc7BGROU4pSRWbpJDuncguQUfHJcalj52ye6qWLdcYlJ8Y2cPW5DNfq2jdoZqsrblPe7CSuCajiG4L1vnUXIKTa001BjrGUFb/86HGfyYvKJyqxVGWkSU1Nw2R/rWNc+NYulhVJfMbQVq+HzkdMEeCV0iCWKDOSiRhnLMPBPJz/byKAoQWl9U6zhp2YJ6HLcKWLKqSk3dONOFZPOIWU2ckxB/SJSiso595rV7BwpLElOF2NZCoZ+gscCmMoHFFqMeerRu51213fBFzlIEZPE2mXDcF+kZkjw6XVTl0soa8HQw1Tdsw3XLfhAngKLkVOVnjQYGB+69xSKNalxf6chAD5GbbyUdVj7h6IusbdX+lhDtE3dkiKo1QMhMkzvg4Z79t2pBsI99S1kvrwUOrP7welhnt6xXto3Hr2btMBvSEG1FZMnpbfnBiiBrvdvm7olRVB67wZhFEM979h9FLvXp0L07OZGNf5+LXRa7/1mmBsrtum4rmGEGEJQXcXkST3Wvkqg6z1DvVVPSEyeFEFd+sPh3tfO6f1jZc+rWFNwZ8RUiH9b8yT4RFGAeognXywhWCjWFKJPQZUSkye1EnLpEuglCxKsKtQ8FR6manjX9/BUJalicb/YPT4lwq1kplS9p1dDZ6fZj74Dm7cCN1aumDx9CKq0mNaPNbUE+noO9bak5v3O7bHG4oJ9rp1LGM69POUZunWiZzljXgrN3AkFNqdWNdULKmXauymu05eYPKkzYD6HetvvIlVMbZLFnT5+J9gDVA+8jwec3lOJ/CJoNfgsek1uqXKqZu4ubPyiQoHNhpvAJKmCisV1+haTp+8S6Bqe912Q4PTxcG/rw0hcsQ2JezDPb7wyYRZbVHN7a7XuqTbXk6saqbXNnSl0qY1X99p+SojJo2M998yt4iXQdR4NixOL5P2OHXfD0CsLL6aGONPLcwiCr7P0ir/no8O7a8MvrCtBG0GliEnvd/5bt4rX/i9ZAn3IggS6zqFrXLLCjwLgDUsgLs9pOOeJf9MzpwocBod3oo+9ascCHbKST9scQekcU8TUZ5K1EiXQUwVbsiDB4w/Vi7pBJsnofBruCz1cz268OgOiZ70EquFdcO2TGsRbH5QNkB+P9DxKLgRNFVTDzT9YWtouJdBTxaTzKEkoKF6CxNnVs3OZndtP/K5cDuo9XQ6drU+SVkpQJx6Jyal0L619rm83Qr7sNiXQJfSxe36lSRTTi3OLM62DnL6YvYvGn3xQtkQsQeuZQmuSdEOWrkjsBZWbInesBp1TAl2zcm8vU0yvVr3+2YKcKqpNks9v/GINCer1XzYHZVPQHroQTTNNbVDDPHPys+TFhmM3aC+okMQ9ulaxWay+zyOW9qYNiWLS9pRorHQOIKc1KkG9uPGLNUIxj1xiktDNaaX4wpjoGnUpfOmXPfQp2I9u1t8HucNov1wgUUyzWs8Uov7KLpiqq9y7oDS0i21XebuHZQw521faLn4sTdvCl0OIScPv0Kyc6vql4sWUMFu7GDE55FTPUIJS8DdE6ZS7bTb+TlVQJReKxoj1bmMPnnVSc0wtTUwOOYUZQlC6gWNBav/+sayZTejp3iUVrjVBpXDi4Xu9i8k1bPA9FYkpehBTHOQUIUdQbRdQKugbWyuj99c+v9zPWOX8+d3hVQC/6f819UgsCMpXSklByzFev3Ks1+PVtQ0FwxVvahrWIaZmDuztxS8iOLezu7o5lI/5sdjlaFtqO6fMkm58fYZWJu8fOtyPgdwvN/WrG4eS3089EvWsmjY7DzVc2k9GQ36Avmbq9H29cSW8CbfpPkBMaSCnRHZ23WnnVgveRhdUKSQ35ff2jXfojb8ptBWTp7SgdDyvXzka7DXp+vzL33+68fr6/0dMacT7+/A5a+ugggs1XYeUuG1npdrip+nXG62l2niugJicX5t2pczx+gdISEyuqtoSAjHlgZwyGEpQbbeapKL9ayEJWRJUl4IE6/jtR7HZtSb0f5vEop5o6FgQUz4M61rQ9xDPVQHX0ivFJb3nnry9EauqY+whXm7e79QHgs5dSzhSp/o1maDvImVS4dw3b9UGwhFTO5BTS1IF9d0n7qxSurZBAW4JqmvSO80GqkHminIsQbUtSJBTGEGi1nS/NmHr7354K5FIIqqQo95S6pBSsbu65QOIqT3IqQOVoLTc4NnYu3RNbiZJqaGo8aU2FklD+/e0jqqu0aQytKC65v0uXbklhTpROsTUGeTUkZ1d95WqB9WroDz+ya49XXVVXB5/aM99+ehe0Z6MhjQ/vdo8kxhqpKmUKkig91ARhyFmPkPnjJi6g5wKMLSgxiB1qUOosTaREmPLuX46XiUJjM2sdUFD5TNP3659CCCmMiCnQiCoL8gVVF95v31l3MuRbSZtePb43VXdurq1U4ipHMipIAjqC1IFNURBglITCzoOLcOom5FzeWJ6eY4FCUqDnAqTKigFqtXg6p6+1iklqNS83yofVQLJ436urIPJ+xT95mxNKoSk5PLE9OLcM1iWAjn1QCUo3YDfj7371NLHrtNVUDkFCfq6PhKUpPLRzQeFokkFfWYPaU8QUwbIqUd2dlc34g9jn7BEQWlZhGqxxZjKdUFM/YGcembuglI8562rzY3Tx41ShIaYwCGnYZi7oFIbqWI31/5yEDFBEshpIBBUM1pprnLniAkcWQmGo1rTEqws7NYyTg6RjqQ0XYt3DlGQoASIaTiQ04BUgno59olLFNRYGTZzQUzDwrBuBKq0vz+JffJUGmwdOUM8xAQh6DmNwFClp8YitQeFmCAGPacRWUIPSkUTQttGfvAMYoIw9JxGZAk9qNAKcb2OmCAGPScDpPagvneiPtviFFjP1RQSliUQ0/ggJyPs7K4KJ7zZZ17ysZGgYkUArJC66h0x9QtyMsQQhRMgTkb9QMTUM8ScDNF36SmIg5hsgZyMgaDGATHZAzkZBEENC2KyCTEnw6TGoJQ6VnXpIB/EZBfkZJydXfd0NYsXTfs75bzkY4GYbIOcJsASCicMDWKyDzGnCbC95T6uYlCXY0c7RrXbKYKYpgFymggIqgyIaTogpwmBoLqBmKYFMacJkhqD0laRMyenWRuvNIhpetBzmiBrPaho2l/VZVOD1CbWJYOYpgk9p4kz98IJXUFM04We08TJKZywtB4UYpo2yGkGIKhNENP0YVg3Ixji3SdRTNq3+Hy1jxEMgpxmRoqgvnxkz5152n6a3DYgpvnAsG5mVEO8H8XO6k+3p1sbLwZimhf0nGbK3Cu77AcxzQ96TjNl7pVd1kFM8wQ5zZglCAoxzRfkNHPmLCjENG+IOS2E1BjUc09Mo7ILYpo/yGlBzKX0FGJaBgzrFsQcCicgpuWAnBbGlAWFmJYFclogUxQUYloeyGmhTElQiGmZEBBfOKlB8meP313N5A0NYlouyAnMlp5Sj+293x5BTAsFOcEKa4JKLNKAmGYMMSdYYamyC2ICh5xgHQuCQkzgQU7wAGMKCjHBOsScoJbUGFSptL+ICfaDnCDKEHnJERPUwbAOovRd2QUxQQjkBI30JSjEBDGQEyRRWlCICZpATpBMKUEhJkiBgDhkkxIkD1V2QUyQCj0nyKbqQWXnJUdMkAM9J2hNTm286zcPICbIAjlBJ1IF1ZBZwCEm2A/DOuhEaumpBi4jJtgPPScoQkoPKoAX08f1v4alQs8JirDWg4qm/d0HYoIg9JygKKlpfxETNEHPCYqSWDgBMUEjyAmK0yAoxARJMKyD3tg3xNO2lw+cc68gJkgBOUGvVII6v73lLnClIQfkBAAmIeYEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgEuQEACZBTgBgD+fc/wPHPQqH5AUSJwAAAABJRU5ErkJggg=="

/***/ }),

/***/ 702:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _bear = __webpack_require__(1228);
	
	var _bear2 = _interopRequireDefault(_bear);
	
	var _bubble = __webpack_require__(1229);
	
	var _bubble2 = _interopRequireDefault(_bubble);
	
	var _fruit = __webpack_require__(1230);
	
	var _fruit2 = _interopRequireDefault(_fruit);
	
	var _heart = __webpack_require__(1231);
	
	var _heart2 = _interopRequireDefault(_heart);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = [{
	  src: _bubble2.default,
	  link: 'https://www.behance.net/gallery/38817957/_',
	  title: '台灣小吃解剖'
	}, {
	  src: _heart2.default,
	  link: 'https://www.behance.net/gallery/69897741/_',
	  title: '月老參拜指南'
	}, {
	  src: _bear2.default,
	  link: 'https://www.behance.net/gallery/54608589/_',
	  title: '台灣特有種'
	}, {
	  src: _fruit2.default,
	  link: 'https://www.behance.net/gallery/54608771/_',
	  title: '水果年曆'
	}];
	module.exports = exports['default'];

/***/ }),

/***/ 1232:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/3-air.7d2d77e1.png";

/***/ }),

/***/ 1233:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/3-animals.e72d450f.png";

/***/ }),

/***/ 1234:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/3-straws.6d1fb64b.png";

/***/ }),

/***/ 542:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _air = __webpack_require__(1232);
	
	var _air2 = _interopRequireDefault(_air);
	
	var _animals = __webpack_require__(1233);
	
	var _animals2 = _interopRequireDefault(_animals);
	
	var _straws = __webpack_require__(1234);
	
	var _straws2 = _interopRequireDefault(_straws);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = [{
	  src: _animals2.default,
	  title: '全台逃走中',
	  link: 'https://www.behance.net/gallery/54608589/_'
	}, {
	  src: _air2.default,
	  title: '溫室氣體排放清冊',
	  link: 'https://www.behance.net/gallery/20394553/_'
	}, {
	  src: _straws2.default,
	  title: '跟動物一起說不',
	  link: 'https://www.behance.net/gallery/55514887/_'
	}];
	module.exports = exports['default'];

/***/ }),

/***/ 1235:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/4-cancer.0d7f7867.png";

/***/ }),

/***/ 1236:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/4-taipower.0549a6c4.jpg";

/***/ }),

/***/ 543:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _cancer = __webpack_require__(1235);
	
	var _cancer2 = _interopRequireDefault(_cancer);
	
	var _taipower = __webpack_require__(1236);
	
	var _taipower2 = _interopRequireDefault(_taipower);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = [{
	  src: _taipower2.default,
	  link: 'https://www.behance.net/gallery/55521689/_',
	  title: '台電電費單改造'
	}, {
	  src: _cancer2.default,
	  link: 'https://www.behance.net/gallery/25399493/2012',
	  title: '2012十大癌症報告書'
	}];
	module.exports = exports['default'];

/***/ }),

/***/ 1237:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/b1-benz.cc7304b7.png";

/***/ }),

/***/ 1238:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/b1-esd.5fd72d57.png";

/***/ }),

/***/ 1239:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/b1-handtool.6230cc54.png";

/***/ }),

/***/ 1240:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/b1-hour.7bc3594f.png";

/***/ }),

/***/ 1241:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/b1-myvideo.a00d8f39.png";

/***/ }),

/***/ 1242:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/b1-whisky.68d80dc1.png";

/***/ }),

/***/ 703:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _b1Benz = __webpack_require__(1237);
	
	var _b1Benz2 = _interopRequireDefault(_b1Benz);
	
	var _b1Esd = __webpack_require__(1238);
	
	var _b1Esd2 = _interopRequireDefault(_b1Esd);
	
	var _b1Handtool = __webpack_require__(1239);
	
	var _b1Handtool2 = _interopRequireDefault(_b1Handtool);
	
	var _b1Hour = __webpack_require__(1240);
	
	var _b1Hour2 = _interopRequireDefault(_b1Hour);
	
	var _b1Myvideo = __webpack_require__(1241);
	
	var _b1Myvideo2 = _interopRequireDefault(_b1Myvideo);
	
	var _b1Whisky = __webpack_require__(1242);
	
	var _b1Whisky2 = _interopRequireDefault(_b1Whisky);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = [{
	  src: _b1Whisky2.default,
	  link: 'https://www.behance.net/gallery/25803367/_',
	  title: '艾雷島|威士忌',
	  client: '布萊迪'
	}, {
	  src: _b1Benz2.default,
	  link: 'https://www.behance.net/gallery/61724169/_',
	  title: '賓士零件',
	  client: '賓士'
	}, {
	  src: _b1Hour2.default,
	  link: 'https://www.behance.net/gallery/69897219/_',
	  title: '給財務長的|一頁工時報告',
	  client: '星展銀行'
	}, {
	  src: _b1Myvideo2.default,
	  link: 'https://www.behance.net/gallery/61729657/MyVideo',
	  title: 'My Video|霸數據',
	  client: '台灣大哥大'
	}, {
	  src: _b1Handtool2.default,
	  link: 'https://www.behance.net/gallery/62822103/_',
	  title: '台灣手工具',
	  client: '外貿協會'
	}, {
	  src: _b1Esd2.default,
	  link: 'https://www.behance.net/gallery/33537231/ESD',
	  title: 'ESD',
	  client: '微軟'
	}];
	module.exports = exports['default'];

/***/ }),

/***/ 705:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _Cloud = __webpack_require__(239);
	
	var _Cloud2 = _interopRequireDefault(_Cloud);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var locations = [{
	  w: ['30%', null, '15%'],
	  top: '30%',
	  right: ['5%', null, '10%']
	}, {
	  w: ['50%', null, '25%'],
	  top: '5%',
	  left: '5%'
	}, {
	  w: [0, null, '13%'],
	  top: '60%',
	  left: '-5%'
	}];
	
	exports.default = function (props) {
	  return _react2.default.createElement(
	    _Box2.default,
	    props,
	    locations.map(function (location, index) {
	      return _react2.default.createElement(_Cloud2.default, {
	        key: index,
	        position: 'absolute',
	        top: location.top,
	        right: location.right,
	        left: location.left,
	        w: location.w
	      });
	    })
	  );
	};
	
	module.exports = exports['default'];

/***/ }),

/***/ 706:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _templateObject = _taggedTemplateLiteralLoose(['\n  0%, 100% {\n\t\ttransform: translatey(0px);\n\t}\n\t50% {\n\t\ttransform: translatey(-10%);\n\t}\n'], ['\n  0%, 100% {\n\t\ttransform: translatey(0px);\n\t}\n\t50% {\n\t\ttransform: translatey(-10%);\n\t}\n']),
	    _templateObject2 = _taggedTemplateLiteralLoose(['\n\tanimation: ', ' 4s ease-in-out infinite;\n  &:hover {\n    .bubble {\n      fill: ', ';\n    }\n  }\n'], ['\n\tanimation: ', ' 4s ease-in-out infinite;\n  &:hover {\n    .bubble {\n      fill: ', ';\n    }\n  }\n']);
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _styledComponents = __webpack_require__(13);
	
	var _styledComponents2 = _interopRequireDefault(_styledComponents);
	
	var _styledSystem = __webpack_require__(16);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _Svg = __webpack_require__(539);
	
	var _Svg2 = _interopRequireDefault(_Svg);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }
	
	var float = (0, _styledComponents.keyframes)(_templateObject);
	
	var StyledSvg = (0, _styledComponents2.default)(_Svg2.default)(_templateObject2, float, (0, _styledSystem.themeGet)('colors.yellow'));
	
	var Pigeon = function Pigeon(props) {
	  return _react2.default.createElement(
	    _Box2.default,
	    props,
	    _react2.default.createElement(
	      StyledSvg,
	      { viewBox: '0 0 317 340' },
	      _react2.default.createElement(
	        'g',
	        null,
	        _react2.default.createElement(
	          'g',
	          null,
	          _react2.default.createElement(
	            'g',
	            null,
	            _react2.default.createElement('rect', { x: '175', y: '175.54', width: '111.16', height: '75.56', transform: 'translate(22.84 -22.3) rotate(5.83)', fill: '#f7f7f7' }),
	            _react2.default.createElement(
	              'g',
	              null,
	              _react2.default.createElement('rect', { x: '184.34', y: '167.91', width: '111.16', height: '75.56', transform: 'translate(22.12 -23.29) rotate(5.83)', fill: 'none', stroke: '#8acaff' }),
	              _react2.default.createElement('line', { x1: '239.93', y1: '205.68', x2: '299.05', y2: '173.74', fill: 'none', stroke: '#8acaff' }),
	              _react2.default.createElement('line', { x1: '188.46', y1: '162.46', x2: '239.93', y2: '205.68', fill: 'none', stroke: '#8acaff' }),
	              _react2.default.createElement('line', { x1: '180.8', y1: '237.62', x2: '218.45', y2: '187.64', fill: 'none', stroke: '#8acaff' }),
	              _react2.default.createElement('line', { x1: '291.39', y1: '248.91', x2: '264.61', y2: '192.35', fill: 'none', stroke: '#8acaff' })
	            )
	          ),
	          _react2.default.createElement(
	            'g',
	            null,
	            _react2.default.createElement('path', { d: 'M97.52,268.23S55.07,290.25,19,272c0,0-4.76,14.91,5.59,19.67,0,0-2.28,13.05,14.29,15.74,0,0-.76,5.89,3.11,8.06s10.23,2.61,14.32,0c0,0-2,10.23,10.47,12.16,0,0,15.46-33.09,32.52-39.34Z', fill: '#fff', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M20.62,288.58s8.6,14.36,56.07-1.85', fill: 'none', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M33.82,306.1s14.28,8.18,38.38-12.93', fill: 'none', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M56.35,315.5s19-19.59,27.18-22.33', fill: 'none', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M161.61,202.4s-46.69-38.66-13.82-112c0,0-13.9-.94-19.28,21.18,0,0-30.68,9.92-16.12,77.41S160.89,216.41,161.61,202.4Z', fill: '#fff', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M129.6,107.74s-8.07,26.78,0,54', fill: '#fff', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M130.88,221.07a14.88,14.88,0,0,0,15.79-8.17c5.44-10.34,8.5-21.24,21.83-22.35s17.14,12.22,4.28,28.73-.82,34.28-17,51.9-61.62,18.55-61.62,18.55S89.44,259.48,130.88,221.07Z', fill: '#fff', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M145.65,225.48s1.27-13.11-22.42-32.57S54.69,143,51.73,77c0,0-12.69,5.92-11.42,34.69,0,0-16.93,6.35-2.54,34.69,0,0-14.81,2.54-9.73,17.77,0,0-18.62,17.35,12.69,45.27,0,0-6,9.32,10.17,16.07,0,0,3.53,14.45,15.59,16.11,0,0,10.81,21,35.13,21.28S150,244.71,145.65,225.48Z', fill: '#fff', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M34.38,138.6S47,176.94,90.6,189', fill: 'none', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M40.24,106.05s-3.06,31.19,30.61,55.72', fill: 'none', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M27.38,161.77s3.35,23.7,33.91,37.41', fill: 'none', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M32,200.42S49.44,228.29,88.73,215', fill: 'none', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M47.75,224s18.94,12,45.14-2.37', fill: 'none', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M61.29,239.89S75,249.07,103.9,231', fill: 'none', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M180.34,197.77s.63,5.7-.65,9c0,0,6.29-5.81,11.68-4.53C191.37,202.29,186.64,196.64,180.34,197.77Z', fill: '#8acaff', stroke: '#8acaff' })
	          ),
	          _react2.default.createElement(
	            'g',
	            null,
	            _react2.default.createElement('circle', { cx: '170.15', cy: '200.91', r: '2.92', fill: '#8acaff' }),
	            _react2.default.createElement('circle', { cx: '170.15', cy: '200.91', r: '1.29', fill: '#fff' })
	          ),
	          _react2.default.createElement('circle', { cx: '180.34', cy: '197.77', r: '2.66', fill: '#fff', stroke: '#8acaff' }),
	          _react2.default.createElement(
	            'g',
	            null,
	            _react2.default.createElement('path', { d: 'M127.37,285.06a2.43,2.43,0,0,1,1.74-2.07,5.14,5.14,0,0,1,3.07-.06c2.5.72,3.53,4.95-1.18,6.8,0,0,.58-5.79-2.07-4.32C127.61,286.14,127.32,285.69,127.37,285.06Z', fill: '#8acaff', stroke: '#8acaff' }),
	            _react2.default.createElement('path', { d: 'M122.85,286.24a2.44,2.44,0,0,1,2.06-1.76,5.21,5.21,0,0,1,3,.46c2.34,1.12,2.65,5.46-2.3,6.51,0,0,1.54-5.62-1.32-4.61C122.9,287.34,122.7,286.85,122.85,286.24Z', fill: '#8acaff', stroke: '#8acaff' })
	          )
	        ),
	        _react2.default.createElement(
	          'g',
	          null,
	          _react2.default.createElement('path', { className: 'bubble', d: 'M230.59,12.34a49,49,0,0,0-16,95.29c.26,2.51-.62,5.45-4.11,8.45,0,0,10.08-.93,16-6,1.37.12,2.74.19,4.14.19a49,49,0,0,0,0-98Z', fill: '#fff', stroke: '#8acaff' }),
	          _react2.default.createElement(
	            'text',
	            { transform: 'translate(210.93 56.24)', fontSize: '19.05', fill: '#666', fontFamily: '\'PingFang TC\',\'HeiTi TC\',\'Microsoft JhengHei\',sans-serif' },
	            '\u5408\u4F5C',
	            _react2.default.createElement(
	              'tspan',
	              { x: '0', y: '27.22' },
	              '\u6D3D\u8A62'
	            )
	          )
	        ),
	        _react2.default.createElement('circle', { cx: '239.93', cy: '202.81', r: '14.95', fill: '#fff', stroke: '#8acaff' }),
	        _react2.default.createElement('circle', { cx: '239.93', cy: '202.81', r: '13.1', fill: '#069fd5', stroke: '#8acaff' }),
	        _react2.default.createElement(
	          'g',
	          null,
	          _react2.default.createElement('path', { d: 'M241.43,195.55a1.69,1.69,0,1,0,1.37,2A1.7,1.7,0,0,0,241.43,195.55ZM241,198a.77.77,0,1,1,.28-1.52A.77.77,0,0,1,241,198Z', fill: '#fff', stroke: '#8acaff' }),
	          _react2.default.createElement('path', { d: 'M244.85,203.11a6,6,0,0,0-1-4.19,4.39,4.39,0,0,0-5.92-1.06,5.91,5.91,0,0,0-2.36,3.59c-1.39,5-2.1,5.57-2.1,5.57l5.69,1,5.68,1S244.4,208.3,244.85,203.11Z', fill: '#fff', stroke: '#8acaff' }),
	          _react2.default.createElement('rect', { x: '232.54', y: '207.32', width: '13.3', height: '1.44', rx: '0.72', ry: '0.72', transform: 'translate(40.54 -39.01) rotate(10.18)', fill: '#fff', stroke: '#8acaff' })
	        )
	      )
	    )
	  );
	};
	
	exports.default = Pigeon;
	module.exports = exports['default'];

/***/ }),

/***/ 707:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactScroll = __webpack_require__(230);
	
	var _gatsbyLink = __webpack_require__(463);
	
	var _Container = __webpack_require__(75);
	
	var _Container2 = _interopRequireDefault(_Container);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _Text = __webpack_require__(41);
	
	var _Text2 = _interopRequireDefault(_Text);
	
	var _Image = __webpack_require__(674);
	
	var _Image2 = _interopRequireDefault(_Image);
	
	var _BackgroundImage = __webpack_require__(65);
	
	var _BackgroundImage2 = _interopRequireDefault(_BackgroundImage);
	
	var _ArrowDown = __webpack_require__(671);
	
	var _ArrowDown2 = _interopRequireDefault(_ArrowDown);
	
	var _Clouds = __webpack_require__(705);
	
	var _Clouds2 = _interopRequireDefault(_Clouds);
	
	var _Pigeon = __webpack_require__(706);
	
	var _Pigeon2 = _interopRequireDefault(_Pigeon);
	
	var _logo = __webpack_require__(1245);
	
	var _logo2 = _interopRequireDefault(_logo);
	
	var _relabyo = __webpack_require__(1246);
	
	var _relabyo2 = _interopRequireDefault(_relabyo);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Intro = function Intro() {
	  return _react2.default.createElement(
	    _Box2.default,
	    { position: 'relative', overflow: 'hidden', pb: '10vh' },
	    _react2.default.createElement(_Clouds2.default, null),
	    _react2.default.createElement(
	      _Box2.default,
	      { position: 'absolute', top: '0', right: '0', transform: 'translate(-20%, 50%)', minWidth: '6em', w: '8%' },
	      _react2.default.createElement(_BackgroundImage2.default, { w: '100%', src: _relabyo2.default, ratio: 42 / 130 })
	    ),
	    _react2.default.createElement(
	      _Container2.default,
	      { pt: ['15vh', null, '30vh'] },
	      _react2.default.createElement(
	        _Box2.default,
	        { position: 'relative', align: 'center' },
	        _react2.default.createElement(
	          _Box2.default,
	          { w: '50%', maxWidth: '8em', mx: 'auto' },
	          _react2.default.createElement(_Image2.default, { src: _logo2.default })
	        ),
	        _react2.default.createElement(_Pigeon2.default, {
	          position: 'absolute',
	          w: '25%',
	          left: ['4em', null, 0],
	          bottom: '0',
	          minWidth: '15em',
	          transform: ['translate(-50%,-15%)', null, 'translate(-50%,-10%)'],
	          onClick: function onClick() {
	            return (0, _gatsbyLink.push)('/contact');
	          }
	        }),
	        _react2.default.createElement(
	          _Text2.default.h6,
	          { fontWeight: '200', mt: '1.5rem', mx: '2em' },
	          _react2.default.createElement(
	            _Text2.default,
	            { f: '1.25em' },
	            '\u6211\u5011\u662F\u4E00\u5BB6\u8CC7\u8A0A\u8A2D\u8A08\u9867\u554F\u516C\u53F8\uFF0C\u8B93\u4F60\u7684\u8CC7\u8A0A\u900F\u904E\u8A2D\u8A08\uFF0C\u6253\u52D5\u4EBA\u5FC3'
	          )
	        ),
	        _react2.default.createElement(
	          _Box2.default,
	          { mt: ['16em', null, '13em'] },
	          _react2.default.createElement(
	            _Text2.default.h6,
	            { fontWeight: '200', my: '1rem' },
	            'Take a Peek'
	          ),
	          _react2.default.createElement(
	            _reactScroll.Link,
	            {
	              to: '4',
	              spy: true,
	              smooth: true,
	              duration: 1000
	            },
	            _react2.default.createElement(_ArrowDown2.default, { mt: '-0.5em', w: '3.5em', mx: 'auto' })
	          )
	        )
	      )
	    )
	  );
	};
	
	exports.default = Intro;
	module.exports = exports['default'];

/***/ }),

/***/ 1245:
/***/ (function(module, exports) {

	module.exports = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA5MCA5MCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgOTAgOTA7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojMDY5RkQ1O30KPC9zdHlsZT4KPHRpdGxlPmxvZ288L3RpdGxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNODQuMSw1MS4zTDc2LjcsMzVMNjQuMyw0OGw2LjgsMS4xYy0yLjMsMTYuMi0xNy4yLDI3LjQtMzMuNCwyNS4xUzEwLjMsNTcsMTIuNiw0MC45UzI5LjgsMTMuNSw0NiwxNS43CgljNCwwLjYsNy44LDEuOSwxMS4yLDRjMS41LDEsMy41LDAuNiw0LjQtMC44YzAuNC0wLjUsMC42LTEuMiwwLjYtMS44YzAtMS4xLTAuNi0yLjEtMS41LTIuN2wtMC4xLTAuMWMtMTctMTAuMy0zOS4xLTUtNDkuNCwxMgoJcy01LDM5LjEsMTIsNDkuNHMzOS4xLDUsNDkuNC0xMmMyLjUtNC4xLDQuMi04LjcsNC45LTEzLjVMODQuMSw1MS4zeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNzMuMSwyNi45YzAsMi4yLTEuOCw0LTQsNHMtNC0xLjgtNC00czEuOC00LDQtNFM3My4xLDI0LjcsNzMuMSwyNi45Ii8+Cjwvc3ZnPgo="

/***/ }),

/***/ 1246:
/***/ (function(module, exports) {

	module.exports = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMzAgNDIiPjxkZWZzPjxzdHlsZT4uYXtmaWxsOiMwMDkyZDM7fTwvc3R5bGU+PC9kZWZzPjxwYXRoIGNsYXNzPSJhIiBkPSJNMzcsMjMuNjlsLTMuMTYtNy01LjI2LDUuNTQsMi44OC40OWExMi41NiwxMi41NiwwLDEsMS01LjkxLTEyLjUsMS4zNywxLjM3LDAsMCwwLC43NS4yMkExLjM2LDEuMzYsMCwwLDAsMjcsOGwtLjA2LDBhMTUuMjcsMTUuMjcsMCwxLDAsNy4xNywxNS4yNloiLz48cGF0aCBjbGFzcz0iYSIgZD0iTTMyLjI3LDEzLjMxYTEuNjksMS42OSwwLDEsMS0xLjY5LTEuNywxLjY5LDEuNjksMCwwLDEsMS42OSwxLjciLz48cGF0aCBjbGFzcz0iYSIgZD0iTTkwLjc0LDI2LjkzVjEyLjUxaC0xLjZWMjYuNjljMCwzLDEuNTgsNC42OSw0LjMxLDQuNjlsLjU1LDBWMjkuOWwtLjU2LDBjLTItLjA2LTIuNjYtMS4zNC0yLjctMi45NSIvPjxwYXRoIGNsYXNzPSJhIiBkPSJNMTAyLjA4LDE3Ljc2YTYuOTEsNi45MSwwLDAsMCwwLDEzLjgxLDYuOCw2LjgsMCwwLDAsNS40NS0zLjJ2M0gxMDlsMC02Ljc0YTYuOTIsNi45MiwwLDAsMC02LjkzLTYuODltMCwxMi4yNGE1LjM0LDUuMzQsMCwxLDEsNS4zNC01LjM0QTUuMzQsNS4zNCwwLDAsMSwxMDIuMDgsMzAiLz48cmVjdCBjbGFzcz0iYSIgeD0iNzguNjgiIHk9IjIzLjkiIHdpZHRoPSI1LjkyIiBoZWlnaHQ9IjEuNzIiLz48cGF0aCBjbGFzcz0iYSIgZD0iTTExOS4zOSwxNy43NmE2LjA3LDYuMDcsMCwwLDAtNS4zNiwyLjlWMTIuODloLTEuNXYxOC41SDExNFYyOC41NGE2LjEyLDYuMTIsMCwwLDAsNS4zNiwzLDYuOTEsNi45MSwwLDAsMCwwLTEzLjgxbTAsMTIuMjRhNS4zNCw1LjM0LDAsMSwxLDUuMzQtNS4zNEE1LjM0LDUuMzQsMCwwLDEsMTE5LjM3LDMwIi8+PHBhdGggY2xhc3M9ImEiIGQ9Ik03NC41MSwyNC42MmE2LjkyLDYuOTIsMCwwLDAtMTMuODMsMCw2Ljg3LDYuODcsMCwwLDAsNi45LDYuOTJBNy4yMiw3LjIyLDAsMCwwLDc0LDI3Ljc5SDcyYTUuNDcsNS40NywwLDAsMS00LjQ0LDIuMTFjLTIuNjUsMC01LTEuNTgtNS4zMi00LjI4SDc0LjQxYTYuNjUsNi42NSwwLDAsMCwuMS0xWm0tNi45My01LjNhNS4zNSw1LjM1LDAsMCwxLDUuMjcsNC41MUg2Mi4zMWE1LjM0LDUuMzQsMCwwLDEsNS4yNy00LjUxIi8+PHBhdGggY2xhc3M9ImEiIGQ9Ik01OC43NSwxOC4zMmMwLTMuNDItMi4yOC02LjA1LTYuMTgtNi4xOEg0NlYzMS4zOWgxLjU5VjI0LjVoNC41YS40Ny40NywwLDAsMSwuMzguMThjLjE1LjI1LDAsLjA2LDQuMzIsNi43MUg1OC43bC00LjUzLTYuOTVjMC0uMDUtLjA2LS4xLDAtLjEyYTUuODksNS44OSwwLDAsMCw0LjU4LTZNNDcuNjMsMTMuNmg0LjQ4YzMuNzMuMDksNS4xMiwyLjIzLDUuMTIsNC43MSwwLDIuNjQtMS43NCw0LjU1LTUsNC42SDQ3LjY1WiIvPjwvc3ZnPgo="

/***/ }),

/***/ 708:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _Container = __webpack_require__(75);
	
	var _Container2 = _interopRequireDefault(_Container);
	
	var _Text = __webpack_require__(41);
	
	var _Text2 = _interopRequireDefault(_Text);
	
	var _BackgroundImage = __webpack_require__(65);
	
	var _BackgroundImage2 = _interopRequireDefault(_BackgroundImage);
	
	var _withResponsive = __webpack_require__(207);
	
	var _withResponsive2 = _interopRequireDefault(_withResponsive);
	
	var _partners = __webpack_require__(1248);
	
	var _partners2 = _interopRequireDefault(_partners);
	
	var _partnersMobile = __webpack_require__(1247);
	
	var _partnersMobile2 = _interopRequireDefault(_partnersMobile);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	var Partners = function Partners(_ref) {
	  var browser = _ref.browser,
	      props = _objectWithoutProperties(_ref, ['browser']);
	
	  var isMobile = browser.lessThan.sm;
	  return _react2.default.createElement(
	    _Container2.default,
	    _extends({ textAlign: 'center', py: '2em' }, props),
	    _react2.default.createElement(
	      _Text2.default.h2,
	      { f: '2em', color: 'blue' },
	      '\u5546\u696D\u53CA\u5408\u4F5C\u5925\u4F34'
	    ),
	    _react2.default.createElement(
	      _Text2.default,
	      { my: '1em' },
	      '\u6211\u5011\u66FE\u7D93\u5408\u4F5C\u904E\u7684\u5925\u4F34\uFF0C\u611F\u8B1D\u4ED6\u5011\u7684\u5E6B\u52A9'
	    ),
	    _react2.default.createElement(_BackgroundImage2.default, {
	      my: '3em',
	      src: isMobile ? _partnersMobile2.default : _partners2.default,
	      ratio: isMobile ? 542 / 751 : 300 / 1280
	    })
	  );
	};
	
	exports.default = (0, _withResponsive2.default)(Partners);
	module.exports = exports['default'];

/***/ }),

/***/ 1247:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/partners-mobile.b309dd53.png";

/***/ }),

/***/ 1248:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "static/partners.3e2b1423.png";

/***/ }),

/***/ 207:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _reactRedux = __webpack_require__(159);
	
	exports.default = function (WrappedComp) {
	  return (0, _reactRedux.connect)(function (state) {
	    return { browser: state.get('browser') };
	  })(WrappedComp);
	};
	
	module.exports = exports['default'];

/***/ }),

/***/ 721:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactScroll = __webpack_require__(230);
	
	var _Box = __webpack_require__(4);
	
	var _Box2 = _interopRequireDefault(_Box);
	
	var _ElevatorButton = __webpack_require__(687);
	
	var _ElevatorButton2 = _interopRequireDefault(_ElevatorButton);
	
	var _MobileElevatorButton = __webpack_require__(688);
	
	var _MobileElevatorButton2 = _interopRequireDefault(_MobileElevatorButton);
	
	var _Intro = __webpack_require__(707);
	
	var _Intro2 = _interopRequireDefault(_Intro);
	
	var _Partners = __webpack_require__(708);
	
	var _Partners2 = _interopRequireDefault(_Partners);
	
	var _Desktop = __webpack_require__(694);
	
	var _Desktop2 = _interopRequireDefault(_Desktop);
	
	var _Mobile = __webpack_require__(700);
	
	var _Mobile2 = _interopRequireDefault(_Mobile);
	
	var _withResponsive = __webpack_require__(207);
	
	var _withResponsive2 = _interopRequireDefault(_withResponsive);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Page = function (_React$PureComponent) {
	  _inherits(Page, _React$PureComponent);
	
	  function Page() {
	    var _temp, _this, _ret;
	
	    _classCallCheck(this, Page);
	
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$PureComponent.call.apply(_React$PureComponent, [this].concat(args))), _this), _this.state = {
	      elevatorVisible: false,
	      currentFloor: '5'
	    }, _this.handleSetActiveFloor = function (nextFloor) {
	      var currentFloor = _this.state.currentFloor;
	
	      if (nextFloor !== currentFloor) {
	        var newState = { currentFloor: nextFloor };
	        if (currentFloor === '5' && nextFloor === '4') newState.elevatorVisible = true;
	        if (currentFloor === 'B2' && nextFloor === 'B1') newState.elevatorVisible = true;
	        if (currentFloor === '4' && nextFloor === '5') newState.elevatorVisible = false;
	        if (currentFloor === 'B1' && nextFloor === 'B2') newState.elevatorVisible = false;
	        _this.setState(newState);
	      }
	    }, _temp), _possibleConstructorReturn(_this, _ret);
	  }
	
	  Page.prototype.render = function render() {
	    var browser = this.props.browser;
	    var _state = this.state,
	        elevatorVisible = _state.elevatorVisible,
	        currentFloor = _state.currentFloor;
	
	    var Floors = browser.greaterThan.xs ? _Desktop2.default : _Mobile2.default;
	    var ElevatorButton = browser.greaterThan.xs ? _ElevatorButton2.default : _MobileElevatorButton2.default;
	    return _react2.default.createElement(
	      _Box2.default,
	      { overflow: 'hidden' },
	      _react2.default.createElement(
	        _reactScroll.Element,
	        { name: '5' },
	        _react2.default.createElement(_Intro2.default, null)
	      ),
	      _react2.default.createElement(Floors, { currentFloor: currentFloor }),
	      _react2.default.createElement(
	        _reactScroll.Element,
	        { name: 'B2' },
	        _react2.default.createElement(_Partners2.default, null)
	      ),
	      _react2.default.createElement(ElevatorButton, {
	        visible: elevatorVisible,
	        currentFloor: currentFloor,
	        onSetActiveFloor: this.handleSetActiveFloor
	      })
	    );
	  };
	
	  return Page;
	}(_react2.default.PureComponent);
	
	exports.default = (0, _withResponsive2.default)(Page);
	module.exports = exports['default'];

/***/ }),

/***/ 727:
/***/ (function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	
	function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var FetchBase64 = function () {
	  function FetchBase64(url) {
	    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { shims: { fetch: undefined, fileReader: undefined } };
	
	    _classCallCheck(this, FetchBase64);
	
	    this.url = url;
	    this.fetchFn = opts.shims.fetch || typeof window !== 'undefined' && window.fetch.bind(window);
	    if (!this.fetchFn) {
	      throw new Error('Unable to find fetch function in the browser or in a shim');
	    }
	
	    this.fileReaderFn = opts.shims.fileReader || typeof window !== 'undefined' && window.FileReader.bind(window);
	    if (!this.fileReaderFn) {
	      throw new Error('Unable to find FileReader class in browser or as a shim');
	    }
	  }
	
	  FetchBase64.prototype.fetch = function () {
	    var _ref = _asyncToGenerator(function* () {
	      var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	      var opts = arguments[1];
	
	      var _url = this.url || url;
	      var base64data = void 0;
	      try {
	        base64data = yield this._fetch(url, opts);
	      } catch (e) {
	        throw new Error(e);
	      }
	
	      var trim = base64data.split(',', 2);
	      if (trim && trim[1]) {
	        return trim[1];
	      } else {
	        return new Error('Result did not return a base64 data object');
	      }
	    });
	
	    function fetch() {
	      return _ref.apply(this, arguments);
	    }
	
	    return fetch;
	  }();
	
	  FetchBase64.prototype.fetchAsData = function () {
	    var _ref2 = _asyncToGenerator(function* () {
	      var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	      var opts = arguments[1];
	
	      var _url = this.url || url;
	      var base64data = yield this._fetch(_url, opts, true);
	      return base64data;
	    });
	
	    function fetchAsData() {
	      return _ref2.apply(this, arguments);
	    }
	
	    return fetchAsData;
	  }();
	
	  FetchBase64.prototype._fetch = function () {
	    var _ref3 = _asyncToGenerator(function* (url, opts) {
	      var keepAsData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
	
	      if (!url) {
	        throw new Error('no url is provided');
	      }
	
	      var response = yield this.fetchFn(url, opts);
	
	      if (response.ok) {
	        var blob = yield response.blob();
	        var reader = new this.fileReaderFn();
	        reader.readAsDataURL(blob);
	
	        return new Promise(function (resolve, reject) {
	          reader.addEventListener('load', function () {
	            var base64data = reader.result;
	            var img = new Image();
	            img.onload = function () {
	              resolve({
	                dataurl: base64data,
	                width: img.width,
	                height: img.height
	              });
	            };
	            img.src = base64data;
	          }, { once: true });
	          reader.addEventListener('error', function (error) {
	            reject(error);
	          }, { once: true });
	        });
	      } else {
	        throw new Error(response.status);
	      }
	    });
	
	    function _fetch(_x4, _x5) {
	      return _ref3.apply(this, arguments);
	    }
	
	    return _fetch;
	  }();
	
	  return FetchBase64;
	}();
	
	exports.default = FetchBase64;
	module.exports = exports['default'];

/***/ })

});
//# sourceMappingURL=component---src-pages-index-js-788e5878f070482911ce.js.map
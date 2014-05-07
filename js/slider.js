/**
 * @author sazs
 */
function BeaverSlider(d) {
	var b = this;
	this.settings = d;
	this.settings.animation.messageAnimationDuration = this.settings.animation.messageAnimationDuration || 800;
	for ( i = 0; i < d.content.images.length; i++) {
		var a = new Image();
		a.onload = function() {
			b.imagesLoaded++
		};
		a.src = d.content.images[i]
	}
	var c = jQuery("#" + this.settings.structure.container.id);
	if (!c.size()) {
		c = jQuery(this.settings.structure.container.selector)
	}
	c.css({
		width : "100%"
	});
	this.container = jQuery("<div>").appendTo(c);
	this.areaMain = null;
	this.areaEffects = null;
	this.areaEffectsTemplate = null;
	this.areaStatus = null;
	this.areaWidgets = null;
	this.areaMessage = null;
	this.areaPlayer = null;
	this.imagesLoaded = 0;
	this.currentImage = 0;
	this.currentMessage = 0;
	this.currentBackground = null;
	this.nextEffect = null;
	this.stopped = false;
	this.animationNow = false;
	this.playerFadeNow = false;
	this.cells = null;
	this.currentEffect = null;
	this.run = null;
	this.messagesAnimationCounter = null;
	this.insideOfBeaverHouse = false;
	this.ignoreByBeaverHouse = false;
	this.initialize = function() {
		this.constructAreaMain();
		this.constructAreaStatus();
		this.initEffects();
		if (this.settings.animation.runOnInit != false) {
			this.startSliding(true)
		}
	};
	this.initEffects = function() {
		this.effects = [{
			id : 37,
			group : "slideOver",
			name : "slideOverLeft",
			duration : 1000,
			size : null,
			steps : null,
			run : this.slideOverLeft
		}, {
			id : 38,
			group : "slideOver",
			name : "slideOverRight",
			duration : 1000,
			size : null,
			steps : null,
			run : this.slideOverRight
		}, {
			id : 39,
			group : "slideOver",
			name : "slideOverUp",
			duration : 1000,
			size : null,
			steps : null,
			run : this.slideOverUp
		}, {
			id : 40,
			group : "slideOver",
			name : "slideOverDown",
			duration : 1000,
			size : null,
			steps : null,
			run : this.slideOverDown
		}];
		this.userEffects = new Array();
		if (this.settings.animation.effects == "random") {
			this.userEffects = this.effects
		} else {
			var m = ( typeof this.settings.animation.effects == "string") ? this.settings.animation.effects.split(",") : this.settings.animation.effects;
			for ( i = 0; i < m.length; i++) {
				var f, h, g, e;
				if ( typeof m[i] == "string") {
					m[i] = m[i].split(":");
					f = jQuery.trim(m[i][0]);
					h = jQuery.trim(m[i][1]);
					g = jQuery.trim(m[i][2]);
					e = jQuery.trim(m[i][3])
				} else {
					f = jQuery.trim(m[i].name);
					h = jQuery.trim(m[i].duration);
					g = jQuery.trim(m[i].size);
					e = jQuery.trim(m[i].steps)
				}
				for ( j = 0; j < this.effects.length; j++) {
					if (this.effects[j].group.toLowerCase() == f.toLowerCase() || this.effects[j].name.toLowerCase() == f.toLowerCase()) {
						this.userEffects.push({
							id : this.effects[j].id,
							group : this.effects[j].group,
							name : this.effects[j].name,
							duration : (h) ? h : this.effects[j].duration,
							size : (g) ? g : this.effects[j].size,
							steps : (e) ? e : this.effects[j].steps,
							run : this.effects[j].run
						})
					}
				}
			}
		}
		this.currentBackground = "url(" + this.settings.content.images[0] + ")"
	};
	this.constructAreaMain = function() {
		this.areaMain = jQuery("<div>").css({
			overflow : "hidden",
			width : this.settings.structure.container.width,
			height : this.settings.structure.container.height,
			background : "url(" + this.settings.content.images[this.currentImage] + ")  no-repeat"
		})

		this.areaEffects = jQuery("<div>").css({
			width : this.settings.structure.container.width,
			height : this.settings.structure.container.height,
			position : "absolute",
			left : 0,
			top : 0,
			overflow : "hidden",
			"z-index" : 90
		});
		this.areaEffectsTemplate = this.areaEffects.clone();
		this.areaWidgets = jQuery("<div>").css({
			width : this.settings.structure.container.width,
			height : this.settings.structure.container.height,
			position : "absolute",
			left : 0,
			top : 0,
			"z-index" : 100,
			background : "url(about:blank)"
		}).hover(function() {
			if (b.playerFadeNow) {
				return
			}
			jQuery(this).find("div[show='mouseover']").fadeIn(400)
		}, function() {
			b.playerFadeNow = true;
			jQuery(this).find("div[show='mouseover']").fadeOut(400, function() {
				b.playerFadeNow = false
			})
		}).click(function(e) {
			if ((jQuery(e.target)[0] === b.areaWidgets[0] || jQuery(e.target)[0] === b.areaWidgets.children()[0]) && b.settings.events && b.settings.events.imageClick) {
				b.settings.events.imageClick(b)
			}
		});
		this.container.attr({
			engine : "PersonalSlider",
		}).css({
			position : "relative"
		}).append(this.areaMain, this.areaWidgets, this.areaEffects)
	};
	this.constructAreaStatus = function() {
		if (this.settings.structure.controls) {
			this.areaStatus = jQuery("<div>").append(jQuery("<div>").addClass(this.settings.structure.controls.containerClass));
			for ( i = 0; i < this.settings.content.images.length; i++) {
				var e = (this.settings.structure.controls.previewMode) ? jQuery("<img>").attr("src", this.settings.content.images[i]) : null;
				this.areaStatus.children("div").append(jQuery("<div>").addClass(this.settings.structure.controls.elementClass).attr("inarray", i).click(function() {
					b.renderImage(jQuery(this).attr("inarray"))
				}).append(e))
			}
			this.container.append(this.areaStatus);
			this.updateStatus()
		}
	};
	this.renderImage = function(e) {
		this.stopSliding(parseInt(e))
	};
	this.setNextEffect = function(e) {
		this.nextEffect = e
	};
	this.startSliding = function(e) {
		this.stopped = false;
		this.ignoreByBeaverHouse = false;
		if (e) {
			setTimeout(function() {
				if (b.settings.animation.waitAllImages) {
					if (b.imagesLoaded == b.settings.content.images.length) {
						b.animateAutomatically(true)
					} else {
						b.startSliding(true)
					}
				} else {
					b.animateAutomatically(true)
				}
			}, this.settings.animation.initialInterval ? this.settings.animation.initialInterval : this.settings.animation.interval)
		} else {
			this.animateAutomatically()
		}

	};
	this.stopSliding = function(e, f) {
		this.stopped = true;
		if (!f) {
			this.ignoreByBeaverHouse = true
		}
		if (this.areaPlayer) {
			this.areaPlayer.children("div:eq(1)").hide();
			this.areaPlayer.children("div:eq(2)").show()
		}
		if (this.animationNow) {
			return
		}
		if (e || e === 0) {
			this.currentImage = e;
			this.updateStatus();
			this.animateCurrent(function() {
			})
		}
	};
	this.drawCells = function(n, m) {
		this.cells = new Array();
		var g = Math.floor(this.settings.structure.container.width / n), p = Math.floor(this.settings.structure.container.height / m), o = this.settings.structure.container.width % n, q = this.settings.structure.container.height % m, h = 0, r = 0;
		for ( i = 0; i < m; i++) {
			for ( j = 0; j < n; j++) {
				var e = g + ((o > j) ? 1 : 0), f = p + ((q > i) ? 1 : 0), l = h + "px " + r + "px";
				this.areaEffects.append(jQuery("<div>").css({
					width : e + "px",
					height : f + "px",
					"float" : "left",
					margin : 0,
					overflow : "hidden",
					visibility : "hidden",
					position : "relative"
				}).attr({
					chessboardx : j,
					chessboardy : i
				}).append(jQuery("<div>").css({
					width : e + "px",
					height : f + "px",
					overflow : "hidden",
					visibility : "hidden",
					position : "absolute",
					background : "url(" + this.settings.content.images[this.currentImage] + ") " + l + " no-repeat"
				})));
				h = (j == n - 1) ? 0 : (h - e)
			}
			r -= f
		}
	};
	this.clearAreaEffects = function() {
		this.currentBackground = "url(" + this.settings.content.images[this.currentImage] + ")";
		this.areaMain.css("background-image", "url(" + this.settings.content.images[this.currentImage] + ")");
		var e = this.areaEffects;
		this.areaEffects = this.areaEffectsTemplate.clone().appendTo(this.container);
		setTimeout(function() {
			e.remove()
		}, 50)
	};

	this.updateStatus = function() {
		if (!this.areaStatus) {
			return
		}
		setTimeout(function() {
			b.areaStatus.children("div").children("div").removeClass(b.settings.structure.controls.elementActiveClass).addClass(b.settings.structure.controls.elementClass).eq(b.currentImage).removeClass(b.settings.structure.controls.elementClass).addClass(b.settings.structure.controls.elementActiveClass)
		}, 1)
	};
	this.nextImage = function() {
		this.currentImage = (this.currentImage == this.settings.content.images.length - 1) ? 0 : (this.currentImage + 1);
		this.updateStatus()
	};

	this.slideOverLeft = function(g) {
		this.drawCells(1, 1);
		this.areaEffects.find("div").css("visibility", "visible");
		var e = this.areaEffects.children(), f = e.children().css({
			left : this.settings.structure.container.width + "px",
			opacity : 0
		});
		f.animate({
			left : 0,
			opacity : 1
		}, parseInt(this.currentEffect.duration), function() {
			b.clearAreaEffects();
			g()
		})
	};
	this.slideOverRight = function(g) {
		this.drawCells(1, 1);
		this.areaEffects.find("div").css("visibility", "visible");
		var e = this.areaEffects.children(), f = e.children().css({
			left : -this.settings.structure.container.width + "px",
			opacity : 0
		});
		f.animate({
			left : 0,
			opacity : 1
		}, parseInt(this.currentEffect.duration), function() {
			b.clearAreaEffects();
			g()
		})
	};
	this.slideOverUp = function(g) {
		this.drawCells(1, 1);
		this.areaEffects.find("div").css("visibility", "visible");
		var e = this.areaEffects.children(), f = e.children().css({
			top : this.settings.structure.container.width + "px",
			opacity : 0
		});
		f.animate({
			top : 0,
			opacity : 1
		}, parseInt(this.currentEffect.duration), function() {
			b.clearAreaEffects();
			g()
		})
	};
	this.slideOverDown = function(g) {
		this.drawCells(1, 1);
		this.areaEffects.find("div").css("visibility", "visible");
		var e = this.areaEffects.children(), f = e.children().css({
			top : -this.settings.structure.container.width + "px",
			opacity : 0
		});
		f.animate({
			top : 0,
			opacity : 1
		}, parseInt(this.currentEffect.duration), function() {
			b.clearAreaEffects();
			g()
		})
	};
	this.fadeOut = function(e) {
		this.drawCells(1, 1);
		this.areaEffects.find("div").css("visibility", "visible");
		this.areaEffects.children("div").fadeOut(0).fadeIn(parseInt(this.currentEffect.duration), function() {
			b.clearAreaEffects();
			e()
		})
	};
	this.animateAutomatically = function(e) {
		if (this.stopped) {
			return
		}
		if (!e) {
			this.nextImage()
		}
		this.animateCurrent(function() {
			setTimeout(function() {
				b.animateAutomatically()
			}, b.settings.animation.interval)
		})
	};
	this.animateCurrent = function(e) {
		if (this.animationNow) {
			return
		}
		if (b.settings.events && this.settings.events.beforeSlide) {
			this.settings.events.beforeSlide(b)
		}
		if (this.nextEffect) {
			for ( i = 0; i < this.effects.length; i++) {
				if (this.effects[i].name == this.nextEffect.name) {
					this.currentEffect = {
						id : this.effects[i].id,
						group : this.effects[i].group,
						name : this.effects[i].name,
						duration : (this.nextEffect.duration) ? this.nextEffect.duration : this.effects[i].duration,
						size : (this.nextEffect.size) ? this.nextEffect.size : this.effects[i].size,
						steps : (this.nextEffect.steps) ? this.nextEffect.steps : this.effects[i].steps,
						run : this.effects[i].run
					};
					break
				}
			}
			this.nextEffect = null
		} else {
			if (this.settings.type == "carousel") {
				this.currentEffect = this.userEffects[0]
			} else {
				this.currentEffect = this.userEffects[Math.floor(Math.random() * this.userEffects.length)]
			}
		}
		this.run = this.currentEffect.run;
		this.animationNow = true;
		if (b.settings.events && this.settings.events.afterSlideStart) {
			this.settings.events.afterSlideStart(b)
		}
		this.run(function() {
			b.animationNow = false;
			if (b.settings.events && b.settings.events.beforeSlideEnd) {
				b.settings.events.beforeSlideEnd(b)
			}
			if (e) {
				e()
			}
			if (b.settings.events && b.settings.events.afterSlide) {
				b.settings.events.afterSlide(b)
			}
		});
		if (b.settings.events && this.settings.events.beforeMessageChange) {
			this.settings.events.beforeMessageChange(b)
		}
		if (b.settings.events && this.settings.events.afterMessageChange) {
			this.settings.events.afterMessageChange(b)
		}
	};
	if (b.settings.events && this.settings.events.beforeInitialize) {
		this.settings.events.beforeInitialize(b)
	}
	this.initialize();
	if (b.settings.events && this.settings.events.afterInitialize) {
		this.settings.events.afterInitialize(b)
	}
}

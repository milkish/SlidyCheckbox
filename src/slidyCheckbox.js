(function() {
  var $, SlidyCheckbox, defaults, oldAnim, oldCurCSS, pluginName, toArray,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = window.jQuery;

  pluginName = 'slidyCheckbox';

  defaults = {
    image: "slidyCheckbox.png",
    speed: 300,
    className: "slidyCheckbox"
  };

  SlidyCheckbox = (function() {

    function SlidyCheckbox(element, options) {
      var key, value, _ref;
      this.element = element;
      this.onMousedown = __bind(this.onMousedown, this);
      this.onFocusOut = __bind(this.onFocusOut, this);
      this.onFocus = __bind(this.onFocus, this);
      this.onSlidyClick = __bind(this.onSlidyClick, this);
      this.onCheckboxChange = __bind(this.onCheckboxChange, this);
      this.onImageReady = __bind(this.onImageReady, this);
      this.$elm = $(this.element);
      this.options = $.extend({}, defaults, options);
      _ref = this.options;
      for (key in _ref) {
        value = _ref[key];
        this[key] = value;
      }
      if (this.orientation) this.orientation.toLowerCase();
      this.init();
    }

    SlidyCheckbox.prototype.isDisabled = function() {
      return this.$elm.is(':disabled');
    };

    SlidyCheckbox.prototype.init = function() {
      this.$elm.css({
        opacity: 0
      });
      this.img = document.createElement('img');
      this.$elm.wrap("<div class=\"" + this.className + "\" >");
      this.$slidy = this.$elm.parent();
      this.$slidy.css({
        overflow: "hidden",
        display: "inline-block",
        "background-image": "url(" + this.image + ")"
      });
      this.img.src = this.image;
      return this.img.onload = this.onImageReady;
    };

    SlidyCheckbox.prototype.onImageReady = function() {
      var _ref, _ref2;
      this.hei = this.img.height;
      this.wid = this.img.width;
      if (!this.orientation) {
        this.orientation = this.hei > this.wid ? "checkedonbottom" : "checkedonleft";
      }
      this.thumb_offset = this.thumb ? this.thumb / 2 : 0;
      if ((_ref = this.orientation) === "checkedonbottom" || _ref === "checkedontop") {
        this.$slidy.css({
          width: this.wid,
          height: this.hei / 2 + this.thumb_offset
        });
      } else {
        this.$slidy.css({
          width: this.wid / 2 + this.thumb_offset,
          height: this.hei
        });
      }
      this.positions = {};
      _ref2 = (function() {
        switch (this.orientation) {
          case "checkedonbottom":
            return [
              {
                "backgroundPosition": "0 " + (-this.hei / 2 + this.thumb_offset) + "px"
              }, {
                "backgroundPosition": "0 0"
              }
            ];
          case "checkedontop":
            return [
              {
                "top": 0
              }, {
                "top": -this.hei / 2 + this.thumb_offset
              }
            ];
          case "checkedonright":
            return [
              {
                "left": -this.wid / 2 + this.thumb_offset
              }, {
                "left": 0
              }
            ];
          case "checkedonleft":
            return [
              {
                "backgroundPosition": "0 0"
              }, {
                "backgroundPosition": "" + (-this.wid / 2 + this.thumb_offset) + "px 0"
              }
            ];
        }
      }).call(this), this.positions[true] = _ref2[0], this.positions[false] = _ref2[1];
      this.$elm.on("change", this.onCheckboxChange);
      this.$elm.on("focus", this.onFocus);
      this.$elm.on("focusout", this.onFocusOut);
      this.$slidy.on("click", this.onSlidyClick);
      this.$slidy.on("mousedown", this.onMousedown);
      return this.onCheckboxChange.call(this.element, null, -1);
    };

    SlidyCheckbox.prototype.onCheckboxChange = function(e, speed) {
      if (this.isDisabled()) {
        this.$slidy.css({
          "opacity": .6
        });
      } else {
        this.$slidy.css({
          "opacity": 1
        });
      }
      this.$slidy.toggleClass("checked", this.element.checked);
      return this.$slidy.stop().animate(this.positions[this.element.checked], speed || this.speed);
    };

    SlidyCheckbox.prototype.onSlidyClick = function(e) {
      if (e.eventPhase !== 3) {
        if (this.isDisabled()) {
          this.$elm.trigger("disabledClick");
          if (this.disabledCallback) return this.disabledCallback();
        } else {
          if (this.element.checked) {
            this.$elm.removeAttr("checked");
          } else {
            this.$elm.attr("checked", true);
          }
          this.$elm.focus();
          return this.$elm.change();
        }
      }
    };

    SlidyCheckbox.prototype.onFocus = function() {
      if (this.focusIn) return this.focusIn.call(this.$slidy);
    };

    SlidyCheckbox.prototype.onFocusOut = function() {
      if (this.focusOut) return this.focusOut.call(this.$slidy);
    };

    SlidyCheckbox.prototype.onMousedown = function(e) {
      if (e.eventPhase === 2) return false;
    };

    return SlidyCheckbox;

  })();

  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        return $.data(this, 'plugin_' + pluginName, new SlidyCheckbox(this, options));
      }
    });
  };

  if (!document.defaultView || !document.defaultView.getComputedStyle) {
    oldCurCSS = $.curCSS;
    $.curCSS = function(elem, name, force) {
      var style;
      if (name === 'background-position') name = 'backgroundPosition';
      if (name !== 'backgroundPosition' || !elem.currentStyle || elem.currentStyle[name]) {
        return oldCurCSS.apply(this, arguments);
      }
      style = elem.style;
      if (!force && style && style[name]) return style[name];
      return oldCurCSS(elem, 'backgroundPositionX', force)(+' ' + oldCurCSS(elem, 'backgroundPositionY', force));
    };
  }

  oldAnim = $.fn.animate;

  $.fn.animate = function(prop) {
    if (__indexOf.call(prop, 'background-position') >= 0) {
      prop.backgroundPosition = prop['background-position'];
      delete prop['background-position'];
    }
    if (__indexOf.call(prop, 'backgroundPosition') >= 0) {
      prop.backgroundPosition = '(' + prop.backgroundPosition;
    }
    return oldAnim.apply(this, arguments);
  };

  toArray = function(strg) {
    var res;
    strg = strg.replace(/left|top/g, '0px');
    strg = strg.replace(/right|bottom/g, '100%');
    strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g, "$1px$2");
    res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
    return [parseFloat(res[1], 10), res[2], parseFloat(res[3], 10), res[4]];
  };

  $.fx.step.backgroundPosition = function(fx) {
    var end, nowPosX, start;
    if (!fx.bgPosReady) {
      start = $.curCSS(fx.elem, 'backgroundPosition');
      if (!start) start = '0px 0px';
      start = toArray(start);
      fx.start = [start[0], start[2]];
      end = toArray(fx.end);
      fx.end = [end[0], end[2]];
      fx.unit = [end[1], end[3]];
      fx.bgPosReady = true;
    }
    nowPosX = [];
    nowPosX[0] = ((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0] + fx.unit[0];
    nowPosX[1] = ((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1] + fx.unit[1];
    return fx.elem.style.backgroundPosition = nowPosX[0] + ' ' + nowPosX[1];
  };

}).call(this);

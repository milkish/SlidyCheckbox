$ = window.jQuery

pluginName = 'slidyCheckbox'

defaults =
  image: "slidyCheckbox.png"
  speed: 300
  className: "slidyCheckbox"
  # focusIn: ->
  #   $(this).css
  #     "box-shadow": "0 0 3px red"
  # focusOut: ->
  #   $(this).css
  #     "box-shadow": ""

class SlidyCheckbox
  constructor: (@element, options) ->
    @$elm    = $ @element
    @options = $.extend {}, defaults, options
    @[key]   = value for key, value of @options

    @orientation.toLowerCase() if @orientation

    @init()

  isDisabled: -> @$elm.is(':disabled')

  init: ->
    @$elm.css
      opacity: 0

    # create the slidy image
    @img  = document.createElement('img')

    # create slidy node
    @$elm.wrap "<div class=\"#{@className}\" >"
    @$slidy = @$elm.parent()

    # set slidy styles
    @$slidy.css
      overflow: "hidden"
      display: "inline-block"
      "background-image": "url(#{@image})"

    # pre-load the image
    @img.src = @image
    @img.onload = @onImageReady


  onImageReady: =>
    @hei = @img.height
    @wid = @img.width

    # determine slidy orientation
    unless @orientation
      @orientation = if @hei > @wid then "checkedonbottom" else "checkedonleft" 

    # calculate thumb offset
    @thumb_offset = if @thumb then @thumb/2 else 0

    # calculate slidy dimensions
    if @orientation in ["checkedonbottom","checkedontop"]
      @$slidy.css
        width:  @wid
        height: @hei/2 + @thumb_offset
    else
      @$slidy.css
        width:  @wid/2 +  @thumb_offset
        height: @hei

    # calculate animation positions
    @positions = {}
    [@positions[true], @positions[false]] = switch @orientation
      when "checkedonbottom" then [{"backgroundPosition":"0 #{-@hei/2 + @thumb_offset}px"}, {"backgroundPosition": "0 0"}]
      when "checkedontop"    then [{"top":0}, {"top":-@hei/2 + @thumb_offset}]
      when "checkedonright"  then [{"left":-@wid/2 + @thumb_offset}, {"left":0}]
      when "checkedonleft"   then [{"backgroundPosition": "0 0"}, {"backgroundPosition":"#{-@wid/2 + @thumb_offset}px 0"}]

    # setup events handlers
    @$elm.on        "change",    @onCheckboxChange
    @$elm.on         "focus",    @onFocus
    @$elm.on      "focusout",    @onFocusOut
    @$slidy.on       "click",    @onSlidyClick
    @$slidy.on   "mousedown",    @onMousedown

    # set initial slidy display state
    @onCheckboxChange.call @element, null, -1

  onCheckboxChange : (e,speed) =>
    if @isDisabled() then @$slidy.css("opacity":.6) else @$slidy.css("opacity":1)
    @$slidy.toggleClass("checked", @element.checked)
    @$slidy.stop().animate(@positions[@element.checked], (speed || @speed) )


  onSlidyClick : (e) =>
    if e.eventPhase != 3
      if @isDisabled()
        @$elm.trigger "disabledClick"
        @disabledCallback() if @disabledCallback
      else
        if @element.checked then @$elm.removeAttr("checked") else @$elm.attr("checked",true)
        @$elm.focus()
        @$elm.change()


  onFocus :    =>  @focusIn.call(@$slidy)  if @focusIn


  onFocusOut : =>  @focusOut.call(@$slidy) if @focusOut

  # prevents focus from being lost on multiple clicks
  onMousedown : (e) => return false if e.eventPhase == 2


# Add the plugin to jQuery
$.fn[pluginName] = ( options ) ->
  @each ->
    unless $.data this, 'plugin_' + pluginName
      $.data this, 'plugin_' + pluginName, new SlidyCheckbox( this, options )


##
## jQuery Background Position Plugin
## @author Alexander Farkas
## v. 1.22
##

if !document.defaultView || !document.defaultView.getComputedStyle  # IE6-IE8
    oldCurCSS = $.curCSS
    $.curCSS = (elem, name, force) ->
      if name == 'background-position'
        name = 'backgroundPosition'

      if name != 'backgroundPosition' || !elem.currentStyle || elem.currentStyle[ name ]
        return oldCurCSS.apply this, arguments

      style = elem.style
      if !force && style && style[ name ] 
        return style[ name ]

      oldCurCSS(elem, 'backgroundPositionX', force) +' '+ oldCurCSS(elem, 'backgroundPositionY', force)
  
oldAnim = $.fn.animate
$.fn.animate = (prop) ->
  if 'background-position' in prop
    prop.backgroundPosition = prop['background-position']
    delete prop['background-position']

  if 'backgroundPosition' in prop
    prop.backgroundPosition = '('+ prop.backgroundPosition

  oldAnim.apply this, arguments

toArray = (strg) ->
  strg = strg.replace(/left|top/g,'0px')
  strg = strg.replace(/right|bottom/g,'100%')
  strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g,"$1px$2")
  res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/)
  [parseFloat(res[1],10),res[2],parseFloat(res[3],10),res[4]]

$.fx.step.backgroundPosition = (fx) ->
  if !fx.bgPosReady
    start = $.curCSS(fx.elem,'backgroundPosition')
    if !start #FF2 no inline-style fallback
      start = '0px 0px'
    
    start = toArray(start);
    fx.start = [start[0],start[2]];
    end = toArray(fx.end);
    fx.end = [end[0],end[2]];
    
    fx.unit = [end[1],end[3]];
    fx.bgPosReady = true;

  nowPosX = [];
  nowPosX[0] = ((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0] + fx.unit[0];
  nowPosX[1] = ((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1] + fx.unit[1];
  fx.elem.style.backgroundPosition = nowPosX[0]+' '+nowPosX[1];
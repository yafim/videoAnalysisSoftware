/*
* Responsive Side Toggle Menu (c) Dynamic Drive (www.dynamicdrive.com)
* Visit http://www.dynamicdrive.com/ for this script and 100s more.
* Requires: jQuery 1.7 or higher
*/

//** July 21st, 15'- Updated to v1.1,which adds multiple level ULs support inside toggle menu. Any nested UL inside menu will be auto transformed to an accordion

(function(w, $){

	var defaults = {
		position: 'left',
		pushcontent: true,
		source: 'inline',
		revealamt: 0,
		marginoffset: 0,
		dismissonclick: true,
		curstate: 'closed'
	}

	var menusarray = []

	w.sidetogglemenu = function(options){
		var s = $.extend({}, defaults, options)
		if ( !window.matchMedia ){ // if browser doesn't support media query detection via JavaScript
			s.pushcontent = false // disable revealing menu by pushing page content (as window.matchMedia is used in this case to restore BODY margins)
		}
		var thismenu = this,
				$body = $('body'),
				$menu = '',
				expandlength = ''
		menusarray.push( [this, s] )

		function buildulmenu($menu){
			var $submenus = $menu.find('ul').find('ul')
			$submenus.each(function(i){
				var $submenu = $(this).css('display', 'none')
				var $header = $submenu.parent()
				var $headerlink = $header.find('a:eq(0)')


					$headerlink.unbind('click').click(function(){
					$submenu.slideToggle();


					// console.log("SubMenu toggle");
					return false
				})
			})
		}

		function init(menuref){
			$menu = $(menuref).css({top: 0, visibility: 'hidden', zIndex: 1000}).prependTo(document.body)
			$menu.on('click', function(e){
				if (e.target.tagName != 'A'){
					e.stopPropagation()
					// console.log("Clicked on sideToggleMenu");
				}
			})
			buildulmenu($menu);
			// $smallscreentoggler.prependTo(document.body)
			var delta = parseInt($menu.outerWidth()) - s.revealamt
			// if ($smallscreentoggler.css('display') != 'block')
			// 	this.toggle(s.curstate, delta)
			$menu.css((s.position == 'left')? 'left' : 'right', -delta)
			$menu.css({visibility: 'visible'})
			return delta
		}

		this.getmenu = function(){
			return $menu
		}

		this.toggle = function(action, w){
			var delta = w || expandlength;
			s.curstate = action || ( (s.curstate == 'closed')? 'open' : 'closed' );
			// console.log("Menu state: " + s.curstate);
			// if ($menu.css('position') != 'static'){
				var animprop = (s.position == 'left')? 'left' : 'right';
				$menu.css(animprop, (s.curstate == 'open')? 0 : -delta);
				if (s.pushcontent === true){
					// $body.css(animprop, (s.curstate == 'open')? delta + s.marginoffset : 0)
					$body.css(animprop, 0);
				}
			// }
			// else{
			// 	// $smallscreentoggler.trigger('toggle', action)
			// }
		}

		if (s.pushcontent === true){
			$body.css({position: 'relative'})
		}

		if (s.source == 'inline'){
			expandlength = init.call(this, 'div#' + s.id)

		}
		else{
			$.ajax({
				url: s.source,
				dataType: 'html',
				error:function(ajaxrequest){
					alert('Error fetching content.<br />Server Response: '+ajaxrequest.responseText)
				},
				success:function(content){
					expandlength = init.call(thismenu, content)
				}
			})
		}

		return this
	}

	jQuery(function(){ // run once in document load
		
		$('body').on('click', function(e){ // dismiss menus onclick of BODY
			var $target = $(e.target)
			if (e.type == 'click' && !$target.hasClass('sideviewtoggle')){
				for (var i=0; i < menusarray.length; i++){
					if (menusarray[i][1].dismissonclick && menusarray[i][1].curstate == 'open'){
						menusarray[i][0].toggle('closed')
					}
				}
			}
		})
	})


}) (window, jQuery)
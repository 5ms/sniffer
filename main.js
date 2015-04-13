/*!
 * Web Sniffer v0.0.0.1 (http://5ms.ru/sniffer/)
 * Copyright 2014, 5MS
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 *
 * uglifyjs -b main.js > main.ug.js
 */

var options = {
		limit: 1000,
		autoscroll: true,
		remove: false
	},
	rows = {
		tid: ['Tab'],
		rid: 'Request ID',
		type: ['Type'],
		time: ['Time'],
		status: ['Status'],
		method: ['Method'],
		hostname: ['Hostname'],
		url: 'URL',
		request: 'Request Headers',
		response: 'Response Headers'
	},
	values = {
		requests: {},
		requests_all: 0,
		requests_visible: 0,
		filters: []
	};

$(function() {

	var a;

	for (a in options) {

		if (typeof options[a] == 'boolean') {

			$('.settings input[name="' + a + '"]').attr('checked', options[a]);

		} else {

			$('.settings input[name="' + a + '"]').val(options[a]);
		}
	}

	$('.settings .link').bind('click', function() {

		var setting = $(this).parent(),
			bottom = 0;

		if (parseInt(setting.css('bottom')) == 0) {

			bottom = -setting.height();
		}

		setting.animate({bottom: bottom});

	}).trigger('click');

	$('.settings .trash').bind('click', function() {

		$('.req').remove();

		$('.filter.fixed').trigger('size');

		$(window).scrollTop(0);

		$('.settings .count').html( '0' );
	});

	$('.settings').bind('refresh', function() {

		var style = '';

		$('.filter-rows input[type="checkbox"]:not(:checked)', this).each(function() {

			style += '.filter-' + $(this).attr('name') + ' {display: none !important;}';
			style += '.req > .' + $(this).attr('name') + ' {display: none !important;}';

		});

		$('style#settings').html(style);

		$('.filter.fixed').trigger('size');
	});


	$('[name="limit"]')
		.bind('keypress', function(e) {

			var key = window.event ? e.keyCode : e.which;

			if (e.keyCode == 8 || e.keyCode == 46
				|| e.keyCode == 37 || e.keyCode == 39) {
				return true;
			}
			else if ( key < 48 || key > 57 ) {

				return false;
			}
			return true;

		}).bind('change', function() {

			options['limit'] = parseInt($(this).val());
		});


/*	$('[name="autoscroll"]').bind('click', function() {

		options['autoscroll'] = $(this).is(':checked');
	});*/

	$('[type="checkbox"]').bind('click', function() {

		options[ $(this).attr('name') ] = $(this).is(':checked');
	});



	$('.dropdown-toggle').dropdown();

	var filter = $('.filter');

	for (a in rows) {

		$('.filter-rows').append(
			$('<label/>')
				.addClass('control-label col-lg-1 checkbox')
				.append(
					$('<input/>')
						.attr({
							'type': 'checkbox',
							'name': a,
							'value': '1',
							'checked': true
						})
						.bind('click', function() {

							$('.settings').trigger('refresh');
						})
				)
				.append( typeof rows[a] == 'object' ? rows[a][0] : rows[a] )
		);


		filter.append(
			$('<div/>')
				.addClass('filter-' + a)
		);

		if (typeof rows[a] == 'object') {

			$('.filter-' + a).html(

				$('<div/>')
					.addClass('btn-group')
					.append(
						$('<button/>')
							.addClass('btn btn-sm btn-default dropdown-toggle')
							.attr({
								'type': 'button',
								'data-toggle': 'dropdown'
							})
							.append(
								$('<span/>').addClass('glyphicon glyphicon-filter')
							)
							.append(
								rows[a][0]
							)
					)
					.append(
						$('<ul/>')
							.addClass('dropdown-menu dropdown-menu-form')
							.attr('role', 'menu')
							.attr('id', a)
							.append(
								$('<li/>')
									.addClass('checkbox')
									.append(
										$('<label/>')
											.append(
												$('<input/>')
													.attr({
														'type': 'checkbox',
														'name': 'all',
														'val': 'all',
														'checked': true
													})
											)
											.append('All')
											.append(
												$('<span/>')
													.attr('id', 'badge-' + a)
													.addClass('badge badge-empty badge-right')
													.html('0')

										)
									)
							)
					)
			);


		} else {

			$('.filter-' + a).html(

				$('<div/>')
					.addClass('btn-group')
					.append(
						$('<span/>')
							.addClass('btn btn-sm disabled')
							.attr({
								'type': 'button',
								'data-toggle': 'dropdown'
							})
							.append(
								rows[a]
							)
					)
			);
		}


	}

	filter.append(
		$('<div/>')
			.addClass('filter-empty')
	);


	$(document).on('click', '.dropdown-menu.dropdown-menu-form', function(e) {
		e.stopPropagation();
	});


	$(document).on('click', 'input[name="filter"]', function() {

		var block = $(this).parents('.dropdown-menu'),
			button = block.prev(),
			sel = '.' + $(this).val();

		$('input[name="all"]', block).prop('checked',
			$('input[name="filter"]', block).length == $('input[name="filter"]:checked', block).length
		);

		var checked = $(this).prop('checked');

		if ($('input[name="all"]', block).prop('checked')) {

			$('input[name="filter"]', block).each(function() {

				var a = values.filters.indexOf( sel );

				if (a >= 0)
					values.filters.splice(a, 1);

			});

			button.removeClass('active');

		} else {

			button.addClass('active');

			if (checked) {

				var a = values.filters.indexOf( sel );

				if (a >= 0)
					values.filters.splice(a, 1);

			} else {
				values.filters.push( sel );
			}
		}

		values.filters = $.grep(values.filters, function(v, k){
		    return $.inArray(v, values.filters) === k;
		});

		if (values.filters.length > 0) {

			$('.req').show().filter( values.filters.join(", ") ).hide();

		} else {
			$('.req').show();
		}

		filter_fixed.trigger('size');
	});


	$(document).on('click', 'input[name="all"]', function() {

		var block = $(this).parents('.dropdown-menu');

		$('input[name="filter"]', block).trigger('click');

	});


	var filter_fixed = filter.clone();

	filter.after( filter_fixed );
	filter_fixed.addClass('fixed');
	filter_fixed.bind('size', function() {

		$(this).children().each(function(k) {

			$(this).width( filter.children('div:eq(' + k + ')').width() || 'auto' );
		});

		counts();
	});

	$(window).on({
		scroll: function() {

			filter_fixed.css('left', -$(this).scrollLeft());
		},
		load: function() {

			filter_fixed.trigger('size');
		},
		resize: function() {

			filter_fixed.trigger('size');
		}
	});


	$(document).on('click', '.tid.open span', function(e) {

		var tabId = parseInt($(this).html()),
			frameId = parseInt($(this).attr('id'));

		chrome.tabs.update(tabId, {selected: true});

		chrome.windows.update(frameId, {focused: true});

		e.stopPropagation();

	});

	$(document).on('click', '.req', function() {

		$(this).toggleClass('selected');
	});

	$(document).on('click', '.tid.open b', function(e) {

		var tabId = parseInt($(this).attr('id'));

		if (confirm('Close tab?')) {

			chrome.tabs.remove(tabId);
		}

		e.stopPropagation();
	});

	$(document).on('click', '[readonly]', function(e) {

		$(this).focus().select();

		e.stopPropagation();
	});

	$(document).on('click', '[rel="popover"]', function(e) {

//		$('.popover').removeClass('in');

		if ($(this).data('original-title') != undefined) {

//			alert(1);

//			$(this).popover('toggle');

		} else {

			$(this).popover({
				html: true,
				content: $(this).next().html()
			}).popover('show');

		}

		$(this).next().css('top', 0);

		e.stopPropagation();
	});

	var disableScroll = function(e){

		if($(e.srcElement).parents('.popover')) {

//			window.onscroll = function () { window.scrollTo(0, 0); };

		} else {

			e.preventDefault();
		}

	};


	$(document).on('mouseover', '.popover-content', function() {

		$(window).on('mousewheel', disableScroll);

	})
	.on('mouseout', '.popover-content', function() {

		$(window).off('mousewheel', disableScroll);
	});


//	events.focus: function(){ $(window).on('keydown', disableScroll); }
//	events.blur: function(){ $(window).off('keydown', disableScroll); }

	$('html').on('click', function (e) {
		$('[data-original-title]').each(function () {
			if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
				$(this).popover('hide');
			}
		});
	});

	$(document).on('click', 'a', function(e) {

		e.stopPropagation();
	});


});






function parse_url(url) {

	var parser = document.createElement('a');
	parser.href = url;

/*
	parser.protocol; // => "http:"
	parser.host;     // => "example.com:3000"
	parser.hostname; // => "example.com"
	parser.port;     // => "3000"
	parser.pathname; // => "/pathname/"
	parser.hash;     // => "#hash"
	parser.search;   // => "?search=test"
*/

	return parser;
}

function parse_domain(str) {

	var regex = /[^.]+.[^.]+$/gi;

	return regex.exec( str.toString().toLowerCase() );
}

function parse_status(str) {

	var regex = /(\d{3})[\w\s.,-]+$/gi;

	return regex.exec( str.toString() );
}

var makeCRCTable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
};

String.prototype.crc32 = function() {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < this.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ this.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};


function hash(str) {

	return str.toString().toLowerCase().replace(/[^0-9a-z]/g, '');
}

function replaceAll( s ) {
	return s.replace(/"/g, '&quot;').replace(/</g, '&lt;');
}


function object_to_table(data, s) {

	s = s || '';

	if (typeof data == "object") {

		s += '<table class="table table-bordered">';

		for (var a in data) {

			s += '<tr><td><input type="text" class="form-control right" value="' + replaceAll(a) + '" title="' + a.length + '" readonly></td><td>';

			if (typeof data[a] == "object") {

				s += object_to_table(data[a]);

			} else {

				s += '<input type="text" class="form-control" value="' + replaceAll(data[a]) + '" title="' + data[a].length + '" readonly>';
			}

			s += '</td></tr>';
		}

		s += '</table>';
	}

	return s;
}

function body_to_table(data, s) {

	s = s || '';

	if (typeof data == "object") {

		s += '<table class="table table-bordered">';

		for (var a in data) {

			if (a == 'formData') {

				s = body_to_table(data[a]);

			}
			else {

				s += '<tr><td><input type="text" class="form-control right" value="' + replaceAll(a) + '" title="' + a.length + '" readonly></td><td>';

				if (typeof data[a] == "object") {

					if (data[a].length > 0) {

						for (var b in data[a]) {

							if (b > 0) {
								s += '<div class="hr"></div>';
							}

							s += '<input type="text" class="form-control" value="' + replaceAll(data[a][b]) + '" title="' + data[a][b].length + '" readonly>';
						}

					} else {
						s += body_to_table(data[a]);
					}

				} else {

					s += '<input type="text" class="form-control" value="' + replaceAll(data[a]) + '" title="' + data[a].length + '" readonly>';
				}

				s += '</td></tr>';
			}
		}

		s += '</table>';
	}

	return s;
}

function header_to_table(data, s) {

	s = '<table class="table table-bordered">';

	for (var i = 0; i < data.length; i++) {

		s += '<tr>';

		for (var a in data[i]) {

			s += '<td><input type="text" class="form-control' + (a == 'name' ? ' right' : '') + '" value="' + replaceAll(data[i][a]) + '" title="' + data[i][a].length + '" readonly></td>';
		}

		s += '</tr>';

	}

	s += '</table>';

	return s;
}

function parse_search(search) {

    var params = {};
    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&;=]+)=?([^&;]*)/g,
//        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        d = function (s) { return (s.replace(a, " ")); },
        q = search.substring(1);

    while (e = r.exec(q))
       params[d(e[1])] = d(e[2]);

    return params;
}



function filter_add_item(filter, id, str) {

	var f = $('.filter-' + filter + ':last'),
		ul = $('ul', f),
		badge,
		i;

	if (!$('#' + filter + '-' + id, f).is(':input')) {

		if ($('li', ul).length == 1) {

			ul.append(
				$('<li/>').addClass('divider')
			);
		}

		ul.append(
			$('<li/>')
				.addClass('checkbox')
				.append(
					$('<label/>')
						.append(
							$('<input/>')
								.attr({
									'type': 'checkbox',
									'name': 'filter',
									'value': filter + '-' + id,
									'id': filter + '-' + id,
									'checked': true
								})
						)
						.append( str )
						.append(
							$('<span/>')
								.attr('id', 'badge-' + filter + '-' + id)
								.addClass('badge badge-right')
								.html('1')
						)
				)
		);

		badge = $('#badge-' + filter, ul);
		i = parseInt( badge.html() );
		badge.html( i + 1 );

	} else {

		badge = $('#badge-' + filter + '-' + id, ul);
		i = parseInt( badge.html() );
		badge.html( i + 1 );
	}
}


function counts() {

	$('.settings .count-all')
				.html( values.requests_visible );

	if (values.filters.length > 0) {

		$('.settings .count-all')
			.show();

		$('.settings .count')
			.html($('.req:visible').length);

	} else {

		$('.settings .count')
			.html( values.requests_visible );

		$('.count-all').hide();
	}
}

chrome.tabs.onRemoved.addListener(function(tabId) {

	if (options.remove) {

		var tabs = $('.tid-' + tabId);

		values.requests_all -= tabs.length;
		values.requests_visible -= tabs.length;

		tabs.remove();

		counts();

	} else {

		$('.tid-' + tabId + ' > .open').removeClass('open');
	}
});



chrome.runtime.onConnect.addListener(function(port) {

	port.onMessage.addListener(function(Message) {

		var tr_class = 'req' + Message.Details.requestId,
			url = parse_url(Message.Details.url),
			_url = url.hostname + url.pathname + url.search,
			id = tr_class + '_' + _url.crc32(),
			tr = $('#' + id);

		if (!tr.is('div')) {

//			console.log(id);

			if (values.requests[id] == undefined) {

				values.requests[id] = true;
				values.requests_all++;
				values.requests_visible++;

				tr = $('<div/>')
					.addClass('req ' + tr_class)
					.attr('id', id)
					.css('display', 'none');

				for (var a in rows) {

					tr.append(
						$('<div/>')
							.addClass(a)
					);

				}

				tr.addClass('tid-' + Message.Details.tabId);

				$('.rid', tr).html(Message.Details.requestId);

				var params = parse_search(url.search);

				var _type = hash(Message.Details.type);
				filter_add_item('type', _type, Message.Details.type);

				tr.addClass('type-' + _type);
				$('.type', tr).html(Message.Details.type);

				var hostname = url.hostname;
				var domain = parse_domain(url.hostname);
				var _hostname = hash(url.hostname);

				if (domain != url.hostname) {

					_hostname = hash(domain);
					hostname = domain;
				}

				filter_add_item('hostname', _hostname, hostname);

				tr.addClass('hostname-' + _hostname);

				$('.hostname', tr).html(url.hostname);

				$('.url', tr)
					.append(
						$('<a/>')
							.addClass('glyphicon glyphicon-new-window')
							.attr({
								'href': Message.Details.url,
								'target': '_blank'
							})
					)
					.append(
						$('<input/>')
							.attr('readonly', true)
							.val(url.pathname)
					)
					.append(
						$('<span/>')
							.addClass('glyphicon glyphicon-list' + (Object.keys(params).length == 0 ? ' hidden' : ''))
							.attr({
								'rel': 'popover',
								'title': 'GET Params'
							})
							.data('placement', 'left')
							.html(
								$('<span/>').html(Object.keys(params).length )
							)
					)
					.append(
						$('<div/>')
							.addClass('hidden')
							.html(
								object_to_table(params)
							)
					);


				var time = new Date(Message.Details.timeStamp).toTimeString().slice(0, 8);
				$('.time', tr)
					.html(time)
					.append('<span></span>');


				if ($('.' + tr_class).is('div')) {

					$('.' + tr_class + ':first').before(tr);

				} else {

					$('.filter.fixed').after(tr);
				}

				values.requests[id] = undefined;

				if (values.requests_visible > options.limit) {

					$('.req:last').remove();

					values.requests_visible--;
				}

				if (!options['autoscroll']) {

					$(window).scrollTop( $(window).scrollTop() + $('.req:last').height() );
				}


				counts();

			} else {

				while (values.requests[id] != undefined) { }

				console.log('have ' + id + ' = ' + values.requests[id]);
			}

		}

//		console.log(Message.Type);

		if (Message.Type == 'Request') {

			var body = '';

			if (Message.Details.requestBody != undefined) {

				body = body_to_table(Message.Details.requestBody);
			}

			var _tid = hash(Message.Details.tabId);
			filter_add_item('tid', _tid, Message.Details.tabId);

			tr.addClass('tid-' + _tid);

			if (Message.TabInfo != undefined) {

				if ($('.tid', tr).html() == '') {

					$('.tid', tr)
						.addClass('open')
						.append(
							$('<b/>')
								.attr({
									'id': Message.Details.tabId,
									'title': 'Close tab'
								})
						)
						.append(
							$('<span/>')
								.attr({
									'id': Message.TabInfo.windowId,
									'title': Message.TabInfo.title
								})
								.html(Message.Details.tabId)
						);
				}


			} else {

				$('.tid', tr)
					.append(
						$('<span/>')
							.html(Message.Details.tabId)
					);

			}


			if ($('.status', tr).html() == '') {

				$('.status', tr)
					.append('loading...');
			}

			var _method = hash(Message.Details.method);
			filter_add_item('method', _method, Message.Details.method);

			tr.addClass('method-' + _method);

			$('.method', tr)
				.html(Message.Details.method)
				.append(
					body != '' ? $('<span/>').append(
										$('<span/>')
											.append(
												$('<span/>')
													.addClass('glyphicon glyphicon-list')
													.attr({
														'rel': 'popover',
														'title': 'POST Data'
													})
													.data('placement', 'left')
											)
											.append(
												$('<div/>')
													.addClass('hidden')
													.html(
														body
													)
											)
									)
						: ''
				);


		} else if (Message.Type == 'SendHeaders') {

			$('.request', tr)
				.append(
					$('<span/>')
						.addClass('glyphicon glyphicon-log-in')
						.attr({
							'rel': 'popover',
							'title': 'Request Headers'
						})
						.data('placement', 'left')
						.html(
							$('<span/>').html( Message.Details.requestHeaders.length )
						)
				)
				.append(
					$('<div/>')
						.addClass('hidden')
						.html(
							header_to_table(Message.Details.requestHeaders)
						)
				)

		} else if (Message.Type == 'Received') {

			$('.response', tr)
				.append(
					$('<span/>')
						.addClass('glyphicon glyphicon-log-out')
						.attr({
							'rel': 'popover',
							'title': 'Response Headers'
						})
						.data('placement', 'left')
						.html(
							$('<span/>').html( Message.Details.responseHeaders.length )
						)
				)
				.append(
					$('<div/>')
						.addClass('hidden')
						.html(
							header_to_table(Message.Details.responseHeaders)
						)
				)

		} else if (Message.Type == 'Completed') {


		} else if (Message.Type == 'ErrorOccurred') {

			$('.status', tr).html( Message.Details.error || 'Error!');
		}


		if (Message.Details.fromCache) {
			$('.type', tr)
					.append(' (cache)');
		}

		if (Message.Details.statusLine != undefined) {

			var _status = parse_status(Message.Details.statusLine);

			if (_status != null) {

				filter_add_item('status', _status[1], _status[0]);

				tr.addClass('status-' + _status[1]);

				$('.status', tr).html(_status[0]);

			} else {

				$('.status', tr).html('??? - ' + Message.Details.statusLine);
			}
		}

		if ($('.time', tr).attr('stamp') == undefined) {

			$('.time', tr).attr('stamp', Message.Details.timeStamp);

		} else {

			var ms = parseInt(Message.Details.timeStamp - $('.time', tr).attr('stamp'));

			if (ms < 0) {

				$('.time', tr).attr('stamp', Message.Details.timeStamp);

				ms *= -1;
			}

			var sec = parseInt(ms / 1000);

			tr.addClass('time-' + sec);

			$('.time', tr)
				.attr('class','time time-' + sec);

			$('.time > span', tr)
				.html('(' + ms + 'ms)');

			var _time = hash(sec);
			filter_add_item('time', _time, sec);
		}

		if (tr.is( values.filters.join(", ") )) {
			tr.hide();
		} else {
			tr.show();
		}


		values.requests[id] = undefined;

		$('.filter.fixed').trigger('size');

	});

});

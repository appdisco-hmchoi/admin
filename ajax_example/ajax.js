/**
 * @access : public
 * @desc : ajax요청시 parameter의 한글깨짐 방지
 * @param :
 *            paramValue - 요청으로 보내고자 하는 parameter값들
 * @return :
 * @author : 조영호
 */
function cfParamEscape(paramValue) {
	return encodeURIComponent(paramValue);
}

/**
 * @access : public
 * @desc : 폼의 입력 파라미터를 사용하여 Query String을 구성한다.
 * @param :
 *            docForm - 폼 컨트롤
 * @return : Form의 입력 파라미터를 사용하여 구성된 Query String
 * @author : 조영호
 */
function cfFormData2QueryString(docForm) {
	var submitString = '';
	var formElement = '';
	var lastElementName = '';

	for (i = 0; i < docForm.elements.length; i++) {
		formElement = docForm.elements[i];
		switch (formElement.type) {
		case 'text':
		case 'select-one':
		case 'hidden':
		case 'password':
		case 'textarea':
			submitString += formElement.name + '='
					+ cfParamEscape(formElement.value) + '&';
			break;
		case 'radio':
			if (formElement.checked) {
				submitString += formElement.name + '='
						+ cfParamEscape(formElement.value) + '&';
			}
			break;
		case 'checkbox':
			if (formElement.checked) {
				if (formElement.name == lastElementName) {
					if (submitString.lastIndexOf('&') == submitString.length - 1) {
						submitString = submitString.substring(0,
								submitString.length - 1);
					}
					submitString += '&' + formElement.name + '='
							+ cfParamEscape(formElement.value);
				} else {
					submitString += formElement.name + '='
							+ cfParamEscape(formElement.value);
				}
				submitString += '&';
				lastElementName = formElement.name;
			}
			break;
		}
	}
	submitString = submitString.substring(0, submitString.length - 1);
	return submitString;
}

/**
 * 
 * ajax 패키지 선언
 * 
 */
var ajax = {};
ajax.request = {};

/**
 * @type : object
 * @access : public
 * @desc : 비동기 AJAX 요청을 나타내는 클래스
 * @author : 조영호
 */
ajax.request.AjaxRequest = function(url, params, callback, method, applyObj,
		async, exceptionCallback) {
	this.url = url;
	this.params = params;
	this.callback = callback;
	this.method = method;
	this.applyObj = (applyObj == null) ? null : applyObj;
	this.async = (async == null) ? true : async;

	if (exceptionCallback != null) {		
		this.exceptionCallback = exceptionCallback;
	}	
	this.send();
}

ajax.request.AjaxRequest.prototype = {
	/**
	 * @type : prototype_function
	 * @access : public
	 * @desc : XMLHttpRequest 객체를 얻는다.
	 * @return : 성공한 경우 XMLHttpRequest 객체, 실패 시 null 반환
	 * @author : 조영호
	 */
	getAjaxRequest : function() {
		if (window.ActiveXObject) {/* 인터넷 익스플로러 */
			try {
				return new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					return new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e1) {
					return null;
				}
			}
		} else if (window.XMLHttpRequest) { /* 사파리,파이어폭스, 모질라, 오페라 .. */
			return new XMLHttpRequest();
		} else {
			return null;
		}
	},

	/**
	 * @type : prototype_function
	 * @access : public
	 * @desc : XmlHttpRequest 객체를 사용하여 요청을 비동기로 전송한다.
	 * @author : 조영호
	 */
	send : function() {		
		this.req = this.getAjaxRequest();
		var httpMethod = this.method ? this.method : 'GET';
		if (httpMethod != 'GET' && httpMethod != 'POST') {
			httpMethod = 'GET';
		}

		var httpParams = (this.params == null || this.params == '') ? null
				: this.params;
		var httpUrl = this.url;
		if (httpMethod == 'GET') {
			if (httpUrl.indexOf("?") != -1) {
				httpUrl = httpUrl + "&" + httpParams;
			} else {
				httpUrl = httpUrl + "?" + httpParams;
			}
		}

		this.req.open(httpMethod, httpUrl, this.async);
		this.req.setRequestHeader('Content-Type',
				'application/x-www-form-urlencoded;charset=UTF-8');
		this.req.setRequestHeader('Ajax-Request', 'true');
		var request = this;
		this.req.onreadystatechange = function() {
			request.onStateChange.call(request);
		}
		this.req.send(httpMethod == 'POST' ? httpParams : null);
	},

	/**
	 * @type : prototype_function
	 * @access : private
	 * @desc : 수신 callback 함수. 수신 성공 시 생성자에 전달된 callback 함수를 호출한다. 수신 실패 시 생성자에서
	 *       exceptionCallback 함수를 선언했다면 exceptionCallback 함수를 호출한다.
	 *       exceptionCallback 함수가 설정되지 않은 경우 아무 것도 호출되지 않는다. 성공 실패 핸들러는
	 *       'method_name(request)' 형식을 취해야 하며, request는 XmlHttpRequest 객체가
	 *       전달된다.
	 * @author : 조영호
	 */
	onStateChange : function() {		
		if (this.req.readyState == 4) {			
			if (this.req.status == 200) {				
				if (this.applyObj) {					
					this.callback.call(this.applyObj, this.req);
				} else {					
					this.callback(this.req);
				}
			} else {				
				if (this.exceptionCallback != null) {					
					this.exceptionCallback(this.req);
				}
			}
		}
	}
}

/**
 * 
 * ajax.event
 * 
 */
ajax.Event = {};

/**
 * @type : function
 * @access : public
 * @desc : HTML 엘리먼트에 대해 이벤트 리스너를 설정한다.
 * @param :
 *            element - 이벤트 리스너를 할당할 HTML 엘리먼트
 * @param :
 *            name - 이벤트 명, 이벤트 명에는 on을 생략한다. 예를 들어 onclick일 경우 click만 명시.
 * @param :
 *            observer - 이벤트 리스너
 * @param :
 *            useCapture - 캡쳐 허용 여부
 * @author : 조영호
 */
ajax.Event.addListener = function(element, name, observer, useCapture) {
	useCapture = useCapture || false;

	if (element.addEventListener) {
		element.addEventListener(name, observer, useCapture);
	} else if (element.attachEvent) {
		element.attachEvent('on' + name, observer);
	}
}

/**
 * @type : function
 * @access : public
 * @desc : 이벤트 핸들러에서의 this 문제를 해결하기 위해 this를 재설정한다. 예제) var overFunc =
 *       ajax.Event.bindAsListener(this.doMouseOver, this);
 *       ajax.Event.addListener(this.element, "mouseover", overFunc);
 * 
 * @param :
 *            func - 호출될 이벤트 핸들러
 * @param :
 *            obj - 이벤트 핸들러 호출 시 this로 적용될 엘리먼트
 * @return : this가 obj로 변경된 func 이벤트 핸들러
 * @author : 조영호
 */
ajax.Event.bindAsListener = function(func, obj) {
	return function() {
		return func.apply(obj, arguments);
	}
}

/**
 * @type : function
 * @access : public
 * @desc : 이벤트가 발생한 target을 반환한다.
 * @param :
 *            event - 이벤트
 * @author : 조영호
 */
ajax.Event.getTarget = function(event) {
	if (event == null)
		return null;
	if (event.target)
		return event.target;
	if (event.srcElement)
		return event.srcElement;
	return null;
}

/**
 * @type : function
 * @access : public
 * @desc : 마우스 이벤트가 발생한 경우 X,Y 좌표를 반환한다.
 * @param :
 *            event - 이벤트
 * @return : JSON 타입의 {x,y} 값 반환
 * @author : 조영호
 */
ajax.Event.getMouseXY = function(event) {
	var mouseX = event.clientX;
	var mouseY = event.clientY;

	var dd = document.documentElement;
	var db = document.body;

	if (dd) {
		mouseX += dd.scrollLeft;
		mouseY += dd.scrollTop;
	} else if (db) {
		mouseX += db.scrollLeft;
		mouseY += db.scrollTop;
	}

	return {
		x :mouseX,
		y :mouseY
	};
}

/**
 * @type : function
 * @access : public
 * @desc : 마우스 왼쪽 버튼이 눌렸는지를 판단한다.
 * @param :
 *            event - 이벤트
 * @return : 마우스 왼쪽 버튼이 눌렸을 경우 true, 왼쪽 버튼이 눌리지 않은 경우 fale 반환
 * @author : 조영호
 */
ajax.Event.isLeftButton = function(event) {
	return (event.which) ? event.which == 1 && event.button == 0
			: (event.type == 'click') ? event.button == 0 : event.button == 1;
}

/**
 * @type : function
 * @access : public
 * @desc : 마우스 오른쪽 버튼이 눌렸는지를 판단한다.
 * @param :
 *            event - 이벤트
 * @return : 마우스 오른쪽 버튼이 눌렸을 경우 true, 오른쪽 버튼이 눌리지 않은 경우 fale 반환
 * @author : 조영호
 */
ajax.Event.isRightButton = function(event) {
	return event.button == 2;
}

/**
 * @type : function
 * @access : public
 * @desc : 이벤트 전파를 금지한다.
 * @param :
 *            event - 이벤트
 * @author : 조영호
 */
ajax.Event.stopPropagation = function(event) {
	if (event.stopPropagation) {
		event.stopProgagation();
	} else {
		event.cancelBubble = true;
	}
}

/**
 * @type : function
 * @access : public
 * @desc : 이벤트에 대한 기본 오퍼레이션 실행을 금지한다.
 * @param :
 *            event - 이벤트
 * @author : 조영호
 */
ajax.Event.preventDefault = function(event) {
	if (event.preventDefault) {
		event.preventDefault();
	} else {
		event.returnValue = false;
	}
}

/**
 * @type : function
 * @access : public
 * @desc : 이벤트에 대한 전파와 기본 오퍼레이션 실행을 금지한다.
 * @param :
 *            event - 이벤트
 * @author : 조영호
 */
ajax.Event.stopEvent = function(event) {
	ajax.Event.stopPropagation(event);
	ajax.Event.preventDefault(event);
}

/**
 * 
 * ajax.GUI
 * 
 */
ajax.GUI = {};
ajax.GUI.setOpacity = function(ele, opacity) {
	if (ele.filters) {
		ele.style.filter = 'alpha(opacity=' + opacity * 100 + ')';
	} else {
		ele.style.opacity = opacity;
	}
}

ajax.GUI.getStyle = function(el, property) {
	var value = null;
	var dv = document.defaultView;

	if (property == 'opacity' && el.filters) { // IE opacity
		value = 1;
		try {
			value = el.filters.item('alpha').opacity / 100;
		} catch (e) {
		}
	} else if (el.style[property]) { // style로 값을 구할 수 있는 경우
		value = el.style[property];
	} else if (el.currentStyle && el.currentStyle[property]) { // IE의 경우
		value = el.currentStyle[property];
	} else if (dv && dv.getComputedStyle) {
		// 대문자를 소문자로 변환하고 앞에 '-'를 붙인다.
		var converted = '';
		for (i = 0, len = property.length; i < leng; i++) {
			if (property.charAt(i) == property.charAt(i).toUpperCase()) {
				converted = converted + '-' + property.charAt(i).toLowerCase();
			} else {
				converted = converted + property.charAt(i);
			}
		}

		if (dv.getComputedStyle(el, '').getPropertyValue(converted)) {
			value = dv.getComputedStyle(el, '').getPropertyValue(converted);
		}
	}

	return value;
}

/**
 * 
 * ajax.component
 * 
 */
ajax.component = {};

ajax.component.SelectCheckbox = function(selectId, checkboxId, spanId, url,
		optionParam, queryValue, checked, prevConnected) {
	this.nameOfSelect = selectId;
	this.nameOfCheckbox = checkboxId;
	this.nameOfSpan = spanId;

	this.select = document.getElementById(selectId);
	this.span = document.getElementById(spanId);

	this.url = url;
	this.queryValue = queryValue;
	this.optionParam = (optionParam == null) ? null : optionParam;
	this.prevConnected = prevConnected;
	this.checked = checked;

	this.init();
	ajax.Event.addListener(this.select, "change", ajax.Event.bindAsListener(
			this.doChange, this));
}

ajax.component.SelectCheckbox.prototype = {
	init : function(e) {
		if (this.queryValue != '') {			
			var param = "";
			if (this.optionParam != null) {
				param = this.optionParam + "&";
			}

			param += this.queryValue;

			if (this.prevConnected != null && this.prevConnected.length != 0) {
				for ( var loop = 0; loop < this.prevConnected.length; loop++) {
					connectedSelect = document
							.getElementById(this.prevConnected[loop]);
					param += "&" + this.prevConnected[loop] + "="
							+ connectedSelect.value;
				}
			}

			new ajax.request.AjaxRequest(this.url, param, this.loaded, "GET",
					this, false);
		} else {
			this.initCheckbox( []);
		}
	},
	doChange : function(e) {
		var param = "";
		if (this.optionParam != null) {
			param = this.optionParam;
		}

		if (this.select.value != '') {
			param += "&" + this.nameOfSelect + "=" + this.select.value;

			if (this.prevConnected != null && this.prevConnected.length != 0) {
				for ( var loop = 0; loop < this.prevConnected.length; loop++) {
					connectedSelect = document
							.getElementById(this.prevConnected[loop]);
					param += "&" + this.prevConnected[loop] + "="
							+ connectedSelect.value;
				}
			}

			new ajax.request.AjaxRequest(this.url, param, this.loaded, "GET",
					this, false);
		} else {
			this.clearCheckbox();
			this.initCheckbox( []);
		}
	},
	loaded : function(request) {		
		var optionList = eval("(" + request.responseText + ")");
		this.initCheckbox(optionList);
	},
	clearCheckbox : function() {
		this.span.innerHTML = "";
	},
	initCheckbox : function(optionList) {
		this.clearCheckbox();

		html = "";
		for ( var loop = 0; loop < optionList.length; loop++) {
			html += "<input type='checkbox' name='" + this.nameOfCheckbox
					+ "' value='" + optionList[loop].code + "' ";
			for ( var checkedLoop = 0; checkedLoop < this.checked.length; checkedLoop++) {
				if (this.checked[checkedLoop] == optionList[loop].code) {
					html += "checked";
				}
			}
			html += ">" + optionList[loop].name + "&nbsp;&nbsp;";
		}

		this.span.innerHTML = html;
	},
	initSelect : function(selectName) {		
		var selectControl = document.getElementById(selectName);
		selectControl.length = 0;

		var optionArray = new Array();

		var option = document.createElement("option");
		option.text = "[선택하세요]";
		option.value = "";
		selectControl.add(option);

		// option = document.createElement("option");
	// option.text = "---------";
	// option.value = "";
	// optionArray[optionArray.length] = option;
	// selectControl.add(option);
}
}

ajax.component.DoubleSelect = function(selectId1, selectId2, url, optionParam,
		queryValue, selected, prevConnected, nextConnected) {	
	this.nameOfSelect1 = selectId1;
	this.nameOfSelect2 = selectId2;

	this.select1 = document.getElementById(selectId1);
	this.select2 = document.getElementById(selectId2);

	this.url = url;
	this.selected = selected;
	this.queryValue = queryValue;
	this.optionParam = (optionParam == null) ? null : optionParam;
	this.prevConnected = prevConnected;
	this.nextConnected = nextConnected;

	this.init();
	ajax.Event.addListener(this.select1, "change", ajax.Event.bindAsListener(
			this.doChange, this));
}

ajax.component.DoubleSelect.prototype = {
	init : function(e) {
		if (this.queryValue != '') {
			var param = "";
			if (this.optionParam != null) {
				param = this.optionParam + "&";
			}

			param += this.queryValue;

			if (this.prevConnected != null && this.prevConnected.length != 0) {
				for ( var loop = 0; loop < this.prevConnected.length; loop++) {
					connectedSelect = document
							.getElementById(this.prevConnected[loop]);
					param += "&" + this.prevConnected[loop] + "="
							+ connectedSelect.value;
				}
			}

			new ajax.request.AjaxRequest(this.url, param, this.loaded, "GET",
					this, false);
		} else {
			this.initSelect2( []);
		}
	},
	doChange : function(e) {
		var param = "";
		if (this.optionParam != null) {
			param = this.optionParam;
		}

		if (this.select1.value != '') {
			param += "&" + this.nameOfSelect1 + "=" + this.select1.value;

			if (this.prevConnected != null && this.prevConnected.length != 0) {
				for ( var loop = 0; loop < this.prevConnected.length; loop++) {
					connectedSelect = document
							.getElementById(this.prevConnected[loop]);
					param += "&" + this.prevConnected[loop] + "="
							+ connectedSelect.value;
				}
			}

			new ajax.request.AjaxRequest(this.url, param, this.loaded, "GET",
					this, false);
		} else {
			this.clearSelect2();
			this.initSelect2( []);
		}

		if (this.nextConnected != null && this.nextConnected.length > 0) {
			for ( var loop = 0; loop < this.nextConnected.length; loop++) {
				this.initSelect(this.nextConnected[loop]);
			}
		}
	},
	loaded : function(request) {
	// 첫번째 셀렉트박스 선택시 타는 메소드	
	 var optionList = eval("(" + request.responseText + ")");
		
	this.initSelect2(optionList);
},
clearSelect2 : function() {
	this.select2.length = 0;
},
initSelect2 : function(optionList) {	
	this.clearSelect2();

	var optionArray = new Array();

	var option = document.createElement("option");
	option.text = "[선택하세요]";
	option.value = "";
	optionArray[optionArray.length] = option;

	// optionList.length : 콤보박스 조회 결과 갯수
	for ( var loop = 0; loop < optionList.length; loop++) {		
		option = document.createElement("option");
		option.value = optionList[loop].code;
		option.text = optionList[loop].name;

		if (this.selected != "" && this.selected == option.value) {
			option.selected = true;
		}

		optionArray[optionArray.length] = option;
	}

	for ( var loop = 0; loop < optionArray.length; loop++) {
		try {
			this.select2.add(optionArray[loop], null);
		} catch (e) {
			this.select2.add(optionArray[loop], -1);
		}
	}
},
initSelect : function(selectName) {	
	var selectControl = document.getElementById(selectName);
	if (selectControl == null) {
		return;
	}

	if (selectControl.tagName != 'SELECT') {
		selectControl.innerHTML = "";
		return;
	}

	selectControl.length = 0;

	var optionArray = new Array();

	var option = document.createElement("option");
	option.text = "[선택하세요]";
	option.value = "";
	selectControl.add(option);
	this.selected = "";
}
}

ajax.component.Select = function(selectId, url, optionParam, selected) {	
	this.select = document.getElementById(selectId);
	this.url = url;
	this.optionParam = (optionParam == null) ? null : optionParam;
	this.selected = (selected == null) ? '' : selected;

	new ajax.request.AjaxRequest(this.url, optionParam, this.loaded, "GET",
			this, false);
}

/**
 * @type : prototype_function
 * @access : public
 * @desc : 첫번째 콤보박스 조회 결과를 셋팅.
 * @return : none
 * @author : 조영호
 */
ajax.component.Select.prototype = {
	loaded : function(request) {
		// 0번째
	try {		
		var optionList = eval("("+request.responseText+")");
	} catch (e) {
		alert(e.description);
	}
	
	//var optionList = [{name:'10205N',code:'10205'},{name:'10207N',code:'10207'},{name:'10208N',code:'10208'},{name:'10204N',code:'10204'},{name:'10206N',code:'10206'}];
	
	this.initSelect(optionList);
},
initSelect : function(optionList) {	
	var optionArray = new Array();

	var option = document.createElement("option");
	option.text = "[선택하세요]";
	option.value = "";
	optionArray[optionArray.length] = option;

	for ( var loop = 0; loop < optionList.length; loop++) {
		option = document.createElement("option");
		option.value = optionList[loop].code;
		option.text = optionList[loop].name;

		if (this.selected != "" && this.selected == option.value) {
			option.selected = true;
		}

		optionArray[optionArray.length] = option;
	}

	for ( var loop = 0; loop < optionArray.length; loop++) {
		try {
			this.select.add(optionArray[loop], null);
		} catch (e) {

			this.select.add(optionArray[loop], -1);
		}
	}
}
}

/**
 * 
 * ajax.encode 패키지 선언
 * 
 */
ajax.encode = {}

ajax.encode.Base64Coder = {
	// private property
	_keyStr :"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function(input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = this._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output + this._keyStr.charAt(enc1)
					+ this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3)
					+ this._keyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	decode : function(input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = this._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";

		for ( var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function(utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while (i < utftext.length) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12)
						| ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}

}
/**
 * @access : public
 * @desc : ajax��û�� parameter�� �ѱ۱��� ����
 * @param :
 *            paramValue - ��û���� �������� �ϴ� parameter����
 * @return :
 * @author : ����ȣ
 */
function cfParamEscape(paramValue) {
	return encodeURIComponent(paramValue);
}

/**
 * @access : public
 * @desc : ���� �Է� �Ķ���͸� ����Ͽ� Query String�� �����Ѵ�.
 * @param :
 *            docForm - �� ��Ʈ��
 * @return : Form�� �Է� �Ķ���͸� ����Ͽ� ������ Query String
 * @author : ����ȣ
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
 * ajax ��Ű�� ����
 * 
 */
var ajax = {};
ajax.request = {};

/**
 * @type : object
 * @access : public
 * @desc : �񵿱� AJAX ��û�� ��Ÿ���� Ŭ����
 * @author : ����ȣ
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
	 * @desc : XMLHttpRequest ��ü�� ��´�.
	 * @return : ������ ��� XMLHttpRequest ��ü, ���� �� null ��ȯ
	 * @author : ����ȣ
	 */
	getAjaxRequest : function() {
		if (window.ActiveXObject) {/* ���ͳ� �ͽ��÷η� */
			try {
				return new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					return new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e1) {
					return null;
				}
			}
		} else if (window.XMLHttpRequest) { /* ���ĸ�,���̾�����, ������, ����� .. */
			return new XMLHttpRequest();
		} else {
			return null;
		}
	},

	/**
	 * @type : prototype_function
	 * @access : public
	 * @desc : XmlHttpRequest ��ü�� ����Ͽ� ��û�� �񵿱�� �����Ѵ�.
	 * @author : ����ȣ
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
	 * @desc : ���� callback �Լ�. ���� ���� �� �����ڿ� ���޵� callback �Լ��� ȣ���Ѵ�. ���� ���� �� �����ڿ���
	 *       exceptionCallback �Լ��� �����ߴٸ� exceptionCallback �Լ��� ȣ���Ѵ�.
	 *       exceptionCallback �Լ��� �������� ���� ��� �ƹ� �͵� ȣ����� �ʴ´�. ���� ���� �ڵ鷯��
	 *       'method_name(request)' ������ ���ؾ� �ϸ�, request�� XmlHttpRequest ��ü��
	 *       ���޵ȴ�.
	 * @author : ����ȣ
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
 * @desc : HTML ������Ʈ�� ���� �̺�Ʈ �����ʸ� �����Ѵ�.
 * @param :
 *            element - �̺�Ʈ �����ʸ� �Ҵ��� HTML ������Ʈ
 * @param :
 *            name - �̺�Ʈ ��, �̺�Ʈ ���� on�� �����Ѵ�. ���� ��� onclick�� ��� click�� ���.
 * @param :
 *            observer - �̺�Ʈ ������
 * @param :
 *            useCapture - ĸ�� ��� ����
 * @author : ����ȣ
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
 * @desc : �̺�Ʈ �ڵ鷯������ this ������ �ذ��ϱ� ���� this�� �缳���Ѵ�. ����) var overFunc =
 *       ajax.Event.bindAsListener(this.doMouseOver, this);
 *       ajax.Event.addListener(this.element, "mouseover", overFunc);
 * 
 * @param :
 *            func - ȣ��� �̺�Ʈ �ڵ鷯
 * @param :
 *            obj - �̺�Ʈ �ڵ鷯 ȣ�� �� this�� ����� ������Ʈ
 * @return : this�� obj�� ����� func �̺�Ʈ �ڵ鷯
 * @author : ����ȣ
 */
ajax.Event.bindAsListener = function(func, obj) {
	return function() {
		return func.apply(obj, arguments);
	}
}

/**
 * @type : function
 * @access : public
 * @desc : �̺�Ʈ�� �߻��� target�� ��ȯ�Ѵ�.
 * @param :
 *            event - �̺�Ʈ
 * @author : ����ȣ
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
 * @desc : ���콺 �̺�Ʈ�� �߻��� ��� X,Y ��ǥ�� ��ȯ�Ѵ�.
 * @param :
 *            event - �̺�Ʈ
 * @return : JSON Ÿ���� {x,y} �� ��ȯ
 * @author : ����ȣ
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
 * @desc : ���콺 ���� ��ư�� ���ȴ����� �Ǵ��Ѵ�.
 * @param :
 *            event - �̺�Ʈ
 * @return : ���콺 ���� ��ư�� ������ ��� true, ���� ��ư�� ������ ���� ��� fale ��ȯ
 * @author : ����ȣ
 */
ajax.Event.isLeftButton = function(event) {
	return (event.which) ? event.which == 1 && event.button == 0
			: (event.type == 'click') ? event.button == 0 : event.button == 1;
}

/**
 * @type : function
 * @access : public
 * @desc : ���콺 ������ ��ư�� ���ȴ����� �Ǵ��Ѵ�.
 * @param :
 *            event - �̺�Ʈ
 * @return : ���콺 ������ ��ư�� ������ ��� true, ������ ��ư�� ������ ���� ��� fale ��ȯ
 * @author : ����ȣ
 */
ajax.Event.isRightButton = function(event) {
	return event.button == 2;
}

/**
 * @type : function
 * @access : public
 * @desc : �̺�Ʈ ���ĸ� �����Ѵ�.
 * @param :
 *            event - �̺�Ʈ
 * @author : ����ȣ
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
 * @desc : �̺�Ʈ�� ���� �⺻ ���۷��̼� ������ �����Ѵ�.
 * @param :
 *            event - �̺�Ʈ
 * @author : ����ȣ
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
 * @desc : �̺�Ʈ�� ���� ���Ŀ� �⺻ ���۷��̼� ������ �����Ѵ�.
 * @param :
 *            event - �̺�Ʈ
 * @author : ����ȣ
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
	} else if (el.style[property]) { // style�� ���� ���� �� �ִ� ���
		value = el.style[property];
	} else if (el.currentStyle && el.currentStyle[property]) { // IE�� ���
		value = el.currentStyle[property];
	} else if (dv && dv.getComputedStyle) {
		// �빮�ڸ� �ҹ��ڷ� ��ȯ�ϰ� �տ� '-'�� ���δ�.
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
		option.text = "[�����ϼ���]";
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
	// ù��° ����Ʈ�ڽ� ���ý� Ÿ�� �޼ҵ�	
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
	option.text = "[�����ϼ���]";
	option.value = "";
	optionArray[optionArray.length] = option;

	// optionList.length : �޺��ڽ� ��ȸ ��� ����
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
	option.text = "[�����ϼ���]";
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
 * @desc : ù��° �޺��ڽ� ��ȸ ����� ����.
 * @return : none
 * @author : ����ȣ
 */
ajax.component.Select.prototype = {
	loaded : function(request) {
		// 0��°
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
	option.text = "[�����ϼ���]";
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
 * ajax.encode ��Ű�� ����
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
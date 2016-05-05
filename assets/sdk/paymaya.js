(function(w) {
	w.PayMaya = {
		publicKey: 'pk-N6TvoB4GP2kIgNz4OCchCTKYvY5kPQd2HDRSg8rPeQG',
		sandbox: false,
		merchantUrl: {
			redirect: {
				success: '',
				failure: '',
				cancel: ''
			},
			payments: {
				create: '',
				get: ''
			},
			cards: {

			},
			customer: {

			}
		},
		statusPage: {
			success: 1,
			failed: 0,
			canceled: 2
		},
		_server: function() {
			var url = '';

			if (this.sandbox === 2) {
				url = 'http://52.76.57.133:8001/v1';
			}
			else if (this.sandbox === 1){
				url = 'https://pg-sandbox.paymaya.com/payments/v1';
			}
			else{
				url = 'https://api.paymaya.com/payments/v1'; //sample production url
			}

			return url;
		},
		getTokenID: function(obj, callback) {
			/*tokenIDURL depends on the url used in the PayMaya server*/
			var tokenIDURL = '/payment-tokens';
			var	requestBody = {}, cardDetails = {};

			if (typeof obj === 'object') {
				cardDetails = arguments[0];
			}
			else if (typeof obj === 'string') {
				cardDetails = this.getCardDetails(obj);
			}

			document.body.data = {};
			requestBody.card = cardDetails;

			this.ajax({
				url: tokenIDURL,
				data: requestBody,
				paymaya: true,
				success: function(responseData) {
					try{
						document.body.data = JSON.parse(responseData);
					}
					catch(e) {
						throw 'Response from PayMaya server is not a valid JSON string.';
					}

					callback.call(this, w.PayMaya, responseData);
				}
			});

			requestBody = null;
			cardDetails = null;

			return this;
		},
		payments: function(obj) {
			if (!this.hasTokenID()) {
				throw 'TokenID required in order to create a payment.';
			}

			var data, paymentsArgs = arguments;
			var paymentGetURL = this.merchantUrl.payments.get;
			var paymentCreateURL = this.merchantUrl.payments.create;

			data = this._checkPaymentArgs(obj);

			if(typeof obj === 'function') {
				this.ajax({
					url: paymentGetURL,
					method: 'GET',
					success: function(responseData){
						try{
							var parsedData = JSON.parse(responseData);
							obj.call(this, parsedData);

							//Should be used when checking the Payment status
							//w.PayMaya.onPaymentSuccess.apply(this, [parsedData]);
						}
						catch(e) {
							throw 'AJAX Response is not a valid JSON string.';
						}
					}
				});
			}

			if (typeof obj === 'object' || typeof obj === 'string') {
				this.ajax({
					url: paymentCreateURL,
					data: data,
					success: function(responseData){
						try{
							var resp,
								parsedData = JSON.parse(responseData),
								defaultResp = {
									id: '',
									environment: 'development',
									isPaid: false,
									status: "for_detok",
									amount: 0,
									currency: "PHP",
									refunded: false,
									captured: true,
									amountRefunded: 0,
									description: "",
									verificationUrl: ""
								};

							resp = w.PayMaya.extend(defaultResp, parsedData);

							if(paymentsArgs.length === 2) {
								paymentsArgs[1].call(this, resp);
							}

							/*
							Launched the Panel when the response have the verification URL.
							Payment is not charge yet until the 3DS Authentication succeeded.
							After the 3DS Authentication it will redirect to a payment status page inside
							the iframe and that page will change the parent location url to match the url inside the iframe.
							*/

							w.PayMaya.addPanel(resp.verificationUrl, function() {

							});

							parsedData = null;
						}
						catch(e) {
							throw 'AJAX Response is not a valid JSON string.';
						}
					}
				});
			}

			/*Clean up variables that are no longer needed. No need to wait for the garbage collector*/
			data = null;

			return this;
		},
		hasTokenID: function() {
			var tokenData = document.body.data || {};

			if (!this.isEmptyObject(tokenData)) {
				if (tokenData.paymentTokenId.length > 0) {
					return true;
				}
			}

			return false;
		},
		paymentStatusPage: function() {
			if (w.top.location.href !== w.self.location.href) {
				w.top.location.href = w.self.location.href;
			}
		},
		onPaymentSuccess: function() {

		},
		onPaymentFailure: function() {

		},
		onPaymentCanceled: function() {

		},
		ajax: function(obj) {
			var request, xhrURL, defaultConfig, requestHeader, config;

			requestHeader = [
				{name: 'Accept', value: 'application/json'}
			];

			defaultConfig = {
				url: '',
				method: 'POST',
				async: true,
				data: {},
				paymaya: false,
				success: function() {},
				error: function() {},
				complete: function() {}
			};

			config = this.extend(defaultConfig, obj);

			if(config.paymaya === true) {

				/*
				*Uncoment this option if testing on a developer environment

				if(this.sandbox === 2) {
					requestHeader.push({name: 'x-party-id', value: '1703'});
				}
				else if(this.sandbox === 1){
					requestHeader.push({name: 'Authorization', value: 'Basic ' + this.base64(this.publicKey + String.fromCharCode(58))});
				}*/


				/*
				*Uncomment this if using the production version
				* */
				requestHeader.push({name: 'Authorization', value: 'Basic ' + this.base64(this.publicKey + String.fromCharCode(58))});

				xhrURL = this._server() + config.url;
			}
			else{
				xhrURL = config.url;
			}

			request = this._xhrObj();

			request.open(config.method, xhrURL, config.async);

			for(var key in requestHeader){
				if(requestHeader.hasOwnProperty(key)) {
					request.setRequestHeader(requestHeader[key].name, requestHeader[key].value);
				}
			}

			request.responseType = 'text';
			request.onreadystatechange = function() {
				if(request.readyState === 4) {
					switch (request.status) {
						case 200:
							config.success.call(this, request.responseText, request.responseType,request.statusText);
							break;
						case 404:
							config.error.call(this, request, request.statusText);
							break;
					}
				}
			};

			request.onerror = function() {
				config.error.call(this, request, 'error');
			};

			request.ontimeout = function() {
				config.error.call(this, request, 'timeout');
			};

			if (config.method === 'POST') {
				request.send(JSON.stringify(config.data));
			}else {
				request.send(null);
			}

			return request;
		},
		extend: function() {
			var extended = {}, deep = false, i = 0, length = arguments.length;

			if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
				deep = arguments[0];
				i++;
			}

			var merge = function(obj) {
				for (var prop in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, prop)) {
						if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
							extended[prop] = this.extend(true, extended[prop], obj[prop]);
						}
						else {
							extended[prop] = obj[prop];
						}
					}
				}
			};

			for (i = 0; i < length; i++) {
				var obj = arguments[i];
				merge(obj);
			}

			return extended;
		},
		getCardDetails: function(id) {
			if (typeof id !== 'string') {return {};}

			var selector = 'input[name=number], input[name=expMonth], input[name=expYear], input[name=cvc]';
			return this._mapNodeToArray(id, selector);
		},
		isEmptyObject: function(obj) {
			var name;

			for (name in obj) {
				if (obj.hasOwnProperty(name)) {
					return false;
				}
			}

			return true;
		},
		createPaymentData: function(id){
			if (!this.hasTokenID()) {
				throw 'TokenID required in order to create a payment.';
			}

			if (typeof id !== 'string') {return {};}

			var requestData;
			var selector = 'input[name=amount], input[name=currency], input[name=firstName], input[name=middleName]' +
				', input[name=lastName], input[name=phone], input[name=email], input[name=line1], input[name=line2]' +
				', input[name=city], input[name=state], input[name=zipCode], input[name=countryCode]';

			var obj = this._mapNodeToArray(id, selector);

			var tokenID = document.body.data.paymentTokenId;
			requestData = this._paymentsPostData(tokenID,obj);

			return requestData;
		},
		addPanel: function(url, callback) {
			if(typeof url !== 'string' && typeof callback !== 'function'){
				return false;
			}

			var d = document, frameContainer = d.createElement('DIV');
			var frameBox = '<div id="paymaya-box"><div id="paymaya-border"><div id="paymaya-close"></div></div></div>';
			var iframeDom = d.createElement('IFRAME');

			frameContainer.id = 'paymaya-container';
			frameContainer.innerHTML = frameBox;
			frameContainer.setAttribute('style', 'display: block;position: absolute;top: 0px;left: 0px;right: 0px;bottom: 0px;z-index: 9990;background-color: rgba(0,0,0,0.2);');

			d.body.appendChild(frameContainer);
			d.getElementById('paymaya-border').appendChild(iframeDom);

			var paymayaBox = d.getElementById('paymaya-box');
			paymayaBox.setAttribute('style', 'display: block;position: relative;margin-right: auto;margin-left: auto;border-radius: 10px 10px 10px 10px;-moz-border-radius: 10px 10px 10px 10px;-webkit-border-radius: 10px 10px 10px 10px;border: 0px solid #000000;z-index: 10000;background-color: rgba(0,0,0,0.3);');

			var paymayaBorder = d.getElementById('paymaya-border');
			paymayaBorder.setAttribute('style', 'display: block;position: absolute;top: 10px;bottom: 10px;left: 10px;right: 10px;overflow: hidden;background-color: #ffffff;');

			var paymayaClose = d.getElementById('paymaya-close');
			paymayaClose.setAttribute('style', 'display: block;position: absolute;top: 0px;right: 0px;left: auto;bottom: auto;width: 24px;height: 24px;z-index: 10010;cursor: pointer;cursor: hand;background-repeat: no-repeat;background-color: transparent;');
			paymayaClose.style.backgroundImage = "url(data:image/png;base64,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)";

			paymayaClose.onclick = function(){
				w.PayMaya.removePanel(w.PayMaya.statusPage.canceled);
			};

			/*This must be changeable*/
			paymayaBox.style.marginTop = '100px';
			paymayaBox.style.width = '580px';
			paymayaBox.style.height = '500px';
			iframeDom.src = url;

			iframeDom.width = (parseInt(this._replace(paymayaBox.style.width.toString(), 'px', ''), 10) - 20) + 'px';
			iframeDom.height = (parseInt(this._replace(paymayaBox.style.height.toString(), 'px', ''), 10) - 20) + 'px';
			iframeDom.frameBorder = 0;
			iframeDom.scrolling = 'no';
			iframeDom.id = 'paymaya-render';
			iframeDom.setAttribute('style', 'display: block;position: absolute;top:0px;bottom:0px;left:0px;right:0px;border: none;overflow: hidden;background-color: transparent;');

			iframeDom.onload = function(e) {
				callback.call(this, e);
			};

			return true;
		},
		removePanel: function(confirmPage) {
			if(isNaN(confirmPage) === true) {
				throw 'The values for the parameter for removePanel should come from PayMaya.statusPage object';
			}

			var winObj;

			if (w.top !== w.self) {
				winObj = w.top;
			}
			else {
				winObj = w;
			}

			winObj.document.body.removeChild(winObj.document.getElementById('paymaya-container'));

			switch (confirmPage) {
				case 0:
					winObj.PayMaya.onPaymentFailure.apply(winObj.PayMaya);
					break;
				case 1:
					winObj.PayMaya.onPaymentSuccess.apply(winObj.PayMaya);
					break;
				case 2:
					winObj.PayMaya.onPaymentCanceled.apply(winObj.PayMaya);
					break;
			}
		},
		base64: function(data) {
			var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
			var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = '', tmp_arr = [];

			if (!data) {
				return data;
			}

			data = decodeURIComponent(encodeURIComponent(data));

			do {
				o1 = data.charCodeAt(i++);
				o2 = data.charCodeAt(i++);
				o3 = data.charCodeAt(i++);

				bits = o1 << 16 | o2 << 8 | o3;

				h1 = bits >> 18 & 0x3f;
				h2 = bits >> 12 & 0x3f;
				h3 = bits >> 6 & 0x3f;
				h4 = bits & 0x3f;

				tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
			}
			while(i < data.length);

			enc = tmp_arr.join('');

			var r = data.length % 3;

			return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
		},
		_xhrObj: function() {
			var req, msxml = ['MSXML2.XMLHTTP.6.0','MSXML2.XMLHTTP.3.0','MSXML2.XMLHTTP','Microsoft.XMLHTTP'];

			if (w.XMLHttpRequest) {
				req = new w.XMLHttpRequest();
			}
			else {
				if (w.ActiveXObject) {
					for(var i = 0; i < msxml.length; i++) {
						try{
							req = new w.ActiveXObject(msxml[i]);
						}catch (e){
							continue;
						}
						break;
					}
				}
			}

			return req;
		},
		_paymentsPostData: function(tokenID,obj) {
			return {
				paymentTokenId: tokenID,
				totalAmount: {
					amount: this._checkObjPropExist(obj, 'amount', 0),
					currency: this._checkObjPropExist(obj, 'currency', '')
				},
				buyer: {
					firstName: this._checkObjPropExist(obj, 'firstName', ''),
					middleName: this._checkObjPropExist(obj, 'middleName', ''),
					lastName: this._checkObjPropExist(obj, 'lastName', ''),
					contact: {
						phone: this._checkObjPropExist(obj, 'phone', ''),
						email: this._checkObjPropExist(obj, 'email', '')
					},
					billingAddress: {
						line1: this._checkObjPropExist(obj, 'line1', ''),
						line2: this._checkObjPropExist(obj, 'line2', ''),
						city: this._checkObjPropExist(obj, 'city', ''),
						state: this._checkObjPropExist(obj, 'state', ''),
						zipCode: this._checkObjPropExist(obj, 'zipCode', ''),
						countryCode: this._checkObjPropExist(obj, 'countryCode', '')
					}
				},
				redirectUrl: this._getRedirectURL()
			};
		},
		_mapNodeToArray: function(id,selector) {
			var obj = {}, nlist = document.querySelector(id).querySelectorAll(selector);

			for (var i = 0; i < nlist.length; i++) {
				obj[nlist[i].name] = nlist[i].value;
			}

			return obj;
		},
		_checkObjPropExist: function(obj,propName, returnVal) {
			return obj[propName] || returnVal;
		},
		_getRedirectURL: function() {
			return {
				success: w.location.protocol + '//' + w.location.host + this.merchantUrl.redirect.success,
				failure: w.location.protocol + '//' + w.location.host + this.merchantUrl.redirect.failure,
				cancel: w.location.protocol + '//' + w.location.host + this.merchantUrl.redirect.cancel
			};
		},
		_checkPaymentArgs: function(obj) {
			var ObjData;
			if (typeof obj === 'object') {
				ObjData = obj || {};
				ObjData.redirectUrl = this._getRedirectURL();
			}
			else if(typeof obj === 'string') {
				ObjData = this.createPaymentData(obj);
			}

			return ObjData;
		},
		_replace: function(value, search, toReplace) {
			return value.replace(search, toReplace);
		}
	};
}(window));
(function(w) {
	w.PayMaya = {
		publicKey: 'pk-N6TvoB4GP2kIgNz4OCchCTKYvY5kPQd2HDRSg8rPeQG',
		sandbox: false,
		merchantUrl: {
			payments: {
				create: '',
				get: ''
			},
			cards: {

			},
			customer: {

			}
		},
		_server: function() {
			var url = '';

			if (this.sandbox === true) {
				url = 'https://pg-sandbox.paymaya.com/payments/v1';
			}
			else {
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

			var data = {}, paymentsArgs = arguments;
			var paymentGetURL = 'paymentsget.json';
			var paymentCreateURL = 'paymentscreate.json';

			if (typeof obj === 'object') {
				data = obj || {};
			}
			else if(typeof obj === 'string') {
				data = this.createPaymentData(obj);
			}

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
							var parsedData = JSON.parse(responseData);

							if(paymentsArgs.length === 2) {
								paymentsArgs[1].call(this, parsedData);
							}

							/*
							Launched the Panel when the response have the verification URL.
							Payment is not charge yet until the 3DS Authentication succeeded.
							After the 3DS Authentication it will redirect to a payment status page inside
							the iframe and that page will change the parent location url to match the url inside the iframe.
							*/

							w.PayMaya.addPanel('http://yahoo.com', function() {

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
		onPaymentSuccess: function() {

		},
		onPaymentFailure: function() {

		},
		onPaymentCanceled: function() {

		},
		ajax: function(obj) {
			var request, xhrURL, defaultConfig, requestHeader, config;

			requestHeader = [
				{name: 'Accept', value: 'application/json'},
				{name: 'Accept-Charset', value: 'utf-8'},
				{name: 'Content-Type', value: 'application/json'},
				{name: 'Authorization', value: 'Basic ' + this.base64(this.publicKey + String.fromCharCode(58))}
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

			if (w.XMLHttpRequest) {
				request = new w.XMLHttpRequest();
			}
			else {
				if (w.ActiveXObject) {
					try {
						request = new w.ActiveXObject('MSXML2.XMLHTTP.6.0');
					}
					catch (e) {
						try {
							request = new w.ActiveXObject('MSXML2.XMLHTTP.3.0');
						}
						catch (es) {
							request = {};
						}
					}
				}
			}

			if (config.paymaya === true) {
				xhrURL = this._server() + config.url;
			}
			else {
				xhrURL = config.url;
			}

			request.open(config.method, xhrURL, config.async);

			requestHeader.forEach(function(obj) {
				request.setRequestHeader(obj.name, obj.value);
			});

			request.responseType = 'text';
			request.onreadystatechange = function() {
				switch (request.readyState) {
					case 0:
						break;
					case 1:
						break;
					case 2:
						break;
					case 3:
						break;
					case 4:
						switch (request.status) {
							case 200:
								config.success.call(this, request.responseText, request.responseType,request.statusText);
								break;
							case 404:
								config.error.call(this, request, request.statusText);
								break;
						}

						break;
					default:
						break;
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

			var obj = {}, i;
			var selector = 'input[name=number], input[name=expMonth], input[name=expYear], input[name=cvc]';
			var nlist = document.querySelector(id).querySelectorAll(selector);

			for (i = 0; i < nlist.length; i++) {
				obj[nlist[i].name] = nlist[i].value;
			}

			return obj;
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

			var obj = {}, i, requestData;
			var selector = 'input[name=amount], input[name=currency], input[name=firstName], input[name=middleName]' +
				', input[name=lastName], input[name=phone], input[name=email], input[name=line1], input[name=line2]' +
				', input[name=city], input[name=state], input[name=zipCode], input[name=countryCode]';

			var nlist = document.querySelector(id).querySelectorAll(selector);

			for (i = 0; i < nlist.length; i++) {
				obj[nlist[i].name] = nlist[i].value;
			}

			var tokenID = document.body.data.paymentTokenId;

			requestData = {
				paymentTokenId: tokenID,
				totalAmount: {
					amount: obj.amount || 0,
					currency: obj.currency || ''
				},
				buyer: {
					firstName: obj.firstName || '',
					middleName: obj.middleName || '',
					lastName: obj.lastName || '',
					contact: {
						phone: obj.phone || '',
						email: obj.email || ''
					},
					billingAddress: {
						line1: obj.line1 || '',
						line2: obj.line2 || '',
						city: obj.city || '',
						state: obj.state || '',
						zipCode: obj.zipCode || '',
						countryCode: obj.countryCode || ''
					}
				}
			};

			return requestData;
		},
		addPanel: function(url, callback) {
			if(typeof url !== 'string' && typeof callback !== 'function'){
				return false;
			}

			var d = document;
			var frameContainer = d.createElement('DIV');
			var frameBox = '<div id="paymaya-box"><div id="paymaya-border"></div></div>';
			var iframeDom = d.createElement('IFRAME');

			frameContainer.id = 'paymaya-container';
			frameContainer.innerHTML = frameBox;
			frameContainer.setAttribute('style', 'display: block;position: absolute;top: 0px;left: 0px;right: 0px;bottom: 0px;z-index: 9999;background-color: rgba(0,0,0,0.2);');

			d.body.appendChild(frameContainer);
			d.getElementById('paymaya-border').appendChild(iframeDom);

			var paymayaBox = d.getElementById('paymaya-box');
			paymayaBox.setAttribute('style', 'display: block;position: relative;margin-right: auto;margin-left: auto;border-radius: 10px 10px 10px 10px;-moz-border-radius: 10px 10px 10px 10px;-webkit-border-radius: 10px 10px 10px 10px;border: 0px solid #000000;z-index: 10000;background-color: rgba(0,0,0,0.3);');

			var paymayaBorder = d.getElementById('paymaya-border');
			paymayaBorder.setAttribute('style', 'display: block;position: absolute;top: 10px;bottom: 10px;left: 10px;right: 10px;overflow: hidden;background-color: #ffffff;');

			iframeDom.width = (parseInt(paymayaBox.style.width.toString().replace('px', '')) - 20) + 'px';
			iframeDom.height = (parseInt(paymayaBox.style.height.toString().replace('px', '')) - 20) + 'px';
			iframeDom.frameBorder = 0;
			iframeDom.scrolling = 'no';
			iframeDom.id = 'paymaya-render';
			iframeDom.sandbox = 'allow-forms allow-same-origin allow-scripts allow-top-navigation';
			iframeDom.setAttribute('style', 'display: block;position: absolute;top:0px;bottom:0px;left:0px;right:0px;border: none;overflow: hidden;background-color: transparent;');

			/*This must be changeable*/
			paymayaBox.style.marginTop = '100px';
			paymayaBox.style.width = '400px';
			paymayaBox.style.height = '400px';
			iframeDom.src = url;

			iframeDom.onload = function(e) {
				callback.call(this, e);
			};

			return true;
		},
		removePanel: function() {
			var d = document;
			var frameCont = d.getElementById('paymaya-container');
			d.body.removeChild(frameCont);
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
		}
	};

	w.PayMaya.data = {
			"paymentTokenId": "68aKLAN64CXK7XWDA1HwSE6COo",
			"totalAmount": {
				"amount": 100,
				"currency": "PHP"
			},
			"buyer": {
				"firstName": "Ysa",
				"middleName": "Cruz",
				"lastName": "Santos",
				"contact": {
					"phone": "+63(2)1234567890",
					"email": "paymayabuyer1@gmail.com"
				},
				"billingAddress": {
					"line1": "9F Robinsons Cybergate 3",
					"line2": "Pioneer Street",
					"city": "Mandaluyong City",
					"state": "Metro Manila",
					"zipCode": "12345",
					"countryCode": "PH"
				}
			}
		};

})(window);
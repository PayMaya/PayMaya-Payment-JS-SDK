//Namespace Declaration
var PayMaya = PayMaya || {};

//Constructor Declaration
//, paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear
PayMaya.Payments = function(pfKey) {

	this.pfKey = pfKey;

};


PayMaya.Payments.prototype.createPaymentToken = function(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, success, failure) {

	this.paymentForm = paymentForm;

	var formObj = { 
		cardNumber : cardNumber.value,
		cardCvc : cardCvc.value,
		cardExpiryMonth : cardExpiryMonth.value,
		cardExpiryYear : cardExpiryYear.value,
		success: success,
		failure: failure
	};

	return PayMaya.Payments.onFormProcessing(this.pfKey, this.paymentForm, formObj);
	
};

//Function
PayMaya.Payments.onFormProcessing = function(pfKey, paymentForm, formObj) {

	//console.log(formObj.success);
	
	var body;
	var dataArr;	
	var request;
	var encodedData;
	var errorMessage, successMessage;

	//paymentForm.onsubmit = function(e) {
	//	e.preventDefault();

		body = {
			'card' : {
				'number' : formObj.cardNumber, //'4242424242424242',
				'cvc' : formObj.cardCvc, //'123',
				'expMonth' : formObj.cardExpiryMonth, //'12',
				'expYear' : formObj.cardExpiryYear //'2016'
			}
		};

		//request = new XMLHttpRequest();
		request = PayMaya.Payments.getXMLHttpRequest();

		if (request != null) {

			request.open('POST', 'http://private-anon-5c87df497-paymayapaymentsapi.apiary-mock.com/payment-tokens');
			request.setRequestHeader('Content-Type', 'application/json');

			//request.setRequestHeader('Authorization', "Basic " + pfKey + ":");

			//encodedData = btoa(pfKey) + ":";
			encodedData = btoa(pfKey);
			request.setRequestHeader('Authorization', "Basic " + encodedData);

			//console.log(encodedData);
			//request.setRequestHeader('Authorization', "Basic " + btoa(pfKey + ":"));
			//request.setRequestHeader('Authorization', 'Basic ODUxMGY2OTEtOGMwYi00ZjI4LWJmYTAtYmNjZWQwY2IwZmQyOg==');

			request.onreadystatechange = function() {
				
				if (request.readyState === 4 /* All the data has been received */) {

	        		if (request.status === 200) /* OK */ {	     

	        			console.log('Status:', request.status);
						console.log('Headers:', request.getAllResponseHeaders());
						//console.log('Authoriazation:', request.getResponseHeader('Authorization'));
						//console.log('Body:', this.responseText);

						//Comment this if simulating the errors
						//Uncomment this if not simulating the errors
				  	 	dataArr = JSON.parse(request.responseText); 

						//START SIMULATION OF ERRORS
						//Sample Error 1
						//If Response has an error

						/*var responseText = {
							category: "payments-error", 
							message: "Payment token has been used already.", 
							code: "5001"
						};*/

						//Sample Error 2
						//If Response state property is "used" - Test idempotent


						/*var responseText = {
							id:           "ctok_fwe98ew89sd",
							env:          "sandbox",
							type:         "card",
							state:        "used", //Change "created" to "used" to check idempotent
							sourceIp:    "125.60.148.241",
							createdAt:   "2015-06-02T04:13:22.186Z",
							updatedAt:   "2015-06-02T04:13:22.186Z"						
						};*/


						//Comment this if not simulating the errors
						//Uncomment this if simulating the errors
						//dataArr = responseText;

						//console.log(dataArr.category);
						//END SIMULATION OF ERRORS

						if (dataArr.hasOwnProperty("id") && dataArr.id !== "" && dataArr.state === "created") { //When form processing: success

							//PM.removeClass(validation, 'passed failed');

							//process if id has a value
							//Verify the "id" if this is the response needed in step 2
							// base on the diagram
							/*
							console.log("id:" + dataArr.id); //PaymentToken
							// e.g ctok_fwe98ew89sd
							console.log("env:" + dataArr.env);
							// e.g sandbox
							console.log("type:" + dataArr.type);
							// e.g card
							console.log("state:" + dataArr.state);
							// e.g created
							console.log("sourceIp:" + dataArr.sourceIp);
							// e.g
							console.log("createdAt:" + dataArr.createdAt);
							// e.g
							console.log("createdAt:" + dataArr.updatedAt);
							*/

							//PM.removeClass(validation, 'passed');
							//PayMaya.Payments.success(dataArr);
							formObj.success(dataArr);


						} else if(dataArr.hasOwnProperty("id") && dataArr.id !== "" && dataArr.state === "used") {


							//PM.removeClass(validation, 'passed failed');
							
							//console.log('State has been change from "created" to "used"');

							errorMessage = 'State has been change from "created" to "used"';
							//PayMaya.Payments.error(errorMessage);
							formObj.failure(errorMessage);


						}

						//When form processing: Failed
						//if has a category property and category value is "payments-error"
						if (dataArr.hasOwnProperty("category") && dataArr.category === "payments-error") { 

							//PM.removeClass(validation, 'passed failed');						

							/* Example of payment-error
							{
							"category": "payments-error",
							"message":  "Payment token has been used already."
							"code":     "5001"
							}*/

							//process if has an error
							//Idempotence Error code
							if (dataArr.code === "5001") {

								//console.log(dataArr.message);
								// e.g Payment token has been used already.							
								//PayMaya.Payments.error(dataArr.message);
								formObj.failure(dataArr.message);

							}

						}

					} else { //Error Codes and Responses

						errorMessage = 'Error';
						//PayMaya.Payments.error(errorMessage);
						formObj.failure(errorMessage);

					}
					
				} 

			};
		
			request.send(JSON.stringify(body));

		} else {
    	
    		//console.log("AJAX (XMLHTTP) not supported.");
			errorMessage = 'AJAX (XMLHTTP) not supported.';
    		formObj.failure(errorMessage);
		
		}

	//}

}

PayMaya.Payments.getXMLHttpRequest = function()
{
    if (window.XMLHttpRequest) {
 
        return new window.XMLHttpRequest;
 
    }
    else {
        try {
 
            return new ActiveXObject("MSXML2.XMLHTTP.3.0");
 
        }
        catch(ex) {
 
            return null;
 
        }
    }
};


PayMaya.Payments.success = function(paymentToken) {

	//return document.querySelector('.validation').innerHTML = '<span class="success">' + 'Payment token: ' + paymentToken.id + '</span>';
	console.log(paymentToken.id);
	alert(paymentToken.id);

};


PayMaya.Payments.error = function(error) {

	//return document.querySelector('.validation').innerHTML = '<span class="error">' + 'Error: ' + error + '</span>';
	console.log(error);
	alert(error);

};


PayMaya.Payments.payMayaResponseHandler = function() {};



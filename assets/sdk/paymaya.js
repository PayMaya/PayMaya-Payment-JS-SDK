/* global ActiveXObject: false */
var PayMaya = PayMaya || {};

PayMaya.Payments = function(env, pfKey) {

  this.pfKey = pfKey;
  this.env = env;

  var getXMLHttpRequest = function getXMLHttpRequest() {

    var xhttp = null;

    if (window.XMLHttpRequest) {
      // Chome, Firefox, Opera 8.0+, Safari
      xhttp = new window.XMLHttpRequest();

    } else {

      try {
        // Internet Explorer
        xhttp = new ActiveXObject("MSXML2.XMLHTTP.3.0");

      } catch (ex) {

        return null;

      }

    }

    return xhttp;

  }; 

  this.onFormProcessing = function onFormProcessing(pfKey, paymentForm, formObj) {

    var url;
    var env;
    var body;
    var dataArr;
    var request;
    var encodedData;
    var errorMessage;  

    env = this.env;

    if (env !== '') {

      if (env === 'sandbox') {

        url = 'https://api.paymaya.com/sandbox/payments/payment-tokens';
        console.log(url);

      } else if(env === 'production') {

        url = 'production endpoint';  // TODO - Put production endpoint here
        console.log(url);
      }

      body = {
        'card': {
          'number': formObj.cardNumber.value,
          'cvc': formObj.cardCvc.value,
          'expMonth': formObj.cardExpiryMonth.value,
          'expYear': formObj.cardExpiryYear.value
        }
      };
      console.log(body);
      request = getXMLHttpRequest();

      if (request !== null) {

        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/json');

        encodedData = btoa(pfKey);
        request.setRequestHeader('Authorization', "Basic " + encodedData);

        request.onreadystatechange = function() {

          if (request.readyState === 4) {

              console.log('Status:', this.status);
              console.log('Headers:', this.getAllResponseHeaders());
              console.log('Body:', this.responseText);

            if (request.status === 200) {

              dataArr = JSON.parse(request.responseText);

              console.log(dataArr);

              if (dataArr.hasOwnProperty("paymentTokenId") && dataArr.paymentTokenId !== "" && dataArr.state === "created") {

                return formObj.success(dataArr);

              } else if (dataArr.hasOwnProperty("paymentTokenId") && dataArr.paymentTokenId !== "" && dataArr.state === "used") {

                errorMessage = 'State has been change from "created" to "used"';
                return formObj.failure(errorMessage);

              }

              if (dataArr.hasOwnProperty("category") && dataArr.category === "payments-error") {

                if (dataArr.code === "5001") {

                  return formObj.failure(dataArr.message);

                }

              }

            } else {

              errorMessage = 'Error';
              return formObj.failure(errorMessage);
              
              // TODO - Error codes and responses - https://staging-dev.paymaya.com/docs/e/payments

            }

          }

        };

        request.send(JSON.stringify(body));

      } else {

        errorMessage = 'AJAX (XMLHTTP) not supported.';
        return formObj.failure(errorMessage);

      }

    } else {

        errorMessage = 'Environment is not set';
        return formObj.failure(errorMessage);

    }

  };

};

PayMaya.Payments.prototype.createPaymentToken = function(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, success, failure) {

  this.paymentForm = paymentForm;
  
  this.formObj = {
    cardNumber: cardNumber,
    cardCvc: cardCvc,
    cardExpiryMonth: cardExpiryMonth,
    cardExpiryYear: cardExpiryYear,
    success: success,
    failure: failure
  };  

  return this.onFormProcessing(this.pfKey, this.paymentForm, this.formObj);

};
  
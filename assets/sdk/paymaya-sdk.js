/* global ActiveXObject: false */
var PayMaya = PayMaya || {};

PayMaya.Payments = function(pfKey) {

  this.pfKey = pfKey;

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

    var body;
    var dataArr;
    var request;
    var encodedData;
    var errorMessage;  

    body = {
      'card': {
        'number': formObj.cardNumber,
        'cvc': formObj.cardCvc,
        'expMonth': formObj.cardExpiryMonth,
        'expYear': formObj.cardExpiryYear
      }
    };

    request = getXMLHttpRequest();

    if (request !== null) {

      request.open('POST', 'http://private-anon-5c87df497-paymayapaymentsapi.apiary-mock.com/payment-tokens');
      request.setRequestHeader('Content-Type', 'application/json');

      encodedData = btoa(pfKey);
      request.setRequestHeader('Authorization', "Basic " + encodedData);

      request.onreadystatechange = function() {

        if (request.readyState === 4) {

          if (request.status === 200) {

            dataArr = JSON.parse(request.responseText);

            if (dataArr.hasOwnProperty("id") && dataArr.id !== "" && dataArr.state === "created") {

              return formObj.success(dataArr);

            } else if (dataArr.hasOwnProperty("id") && dataArr.id !== "" && dataArr.state === "used") {

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

          }

        }

      };

      request.send(JSON.stringify(body));

    } else {

      errorMessage = 'AJAX (XMLHTTP) not supported.';
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
  
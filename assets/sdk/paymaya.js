/* global ActiveXObject: false */
var PayMaya = PayMaya || {};

PayMaya.Payments = function(url, pfKey) {

  this.pfKey = pfKey;
  this.url = url;

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

    var url = this.url;
    var body;
    var dataArr;
    var request;
    var encodedData;
    var errorMessage;  

    console.log(url);
    body = {
      'card': {
        'number': formObj.cardNumber,
        'cvc': formObj.cardCvc,
        'expMonth': formObj.cardExpiryMonth,
        'expYear': formObj.cardExpiryYear
      }
    };

    //console.log(body.card);

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
    cardNumber: cardNumber.value,
    cardCvc: cardCvc.value,
    cardExpiryMonth: cardExpiryMonth.value,
    cardExpiryYear: cardExpiryYear.value,
    success: success,
    failure: failure
  };  

  return this.onFormProcessing(this.pfKey, this.paymentForm, this.formObj);

};
  
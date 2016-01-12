// TEST
// constructor
// createPaymentToken
var assert = chai.assert;
var expect = chai.expect;
should = chai.should();

var stub = sinon.stub();
var spyCallback = sinon.spy();
spyCallback(); // Invoke the spy callback function

var env = "sandbox"; //production
var paymayaPublicKey = "pk-sHQWci2P410ppwFQvsi7IQCpHsIjafy74jrhYb8qfxu";
var paymentForm = "#payment-form";
var cardNumber = "4242424242424242";
var cardCvc = "123";
var cardExpiryMonth = "12";
// Format: MM
var cardExpiryYear = "2016";
// Format: YYYY

// var validation = "";
// var paymentFormSubmitBtn = "";
var success = function() {};
var failure = function() {};


describe("PayMaya.Payments", function() {

  describe("constructor", function() {

    it("should set a paymaya's public facing key (pfKey) if provided", function() {

      // var payMayaPayments = new PayMaya.Payments("pk-sHQWci2P410ppwFQvsi7IQCpHsIjafy74jrhYb8qfxu");
      var payMayaPayments = new PayMaya.Payments(env, paymayaPublicKey + ':');

      // ASSERT
      assert.equal(payMayaPayments.pfKey, "pk-sHQWci2P410ppwFQvsi7IQCpHsIjafy74jrhYb8qfxu:");

    });

  });

  describe("#createPaymentToken", function() {

    it("should set payment form element id (#paymentForm)", function() {

      var payMayaPayments = new PayMaya.Payments(env, paymayaPublicKey + ':');
      payMayaPayments.createPaymentToken(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, success, failure);

      // ASSERT
      assert.equal(payMayaPayments.paymentForm, "#payment-form");

    });

    it("should set credit card number", function() {

      var payMayaPayments = new PayMaya.Payments(env, paymayaPublicKey + ':');
      payMayaPayments.createPaymentToken(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, success, failure);

      // ASSERT
      assert.equal(payMayaPayments.formObj.cardNumber, "4242424242424242");
      // assert.equal(payMayaPayments.cardNumber, cardNumber);
      
    });

    it("should set credit card cvc", function() {

      var payMayaPayments = new PayMaya.Payments(env, paymayaPublicKey + ':');
      payMayaPayments.createPaymentToken(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, success, failure);

      // ASSERT
      assert.equal(payMayaPayments.formObj.cardCvc, "123");
      // assert.equal(payMayaPayments.cardCvc, cardCvc);

    });

    it("should set credit card expiry month", function() {

      var payMayaPayments = new PayMaya.Payments(env, paymayaPublicKey + ':');
      payMayaPayments.createPaymentToken(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, success, failure);

      // ASSERT
      assert.equal(payMayaPayments.formObj.cardExpiryMonth, "12");
      // assert.equal(payMayaPayments.cardExpiryMonth, cardExpiryMonth);

    });

    it("should set credit card expiry year", function() {

      var payMayaPayments = new PayMaya.Payments(env, paymayaPublicKey + ':');
      payMayaPayments.createPaymentToken(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, success, failure);

      // ASSERT
      assert.equal(payMayaPayments.formObj.cardExpiryYear, "2016");
      // assert.equal(payMayaPayments.cardExpiryYear, cardExpiryYear);

    });
    
    it('should call onFormProcessing once', function() {
      
      var env = "sandbox"; //production
      var paymayaPublicKey = "pk-sHQWci2P410ppwFQvsi7IQCpHsIjafy74jrhYb8qfxu";
      var paymentForm = "#payment-form";
      var cardNumber = "4242424242424242";
      var cardCvc = "123";
      var cardExpiryMonth = "12"; // Format: MM
      var cardExpiryYear = "2016"; // Format: YYYY

      var success = function() {};
      var failure = function() {};      

      var payMayaPayments = new PayMaya.Payments(env, paymayaPublicKey + ':');

      var onFormProcessing = sinon.spy(payMayaPayments, 'onFormProcessing');

      payMayaPayments.createPaymentToken(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, success, failure);
  
      onFormProcessing.restore();
      sinon.assert.calledOnce(onFormProcessing);

    });

    it('should pass the payment token id into the success callback', function() {
      
      var env = "sandbox"; //production
      var paymayaPublicKey = "pk-sHQWci2P410ppwFQvsi7IQCpHsIjafy74jrhYb8qfxu";
      var paymentForm = "#payment-form";
      var cardNumber = "4242424242424242";
      var cardCvc = "123";
      var cardExpiryMonth = "12"; // Format: MM
      var cardExpiryYear = "2016"; // Format: YYYY

      var success = function(paymentToken) { return paymentToken.id };

      var failure = function() {};

      var payMayaPayments = new PayMaya.Payments(env, paymayaPublicKey + ':');
      var createPaymentToken = sinon.stub(payMayaPayments, 'createPaymentToken');

      var expectedResult = { success: true };
      createPaymentToken.yields(null, expectedResult);

      var successCallback = sinon.spy();
      payMayaPayments.createPaymentToken(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, successCallback, failure);

      
      createPaymentToken.restore();      
      sinon.assert.calledWith(successCallback, null, expectedResult);

    }); 

  });

});

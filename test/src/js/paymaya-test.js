//http://blog.codeship.com/mocha-js-chai-sinon-frontend-javascript-code-testing-tutorial/
//TEST
//constructor
//createPaymentToken

//var expect = chai.expect;
var assert = chai.assert;

var paymayaPublicKey = "bee386662c04e4c6f872b5d4b13b7b87bd84ac68f3a95b8998298b32cd";
var paymentForm = "#payment-form";
var cardNumber = "4242424242424242";
var cardCvc = "123";
var cardExpiryMonth = "12"; //Format: MM
var cardExpiryYear = "2016"; //Format: 2016
//var validation = "";
//var paymentFormSubmitBtn = "";
var success = function() {};
var failure = function() {};

describe("PayMaya.Payments", function() {

  describe("constructor", function() {
  
    it("should set a paymaya's public facing key (pfKey) if provided", function() {

      //var payMayaPayments = new PayMaya.Payments("bee386662c04e4c6f872b5d4b13b7b87bd84ac68f3a95b8998298b32cd");  
      var payMayaPayments = new PayMaya.Payments(paymayaPublicKey);  
      
      //ASSERT
      //assert.equal(payMayaPayments.pfKey, paymayaPublicKey);
      assert.equal(payMayaPayments.pfKey, "bee386662c04e4c6f872b5d4b13b7b87bd84ac68f3a95b8998298b32cd");
            
    });    

  });

  describe("#createPaymentToken", function(){

    it("should set payment form element id (#paymentForm)", function() {

      var payMayaPayments = new PayMaya.Payments(paymayaPublicKey);  
      payMayaPayments.createPaymentToken(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, success, failure);

      //ASSERT
      //assert.equal(payMayaPayments.paymentForm, paymentForm);
      assert.equal(payMayaPayments.paymentForm, "#payment-form");

    });


    it("should set credit card number", function() {

      var payMayaPayments = new PayMaya.Payments(paymayaPublicKey);  
      payMayaPayments.createPaymentToken(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, success, failure);

      //ASSERT            
      assert.equal(payMayaPayments.cardNumber, "4242424242424242");
      //assert.equal(payMayaPayments.cardNumber, cardNumber);
      
    });    


    it("should set credit card cvc", function() {

      var payMayaPayments = new PayMaya.Payments(paymayaPublicKey);  
      payMayaPayments.createPaymentToken(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, success, failure);

      //ASSERT            
      assert.equal(payMayaPayments.cardCvc, "123");
      //assert.equal(payMayaPayments.cardCvc, cardCvc);
      
    });        


    it("should set credit card expiry month", function() {

      var payMayaPayments = new PayMaya.Payments(paymayaPublicKey);  
      payMayaPayments.createPaymentToken(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, success, failure);

      //ASSERT            
      assert.equal(payMayaPayments.cardExpiryMonth, "12");
      //assert.equal(payMayaPayments.cardExpiryMonth, cardExpiryMonth);
      
    });            


    it("should set credit card expiry year", function() {

      var payMayaPayments = new PayMaya.Payments(paymayaPublicKey);  
      payMayaPayments.createPaymentToken(paymentForm, cardNumber, cardCvc, cardExpiryMonth, cardExpiryYear, success, failure);

      //ASSERT            
      assert.equal(payMayaPayments.cardExpiryYear, "2016");
      //assert.equal(payMayaPayments.cardExpiryYear, cardExpiryYear);
      
    });                

  });
  
});
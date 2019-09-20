var Upstox = require("upstox");

var upstox = new Upstox("hfQWSWyAyK5mU5pBAYA6GaWgnOpRhJ307CtRo1RP");

var loginUrl = upstox.getLoginUri("http://localhost:8080/kiteauthred/upstox");
console.log(loginUrl)

     var params = {
         "apiSecret" : "2duv6utg3e",
         "code" : "your_code_generated_in login",
         "redirect_uri" : "your_redirect_uri"
     };

 var accessToken;

 upstox.getAccessToken(params)
     .then(function(response) {
       accessToken = response.access_token;
     })
     .catch(function(err) {
         // handle error 
     });
/*
    description: utils.js
    		- provides various utility functions
                
    date created: 31/12/15
    log:-
       	Update 1: 01/01/2016          Author: Sarthak
       		
       		- Update description : 
       				1. Indenting code
		
		Update 2: 02/01/2016		 Author: Sarthak
			- Update description :
					1. Added getGenericError() method

       	latest update: 02/01/2016     Update 2          
    
    Listed Methods:
    	1. getInternalServerError 
    	2. sendUserSms : 
    	3. getMobileOtp : 
    	4. addTime : 
    	5. cryptPassword : 
    	6. comparePassword : 
    	7. getReferralCode :
    	8. getSellerResponseData :
    	9. getGenericError : 
*/

// built in package, used for generating accessToken
var uuid = require('uuid4');
var request = require('request');
var constants = require('./constants');
var pushNotify = require('./pushNotify');
var bcrypt = require('bcrypt');
var Hashids = require("hashids"),
referralHashId = new Hashids("ainaa007Referral",8);
qrCodeHashId = new Hashids("ainaa007QrCode",30);


module.exports = {
	
	/**
	*	This method is for generating internal errors
	*	
	*	@method getInternalServerError
	*	@param {err} contains the error details (?????)
	*	@return {error} returns the generated error
	*/
	getInternalServerError : function(err)
	{
		console.log(err);
		var error = new Error('Something went wrong, make a retry !');
		error.statusCode = 500;
		error.name = "Oh Ah";
		return error;
	},


	/**
	*	This method is for sending push
	*	
	*	@method getInternalServerError
	*	@param {data} contains the error details (?????)
	*	@param {accessToken} contains the error details (?????)
	*	@param {} contains the error details (?????)
	*	@return {error} returns the generated error
	*/
	sendPush : function(data, gcms)
	{
		process.nextTick(function(){
			gcms.forEach(function(gcm){
				pushNotify.addGcm(gcm.androidKey);
			});
			pushNotify.addData(data);
			pushNotify.send();
			console.log("Push Sent");
		});
		//pushNotify.addNotificationData(data);
		
	},



	/**
	*	This method is used to send caprcha req to google
	*	
	*	@method sendUserSMS
	*	@param {mobile} the mobile number to send the sms to
	*	@param {text} the designated text field
	*	@param {otp} the generated otp
	*	@return {void}
	*/
	sendCaptchaResponse : function(data)
	{
		request.post(
			'https://www.google.com/recaptcha/api/siteverify',
			data, function (error, response, body) 
			{
				if (!error && response.statusCode == 200) {
            		console.log("go ",body)
        		}
        		else{
        			return false;
        		}
        	});										
	},


	/**
	*	This method is used to send sms to the user
	*	
	*	@method sendUserSMS
	*	@param {mobile} the mobile number to send the sms to
	*	@param {text} the designated text field
	*	@param {otp} the generated otp
	*	@return {void}
	*/
	sendOtpSMS : function(mobile, text, otp)
	{
		text = text.replace("MOBILE_OTP_HERE", otp);
		var sms_option = constants.SMS_OPTION.replace('MOBILE_HERE', mobile);
		sms_option = sms_option.replace('TEXT_HERE', text);
		request(sms_option, function (error, response, body) 
		{
			if (error) 
			{
				console.log(error);
			}
		});										
	},



	/**
	*	This method is used to send sms to the user
	*	
	*	@method sendSMS
	*	@param {mobile} the mobile number to send the sms to
	*	@param {text} the designated text field
	*	@return {void}
	*/
	sendSMS : function(mobile, text)
	{
		var sms_option = constants.SMS_OPTION.replace('MOBILE_HERE', mobile);
		sms_option = sms_option.replace('TEXT_HERE', text);
		request(sms_option, function (error, response, body) 
		{
			if (error) 
			{
				console.log(error);
			}
		});										
	},


	/**
	*	This method returns mobileOtp
	*	
	*	@method getMobileOtp
	*	@return {otp} returns the generated otp
	*/
	getMobileOtp : function()
	{
		return Math.floor(Math.random() * (constants.MOBILE_OTP_HIGH - constants.MOBILE_OTP_LOW) + constants.MOBILE_OTP_LOW);
	},


	/**
	*	This method is used to add specific duration to the current time
	*	
	*	@method addTime
	*	@param {currentTime} designates the current time
	*	@param {duration} duration to be added
	*	@return {date} returns a new Date object
	*/
	addTime : function(currentTime, duration)
	{
		return new Date(currentTime.getTime() + duration*60000); // 60000 is for converting minute to sec
	},


	/**
	*	This method is for encryption of the given password
	*	
	*	@method cryptPassword
	*	@param {password} password field
	*	@param {callback} designated callback function
	*	@return {callback} returns the callback function with proper fields
	*/
	cryptPassword : function (password, callback) 
	{
   		bcrypt.genSalt(10, function(err, salt) 
   		{
    		if (err) 
      		return callback(err);
    		bcrypt.hash(password, salt, function(err, hash) 
    		{
      			return callback(err, hash);
    		});
  		});
	},


	/**
	*	This method is for comparing password
	*	
	*	@method comparePassword
	*	@param {password} represents the entered password
	*	@param {userPassword} represents the userPassword (??)
	*	@param {callback} designated callback function
	*	@return {callback} returns the callback function with proper fields
	*/
	comparePassword : function (password, userPassword, callback) {
   		bcrypt.compare(password, userPassword, function(err, isPasswordMatch) 
   		{
      		if (err) 
        		return callback(err);
      		
      		return callback(null, isPasswordMatch);
   		});
	},


	/**
	*	This method returns the corresponding referral code
	*	
	*	@method getReferralCode
	*	@param {mobile} contains the mobile for which referral code is to be returned
	*	@return {referralCode} returns the designated referral code
	*/
	getReferralCode : function(mobile){
		return referralHashId.encode(parseInt(mobile));
	},


	/**
	*	This method returns the corresponding Qr Code
	*	
	*	@method getQrCode
	*	@param {mobile} contains the mobile for which QR code is to be returned
	*	@return {qrCode} returns the designated QR code
	*/
	encodeQrCode : function(mobile){
		return qrCodeHashId.encode(parseInt(mobile));
	},

	/**
	*	This method returns the corresponding parsed qrCode
	*	
	*	@method getQrCode
	*	@param {qrCode} contains the mobile for which QR code is to be returned
	*	@return {parsedQrCode} returns the designated QR code
	*/
	decodeQrCode : function(qrCode){
		return qrCodeHashId.decode(parseInt(mobile));
	},




	/**
	*	This method returns user corresponding to the "data" field
	*	
	*	@method getSellerResponseData
	*	@param {data} the designated data field for which seller is generated
	*	@return {seller} returns the generated seller object
	*/	
	getSellerResponseData : function(data){
		var seller = {};
		seller.id = data.id;
		seller.name = data.name;
		seller.shopName = data.shopName;
		seller.email = data.email;
		seller.address = data.address;
		seller.shopType = data.shopTypeName;
		seller.mobile = data.mobile;
		seller.created = data.created;
		seller.lastUpdated = data.lastUpdated;
		seller.qrCode = data.qrCode;
		return seller;
	},

	/**
	 * @brief This methoid returns user corresponding to the data fields
	 * @details [long description]
	 * 
	 * @param  {data} the designated data field for which seller is generated 
	 * 	@return {buyer} returns the generated buyer object
	 */
	getBuyerResponseData : function(data){
		var buyer = {};
		buyer.id = data.id;
		buyer.name = data.name;
		buyer.email = data.email;
		buyer.address = data.address;
		buyer.mobile = data.mobile;
		buyer.created = data.created;
		buyer.lastUpdated = data.lastUpdated;
		buyer.qrCode = data.qrCode;
		return buyer;
	},


	/**
	*	This method is for creating generic errors, and is used VERY FREQUENTLY during field validation
	*	
	*	@method getGenericError
	*	@param {errorMessage} contains the designated error Message
	*	@param {errorStatusCode} contains the corresponding status code of the error
	*	@param {errorName} contains the corresponding error name
	*	@return {error} returns the generated error
	*/
	getGenericError : function(errorMessage, errorStatusCode, errorName){
		var error = new Error(errorMessage);
		error.statusCode = errorStatusCode;
		error.name = errorName;
		return error;
	},

	/**
	* 
	*/
	updateUserAccessToken : function(AccessTokenx, id, userId, scope, cb){
		var currentTime = new Date();
		if(id){
			process.nextTick(function(){
				AccessTokenx.findById(id, function(err,accessTokenInstance){
					if(err){
						console.log(err);
						var error = new Error('Something went wrong, make a retry !');
						error.statusCode = 500;
						error.name = "Oh Ah";
						cb(error);
						return;
					}
					if(accessTokenInstance){
						if(scope == constants.ANDROID_SCOPE){
							accessTokenInstance.expiry = new Date(currentTime.getTime() + constants.ANDROID_ACCESS_TOKEN_TIME*60000);
						}
						else if(scope == constants.IOS_SCOPE){
							accessTokenInstance.expiry = new Date(currentTime.getTime() + constants.IOS_ACCESS_TOKEN_TIME*60000);
						}
						else if(scope == constants.WEB_SCOPE){
							accessTokenInstance.expiry = new Date(currentTime.getTime() + constants.WEB_ACCESS_TOKEN_TIME*60000);
						}
						else{
							accessTokenInstance.expiry = new Date(currentTime.getTime() + constants.REGISTRATION_ACCESS_TOKEN_TIME*60000);
						}
						accessTokenInstance.save(function(err,instance){
							if(err){
								console.log(err);
								var error = new Error('Something went wrong, make a retry !');
								error.statusCode = 500;
								error.name = "Oh Ah";
								cb(error);
								return;
							}
							cb(null, instance.id);
							return;
						});	
					}
					else{
						var accessToken = {};
						accessToken.id = uuid();
						accessToken.created = currentTime;
						accessToken.userId = userId;
						if(scope == constants.ANDROID_SCOPE){
							accessTokenInstance.expiry = new Date(currentTime.getTime() + constants.ANDROID_ACCESS_TOKEN_TIME*60000);
						}
						else if(scope == constants.IOS_SCOPE){
							accessTokenInstance.expiry = new Date(currentTime.getTime() + constants.IOS_ACCESS_TOKEN_TIME*60000);
						}
						else if(scope == constants.WEB_SCOPE){
							accessTokenInstance.expiry = new Date(currentTime.getTime() + constants.WEB_ACCESS_TOKEN_TIME*60000);
						}
						else{
							accessTokenInstance.expiry = new Date(currentTime.getTime() + constants.REGISTRATION_ACCESS_TOKEN_TIME*60000);
						}
						AccessTokenx.create(accessToken, function(err,accessTokenInstance){
							if(err){
								console.log(err);
								var error = new Error('Something went wrong, make a retry !');
								error.statusCode = 500;
								error.name = "Oh Ah";
								cb(error);
								return;	
							}	

							cb(null , accessTokenInstance.id);
							return;
						});
					}
				});
			});
		}else{
			process.nextTick(function(){
				var accessToken = {};
				accessToken.id = uuid();
				accessToken.created = currentTime;
				accessToken.userId = userId;
				if(scope === constants.ANDROID_SCOPE)
					accessToken.expiry = new Date(currentTime.getTime() + constants.WEB_ACCESS_TOKEN_TIME*60000);
				else if(scope === constants.IOS_SCOPE)
					accessToken.expiry = new Date(currentTime.getTime() + constants.IOS_ACCESS_TOKEN_TIME*60000);
				else if(scope === constants.WEB_SCOPE)
					accessToken.expiry = new Date(currentTime.getTime() + constants.WEB_ACCESS_TOKEN_TIME*60000);
				else
					accessToken.expiry = new Date(currentTime.getTime() + constants.REGISTRATION_ACCESS_TOKEN_TIME*60000);
					AccessTokenx.create(accessToken, function(err,accessTokenInstance){
					if(err){
						
						console.log(err);
						var error = new Error('Something went wrong, make a retry !');
						error.statusCode = 500;
						error.name = "Oh Ah";
						cb(error);
						return;	
					}	
					cb(null , accessTokenInstance.id);
					return;
				});
			});
		}
	}

}
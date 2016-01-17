/**
*    description: seller.js
*    		- definition of the seller module
*                
*    date created: 03/01/16
*    log:-
*    	Update 1: 04/01/2016		Author: Sarthak
*    	Latest update: Update 1
*    
*    Listed Methods:
*    	1. createSeller : used to create a seller 
*		2. updateSeller : used to update an existing buyer 
*		3. verifyMobile() : used to verify mobile
*		4. resendMobileOtp() : used to resend mobile otp
*		5. login() : for logging in seller
*		6. updateProfile() : for updating seller profile
*		7. forgotPassword() : executed when seller forgets password
*		8. resetPassword() : for resetting password
*		9. logout() : for logging out the seller
*		10. verifyMobileCredentials() : for verifying mobile credentials
*/

var validator = require('validator');		// built in validator
var exValidator = require('../../common/exValidator');		// custom validator defined in commons
var utils = require("../../common/utils");		// utils contain common utility methods
var constants = require('../../common/constants');		// constants contain application level constants
var uuid = require('uuid4');		// built in package, used for generating accessToken

var REALM = 'seller';

module.exports = function(Seller) {

	/**
	*	This method is for registering Seller user.
	*	
	*	@method register
	*	@param {query} query contains shopName, mobile, [gcmKey], scope
	*				 	[createdLocation], locale, [deviceId]
	*	@param {cb} callback function
	*	@return {response} response is either instance or error
	*/
	Seller.register = function(query, cb){
		
		/*
			Function for creating a new Seller, if mobile number is not registered
		*/
		function createSeller(query , cb){
			var currentTime = new Date();
			var userData = {};
			userData.mobile = query.mobile;
			userData.realm = REALM;
			userData.shopName = query.shopName;
			userData.locale = query.locale;
			userData.created = currentTime;
			// userData.lastUpdated = currentTime;
			userData.createdLocation = query.createdLocation;
			Seller.create(userData, function(err, instance){
				if(err){
					cb(utils.getInternalServerError(err));
					return;
				}
				if(query.deviceId){
					instance.registrationDevice.create({"deviceId": query.deviceId, "created": currentTime, "realm": REALM}, function(err, deviceInstance){
						if(err){
							instance.destroy(function(){});
							cb(utils.getInternalServerError(err));
							return;
						}
					});
				}
				if(query.gcmKey){
					var gcm = {};
					if(query.scope == constants.ANDROID_SCOPE){
						gcm.androidKey = query.gcmKey;
						gcm.androidKeyCreated = currentTime;
						gcm.androidKeyExpiry = utils.addTime(currentTime, constants.ANDROID_GCM_KEY_TIME);
					}
					else if(query.scope == constants.IOS_SCOPE){
						gcm.iosKey = query.gcmKey;
						gcm.iosKeyCreated = currentTime;
						gcm.iosKeyExpiry = utils.addTime(currentTime, constants.IOS_GCM_KEY_TIME);
					}else{
						gcm.webKey = query.gcmKey;
						gcm.webKeyCreated = currentTime;
						gcm.webKeyExpiry = utils.addTime(currentTime, constants.WEB_GCM_KEY_TIME);
					}
					gcm.realm = REALM;
					instance.gcms.create(gcm, function(err, gcmInstance){
						if(err){
							instance.destroy(function(){});
							cb(utils.getInternalServerError(err));
							return;
						}
					});
				}
				var accessToken = {};
				accessToken.id = uuid();
				accessToken.created = currentTime;
				accessToken.expiry = utils.addTime(currentTime, constants.REGISTRATION_ACCESS_TOKEN_TIME);
				instance.accessTokenxs.create(accessToken, function(err, accessTokenInstance)
				{
					if(err){	
						instance.destroy(function(){});
						cb(utils.getInternalServerError(err));
						return;
					}
					instance.accessToken = accessTokenInstance.id;
					var otpData = {};
					otpData.mobileOtp = utils.getMobileOtp();
					otpData.mobileOtpExpiry = utils.addTime(currentTime, constants.MOBILE_OTP_TIME);
					instance.otp.update(otpData, function(err, otpInstance){
						if(err){
							instance.destroy(function(){});
							cb(utils.getInternalServerError(err));
							return;
						}
						utils.sendOtpSMS(instance.mobile, constants.MOBILE_OTP_MESSAGE, otpInstance.mobileOtp);
						cb(null, instance);
						return;
					});
				});
			});
		}

		/*
			Function for updating an existing Seller, if mobile number is registered but not verified
		*/
		function updateSeller(instance, query , cb){
			var currentTime = new Date();
			var userData = {};
			userData.mobile = query.mobile;
			userData.realm = REALM;
			userData.shopName = query.shopName;
			userData.locale = query.locale;
			userData.created = currentTime;
			// userData.lastUpdated = currentTime;
			userData.createdLocation = query.createdLocation;
			/**
			*	Seller.create() function:
			*			- Checks the incoming query and creates a new Seller in accordance to the query
			*/

			instance.updateAttributes(userData, function(err, instance){
				if(err){
					cb(utils.getInternalServerError(err));
					return;
				}
				if(query.deviceId){
					instance.registrationDevice.create({"deviceId": query.deviceId, "created": currentTime, "realm": REALM}, function(err, deviceInstance){
						if(err){
							instance.destroy(function(){});
							cb(utils.getInternalServerError(err));
							return;
						}
					});
				}
				if(query.gcmKey){
					var gcm = {};
					if(query.scope == constants.ANDROID_SCOPE){
						gcm.androidKey = query.gcmKey;
						gcm.androidKeyCreated = currentTime;
						gcm.androidKeyExpiry = utils.addTime(currentTime, constants.ANDROID_GCM_KEY_TIME);
					}
					else if(query.scope == constants.IOS_SCOPE){
						gcm.iosKey = query.gcmKey;
						gcm.iosKeyCreated = currentTime;
						gcm.iosKeyExpiry = utils.addTime(currentTime, constants.IOS_GCM_KEY_TIME);
					}else{
						gcm.webKey = query.gcmKey;
						gcm.webKeyCreated = currentTime;
						gcm.webKeyExpiry = utils.addTime(currentTime, constants.WEB_GCM_KEY_TIME);
					}
					gcm.realm = REALM;
					instance.gcms.create(gcm, function(err, gcmInstance){
						if(err){
							instance.destroy(function(){});
							cb(utils.getInternalServerError(err));
							return;
						}
					});
				}
				var accessToken = {};
				accessToken.id = uuid();
				accessToken.created = currentTime;
				accessToken.expiry = utils.addTime(currentTime, constants.REGISTRATION_ACCESS_TOKEN_TIME);
				instance.accessTokenxs.create(accessToken, function(err, accessTokenInstance){
					if(err){	
						instance.destroy(function(){});
						cb(utils.getInternalServerError(err));
						return;
					}
					instance.accessToken = accessTokenInstance.id;
					var otp = {};
					otp.mobileOtp = utils.getMobileOtp();
					otp.mobileOtpExpiry = utils.addTime(currentTime, constants.MOBILE_OTP_TIME);
					instance.otp.update(otp, function(err, otpInstance){
						if(err){
							instance.destroy(function(){});
							cb(utils.getInternalServerError(err));
							return;
						}
						utils.sendOtpSMS(instance.mobile, constants.MOBILE_OTP_MESSAGE, otpInstance.mobileOtp);
						cb(null, instance);
						return;
					});
				});
			});
		}

		/*
			Main Code Work Starts here
		*/

		// check for empty object
		if(exValidator.isEmptyObject(query)){
			cb(utils.getGenericError("Data not received",
				400,"Error"));
			return;
		}

		//validates seller's shopName
		if(!exValidator.isName(query.shopName)){
			cb(utils.getGenericError("Shop name is invalid",
				403,"Error"));
			return;
		}

		//validate scope here
		if(!exValidator.isScope(query.scope)){
			cb(utils.getGenericError("Scope is invalid",
				400,"Error"));
			return;
		}


		//validate locale here
		if(query.locale && !exValidator.isLocale(query.locale)){
			cb(utils.getGenericError("Locale is invalid",
				400,"Error"));
			return;
		}

		
		//check mobile exists or not
		if(!exValidator.isMobileExists(query.locale, query.mobile)){
			cb(utils.getGenericError("Mobile number is invalid",
				403,"Error"));
			return;
		}

		else{			
            Seller.findOne({where: {mobile: query.mobile}}, function(err, userInstance){
				/*
					Finds a Seller in accordance with the Specified data
				*/
				if(err){
                    cb(utils.getInternalServerError(err));
                    return;
				}    
				//if a userInstance exists
			    if(userInstance){
                    //if userInstance has a mobile which is already verified
					if(userInstance.mobileVerified == true){
						cb(utils.getGenericError("mobile number is already registered",
							403,"Sorry"));
						return;
					}
                    
                    //if the given userInstance has an unverified mobile
                    if(userInstance.mobileVerified == false){
                        updateSeller(userInstance, query, function(err, instance){
                            if(err){
                                cb(err);
							    return;
							}
							var response = utils.getSellerResponseData(instance);
							response.accessToken = instance.accessToken;
							cb(null, response);
							return;
						});                        
                    }			
				}
                //when no user instance exists
                else{
                    //create the Seller anyway
                    createSeller(query,function (err, instance){
                        if(err){
                            cb(err);
                            return;
                        }
                        var response = utils.getSellerResponseData(instance);
						response.accessToken = instance.accessToken;	
						cb(null, response);
						return;
                    });
                }
            });    			
		}
	}
	
	Seller.remoteMethod(
		'register',
		{
			description: "Register mobile number of user",
			accepts: {arg: 'query', type: 'object', required: true, http: { source: 'body' }},
			returns: {arg:'response',type:'object'},
			http: {path: '/register', verb: 'post'}         
		}	
	);




	/**
	*	This method is for verifyMobile Seller user.
	*	
	*	@method verifyMobile
	*	@param {required} contains id, accessToken, scope, mobile
	*	@param {data} contains mobileOtp, password
	*	@param {cb} callback function
	*	@return {response} response is either instance or error
	*/

	Seller.verifyMobile = function(required, data, cb){

		// current time stamp
		var currentTime = new Date();
		
		// checks for empty required and data
		if(exValidator.isEmptyObject(required) && exValidator.isEmptyObject(data)){
			cb(utils.getGenericError("Data not received",
				400,"Error"));
			return;
		}
		console.log("bhahah "+JSON.stringify(required));
		// validate required data
		if(!exValidator.isValidRequired(required)){
			cb(utils.getGenericError("Received data is invalid",
				400,"Error"));
			return;
		}

		// validates mobile OTP
		console.log(data);
		console.log(data.mobileOtp);
		if(!exValidator.isMobileOtp(data.mobileOtp)){
			cb(utils.getGenericError("Mobile OTP is invalid",
				403,"Error"));
			return;
		}

		// validates password
		else if(!exValidator.isPassword(data.password)){
			cb(utils.getGenericError("Password is should be 6 to 30 characters",
				403,"Error"));
			return;
		}

		// find seller using id, accessToken, mobile and including otp, accessTokenxs
		Seller.findOne({include: ['otp', {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}], where: {id: required.id, mobile: required.mobile, mobileVerified: false}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(!instance || exValidator.isEmptyObject(instance)){
				cb(utils.getGenericError("Mobile OTP is wrong",
					403,"Sorry"));
				return;
			}
			if(instance.otp().mobileOtp == data.mobileOtp && currentTime < instance.otp().mobileOtpExpiry && currentTime < instance.accessTokenxs()[0].expiry){
				
				utils.cryptPassword(data.password, function(err, hashedPassword){
					var sellerData = {};
					sellerData.password = hashedPassword;
					sellerData.mobileVerified = true;
					Seller.updateAll({id: required.id}, sellerData, function(err, count){
						if(err){
							cb(utils.getInternalServerError(err));
							return;
						}
						var accessToken = {};
						accessToken.id = uuid();
						accessToken.created = currentTime;

						if(required.scope == constants.ANDROID_SCOPE)
							accessToken.expiry = utils.addTime(currentTime, constants.ANDROID_ACCESS_TOKEN_TIME);
						else if(required.scope == constants.IOS_SCOPE)
							accessToken.expiry = utils.addTime(currentTime, constants.IOS_ACCESS_TOKEN_TIME);
						else
							accessToken.expiry = utils.addTime(currentTime, constants.WEB_ACCESS_TOKEN_TIME);

						instance.accessTokenxs.create(accessToken, function(err, accessTokenInstance){
							if(err){
								instance.destroy(function(){});
								cb(utils.getInternalServerError(err));
								return;
							}
							var response = {};
							response = utils.getSellerResponseData(instance);
							response.accessToken = accessTokenInstance.id;
							cb(null, response);
							return;
						});
					})
				});
			}else{
				cb(utils.getGenericError("Mobile OTP is wrong",
					403,"Sorry"));
				return;
			}
		});
	}

	Seller.remoteMethod(
		'verifyMobile',
		{
			description: "Confirm Mobile number",
			accepts: [
						{arg: 'required', type: 'object', required: true},
          				{arg: 'data', type: 'object', required: true}
        			],
			returns: {arg:'response',type:'object'},
			http: {path: '/verifyMobile', verb: 'post'}         
		}	
	);



	/**
	*	This method resends Mobile Otp.
	*	
	*	@method resendMobileOtp
	*	@param {required} contains id, accessToken, scope, mobile
	*	@param {data} contains null
	*	@param {cb} callback function
	*	@return {response} response is either instance or error
	*/

	Seller.resendMobileOtp = function(required, data , cb){

		var isCaptchaOn = false;
		var currentTime = new Date();
		if(exValidator.isEmptyObject(required)){
			cb(utils.getGenericError("Data is not received",
				400,"Sorry"));
		}
		if(!exValidator.isValidRequired(required)){
			cb(utils.getGenericError("Data is invalid",
				400,"Sorry"));
		}
		Seller.findOne({include: ['hitCount', {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}], where: {id: required.id, mobile: required.mobile}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(!instance || exValidator.isEmptyObject(instance)){
				cb(utils.getGenericError("You are not authorised",
					401,"Sorry"));
				return;
			}
			if(required.scope == constants.SCOPE_WEB && 
				instance.hitCount() && 
				instance.hitCount().resendMobileOtp === constants.RESEND_MOBILE_OTP_HIT_COUNT && 
				currentTime > instance.hitCount().verifyMobileExpiry){

				console.log("1aaaa");
				isCaptchaOn = true;
				resend(instance, isCaptchaOn, function(err, isSent){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}
					cb(null, isSent);
					return;
				});
			}else if(required.scope == constants.SCOPE_WEB && 
				instance.hitCount() && 
				instance.hitCount().resendMobileOtp > constants.RESEND_MOBILE_OTP_HIT_COUNT && 
				currentTime > instance.hitCount().verifyMobileExpiry){

				console.log("2aaaa");
				isCaptchaOn = true;
				if(data.g-recaptcha-response){
					var captchaData = {};
					captchaData.secret = constants.GOOGLE_CAPTCHA_REQUEST;
					captchaData.response = data.g-recaptcha-response;

					var res = utils.sendCaptchaResponse(captchaData);
					if(res){
						resend(instance, isCaptchaOn, function(err, isSent){
							if(err){
								cb(utils.getInternalServerError(err));
								return;
							}
							cb(null, isSent);
							return;
						})
					}
				}else{
					cb(utils.getGenericError("Invalid Recaptcha",
						403,"Oops"));
					return;
				}
			}else{
				console.log("3aaaa");
				resend(instance, isCaptchaOn, function(err, isSent){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}
					cb(null, isSent);
					return;
				});
			}
			
		});


		function resend(instance, isCaptchaOn, cb){
			if(instance.accessTokenxs()[0] && currentTime < instance.accessTokenxs()[0].expiry){
				var accessToken = {};
				accessToken.id = uuid();
				accessToken.created = currentTime;
				accessToken.expiry = utils.addTime(currentTime, constants.REGISTRATION_ACCESS_TOKEN_TIME);
				instance.accessTokenxs.create(accessToken, function(err, accessTokenInstance){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}
					var otp = {};
					otp.mobileOtp = utils.getMobileOtp();
					otp.mobileOtpExpiry = utils.addTime(currentTime, constants.MOBILE_OTP_TIME);
					instance.otp.update(otp, function(err, otpInstance){
						if(err){
							accessTokenInstance.destroy(function(){});
							cb(utils.getInternalServerError(err));
							return;
						}
						if(required.scope == constants.WEB_SCOPE){
							var resendMobileOtpHitData = {};
							resendMobileOtpHitData.verifyMobileExpiry = utils.addTime(currentTime, constants.RESEND_MOBILE_OTP_HIT_TIME);
							if(instance.hitCount() && instance.hitCount().resendMobileOtp)
								resendMobileOtpHitData.resendMobileOtp = instance.hitCount().resendMobileOtp + 1;

							instance.hitCount.update(resendMobileOtpHitData, function(err, resendMobileOtpHitInstance){
								if(err){
									instance.destroy(function(){});
									cb(utils.getInternalServerError(err));
									return;
								}
							});
						}
						
						utils.sendOtpSMS(instance.mobile, constants.MOBILE_OTP_MESSAGE, otpInstance.mobileOtp);
						var response = {};
						response.id = instance.id;
						response.mobile = instance.mobile;
						response.accessToken = accessTokenInstance.id;
						response.isCaptchaOn = isCaptchaOn;
						cb(null, response);
						
					});
				});
			}else{
				cb(utils.getGenericError("You are not authorised",
				401,"Sorry"));
			}
		}
	}

	Seller.remoteMethod(
		'resendMobileOtp',
		{
			description: "Resend Mobile Otp to requested Mobile",
			accepts: [
						{arg: 'required', type: 'object', required: true},
          				{arg: 'data', type: 'object', required: true}
        			],
			returns: {arg:'response',type:'object'},
			http: {path: '/resendMobileOtp', verb: 'post'}         
		}	
	);




	/**
	*	This method is to login Seller.
	*	
	*	@method login
	*	@param {credentials} contains mobile, password, scope, gcmKey
	*	@param {cb} callback function
	*	@return {response} response is either instance or error
	*/

	Seller.login = function(credentials, cb){
		
		var currentTime = new Date();		
		if(exValidator.isEmptyObject(credentials)){
			cb(utils.getGenericError("Data not received",
				403,"Oops"));
			return;
		}
		
		if(!exValidator.isMobile(credentials.mobile)){
			cb(utils.getGenericError("Mobile is invalid",
				403,"Error"));
			return;
		}

		if(!exValidator.isPassword(credentials.password)){
			cb(utils.getGenericError("Password is invalid",
				403,"Error"));
			return;
		}

		//check scope here
		if(!exValidator.isScope(credentials.scope)){
			cb(utils.getGenericError("Scope is invalid",
				400,"Error"));
			return;
		}


		Seller.findOne({include: 'shopType', where: {mobile: credentials.mobile, mobileVerified : true}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			
			if(!instance || exValidator.isEmptyObject(instance)){
				cb(utils.getGenericError("Mobile is not registered",
					403,"Error"));
				return;
			}
			
			utils.comparePassword(credentials.password, instance.password, function(err, isMatched){
				if(err){
					cb(utils.getInternalServerError(err));
					return;
				}
				
				if(!isMatched){
					cb(utils.getGenericError("password is incorrect",
						403,"Error"));
				}
				if(credentials.gcmKey){
					var gcm = {};
					if(credentials.scope == constants.ANDROID_SCOPE){
						gcm.androidKey = credentials.gcmKey;
						gcm.androidKeyCreated = currentTime;
						gcm.androidKeyExpiry = utils.addTime(currentTime, constants.ANDROID_GCM_KEY_TIME);
					}
					else if(credentials.scope == constants.IOS_SCOPE){
						gcm.iosKey = credentials.gcmKey;
						gcm.iosKeyCreated = currentTime;
						gcm.iosKeyExpiry = utils.addTime(currentTime, constants.IOS_GCM_KEY_TIME);
					}else{
						gcm.webKey = query.gcmKey;
						gcm.webKeyCreated = currentTime;
						gcm.webKeyExpiry = utils.addTime(currentTime, constants.WEB_GCM_KEY_TIME);
					}
					gcm.realm = REALM;
					instance.gcms.create(gcm, function(err, deviceInstance){
						if(err){
							cb(utils.getInternalServerError(err));
							return;
						}
					});
				}

				var accessToken = {};
				accessToken.id = uuid();
				accessToken.created = currentTime;
				if(credentials.scope == constants.ANDROID_SCOPE)
					accessToken.expiry = utils.addTime(currentTime, constants.ANDROID_ACCESS_TOKEN_TIME);
				else if(credentials.scope == constants.IOS_SCOPE)
					accessToken.expiry = utils.addTime(currentTime, constants.IOS_ACCESS_TOKEN_TIME);
				else
					accessToken.expiry = utils.addTime(currentTime, constants.WEB_ACCESS_TOKEN_TIME);
			
				instance.accessTokenxs.create(accessToken, function(err, accessTokenInstance){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}
					
					instance.shopTypeName = instance.shopType().name;
					var response = {};
					response = utils.getSellerResponseData(instance);
					response.accessToken = accessTokenInstance.id;
					cb(null, response);
					return;
				});
			});
		});
	}

	Seller.remoteMethod(
		'login',
		{
			description: "Login User with mobile and password",
			accepts: {arg: 'credentials', type: 'object', required: true, http: { source: 'body' }},
			returns: {arg:'response',type:'object'},
			http: {path: '/login', verb: 'post'}         
		}	
	);




	/**
	*	This method is for registering egg user.
	*	
	*	@method updateProfile
	*	@param {required} contains id, accessToken, scope, mobile
	*	@param {data} contains name, [email], shopTypeData, address
	*	@param {cb} callback function
	*	@return {response} response is either instance or error
	*/

	Seller.updateProfile = function(required, data, cb){
		//console.log(data);
		var currentTime = new Date();
		try{
			if(data.shopTypeData)
				data.shopTypeData = JSON.parse(data.shopTypeData);
		}catch(err){
			cb(utils.getGenericError("Invalid Shop Type",
				400,"Error"));
			return;
		}
		
		if(exValidator.isEmptyObject(required) || exValidator.isEmptyObject(data)){
			cb(utils.getGenericError("Data not received",
				400,"Error"));
			return;
		}
		if(!exValidator.isValidRequired(required)){
			cb(utils.getGenericError("Invalid Data",
				400,"Error"));
			return;
		}
		//validates seller's name
		if(!exValidator.isName(data.name)){
			cb(utils.getGenericError("Invalid Name",
				403,"Error"));
			return;
		}
		

		//validates email if only it exists
		if(data.email && exValidator.isEmptyObject(data.email)){
			cb(utils.getGenericError("Email is invalid",
				403,"Error"));
			return;
		}

		//validate address
		/*if(data.address)
			if(!exValidator.isAddress(data.address)){
				var error=new Error("Invalid Adress. Please ensure you enter a valid address");
				error.statusCode=400;
				error.name="Invalid adress Error";
				cb(error);
				return;
			}*/

		Seller.findOne({include: ['shopType', {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}], where: {id: required.id, mobile : required.mobile}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(instance && currentTime < instance.accessTokenxs()[0].expiry){
				if(!instance || !instance.id){
					cb(utils.getGenericError("Invalid data",
						403,"Error"));
					return;
				}
				//console.log("id "+instance.id);
				if(instance.name)
					instance.name = data.name;
				if(instance.email)
					instance.email = data.email;
				if(instance.address)
					instance.address = data.address;
				
				instance.save( function(err, count){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}
					
					if(data.shopTypeData){
						instance.shopType.update(data.shopTypeData, function(err, shopTypeInstance){
							if(err){
								cb(utils.getInternalServerError(err));
								return;
							}
						});
					}
					
					var accessToken = {};
					accessToken.id = uuid();
					accessToken.created = currentTime;
					if(required.scope == constants.ANDROID_SCOPE)
						accessToken.expiry = utils.addTime(currentTime, constants.ANDROID_ACCESS_TOKEN_TIME);
					else if(required.scope == constants.IOS_SCOPE)
						accessToken.expiry = utils.addTime(currentTime, constants.IOS_ACCESS_TOKEN_TIME);
					else
						accessToken.expiry = utils.addTime(currentTime, constants.WEB_ACCESS_TOKEN_TIME);
					instance.accessTokenxs.create(accessToken, function(err, accessTokenInstance){
						if(err){
							cb(utils.getInternalServerError(err));
							return;
						}
						var response = {};
						var response = utils.getSellerResponseData(instance);
						response.accessToken = accessTokenInstance.id;
						response.address = data.address;
						response.name = data.name;
						response.email = data.email;
						if(data.shopTypeData)
							response.shopType = data.shopTypeData.name;
						else
							response.shopType = instance.shopType().name;
						cb(null, response);
						return;
						
					});
				});
			}else{
				cb(utils.getGenericError("You are not authorised",
					401,"Error"));
				return;
			}
		});
	}

	Seller.remoteMethod(
		'updateProfile',
		{
			description: "Update Profile",
			accepts: [
						{arg: 'required', type: 'object', required: true},
          				{arg: 'data', type: 'object', required: true}
        			],
			returns: {arg:'response',type:'object'},
			http: {path: '/updateProfile', verb: 'post'}         
		}	
	);


	/**
	*	Method for restoring forgotten password.
	*	
	*	@method forgotPassword
	*	@param {query} contains mobile
	*	@param {cb} callback function
	*	@return {response} response is either instance or error
	*/

	Seller.forgotPassword = function(query , cb) {
		
		var currentTime = new Date();
		if(exValidator.isEmptyObject(query)){
			cb(utils.getGenericError("Invalid data",
				400,"Error"));
			return;
		}
		if(!query.mobile){
			cb(utils.getGenericError("Mobile is required",
				403,"Error"));
			return;
		}else if(!exValidator.isMobile(query.mobile)){
			cb(utils.getGenericError("Mobile is invalid",
				403,"Error"));
			return;
		}


		Seller.findOne({where: {mobile : query.mobile, mobileVerified: true}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(!instance){
				cb(utils.getGenericError("Incorrect Mobile",
					403,"Error"));
				return;
			}
			var accessToken = {};
			accessToken.id = uuid();
			accessToken.created = currentTime;
			accessToken.expiry = utils.addTime(currentTime, constants.REGISTRATION_ACCESS_TOKEN_TIME);
			instance.accessTokenxs.create(accessToken, function(err, accessTokenInstance){
				if(err){
					cb(utils.getInternalServerError(err));
					return;
				}
				
				var otp = {};
				otp.mobileOtp = utils.getMobileOtp();
				otp.mobileOtpExpiry = utils.addTime(currentTime, constants.MOBILE_OTP_TIME);
				instance.otp.update(otp, function(err, otpInstance){
					if(err){
						accessTokenInstance.destroy(function(){});
						cb(utils.getInternalServerError(err));
						return;
					}
					utils.sendOtpSMS(instance.mobile, constants.MOBILE_OTP_MESSAGE, otpInstance.mobileOtp);
					var response = {};
					response.id = instance.id;
					response.accessToken = accessTokenInstance.id;
					response.mobile = instance.mobile;
					cb(null, response);
				});
			});
		});
	}
	
	Seller.remoteMethod(
		'forgotPassword',
		{
			description: "forgotPassword",
			accepts: {arg: 'query', type: 'object', required: true},
			returns: {arg:'response',type:'object'},
			http: {path: '/forgotPassword', verb: 'get'}         
		}	
	);



	/**
	*	This method is to reset the Seller's password.
	*	
	*	@method resetPassword
	*	@param {required} contains id, accessToken, scope, mobile
	*	@param {data} contains password, mobileOtp
	*	@param {cb} callback function
	*	@return {response} response is either instance or error
	*/

	Seller.resetPassword = function(required, data, cb){
		
		var currentTime = new Date();		
		if(exValidator.isEmptyObject(required) || exValidator.isEmptyObject(data)){
			cb(utils.getGenericError("Data not received",
				400,"Error"));
			return;
		}
		
		if(!exValidator.isValidRequired(required)){
			cb(utils.getGenericError("Data is invalid",
				400,"Error"));
			return;
		}

		if(exValidator.isMobileOtp(data.mobileOtp)){
			cb(utils.getGenericError("Otp is incorrect",
				403,"Error"));
			return;
		}

		if(exValidator.isPassword(data.password)){
			cb(utils.getGenericError("Password is invalid",
				403,"Error"));
			return;
		}

		Seller.findOne({include: ['otp', 'shopType', {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}], where: {id: required.id}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(!instance || !instance.id){
				var error = new Error('Data is incorrect, please try again');
				error.statusCode = 400;
				error.name = "Oops";
				cb(error);
				return;
			}
			if(instance.otp().mobileOtp == data.mobileOtp && currentTime < instance.otp().mobileOtpExpiry && currentTime < instance.accessTokenxs()[0].expiry){
				utils.cryptPassword(data.password, function(err, hashedPassword){
					var userPassword = {};
					userPassword.password = hashedPassword;
					Seller.updateAll({id: required.id}, userPassword, function(err, count){
						if(err){
							cb(utils.getInternalServerError(err));
							return;
						}
						
						var accessToken = {};
						accessToken.id = uuid();
						accessToken.created = currentTime;
						//I made changes here
						if(required.scope == constants.ANDROID_SCOPE)
							accessToken.expiry = utils.addTime(currentTime, constants.ANDROID_ACCESS_TOKEN_TIME);
						else if(required.scope == constants.IOS_SCOPE)
							accessToken.expiry = utils.addTime(currentTime, constants.IOS_ACCESS_TOKEN_TIME);
						else
							accessToken.expiry = utils.addTime(currentTime, constants.WEB_ACCESS_TOKEN_TIME);
					
						instance.accessTokenxs.create(accessToken, function(err, accessTokenInstance){
							if(err){
								cb(utils.getInternalServerError(err));
								return;
							}
							instance.shopType = instance.shopType().name;
							console.log("hello "+JSON.stringify(instance));
							var response = {};
							response = utils.getSellerResponseData(instance);
							response.accessToken = accessTokenInstance.id;
							cb(null, response);
							return;
						});
					});
				});
			}else{
				var error = new Error('You are not authorised');
				error.statusCode = 400;
				error.name = "Oops";
				cb(error);
				return;
			}
		});
	}

	Seller.remoteMethod(
		'resetPassword',
		{
			description: "Reset Password",
			accepts: [
						{arg: 'required', type: 'object', required: true},
          				{arg: 'data', type: 'object', required: true}
        			],
			returns: {arg:'response',type:'object'},
			http: {path: '/resetPassword', verb: 'post'}         
		}	
	);



    /**
	*	This method is for Logging out egg seller.
	*	
	*	@method logout
	*	@param {required} contains id, accessToken, mobile
	*	@param {data} contains null
	*	@param {cb} callback function
	*	@return {response} response is either true or error
	*/

    Seller.logout = function(required, data, cb){
    	console.log(required);
    	if(exValidator.isEmptyObject(required)){
    		cb(utils.getGenericError("Data not received",
				400,"Error"));
			return;
    	}
    	if(!exValidator.isValidRequired(required)){
			cb(utils.getGenericError("Data invalid",
				400,"Error"));
			return;
		}
    	Seller.findOne({include : {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}, where: {id: required.id}}, function(err, instance){
    		if(err){
    			cb(utils.getInternalServerError(err));
    			return;
    		}
    		instance.accessTokenxs.destroy(required.accessToken, function(err){
    			if(err){
    				cb(utils.getInternalServerError());
    				return;
    			}
    			var response = "true";
    			cb(null , response);
    			return;
    		});
    	});

    }

	Seller.remoteMethod(
		'logout',
		{
			description: "logout",
			accepts: [
						{arg: 'required', type: 'object', required: true},
          				{arg: 'data', type: 'object', required: true}
        			],
			returns: {arg:'response',type:'object'},
			http: {path: '/logout', verb: 'post'}         
		}	
	);




	/**
	*	This method is for verifying credentials for mobile.
	*	
	*	@method verifyMobileCredentials
	*	@param {required} contains id, accessToken, mobile, scope
	*	@param {data} contains null
	*	@param {cb} callback function
	*	@return {response} response is either true or error
	*/

    Seller.verifyMobileCredentials = function(required, data, cb){
    	var currentTime = new Date();
    	if(exValidator.isEmptyObject(required)){
    		cb(utils.getGenericError("Data not received",
				400,"Error"));
			return;
    	}
    	if(!exValidator.isValidRequired(required)){
			cb(utils.getGenericError("Data is invalid",
				400,"Error"));
			return;
		}
    	Seller.findOne({include : {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}, where: {id: required.id, mobile: required.mobile}}, function(err, instance){
    		if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(instance && currentTime < instance.accessTokenxs()[0].expiry){
				var accessToken = {};
				accessToken.id = uuid();
				accessToken.created = currentTime;
				if(required.scope == constants.ANDROID_SCOPE)
					accessToken.expiry = utils.addTime(currentTime, constants.ANDROID_ACCESS_TOKEN_TIME);
				else if(required.scope == constants.IOS_SCOPE)
					accessToken.expiry = utils.addTime(currentTime, constants.IOS_ACCESS_TOKEN_TIME);
				else
					accessToken.expiry = utils.addTime(currentTime, constants.WEB_ACCESS_TOKEN_TIME);
				
				instance.accessTokenxs.create(accessToken, function(err, accessTokenInstance){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}
					instance.shopTypeName = instance.shopType().name;
					var response = {};
					response = utils.getSellerResponseData(instance);
					response.accessToken = accessTokenInstance.id;
					response.isSuccess = true;
					cb(null, response);
					return;
				});
			}else{
				var response = {};
				response.isSuccess = false;
				cb(null, response);
				return;
			}
    	});
    }

	Seller.remoteMethod(
		'verifyMobileCredentials',
		{
			description: "logout",
			accepts: [
						{arg: 'required', type: 'object', required: true},
          				{arg: 'data', type: 'object'}
        			],
			returns: {arg:'response',type:'object'},
			http: {path: '/verifyMobileCredentials', verb: 'post'}         
		}	
	);

};
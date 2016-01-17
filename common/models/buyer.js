'use strict';
/**
*    description: buyer.js
*    		- definition of the buyer module
*                
*    date created: 31/12/15
*    log:-
*       	Update 1: 01/01/2016			Author : Sarthak 
*       	Update 2: 02/01/2016			Author : Sarthak	
*       	Update 3: 04/01/2016			Author : Sarthak
*       	Update 4: 08/01/2016			Author : Sarthak	
*       		last updated: 08/01/2016     Update 4       
*  		  
*   Listed Methods:
*    	1. createBuyer : used to create a buyer
*		2. updateBuyer : used to update an existing buyer
*		3. verifyMobile() : used to verify mobile
*		4. resendMobileOtp() : used to resend mobile otp
*		5. login() : for logging in buyer
*		6. updateProfile() : for updating Buyer profile
*		7. forgotPassword() : executed when buyer forgets password
*		8. resetPassword() : for resetting password
*		9. logout() : for logging out the buyer
*		10. verifyMobileCredentials() : for verifying mobile credentials
    	
*/

// built in validator
var validator = require('validator');
// custom validator defined in commons
var exValidator = require('../../common/exValidator');
// utils contain common utility methods
var utils = require('../../common/utils');
// constants contain application level constants
var constants = require('../../common/constants');
// built in package, used for generating accessToken
var uuid = require('uuid4');

var REALM = 'buyer';

module.exports = function(Buyer) {

Buyer.disableRemoteMethod("create", true);
Buyer.disableRemoteMethod("upsert", true);
Buyer.disableRemoteMethod("updateAll", true);
Buyer.disableRemoteMethod("updateAttributes", false);
 
Buyer.disableRemoteMethod("find", true);
Buyer.disableRemoteMethod("findById", true);
Buyer.disableRemoteMethod("findOne", true);
 
Buyer.disableRemoteMethod("deleteById", true);


	/**
	*	This method is for registering Buyer user.
	*	
	*	@method register
	*	@param {query} query contains mobile , [gcmKey], scope, referredCode
	*				 	[createdLocation], locale, [deviceId]
	*	@param {cb} callback function
	*	@return {response} response is either instance or error
	*/
	Buyer.register = function(query, cb){
		var AccessTokenx = Buyer.app.models.AccessTokenx;
		/**
		*	Function for creating a new Buyer, if mobile number is not registered
		*/
		function createBuyer(query , cb){
			var currentTime = new Date();
			var userData = {};
			userData.mobile = query.mobile;
			userData.realm = REALM;
			userData.locale = query.locale;
			userData.referredUserId = query.referredUserId;

			userData.created = currentTime;
			userData.lastUpdated = currentTime;
			userData.createdLocation = query.createdLocation;
			Buyer.create(userData, function(err, instance){
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
				utils.updateUserAccessToken(AccessTokenx,null , instance.id, null, function(err, accessToken){
					if(err){	
						instance.destroy(function(){});
						cb(utils.getInternalServerError(err));
						return;
					}
					instance.accessToken = accessToken;
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
		Function for updating an existing Buyer, if mobile number is registered but not verified
	*/
		function updateBuyer(instance, query , cb){
			var currentTime = new Date();
			var userData = {};
			userData.mobile = query.mobile;
			userData.referredUserId = query.referredUserId;
			userData.realm = REALM;
			userData.locale = query.locale;
			userData.lastUpdated = currentTime;
			userData.created = currentTime;
			userData.createdLocation = query.createdLocation;
			/**
			*	Buyer.create() function:
			*			- Checks the incoming query and creates a new Buyer in accordance to the query
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
				utils.updateUserAccessToken(AccessTokenx, instance.accessTokenxs()[0].id, instance.id, null, function(err, accessToken){
					if(err){	
						instance.destroy(function(){});
						cb(utils.getInternalServerError(err));
						return;
					}
					instance.accessToken = accessToken;
					var otp = {};
					otp.mobileOtp = utils.getMobileOtp();
					otp.mobileOtpExpiry = utils.addTime(currentTime, constants.MOBILE_OTP_TIME);
					instance.otp.create(otp, function(err, otpInstance){
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

		

		if(exValidator.isEmptyObject(query)){
			//Validation of received query
			cb(utils.getGenericError("Data not received",
				400,"Empty Query Object"));
			return;
		}

		//check scope here
		if(!exValidator.isScope(query.scope)){
			cb(utils.getGenericError("Invalid scope",
				400,"Invalid Scope Error"));
			return;
		}


		//validate locale here , when the locale functionality is updated in exValidator
		if(query.locale && !exValidator.isLocale(query.locale)){
			cb(utils.getGenericError("Invalid Locale.",
				400,"Invalid Locale Error"));			
			return;
		}

		
		//check mobile exists or not
		if(!exValidator.isMobileExists(query.locale, query.mobile)){
			cb(utils.getGenericError("Invalid mobile number",
				403,"Invalid Mobile Error"));
			return;
		}

		else{			
            Buyer.findOne({include: 'accessTokenxs', fields: {id: true, mobileVerified: true}, where: {mobile: query.mobile}}, function(err, userInstance){
				/*
					Finds a Buyer in accordance with the Specified data
				*/
				if(err){
                    cb(utils.getInternalServerError(err));
                    return;
				}    
				//if a userInstance exists
			    if(userInstance){
                    //if userInstance has a mobile which is already verified
					if(userInstance.mobileVerified==true){
						cb(utils.getGenericError("Mobile number already registered",
							403,"Mobile Already Registered Error"));
						return;
					}
                    
                    //if the given userInstance has an unverified mobile
                    if(userInstance.mobileVerified==false){
                        if(query.referredCode){
							if(!exValidator.isReferralCode(query.referredCode)){
								cb(utils.getGenericError("Invalid referral code",
									403,"Error"));
								return;
							}else{
								Buyer.findOne({fields: {id: true}, where: {referralCode: query.referredCode}}, function(err, instance){
									if(err){
										cb(utils.getInternalServerError(err));
										return;
									}
									if(instance && instance.id){
										query.referredUserId = instance.id;
									}else{
										cb(utils.getGenericError("Invalid referral code",
											403,"Error"));
										return;
									}
									updateBuyer(userInstance, query, function(err, instance){
										if(err){
											cb(err);
											return;
										}
										var response = utils.getBuyerResponseData(instance);
										response.accessToken = instance.accessToken;
										cb(null, response);
										return;
									});
								});
							}
						}else{
							updateBuyer(userInstance, query, function(err, instance){
								if(err){
									cb(err);
									return;
								}
								var response = utils.getBuyerResponseData(instance);
								response.accessToken = instance.accessToken;
								cb(null, response);
								return;
							});
						}
					}			
				}
                //when no user instance exists
                else{
                    //create the Buyer anyway
                    if(query.referredCode){
							if(!exValidator.isReferralCode(query.referredCode)){
								cb(utils.getGenericError("Invalid referral code",
									403,"Error"));
								return;
							}else{
								Buyer.findOne({fields: {id: true}, where: {referralCode: query.referredCode}}, function(err, instance){
									if(err){
										cb(utils.getInternalServerError(err));
										return;
									}
									if(instance && instance.id){
										query.referredUserId = instance.id;
									}else{
										cb(utils.getGenericError("Invalid referral code",
											403,"Error"));
										return;
									}
									createBuyer(query, function(err, instance){
										if(err){
											cb(err);
											return;
										}
										var response = utils.getBuyerResponseData(instance);
										response.accessToken = instance.accessToken;
										cb(null, response);
										return;
									});
								});
							}
						}else{
							createBuyer(query, function(err, instance){
								if(err){
									cb(err);
									return;
								}
								var response = utils.getBuyerResponseData(instance);
								response.accessToken = instance.accessToken;
								cb(null, response);
								return;
							});
						}
                }
            });    			
		}
	}

	
	Buyer.remoteMethod(
		'register',
		{
			description: "Register mobile number of user",
			accepts: {arg: 'query', type: 'object', required: true, http: { source: 'body' }},
			returns: {arg:'response',type:'object'},
			http: {path: '/register', verb: 'post'}         
		}	
	);




	/**
	*	This method is for verifyMobile Buyer user.
	*	
	*	@method verifyMobile
	*	@param {required} contains id, accessToken, scope, mobile
	*	@param {data} contains mobileOtp, password
	*	@param {cb} callback function
	*	@return {response} response is either instance or error
	*/

	Buyer.verifyMobile = function(required, data, cb){
		var AccessTokenx = Buyer.app.models.AccessTokenx;
		var currentTime = new Date();
		if(exValidator.isEmptyObject(required) && exValidator.isEmptyObject(data)){
			cb(utils.getGenericError("Data not recieved, make a retry",
				400,"Empty object Error"));			
			return;
		}
		if(!exValidator.isValidRequired(required)){
			cb(utils.getGenericError("Received data is invalid",
				400,"Error"));
			return;
		}

		//validates that the otp field is not empty
		if(!exValidator.isMobileOtp(data.mobileOtp)){
			cb(utils.getGenericError("Mobile otp is invalid. Please retry",
				403,"Empty MobileOtp"));
			return;
		}
		
		//validates that data.password is not empty
		if(!exValidator.isPassword(data.password)){
			cb(utils.getGenericError("Password should be 6 to 30 characters",
				403,"Error"));
			return;
		}
		
		Buyer.findOne({include: ['otp', 'wallet', {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}], where: {id: required.id, mobile: required.mobile, mobileVerified : false}}, function(err, instance){
			
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(!instance || exValidator.isEmptyObject(instance)){
				cb(utils.getGenericError("Mobile Otp is wrong",
					403,"Sorry"));
				return;
			}
			if(instance.otp().mobileOtp == data.mobileOtp && currentTime < instance.otp().mobileOtpExpiry && currentTime < instance.accessTokenxs()[0].expiry){
				
				utils.cryptPassword(data.password, function(err, hashedPassword){
					var buyerData = {};
					buyerData.password = hashedPassword;
					buyerData.referralCode = utils.getReferralCode(required.mobile);
					buyerData.qrCode = utils.encodeQrCode(required.mobile);
					buyerData.mobileVerified = true;
					Buyer.updateAll({id: required.id}, buyerData , function(err, count){
						if(err){
							cb(utils.getInternalServerError(err));
							return;
						}
						var walletData = {};
						walletData.balance = constants.WALLET_DEFAULT_BALANCE;

						instance.wallet.create(walletData, function(err, walletInstance){
							if(err){
								instance.destroy(function(){});
								cb(utils.getInternalServerError(err));
								return;
							}
							utils.updateUserAccessToken(AccessTokenx, instance.accessTokenxs()[0].id, instance.id, required.scope, function(err, accessToken){
								if(err){
									instance.destroy(function(){});
									cb(utils.getInternalServerError(err));
									return;
								}
								var response = {};
								response = utils.getBuyerResponseData(instance);
								response.accessToken = accessToken;
								response.wallet = {id: walletInstance.id, balance: walletInstance.balance, lastUpdated: walletInstance.lastUpdated};
								cb(null, response);
								return;
							});
						});
						
					})
				});
			}
			else{
				cb(utils.getGenericError("Incorrect Otp",
					403,"Invalid otp error"));
				return;
			}
		});
	}

	Buyer.remoteMethod(
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

	Buyer.resendMobileOtp = function(required, data , cb){
		var AccessTokenx = Buyer.app.models.AccessTokenx;
		var isCaptchaOn = false;
		var currentTime = new Date();
		if(exValidator.isEmptyObject(required)){
			cb(utils.getGenericError("Empty object",
				400,"Invalid Object Error"));
			return;
		}
		if(!exValidator.isValidRequired(required)){
			cb(utils.getGenericError("Data is invalid",
				400,"Sorry"));
			return;
		}
		Buyer.findOne({include:['hitCount', {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}], where: {id: required.id, mobile: required.mobile}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(!instance){
				cb(utils.getGenericError("You are not authorized",
					401,"Sorry"));
				return;
			}
			if(required.scope == constants.SCOPE_WEB && 
				instance.hitCount() && 
				instance.hitCount().resendMobileOtp === constants.RESEND_MOBILE_OTP_HIT_COUNT && 
				currentTime > instance.hitCount().verifyMobileExpiry){
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
				utils.updateUserAccessToken(AccessTokenx, instance.accessTokenxs()[0].id, instance.id, null, function(err, accessToken){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}
					var otp = {};
					otp.mobileOtp = utils.getMobileOtp();
					otp.mobileOtpExpiry = utils.addTime(currentTime, constants.MOBILE_OTP_TIME);
					instance.otp.update(otp, function(err, otpInstance){
						if(err){
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
							instance.accessToken = accessToken;
							cb(null, instance);
					});
				});
			}else{
				cb(utils.getGenericError("You are not authorised",
				401,"Sorry"));
			}
		}
	}

	Buyer.remoteMethod(
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
	*	This method is to login egg user.
	*	
	*	@method login
	*	@param {credentials} contains mobile, password, scope ,gcmKey
	*	@param {cb} callback function
	*	@return {response} response is either instance or error
	*/

	Buyer.login = function(credentials, cb){
		var AccessTokenx = Buyer.app.models.AccessTokenx;
		var currentTime = new Date();		
		if(exValidator.isEmptyObject(credentials)){
			cb(utils.getGenericError("Data not received",
				403,"Empty Object Error"));
			return;
		}
		
		//validating mobile
		if(!exValidator.isMobile(credentials.mobile)){
			cb(utils.getGenericError("Mobile is not valid",
				403,"Invalid Mobile Error"));
			return;
		}

		//check scope here
		if(!exValidator.isScope(credentials.scope)){
			cb(utils.getGenericError("Invalid scope. Please ensure the query is valid",
				400,"Invalid Scope Error"));
			return;
		}
		//validating password here. (right now only making sure it isnt empty)
		if(!exValidator.isPassword(credentials.password)){
			cb(utils.getGenericError("Password is invalid",
				403,"Error"));
			return;
		}

		//!!!!!!!!!!!!!!!!!! MAJOR ERROR PRONE CHANGE HERE
		Buyer.findOne({include: 'wallet', where: {mobile: credentials.mobile, mobileVerified : true}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(!instance){
				cb(utils.getGenericError("Mobile number is not registered",
					403,"Error"));
				return;
			}
			
			utils.comparePassword(credentials.password, instance.password, function(err, isMatched){
				if(err){
					cb(utils.getInternalServerError(err));
					return;
				}
				
				if(!isMatched){
					cb(utils.getGenericError("Password is incorrect",
						403,"Error"));
					return;
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
						gcm.webKey = credentials.gcmKey;
						gcm.webKeyCreated = currentTime;
						gcm.webKeyExpiry = utils.addTime(currentTime,constants.WEB_GCM_KEY_TIME);
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
				
				utils.updateUserAccessToken(AccessTokenx, null, instance.id, credentials.scope, function(err, accessToken){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}
					var response = {};
					response = utils.getBuyerResponseData(instance);
					response.accessToken = accessToken;
					response.wallet = {id: instance.wallet().id, balance: instance.wallet().balance, lastUpdated: instance.wallet().lastUpdated};
					cb(null, response);
					return;
				});
			});
		});
	}

	Buyer.remoteMethod(
		'login',
		{
			description: "Login User with mobile and password",
			accepts: {arg: 'credentials', type: 'object', required: true, http: { source: 'body' }},
			returns: {arg:'response',type:'object'},
			http: {path: '/login', verb: 'post'}         
		}	
	);


	/**
	*	This method is for updating egg user profile.
	*	
	*	@method updateProfile
	*	@param {required} contains id, accessToken, scope, mobile
	*	@param {data} contains [name], [email], [address], [dob], [gender]
	*	@param {cb} callback function
	*	@return {response} response is either instance or error
	*/

	Buyer.updateProfile = function(required, data, cb){
		var AccessTokenx = Buyer.app.models.AccessTokenx;
		var currentTime = new Date();

		if(exValidator.isEmptyObject(required)){
			cb(utils.getGenericError("Data not received",
				400,"Empty Object Error"));
			return;
		}

		//validating required fields
		if(!exValidator.isValidRequired(required)){
			cb(utils.getGenericError("Data is incorrect",
				400,"Incorrect data Error"));
			return;
		}

		//validating "data" field, if any
		if(!exValidator.isEmptyObject(data)){

			if(data.name && !exValidator.isName(data.name)){
				cb(utils.getGenericError("Invalid Name. Please ensure the query is valid",
					400,"Invalid name Error"));
				return;	
			}
			if(data.email && !exValidator.isEmail(data.email)){
				cb(utils.getGenericError("Invalid Email address. Please ensure you have entered a valid email",
					400,"Invalid Email Error"));
				return;
			}
			if(data.address && !exValidator.isAddress(data.address)){
				cb(utils.getGenericError("Invalid Address. Please retry",
					400,"Invalid Address Error"));
				return;
			}
			/*if(data.dob){
				//dob validation here. Later!
			}*/
			if(data.gender){
				if(data.gender.toLowerCase()!="male" && data.gender.toLowerCase()!="female"){
					cb(utils.getGenericError("Invalid User Gender",
						400,"Invalid Gender Error"));
					return;
				}
			}
		}

		Buyer.findOne({include: ['wallet', {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}], where: {id: required.id, mobile : required.mobile}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}

			//validating accessToken here
			if(instance && currentTime < instance.accessTokenxs()[0].expiry){
				if(!instance || !instance.id){
					cb(utils.getGenericError("Invalid data",
						403,"Incorrect Data Error"));
					return;
				}
				
				if(data.name)
					instance.name = data.name;
				if(data.email)
					instance.email = data.email;
				if(data.address)
					instance.address = data.address;
				if(data.dob)
					instance.dob = data.dob;
				if(data.gender)
					instance.gender = data.gender;
				instance.save(function(err,count){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}

					utils.updateUserAccessToken(AccessTokenx, instance.accessTokenxs()[0].id, instance.id, required.scope, function(err, accessToken){
						if(err){
							cb(utils.getInternalServerError(err));
							return;
						}

						var response = {};
						response = utils.getBuyerResponseData(instance);
						response.accessToken = accessToken;
						response.address = data.address;
						response.name = data.name;
						response.wallet = {id: instance.wallet().id, balance: instance.wallet().balance, lastUpdated: instance.wallet().lastUpdated};
						response.email = data.email;
						cb(null, response);
						return;
					});
				});
			}else{
				cb(utils.getGenericError("You are not Authorized",
					401,"Authorization Error"));
				return;
			}
		});
	}

	Buyer.remoteMethod(
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

	Buyer.forgotPassword = function(query , cb) {
		var AccessTokenx = Buyer.app.models.AccessTokenx;
		var currentTime = new Date();
		if(exValidator.isEmptyObject(query)){
			cb(utils.getGenericError("Invalid Data",
				400,"Error"));
			return;
		}

		//validate mobile here
		if(!query.mobile){
			cb(utils.getGenericError("Mobile number is Required.",
				403,"Mobile Required Error"));
			return;
		}
		if(!exValidator.isMobile(query.mobile)){
			cb(utils.getGenericError("Mobile is invalid",
				400,"Error"));
			return;
		}

		Buyer.findOne({where: {mobile : query.mobile, mobileVerified: true}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(!instance){
				cb(utils.getGenericError("Mobile not registered",
					403,"Error"));
				return;
			}
			utils.updateUserAccessToken(AccessTokenx, null, instance.id, null, function(err, accessToken){
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
					response.accessToken = accessToken;
					response.mobile = instance.mobile;
					cb(null, response);
				});
			});
		});
	}
	
	Buyer.remoteMethod(
		'forgotPassword',
		{
			description: "forgotPassword",
			accepts: {arg: 'query', type: 'object', required: true},
			returns: {arg:'response',type:'object'},
			http: {path: '/forgotPassword', verb: 'get'}         
		}	
	);



	/**
	*	This method is to reset the Buyer's password.
	*	
	*	@method resetPassword
	*	@param {required} contains id, accessToken, scope, mobile
	*	@param {data} contains password, mobileOtp
	*	@param {cb} callback function
	*	@return {response} response is either instance or error
	*/

	Buyer.resetPassword = function(required, data, cb){
		var AccessTokenx = Buyer.app.models.AccessTokenx;
		var currentTime = new Date();		
		if(exValidator.isEmptyObject(required) || exValidator.isEmptyObject(data)){
			cb(utils.getGenericError("Data not recieved",
				400,"Empty Object Error"));
			return;
		}
		//if the "required" and "data" fields are not empty, further check for other constraints
		
		if(!exValidator.isValidRequired(required)){
			cb(utils.getGenericError("Data is invalid",
				400,"Error"));
			return;
		}

		if(!exValidator.isMobileOtp(data.mobileOtp)){
			cb(utils.getGenericError("Otp is incorrect",
				403,"Error"));
			return;
		}

		if(!exValidator.isPassword(data.password)){
			cb(utils.getGenericError("Pssword is invalid",
				403,"Error"));
			return;
		}	

		Buyer.findOne({include: ['otp', 'wallet', {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}], where: {id: required.id}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(!instance || !instance.id){
				cb(utils.getGenericError("Data is incorrect, please try again",
					400,"Incorrect Data Error"));
				return;
			}
			if(instance.otp().mobileOtp == data.mobileOtp && currentTime < instance.otp().mobileOtpExpiry && currentTime < instance.accessTokenxs()[0].expiry){
				utils.cryptPassword(data.password, function(err, hashedPassword){
					var userPassword = {};
					userPassword.password = hashedPassword;
					Buyer.updateAll({id: required.id}, userPassword, function(err, count){
						if(err){
							cb(utils.getInternalServerError(err));
							return;
						}

						utils.updateUserAccessToken(AccessTokenx, instance.accessTokenxs()[0].id, instance.id, required.scope, function(err, accessToken){
							if(err){
								instance.destroy(function(){});
								cb(utils.getInternalServerError(err));
								return;
							}
							var response = {};
							response = utils.getBuyerResponseData(instance);
							response.accessToken = accessToken;
							response.wallet = {id: instance.wallet().id, balance: instance.wallet().balance, lastUpdated: instance.wallet().lastUpdated};
							cb(null, response);
							return;
						});
					});
				});
			}else{
				cb(utils.getGenericError("You are not authorised",
					400,"Authorization Error"));
				return;
			}
		});
	}

	Buyer.remoteMethod(
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
	*	This method is for Logging out egg Buyer.
	*	
	*	@method logout
	*	@param {required} contains id, accessToken, mobile
	*	@param {data} contains null
	*	@param {cb} callback function
	*	@return {response} response is either true or error
	*/

    Buyer.logout = function(required, data, cb){

    	if(exValidator.isEmptyObject(required)){
    		cb(utils.getGenericError("Data not received.",
    			400,"Empty Data Object"));
    		return;
    	}

    	//if "required" is not empty, check for further constraints
    	if(!exValidator.isValidRequired(required)){
    		cb(utils.getGenericError("Data invali.",
    			400,"Incorrect Data Error"));
			return;
			}


    	Buyer.findOne({include : {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}, where: {id: required.id}}, function(err, instance){
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

	Buyer.remoteMethod(
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

    Buyer.verifyMobileCredentials = function(required, data, cb){
    	//console.log(required);
    	var AccessTokenx = Buyer.app.models.AccessTokenx;
    	var currentTime = new Date();
    	if(exValidator.isEmptyObject(required)){
    		cb(utils.getGenericError("Data not received",
    			400,"Incorrect Data Error"));
    		return;
    	}
    	//validates the required fields
    	if(!exValidator.isValidRequired(required)){
    		cb(utils.getGenericError("Data is invalid",
    			400,"Invalid Data Error"));
			return;
		}

    	Buyer.findOne({include : ['wallet', {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}], where: {id: required.id, mobile: required.mobile}}, function(err, instance){
    		if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			//check if accessToken is still valid
			if(instance && currentTime < instance.accessTokenxs()[0].expiry){
				utils.updateUserAccessToken(AccessTokenx, instance.accessTokenxs()[0].id, instance.id, required.scope, function(err, accessToken){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}

					var response = {};
					response = utils.getBuyerResponseData(instance);
					response.accessToken = accessToken;
					response.isSuccess = true;
					response.wallet = {id: instance.wallet().id, balance: instance.wallet().balance, lastUpdated: instance.wallet().lastUpdated};
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

	Buyer.remoteMethod(
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




	



	/**
	*	This method is for requesting money
	*	
	*	@method requestMoney
	*	@param {required} contains id, accessToken, mobile, scope
	*	@param {data} contains mobile, amount, desc, requestType
	*	@param {cb} callback function
	*	@return {response} response is data
	*/

	Buyer.requestMoney = function(required, data, cb){
		var AccessTokenx = Buyer.app.models.AccessTokenx;
		var RequestMoney = Buyer.app.models.RequestMoney;
    	var currentTime = new Date();
    	if(exValidator.isEmptyObject(required)){
    		cb(utils.getGenericError("Data not received",
    			400,"Incorrect Data Error"));
    		return;
    	}
    	//validates the required fields
    	if(!exValidator.isValidRequired(required)){
    		cb(utils.getGenericError("Data is invalid",
    			400,"Invalid Data Error"));
			return;
		}

		if(!data.requestType || !data.requestType === constants.BUYER_REQ_WR_TYPE || data.requestType === constants.SELLER_REQ_WR_TYPE){
			cb(utils.getGenericError("Invalid request type",
	    		403,"Error"));
			return;
		}
		if(!data.amount || !exValidator.isAmount(data.amount)){
			cb(utils.getGenericError("Invalid amount",
    			403,"Error"));
			return;
		}
		
		if(data.amount > constants.BUYER_REQ_AMOUNT_LIMIT && data.amount < 1){
			cb(utils.getGenericError("Amount must be less than "+constants.BUYER_REQ_AMOUNT_LIMIT,
    			403,"Error"));
			return;
		}
		Buyer.findOne({include: ['wallet', {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}], where: {id: required.id, mobile: required.mobile}}, function(err, requester){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(!requester || currentTime > requester.accessTokenxs()[0].expiry){
				cb(utils.getGenericError("Not authenticated",
    				401,"Error"));
				return;
			}
			else{
				var requestMoneyData = {};
				requestMoneyData.amount = data.amount;
				requestMoneyData.requesterId = requester.id;
				requestMoneyData.date = currentTime;
				requestMoneyData.desc = data.desc;
				requestMoneyData.requestType = data.requestType;
				requestMoneyData.status = constants.REQUEST_MONEY_STATUS_INITIAL;
				if(data.mobile){
					Buyer.findOne({include: ['gcms', 'wallet'], where: {mobile: data.mobile}}, function(err, receiver){
						if(err){
							cb(utils.getInternalServerError(err));
							return;
						}
						if(receiver && receiver.wallet().id){
							requestMoneyData.receiverId = receiver.id;
							RequestMoney.create(requestMoneyData, function(err, requestMoneyInstance){
								if(err){
									cb(utils.getInternalServerError(err));
									return;
								}
								utils.updateUserAccessToken(AccessTokenx, requester.accessTokenxs()[0].id, requester.id, required.scope, function(err, accessToken){
									if(err){
										cb(utils.getInternalServerError(err));
										return;
									}
									var smsText = '';
									if(requester.name)
										smsText = constants.REQUEST_MONEY_SMS.replace('SENDER', requester.name);
									else 
										smsText = constants.REQUEST_MONEY_SMS.replace('SENDER', requester.mobile);
									if(receiver.name)
										smsText = smsText.replace('RECEIVER', receiver.name);
									else
										smsText = smsText.replace('RECEIVER', receiver.mobile);
									smsText = smsText.replace('AMOUNT', requestMoneyInstance.amount);
									smsText = smsText.replace('DATE', requestMoneyInstance.date);
									utils.sendSMS(receiver.mobile, smsText);
									
									var data = {};
									data.sender = requester.mobile;
									data.receiver = receiver.mobile;
									data.amount = requestMoneyData.amount;
									data.date = requestMoneyData.date;
									var gcms = receiver.gcms();

									utils.sendPush(data, gcms);

									if(requestMoneyInstance && requestMoneyInstance.id){
										var response = {};
										response.id = requester.id;
										response.accessToken = accessToken;
										response.mobile = requester.mobile;
										response.requestId = requestMoneyInstance.id;
										cb(null, response);
										return;
									}else{
										cb(utils.getInternalServerError(err));
										return;
									}
								});
							});
						}else{
							utils.updateUserAccessToken(AccessTokenx, requester.accessTokenxs()[0].id, requester.id, required.scope, function(err, accessToken){
								if(err){
									cb(utils.getInternalServerError(err));
									return;
								}
								var smsText = '';
								if(requester.name)
									smsText = constants.REQUEST_MONEY_SMS_UNREGISTERED.replace('SENDER', requester.name);
								else 
									smsText = constants.REQUEST_MONEY_SMS_UNREGISTERED.replace('SENDER', requester.mobile);
								smsText = smsText.replace('RECEIVER', data.mobile);
								smsText = smsText.replace('AMOUNT', requestMoneyData.amount);
								smsText = smsText.replace('DATE', requestMoneyData.date);
								utils.sendSMS(data.mobile, smsText);

								var response = {};
								response.id = requester.id;
								response.accessToken = accessToken;
								response.mobile = requester.mobile;
								cb(null, response);
								return;
							});
						}	
					});
				}else{
					RequestMoney.create(requestMoneyData, function(err, requestMoneyInstance){
						if(err){
							cb(utils.getInternalServerError(err));
							return;
						}
						utils.updateUserAccessToken(AccessTokenx, requester.accessTokenxs()[0].id, requester.id, required.scope, function(err, accessToken){
							if(err){
								cb(utils.getInternalServerError(err));
								return;
							}
							if(requestMoneyInstance && requestMoneyInstance.id){
							var response = {};
							response.id = requester.id;
							response.accessToken = accessToken;
							response.mobile = requester.mobile;
							response.requestId = requestMoneyInstance.id;
							cb(null, response);
							return;
							}
						});
					});
				}
			}
		});
	};

	Buyer.remoteMethod(
		'requestMoney',
		{
			description: "requestMoney",
			accepts: [
						{arg: 'required', type: 'object', required: true},
          				{arg: 'data', type: 'object', required: true}
        			],
			returns: {arg:'response',type:'object'},
			http: {path: '/requestMoney', verb: 'post'}         
		}	
	);





	/**
	*	This method is for getting Request data
	*	
	*	@method getRequestedData
	*	@param {required} contains id, accessToken, mobile, scope
	*	@param {data} contains requestId
	*	@param {cb} callback function
	*	@return {response} response is data
	*/

	Buyer.getRequestedData = function(required, data, cb){
		var AccessTokenx = Buyer.app.models.AccessTokenx;
		var RequestMoney = Buyer.app.models.RequestMoney;
    	var currentTime = new Date();
    	if(exValidator.isEmptyObject(required)){
    		cb(utils.getGenericError("Data not received",
    			400,"Incorrect Data Error"));
    		return;
    	}
    	//validates the required fields
    	if(!exValidator.isValidRequired(required)){
    		cb(utils.getGenericError("Data is invalid",
    			400,"Invalid Data Error"));
			return;
		}

		if(!data.requestId || !validator.isMongoId(data.requestId)){
			cb(utils.getGenericError("Invalid QR Code",
    			400,"Error"));
			return;
		}
		Buyer.findOne({include: {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}, where: {id: required.id, mobile: required.mobile}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}

			if(!instance || currentTime > instance.accessTokenxs()[0].expiry){
				cb(utils.getGenericError("Not authenticated",
    				401,"Error"));
				return;
			}
			else{
				RequestMoney.findOne({where: {id: data.requestId}}, function(err, requestMoneyInstance){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}
					if(requestMoneyInstance){
						Buyer.findOne({where: {id: requestMoneyInstance.requesterId}}, function(err, requester){
							if(err){
								cb(utils.getInternalServerError(err));
								return;
							}
							if(!requester){
								cb(utils.getGenericError("No such User exists",
    								401,"Error"));
								return;
							}

							utils.updateUserAccessToken(AccessTokenx, instance.accessTokenxs()[0].id, instance.id, required.scope, function(err, accessToken){
								if(err){
									cb(utils.getInternalServerError(err));
									return;
								}
								if(requestMoneyInstance && requestMoneyInstance.id){
									if(requester.name)
										var msg = constants.PAYMENT_CONFIRMATION_MSG.replace('REQUESTER', requester.name);
									else
										var msg = constants.PAYMENT_CONFIRMATION_MSG.replace('REQUESTER', requester.mobile);
									msg = msg.replace('DATE', requestMoneyInstance.date);
									msg = msg.replace('AMOUNT', requestMoneyInstance.amount);
									if(requestMoneyInstance.desc)
										msg = msg.replace('DESC', requestMoneyInstance.desc);
									var response = {};
									response.id = instance.id;
									response.accessToken = accessToken;
									response.mobile = instance.mobile;
									response.confirmationMessage = msg;
									cb(null, response);
									return;
								}else{
									cb(utils.getInternalServerError(err));
									return;
								}
							});
						});
					}else{
						cb(utils.getGenericError("Invalid QR Code",
    						400,"Error"));
						return;
					}
					
				});
			}
		});
	};

	Buyer.remoteMethod(
		'getRequestedData',
		{
			description: "getRequestedData	",
			accepts: [
						{arg: 'required', type: 'object', required: true},
          				{arg: 'data', type: 'object', required: true}
        			],
			returns: {arg:'response',type:'object'},
			http: {path: '/getRequestedData', verb: 'post'}         
		}	
	);





	/**
	*	This method is for paying requested money
	*	
	*	@method payRequestedMoney
	*	@param {required} contains id, accessToken, mobile, scope
	*	@param {data} contains requestId
	*	@param {cb} callback function
	*	@return {response} response is data
	*/

	Buyer.payRequestedMoney = function(required, data, cb){
		
		var AccessTokenx = Buyer.app.models.AccessTokenx;
		var RequestMoney = Buyer.app.models.RequestMoney;
		var Wallet = Buyer.app.models.Wallet;
		var TransactionW2W = Buyer.app.models.TransactionW2W;

    	if(exValidator.isEmptyObject(required)){
    		cb(utils.getGenericError("Data not received",
    			400,"Error"));
    		return;
    	}
    	//validates the required fields
    	if(!exValidator.isValidRequired(required)){
    		cb(utils.getGenericError("Data is invalid",
    			400,"Error"));
			return;
		}

		if(!data.requestId || !validator.isMongoId(data.requestId)){
			cb(utils.getGenericError("Invalid Requested ID",
    			400,"Error"));
			return;
		}
		var currentTime = new Date();

		Buyer.findOne({include: ['wallet', {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}], where: {id: required.id, mobile: required.mobile}}, function(err, senderInstance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(!senderInstance || currentTime > senderInstance.accessTokenxs()[0].expiry){
				cb(utils.getGenericError("Not authenticated",
    				401,"Error"));
				return;
			}
			else{
				RequestMoney.findOne({where: {id: data.requestId}}, function(err, requestMoneyInstance){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}
					Buyer.findOne({include: 'wallet', where: {id: requestMoneyInstance.requesterId}}, function(err, receiverInstance){
						if(err){
							cb(utils.getInternalServerError(err));
							return;
						}
						Wallet.findOne({where: {id: receiverInstance.wallet().id}}, function(err, receiverWalletInstance){
							if(err){
								cb(utils.getInternalServerError(err));
								return;
							}
							Wallet.findOne({where: {id: senderInstance.wallet().id}}, function(err, senderWalletInstance){
								if(err){
									cb(utils.getInternalServerError(err));
									return;
								}
								Wallet.beginTransaction({isolationLevel: Wallet.Transaction.READ_COMMITTED}, function(err, tx) {
									if(err){
										cb(utils.getInternalServerError(err));
										return;
									}
									var options = {transaction: tx};
									try{
										if(senderWalletInstance.balance < requestMoneyInstance.amount){
											cb(utils.getGenericError("Not enough balance",
    											401,"Oops"));
											return;
										}
										receiverWalletInstance.balance = receiverWalletInstance.balance + requestMoneyInstance.amount;
										senderWalletInstance.balance = senderWalletInstance.balance - requestMoneyInstance.amount;
										senderWalletInstance.lastUpdated = currentTime;
										receiverWalletInstance.lastUpdated = currentTime;
										receiverWalletInstance.save(options, function(err, newRequesterWalletInstance){
											if(err){
												tx.rollback(function(err) {
													cb(utils.getInternalServerError(err));
													return;
												});
												cb(utils.getInternalServerError(err));
												return;
											}
											senderWalletInstance.save(options, function(err, newSenderWalletInstance){
												if(err){
													tx.rollback(function(err) {
														cb(utils.getInternalServerError(err));
														return;
													});
													cb(utils.getInternalServerError(err));
													return;
													}
												var transactionW2WData = {};
												transactionW2WData.amount = requestMoneyInstance.amount;
												transactionW2WData.senderId = senderInstance.id;
												transactionW2WData.receiverId = receiverInstance.id;
												transactionW2WData.created = currentTime;
												transactionW2WData.lastUpdated = currentTime;
												transactionW2WData.status = 'done';
												TransactionW2W.create(transactionW2WData, options, function(err, transactionW2WInstance){
													if(err){
														tx.rollback(function(err) {
															cb(utils.getInternalServerError(err));
															return;
														});
														cb(utils.getInternalServerError(err));
														return;
													}
													utils.updateUserAccessToken(AccessTokenx, senderInstance.accessTokenxs()[0].id, senderInstance.id, required.scope, function(err, accessToken){
														if(err){
															tx.rollback(function(err) {
																cb(utils.getInternalServerError(err));
																return;
															});
															cb(utils.getInternalServerError(err));
															return;
														}
														tx.commit(function(err){});
														var response = {};
														response.id = senderInstance.id;
														response.accessToken = accessToken;
														response.mobile = senderInstance.mobile;
														response.isPaid = true;
														response.wallet = {id: newSenderWalletInstance.id, balance: newSenderWalletInstance.balance, lastUpdated: newSenderWalletInstance.lastUpdated};
														cb(null, response);
														return;
														});
													});
												});
											});
										}catch(err){
											tx.rollback(function(err) {
												cb(utils.getInternalServerError(err));
												return;
											});
											cb(utils.getInternalServerError(err));
											return;
										}
									});
								});
							});
					});
				});
			}
		});
	};

	Buyer.remoteMethod(
		'payRequestedMoney',
		{
			description: "payRequestedMoney",
			accepts: [
						{arg: 'required', type: 'object', required: true},
          				{arg: 'data', type: 'object', required: true}
        			],
			returns: {arg:'response',type:'object'},
			http: {path: '/payRequestedMoney', verb: 'post'}         
		}	
	);






	/**
	*	This method is for checkMobilePaymentData
	*	
	*	@method checkMobilePaymentData
	*	@param {required} contains id, accessToken, mobile, scope
	*	@param {data} contains amount, mobile
	*	@param {cb} callback function
	*	@return {response} response is data
	*/

	Buyer.checkMobilePaymentData = function(required, data, cb){
		var AccessTokenx = Buyer.app.models.AccessTokenx;
		var RequestMoney = Buyer.app.models.RequestMoney;
		var Wallet = Buyer.app.models.Wallet;
		var TransactionW2W = Buyer.app.models.TransactionW2W;

    	if(exValidator.isEmptyObject(required)){
    		cb(utils.getGenericError("Data not received",
    			400,"Error"));
    		return;
    	}
    	//validates the required fields
    	if(!exValidator.isValidRequired(required)){
    		cb(utils.getGenericError("Data is invalid",
    			400,"Error"));
			return;
		}

		if(!data.mobile || !exValidator.isMobile(data.mobile)){
			cb(utils.getGenericError("Invalid mobile",
    			403,"Error"));
			return;
		}

		if(!data.amount || !exValidator.isAmount(data.amount)){
			cb(utils.getGenericError("Invalid amount",
    			403,"Error"));
			return;
		}
		
		if(data.amount > constants.BUYER_REQ_AMOUNT_LIMIT && data.amount < 1){
			cb(utils.getGenericError("Amount must be less than "+constants.BUYER_REQ_AMOUNT_LIMIT,
    			403,"Error"));
			return;
		}

		var currentTime = new Date();

		Buyer.findOne({include: ['wallet', {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}], where: {id: required.id, mobile: required.mobile}}, function(err, senderInstance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(!senderInstance || currentTime > senderInstance.accessTokenxs()[0].expiry){
				cb(utils.getGenericError("Not authenticated",
    				401,"Error"));
				return;
			}
			else{
				if(senderInstance.wallet() && senderInstance.wallet().balance){
					if(senderInstance.wallet().balance < data.amount){
						cb(utils.getGenericError("Not enough balance",
    						401,"Error"));
						return;
					}else{
						Buyer.findOne({where: {mobile: data.mobile}}, function(err, receiver){
							if(err){
								cb(utils.getInternalServerError(err));
								return;
							}
							if(!receiver){
								cb(utils.getGenericError("User doesn't exists",
    								401,"Error"));
								return;
							}else{
								var response = {};
								response.id = receiver.id;
								response.wallet = {id: senderInstance.wallet().id, balance: senderInstance.wallet().balance, lastUpdated: senderInstance.wallet().lastUpdated};
								if(receiver.name)
									response.message = "Confirm to pay to "+receiver.name+" of amount "+data.amount+" :";
								else
									response.message = "Confirm to pay to "+receiver.mobile+" of amount "+data.amount+" :";
								cb(null, response);
								return;
							}
						});
					}
				}
			}
		});
	};

	Buyer.remoteMethod(
		'checkMobilePaymentData',
		{
			description: "checkMobilePaymentData",
			accepts: [
						{arg: 'required', type: 'object', required: true},
          				{arg: 'data', type: 'object', required: true}
        			],
			returns: {arg:'response',type:'object'},
			http: {path: '/checkMobilePaymentData', verb: 'post'}         
		}	
	);




	/**
	*	This method is for paying requested money
	*	
	*	@method payViaMobile
	*	@param {required} contains id, accessToken, mobile, scope
	*	@param {data} contains id, amount
	*	@param {cb} callback function
	*	@return {response} response is data
	*/

	Buyer.payViaMobile = function(required, data, cb){
		
		var AccessTokenx = Buyer.app.models.AccessTokenx;
		var RequestMoney = Buyer.app.models.RequestMoney;
		var Wallet = Buyer.app.models.Wallet;
		var TransactionW2W = Buyer.app.models.TransactionW2W;

    	if(exValidator.isEmptyObject(required)){
    		cb(utils.getGenericError("Data not received",
    			400,"Error"));
    		return;
    	}
    	//validates the required fields
    	if(!exValidator.isValidRequired(required)){
    		cb(utils.getGenericError("Data is invalid",
    			400,"Error"));
			return;
		}

		if(!data.amount || !exValidator.isAmount(data.amount)){
			cb(utils.getGenericError("Invalid amount",
    			403,"Error"));
			return;
		}

		if(!data.id || !validator.isMongoId(data.id)){
			cb(utils.getGenericError("Invalid user ID",
    			400,"Error"));
			return;
		}
		var currentTime = new Date();

		Buyer.findOne({include: ['wallet', {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}], where: {id: required.id, mobile: required.mobile}}, function(err, senderInstance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}
			if(!senderInstance || currentTime > senderInstance.accessTokenxs()[0].expiry){
				cb(utils.getGenericError("Not authenticated",
    				401,"Error"));
				return;
			}
			else{
				Buyer.findOne({include: 'wallet', where: {id: data.id}}, function(err, receiverInstance){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}
					if(!receiverInstance){
						cb(utils.getGenericError("User is not registered",
    						401,"Error"));
						return;
					}
					if(receiverInstance.id.toString() == senderInstance.id.toString()){
						cb(utils.getGenericError("Can't send to same account",
    						401,"Error"));
						return;
					}
					Wallet.findOne({where: {id: receiverInstance.wallet().id}}, function(err, receiverWalletInstance){
						if(err){
							cb(utils.getInternalServerError(err));
							return;
						}
						Wallet.findOne({where: {id: senderInstance.wallet().id}}, function(err, senderWalletInstance){
							if(err){
								cb(utils.getInternalServerError(err));
								return;
							}
							Wallet.beginTransaction({isolationLevel: Wallet.Transaction.READ_COMMITTED}, function(err, tx) {
								if(err){
									cb(utils.getInternalServerError(err));
									return;
								}
								var options = {transaction: tx};
								try{
									if(senderWalletInstance.balance < data.amount){
										cb(utils.getGenericError("Not enough balance",
    										401,"Oops"));
										return;
									}
									receiverWalletInstance.balance = receiverWalletInstance.balance + data.amount;
									senderWalletInstance.balance = senderWalletInstance.balance - data.amount;
									senderWalletInstance.lastUpdated = currentTime;
									receiverWalletInstance.lastUpdated = currentTime;
									receiverWalletInstance.save(options, function(err, newRequesterWalletInstance){
										if(err){
											tx.rollback(function(err) {
												cb(utils.getInternalServerError(err));
												return;
											});
											cb(utils.getInternalServerError(err));
											return;
										}
										senderWalletInstance.save(options, function(err, newSenderWalletInstance){
											if(err){
												tx.rollback(function(err) {
													cb(utils.getInternalServerError(err));
													return;
												});
												cb(utils.getInternalServerError(err));
												return;
												}
											var transactionW2WData = {};
											transactionW2WData.amount = data.amount;
											transactionW2WData.senderId = senderInstance.id;
											transactionW2WData.receiverId = receiverInstance.id;
											transactionW2WData.created = currentTime;
											transactionW2WData.lastUpdated = currentTime;
											transactionW2WData.status = 'done';
											TransactionW2W.create(transactionW2WData, options, function(err, transactionW2WInstance){
												if(err){
													tx.rollback(function(err) {
														cb(utils.getInternalServerError(err));
														return;
													});
													cb(utils.getInternalServerError(err));
													return;
												}
												utils.updateUserAccessToken(AccessTokenx, senderInstance.accessTokenxs()[0].id, senderInstance.id, required.scope, function(err, accessToken){
													if(err){
														tx.rollback(function(err) {
															cb(utils.getInternalServerError(err));
															return;
														});
														cb(utils.getInternalServerError(err));
														return;
													}
													tx.commit(function(err){});
													var response = {};
													response.id = senderInstance.id;
													response.accessToken = accessToken;
													response.mobile = senderInstance.mobile;
													response.isPaid = true;
													response.wallet = {id: newSenderWalletInstance.id, balance: newSenderWalletInstance.balance, lastUpdated: newSenderWalletInstance.lastUpdated};
													cb(null, response);
													return;
												});
											});
										});
										
									});
								}catch(err){
									tx.rollback(function(err) {
										cb(utils.getInternalServerError(err));
										return;
									});
									cb(utils.getInternalServerError(err));
									return;
								}
							});
						});
					});
				});
			}
		});
	};

	Buyer.remoteMethod(
		'payViaMobile',
		{
			description: "payViaMobile",
			accepts: [
						{arg: 'required', type: 'object', required: true},
          				{arg: 'data', type: 'object', required: true}
        			],
			returns: {arg:'response',type:'object'},
			http: {path: '/payViaMobile', verb: 'post'}         
		}	
	);




	/**
	*	This method is for getting Request data
	*	
	*	@method getTransactions
	*	@param {required} contains id, accessToken, mobile, scope
	*	@param {data} contains limit, skip
	*	@param {cb} callback function
	*	@return {response} response is data
	*/

	Buyer.getTransactions = function(query, cb){
		console.log("kjdfsha "+JSON.stringify(query));
    	var currentTime = new Date();
    	if(exValidator.isEmptyObject(query)){
    		cb(utils.getGenericError("Data not received",
    			400,"Incorrect Data Error"));
    		return;
    	}
    	//validates the required fields
    	if(!exValidator.isValidRequired(query)){
    		cb(utils.getGenericError("Data is invalid",
    			400,"Invalid Data Error"));
			return;
		}

		if(!query.limit || typeof query.limit != number || query.limit <= 0){
			cb(utils.getGenericError("Invalid Limits",
    			400,"Error"));
			return;
		}
		if(!query.skip || typeof query.skip != number || query.skip < 0){
			cb(utils.getGenericError("Invalid skip",
    			400,"Error"));
			return;
		}
		Buyer.findOne({include: {relation: 'accessTokenxs', scope: {where: {id: query.accessToken}}}, where: {id: query.id, mobile: query.mobile}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}

			if(!instance || currentTime > instance.accessTokenxs()[0].expiry){
				cb(utils.getGenericError("Not authenticated",
    				401,"Error"));
				return;
			}
			else{
				TransactionW2W.findOne({limit: query.limit, skip: query.skip}, function(err, transactions){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}
					if(transactions){
						var response = {};
						response.transactions = transactions;
						response.count = transactions.length;
						cb(null, response);
						return;
					}else{
						cb(utils.getGenericError("Invalid data set",
    						400,"Error"));
						return;
					}
					
				});
			}
		});
	};

	Buyer.remoteMethod(
		'getTransactions',
		{
			description: "getTransactions	",
			accepts: {arg: 'query', type: 'object', required: true},
			returns: {arg:'response',type:'object'},
			http: {path: '/getTransactions', verb: 'get'}         
		}	
	);




	/**
	*	This method is for getting transaction
	*	
	*	@method getTransaction
	*	@param {required} contains id, accessToken, mobile, scope
	*	@param {data} contains transactionId
	*	@param {cb} callback function
	*	@return {response} response is data
	*/

	Buyer.getTransaction = function(required, data, cb){

    	var currentTime = new Date();
    	if(exValidator.isEmptyObject(required)){
    		cb(utils.getGenericError("Data not received",
    			400,"Incorrect Data Error"));
    		return;
    	}
    	//validates the required fields
    	if(!exValidator.isValidRequired(required)){
    		cb(utils.getGenericError("Data is invalid",
    			400,"Invalid Data Error"));
			return;
		}

		if(!data.transactionId || typeof data.transactionId != number){
			cb(utils.getGenericError("Invalid details",
    			400,"Error"));
			return;
		}
		
		Buyer.findOne({include: {relation: 'accessTokenxs', scope: {where: {id: required.accessToken}}}, where: {id: required.id, mobile: required.mobile}}, function(err, instance){
			if(err){
				cb(utils.getInternalServerError(err));
				return;
			}

			if(!instance || currentTime > instance.accessTokenxs()[0].expiry){
				cb(utils.getGenericError("Not authenticated",
    				401,"Error"));
				return;
			}
			else{
				TransactionW2W.findOne({where: {id: data.transactionId}}, function(err, transaction){
					if(err){
						cb(utils.getInternalServerError(err));
						return;
					}
					if(transaction){
						var response = {};
						response.transaction = transaction;
						cb(null, response);
						return;
					}else{
						cb(utils.getGenericError("Invalid data set",
    						400,"Error"));
						return;
					}
					
				});
			}
		});
	};

	Buyer.remoteMethod(
		'getTransaction',
		{
			description: "getRequestedData	",
			accepts: [
						{arg: 'required', type: 'object', required: true},
          				{arg: 'data', type: 'object', required: true}
        			],
			returns: {arg:'response',type:'object'},
			http: {path: '/getTransaction', verb: 'post'}         
		}	
	);
};

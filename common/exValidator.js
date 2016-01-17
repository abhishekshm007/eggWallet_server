/**
*    description: exValidator.js
*    		-as the name suggests, provides methods for user validation
*                
*    date created: 31/12/15
*    log:-
*			Update 1: 01/01/2016          Author: Sarthak      		
*       		- Update description : 
*       				1. Updated the earlier "isRealm" to "isScope": Now "scope" can be either android,web or ios
*       				2. Added a new "isRealm" method; realm can have values "buyer" or "seller"
*       	
*			Update 2: 04/04/2016		Author : Sarthak
*				- Update descriptio :
*						1. Added methods
*						2. Improved comments
*
*       	latest update: 01/01/2016     Update 1          
*    
*    Listed Methods:
*    	1. isRealm : validates the realms of the given user
*    	2. isScope : validates the scope for the given query, whether it is android,web or ios
*    	3. isEmptyObject : determines whether the object is empty or not
*    	4. isMobileExists : checks for the mobile existence
*		5. isMobile : validates mobile
*    	6. isReferralCode : validates the referred code
*    	7. isValidRequired : validates the "required" object acquired
*		8. isName : validates User name and Shop name
*		9. isAddress : validates Address
*		10. isEmail : validates email
*		11. isLocale : validates Locale
*		12. isMobileOtp : validates mobile otp
*		13. isPassword : validates password
*/

var libphonenumber = require('libphonenumber-node');
var validator = require('validator');
var constants = require("./constants");
var locales = require('./locales');

	var localeMap = {};
	(function(){
		var i = null;
		for (i = 0; locales.length > i; i += 1) {
    		localeMap[locales[i].code] = locales[i];
    	}
    })();
	

// same function is defined below, do changes there when when you here
function isScope(scope){
	if(scope == constants.ANDROID_SCOPE || constants.WEB_SCOPE || constants.IOS_SCOPE){
		return true;
	}
	return false;
};

//validation for the mobile
function isMobile(mobile){
		if(validator.isNumeric(mobile) && validator.isLength(mobile, constants.MOBILE_LEN, constants.MOBILE_LEN))	
			return true;
		return false;
	};

module.exports = {

	/**
	*	check whether object is empty or not
	*/
	isEmptyObject : function(obj){
  		return !Object.keys(obj).length;
	},

	/**
	*	This method is for verifying whether the Mobile exists or not.
	*	
	*	@method isMobileExists
	*	@param {locale} contains the locale i.e. pre-defined country code of the specified user
	*	@param {mobile} contains the mobile of the user 
	*	@return {response} response is either true or false
	*/
	isMobileExists : function(locale, mobile){
		if(locale)
		{
			var formattedMobile = libphonenumber.format(mobile, locale)
    		if(libphonenumber.isValid(formattedMobile))
    		{
    			return true;
    		}
		}	
	},


	/**
	*	This method is for verifying amount is valid exists or not.
	*	
	*	@method isAmount
	*	@param {amount} contains the locale i.e. pre-defined country code of the specified user
	*	@return {response} response is either true or false
	*/
	isAmount : function(amount){
		return validator.isNumeric(amount);
	},

	/**
	*	This method is for validating mobile.
	*	
	*	@method isMobile
	*	@param {mobile} contains the mobile of the user 
	*	@return {response} response is either true or false
	*/
	isMobile : function(mobile){
		if(validator.isNumeric(mobile) && validator.isLength(mobile, constants.MOBILE_LEN, constants.MOBILE_LEN))	
			return true;
		return false;
	},
	
	/**
	*	This method is for verifying the locale of the user.
	*	
	*	@method isLocale
	*	@param {locale} contains the locale i.e. pre-defined country code of the specified user
	*	@return {response} response is either true or false
	*/
	isLocale:function(locale){
		if(localeMap[locale]){		//localeMap() has been defined above
			return true;
		}
 		return false;
	},

	/**
	*	This method is for validating scope.
	*	
	*	@method isScope
	*	@param {scope} contains the scope of the user i.e. platform of the request
	*	@return {response} response is either true or false
	*/
	// same function is defined above, do changes there when when you here
	isScope : function(scope){
		if(scope == constants.ANDROID_SCOPE || constants.WEB_SCOPE || constants.IOS_SCOPE)
			return true;
		return false;
	},

	/**
	*	This method is for validating realm.
	*	
	*	@method isRealm
	*	@param {realm} contains the realm 
	*	@return {response} response is either true or false
	*/
	isRealm:function(realm){
		if( realm == constants.BUYER_REALM || realm == constants.SELLER_REALM)
			return true;
		return false;
	},

	/**
	*	This method is for validating name.
	*	
	*	@method isName
	*	@param {name} contains the name 
	*	@return {response} response is either true or false
	*/
	isName:function(name){
		var re = /^[a-zA-Z ]*$/;
		if( validator.isLength(name, constants.NAME_MIN_LEN, constants.NAME_MAX_LEN)  && re.test(name))
			return true;
		return false;
	},

	/**
	*	This method is for validating ReferralCode.
	*	
	*	@method isReferralCode
	*	@param {referralCode} contains the referralCode 
	*	@return {response} response is either true or false
	*/
	isReferralCode : function(referralCode){
		var re = /^[a-zA-Z0-9]*$/;
		if(referralCode.length == constants.REFERRAL_CODE_LENGTH && re.test(referralCode))
			return true;
		return false;
	},

	/**
	*	This method is for validating Address.
	*	
	*	@method isAddress
	*	@param {address} contains the address 
	*	@return {response} response is either true or false
	*/
	isAddress : function(address){
		var re = /^[a-zA-Z0-9\s,'-]*$/;
		if( validator.isLength(address, constants.ADDRESS_MIN_LEN, constants.ADDRESS_MAX_LEN)  && re.test(address))
			return true;
		return false;
	},

	/**
	*	This method is for validating email.
	*	
	*	@method isEmail
	*	@param {email} contains the email
	*	@return {response} response is either true or false
	*/
	isEmail : function(email){
		var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	return re.test(email);
	},

	/**
	*	This method is for validating required fields.
	*	
	*	@method isvalidRequired
	*	@param {required} 
	*	@return {response} response is either true or false
	*/
	isValidRequired : function(required){
		return (validator.isMongoId(required.id) && isScope(required.scope) && required.accessToken && isMobile(required.mobile));
	},

	/**
	*	This method is for validating mobile OTP.
	*	
	*	@method isMobileOtp
	*	@param {mobiltOtp} 
	*	@return {response} response is either true or false
	*/
	isMobileOtp : function(mobileOtp){
		return (validator.isLength(mobileOtp, constants.MOBILE_OTP_LEN, constants.MOBILE_OTP_LEN) && validator.isNumeric(mobileOtp));
	},

	/**
	*	This method is for validating password.
	*	
	*	@method isPassword
	*	@param {password} 
	*	@return {response} response is either true or false
	*/
	isPassword : function(password){
		return (validator.isLength(password, constants.PASSWORD_MIN_LEN, constants.PASSWORD_MAX_LEN));
	}
}
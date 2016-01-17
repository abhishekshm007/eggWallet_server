/*
    description: constants.js
    		-Defines the constants used at various places
                
    date created: 31/12/15
    log:-
       Update 1: 01/01/2016          Author: Sarthak 
       		latest update: 01/01/2016     Update 1          
    
    Listed Methods:
    	-null
*/
function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define("REFERRAL_CODE_LENGTH", 8);

define("WALLET_DEFAULT_BALANCE", 1000);

define("SELLER_QR_TYPE", 'sein');
define("BUYER_QR_TYPE", 'byin');
define("SELLER_REQ_WR_TYPE", 'slrq');
define("BUYER_REQ_WR_TYPE", 'byrq');

define('SMS_OPTION', 'http://bhashsms.com/api/sendmsg.php?'+
    'user=9988624772&pass=cb495a8&sender=MLABTI&'+
    'phone=MOBILE_HERE&'+
    'text=TEXT_HERE&'+
    'priority=ndnd&stype=normal');

define("PAYMENT_CONFIRMATION_MSG", 'REQUESTER asked AMOUNT on DATE (desc: DESC), confirm to pay...');


define("REQUEST_MONEY_SMS", 'SENDER asked amount of AMOUNT to RECEIVER on DATE');
define("REQUEST_MONEY_SMS_UNREGISTERED", 'SENDER asked amount of AMOUNT to RECEIVER on DATE. cleck here to move on LINK');


define("GCM_SERVER_KEY", 'AIzaSyDg0r5UyyC1BxbR7_8iDRMzgsv_zM4iotA');

define("REQUEST_MONEY_STATUS_INITIAL", 'initial');
define("REQUEST_MONEY_STATUS_DONE", 'done');

define("TRANSACTION_STATUS_REQUEST", 'request');
define("TRANSACTION_STATUS_INITIAL", 'initial');

define("BUYER_REQ_AMOUNT_LIMIT", 1000);


define("MOBILE_OTP_COUNTER", 1000);

define("MOBILE_OTP_HIGH", 999999);
define("MOBILE_OTP_LOW", 100001);

define("MOBILE_OTP_LEN", 6);

define("PASSWORD_MIN_LEN", 6);
define("PASSWORD_MAX_LEN", 30);

define("MOBILE_OTP_TIME", 5);

define("WEB_GCM_KEY_TIME", 259200);
define("ANDROID_GCM_KEY_TIME", 259200);
define("IOS_GCM_KEY_TIME", 259200);

define("REGISTRATION_ACCESS_TOKEN_TIME", 30);    // 5 minutes

define("NAME_MIN_LEN", 3);
define("NAME_MAX_LEN", 200);

define("ANDROID_ACCESS_TOKEN_TIME", 259200);    // 6 months
define("IOS_ACCESS_TOKEN_TIME", 259200);    // 6 months
define("WEB_ACCESS_TOKEN_TIME", 30);    // 30 minutes

define("ADDRESS_MIN_LEN", 1);
define("ADDRESS_MAX_LEN", 500);

define("MOBILE_LEN", 10);

define("ANDROID_SCOPE", 'android');
define("WEB_SCOPE", 'web');
define("IOS_SCOPE", 'ios');

define("BUYER_REALM", 'buyer');
define("SELLER_REALM", 'seller');

define("MOBILE_OTP_MESSAGE", "Your mobile otp is MOBILE_OTP_HERE");

define("RESEND_MOBILE_OTP_HIT_COUNT", 5);
define("RESEND_MOBILE_OTP_HIT_TIME", 120); // 2 hours

define("DESTROY_ACCESS_TOKEN_TIME",10);         //in minutes 
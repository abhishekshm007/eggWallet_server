// built in validator
var validator = require('validator');
// custom validator defined in commons
var exValidator = require('../../common/exValidator');
// utils contain common utility methods
var utils = require('../../common/utils');
// constants contain application level constants
var constants = require('../../common/constants');


module.exports = function(Support) {

	Support.getRequest = function(data, cb){
		if(data.mobile && exValidator.isMobile(data.mobile)){
			var supportData = {};
			supportData.mobile = data.mobile;
			supportData.email = data.email;
			supportData.message = data.message;
			supportData.name = data.name;


			var emailData = {
							from: "egnessegroup@gmail.com", // sender address
  							to: "egnessegroup@gmail.com", // list of receivers
  							subject: "(EGGWALLET) New Request from user", // Subject line
  							text: data.name + "\n" + data.email + "\n" + data.mobile + "\n" + data.message // plaintext body
						};
			Support.create(supportData, function(err, supportInstance){
			});

			Email.send(emailData, function(res){
				
			});
		}else{

		}
	}

	Support.remoteMethod(
		'getRequest',
		{
			description: "Get Request from User",
			accepts: {arg: 'query', type: 'object', required: true, http: { source: 'body' }},
			returns: {arg:'response',type:'object'},
			http: {path: '/getRequest', verb: 'post'}         
		}	
	);
};

/**
*    description : delete_expired_access_token.js
*           - scheduler that runs a script every DESTROY_ACCESS_TOKEN_TIME minutes
*             and deletes all the accessTokens that have expired
*           - Uses the "node-schedule" module
*           - runs at server boot 
*    date created: 08/01/16             Author : Sarthak
*    log:-
*           ----------------------------------       
*/


var scheduler=require('node-schedule');
var constants=require("../../common/constants");
var cronString="*/"+constants.DESTROY_ACCESS_TOKEN_TIME+" * * * *";

module.exports = function(app) {

    /*
    *   this function call to the scheduler's scheduleJob method
    *   schedules a repetitive job that deletes expired tokens
    *   automatically executes every "DESTROY_ACCESS_TOKEN_TIME" minutes   
    */
    scheduler.scheduleJob(cronString,function(){
        var cTime=new Date();
        app.models.AccessTokenx.destroyAll({expiry : {lt: cTime}},function(error,items){
            if(error)
                console.log(error);
            if(items.count!=0)
                console.log("No of expired accessTokens destroyed : "+items.count);
            console.log("Scheduled accessToken destroyer");
            console.log(cTime);
        });
    });   
};
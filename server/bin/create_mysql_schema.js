var app = require('../server');


// this loads the accountDb configuration in ~/server/datasources.json
var dataSource = app.dataSources.mysqlDS;

// this automigrates the Wallet model 
dataSource.automigrate('Wallet', function(err) {
  if (err) throw err; 
});

// this automigrates the TransactionW2W model 
dataSource.automigrate('TransactionW2W', function(err) {
  if (err) throw err; 
});
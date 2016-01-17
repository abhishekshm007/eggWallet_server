var locales = require('../../common/locales.json');

module.exports = function(app) {
  app.dataSources.mongoDS.automigrate('Locale', function(err) {
    if (err) throw err;
 
    app.models.Locale.create(locales, function(err, localesInstance) {
      if (err) throw err;
 
      console.log('locales created: \n');
    });
  });
};
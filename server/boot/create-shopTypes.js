var shopTypes = require('../../common/shopTypes.json');

module.exports = function(app) {
  app.dataSources.mongoDS.automigrate('ShopTypeList', function(err) {
    if (err) throw err;
 
    app.models.ShopTypeList.upsert(shopTypes, function(err, shopTypesInstance) {
      if (err) throw err;
 
      console.log('shopTypes created: \n');
    });
  });
};

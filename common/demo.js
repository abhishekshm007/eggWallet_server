
var Hashids = require("hashids"),
referralHashId = new Hashids("akjsdhfksdf",0, "0123456789ABCDEF");

console.log(referralHashId.encode(parseInt(9761604698)));
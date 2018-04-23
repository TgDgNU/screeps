require('common.constants');
require('prototype.creep');
require('prototype.creep.tasks');
require('prototype.room');
require('Traveler')

_.pickBy=require('module.pickBy');
var hash=require('module.hash')
String.prototype.hash=function(){
    return hash(this)
}
//Object.prototype.hashMe= function(){
//    return("temp")
//    //return(JSON.stringify(this).hash())
//

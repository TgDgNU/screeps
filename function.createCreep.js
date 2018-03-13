/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('function.processCreepQueue');
 * mod.thing == 'a thing'; // true
 */

module.exports = {


};


function createName(creep) {
    return creep["role"]+"-"+creep["subrole"]+"-"+creep["claim"]+Game.time;
}
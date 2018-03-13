/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('lib.display');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    showCreep : function(creep,displayStyle) {
        var result="";
        if (typeof displayStyle === 'undefined') {
            var delimeter = "\n"
        }
        else if (displayStyle="compact") {
            var delimeter = " : "
        }
        for (i in creep){
            result+=i+" "+creep[i]+delimeter
    
        }
        return (result);
    },
    
    findSpawn : function(roomName){
        for (let spawnN in Game.spawns) {
            let spawn = Game.spawns[spawnN];
            if (spawn.room.name ==roomName){
                return ([spawnN,"spawnRoom"])
            }
            for (roomN in spawn.memory.claim){
                if (roomN==roomName) {
                    return([spawnN,"claimRoom"])
                }
            }
        }
        return([null,null]);
    },
    
    constructCreep : function(spawnName,role,subroleArray) {
        
    }


};
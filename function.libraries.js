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
    
    constructCreep : function(roomName,role,subroleArray) {

        /*
        [spawnName,roomType]=lib.findSpawn(roomName);
        if (!spawnName) { return }
        if (!Game.spawns[spawnName].memory.creepQueue){
            Game.spawns[spawnName].memory.creepQueue=[];
        }

        var energyForBuild=Game.spawns[spawnName].room.energyCapacityAvailable;
        var basicBodyLayout=[MOVE,WORK,CARRY];
        var priority={"harvester":35,"upgrader":25,"builder":30,"miner":34,"energyHauler":32,"scout":20,"warbot":55,"claimer":33};


        // Basic body layout for roadrooms
        for (let i=1;i<Math.round(energyForBuild/250);i++) {
            basicBodyLayout=basicBodyLayout.concat([MOVE,WORK,CARRY])
        }

        // energy hauler for no_rooms
        bodyLayout["energyHauler"]=[CARRY,WORK,MOVE,MOVE];
        for (let i=1;i<=(Math.round(energyForBuild-250)/100);i++) {
            bodyLayout["energyHauler"]=bodyLayout["energyHauler"].concat([CARRY,MOVE]);
        }

        bodyLayout["miner"]=[MOVE,WORK,WORK]
        if (energyForBuild<650) {
            for (let i=1;i<=(Math.round(energyForBuild-250)/100);i++) {
                bodyLayout["miner"]=bodyLayout["miner"].concat([WORK]);
            }
            //console.log(bodyLayout["miner"])
        }
        else{
            bodyLayout["miner"]=[WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE]
        }

        bodyLayout["claimer"]=[MOVE,CLAIM]
        for (let i=1;i<=(Math.round(energyForBuild-650)/650);i++) {
            bodyLayout["claimer"]=bodyLayout["claimer"].concat([CLAIM,MOVE]);
        }

        return()
*/
    },


};
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var findEnergy = require('function.findEnergy');
var findEnergyFromMemory = require('function.findEnergyFromMemory');

var roleMineralHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // empty and not in claim room => go there
        if (!creep.memory.working && creep.memory.claim && creep.room.name!=creep.memory.claim){
            creep.say("To "+creep.memory.claim)
            creep.moveTo(new RoomPosition(25, 25, creep.memory.claim));
        }
        // full and in another room => return
        else if (creep.memory.working && creep.room.name!=Game.spawns[creep.memory.spawnedBy].room.name){
            creep.say("Going home")
            creep.moveTo(Game.spawns[creep.memory.spawnedBy].pos,{reusePath: 50});
        }
        // in claim room and empty => look for mineral patch
        else if((_.sum(creep.carry) < creep.carryCapacity && creep.memory.working==false) || _.sum(creep.carry) == 0 || creep.ticksToLive<35) {
            creep.memory.working=false;
            minerals=creep.room.find(FIND_MINERALS,{filter:(m) => m.mineralAmount>0})
            // minaral patch found => gather and return to storage
            if (minerals.length>0){
                harvestTry=creep.harvest(minerals[0])
                if (harvestTry == ERR_NOT_IN_RANGE){
                    creep.moveTo(minerals[0],{visualizePathStyle: {stroke: '#ffffff'},reusePath: 50})
                }
            }
            else{
                // if no minerals found go do something else, best - upgrading
                roleUpgrader.run(creep)
            }
        }
        else {
            // full and in needed room => haul to storage
            creep.memory.working=true;

            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType==STRUCTURE_STORAGE});
            if(target) {
                creep.say("Haul");
                for(const resourceType in creep.carry) {
                    if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
            // nowhere to return
            else {
                console.log(creep.name+" can't haul minerals anywhere");
            }
        }

        if ((creep.carry.energy == creep.carryCapacity) && (creep.memory.working==false)) {creep.memory.working==true;}
    }
};

module.exports = roleMineralHarvester;
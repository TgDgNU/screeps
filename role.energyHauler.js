var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var findEnergy = require('function.findEnergy');
var findEnergyFromMemory = require('function.findEnergyFromMemory');

var roleEnergyHauler = {
    run: function(creep) {
        energy_source=creep.memory['energy_source'];

        if (!creep.memory.working && creep.memory.claim && creep.room.name!=creep.memory.claim){
            creep.say("Rharvest!")
            creep.moveTo(new RoomPosition(25, 20, creep.memory.claim),{reusePath: 50});
        }
        else if (!creep.memory.working){
            if (creep.memory.energySourceId || findEnergyFromMemory.run(creep)){
                if (creep.memory.energySourceType=="storage" || creep.memory.energySourceType=="container") {
                    let result=creep.withdraw(Game.getObjectById(creep.memory.energySourceId),RESOURCE_ENERGY);

                    if ( result== ERR_NOT_IN_RANGE){
                        creep.moveTo(Game.getObjectById(creep.memory.energySourceId),{visualizePathStyle: {stroke: '#00ff00'},reusePath: 50})
                    }
                    else if (result == ERR_INVALID_TARGET || result == ERR_NOT_ENOUGH_RESOURCES){
                        creep.memory.energySourceId=null
                    }
                }
                else if (creep.memory.energySourceType=="droppedEnergy"){
                    let result=creep.pickup(Game.getObjectById(creep.memory.energySourceId));

                    if (result == ERR_NOT_IN_RANGE){
                        creep.moveTo(Game.getObjectById(creep.memory.energySourceId),{visualizePathStyle: {stroke: '#ffffff'},reusePath: 50})
                    }
                    else if (result == ERR_INVALID_TARGET || result == ERR_NOT_ENOUGH_RESOURCES){
                        creep.memory.energySourceId=null
                    }
                }
            }
            else{
                   findEnergy.run(creep)
            }

            //creep.say("Energy!");

        }
        else if (creep.memory.working && creep.room.name!=creep.memory.store_to){
            creep.say("To "+creep.memory.store_to)
            creep.moveTo(new RoomPosition(25, 20, creep.memory.store_to));
            bTarget=creep.pos.findClosestByRange(FIND_STRUCTURES,{filter: (s) => s.hits < (s.hitsMax*0.8)});
            if (bTarget){
                creep.repair(bTarget);
            }
        }
        else {
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (((structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType==STRUCTURE_TOWER) &&
                              structure.energy < structure.energyCapacity) ||
                        (structure.structureType==STRUCTURE_CONTAINER && structure.store.energy <structure.storeCapacity) ||
                        (structure.structureType==STRUCTURE_STORAGE && structure.store.energy <structure.storeCapacity)
                        );
                }
            });
            if (creep.memory.claim==creep.memory.store_to){
                 target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType==STRUCTURE_STORAGE && structure.store.energy <structure.storeCapacity})
            }
            // if found suitable target - transfer or move to it. If not found - target = null
            if(target) {
                creep.say("Haul");
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#fff902'}});
                }
            }  
        }
        
        // if out of energy > go gather some
        if( creep.carry.energy == 0) {
            creep.memory.working=false;

        }
        if( creep.carry.energy == creep.carryCapacity) {
            creep.memory.working=true;
            creep.memory.energySourceId=null;
        }
    }
};

module.exports = roleEnergyHauler;
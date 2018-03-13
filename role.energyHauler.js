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
            if (!creep.memory.closestSourceId){
                resultArray=findEnergyFromMemory.run(creep);
                if (!resultArray{
                    console.log("Creep "+creep.name+" can't find energy in room "+creep.room.name)
                    findEnergy.run(creep)
                }
                else{
                    energySourceId=resultArray[0];
                    energySourceType=resultArray[1];

                    if (energySourceType=="storage" || energySourceType=="container") {
                        if (creep.withdraw(Game.getObjectById(energySourceId) == ERR_NOT_IN_RANGE)){
                            creep.moveTo(Game.getObjectById(energySourceId),{visualizePathStyle: {stroke: '#ffffff'},reusePath: 50})
                        }
                    }
                }
            }

            creep.say("Energy!");

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
            // if found suitable target - transfer or move to it. If not found - target = null
            if(target) {
                creep.say("Haul");
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }  
        }
        
        // if out of energy > go gather some
        if( creep.carry.energy == 0) {
            creep.memory.working=false;
            creep.memory.closestSourceId=null;
        }
        if( creep.carry.energy == creep.carryCapacity) {
            creep.memory.working=true;
        }
    }
};

module.exports = roleEnergyHauler;
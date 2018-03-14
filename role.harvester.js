var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var findEnergy = require('function.findEnergy');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        energy_source=creep.memory['energy_source'];
        
        // if out of energy > go gather some
        if((creep.carry.energy < creep.carryCapacity && creep.memory.working==false) || creep.carry.energy == 0) {
            creep.memory.working=false;
            findEnergy.run(creep);
        }
        // if full - go working (haul energy)
        else {
            // search for nearest
            creep.memory.working=true;

            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType==STRUCTURE_STORAGE ||
                        structure.structureType==STRUCTURE_TOWER) &&
                              structure.energy < structure.energyCapacity;
                }
            });
            if (!target){
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {return (structure.structureType == STRUCTURE_STORAGE 
                        && structure.store.energy < structure.storeCapacity*0.9)}});
            }
            // if found suitable target - transfer or move to it. If not found - target = null
            if(target) {
                creep.say("Haul");
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                bTarget=creep.pos.findInRange(FIND_STRUCTURES,3,{filter: (s) => s.hits < (s.hitsMax*0.8) && s.structureType!=STRUCTURE_WALL}).sort((a,b) => a.hits/a.hitsMax - b.hits/b.hitsMax);;
                if (bTarget.length>0){
                    creep.repair(bTarget[0]);
                }

            }
            else {
                if (creep.room.find(FIND_MY_CONSTRUCTION_SITES).length>0){
                    roleBuilder.run(creep)
                }
                else{
                    roleUpgrader.run(creep);
                }

            }
        }
        
        if ((creep.carry.energy == creep.carryCapacity) && (creep.memory.working==false)) {creep.memory.working==true;}
    }
};

module.exports = roleHarvester;
var roleUpgrader = require('role.upgrader');
var roleRepair = require('role.repair');
var findEnergy = require('function.findEnergy');
var findEnergyFromMemory = require('function.findEnergyFromMemory');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //creep.say("Builder")
        if ('energy_source' in creep.memory) {
            energy_source = creep.memory['energy_source'];
        }
        else{
            energy_source =0;
        }
        
        if (creep.memory.claim && creep.room.name != creep.memory.claim){
            creep.say("claim!")
            creep.moveTo(new RoomPosition(25, 20, creep.memory.claim),{reusePath: 20});
            
        }
        else {
            if(creep.memory.working) {
             var target=creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES,{filter: (s) => s.structureType==STRUCTURE_SPAWN})
             if (!target) {target=creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES,{filter: (s) => s.structureType==STRUCTURE_ROAD || s.structureType==STRUCTURE_EXTENSION || s.structureType=="tower"})}
             if (!target) {target=creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES); }
                if (target) {
                        //creep.say("Build");
                        if(creep.build(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'},reusePath: 20});
                            bTarget=creep.pos.findInRange(FIND_STRUCTURES,3,{filter: (s) => s.hits < s.hitsMax && s.structureType!=STRUCTURE_WALL}).sort((a,b) => a.hits/a.hitsMax - b.hits/b.hitsMax);;
                            if (bTarget.length>0){
                                creep.repair(bTarget[0]);
                            }
                        }
                    }
                else{
                    roleRepair.run(creep);
                    //if (creep.memory.claim && creep.memory.claim == creep.room.name){
                    //    roleRepair.run(creep);
                    //}
                    //else {
                    //    roleUpgrader.run(creep);
                    //}
                    
                }
            }
            // if out of energy > go gather some
            if((creep.carry.energy < creep.carryCapacity && creep.memory.working==false) || creep.carry.energy == 0) {
                creep.memory.working=false;
                if (creep.memory.energySourceId || findEnergyFromMemory.run(creep)){
                    result=creep.getEnergy(Game.getObjectById(creep.memory.energySourceId))
                    if ( result== ERR_NOT_IN_RANGE){
                        creep.moveTo(Game.getObjectById(creep.memory.energySourceId),{visualizePathStyle: {stroke: '#00ff00'},reusePath: 20})
                    }
                    else if (!result || result == ERR_INVALID_TARGET || result == ERR_NOT_ENOUGH_RESOURCES){
                        creep.memory.energySourceId=null
                    }

                }
            }
            // if full - go working (haul energy)
            else {
                creep.memory.working=true;
                creep.memory.energySourceId=null
            }
            
            if ((creep.carry.energy == creep.carryCapacity) && (creep.memory.working==false)) {
                creep.memory.working==true;
                creep.memory.energySourceId=null
            }
        }
    }
};

module.exports = roleBuilder;
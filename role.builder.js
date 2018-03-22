var roleUpgrader = require('role.upgrader');
var roleRepair = require('role.repair');
var findEnergy = require('function.findEnergy');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if ('energy_source' in creep.memory) {
            energy_source = creep.memory['energy_source'];
        }
        else{
            energy_source =0;
        }
        
        if (creep.memory.claim && creep.room.name != creep.memory.claim){
            creep.say("claim!")
            creep.moveTo(new RoomPosition(25, 20, creep.memory.claim));
            
        }
        else {
            if(creep.memory.working) {
             var target=creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES,{filter: (s) => s.structureType==STRUCTURE_ROAD || s.structureType==STRUCTURE_EXTENSION || s.structureType=="tower"})
             if (!target) {target=creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES); }
                if (target) {
                        //creep.say("Build");
                        if(creep.build(target) == ERR_NOT_IN_RANGE) {
                           creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                else{
                    if (creep.memory.claim && creep.memory.claim == creep.room.name){
                        roleRepair.run(creep);
                    }
                    else {
                        roleUpgrader.run(creep);
                    }
                    
                }
            }
            // if out of energy > go gather some
            if((creep.carry.energy < creep.carryCapacity && creep.memory.working==false) || creep.carry.energy == 0) {
                creep.memory.working=false;
                findEnergy.run(creep);
            }
            // if full - go working (haul energy)
            else {
                creep.memory.working=true;
            }
            
            if ((creep.carry.energy == creep.carryCapacity) && (creep.memory.working==false)) {creep.memory.working==true;}
        }
    }
};

module.exports = roleBuilder;
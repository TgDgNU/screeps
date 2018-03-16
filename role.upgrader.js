var findEnergy = require('function.findEnergy');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var energy_source=creep.memory['energy_source'];
        
        if (creep.memory.claim && creep.room.name != creep.memory.claim){
            creep.say("claim!")
            creep.moveTo(new RoomPosition(25, 20, creep.memory.claim));
            
        }
        else{
            
        
            if(creep.memory.working && creep.carry.energy == 0) {
                creep.memory.working = false;
                creep.say('harvest');
            }
            
            if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
                creep.say('upgrade');
            }
    
    
            if(creep.memory.working) {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    bTarget=creep.pos.findInRange(FIND_STRUCTURES,3,{filter: (s) => s.hits < (s.hitsMax)}).sort((a,b) => a.hits/a.hitsMax - b.hits/b.hitsMax);;
                    if (bTarget.length>0){
                        creep.repair(bTarget[0]);
                    }
                }
            }
            else {
                    
                findEnergy.run(creep);
            }
        }
    }
};

module.exports = roleUpgrader;
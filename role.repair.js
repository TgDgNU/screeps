var roleUpgrader = require('role.upgrader');
var findEnergy = require('function.findEnergy');
var roleRepair = {

    /** @param {Creep} creep **/
    run: function(creep) {
        energy_source=creep.memory['energy_source'];

        
        
        
        if((creep.carry.energy < creep.carryCapacity && creep.memory.working==false) || creep.carry.energy == 0) {
            creep.memory.working=false;
            creep.memory.target=false;
            findEnergy.run(creep);
        }
        
     
        else {
            creep.memory.working=true;
            if (creep.memory.target && Game.getObjectById(creep.memory.target)) {
                target=Game.getObjectById(creep.memory.target);
                if (target.hits == target.hitsMax) { creep.memory.target=false;}
            }
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {filter: object => (object.hits < object.hitsMax && (object.hits < object.hitsMax*0.8) && object.structureType != STRUCTURE_WALL && object.structureType != STRUCTURE_RAMPART) });
                if(targets.length == 0) {
                    targets = creep.room.find(FIND_STRUCTURES, {filter: object => (object.hits < object.hitsMax )});
                }
                if(targets.length > 0) {
					targets.sort((a,b) => a.hits - b.hits);
                    creep.memory.target=targets[0].id;
                    if (targets[0].hits < targets[0].hitsMax/2){
                        console.log(creep.name+" Repairing "+targets[0].structureType+" "+targets[0].hits+" "+creep.room.name)
                    }
                }
                else {
                    creep.memory.target=false;
                    roleUpgrader.run(creep);
                }
            }
            if (typeof target !== typeof undefined) { if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }

            }
        }
        
        if ((creep.carry.energy == creep.carryCapacity) && (creep.memory.working==false)) {creep.memory.working==true;}



    }
};

module.exports = roleRepair;
var roleUpgrader = require('role.upgrader');
var findEnergy = require('function.findEnergy');
var findEnergyFromMemory = require('function.findEnergyFromMemory');

var roleRepair = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //creep.say("Repair")
        if ('energy_source' in creep.memory) {
            energy_source = creep.memory['energy_source'];
        }
        else{
            energy_source =0;
        }

        
        
        
        if((creep.carry.energy < creep.carryCapacity && creep.memory.working==false) || creep.carry.energy == 0) {
            creep.memory.working=false;
            creep.memory.target=false;
            if (creep.memory.energySourceId || findEnergyFromMemory.run(creep)){
                result=creep.getEnergy(Game.getObjectById(creep.memory.energySourceId))
                if ( result== ERR_NOT_IN_RANGE){
                    creep.moveTo(Game.getObjectById(creep.memory.energySourceId),{visualizePathStyle: {stroke: '#00ff00'},reusePath: 50})
                }
                else if (!result || result == ERR_INVALID_TARGET || result == ERR_NOT_ENOUGH_RESOURCES){
                    creep.memory.energySourceId=null
                }

            }
        }
        
     
        else {
            creep.memory.working=true;
            creep.memory.energySourceId=null
            if (creep.memory.target && Game.getObjectById(creep.memory.target)) {
                target=Game.getObjectById(creep.memory.target);
                if (target.hits == target.hitsMax) { creep.memory.target=false;}
            }
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {filter: object => (object.hits < object.hitsMax*0.8 && object.structureType != STRUCTURE_WALL &&  object.structureType != STRUCTURE_RAMPART ||  (object.structureType== STRUCTURE_RAMPART && object.hits <2000)) });
                if(targets.length == 0) {targets = creep.room.find(FIND_STRUCTURES, {filter: object => (object.hits < object.hitsMax*0.8 )});}
                if(targets.length == 0) {targets = creep.room.find(FIND_STRUCTURES, {filter: object => (object.hits < object.hitsMax )});}
                if(targets.length > 0) {
					targets.sort((a,b) => a.hits - b.hits);
                    creep.memory.target=targets[0].id;
                }
                else {
                    creep.memory.target=false;
                    roleUpgrader.run(creep);
                }
            }
            if (typeof target !== typeof undefined) { if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                    bTarget=creep.pos.findInRange(FIND_STRUCTURES,3,{filter: (s) => s.hits < s.hitsMax && s.structureType!=STRUCTURE_WALL}).sort((a,b) => a.hits/a.hitsMax - b.hits/b.hitsMax);;
                    if (bTarget.length>0){
                        creep.repair(bTarget[0]);
                    }
                }

            }
        }
        
        if ((creep.carry.energy == creep.carryCapacity) && (creep.memory.working==false)) {creep.memory.working==true;}



    }
};

module.exports = roleRepair;
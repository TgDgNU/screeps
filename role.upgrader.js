var findEnergy = require('function.findEnergy');
var findEnergyFromMemory = require('function.findEnergyFromMemory');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if ('energy_source' in creep.memory) {
            energy_source = creep.memory['energy_source'];
        }
        else{
            energy_source =0;
        }
        
		if (creep.memory.role=="upgrader"){
			creep.memory["useStorage"]=true;
		}
		
        if (creep.memory.claim && creep.room.name != creep.memory.claim){
            creep.say("claim!")
            creep.moveTo(new RoomPosition(25, 20, creep.memory.claim));
            
        }
        else{
            
        
            if(creep.memory.working && creep.carry.energy == 0) {
                creep.memory.working = false;
                creep.say('harvest');
            }
            
            if(!creep.memory.working && creep.carry.energy >= creep.carryCapacity*0.5) {
                creep.memory.working = true;
                creep.say('upgrade');
                creep.memory.energySourceId=null
            }
    
    
            if(creep.memory.working) {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    //bTarget=creep.pos.findInRange(FIND_STRUCTURES,3,{filter: (s) => s.hits < (s.hitsMax)}).sort((a,b) => a.hits/a.hitsMax - b.hits/b.hitsMax);;
                    //if (bTarget.length>0){
                    //    creep.repair(bTarget[0]);
                    //}
                }
            }
            else {
                    
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
        }
    }
}

module.exports = roleUpgrader;
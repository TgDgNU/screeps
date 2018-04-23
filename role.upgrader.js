var findEnergy = require('function.findEnergy');
var findEnergyFromMemory = require('function.findEnergyFromMemory');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
		var testCreep="upgrader-Spawn2-E7S18-5283618"
		if (creep.name==testCreep){
			console.log("test upgrader "+Game.time+" "+creep.carry.energy)
			//console.log(_.filter(creep.body,b=>b.type==WORK).length)
			//console.log(creep.memory.energySourceId)
		}
	
	
	
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
                //creep.memory.energySourceId=null
            }
    
    
            if(creep.memory.working) {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
				else if (creep.carry.energy<=_.filter(creep.body,b=>b.type==WORK).length){

					let result=creep.getEnergy(Game.getObjectById(creep.memory.energySourceId))
					
//					if (creep.name==testCreep){
//						console.log("!!!!")
//						console.log(_.filter(creep.body,b=>b.type==WORK).length)
//						console.log(creep.memory.energySourceId)
//						console.log("result: "+result)
//					}
					
					if (result!=0){
						creep.memory.energySourceId=null
					}
				}
            }
            else {
                    
                if (creep.memory.energySourceId || findEnergyFromMemory.run(creep)){

                    result=creep.getEnergy(Game.getObjectById(creep.memory.energySourceId))
//					if (creep.name==testCreep){
//						console.log("got energySource")
//						console.log(creep.memory.energySourceId)
//						console.log("getenergy result:"+result)
//					}
                    if ( result== ERR_NOT_IN_RANGE){
                        creep.moveTo(Game.getObjectById(creep.memory.energySourceId),{visualizePathStyle: {stroke: '#00ff00'},reusePath: 50})
                    }
                    else if (result!=0|| result == ERR_INVALID_TARGET || result == ERR_NOT_ENOUGH_RESOURCES){
                        creep.memory.energySourceId=null
                    }

                }
            }
        }
    }
}

module.exports = roleUpgrader;
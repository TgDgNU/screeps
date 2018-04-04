var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var findEnergy = require('function.findEnergy');
var findEnergyFromMemory = require('function.findEnergyFromMemory');

var roleEnergyHauler = {
    run: function(creep) {
        if ('energy_source' in creep.memory) {
            energy_source = creep.memory['energy_source'];
        }
        else{
            energy_source =0;
        }

        if (!creep.memory.working && creep.memory.claim && creep.room.name!=creep.memory.claim){
            creep.say("Rharvest!")
            creep.moveTo(new RoomPosition(25, 20, creep.memory.claim),{reusePath: 30});
        }
        else if (!creep.memory.working){
            if (creep.memory.energySourceId || findEnergyFromMemory.run(creep)){
                result=creep.getEnergy(Game.getObjectById(creep.memory.energySourceId))
                if ( result== ERR_NOT_IN_RANGE){
                    creep.moveTo(Game.getObjectById(creep.memory.energySourceId),{visualizePathStyle: {stroke: '#00ff00'},reusePath: 30})
                }
                else if (result == ERR_INVALID_TARGET || result == ERR_NOT_ENOUGH_RESOURCES){
                    creep.memory.energySourceId=null
                }
            }
            else{
                   findEnergy.run(creep)
            }

            //creep.say("Energy!");

        }
        else if (creep.memory.working && creep.room.name!=creep.memory.store_to){
            creep.say("To "+creep.memory.store_to)
            creep.moveTo(new RoomPosition(25, 20, creep.memory.store_to),{reusePath: 20});
            bTarget=creep.pos.findInRange(FIND_STRUCTURES,3,{filter: (s) => s.hits < s.hitsMax});
            if (bTarget.length>0){
                creep.repair(bTarget[0]);
            }
            else{
                bTarget=creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                if (bTarget){
                    creep.build(bTarget);
                }
            }
        }
        else {
            
            
            let temp=creep.getHaulTarget();
            
            
            if (temp){
                creep.say(temp.id)
                creep.memory["haulTo"]=temp.id
                if (!(creep.pos.isNearTo(temp))){
                    creep.moveTo(temp,{reusePath: 20})
                }
                else{
                    creep.transfer(temp,RESOURCE_ENERGY)
                    creep.say("Transfer!")
                    creep.memory["haulTo"]=""
                }
            }
            else {
                creep.drop(RESOURCE_ENERGY)
                console.log("<font color=red>"+creep.name+" had to drop energy - nowhere to haul</font>")
                console.log(creep.room.name)
                console.log(creep.memory["haulTo"])
                console.log(temp)
                creep.memory["haulTo"]=""
            }
            /*
            
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (((structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType==STRUCTURE_TOWER) &&
                              structure.energy < structure.energyCapacity) ||
                        (structure.structureType==STRUCTURE_CONTAINER && structure.store.energy <structure.storeCapacity && !(structure.id in Memory.containers && Memory.containers[structure.id]=="mine")) ||
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
            */
        }
        
        // if out of energy > go gather some
        if( creep.carry.energy == 0) {
            creep.memory.working=false;

        }
        if( creep.carry.energy > creep.carryCapacity*0.5) {
            creep.memory.working=true;
            creep.memory.energySourceId=null;
        }
    }
};

module.exports = roleEnergyHauler;
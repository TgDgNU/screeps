var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var findEnergy = require('function.findEnergy');
var findEnergyFromMemory = require('function.findEnergyFromMemory');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if ('energy_source' in creep.memory) {
            energy_source = creep.memory['energy_source'];
        }
        else{
            energy_source =0;
        }
        
        // pillage remote rooms
        if (!creep.memory.working && creep.memory.claim && creep.room.name!=creep.memory.claim){
            creep.say("To "+creep.memory.claim)
            creep.moveTo(new RoomPosition(25, 20, creep.memory.claim),{reusePath: 50});
            return 
        }
        if (creep.memory.working && creep.room.name!=Game.spawns[creep.memory.spawnedBy].room.name){
            creep.say("Going home")
            creep.moveTo(Game.spawns[creep.memory.spawnedBy].pos,{reusePath: 50});
            return  
        }
        
        // if out of energy > go gather some
        if((creep.carry.energy < creep.carryCapacity && creep.memory.working==false) || creep.carry.energy == 0) {
            creep.memory.working=false;
            if (creep.memory.energySourceId || findEnergyFromMemory.run(creep)){
                if (creep.memory.energySourceType=="storage" || creep.memory.energySourceType=="container") {
                    let result=creep.withdraw(Game.getObjectById(creep.memory.energySourceId),RESOURCE_ENERGY);
                    if ( result== ERR_NOT_IN_RANGE){
                        creep.moveTo(Game.getObjectById(creep.memory.energySourceId),{visualizePathStyle: {stroke: '#00ff00'},reusePath: 50})
                    }
                    else if (result == ERR_INVALID_TARGET || result == ERR_NOT_ENOUGH_RESOURCES){
                        creep.memory.energySourceId=null
                    }
                }
                else if (creep.memory.energySourceType=="droppedEnergy"){
                    let result=creep.pickup(Game.getObjectById(creep.memory.energySourceId));

                    if (result == ERR_NOT_IN_RANGE){
                        creep.moveTo(Game.getObjectById(creep.memory.energySourceId),{visualizePathStyle: {stroke: '#ffffff'},reusePath: 50})
                    }
                    else if (result == ERR_INVALID_TARGET || result == ERR_NOT_ENOUGH_RESOURCES){
                        creep.memory.energySourceId=null
                    }
                }
            }
            else{
                if (Game.cpu.bucket>1000){
                    findEnergy.run(creep)
                }
            }

            //creep.say("Energy!");

        }
        else {
            // search for nearest
            creep.memory.working=true;
            creep.memory.energySourceId=null;

            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType==STRUCTURE_STORAGE ) && structure.energy < structure.energyCapacity) ||
                        (structure.structureType==STRUCTURE_TOWER && structure.energy < structure.energyCapacity*0.7)
                }
            });
            //if (!target){
            //    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            //        filter: (structure) => {return (structure.structureType == STRUCTURE_STORAGE 
            //            && structure.store.energy < structure.storeCapacity*0.9)}});
            //}
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
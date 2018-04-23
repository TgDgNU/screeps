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
        
        if (creep.memory.tasks.length!=0){
            creep.executeTask()
            return
        }
        
        // pillage remote rooms
        
        if (!creep.memory.working && creep.memory.claim && creep.room.name!=creep.memory.claim){
            creep.say("To "+creep.memory.claim)
            creep.moveTo(new RoomPosition(25, 20, creep.memory.claim),{visualizePathStyle: {stroke: '#00ff00'},reusePath: 25});
            creep.memory.energySourceId=null
            return 
        }
        if (creep.memory.working && !creep.room.controller.my && creep.room.name!=Game.spawns[creep.memory.spawnedBy].room.name){
            creep.say("Going home")
            creep.moveTo(Game.spawns[creep.memory.spawnedBy].pos,{visualizePathStyle: {stroke: '#00ff00'},reusePath: 25});
            return  
        }
        
        // if out of energy > go gather some
        creep.say("creep.memory.working")
        if((creep.carry.energy < creep.carryCapacity/2 && creep.memory.working==false) || creep.carry.energy == 0) {
            creep.memory.working=false;
            if (creep.memory.energySourceId || findEnergyFromMemory.run(creep)){
                result=creep.getEnergy(Game.getObjectById(creep.memory.energySourceId))
                if ( result== ERR_NOT_IN_RANGE){
                    if (creep.moveTo(Game.getObjectById(creep.memory.energySourceId),{visualizePathStyle: {stroke: '#00ff00'},reusePath: 50})==ERR_NO_PATH){
                        //creep.memory.energySourceId=null
                    }
                }
                else if (result == ERR_INVALID_TARGET || result == ERR_NOT_ENOUGH_RESOURCES){
                    creep.memory.energySourceId=null
                }
            }
            else{
                creep.say("Mem fail")
                if (Game.cpu.bucket>1000){
                    findEnergy.run(creep)
                }
            }

            //creep.say("Energy!");

        }
        else {
            // search for nearest
            creep.say("Work");
            creep.memory.working=true;
            creep.memory.energySourceId=null
            var target;
            var target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity) ||
                        (structure.structureType==STRUCTURE_TOWER && structure.energy < structure.energyCapacity*0.7) ||
                        (structure.structureType==STRUCTURE_LAB && structure.energy < structure.energyCapacity*0.5) || 
                        (structure.structureType==STRUCTURE_LINK && creep.room.memory.roomEnergy[structure.id].type=="linkStorage" && structure.energy<structure.energyCapacity/2)
                }
            });
            if (!target){
                targetArr = _.map(creep.room.memory.roomEnergy,function(value,key){return _.merge({id:key},value)}).
                    filter(st=>(st.type=="linkStorage" && st.energy<800) || (st.type=="container" && st.subType=="containerController" && (2000-st.energy>creep.carry.energy))).
                        map(s=>Game.getObjectById(s.id))
                if (targetArr.length>0){
                    //target=targetArr[0]
                    target=creep.pos.findClosestByPath(targetArr)
                }
            }
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
                //bTarget=creep.pos.findInRange(FIND_STRUCTURES,3,{filter: (s) => s.hits < (s.hitsMax*0.8) && s.structureType!=STRUCTURE_WALL}).sort((a,b) => a.hits/a.hitsMax - b.hits/b.hitsMax);;
                //if (bTarget.length>0){
                //    creep.repair(bTarget[0]);
                //}

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
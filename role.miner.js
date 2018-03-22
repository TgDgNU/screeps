var createCreep=require('function.createCreep');
var lib=require('function.libraries');


var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.spawning){
            return
        }

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
                
            
            var sources = creep.room.find(FIND_SOURCES);
                // coming to mining site
                if(creep.harvest(sources[energy_source]) == ERR_NOT_IN_RANGE ||
                    creep.harvest(sources[energy_source]) == ERR_NOT_ENOUGH_RESOURCES ) {
                    creep.moveTo(sources[energy_source], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                // at minig site, need container to haul to
                else {
                    if (!("startWorkTime" in creep.memory)){
                        creep.memory["startWorkTime"]=Game.time;
                    }
                    nearest_containers=creep.pos.findInRange(FIND_STRUCTURES, 2, { filter: (structure) => {
                        return (structure.structureType==STRUCTURE_CONTAINER) }})
                    if (nearest_containers.length>0){
                        creep.moveTo(nearest_containers[0]);
                        if (!(nearest_containers[0].id in Memory.containers)){
                            Memory.containers[nearest_containers[0].id]="mine"
                        }
                        // repair if needed
                        if (nearest_containers[0].hits<nearest_containers[0].hitsMax*0.9) {
                            if (creep.carryCapacity>0 && creep.carry.energy==creep.carryCapacity){
                                creep.repair(nearest_containers[0]);
                                creep.say("Repair")
                            }
                        }
                        else {
                            // Dealing with excess energy
                            creep.transfer(nearest_containers[0],RESOURCE_ENERGY)
                            var nearestDroppedEnergy=creep.pos.findInRange(FIND_DROPPED_RESOURCES,1,{filter: R => R.resourceType==RESOURCE_ENERGY})
                            if (nearestDroppedEnergy.length>0){
                                creep.say("Dropped energy!")
                                creep.pickup(nearestDroppedEnergy[0])
                                if (nearestDroppedEnergy[0].amount>1000 && (!("calledAHauler" in creep.memory) || Game.time-creep.memory["calledAHauler"]>600)){
                                    let temp_need_haulers=(nearestDroppedEnergy[0].amount-1000)/2000
                                    for (let i=0; i<temp_need_haulers;i++){
                                        if (lib.checkCreepInQueue(creep.room.name,"energyHauler",{"priority":33,"fast":true,"noWork":true,"claim":creep.room.name,"energy_source":energy_source})<temp_need_haulers){
                                            createCreep.run(creep.room.name,"energyHauler",{"priority":33,"fast":true,"claim":creep.room.name,"energy_source":energy_source});
                                            console.log("<font color=green>"+creep.name+" called a hauler from "+creep.memory.spawnedBy+"</font>")
                                        }
                                        else {
                                            console.log("<font color=red>"+creep.name+" called a hauler from "+creep.memory.spawnedBy+" but creep already in queue!!</font>")
                                        }
                                    }
                                    creep.memory["calledAHauler"]=Game.time;
                                }
                            }

                        }
                        //creep.say("top");
                    }
                    else {
                    nearest_containers=creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, { filter: (structure) => {
                        return (structure.structureType==STRUCTURE_CONTAINER) }})

                        if (nearest_containers.length>0){

                            creep.moveTo(nearest_containers[0]);
                            if (creep.carryCapacity>0 && creep.carry.energy==creep.carryCapacity){
                                creep.build(nearest_containers[0])
                            }
                        }
                        else {
                            creep.room.createConstructionSite(creep.pos,STRUCTURE_CONTAINER)
                        }
                    }

                }

            if (creep.memory.working && creep.carry.energy==creep.carryCapacity && creep.carryCapacity>0) {

                bTarget=creep.pos.findClosestByRange(FIND_STRUCTURES,{filter: (s) => s.hits < s.hitsMax});
                if (bTarget){
                    creep.repair(bTarget);
                }

                var targets = creep.pos.findInRange(FIND_STRUCTURES, 1, { filter: (structure) => {
                        return (structure.structureType==STRUCTURE_CONTAINER) &&
                                  structure.store.energy < structure.storeCapacity;}})
                //console.log(creep.name, targets)
                if (targets.length>0) {
                    //console.log(creep.transfer(targets[0], RESOURCE_ENERGY));
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE && creep.carry.energy == creep.carryCapacity) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
    }
};

module.exports = roleMiner;
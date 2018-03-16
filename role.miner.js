var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        energy_source=creep.memory['energy_source'];

        if (creep.memory.claim && creep.room.name != creep.memory.claim){
            creep.say("claim!")
            creep.moveTo(new RoomPosition(25, 20, creep.memory.claim));
            
        }
        else {
            
        
            var sources = creep.room.find(FIND_SOURCES);
                if(creep.harvest(sources[energy_source]) == ERR_NOT_IN_RANGE ||
                    creep.harvest(sources[energy_source]) == ERR_NOT_ENOUGH_RESOURCES ) {
                    creep.moveTo(sources[energy_source], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                else {
                    nearest_containers=creep.pos.findInRange(FIND_STRUCTURES, 2, { filter: (structure) => {
                        return ((structure.structureType==STRUCTURE_CONTAINER) &&
                                  structure.store.energy < structure.storeCapacity) }})
                    if (nearest_containers.length>0){
                        creep.moveTo(nearest_containers[0]);
                        if (nearest_containers[0].hits<nearest_containers[0].hitsMax*0.5 && creep.carryCapacity>0 && creep.carry.energy==creep.carryCapacity) {
                            creep.repair(nearest_containers[0]);
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
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('function.findEnergy');
 * mod.thing == 'a thing'; // true
 */

var lib=require('function.libraries');

var findEnergy = {
    run: function findEnergy(creep) {
        
            var energy_source=creep.memory.energy_source;
            if (!energy_source){
                energy_source=0;
            }
        
            var source_droppped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES,{filter: energy_spot => (energy_spot.amount>=creep.carryCapacity) && (energy_spot.resourceType == RESOURCE_ENERGY)});
            //console.log(source_droppped.amount);
            var source_container_full=creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => {
                        return (structure.structureType==STRUCTURE_CONTAINER) &&
                                  structure.store.energy > (structure.storeCapacity/2);}})
            //var source_container_not_full=creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => {
            //            return (structure.structureType==STRUCTURE_STORAGE);}})
            var source_container_not_full=creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => {
                        return (structure.structureType==STRUCTURE_CONTAINER) &&
                                  structure.store.energy > (structure.storeCapacity/5);}})
                                  
            var source_storage=creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => {
                        return (structure.structureType==STRUCTURE_STORAGE && structure.store.energy>(structure.storeCapacity/10));}})
            var range_array=[]
            if (typeof source_droppped != typeof undefined && source_droppped) { range_array[0]=-(creep.pos.getRangeTo(source_droppped)*2)+source_droppped.amount/50+16; if (creep.pos.getRangeTo(source_droppped)<=2) {range_array[0]=100} }
            else {range_array[0]=-1000;}
            if (typeof source_container_not_full != typeof undefined && source_container_not_full) { range_array[1]=-creep.pos.getRangeTo(source_container_not_full)+source_container_not_full.store.energy/75-10}
            else {range_array[1]=-1000;}            
            if (typeof source_container_full != typeof undefined && source_container_full) { range_array[2]=-creep.pos.getRangeTo(source_container_full)+source_container_full.store.energy/75-7}
            else {range_array[2]=-1000;}
            //if (typeof source_storage != typeof undefined && source_container_full) { range_array[3]=-creep.pos.getRangeTo(source_storage)+source_storage.store.energy/50-7}
            //else {range_array[3]=-1000;}
            
            var bestpath=range_array.indexOf(Math.max(...range_array))
            
            //if (creep.name=="Harvester3890490") {
            //    console.log(range_array);
            //    console.log(Math.max(...range_array));
            //    console.log(bestpath);
            //}
            if (creep.memory.role=="upgrader" &&  source_storage) {
                if(creep.withdraw(source_storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source_storage, {visualizePathStyle: {stroke: '#ffaa00'},reusePath: 5});
                }
            }
            else if ((Math.max(...range_array) < -5)  && creep.memory.role!="energyHauler" )
            {
                //creep.say("Harv "+Math.max(...range_array));
                var sources = creep.room.find(FIND_SOURCES);
                harvestTry=creep.harvest(sources[energy_source])
                
                if(harvestTry  == ERR_NOT_IN_RANGE && creep.memory.role!="energyHauler") {
                    creep.say("Harvesting");
                    creep.moveTo(sources[energy_source], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            
                else if (harvestTry<0 && creep.memory.role!="energyHauler") {
                    var source_storage=creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => {
                        return (structure.structureType==STRUCTURE_STORAGE && 
                            structure.store.energy>1000);}})
                    if (source_storage) {
                        creep.say("storage");
                        if(creep.withdraw(source_storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(source_storage, {visualizePathStyle: {stroke: '#ffaa00'},reusePath: 50});}
                    }
                }
                else if (creep.memory.role!="energyHauler") {
                    creep.say(harvestTry);
                    creep.moveTo(sources[energy_source], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            else if (bestpath==0){
                            creep.say("dr "+range_array[0]);
                            if(creep.pickup(source_droppped) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(source_droppped,{visualizePathStyle: {stroke: '#ffaa00'}});
                            }
            }
            else if (bestpath==1){
                    creep.say("nf " +Math.max(...range_array));
                    if(creep.withdraw(source_container_not_full,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source_container_not_full, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
            }
            else if (bestpath==2) {
                            creep.say("f "+Math.max(...range_array));
                            if(creep.withdraw(source_container_full,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(source_container_full, {visualizePathStyle: {stroke: '#ffaa00'},reusePath: 50});}
            }
            return true;
    }
};

module.exports = findEnergy;
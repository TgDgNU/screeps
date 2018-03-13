var lib=require('function.libraries');

var findEnergyFromMemory = {
    run: function findEnergyFromMemory(creep) {

        if (!Memory.rooms[creep.room.name]["roomEnergyArray"] || Memory.rooms[creep.room.name]["roomEnergyArray"].length==0) {
            return (false)
        }

        temp=_.filter(Memory.rooms[creep.room.name]["roomEnergyArray"],function(roomEnergyObject) { return roomEnergyObject[1]>=creep.carryCapacity})
        console.log(temp)
        if (temp.length>0) {
            [closestSourceId,closestSourceIdType]=creep.pos.findClosestByPath(temp.map( roomEnergyObject=> [Game.getObjectById(roomEnergyObject[0]),Game.getObjectById(roomEnergyObject[2])])).id;
            return [closestSourceId,closestSourceIdType]
        }
        else {
            return (false)
        }
    }
};

module.exports = findEnergyFromMemory;
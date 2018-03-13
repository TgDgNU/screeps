var lib=require('function.libraries');

var findEnergyFromMemory = {
    run: function findEnergyFromMemory(creep) {

        if (!Memory.room[creep.room.name]["roomEnergyArray"] || Memory.room[creep.room.name]["roomEnergyArray"].length==0) {
            return (false)
        }


        [closestSourceId,closestSourceIdType]=creep.pos.findClosestByPath(_.filter(Memory.rooms[creep.room.name]["roomEnergyArray"],
            function(roomEnergyObject) { return roomEnergyObject[1]>=creep.carryCapacity}).map( roomEnergyObject=> [Game.getObjectById(roomEnergyObject[0]),Game.getObjectById(roomEnergyObject[2])])).id;

        if (closestSourceId) {
            return [closestSourceId,closestSourceIdType]
        }
        else {
            return (false)
        }
    }
};

module.exports = findEnergyFromMemory;
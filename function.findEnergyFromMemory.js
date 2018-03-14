var lib=require('function.libraries');

var findEnergyFromMemory = {
    run: function findEnergyFromMemory(creep) {

        if (!Memory.rooms[creep.room.name]["roomEnergyArray"] || Memory.rooms[creep.room.name]["roomEnergyArray"].length==0) {
            return (false)
        }

        temp=_.filter(Memory.rooms[creep.room.name]["roomEnergyArray"],function(roomEnergyObject) { return roomEnergyObject[1]>=creep.carryCapacity}).
            map( roomEnergyObject=> Game.getObjectById(roomEnergyObject[2]));

        if (temp.length>0) {
           closestSourceId=creep.pos.findClosestByPath(temp).id;
            for (let i in Memory.rooms[creep.room.name]["roomEnergyArray"]){
                if (Memory.rooms[creep.room.name]["roomEnergyArray"][i][2]==closestSourceId){
                    closestSourceIdType=Memory.rooms[creep.room.name]["roomEnergyArray"][i][0];
                    Memory.rooms[creep.room.name]["roomEnergyArray"][i][1]-=creep.carryCapacity;
                }
            }
            creep.memory.energySourceId=closestSourceId;
            creep.memory.energySourceType=closestSourceIdType;

            return (true)
        }
        else {
            return (false)
        }
    }
};

module.exports = findEnergyFromMemory;
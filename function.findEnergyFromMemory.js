var lib=require('function.libraries');

var findEnergyFromMemory = {
    run: function findEnergyFromMemory(creep) {

        if (!Memory.rooms[creep.room.name]["roomEnergyArray"] || Memory.rooms[creep.room.name]["roomEnergyArray"].length==0) {
            return (false)
        }

        temp=_.filter(Memory.rooms[creep.room.name]["roomEnergyArray"],function(roomEnergyObject) { return roomEnergyObject[1]>=creep.carryCapacity})
        if (temp.length>0) {
            //[closestSourceId,closestSourceIdType]=creep.pos.findClosestByPath(temp.map( roomEnergyObject=> [Game.getObjectById(roomEnergyObject[0]),Game.getObjectById(roomEnergyObject[2])])).id;
            closestSourceId=creep.pos.findClosestByPath(temp.map( roomEnergyObject=> Game.getObjectById(roomEnergyObject[2]))).id;
            //console.log("####")
            //console.log("found source id "+closestSourceId);
            //console.log(Memory.rooms[creep.room.name]["roomEnergyArray"])
            //console.log("####")
            for (let i in Memory.rooms[creep.room.name]["roomEnergyArray"]){
                if (Memory.rooms[creep.room.name]["roomEnergyArray"][i][2]==closestSourceId){
                    closestSourceIdType=Memory.rooms[creep.room.name]["roomEnergyArray"][i][0]
                    Memory.rooms[creep.room.name]["roomEnergyArray"][i][1]-=creep.carryCapacity;
                }
            }
            //console.log(_.findIndex(Memory.rooms[creep.room.name]["roomEnergyArray"],function(roomEnergyArrayItem) {roomEnergyArrayItem[2]==closestSourceId}))
            //closestSourceIdType=Memory.rooms[creep.room.name]["roomEnergyArray"][_.findIndex(Memory.rooms[creep.room.name]["roomEnergyArray"],function(roomEnergyArrayItem) {roomEnergyArrayItem[2]==closestSourceId})]
            //closestSourceIdType="temp"
            creep.memory.energySourceId=closestSourceId];
            creep.memory.energySourceType=closestSourceIdType;

            return (true)
        }
        else {
            return (false)
        }
    }
};

module.exports = findEnergyFromMemory;
var lib=require('function.libraries');

var findEnergyFromMemory = {
    run: function findEnergyFromMemory(creep) {

        if (!Memory.rooms[creep.room.name]["roomEnergyArray"] || Memory.rooms[creep.room.name]["roomEnergyArray"].length==0) {
            return (false)
        }

        temp=_.filter(Memory.rooms[creep.room.name]["roomEnergyArray"],function(roomEnergyObject) {
                return roomEnergyObject[1]>=creep.carryCapacity && ((roomEnergyObject[0]=="storage" && creep.memory.useStorage) || (roomEnergyObject[0]=="storage" && roomEnergyObject[1]>900000) ||  (roomEnergyObject[0]=="container" && !(roomEnergyObject[2] in Memory.containers && Memory.containers[roomEnergyObject[2]]=="controller" && creep.memory.role=="harvester"))  || roomEnergyObject[0]=="droppedEnergy" || (creep.memory.role=="upgrader" && roomEnergyObject[0]=="linkController"))}).
                map( roomEnergyObject=> Game.getObjectById(roomEnergyObject[2])).filter(item=>item);
        
        if (temp.length==0){
                //console.log(creep.name+"couldn't find target, searching anywhere")
                creep.say("Reserve")
                temp=_.filter(Memory.rooms[creep.room.name]["roomEnergyArray"],function(roomEnergyObject) {
                return roomEnergyObject[1]>=creep.carryCapacity*0.5 && (roomEnergyObject[0]=="storage"  || (roomEnergyObject[0]=="container" && !(roomEnergyObject[2] in Memory.containers && Memory.containers[roomEnergyObject[2]]=="controller" && creep.memory.role=="harvester")) || (creep.memory.role=="upgrader" && roomEnergyObject[0]=="linkController") )}).
                map( roomEnergyObject=> Game.getObjectById(roomEnergyObject[2])).filter(item=>item);

        }  

        if (temp.length>0) {
            //console.log(creep.room.name+" "+JSON.stringify(temp))
            var closestSource=creep.pos.findClosestByPath(temp)
            if (closestSource){
                closestSourceId=closestSource.id
            }
            else {
                return (false)
            }
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
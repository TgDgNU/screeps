var lib=require('function.libraries');

var findEnergyFromMemory = {
    run: function findEnergyFromMemory(creep) {

        if (!Memory.rooms[creep.room.name]["roomEnergyArray"] || Memory.rooms[creep.room.name]["roomEnergyArray"].length==0) {
            return (false)
        }
        temp=[]
        if (creep.memory.role=="upgrader"){
            temp=_.filter(Memory.rooms[creep.room.name]["roomEnergy"],function(roomEnergyObject) {
                return roomEnergyObject.energy>=creep.carryCapacity && roomEnergyObject.type=="linkController"}).
                map( roomEnergyObject=> Game.getObjectById(roomEnergyObject.id)).filter(item=>item);
                
            if (temp.length==0){
                temp=_.filter(Memory.rooms[creep.room.name]["roomEnergy"],function(roomEnergyObject) {
                    return roomEnergyObject.energy>=creep.carryCapacity && roomEnergyObject.type=="container" && roomEnergyObject.subType=="containerController"}).
                    map( roomEnergyObject=> Game.getObjectById(roomEnergyObject.id)).filter(item=>item);
            
            }
        }

        if (temp.length==0) {
            temp=_.filter(Memory.rooms[creep.room.name]["roomEnergy"],function(roomEnergyObject) {
                return roomEnergyObject.energy>=creep.carryCapacity &&
				((roomEnergyObject.type=="storage" && creep.memory.useStorage) ||
					(roomEnergyObject.type=="storage" && roomEnergyObject.energy>1000000) ||
					(roomEnergyObject.type=="container" && roomEnergyObject.subType!="containerController") ||
					roomEnergyObject.type=="droppedEnergy")}).
                map( roomEnergyObject=> Game.getObjectById(roomEnergyObject.id)).filter(item=>item);
        }
        
        if (temp.length==0){
                //console.log(creep.name+"couldn't find target, searching anywhere")
                //creep.say("Try terminale")
                temp=_.filter(Memory.rooms[creep.room.name]["roomEnergy"],function(roomEnergyObject) {
                return roomEnergyObject.energy>=5000 && (roomEnergyObject.type=="storage"  || roomEnergyObject.type=="terminal")}).
                map( roomEnergyObject=> Game.getObjectById(roomEnergyObject.id)).filter(item=>item);
                //console.log(temp.length)
                

        } 

        
        if (temp.length==0){
                //creep.say("Reserve")
                temp=_.filter(Memory.rooms[creep.room.name]["roomEnergy"],function(roomEnergyObject) {
                return roomEnergyObject.energy>=creep.carryCapacity*0.5 && (roomEnergyObject.type=="storage"  || (roomEnergyObject.type=="container" && !(roomEnergyObject.id in Memory.containers && Memory.containers[roomEnergyObject.id]=="controller" && creep.memory.role=="harvester")) || (creep.memory.role=="upgrader" && roomEnergyObject.type=="linkController") )}).
                map( roomEnergyObject=> Game.getObjectById(roomEnergyObject.id)).filter(item=>item);

        }  


        if (temp.length>0) {
            //console.log(creep.room.name+" "+JSON.stringify(temp))
            var closestSource=creep.pos.findClosestByPath(temp)

            if (closestSource){
                closestSourceId=closestSource.id
                Memory.rooms[creep.room.name]["roomEnergy"][closestSourceId].energy-=creep.carryCapacity
                creep.memory.energySourceId=closestSource.id
                creep.memory.energySourceType=creep.room.memory.roomEnergy[closestSource.id].type;
            }
            else {
                return (false)
            }
            /*
            for (let i in Memory.rooms[creep.room.name]["roomEnergyArray"]){
                if (Memory.rooms[creep.room.name]["roomEnergyArray"][i][2]==closestSourceId){
                    closestSourceIdType=Memory.rooms[creep.room.name]["roomEnergyArray"][i][0];
                    Memory.rooms[creep.room.name]["roomEnergyArray"][i][1]-=creep.carryCapacity;
                }
            }*/
            //creep.memory.energySourceId=closestSourceId;
            //creep.memory.energySourceType=closestSourceIdType;

            return (true)
        }
        else {
            return (false)
        }
    }
};

module.exports = findEnergyFromMemory;
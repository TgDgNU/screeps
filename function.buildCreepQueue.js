var lib=require('function.libraries');
var createCreep=require('function.createCreep');

module.exports = {
    run(roomName){

        var basicRoomLayout={"harvester":3,"upgrader":3,"builder":1}
        var roomLayout=basicRoomLayout;
        var spawnName=lib.findSpawn(roomName)[0];
        
        if (!Game.spawns[spawnName].memory.creepQueue){
            Game.spawns[spawnName].memory.creepQueue=[];
        }
        
        //stable
        var energyForBuild=Game.spawns[spawnName].room.energyCapacityAvailable;
        //no building for unclaimed rooms
        if (!spawnName) { return };
        var roomType=lib.findSpawn(roomName)[1];




        if (spawnName){
            creepArray=createCreepArray();
            if (!(creepArray[roomName])){
                creepArray[roomName]={}
            }
            for (let energySource in Game.rooms[roomName].find(FIND_SOURCES)){
                if (roomType=="spawnRoom" && Memory["rooms"][roomName]["sources"][energySource]["space"]<=1 ){
                    roomLayout={"miner":1};
                }
                else if (roomType=="spawnRoom"){
                    roomLayout=basicRoomLayout;
                }
                else if  (roomType=="claimRoom") {
                    roomLayout={"miner":1,"energyHauler":2,"claimer":1}
                    if (energyForBuild<1300){
                        roomLayout["claimer"]+=1;
                    }
                    if (Game.spawns[spawnName].room.controller.level<=4){
                        roomLayout={"harvester":2}
                    }
                }
                else if (roomType=="expandRoom"){
                    roomLayout={"builder":2,"upgrader":2,"harvester":2}
                    if (!Game.rooms[roomName] || !Game.rooms[roomName].controller.my){
                        roomLayout["claimer"]=1;
                    }
                }
                if (energyForBuild>=350 && !("miner" in roomLayout)){
                    roomLayout["miner"]=1;
                }
                
                // Emergency harvester creation (need at least 2 harvesters in each spawnRoom)
                if (roomType=="spawnRoom" && (_.filter(Game.creeps, (creep) => creep.memory.role=="harvester" && creep.memory.claim==roomName).length+
                    _.filter(Game.spawns[spawnName].memory.creepQueue,(creep)=> creep.memory.role=="harvester" && creep.memory.claim==roomName && creep.priority==100).length)<2){
                    createCreep.run(roomName,"harvester",{"cost":300,priority:100,memory:{"energy_source":energySource}});
                }    
                
                for (let role in roomLayout){
                    creepsFound=_.filter(Game.creeps, (creep) => (!creep.memory.energy_source || creep.memory.energy_source == energySource) && creep.memory.role==role && creep.memory.claim==roomName);
                    creepsInQueue=_.filter(Game.spawns[spawnName].memory.creepQueue,(creep)=> (!creep.memory.energy_source || creep.memory.energy_source == energySource) && creep.memory.role==role && creep.memory.claim==roomName);
                    for (let i=0;i<roomLayout[role]-creepsFound.length-creepsInQueue.length;i++){
                        var fast=false;
                        if (roomType=="claimRoom" || roomType=="expandRoom"){
                            fast=true;
                        }
                        createCreep.run(roomName,role,{"fast":fast,memory:{"energy_source":energySource}});
                    }
                }
            }
        }
        else{
            console.log("Overmind spawn not found for room "+roomName)
        }
    }
}

function createCreepArray() {
    var creepArray={}
    for (let creepName in Game.creeps){
        let creep=Game.creeps[creepName];
        if (!creep.memory.claim) {
            claim=creep.room.name;
        }
        else{
            claim=creep.memory.claim;
        }
        if (!(claim in creepArray)){
            creepArray[claim]={}
        }
        if (!(creep.memory.role in creepArray[claim])){
            creepArray[claim][creep.memory.role]=1;
        }
        else{
            creepArray[claim][creep.memory.role]+=1;
        }
    }
    return (creepArray);
}
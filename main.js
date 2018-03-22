var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleRepair = require('role.repair');
var roleMiner = require('role.miner');
var functionDefendRoom = require("function.defendRoom");
var functionfindEnergy = require("function.findEnergy");
var roleBuilder = require('role.builder');
var roleClaimer = require('role.claimer');
var roleEnergyHauler = require('role.energyHauler');
var roleMineralHarvester = require('role.mineralHarvester');
//var createClaimParty = require('function.createClaimParty');
var processCreepQueue = require('function.processCreepQueue');
var buildCreepQueue=require('function.buildCreepQueue');
var lib=require('function.libraries');
//var processRoom=require('function.processRoom');
var createCreep=require('function.createCreep');
const profiler = require('screeps-profiler');

//profiler.enable();
module.exports.loop = function () {
  profiler.wrap(function() {
//Game.spawns["Spawn3"].memory["creepQueue"]=[]
    Game.createCreep=createCreep.run
    Game.resetCreepQueue=lib.resetCreepQueue
    Game.checkCreepInQueue=lib.checkCreepInQueue
    Game.findSpawn=lib.findSpawn
    
    global.rooms={}
    for (let roomName in Game.rooms){
        rooms[roomName]={}
    }
    
    
    //Game.scoutClaimRooms=scoutClaimRooms

    if (Game.time%3===0){
        if (!("containers" in Memory)){
            Memory.containers={}
        }
        for (let rName in Game.rooms){
            let res=Game.rooms[rName].processRoom()
            //let res=processRoom.findEnergy(rName);
            if (!(rName in Memory.rooms)){
                Memory.rooms[rName]={}
            }
            if (res!=null){
                Memory.rooms[rName]["roomEnergyArray"]=res;
            }
            else {
                Game.notify("Error processing room "+rName)
            }
        }
        
    }


for (let rName in Game.rooms){
    if (!(rName in Memory.rooms)){
        Memory.rooms[rName]={};
        Memory.rooms[rName]["sources"]={}
        for (energySourceId in Game.rooms[rName].find(FIND_SOURCES)){
            Memory.rooms[rName]["sources"][energySourceId]=3;
        }
    }
    //Memory["rooms"]["E8S18"]["sources"][0]["space"]=5
    //Memory["rooms"]["E8S18"]["sources"][1]["space"]=1
    functionDefendRoom.run(rName);
    
    
    if (lib.findSpawn(rName) && (lib.findSpawn(rName)[1]=="spawnRoom" || lib.findSpawn(rName)[1]=="expandRoom" || (lib.findSpawn(rName)[1]=="claimRoom" && Game.rooms[rName].find(FIND_HOSTILE_CREEPS).length==0))){
        buildCreepQueue.run(rName);
    }

}

for (let spawnName in Game.spawns){
    for (let claimRoomName in Game.spawns[spawnName].memory.claim){
        if (Game.spawns[spawnName].memory.claim[claimRoomName]=="expandRoom" && Game.rooms[claimRoomName] && Game.rooms[claimRoomName].controller.level>=3){
            Game.notify(claimRoomName+" reached level 3, now it's on it's own")
            console.log(claimRoomName+" reached level 3, now it's on it's own")
            delete(Game.spawns[spawnName].memory.claim[claimRoomName])
        }
        //console.log(spawnName+" "+claimRoomName+" "+Game.spawns[spawnName].memory.claim[claimRoomName])
    }
}



    if (Game.time%3===0) {
        // AntiInvader
        for (let rName in Game.rooms){
            let spawnName=lib.findSpawn(rName)[0]
            if(spawnName && Game.rooms[rName].find(FIND_HOSTILE_CREEPS,{filter : cr => cr.owner.username=="Invader"}).length>0) {
                if ((!(Memory.rooms[rName]["spawnedDefenderTime"]) || ((Game.time-Memory.rooms[rName]["spawnedDefenderTime"])>1300))) {
                    createCreep.run(rName,"warbot",{"cost":1000,"priority":80});
                    Game.notify("Call warbot to battle in room "+rName);
                    console.log("<font color=red>Call warbot to battle in room "+rName+"</font>");
                    Memory.rooms[rName]["spawnedDefenderTime"]=Game.time;
                }
            }
        }
        // Process Creep Queue
        for (let spawnName in Game.spawns) {
            if (!("creepQueue" in Game.spawns[spawnName].memory)){
                Game.spawns[spawnName].memory["creepQueue"]=[];
            }
            if (!Game.spawns[spawnName].spawning && Game.spawns[spawnName].memory.creepQueue.length>0) {
                processCreepQueue.run(spawnName);
            }
        }
    }


    // scout for rooms that are claimed but not visible
    if ((Game.time % 1500) === 0) {
        scoutClaimRooms()
    }


// every 300 ticks check if energy source (with free space near it) is mined correctly. If not - spawn additional creep.
if ((Game.time % 600) === 0) {
    for (let spawnName in Game.spawns){
        let spawn=Game.spawns[spawnName];
        let roomName=Game.spawns[spawnName].room.name;
        //console.log("Checking for loose energy ");
        energySources=Game.rooms[roomName].find(FIND_SOURCES)
        for (let energySourceID in energySources){
            if ( Memory["rooms"][roomName]["sources"][energySourceID]["space"]>1 &&
                (energySources[energySourceID].energy/energySources[energySourceID].energyCapacity) >
                ((energySources[energySourceID].ticksToRegeneration+20)/300)){
                //Game.spawns[spawnName].memory.creepQueue.push({body:[WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],role:"harvester",priority:11,energy_source:energySourceID})
                //Game.spawns[spawnName].memory.creepQueue.push({body:[WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],role:"upgrader",priority:10,energy_source:energySourceID})
                console.log("Need additional creep for energy source "+energySourceID);
                Game.notify("Need additional creep for energy source "+energySourceID);

            }
        }
        //console.log("Checking for full containers");
        fullContainers=Game.rooms[roomName].find(FIND_STRUCTURES,{filter:(s) => s.structureType==STRUCTURE_CONTAINER && s.store.energy>(s.storeCapacity*0.8)})
        
        if (fullContainers.length>0){
            if (Game.rooms[roomName].find(FIND_STRUCTURES,{filter:(s) => s.structureType==STRUCTURE_STORAGE}).length>0){
                createCreep.run(roomName,"energyHauler",{"cost":1200,"noWork":true});
                Game.notify("<font color=green>Spawning additional energyHauler for room "+roomName+"</font>")
                console.log("<font color=green>Spawning additional energyHauler for room "+roomName+"</font>")

            }
            else {
                Game.notify("<font color=green>Spawning additional upgrader for room "+roomName+"</font>")
                console.log("<font color=green>Spawning additional upgrader for room "+roomName+"</font>")
                createCreep.run(roomName,"upgrader",{"cost":1200});
            }

        }
        //console.log("Checking for full storage");
        fullStorage=Game.rooms[roomName].find(FIND_STRUCTURES,{filter:(s) => s.structureType==STRUCTURE_STORAGE && s.store.energy>(s.storeCapacity*0.7)})
        if (fullStorage.length>0){
            if (lib.checkCreepInQueue(roomName,"upgrader",{"cost":1700,"super":true,"priority":39})==0){
                Game.notify("<font color=green>Spawning additional super upgrader for room "+roomName+"</font>")
                console.log("<font color=green>Spawning additional super upgrader for room "+roomName+"</font>")
                createCreep.run(roomName,"upgrader",{"cost":1700,"super":true,"priority":39});
            }
            else {
                console.log("<font color=red>Spawning additional super upgrader for room "+roomName+" but it is already on queue!</font>")
            }

        }
    }
}


// Quick monitoring to console
//if ((Game.time % 50) === 0) {
//    console.log(getCreepsStatus());
//}

// Monitoring after two energy resets
if (Game.time % 600 === 0) {
    for(let i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    notificationArray=createGameNotification()
    for (line in notificationArray){
        Game.notify(notificationArray[line]);
    }
    
    var temp="Queue\n"
    for (let spawnName in Game.spawns) {
        temp+=spawnName+": "+Game.spawns[spawnName].memory.creepQueue.length+" creeps\n";
        if (Game.spawns[spawnName].memory.creepQueue.length>=15){
            Game.notify("Had to reset creepqueue for "+spawnName);
            lib.resetCreepQueue(spawnName)
        }
    }
    Game.notify(temp);
}



    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        try {
            if (creep.spawning){
                continue;
            }
            
            if (creep.memory.role!="warbot" && creep.flee()){
                creep.say("Flee!")
                continue;
            }
            if(creep.memory.role == 'harvester') {
                roleHarvester.run(creep);
            }
            else if(creep.memory.role == 'repair' || (creep.memory.role == 'builder' && creep.memory.subrole=="repair")) {
                roleRepair.run(creep);
            }
            else if(creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep);
            }
            else if(creep.memory.role == 'builder' ) {
                roleBuilder.run(creep);
            }
            else if(creep.memory.role == 'miner' || (creep.memory.role == 'harvester' && creep.memory.subrole=="miner")) {
                if (!("replace" in creep.memory) && creep.memory.spawnTime && creep.memory.startWorkTime && creep.ticksToLive<(creep.memory.startWorkTime-creep.memory.spawnTime)){
                    console.log("<font color=green>"+creep.name+" needs replacement</font>")
                    creep.memory["replace"]=true;
                 }
                roleMiner.run(creep);
            }
            else if(creep.memory.role == 'claimer') {
                roleClaimer.run(creep);
            }
            else if(creep.memory.role == 'energyHauler' || (creep.memory.role == 'harvester' && creep.memory.subrole=="energyHauler")) {
                roleEnergyHauler.run(creep);
            }
            else if(creep.memory.role == 'mineralHarvester' || (creep.memory.role == 'harvester' && creep.memory.subrole=="mineralHarvester")) {
                roleMineralHarvester.run(creep);
            }
        }
        catch (error){
            Game.notify("Error in creep "+name);
            console.log("<color=red>Error in creep "+name+"</color>");
            console.log(error)
        }
    }
  });

}

function getCreepsStatus() {
    notification="Searching for creeps";
    //notification+=createGameNotification();

    for (let spawnName in Game.spawns){
        var controllerProgressQDelta=Game.spawns[spawnName].room.controller.progress-Game.spawns[spawnName].memory.controllerProgressQ;
        notification+="\n"+spawnName+" controller quick progress "+Game.spawns[spawnName].room.controller.progress+" delta "+controllerProgressQDelta;
        Game.spawns[spawnName].memory.controllerProgressQ=Game.spawns[spawnName].room.controller.progress;
    }
    return(notification);
}

function getAllAvaibleEnergy(spawnName){
    var energy=0;
    searchStructures=Game.spawns[spawnName].room.find(FIND_STRUCTURES,{filter:
            (s) => s.structureType== STRUCTURE_SPAWN || s.structureType== STRUCTURE_EXTENSION ||
                s.structureType == STRUCTURE_LINK || s.structureType ==STRUCTURE_STORAGE ||
                s.structureType ==STRUCTURE_TOWER || s.structureType==STRUCTURE_CONTAINER ||
                s.structureType==STRUCTURE_NUKER} )
                
    for (i in searchStructures) {
            if (searchStructures[i].energy) {
                energy+=searchStructures[i].energy;
            }
            else if (searchStructures[i].store){
                energy+=searchStructures[i].store.energy;
            }
        }
    
    return(energy);
}

function createGameNotification(){
    var notification=[];
    notification[0]="";
    var spawnName;
    var creep;
    for (spawnName in Game.spawns){
        notification[notification.length-1]+="\n"+spawnName+" "+Game.spawns[spawnName].room.name;
        notification[notification.length-1]+="\nMax Energy "+Game.spawns[spawnName].room.energyCapacityAvailable;


        var controller_delta=Game.spawns[spawnName].room.controller.progress-Game.spawns[spawnName].memory.controller_progress;
        notification[notification.length-1]+="\nController progress "+Game.spawns[spawnName].room.controller.progress+" delta "+controller_delta;
        notification[notification.length-1]+="\nStorage "+getAllAvaibleEnergy(spawnName);;
        Game.spawns[spawnName].memory.controller_progress=Game.spawns[spawnName].room.controller.progress;
        notification.push("")
    }

    let creepArray=createCreepArray()
    
    for (let room in creepArray){
        notification.push("\n"+room);
        for (let role in creepArray[room]){
            notification[notification.length-1]+="\n"+role+" "+creepArray[room][role];
        }
    }


    return (notification);
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
function scoutClaimRooms(){
    for (let spawnName in Game.spawns){
        let spawn=Game.spawns[spawnName];
        for (let claimRoom in spawn.memory.claim){
            if (!(claimRoom in Game.rooms)){
                Game.notify("Send scout to room "+claimRoom)
                createCreep.run(claimRoom,"warbot",{"priority":9,"fast":true,"scout":true,"claim":claimRoom,"cost":200});
            }
        }
    }
}
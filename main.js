var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleRepair = require('role.repair');
var roleMiner = require('role.miner');
var functionDefendRoom = require("function.defendRoom");
var functionfindEnergy = require("function.findEnergy");
var roleBuilder = require('role.builder');
var roleClaimer = require('role.claimer');
var roleEnergyHauler = require('role.energyHauler');
var createClaimParty = require('function.createClaimParty');
var processCreepQueue = require('function.processCreepQueue');
var buildCreepQueue=require('function.buildCreepQueue');
var lib=require('function.libraries');
var processRoom=require('function.processRoom');

module.exports.loop = function () {


    if (Game.time%10===0){
        for (let rName in Game.rooms){
            processRoom.findEnergy(rName);
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
    
    
    if (lib.findSpawn(rName) && (lib.findSpawn(rName)[1]=="spawnRoom" || (lib.findSpawn(rName)[1]=="claimRoom" && Game.rooms[rName].find(FIND_HOSTILE_CREEPS).length==0))){
        buildCreepQueue.run(rName);
    }

}



if (Game.time%3===0) {
    for (let rName in Game.rooms){
        if(lib.findSpawn(rName) && Game.rooms[rName].find(FIND_HOSTILE_CREEPS).length>0) {
            Game.notify("Enemies in "+rName)
            if ((!(Memory.rooms[rName]["spawnedDefenderTime"]) || ((Game.time-Memory.rooms[rName]["spawnedDefenderTime"])>1000))) {
                Game.notify("Spawning defenders ")
                let bodyLayout={};
                bodyLayout["warbot"]=[MOVE,ATTACK];
                for (let i=1;i<=(Math.round(Game.spawns[lib.findSpawn(rName)[0]].room.energyCapacityAvailable-130)/130);i++) {
                    bodyLayout["warbot"]=bodyLayout["warbot"].concat([MOVE,ATTACK]);
                }
                if (rName!="E8S17"){
                    Game.spawns[lib.findSpawn(rName)[0]].memory.creepQueue.push({body:bodyLayout["warbot"],role:"warbot",priority:50,claim:rName})
                    Game.notify("Spawned warbot to battle in room "+rName);
                    Memory.rooms[rName]["spawnedDefenderTime"]=Game.time;
                    for (let id in Game.spawns[lib.findSpawn(rName)[0]].memory.creepQueue){
                        Game.notify(lib.showCreep(Game.spawns[lib.findSpawn(rName)[0]].memory.creepQueue[id],"compact"));
                    }
                    
                }
            }
            //Game.spawns[lib.findSpawn(rName)[0]].memory.creepQueue.unshift({body:bodyLayout["warbot"],role:"warbot",priority:priority[role],energy_source:energySource,claim:roomName})
            
        }
    }
    for (let spawnName in Game.spawns) {
        if (!Game.spawns[spawnName].spawning && Game.spawns[spawnName].memory.creepQueue.length>0) {
            processCreepQueue.run(spawnName);
        }
    }
}



    if ((Game.time % 1500) === 0) {
        console.log("Scouting non-visible rooms")
        for (let spawnName in Game.spawns){
            let spawn=Game.spawns[spawnName];
            for (let claimRoom in spawn.memory.claim){
                if (!(claimRoom in Game.rooms)){
                    Game.spawns[spawnName].memory.creepQueue.push({body:[MOVE],role:"warbot",priority:9,claim:claimRoom})
                    console.log("Send scout to room "+claimRoom)
                }
            }
        }
    }


// every 50 ticks check if energy source (with free space near it) is mined correctly. If not - spawn additional creep.
if ((Game.time % 150) === 0) {
    for (let spawnName in Game.spawns){
        let spawn=Game.spawns[spawnName];
        let roomName=Game.spawns[spawnName].room.name;
        console.log("Checking for loose energy ");
        energySources=Game.rooms[roomName].find(FIND_SOURCES)
        for (let energySourceID in energySources){
            if ( Memory["rooms"][roomName]["sources"][energySourceID]["space"]>1 &&
                    (energySources[energySourceID].energy/energySources[energySourceID].energyCapacity) >
                        ((energySources[energySourceID].ticksToRegeneration+20)/300)){
                Game.spawns[spawnName].memory.creepQueue.push({body:[WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],role:"harvester",priority:10,energy_source:energySourceID})
                Game.spawns[spawnName].memory.creepQueue.push({body:[WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],role:"upgrader",priority:10,energy_source:energySourceID})
                console.log("Spawning additional creep for energy source "+energySourceID);

            }
        }
        console.log("Checking for full containers");
        fullContainers=Game.rooms[roomName].find(FIND_STRUCTURES,{filter:(s) => s.structureType==STRUCTURE_CONTAINER && s.store.energy>(s.storeCapacity*0.8)})
        if (fullContainers.length>0){
            console.log("<font color=green>Spawning additional harvester for room "+roomName+"</font>")
            Game.spawns[spawnName].memory.creepQueue.push({body:[WORK,WORK,CARRY,CARRY,MOVE,MOVE],role:"harvester",priority:10})    
        }
            //if ( Memory["rooms"][roomName]["sources"][energySourceID]["space"]>1 &&
            //        (energySources[energySourceID].energy/energySources[energySourceID].energyCapacity) >
            //            ((energySources[energySourceID].ticksToRegeneration+20)/300)){
            //    Game.spawns[spawnName].memory.creepQueue.push({body:[WORK,WORK,CARRY,CARRY,MOVE,MOVE],role:"harvester",priority:10,energy_source:energySourceID})
            //    console.log("Spawning additional creep for energy source "+energySourceID);
            //}
        
    }
}

//if (Game.time%300==0){
//    Game.spawns["Spawn1"].memory.creepQueue.push({body:[WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],role:"harvester",priority:11,claim:"E8S19",energy_source:0 })  
//    Game.spawns["Spawn1"].memory.creepQueue.push({body:[WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],role:"upgrader",priority:11,claim:"E8S19",energy_source:1 }) 
//}

//for (creepID in Game.creeps){
//    if (Game.creeps[creepID].room.name=="E8S19") {
//        Game.creeps[creepID].memory.claim="E7S18";
//        
//    }
//}

// Quick monitoring to console
if ((Game.time % 50) === 0) {
    console.log(getCreepsStatus());
}

// Monitoring after two energy resets
if (Game.time % 600 === 0) {
    for(let i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    Game.notify(createGameNotification());
}




    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'repair' || (creep.memory.role == 'builder' && creep.memory.subrole=="repair")) {
            roleRepair.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder' ) {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'miner' || (creep.memory.role == 'harvester' && creep.memory.subrole=="miner")) {
            roleMiner.run(creep);
        }
        if(creep.memory.role == 'claimer') {
            roleClaimer.run(creep);
        }
        if(creep.memory.role == 'energyHauler' || (creep.memory.role == 'harvester' && creep.memory.subrole=="energyHauler")) {
            roleEnergyHauler.run(creep);
        }
    }

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
    var notification="\n######";
    var spawnName;
    var creep;
    for (spawnName in Game.spawns){
        notification+="\n"+spawnName+" "+Game.spawns[spawnName].room.name;
        notification+="\n Max Energy "+Game.spawns[spawnName].room.energyCapacityAvailable;


        var controller_delta=Game.spawns[spawnName].room.controller.progress-Game.spawns[spawnName].memory.controller_progress;
        notification+="\nController progress "+Game.spawns[spawnName].room.controller.progress+" delta "+controller_delta;
        notification+="\nStorage "+getAllAvaibleEnergy(spawnName);;
        Game.spawns[spawnName].memory.controller_progress=Game.spawns[spawnName].room.controller.progress;
        
    }

    let creepArray=createCreepArray()
    
    for (let room in creepArray){
        notification+="\n"+room;
        for (let role in creepArray[room]){
            notification+="\n"+role+" "+creepArray[room][role];
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
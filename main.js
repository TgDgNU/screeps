var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleRepair = require('role.repair');
var roleWallRepair = require('role.wallRepair');
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
var TaskManager=require('prototype.taskManager');

require('common.requests');

const profiler = require('screeps-profiler');

profiler.enable();
module.exports.loop = function () {
    if (Game.cpu.bucket <1000){
        console.log("Skipped tick "+Game.time)
        return;
    }
  profiler.wrap(function() {
//Game.spawns["Spawn3"].memory["creepQueue"]=[]
    Game.createCreep=createCreep.run
    Game.resetCreepQueue=lib.resetCreepQueue
    Game.checkCreepInQueue=lib.checkCreepInQueue
    Game.findSpawn=lib.findSpawn
    
    
    //console.log(Game.rooms["E2S19"].getStoredEnergy())
	//var E2S19TaskQueue=new TaskManager(Game.rooms["E2S19"])
	//console.log(JSON.stringify(E2S19TaskQueue))
	//E2S19TaskQueue.createTask("spawnCreep",100,{})
	
	
    global.rooms={}
    for (let roomName in Game.rooms){
        rooms[roomName]={}
    }
    
    //Game.spawns.Spawn5.creepQueue=[{"body":[CARRY,WORK,MOVE],"priority":45,"energy":250,"memory":{"claim":"E2S19","role":"upgrader","energy_source":"0"}}]
    
    //Game.scoutClaimRooms=scoutClaimRooms

    if (Game.time%10===0){
        terminalsArr=_.filter(Game.structures, {structureType:STRUCTURE_TERMINAL})
        for (id in terminalsArr){
        	if (_.sum(terminalsArr[id].store)>100000){
            	bestOrderId=Game.market.getAllOrders(order => order.resourceType == RESOURCE_ENERGY && 		order.type == ORDER_BUY && order.amount>1000).sort((o1,o2)=>1000*o2.price/(1000+Game.market.calcTransactionCost(1000, terminalsArr[id].room.name, o2.roomName))-1000*o1.price/(1000+Game.market.calcTransactionCost(1000, terminalsArr[id].room.name, o1.roomName)))[0].id
            	bestOrder=Game.market.getOrderById(bestOrderId)
            	let realPrice=1000*bestOrder.price/(1000+Game.market.calcTransactionCost(1000, terminalsArr[id].room.name, bestOrder.roomName))
            	if (realPrice>0.035 || _.sum(terminalsArr[id].store)>280000){
                	Game.notify("Deal "+Game.market.getOrderById(bestOrderId).price+" room "+terminalsArr[id].room.name+" energy loss "+Game.market.calcTransactionCost(1000, terminalsArr[id].room.name, Game.market.getOrderById(bestOrderId).roomName ))
                    console.log("Deal "+Game.market.getOrderById(bestOrderId).price+" room "+terminalsArr[id].room.name+" energy loss "+Game.market.calcTransactionCost(1000, terminalsArr[id].room.name, Game.market.getOrderById(bestOrderId).roomName ))
                	Game.market.deal(bestOrderId,10000,terminalsArr[id].room.name)
            	}
        	}
        }
    }




    if (Game.time%3===0){
        if (!("containers" in Memory)){
            Memory.containers={}
        }
        for (let rName in Game.rooms){
            //let res=Game.rooms[rName].processRoom()
            Game.rooms[rName].processRoom()
        }
        for (let rName in Game.rooms){
            if (lib.findSpawn(rName) && (lib.findSpawn(rName)[1]=="spawnRoom" || lib.findSpawn(rName)[1]=="expandRoom" || (lib.findSpawn(rName)[1]=="claimRoom" && Game.rooms[rName].find(FIND_HOSTILE_CREEPS).length==0))){
                buildCreepQueue.run(rName);
            }
            if (!(rName in Memory.rooms)){
                Memory.rooms[rName]={};
                Memory.rooms[rName]["sources"]={}
                for (energySourceId in Game.rooms[rName].find(FIND_SOURCES)){
                    Memory.rooms[rName]["sources"][energySourceId]=3;
                }
            }
        }
        
        
    }


for (let rName in Game.rooms){

    functionDefendRoom.run(rName);
    
    


}





    if (Game.time%3===0) {
        // AntiInvader
        for (let rName in Game.rooms){
            let spawnName=lib.findSpawn(rName)[0]
            if(spawnName && Game.rooms[rName].hasHostiles()) {
                if ((!(Memory.rooms[rName]["spawnedDefenderTime"]) || ((Game.time-Memory.rooms[rName]["spawnedDefenderTime"])>1300))) {
                    createCreep.run(rName,"warbot",{"cost":1200,"priority":80});
                    Game.notify("Call warbot to battle in room "+rName);
                    console.log("<font color=red>Call warbot to battle in room "+rName+"</font>");
                    Memory.rooms[rName]["spawnedDefenderTime"]=Game.time;
                }
            }
        }
        
        // Process expandRooms
        for (let spawnName in Game.spawns){
            for (let claimRoomName in Game.spawns[spawnName].memory.claim){
                if (Game.spawns[spawnName].memory.claim[claimRoomName]=="expandRoom" && Game.rooms[claimRoomName] && Game.rooms[claimRoomName].controller.level>=3 && Game.rooms[claimRoomName].find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_SPAWN}).length>0){
                 //   Game.notify(claimRoomName+" reached level 3, now it's on it's own")
                    console.log(claimRoomName+" reached level 3, now it's on it's own")
                    delete(Game.spawns[spawnName].memory.claim[claimRoomName])
                }
                //console.log(spawnName+" "+claimRoomName+" "+Game.spawns[spawnName].memory.claim[claimRoomName])
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
    if (((Game.time) % 1500) === 0) {
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
            if (Game.rooms[roomName].find(FIND_MY_STRUCTURES,{filter:(s) => s.structureType==STRUCTURE_STORAGE}).length>0){
                if (lib.checkCreepInQueue(roomName,"energyHauler",{"cost":1200,"noWork":true})==0){
                    createCreep.run(roomName,"energyHauler",{"cost":1200,"noWork":true});
                    Game.notify("<font color=green>Spawning additional energyHauler for room "+roomName+"</font>")
                    console.log("<font color=green>Spawning additional energyHauler for room "+roomName+"</font>")
                }
                else {
                    console.log("<font color=red>Wanted to spawn additional energyHauler for room "+roomName+" but it is already in queue</font>")
                }

            }
            else {
                Game.notify("<font color=green>Spawning additional upgrader for room "+roomName+"</font>")
                console.log("<font color=green>Spawning additional upgrader for room "+roomName+"</font>")
                createCreep.run(roomName,"upgrader",{"cost":1200});
                createCreep.run(roomName,"upgrader",{"cost":1200});
            }

        }
        //console.log("Checking for full storage");
        fullStorage=Game.rooms[roomName].find(FIND_STRUCTURES,{filter:(s) => s.structureType==STRUCTURE_STORAGE && s.store.energy>STORAGE_ENERGY_TRESHOLD})
        if (fullStorage.length>0){
            if (lib.checkCreepInQueue(roomName,"upgrader",{"cost":1700,"super":true,"priority":39})==0){
                Game.notify("<font color=green>Spawning additional super upgrader for room "+roomName+"</font>")
                console.log("<font color=green>Spawning additional super upgrader for room "+roomName+"</font>")
                createCreep.run(roomName,"upgrader",{"cost":1900,"super":true,"priority":39});
                createCreep.run(roomName,"upgrader",{"cost":1900,"super":true,"priority":39});
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
        if (Game.spawns[spawnName].memory.creepQueue.length>=50){
            Game.notify("Had to reset creepqueue for "+spawnName);
            lib.resetCreepQueue(spawnName)
        }
    }
    Game.notify(temp);
}

    
    temp=_.sortBy(Game.creeps,[(cr1,cr2)=>cr1.rolePriority()-cr2.rolePriority()])
    for (let name in temp) {
    //    for(let name in Game.creeps) {
        
        //console.log()
        let creep = temp[name];

        //let creep=name;
        try {
            if (creep.spawning){
                continue;
            }
            
            if (creep.memory.role!="warbot" && creep.memory.role!="rangedDefender" && creep.memory.role!="rangedbot" && creep.flee()){
                creep.say("Flee!")
                continue;
            }
            if(creep.memory.role == 'harvester') {
                roleHarvester.run(creep);
            }
            else if(creep.memory.role == 'repair' || (creep.memory.role == 'builder' && creep.memory.subrole=="repair")) {
                roleRepair.run(creep);
            }
            else if(creep.memory.role == 'wallRepair') {
                roleWallRepair.run(creep);
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
            Game.notify("Error in creep "+temp[name].name);
            console.log("<font color=red>Error in creep "+temp[name].name+"</color>");
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
    var room;
    var creep;
	myRoomsArr=_.filter(Game.rooms,r=>r.controller.my)
    for (i in myRoomsArr){
		room=myRoomsArr[i]
        notification[notification.length-1]+="\nRoom "+room.name;
        notification[notification.length-1]+="\nMax Energy "+room.energyCapacityAvailable;


        let controllerDelta=room.controller.progress-_.get(room,"memory.progress.controller",0);
		let currentEnergy=room.getStoredEnergy()
		let storageDelta=currentEnergy-_.get(room,"memory.progress.energy",0);
		
        notification[notification.length-1]+="\nController progress "+room.controller.progress+" delta "+controllerDelta;
        notification[notification.length-1]+="\nStorage "+currentEnergy+" delta "+storageDelta;
		
        _.set(room,"memory.progress.controller",room.controller.progress);
		_.set(room,"memory.progress.energy",currentEnergy);
		
        notification.push("")
    }

    /*let creepArray=createCreepArray()
    
    for (let room in creepArray){
        if (lib.findSpawn(room) && lib.findSpawn(room)[1]=="spawnRoom"){
			notification.push("\n"+room);
			for (let role in creepArray[room]){
				notification[notification.length-1]+="\n"+role+" "+creepArray[room][role];
			}
		}
    }
	*/

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
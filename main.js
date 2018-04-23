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
var Base=require('prototype.base')

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
    Game.showCreep=lib.showCreep
    Game.showCreep=function(creepName){
        let creep=Game.creeps[creepName]
        console.log(creep.name+" - "+JSON.stringify(_.transform(creep.body,function(result,value){result[value.type]=_.get(result,value.type,0)+1},{})))
    }
    
    

    
    
    for (creep of _.filter(Game.creeps,c=>(c.memory.role=="warbot" || c.memory.role=="healbot") && (c.room.name=="E9S14" ||  c.room.name=="E9S13")  )){
        creep.memory.claim="E8S14"
    }
    /*
    for (creep of _.filter(Game.creeps,c=>(c.memory.role=="warbot" || c.memory.role=="healbot") && c.room.name=="E7S16"   )){
        creep.memory.claim="E7S15"
    }
    
    for (creep of _.filter(Game.creeps,c=>(c.memory.role=="warbot" || c.memory.role=="healbot") && c.room.name=="E7S15"   )){
        creep.memory.claim="E8S15"
    }
    */
    
    
    //for (let creepN in Game.creeps){
    //    creep=Game.creeps[creepN]
    //    creep.memory.baseName=Game.spawns[creep.memory.spawnedBy].room.name;
   // }
    
    global.director={}
    for (let room of _.filter(Game.rooms, r=>_.get(r,"controller.my",false))){
        _.set(director,"bases."+room.name,new Base(director,room.name))
    }
	
	if (Game.time%10==0){
		for (base of _.values(director.bases)){
			if (base.totalEnergy<15000 && base.terminal) {
				console.log(base.name +"needs help")
				//console.log(TERMINAL_MIN_ENERGY_TO_USE_IT)
				var terminalsArr=_.filter(Game.structures, s=>s.structureType==STRUCTURE_TERMINAL && s.store.energy>20000).sort((t1,t2)=>Game.market.calcTransactionCost(1,t1.room.name,base.name)-Game.market.calcTransactionCost(1,t2.room.name,base.name))
				
				if (terminalsArr.length>0 && terminalsArr[0].cooldown==0){
					Game.notify("Send energy from "+terminalsArr[0].room.name+" to "+base.name+ "lost "+Game.market.calcTransactionCost(10000,terminalsArr[0].room.name,base.name))
					console.log("Send energy from "+terminalsArr[0].room.name+" to "+base.name+ "lost "+Game.market.calcTransactionCost(10000,terminalsArr[0].room.name,base.name))
					terminalsArr[0].send(RESOURCE_ENERGY,5000,base.name)
					
				}
				else {
				    console.log("Noone can help it now")
				}
			}
		}
	}
    //console.log(JSON.stringify(world))
    
/*    
if (Game.time%300==0){

		flags=Game.rooms["E9S16"].find(FIND_FLAGS,{filter: (flag)=> flag.color==COLOR_RED}); 
		var destroyTargets=[];
		for (flagId in flags){
			let foundTargets=flags[flagId].pos.lookFor(LOOK_STRUCTURES);
			if (foundTargets.length>0) {
				destroyTargets=destroyTargets.concat(foundTargets);
			}
		}

	if (destroyTargets.length>0 && _.filter(Game.creeps,c=>c.memory.role=="warbot" && c.memory.claim=="E9S16").length<2){
		Game.createCreep("E8S18","warbot",{priority:100,cost:3320,memory:{claim:"E9S16"}})
		Game.notify("Spawed wrekbot "+destroyTargets[0].hits+" left to wreck")
		console.log("<font color=red>Spawed wrekbot "+destroyTargets[0].hits+" left to wreck</font>")
	}
}
  */
  
  
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
		var bestPriceDict={}

		bestPriceDict[RESOURCE_ENERGY]=0.03
		//bestPriceDict["O"]=0.160
        for (id in terminalsArr){
			terminal=terminalsArr[id]
			for (resourceType in terminal.store) {
				if (terminal.store[resourceType]>TERMINAL_MIN_RESOURCE && terminal.store[RESOURCE_ENERGY]>TERMINAL_MIN_ENERGY_TO_USE_IT){
					bestPrice=_.get(bestPriceDict,resourceType,DEFAULT_BEST_PRICE)
					if (resourceType==RESOURCE_ENERGY) {
						var bestOrderA=Game.market.getAllOrders(order => order.resourceType == resourceType && order.type == ORDER_BUY && order.amount>500).
							sort((o1,o2)=>1000*o2.price/(1000+Game.market.calcTransactionCost(1000, terminal.room.name, o2.roomName))-1000*o1.price/(1000+Game.market.calcTransactionCost(1000, terminal.room.name, o1.roomName)))
						//
						}
					else {
						var bestOrderA=Game.market.getAllOrders(order => order.resourceType == resourceType && order.type == ORDER_BUY && order.amount>500).
							sort((o1,o2)=>(o2.price-Game.market.calcTransactionCost(1, terminal.room.name, o2.roomName)*bestPriceDict[RESOURCE_ENERGY])-(o1.price-Game.market.calcTransactionCost(1, terminal.room.name, o1.roomName)*bestPriceDict[RESOURCE_ENERGY]))
						
					}
					if (bestOrderA.length>0){
						var bestOrder=bestOrderA[0]
						if (resourceType==RESOURCE_ENERGY){
							var realPrice=1000*bestOrder.price/(1000+Game.market.calcTransactionCost(1000, terminal.room.name, bestOrder.roomName))
						}
						else{
							var realPrice=bestOrder.price-Game.market.calcTransactionCost(1, terminal.room.name, bestOrder.roomName)*bestPriceDict[RESOURCE_ENERGY]
						}
						if ((realPrice>bestPrice ||  _.sum(terminal.store)>TERMINAL_MAX_STORE) && (resourceType==RESOURCE_ENERGY || realPrice>MINIMAL_MINERAL_PRICE)) {
							let amount=Math.min(10000,bestOrder["amount"])
							result="test"
						   // result=Game.market.deal(bestOrder.id,amount,terminal.room.name)
							
							Game.notify("Deal "+resourceType+" "+bestOrder.price+" "+amount+" room "+terminal.room.name+" energy loss "+Game.market.calcTransactionCost(1000, terminal.room.name, bestOrder.roomName )+" real price "+realPrice+" result "+result)
							console.log("Deal "+resourceType+" "+bestOrder.price+" "+amount+" room "+terminal.room.name+" energy loss "+Game.market.calcTransactionCost(1000, terminal.room.name, bestOrder.roomName )+" real price "+realPrice+" result "+result)
							console.log(_.sum(terminal.store))

						}
					}
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

    temp=_.sortBy(Game.creeps,[(cr1,cr2)=>cr1.rolePriority()-cr2.rolePriority()])
    
    
    for (let name in temp) {
        let creep = temp[name];
        _.set(creep,"incomingHeal",10)
    }

for (let rName in Game.rooms){

    functionDefendRoom.run(rName);
    
    


}





    if (Game.time%3===0) {
        // AntiInvader
        for (let rName in Game.rooms){
            let spawnName=lib.findSpawn(rName)[0]
            if(spawnName && Game.rooms[rName].hasHostiles() ) {
                if (Game.time-_.get(Memory.rooms,[rName]+".spawnedDefenderTime",0)>1300) {
                    
                    hostiles=Game.rooms[rName].find(FIND_HOSTILE_CREEPS)
                    
                    createCreep.run(rName,"warbot",{"cost":1500,"priority":80});
                    
                    Game.notify("Call warbot to battle in room "+rName+" w "+hostiles.length+" enemies at "+Game.time);
                    console.log("<font color=red>Call warbot to battle in room "+rName+" w "+hostiles.length+" enemies</font>");
                    Memory.rooms[rName]["spawnedDefenderTime"]=Game.time;
                    
                    if (hostiles.length>=3){
                        createCreep.run(rName,"warbot",{"cost":1500,"priority":80});
                        Game.notify("Called second warbot to in room "+rName);
                    }
                    
                }
            }
        }
        
        // Process expandRooms
        for (let spawnName in Game.spawns){
            for (let claimRoomName in Game.spawns[spawnName].memory.claim){
                if (Game.spawns[spawnName].memory.claim[claimRoomName]=="expandRoom" && Game.rooms[claimRoomName] && Game.rooms[claimRoomName].controller.level>=3 && Game.rooms[claimRoomName].find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_SPAWN}).length>0){
                    Game.notify(claimRoomName+" reached level 3, now it's on it's own")
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
        if (fullStorage.length>0 && Game.rooms[roomName].controller.level<8){
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
        //console.log(notificationArray[line]);
        Game.notify(notificationArray[line]);
    }
    
    var temp="Queue\n"
    for (let spawnName in Game.spawns) {
        if (Game.spawns[spawnName].memory.creepQueue.length>0){
            temp+=Game.spawns[spawnName].room.name+": "+Game.spawns[spawnName].memory.creepQueue.length+" creeps\n";
        }
        if (Game.spawns[spawnName].memory.creepQueue.length>=30){
            Game.notify("Had to reset creepqueue for "+spawnName);
            lib.resetCreepQueue(spawnName)
        }
    }
    Game.notify(temp);
}

    
    temp=_.sortBy(Game.creeps,[(cr1,cr2)=>cr1.rolePriority()-cr2.rolePriority()])
    
    
    for (let name in temp) {
        let creep = temp[name];
        _.set(creep,"incomingHeal",10)
    }
    
    for (let name in temp) {
    //    for(let name in Game.creeps) {
        
        //console.log()
        let creep = temp[name];

        //let creep=name;
        //try {
            if (creep.spawning){
                continue;
            }
            
            if (creep.memory.role!="warbot" && creep.memory.role!="rangedDefender" && creep.memory.role!="rangedbot" &&  creep.memory.role!="healbot" && creep.flee()){
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
    var notification=["CPU: "+Game.cpu.bucket+" Credits: "+Math.floor(Game.market.credits/1000)+"k"]; 
    let delta=Math.floor(Game.gcl.progress)-_.get(Memory,"global.progress.gcl",0);
    notification.push("GCL "+Game.gcl.level+" progress: "+Math.floor(Game.gcl.progress/Game.gcl.progressTotal*10000)/100+"% delta "+
    Math.floor(delta/1000)+"K");
        
    _.set(Memory,"global.progress.gcl",Math.floor(Game.gcl.progress));
    
    notification.push("");
    var room;
    var creep;
	myRoomsArr=_.filter(Game.rooms,r=>r.controller && r.controller.my)
    for (i in myRoomsArr){
		room=myRoomsArr[i]
        notification[notification.length-1]+="\nRoom "+room.name+" CL "+room.controller.level;
        notification[notification.length-1]+="\nMax Energy "+room.energyCapacityAvailable;
        ramparts=room.find(FIND_STRUCTURES,{filter:s=> s.structureType==STRUCTURE_WALL || s.structureType==STRUCTURE_RAMPART}).sort((s1,s2)=>s1.hits-s2.hits)
        
        
        
        if (ramparts.length>0){
            rampartsMed=Math.floor(_.sum(ramparts,s=>s.hits)/(ramparts.length*1000))
            let delta=rampartsMed-_.get(room,"memory.progress.ramparts",0);
            notification[notification.length-1]+="\nRamparts "+rampartsMed+ "K average, delta "+delta+"K";
            _.set(room,"memory.progress.ramparts",rampartsMed);
        }

        let controllerDelta=room.controller.progress-_.get(room,"memory.progress.controller",0);
		let currentEnergy=room.getStoredEnergy()
		let storageDelta=currentEnergy-_.get(room,"memory.progress.energy",0);
		
        if (room.controller.level<8){
            notification[notification.length-1]+="\nController progress "+Math.floor(room.controller.progress/room.controller.progressTotal*1000)/10+"% delta "+controllerDelta;
        }
        notification[notification.length-1]+="\nStorage "+currentEnergy+" delta "+storageDelta;
		
        _.set(room,"memory.progress.controller",room.controller.progress);
		_.set(room,"memory.progress.energy",currentEnergy);
		
        notification.push("")
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
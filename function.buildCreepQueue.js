var lib=require('function.libraries');
var createCreep=require('function.createCreep');

module.exports = {
    run(roomName){
        //console.log(bodyPartPriorityArray)
        var basicRoomLayout={"harvester":1,"upgrader":2,"builder":1,"miner":1};
        var noEnergySourceRoles=["claimer","builder","mineralHarvester","warbot","healbot","wallRepair","rangedDefender","upgrader"];
        var roomLayout=basicRoomLayout;
        var spawnName=lib.findSpawn(roomName)[0];
        var subroleDict={}
        
        
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
            subroleDict["level"]=Game.spawns[spawnName].room.controller.level;
            //console.log(JSON.stringify(subroleDict))
            if (!(creepArray[roomName])){
                creepArray[roomName]={}
            }
            for (let energySource in Game.rooms[roomName].find(FIND_SOURCES)){
                if (roomType=="spawnRoom"){
                    roomLayout=basicRoomLayout;
                    
                    if (Game.rooms[roomName].hasHostiles()){
                        temp=Game.rooms[roomName].find(FIND_HOSTILE_CREEPS,{filter:cr=> cr.owner.username!="Invader"})
                        if (temp.length>0) {
                            roomLayout["rangedDefender"]=3
                            roomLayout["wallRepair"]=1
                        }

                    }
                    if ((Game.rooms[roomName].controller.level==6 || Game.rooms[roomName].controller.level==7) && Game.rooms[roomName].base.terminal){
                        roomLayout["upgrader"]+=1;
                    }

                    if (Game.rooms[roomName].controller.level==8){
                        roomLayout={"harvester":1,"upgrader":1,"builder":1,"miner":1};
                        
                        //console.log(roomName)
                    }
					
					if (_.get(Game.rooms[roomName],"memory.status.starving")==true){
						roomLayout["upgrader"]-=1;
					}
                    

                    if (Game.rooms[roomName].find(FIND_MY_STRUCTURES,{filter: (s)=> s.structureType==STRUCTURE_EXTRACTOR}).length>0){
                        roomLayout["mineralHarvester"]=1
                    }
                    if (Game.rooms[roomName].find(FIND_SOURCES).length==1 && "harvester" in roomLayout){
                        roomLayout["harvester"]+=1;
                    }
                    
                    
                }
                else if  (roomType=="claimRoom") {
                    roomLayout={"miner":1,"energyHauler":2}
                    if (!(Game.rooms[roomName].controller.reservation) || Game.rooms[roomName].controller.reservation.ticksToEnd<3000){
                        roomLayout["claimer"]=1;
                        if (energyForBuild<1300){
                            roomLayout["claimer"]+=1;
                        }


                    }
                }
                else if (roomType=="expandRoom"){
                    roomLayout={"builder":1,"upgrader":2,"harvester":1,"miner":1}
                    if (!(roomName in Game.rooms) || !(Game.rooms[roomName].controller.my)){
                        roomLayout["claimer"]=1;
                    }
                }
                //console.log("!")
                if (Game.spawns[spawnName].room.energyCapacityAvailable<800 && ("miner" in roomLayout)){
                    roomLayout["miner"]+=1;
                }
                
                // Emergency harvester creation
                if (roomType=="spawnRoom" && (_.filter(Game.creeps, (creep) => creep.memory.role=="harvester" && creep.memory.claim==roomName).length+
                    _.filter(Game.spawns[spawnName].memory.creepQueue,(creep)=> creep.memory.role=="harvester" && creep.memory.claim==roomName && creep.priority==100).length)<1){
                    createCreep.run(roomName,"harvester",{"cost":300,priority:100,memory:{"energy_source":energySource,"useStorage":true}});
                }    
                
                for (let role in roomLayout){
                    creepsFound=_.filter(Game.creeps, (creep) => (!creep.memory.energy_source || creep.memory.energy_source == energySource) && creep.memory.role==role && creep.memory.claim==roomName && !("replace" in creep.memory));
                    creepsInQueue=_.filter(Game.spawns[spawnName].memory.creepQueue,(creep)=> (!creep.memory.energy_source || creep.memory.energy_source == energySource) && creep.memory.role==role && creep.memory.claim==roomName);
                    for (let i=0;i<roomLayout[role]-creepsFound.length-creepsInQueue.length;i++){
                        var fast=false;
                        if (roomType=="claimRoom" || roomType=="expandRoom"){
                            fast=true;
                        }
                        if (noEnergySourceRoles.some(R => R==role)){
                            //console.log("No energySource " + role)
                            createCreep.run(roomName,role,_.merge({"fast":fast,memory:{}},subroleDict));
                        }
                        else{
                            //console.log("W energySource " + role)
                            createCreep.run(roomName,role,_.merge({"fast":fast,memory:{"energy_source":energySource}},subroleDict));
                        }

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
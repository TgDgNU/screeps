var lib=require('function.libraries');

module.exports = {
    run(roomName){
        var bodyLayout=[];
        var basicRoomLayout={"harvester":5,"upgrader":3,"builder":1}
        var basicBodyLayout=[MOVE,WORK,CARRY];
        var priority={"harvester":35,"upgrader":25,"builder":30,"miner":34,"energyHauler":32,"scout":20,"warbot":55,"claimer":33}
                

        
        roomLayout=basicRoomLayout;
        var spawnName=lib.findSpawn(roomName)[0];
        if (!Game.spawns[spawnName].memory.creepQueue){
            Game.spawns[spawnName].memory.creepQueue=[];
        }
        //var energyForBuild=Game.spawns[spawnName].room.energyCapacityAvailable
        var energyForBuild=1300;
        //no building for unclaimed rooms
        if (!spawnName) { return };
        var roomType=lib.findSpawn(roomName)[1];
        
        //Game.spawns[spawnName].memory.creepQueue=[];
        for (let i=1;i<Math.round(energyForBuild/250);i++) {basicBodyLayout=basicBodyLayout.concat([MOVE,WORK,CARRY])};


        bodyLayout["energyHauler"]=[CARRY,WORK,MOVE,MOVE];
        for (let i=1;i<=(Math.round(energyForBuild-250)/100);i++) {
            bodyLayout["energyHauler"]=bodyLayout["energyHauler"].concat([CARRY,MOVE]);
        }

        bodyLayout["miner"]=[MOVE,WORK,WORK]
        if (energyForBuild<650) {
            for (let i=1;i<=(Math.round(energyForBuild-250)/100);i++) {
                bodyLayout["miner"]=bodyLayout["miner"].concat([WORK]);
            }
            //console.log(bodyLayout["miner"])
        }
        else{
            bodyLayout["miner"]=[WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE]
        }
        
        bodyLayout["claimer"]=[MOVE,CLAIM]
        for (let i=1;i<=(Math.round(energyForBuild-650)/650);i++) {
            bodyLayout["claimer"]=bodyLayout["claimer"].concat([CLAIM,MOVE]);
        }
        
        
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
                    if (bodyLayout["claimer"].length<3){
                        roomLayout["claimer"]+=1;
                    }
                    bodyLayout["miner"]=[MOVE,WORK]
                    for (let i=1;i<(Math.round(energyForBuild-150)/150);i++) {
                        bodyLayout["miner"]=bodyLayout["miner"].concat([WORK,MOVE]);
                    }
                }
                
                if (energyForBuild>=350 && !("miner" in roomLayout)){
                    roomLayout["miner"]=1;
                }
                
                // Emergency harvester creation
                if (roomType=="spawnRoom" && (_.filter(Game.creeps, (creep) => creep.memory.energy_source == energySource && creep.memory.role=="harvester" && creep.memory.claim==roomName).length+
                    _.filter(Game.spawns[spawnName].memory.creepQueue,(creep)=> creep.role=="harvester" && creep.claim==roomName && creep.priority==100).length)<=0){
                    console.log("Creating emergency harvester!");
                    Game.spawns[spawnName].memory.creepQueue.unshift({body:[MOVE,CARRY,WORK],role:"harvester",priority:100,energy_source:energySource,claim:roomName})
                        
                }    
                
                for (let role in roomLayout){
                    if (!(bodyLayout[role])) {bodyLayout[role]=basicBodyLayout;}
                    creepsFound=_.filter(Game.creeps, (creep) => creep.memory.energy_source == energySource && creep.memory.role==role && creep.memory.claim==roomName);
                    creepsInQueue=_.filter(Game.spawns[spawnName].memory.creepQueue,(creep)=> creep.energy_source==energySource && creep.role==role && creep.claim==roomName);
                    //console.log("for role "+role+" source "+energySource+" creeps found "+creepsFound.length+" in queue "+creepsInQueue.length);
                    
                    for (let i=0;i<roomLayout[role]-creepsFound.length-creepsInQueue.length;i++){
                        if (!(priority[role])){
                            priority[role]=0;
                            console.log("No priority for role "+role)
                        }
                        Game.spawns[spawnName].memory.creepQueue.unshift({body:bodyLayout[role],role:role,priority:priority[role],energy_source:energySource,claim:roomName})
                        console.log("Add "+lib.showCreep(Game.spawns[spawnName].memory.creepQueue[0])+" for room "+roomName);
                    }
                }
            }
            
            //for (let i in Game.spawns[spawnName].memory.creepQueue){
            //    console.log(Game.spawns[spawnName].memory.creepQueue[i]);
            //}

            
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
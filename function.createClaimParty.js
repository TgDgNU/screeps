var createClaimParty = {
    run: function createClaimParty(spawnName,roomName,claimType) {
        
        if (claimType=="full"){
            var creepsToSpawn={"r_healbots":1,"r_warbots":2,"r_miners":1,"r_claimers":1,"r_energyHaulers":3,"r_builders":0}
        }
        else if (claimType=="no_claim"){
            var creepsToSpawn={"r_healbots":0,"r_warbots":0,"r_miners":1,"r_claimers":1,"r_energyHaulers":3,"r_builders":0}
        }
        else {
            var creepsToSpawn={};
        }

        
        r_builders=_.filter(Game.creeps, (creep) => creep.memory.claim == roomName && (creep.memory.role=="builder" ));
        r_energyHaulers=_.filter(Game.creeps, (creep) => creep.memory.claim == roomName && (creep.memory.role=="energyHauler" ));
        r_claimers=_.filter(Game.creeps, (creep) => creep.memory.claim == roomName && (creep.memory.role=="claimer" ));
        r_miners=_.filter(Game.creeps, (creep) => creep.memory.claim == roomName && (creep.memory.role=="miner" ));
        r_healbots=_.filter(Game.creeps, (creep) => creep.memory.claim == roomName && (creep.memory.role=="healbot" ));
        r_warbots=_.filter(Game.creeps, (creep) => creep.memory.claim == roomName && (creep.memory.role=="warbot" ));
        

         if (r_healbots.length<creepsToSpawn["r_healbots"]){
            //console.log("Healbot for "+roomName);
            Game.spawns[spawnName].spawnCreep(
                [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL],
                    "healbot"+Game.time,{ memory: { role: 'healbot',claim:roomName } } );
        }       
         if (r_warbots.length<creepsToSpawn["r_warbots"]){
            //console.log("Warbot for "+roomName);
            Game.spawns[spawnName].spawnCreep(
                [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH, TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE, ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE, MOVE],
                "warbot"+Game.time,{ memory: { role: 'warbot',claim:roomName } } );
        }   
         if (r_healbots.length<(creepsToSpawn["r_healbots"]-1)){
            //console.log("Healbot for "+roomName);
            Game.spawns[spawnName].spawnCreep(
                [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL],
                    "healbot"+Game.time,{ memory: { role: 'healbot',claim:roomName } } );
        }    
         if (r_warbots.length<creepsToSpawn["r_warbots"]-1){
            //console.log("Warbot for "+roomName);
            Game.spawns[spawnName].spawnCreep(
                [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH, TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE, ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE, MOVE],
                "warbot"+Game.time,{ memory: { role: 'warbot',claim:roomName } } );
        }  
        if (r_miners.length<creepsToSpawn["r_miners"]){
            //console.log("Rminer for "+roomName);
            if (claimType=="no_claim"){
                Game.spawns[spawnName].spawnCreep( [WORK,WORK,WORK, WORK,WORK,CARRY,MOVE,MOVE,MOVE, MOVE,MOVE,MOVE], 'RMiner'+Game.time,{ memory:{ role:'miner',energy_source:0,claim:roomName } } );
            }
            else {
                Game.spawns[spawnName].spawnCreep( [WORK,WORK,WORK, WORK,WORK,MOVE,MOVE, MOVE], 'RMiner'+Game.time,{ memory:{ role:'miner',energy_source:0,claim:roomName } } );
            }
        }
        else if (r_claimers.length<creepsToSpawn["r_claimers"]){
            Game.spawns[spawnName].spawnCreep( [CLAIM,CLAIM, MOVE,MOVE], 'Claimer'+Game.time, { memory: { role: 'claimer',claim: roomName} } );
            //console.log("Claimer for "+roomName);
        }
        else if (r_energyHaulers.length<creepsToSpawn["r_energyHaulers"]){
            if (claimType=="no_claim"){
                Game.spawns[spawnName].spawnCreep( [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], 'R_EnergyHauler'+Game.time,{ memory:{ role:'energyHauler',energy_source:0,claim:roomName,store_to: Game.spawns[spawnName].room.name} } );
            }
            else {
                //Game.spawns[spawnName].spawnCreep( [WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE, MOVE], 'R_EnergyHauler'+Game.time,{ memory:{ role:'energyHauler',energy_source:0,claim:roomName,store_to: Game.spawns[spawnName].room.name} } );
                Game.spawns[spawnName].spawnCreep( [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], 'R_EnergyHauler'+Game.time,{ memory:{ role:'energyHauler',energy_source:0,claim:roomName,store_to: Game.spawns[spawnName].room.name} } );
            }
            console.log("R_energyHauler for "+roomName);
        }
        else if (r_builders.length<creepsToSpawn["r_builders"] &&
                (Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES).length>0)){ 
            Game.spawns[spawnName].spawnCreep( [WORK,WORK,WORK, CARRY,CARRY,CARRY,MOVE,MOVE, MOVE], 'Rbuilder'+Game.time,{ memory:{ role:'builder',energy_source:0,claim:roomName } } );
            //console.log("Rbuilder for "+roomName);
        }
        
        //spawnCreep( [CLAIM, MOVE], 'Tester2', { memory: { role: 'claimer' } } );
        
        //var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);

    }
};

module.exports = createClaimParty;
var lib=require('function.libraries');


module.exports = {
    run(spawnName){
        var spawn=Game.spawns[spawnName];
        if (!Game.spawns[spawnName].memory.creepQueue){
            Game.spawns[spawnName].memory.creepQueue=[]
        }
        if (spawn.memory.creepQueue.length<=0){
            return
        }

        spawn.memory.creepQueue.sort( function priCompare(task1,task2) {return task2["priority"]-task1["priority"]});


        var creep=calculateCreepEnergyCost(spawn.memory.creepQueue[0]);
        if (!("memory" in creep)){
            creep["memory"]={};
        }


        while (creep["energy"]>Game.spawns[spawnName].room.energyCapacityAvailable) {
            Game.notify("Too expensive creep!\n"+lib.showCreep(creep));
            console.log("<font color=red>Too expensive creep!</font>\n"+lib.showCreep(creep))
            spawn.memory.creepQueue.shift()
            if (spawn.memory.creepQueue.length==0){
                return
            }
            creep=calculateCreepEnergyCost(spawn.memory.creepQueue[0]);
        }

        if (!("role" in creep["memory"])) {
            console.log("No creep role! Deleting");
            Game.notify("No creep role! Deleting!");
            Game.notify(lib.showCreep(creep));
            spawn.memory.creepQueue.pop();
            return;
        }
        
        creep.memory.spawnedBy=spawnName

        //if (!("name" in creep)) {creep["name"]=lib.createCreepName(creep);}
        creep["name"]=lib.createCreepName(creep);

        if (Game.spawns[spawnName].room.energyAvailable >= creep["energy"]) {
            result=spawn.spawnCreep(creep["body"],creep['name'],{"memory":
                    _.merge(creep["memory"],{subrole:creep["subrole"],"spawnTime":Game.time})});

            if (result!=0) {
                Game.notify("Could not spawn creep "+creep["name"]+" result "+result)
            }
            spawn.memory.creepQueue.shift();
            
            console.log(spawnName + " building "+creep["name"]+" "+spawn.memory.creepQueue.length+" left on queue");
            if (spawn.memory.creepQueue.length>0){
                otherSpawns=spawn.room.find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_SPAWN && s.id !=spawn.id && !s.spawning})
                for (let i in otherSpawns){
                    if (spawn.memory.creepQueue.length>0){
                        if (!"creepQueue" in otherSpawns[i].memory){
                            otherSpawns[i].memory.creepQueue=[]
                        }
                        otherSpawns[i].memory.creepQueue.push(spawn.memory.creepQueue.shift());
                    }
                }
            }
        }
    }

};


function calculateCreepEnergyCost(creep) {
    if (!("energy" in creep)) {
        creep["energy"]=0;
        for (let i in creep["body"]){
            let workpart = creep["body"][i];
            if (workpart in BODYPART_COST){
                creep["energy"]+=BODYPART_COST[workpart];
            }
            else {
                Game.notify("Unknown workpart in processCreepQueue"+workpart);
                console.log("Unknown workpart in processCreepQueue"+workpart);
                return (null);
            }
        }
    }
    return (creep)
}

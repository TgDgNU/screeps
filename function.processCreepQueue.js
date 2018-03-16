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
        //for (let item in spawn.memory.creepQueue){
        //    spawn.memory.creepQueue[item]["priority"]+=0.1;
        //}

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

        if (!("energy_source" in creep["memory"])) {creep["memory"]["energy_source"]=0;}
        if (!("name" in creep)) {creep["name"]=createName(creep);}


        if (Game.spawns[spawnName].room.energyAvailable >= creep["energy"]) {
            result=spawn.spawnCreep(creep["body"],creep['name'],{"memory":
                    _.merge(creep["memory"],{subrole:creep["subrole"],spawnedBy:spawnName,energy_source:creep["energy_source"]})});
            console.log(spawnName + " building "+creep["name"]);

            if (result!=0) {
                Game.notify("Could not spawn creep "+creep["name"]+" result "+result)
            }
            spawn.memory.creepQueue.shift();
            if (spawn.memory.creepQueue.length>0) {
                console.log("Left "+spawn.memory.creepQueue.length+" creeps on queue for spawn "+spawnName)
                //for (let id in spawn.memory.creepQueue){
                //    console.log(lib.showCreep(spawn.memory.creepQueue[id],"supercompact"));
                //}
                
            }


        }
    }

};

function createName(creep) {
    var subrole=""
    if ("subrole" in creep["memory"]){
        subrole=creep["memory"]["subrole"]+"-";
    }
    return (creep["memory"]["role"]+"-"+subrole+creep["memory"]["claim"]+"-"+Game.time);
}

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

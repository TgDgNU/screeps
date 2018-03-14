var lib=require('function.libraries');


module.exports = {
    run(spawnName){

        //console.log("Processing queue "+spawnName);

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
            if (spawn.memory.creepQueue[0].length==0){
                return
            }
            creep=calculateCreepEnergyCost(spawn.memory.creepQueue[0]);
        }

        if ("role" in creep){
            creep["memory"]["role"]=creep["role"]
        }
        if ("claim" in creep){
            creep["memory"]["claim"]=creep["claim"]
        }

        if (!("role" in creep["memory"])) {
            console.log("No creep role! Deleting");
            Game.notify("No creep role! Deleting!");
            Game.notify(lib.showCreep(creep));
            spawn.memory.creepQueue.pop();
            return;
        }

        if (!("subrole" in creep)) {creep["subrole"]="";}
        if (!("claim" in creep["memory"])) {creep["memory"]["claim"]=spawn.room.name;}
        if (!("energy_source" in creep)) {creep["energy_source"]=0;}
        if (!("name" in creep)) {creep["name"]=createName(creep);}


        if (Game.spawns[spawnName].room.energyAvailable >= creep["energy"]) {
            
            console.log("Building\n"+lib.showCreep(creep,"compact"));

            result=spawn.spawnCreep(creep["body"],creep['name'],{"memory":
                    _.merge(creep["memory"],{subrole:creep["subrole"],spawnedBy:spawnName,energy_source:creep["energy_source"]})});

            if (creep["store_to"]){
                Game.creeps[creep['name']].memory['store_to']=creep['store_to'];
            }
            else if (creep['role']=='energyHauler') {
                Game.creeps[creep['name']].memory['store_to']=spawn.room.name;
            }

            console.log(spawnName+" spawning "+creep["name"]);
            if (result!=0) {
                Game.notify("Could not spawn creep "+creep["name"]+" result "+result)
            }
            spawn.memory.creepQueue.shift();
            if (spawn.memory.creepQueue.length>0) {
                console.log("Left on queue: ")
                for (let id in spawn.memory.creepQueue){
                    console.log(lib.showCreep(spawn.memory.creepQueue[id],"supercompact"));
                }
                
            }


        }
    }

};

//Game.spawns.Spawn1.memory.creepQueue.push({name:"test",body:[CLAIM,MOVE,MOVE],role:'claimer',subrole:'claimer',spawnedBy:"Spawn1",claim:"E2S19",energy:700});
function createName(creep) {
    //return("test");
    return (creep["role"]+"-"+creep["subrole"]+"-"+creep["claim"]+"-"+Game.time);
}
/*
function showCreep(creep,displayStyle) {
    var result="";
    if (typeof displayStyle === 'undefined') {
        var delimeter = "\n"
    }
    else if (displayStyle=="compact" || displayStyle=="supercompact") {
        var delimeter = " : "
    }
    for (i in creep){
        if (i!="body" || displayStyle!="supercompact"){
            result+=i+" "+creep[i]+delimeter
        }
    }
    return (result);
}
*/
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

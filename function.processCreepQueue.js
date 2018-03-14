/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('function.processCreepQueue');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run(spawnName){

        //console.log("Processing queue "+spawnName);

        var spawn=Game.spawns[spawnName];
        if (!Game.spawns[spawnName].memory.creepQueue){Game.spawns[spawnName].memory.creepQueue=[]};

        spawn.memory.creepQueue.sort( function priCompare(task1,task2) {return task2["priority"]-task1["priority"]});



        if (spawn.memory.creepQueue.length<=0){
            return;
        }


        var creep=calculateCreepEnergyCost(spawn.memory.creepQueue[0]);
        
        while (creep["energy"]>Game.spawns[spawnName].room.energyCapacityAvailable) {
            Game.notify("Too expensive creep!\n"+showCreep(creep));
            console.log("<font color=red>Too expensive creep!</font>\n"+showCreep(creep))
            spawn.memory.creepQueue.shift()
            creep=calculateCreepEnergyCost(spawn.memory.creepQueue[0]);
            if (spawn.memory.creepQueue[0].length>0){
                
            }
        }


        if (!("role" in creep)) {
            console.log("No creep role! Deleting");
            Game.notify("No creep role! Deleting!");
            spawn.memory.creepQueue.pop();
            return;
        }

        if (!("subrole" in creep)) {creep["subrole"]="";}
        if (!("claim" in creep)) {creep["claim"]=spawn.room.name;}
        if (!("energy_source" in creep)) {creep["energy_source"]=0;}
        if (!("name" in creep)) {creep["name"]=createName(creep);}


        //return;

        if (Game.spawns[spawnName].room.energyAvailable >= spawn.memory.creepQueue[0]["energy"]) {
            
            console.log("Building\n"+showCreep(creep));
            //console.log("Energy ok "+createName(creep));

            result=spawn.spawnCreep(creep["body"],creep['name'],
                {memory:{role:creep["role"],subrole:creep["subrole"],claim:creep["claim"],spawnedBy:spawnName,energy_source:creep["energy_source"]}});

            if (creep["store_to"]){
                Game.creeps[creep['name']].memory['store_to']=creep['store_to'];
            }
            else if (creep['role']=='energyHauler') {
                Game.creeps[creep['name']].memory['store_to']=spawn.room.name;
            }

            console.log(spawnName+" spawning "+creep["name"]);
            console.log("Result: "+result);
            spawn.memory.creepQueue.shift();
            if (spawn.memory.creepQueue.length>0) {
                console.log("Left on queue: ")
                for (let id in spawn.memory.creepQueue){
                    console.log(showCreep(spawn.memory.creepQueue[id],"compact"));
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

function showCreep(creep,displayStyle) {
    var result="";
    if (typeof displayStyle === 'undefined') {
        var delimeter = "\n"
    }
    else if (displayStyle="compact") {
        var delimeter = " : "
    }
    for (i in creep){
        result+=i+" "+creep[i]+delimeter

    }
    return (result);
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

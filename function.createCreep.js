var lib=require('function.libraries');
require('common.requests');

module.exports = {

    run : function(roomName,role,subroleDict) {


        [spawnName,roomType]=lib.findSpawn(roomName);
        if (!spawnName) { return }
        if (!Game.spawns[spawnName].memory.creepQueue){
            Game.spawns[spawnName].memory.creepQueue=[];
        }

        if (!subroleDict){
            subroleDict={}
        }

        var energyForBuild=Game.spawns[spawnName].room.energyCapacityAvailable;
        var optimalEnergyForBuild= (Game.spawns[spawnName].memory.creepQueue.length>10 && 1000) || 1300;

        if (role=="miner") {
            // 7xWork for fast Miner (1150 energy), 800 for slow
            if ("fast" in subroleDict && subroleDict["fast"]){
                optimalEnergyForBuild=1000
            }
            else{
                optimalEnergyForBuild=800
            }
        }
        if (role=="claimer") {
            optimalEnergyForBuild=1300
        }
        if ("super" in subroleDict && subroleDict["super"]){
            optimalEnergyForBuild=10000;
        }
        if ("cost" in subroleDict){
            optimalEnergyForBuild=subroleDict["cost"]
            delete(subroleDict["cost"]);
        }
        optimalEnergyForBuild=Math.min(optimalEnergyForBuild,energyForBuild);
        
        var priorityDict={"harvester":40,"upgrader":25,"builder":26,"miner":45,"energyHauler":32,"scout":10,"warbot":55,"claimer":34,"mineralHarvester":27};
        var memory={}

        var priority=priorityDict[role] || 0;
        if (roomType=="spawnRoom"){
            priority+=5;
        }

        var partsArray={"basic":{"base":[CARRY,WORK,MOVE],"add":[CARRY,WORK,MOVE]}};
        partsArray["energyHauler"]={"base":[CARRY,WORK,MOVE,MOVE],"add":[CARRY,MOVE]};
        if ("noWork" in subroleDict && subroleDict["noWork"]){
            partsArray["energyHauler"]={"base":[CARRY,MOVE],"add":[CARRY,MOVE]};
        }
        
        
        partsArray["miner"]={"base":[WORK,WORK,MOVE,CARRY],"add":[WORK,WORK,MOVE]};
        
        partsArray["harvester"]={"base":[CARRY,WORK,MOVE],"add":[CARRY,WORK,MOVE]};
        if (optimalEnergyForBuild>=500) {
            partsArray["harvester"]={"base":[WORK,CARRY,MOVE],"add":[CARRY,CARRY,MOVE]};
           }
        if ("fast" in subroleDict && subroleDict["fast"]){
            partsArray["harvester"]={"base":[WORK,MOVE,CARRY,MOVE],"add":[WORK,CARRY,MOVE,MOVE]};
        }
        
        partsArray["mineralHarvester"]={"base":[CARRY,CARRY,MOVE],"add":[WORK,WORK,MOVE]};

        partsArray["warbot"]={"base":[ATTACK,MOVE],"add":[ATTACK,MOVE]};
        partsArray["claimer"]={"base":[CLAIM,MOVE],"add":[CLAIM,MOVE]};
        
        partsArray["upgrader"]={"base":[CARRY,WORK,MOVE],"add":[CARRY,WORK,MOVE]};
        if (optimalEnergyForBuild>=500) {
            partsArray["upgrader"]={"base":[CARRY,CARRY,MOVE],"add":[WORK,WORK,MOVE]};
        }
        if ("super" in subroleDict && subroleDict["super"]){
            partsArray["upgrader"]={"base":[WORK,WORK,CARRY,MOVE],"add":[WORK,WORK,WORK,WORK,MOVE]};
            if (optimalEnergyForBuild>=350) {
                partsArray["upgrader"]["base"]=[WORK,WORK,CARRY,CARRY,MOVE]
            }
        }
        
        // fast roles
        if ("fast" in subroleDict && subroleDict["fast"]){
            partsArray["miner"]={"base":[WORK,MOVE,CARRY],"add":[WORK,MOVE]};
            partsArray["harvester"]={"base":[WORK,MOVE,CARRY,MOVE],"add":[WORK,CARRY,MOVE,MOVE]};
        }

        if (role in partsArray){
            var bodyLayout=partsArray[role]["base"];
            var add=partsArray[role]["add"]
        }
        else{
            var bodyLayout=partsArray["basic"]["base"];
            var add=partsArray["basic"]["add"]
        }



        memory["claim"]=roomName;
        memory["role"]=role;
        if (role=="energyHauler") {
            memory["store_to"]=Game.spawns[spawnName].room.name;
        }




        var baseCost=_.sum(_.map(bodyLayout,id => BODYPART_COST[id]));
        var addCost=_.sum(_.map(add,id => BODYPART_COST[id]));
        var fullcost=baseCost;

        for (let i = 1; i <= (Math.round(Math.min(energyForBuild, optimalEnergyForBuild) - baseCost) / addCost); i++) {
            bodyLayout = bodyLayout.concat(add);
            fullcost+=addCost;
        }
        bodyLayout.sort((p1,p2)=> bodyPartPriorityArray.indexOf(p1)-bodyPartPriorityArray.indexOf(p2))
        temp=_.merge({"purpose":memory["role"]+"-"+memory["claim"],"body":bodyLayout,"priority":priority,"energy":fullcost,"memory":memory},subroleDict)

        if (!("test" in temp)) {
            Game.spawns[spawnName].memory.creepQueue.unshift(temp);
        }

        console.log("Added to "+spawnName+" Q ["+Game.spawns[spawnName].memory.creepQueue.length+"] "+ lib.showCreep(temp))


        //return(_.merge({:,"role":role,"priority":priority[role]},subroleArray))

    }


};
var lib=require('function.libraries');


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
        if (!("memory" in subroleDict)){
            subroleDict["memory"]={}
        }

        var energyForBuild=Game.spawns[spawnName].room.energyCapacityAvailable;
        var optimalEnergyForBuild= (Game.spawns[spawnName].memory.creepQueue.length>10 && 1000) || 1600;

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
            //console.log(JSON.stringify(subroleDict))
            subroleDict["memory"]["useStorage"]=true;
        }
        if ("cost" in subroleDict){
            optimalEnergyForBuild=subroleDict["cost"]
            delete(subroleDict["cost"]);
        }
        optimalEnergyForBuild=Math.min(optimalEnergyForBuild,energyForBuild);
        
        var priorityDict={"rangedDefender":39,"wallRepair":38,"harvester":40,"upgrader":25,"builder":26,"miner":45,"energyHauler":34,"scout":10,"warbot":55,"healbot":54,"claimer":33,"mineralHarvester":27};
        var memory={}

        var priority=priorityDict[role] || 0;
        if (roomType=="spawnRoom" || roomType=="expandRoom" ){
            priority+=5;
        }

        var partsArray={"basic":{"base":[CARRY,WORK,MOVE],"add":[CARRY,WORK,MOVE]}};
        partsArray["energyHauler"]={"base":[CARRY,WORK,MOVE,MOVE],"add":[CARRY,MOVE]};
        if ("noWork" in subroleDict && subroleDict["noWork"]){
            partsArray["energyHauler"]={"base":[CARRY,MOVE],"add":[CARRY,MOVE]};
        }
        
        // miner
        partsArray["miner"]={"base":[WORK,WORK,MOVE,CARRY],"add":[WORK,WORK,MOVE]};
        
        // harvester
        partsArray["harvester"]={"base":[WORK,CARRY,MOVE,CARRY,MOVE],"add":[WORK,CARRY,MOVE]};
        if (optimalEnergyForBuild>=500) {
            partsArray["harvester"]={"base":[WORK,CARRY,MOVE],"add":[CARRY,CARRY,MOVE]};
           }
        if ("fast" in subroleDict && subroleDict["fast"]){
            partsArray["harvester"]={"base":[WORK,MOVE,CARRY,MOVE],"add":[WORK,CARRY,MOVE,MOVE]};
        }
        
        //builder
        if (optimalEnergyForBuild<500) {
            partsArray["builder"]={"base":[WORK,CARRY,MOVE,CARRY,MOVE],"add":[WORK,CARRY,MOVE]};
           }
        partsArray["builder"]={"base":[CARRY,WORK,MOVE],"add":[CARRY,WORK,MOVE,CARRY,CARRY,MOVE]};
        if (optimalEnergyForBuild>=600) {
            partsArray["builder"]={"base":[WORK,CARRY,MOVE],"add":[CARRY,WORK,MOVE,CARRY,CARRY,MOVE]};
           }
        //if ("fast" in subroleDict && subroleDict["fast"]){
        //    partsArray["harvester"]={"base":[WORK,MOVE,CARRY,MOVE],"add":[WORK,CARRY,MOVE,MOVE]};
        //}
        
        partsArray["mineralHarvester"]={"base":[CARRY,CARRY,MOVE],"add":[WORK,WORK,MOVE]};
        partsArray["rangedDefender"]={"base":[RANGED_ATTACK,RANGED_ATTACK,MOVE],"add":[RANGED_ATTACK,RANGED_ATTACK,MOVE]};
        partsArray["wallRepair"]={"base":[WORK,CARRY,MOVE],"add":[WORK,WORK,WORK,CARRY,MOVE,MOVE]};

        partsArray["warbot"]={"base":[RANGED_ATTACK,MOVE],"add":[ATTACK,MOVE]};
        partsArray["healbot"]={"base":[HEAL,MOVE],"add":[HEAL,MOVE]};
        
        partsArray["claimer"]={"base":[CLAIM,MOVE],"add":[CLAIM,MOVE]};
        
        // upgrader
        partsArray["upgrader"]={"base":[CARRY,WORK,MOVE],"add":[CARRY,WORK,MOVE]};
        if (optimalEnergyForBuild>=1000) {
            partsArray["upgrader"]={"base":[CARRY,WORK,WORK,MOVE],"add":[WORK,WORK,MOVE,CARRY,WORK,MOVE]};
        }

        if (role=="upgrader" && _.get(subroleDict,"level",0)==8){
            //console.log("level 8 upgrader creating")
            partsArray["upgrader"]={"base":[WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE],"add":[WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE]};
			optimalEnergyForBuild=2100
        }
        
        if (roomType=="expandRoom"){
            partsArray["upgrader"]={"base":[CARRY,WORK,MOVE,MOVE],"add":[CARRY,WORK,MOVE,MOVE]};
        }
    //if (Game.spawns[spawnName].room.controller.level==8 && role=="upgrader"){
    //        partsArray["upgrader"]={"base":[CARRY,CARRY,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE],"add":[CARRY,WORK,MOVE]};
     //       optimalEnergyForBuild=1800
    //    }
        
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
        memory["tasks"]=[]
        if (role=="energyHauler") {
            memory["store_to"]=Game.spawns[spawnName].room.name;
        }
        memory["baseRoom"]=Game.spawns[spawnName].room.name




        var baseCost=_.sum(_.map(bodyLayout,id => BODYPART_COST[id]));
        var addCost=_.sum(_.map(add,id => BODYPART_COST[id]));
        var fullcost=baseCost;

        for (let i = 1; i <= (Math.round(Math.min(energyForBuild, optimalEnergyForBuild) - baseCost) / addCost) && ((bodyLayout.length+add.length)<=50); i++) {
            bodyLayout = bodyLayout.concat(add);
            fullcost+=addCost;
            //if (memory["role"]=="warbot"){
            //console.log(bodyLayout.length+add.length)
            //}
        }
        bodyLayout.sort((p1,p2)=> bodyPartPriorityArray.indexOf(p1)-bodyPartPriorityArray.indexOf(p2))
        temp=_.merge({"purpose":memory["role"]+"-"+memory["claim"],"body":bodyLayout,"priority":priority,"energy":fullcost,"memory":memory},subroleDict)
        //console.log(JSON.stringify(temp));
        if (!("test" in temp)) {
            Game.spawns[spawnName].memory.creepQueue.unshift(temp);
        }

        //console.log("Added to "+spawnName+" Q ["+Game.spawns[spawnName].memory.creepQueue.length+"] "+ lib.showCreep(temp))


        //return(_.merge({:,"role":role,"priority":priority[role]},subroleArray))

    }


};
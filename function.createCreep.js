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

        var energyForBuild=Game.spawns[spawnName].room.energyCapacityAvailable;
        var optimalEnergyForBuild=1300
        if (role=="miner") {
            // 800 for slow miner
            optimalEnergyForBuild=1000
        }
        if ("super" in subroleDict && subroleDict["super"]){
            optimalEnergyForBuild=10000;
        }
        if ("cost" in subroleDict){
            optimalEnergyForBuild=subroleDict["cost"]
            delete(subroleDict["cost"]);
        }
        optimalEnergyForBuild=Math.min(optimalEnergyForBuild,energyForBuild);
        
        var priority={"harvester":35,"upgrader":25,"builder":30,"miner":34,"energyHauler":32,"scout":20,"warbot":55,"claimer":33};
        var memory={}

        if (!(role in priority)){
            priority[role]=0;
        }

        var partsArray={"basic":{"base":[CARRY,WORK,MOVE],"add":[CARRY,WORK,MOVE]}};
        partsArray["energyHauler"]={"base":[CARRY,WORK,MOVE,MOVE],"add":[CARRY,MOVE]};
        partsArray["miner"]={"base":[WORK,WORK,MOVE,CARRY],"add":[WORK,WORK,MOVE]};

        partsArray["warbot"]={"base":[ATTACK,MOVE],"add":[ATTACK,MOVE]};
        partsArray["claimer"]={"base":[CLAIM,MOVE],"add":[CLAIM,MOVE]};
        
        partsArray["upgrader"]={"base":[CARRY,WORK,MOVE],"add":[CARRY,WORK,MOVE]};
        if (energyForBuild>=400) {
            partsArray["upgrader"]={"base":[CARRY,CARRY,MOVE],"add":[WORK,WORK,MOVE]};
        }
        
        // Ruper roles
        if ("super" in subroleDict && subroleDict["super"]){
            partsArray["upgrader"]={"base":[WORK,WORK,CARRY,MOVE],"add":[WORK,WORK,WORK,WORK,MOVE]};
            if (energyForBuild>=350) {
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

        temp=_.merge({"body":bodyLayout,"priority":priority[role],"energy":fullcost,"memory":memory},subroleDict)

        if (!("test" in temp)) {
            Game.spawns[spawnName].memory.creepQueue.unshift(temp);
        }


        result=""
        for (i in temp){
            if (i=="body"){
                var bodyObj={}
                for (let bodyItem in temp[i]){
                    if (!(temp[i][bodyItem] in bodyObj)){
                        bodyObj[temp[i][bodyItem]]=1
                        
                    }
                    else{
                        bodyObj[temp[i][bodyItem]]=bodyObj[temp[i][bodyItem]]+1
                    }
                }
                result=" # "+result
                for (let bodyItem in bodyObj){
                    result=bodyItem+":"+bodyObj[bodyItem]+" "+result
                }
                
                //result=temp[i]+"\n"+result
            }
            else if (i=="memory") {
                result+=i+"["
                for (let j in temp[i]){
                    result+=j+" "+temp[i][j]+":"
                }
                result+="]:"
            }
            else {
                result+=i+"->"+temp[i]+":"
            }
        }
        console.log(result);

        //return(_.merge({:,"role":role,"priority":priority[role]},subroleArray))

    }


};


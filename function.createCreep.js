var lib=require('function.libraries');

module.exports = {

    constructCreep : function(roomName,role,subroleDict) {


        [spawnName,roomType]=lib.findSpawn(roomName);
        if (!spawnName) { return }
        if (!Game.spawns[spawnName].memory.creepQueue){
            Game.spawns[spawnName].memory.creepQueue=[];
        }

        if (!subroleDict){
            subroleDict={}
        }

        var energyForBuild=Game.spawns[spawnName].room.energyCapacityAvailable;
        var optimalEnergyForBuild=1200
        var priority={"harvester":35,"upgrader":25,"builder":30,"miner":34,"energyHauler":32,"scout":20,"warbot":55,"claimer":33};
        var memory={}

        if (!(role in priority)){
            priority[role]=0;
        }

        var partsArray={"basic":{"base":[CARRY,WORK,MOVE],"add":[CARRY,WORK,MOVE]}};
        partsArray["energyHauler"]={"base":[CARRY,WORK,MOVE,MOVE],"add":[CARRY,MOVE]};
        partsArray["miner"]={"base":[WORK,WORK,MOVE],"add":[WORK,WORK,MOVE]};
        partsArray["warbot"]={"base":[ATTACK,MOVE],"add":[ATTACK,MOVE]};

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
            memory["store_to"]=roomName;
        }




        var baseCost=_.sum(_.map(bodyLayout,id => BODYPART_COST[id]));
        var addCost=_.sum(_.map(add,id => BODYPART_COST[id]));
        var fullcost=baseCost;

        for (let i = 1; i <= (Math.round(Math.min(energyForBuild, optimalEnergyForBuild) - baseCost) / addCost); i++) {
            bodyLayout = bodyLayout.concat(add);
            fullcost+=addCost;
        }


        //
        //    _.merge({"body":bodyLayout,"priority":priority[role],"energy":fullcost,"memory":memory},subroleDict))
        temp=_.merge({"body":bodyLayout,"priority":priority[role],"energy":fullcost,"memory":memory},subroleDict)

        if (!("test" in temp)) {
            Game.spawns[spawnName].memory.creepQueue.unshift(temp);
        }


        result=""
        for (i in temp){
            result+=i+"->"+temp[i]+":"
            if (i=="memory") {
                for (let j in temp[i]){
                    result+=j+" "+temp[i][j]+":"
                }
            }
        }
        console.log(result);

        //return(_.merge({:,"role":role,"priority":priority[role]},subroleArray))

    }


};


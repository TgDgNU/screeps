
function libFindSpawn(roomName){
        for (let spawnN in Game.spawns) {
            let spawn = Game.spawns[spawnN];
            if (spawn.room.name ==roomName){
                return ([spawnN,"spawnRoom"])
            }
            for (roomN in spawn.memory.claim){
                if (roomN==roomName && spawn.memory.claim[roomN]=="expandRoom") {
                    return([spawnN,"expandRoom"])
                }
                else if (roomN==roomName) {
                    return([spawnN,"claimRoom"])
                }
            }
        }
        return([null,null]);
    }

module.exports = {
    showCreep: function(creep,displayStyle) {
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
        return(result)
    },
    


    
    findSpawn : function (roomName) {
        return (libFindSpawn(roomName))
        
    },
    
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

        if (role in partsArray){
            var bodyLayout=partsArray["role"]["base"];
            var add=partsArray["role"]["add"]
        }
        else{
            var bodyLayout=partsArray["base"]["base"];
            var add=partsArray["base"]["add"]
        }



        memory["claim"]=roomName;
        memory["role"]=role;
        if (role=="energyHauler") {
            memory["store_to"]=roomName;
        }




        var baseCost=_.sum(_.flatMap(bodyLayout,id => BODYPART_COST[id]));
        var addCost=_.sum(_.flatMap(add,id => BODYPART_COST[id]));
        var fullcost=baseCost;

        for (let i = 1; i <= (Math.round(Math.min(energyForBuild, optimalEnergyForBuild) - baseCost) / addCost); i++) {
            bodyLayout = bodyLayout["energyHauler"].concat([CARRY, MOVE]);
            fullcost+=addCost;
        }


        Game.spawns[spawnName].memory.creepQueue.unshift(
            _.merge({"body":bodyLayout,"priority":priority[role],"energy":fullcost,"memory":memory},subroleDict))
        result=""
        for (i in Game.spawns[spawnName].memory.creepQueue[0]){
            result+=i+" "+Game.spawns[spawnName].memory.creepQueue[0][i]+delimeter
        }
        console.log(result);

        //return(_.merge({:,"role":role,"priority":priority[role]},subroleArray))

    },
    
    resetCreepQueue: function(spawnN){
        if (spawnN && spawnN in Game.spawns){
            Game.spawns[spawnN].memory.creepQueue=[]
            return true
        }
        for (let spawnName in Game.spawns){
            Game.spawns[spawnName].memory.creepQueue=[]
        }
        return true
    },
    
    createCreepName : function(creep) {
        var subrole=""
        if ("subrole" in creep["memory"]){
            subrole=creep["memory"]["subrole"]+"-";
        }
        return (creep["memory"]["role"]+"-"+subrole+creep["memory"]["claim"]+"-"+Game.time);
    },
    
    checkCreepInQueue : function(roomName,role,subroleDict){
        var spawnName
        [spawnName, roomType]=libFindSpawn(roomName);
        if (!spawnName){ return false}
        
       
        //console.log(roomName)
        //console.log(role)
        //console.log(JSON.stringify(subroleDict))
        
        if (!subroleDict || !subroleDict["memory"] || !subroleDict["memory"]["energy_source"]) {
            var energy_source=null
        }
        else{
            var energy_source=subroleDict["memory"]["energy_source"]
        }
        creepsInQueue=_.filter(Game.spawns[spawnName].memory.creepQueue,
            (creep)=> (!creep.memory.energy_source || creep.memory.energy_source == energy_source) &&
                creep.memory.role==role &&
                creep.memory.claim==roomName)
        //console.log(creepsInQueue.length) 
        return (creepsInQueue.length)
    },


};
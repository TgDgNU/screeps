/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('lib.display');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    showCreep: function(creep,displayStyle) {
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
    },


    
    findSpawn : function(roomName){
        for (let spawnN in Game.spawns) {
            let spawn = Game.spawns[spawnN];
            if (spawn.room.name ==roomName){
                return ([spawnN,"spawnRoom"])
            }
            for (roomN in spawn.memory.claim){
                if (roomN==roomName) {
                    return([spawnN,"claimRoom"])
                }
            }
        }
        return([null,null]);
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

    }


};
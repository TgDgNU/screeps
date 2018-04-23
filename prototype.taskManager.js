var lib=require('function.libraries');
var debug=0;

var TaskManager=function(base){
    this.debug=false
    
    this.base=base
    this.taskQueue=this.base.memory.taskQueue|| []
    
    if (debug){console.log("init taskmanager for room "+this.base.name) }

    return this
}

TaskManager.prototype.findTask=function(creep){
    console.log("taskmanager start find task for creep"+creep.name)
    
    if (_.get(creep.memory,"role")=="energyHauler"){
        // search for containers
        for (container in _.get(this.base,"memory.database.energy.containers",{})){
            console.log(container)
            if (Game.getObjectById(container) &&
                (Game.getObjectById(container).store.energy-_.get(this.base,"memory.database.energy.containers."+container+".reserved",0))>creep.carryCapacity-_.sum(creep.carry)){
                console.log("container "+container+" needs a hauler")
                this.assignTask(creep,{type:"haulFrom",target:container,options:{}})
                return
            }
        }
    }
    
}


TaskManager.prototype.assignTask=function(creep,task){
    console.log("taskmanager start assign task for creep"+creep.name)
    console.log(JSON.stringify(task))
    creep.taskManager=this
    if (task.type=="haulFrom"){
        creep.memory.tasks=[task]
        _.set(this.base.memory.database.energy.containers[task["target"]],"reserved",_.get(this.base.memory.database.energy.containers[task["target"]],"reserved",0)+creep.carryCapacity)
        
    }
    
}

TaskManager.prototype.abandonTask=function(creep,task){
    console.log("taskmanager start deassiging task for creep"+creep.name)
    console.log(JSON.stringify(task))
    if (task.type=="haulFrom"){
        creep.memory.tasks=[task]
        console.log(this.base.memory.database.energy)
        _.set(this.base.memory.database.energy.containers[task["target"]],"reserved")=_.get(this.base.memory.database.energy.containers[task["target"]],0)-creep.carry.energy
        
    }
    
}


TaskManager.prototype.emptyStore=function(creep){
    console.log("taskmanager start emptystore "+this.base.name)
    
    harvesters=_.filter(Game.creeps,c=>_.get(c.memory,"baseRoom")==this.base.name && _.get(c.memory,"role")=="harvester" && _.get(c.memory,"tasks").length==0 )
    if (harvesters.length==0){
        console.log("<font color=red>"+this.base.name+" can't find free harvesters for store overhaul </font>")
    }
    
    
    for (creep of harvesters){
        console.log(creep.name)
        creep.memory.tasks.push({"type":"haulFrom",target:creep.room.find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_STORAGE})[0].id, options:{resourceType:"energy"}});
        creep.memory.tasks.push({"type":"haulTo",target:creep.room.find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_TERMINAL})[0].id});
        creep.memory.tasks.push({"type":"haulFrom",target:creep.room.find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_STORAGE})[0].id, options:{resourceType:"energy"}});
        creep.memory.tasks.push({"type":"haulTo",target:creep.room.find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_TERMINAL})[0].id});
        creep.memory.tasks.push({"type":"haulFrom",target:creep.room.find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_STORAGE})[0].id, options:{resourceType:"energy"}})
        creep.memory.tasks.push({"type":"haulTo",target:creep.room.find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_TERMINAL})[0].id});
        creep.memory.tasks.push({"type":"haulFrom",target:creep.room.find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_STORAGE})[0].id, options:{resourceType:"energy"}})
    }
    
}

TaskManager.prototype.storeEnergy=function(){
    console.log("taskmanager start store energy")
    for (creep of _.filter(Game.creeps,c=>_.get(c.memory,"baseName")==this.base.name && _.get(c.memory,"role")=="energyHauler" )){
        console.log(creep.name)
    }
    
    
    
}


module.exports = TaskManager



TaskManager.prototype.createTask=function(taskType,taskPriority,taskOptions){
    if (!taskOptions){
        taskOptions={}
    }
    if (taskType=="spawnCreep"){
        if (!("roomName" in taskOptions)){
            taskOptions["roomName"]=this.room.name
        }
        if (!("role" in taskOptions)){
            taskOptions["role"]="upgrader"
        }
        if (!("subroleDict" in taskOptions)){
            taskOptions["subroleDict"]={}
        }
        this.taskCreateCreep(taskOptions["roomName"],taskOptions["role"],taskOptions["subroleDict"])
    }
    
    this.room.memory.taskQueue=this.taskQueue
}

TaskManager.prototype.taskCreateCreep=function(roomName,role,subroleDict) {
        if (debug){console.log("Running taskManager for room"+roomName)}

        if (!subroleDict){subroleDict={}}
        if (!("memory" in subroleDict)){subroleDict["memory"]={}}

        var energyForBuild=this.room.energyCapacityAvailable;
        // need a filter to find spawnqueue length
        //var optimalEnergyForBuild= (Game.spawns[spawnName].memory.creepQueue.length>10 && 1000) || 1300;
        var optimalEnergyForBuild= 1300
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
            subroleDict["memory"]["useStorage"]=true;
        }
        if ("cost" in subroleDict){
            optimalEnergyForBuild=subroleDict["cost"]
            delete(subroleDict["cost"]);
        }
        optimalEnergyForBuild=Math.min(optimalEnergyForBuild,energyForBuild);
        
        var priorityDict={"rangedDefender":39,"wallRepair":38,"harvester":40,"upgrader":30,"builder":31,"miner":45,"energyHauler":32,"scout":10,"warbot":55,"claimer":34,"mineralHarvester":27};
        var memory={}

        var priority=priorityDict[role] || 0;
        //if (roomType=="spawnRoom" || roomType=="expandRoom" ){
        if (this.room.name==roomName){
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
        partsArray["rangedDefender"]={"base":[RANGED_ATTACK,RANGED_ATTACK,MOVE],"add":[RANGED_ATTACK,RANGED_ATTACK,MOVE]};
        partsArray["wallRepair"]={"base":[WORK,CARRY,MOVE],"add":[WORK,WORK,WORK,CARRY,MOVE,MOVE]};

        partsArray["warbot"]={"base":[RANGED_ATTACK,MOVE],"add":[ATTACK,MOVE]};
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



        memory["workRoom"]=roomName;
        memory["claim"]=roomName;
        memory["role"]=role;
        if (role=="energyHauler") {
            memory["store_to"]=this.room.name;
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
        
        let task={"type":"spawnCreep","priority":priority,"creep":temp}
        console.log(this.taskQueue)
        this.taskQueue.push(task)

        console.log("Added to "+this.room.name+" Q ["+ lib.showCreep(temp))

    }
    
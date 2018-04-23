/*
Room.prototype.isMine(){
    if (("controller" in this) && this.controller.my){
        return true
    }
    return false
}
*/



Room.prototype.processRoom = function(){
        //console.log(this.name+' '+this.base.name)

        if (!(this.name) in Memory.rooms){
            Memory.rooms[this.name]={}
        }
        
        //this.init()
        
		this.memory["lastSeenTime"]=Game.time;
		
        //if (_.get(this,"controller.level",0)==1 && _.get(this,"controller.my",false)) {
        //    temp=this.find(FIND_STRUCTURES,{filter: s=> !(s.my) && s.structureType !=STRUCTURE_WALL && s.structureType !=STRUCTURE_ROAD && s.structureType !=STRUCTURE_CONTAINER})
        //    for ( structure in temp){
        //        temp[structure].destroy()
        //    }
        //}

        this.hasHostiles()

        this.processRoomEnergy()
        if (_.get(this,"controller.my",false)){
            this.manageLinks()
            this.updateStatus()
            //if (_.get(this,"memory.status.starving",false)){
            //    this.helpMe()
            //}
        }
        
        if (this.name=="E2S19"){
            //this.processTaskSpawning()
        }
        
    }
    
Room.prototype.updateStatus=function(){
    //this.energyStore=0

    
    //_.set(this,"memory.status.starving",false)
    
    //if (energyStored<20000){
    //    _.set(this,"memory.status.starving",true)
    //}
    

}

Room.prototype.updateDatabaseLabs=function(){
    if (!this.base) {
        return false
    }
    
    var structures=this.find(FIND_STRUCTURES, {filter: structure =>
        structure.structureType == STRUCTURE_LAB && structure.my})
		
	//var this.firstLab, this.secondLab;

    
    for (structure of structures){
        if (!(this.firstLab) && structure.pos.findInRange(structures,2).length==structures.length) {
            this.firstLab=structure
			_.set(this.base,"memory.database.minerals.firstLab."+structure.id+".id",structure.id)
        }
        else if (this.firstLab && !(this.secondLab) && structure.pos.findInRange(structures,2).length==structures.length) {
            this.secondLab=structure
			_.set(this.base,"memory.database.minerals.secondLab."+structure.id+".id",structure.id)
        }
        else {
			_.set(this,"labs."+structure.id+".id",structure.id)
			_.set(this.base,"memory.database.minerals.labs."+structure.id+".id",structure.id)
        }
    }
	
	
	
    return true
    
} 
    
Room.prototype.updateDatabaseEnergy=function(){
    if (!this.base) {
        return false
    }
    
    var structures=this.find(FIND_STRUCTURES, {filter: structure =>
        structure.structureType == STRUCTURE_STORAGE && structure.my  ||
        structure.structureType == STRUCTURE_CONTAINER ||
        structure.structureType == STRUCTURE_TERMINAL  && structure.my ||
        structure.structureType == STRUCTURE_LINK  && structure.my})
    
    for (structure of structures){
        if (structure.structureType == STRUCTURE_STORAGE) {
            _.set(this.base,"memory.database.energy.storage."+structure.id+".id",structure.id)
        }
        else if (structure.structureType == STRUCTURE_TERMINAL) {
            _.set(this.base,"memory.database.energy.terminal."+structure.id+".id",structure.id)
        }
        else if (structure.structureType == STRUCTURE_CONTAINER) {
            if (structure.pos.findInRange(FIND_MY_STRUCTURES,3,{filter:s=>s.structureType==STRUCTURE_CONTROLLER}).length>0){
                _.set(this.base,"memory.database.energy.containersController."+structure.id+".id",structure.id)
             }
             else {
                _.set(this.base,"memory.database.energy.containers."+structure.id+".id",structure.id)
            }
        }
        else if (structure.structureType == STRUCTURE_LINK) {
            if (structure.pos.findInRange(FIND_MY_STRUCTURES,3,{filter:s=>s.structureType==STRUCTURE_CONTROLLER}).length>0){
                _.set(this.base,"memory.database.energy.linkController."+structure.id+".id",structure.id)
             }
            else if (structure.pos.findInRange(FIND_MY_STRUCTURES,3,{filter:s=>s.structureType==STRUCTURE_STORAGE}).length>0){
                _.set(this.base,"memory.database.energy.linkStorage."+structure.id+".id",structure.id)
             }
             else {
                _.set(this.base,"memory.database.energy.links."+structure.id+".id",structure.id)
            }
        }
    }
    return true
    
}    
    
    
    
Room.prototype.processRoomEnergy=function(){
    /*if (res!=null){
            Memory.rooms[rName]["roomEnergyArray"]=res;
        }
        else {
            Game.notify("Error processing room "+rName)
        }
*/
    if (!("roomEnergyArray" in rooms[this.name])){
    
        var roomEnergyArray=[]
        var roomEnergy={}
        var dropppedEnergy = this.find(FIND_DROPPED_RESOURCES, {filter: spot => (spot.amount > 0 && spot.resourceType == RESOURCE_ENERGY)})
        for (let id in dropppedEnergy) {
            roomEnergyArray.push(["droppedEnergy", dropppedEnergy[id].amount, dropppedEnergy[id].id])
        }

        var container = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_CONTAINER})
        for (let id in container) {
            //roomEnergyArray.push(["container", container[id].store.energy, container[id].id])

            roomEnergy[container[id].id]={energy:container[id].store.energy,type:"container","id":container[id].id}
            if (container[id].pos.findInRange(FIND_STRUCTURES,3,{filter:s=>s.structureType==STRUCTURE_CONTROLLER}).length>0){
                roomEnergy[container[id].id]["subType"]="containerController"
                //console.log("CCller")
                
            }
        }
        

        
		//_.set(this,"memory.manage.fullContainers",container.filter(i=>i.store.energy==CONTAINER_CAPACITY).length)
		
        var storage = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_STORAGE})
        for (let id in storage) {
            //roomEnergyArray.push(["storage", storage[id].store.energy, storage[id].id])
            roomEnergy[storage[id].id]={energy:storage[id].store.energy,type:"storage","id":storage[id].id}
        }
        
        var terminal = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_TERMINAL})
        for (let id in terminal) {
            roomEnergy[terminal[id].id]={energy:terminal[id].store.energy,type:"terminal","id":terminal[id].id}
        }

        let links = this.find(FIND_MY_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_LINK &&
            structure.pos.findInRange(FIND_STRUCTURES,3,{filter:st=>st.structureType==STRUCTURE_CONTROLLER}).length>0});
        for (let id in links) {
            //roomEnergyArray.push(["linkController", links[id].energy, links[id].id])
            roomEnergy[links[id].id]={energy:links[id].energy,type:"linkController","id":links[id].id}
        }
        
        links = this.find(FIND_MY_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_LINK && this.findStorage() && 
            structure.pos.isNearTo(this.findStorage()) && !(structure.id in roomEnergy)});
        for (let id in links) {
            //roomEnergyArray.push(["linkStorage", links[id].energy, links[id].id])
            roomEnergy[links[id].id]={energy:links[id].energy,type:"linkStorage","id":links[id].id}
        }
            
        links = this.find(FIND_MY_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_LINK && !(structure.id in roomEnergy)})
            for (let id in links) {
                roomEnergyArray.push(["link", links[id].energy, links[id].id])
                roomEnergy[links[id].id]={energy:links[id].energy,type:"link","id":links[id].id}
            }
            
        let nuker = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_NUKER})
        for (let id in nuker) {
            roomEnergy[nuker[id].id]={energy:nuker[id].energy,type:"nuker",id:nuker[id].id}
        }
        
        var extension = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_EXTENSION  &&
            structure.energy<EXTENSION_ENERGY_CAPACITY[_.get(this,"controller.level",0)] })
        for (let id in extension) {
            roomEnergyArray.push(["extension", extension[id].energy, extension[id].id])
            roomEnergy[extension[id].id]={energy:extension[id].energy,type:"extension",id:extension[id].id}
        }
        var tower = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_TOWER &&
            structure.energy<1000})
        
        for (let id in tower) {
            roomEnergyArray.push(["tower", tower[id].energy, tower[id].id])
            roomEnergy[tower[id].id]={energy:tower[id].energy,type:"tower",id:tower[id].id}
        }
        var spawn = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_SPAWN})
        for (let id in spawn) {
            roomEnergyArray.push(["spawn", spawn[id].energy, spawn[id].id])
            roomEnergy[spawn[id].id]={energy:spawn[id].energy,type:"spawn",id:spawn[id].id}
        }


        creepArray=this.find(FIND_MY_CREEPS,{filter: cr=> cr.memory.energySourceId});

        if (creepArray.length>0){
            for (let i in creepArray){
                let creep=creepArray[i]
                for (let element in roomEnergyArray){
                    if (roomEnergyArray[element][2]==creepArray[i].memory.energySourceId) {
                        roomEnergyArray[element][1] -= creepArray[i].carryCapacity - creepArray[i].carry.energy;
                    }
                }
                if (creep.memory.energySourceId in roomEnergy){
                    roomEnergy[creep.memory.energySourceId].energy-=creep.carryCapacity - creep.carry.energy;
                }
                else if (Game.time> 5486019+20000){
                    console.log(creep.name+" error in room - process energy - line 156")
                }

            }
        }


        //return(roomEnergyArray)
    rooms[this.name]["roomEnergyArray"]=roomEnergyArray;
    rooms[this.name]["roomEnergy"]=roomEnergy;
    Memory.rooms[this.name]["roomEnergyArray"]=rooms[this.name]["roomEnergyArray"]
    Memory.rooms[this.name]["roomEnergy"]=rooms[this.name]["roomEnergy"]
    }
}

Room.prototype.getStoredEnergy=function(){
    var energy=0;
    let searchStructures=this.find(FIND_STRUCTURES,{filter:
            (s) => s.structureType==STRUCTURE_STORAGE ||
                s.structureType==STRUCTURE_CONTAINER ||
                s.structureType==STRUCTURE_TERMINAL} )
                
    for (i in searchStructures) {
            if (searchStructures[i].energy) {
                energy+=searchStructures[i].energy;
            }
            else if (searchStructures[i].store){
                energy+=searchStructures[i].store.energy;
            }
        }
    
    return(energy);
}

Room.prototype.processTaskSpawning=function(){
    //console.log("proceed task spawning "+this.name)
    //console.log(JSON.stringify(_.get(this,"memory.taskQueue",[]).filter(item=>item.type=="spawnCreep")))
    //console.log(JSON.stringify(_.get(this,"memory.taskQueue",[])))
    spawnList=this.find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_SPAWN && !s.spawning})
    for (let spawnNum in spawnList){
        //return
        let spawn=spawnList[spawnNum]
        console.log("iterating spawns "+spawn)
        
        let sortedQ=_.get(this,"memory.taskQueue",[]).filter(item=>item.type=="spawnCreep").sort((item1,item2)=>item2.creep.priority-item1.creep.priority)
		console.log(JSON.stringify(sortedQ))
		if (sortedQ.length>0 && sortedQ[0].creep.energy<=this.energyAvailable){
		    console.log("We actually spawn smth")
		    console.log(JSON.stringify(sortedQ[0]))
		    console.log(JSON.stringify(sortedQ[0].creep.body))
		    console.log(JSON.stringify(sortedQ[0].creep.purpose+"-"+Game.time))
            result=spawn.spawnCreep(sortedQ[0].creep.body,sortedQ[0].creep.purpose+"-"+Game.time,{"memory":
                    _.merge(sortedQ[0].creep.memory,{subrole:sortedQ[0].creep.subrole,spawnedBy:spawn.name,baseRoom:this.name,"spawnTime":Game.time})});

            if (result!=0) {
                console.log("Could not spawn creep "+sortedQ[0].creep.name+" result "+result)
            }
            //spawn.memory.creepQueue.shift();
            
            console.log(spawn.name + " building "+sortedQ[0].creep.name);
        }
    }
    
}
/*
Room.prototype.helpMe=function(){

        if (_.filter(this.memory.roomEnergy,s=>s.type=="terminal").length==0){
            // need help by haulers
            //console.log(this.name+" needs help, but no terminal")
           //console.log(JSON.stringify((this.memory.roomEnergy)))
            
        }
        else {
            var terminalsArr=_.filter(Game.structures, s=>s.structureType==STRUCTURE_TERMINAL && s.store.energy>TERMINAL_MIN_ENERGY_TO_USE_IT).sort((t1,t2)=>Game.market.calcTransactionCost(1,t1.room.name,this.name)-Game.market.calcTransactionCost(1,t2.room.name,this.name))
            //console.log(terminalsArr)
            //console.log(terminalsArr[0])
            if (terminalsArr.length>0 && terminalsArr[0].cooldown==0){
                Game.notify("Send energy from "+terminalsArr[0].room.name+" to "+this.name+ "lost "+Game.market.calcTransactionCost(10000,terminalsArr[0].room.name,this.name))
                //console.log("lost "+Game.market.calcTransactionCost(10000,terminalsArr[0].room.name,this.name))
                terminalsArr[0].send(RESOURCE_ENERGY,10000,this.name)
                
            }
        }
        

}
*/
Room.prototype.hasHostiles = function (){
    // check cached result
	if (!("hasHostiles" in rooms[this.name])){
        rooms[this.name]["hasHostiles"]=this.find(FIND_HOSTILE_CREEPS,{filter: cr=> cr.body.some(bodyPart=>(bodyPart.type==ATTACK || bodyPart.type==RANGED_ATTACK))}).length
        Memory.rooms[this.name]["hasHostiles"]=rooms[this.name]["hasHostiles"];
    }
	//if (this.name=="E3S16") {console.log(this.name+" "+rooms[this.name]["hasHostiles"]+Memory.rooms[this.name]["hasHostiles"])}
    return (rooms[this.name]["hasHostiles"])
}

Room.prototype.findStorage = function(){
    if (!("storage" in rooms[this.name])){
        let temp=this.find(FIND_MY_STRUCTURES,{filter: { structureType: STRUCTURE_STORAGE }})
        if (temp.length>0){
            rooms[this.name]["storage"]=temp[0]
        }
        else{
            rooms[this.name]["storage"]=null
        }
    }
    return rooms[this.name]["storage"]
}

Room.prototype.manageLinks = function (){
    let linksStorage=_.map(rooms[this.name]["roomEnergy"],function(value,key){return _.merge({id:key},value)}).
        filter(item=>item["type"]=="linkStorage" && (item["energy"]>800-LINK_TRESHOLD) && Game.getObjectById(item["id"]).cooldown==0)
    let linksController=_.map(rooms[this.name]["roomEnergy"],function(value,key){return _.merge({id:key},value)}).
        filter(item=>item["type"]=="linkController" && item["energy"]<LINK_TRESHOLD)
    let otherLinks=_.map(rooms[this.name]["roomEnergy"],function(value,key){return _.merge({id:key},value)}).
        filter(item=>item["type"]=="link" && (item["energy"]>800-LINK_TRESHOLD) && Game.getObjectById(item["id"]).cooldown==0)
//filter(item=>item["type"]=="link" && (item["energy"]>800-LINK_TRESHOLD) && Game.getObjectById(item["id"]).cooldown==0)

    //if (this.name=="E2S19"){
    //    console.log("links")
    //    console.log(JSON.stringify(rooms[this.name]["roomEnergy"]))
    //    console.log(JSON.stringify(otherLinks))
    //    console.log(JSON.stringify(otherLinks.concat(linksStorage)))
    //}
    
    let sourceLinks=otherLinks.concat(linksStorage)
    for (id in sourceLinks){
        if (linksController.length==0){break}
        let link=Game.getObjectById(sourceLinks[id]["id"])
        let linkTo=Game.getObjectById(linksController[0]["id"])
        let energyToTransfer=Math.min(sourceLinks[id]["energy"],(800-Game.getObjectById(linksController[0]["id"]).energy))
        
        result=link.transferEnergy(linkTo,energyToTransfer)
        if (result==0){
            rooms[this.name]["roomEnergy"][sourceLinks[id]["id"]]["energy"]-=energyToTransfer
            rooms[this.name]["roomEnergy"][linksController[0]["id"]]["energy"]+=Math.floor(energyToTransfer*0.97)
            linksController=_.map(rooms[this.name]["roomEnergy"],function(value,key){return _.merge({id:key},value)}).
                filter(item=>item["type"]=="linkController" && item["energy"]<LINK_TRESHOLD)
        
        }
        else{
            console.log("error in manage links, transfer result "+result)
            console.log(linkTo.id)
            console.log(linkTo.room.name)
        }

    }

//console.log(JSON.stringify(linksStorage))

    
}

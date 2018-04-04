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
        filter(item=>item["type"]=="linkStorage" && item["energy"]<LINK_TRESHOLD)
    let linksController=_.map(rooms[this.name]["roomEnergy"],function(value,key){return _.merge({id:key},value)}).
        filter(item=>item["type"]=="linkController" && item["energy"]<LINK_TRESHOLD)
    let otherLinks=_.map(rooms[this.name]["roomEnergy"],function(value,key){return _.merge({id:key},value)}).
        filter(item=>item["type"]=="link" && (item["energy"]>800-LINK_TRESHOLD) && Game.getObjectById(item["id"]).cooldown==0)
//filter(item=>item["type"]=="link" && (item["energy"]>800-LINK_TRESHOLD) && Game.getObjectById(item["id"]).cooldown==0)

    
    for (id in otherLinks){
        if (linksController.length==0){break}
        let link=Game.getObjectById(otherLinks[id]["id"])
        let linkTo=Game.getObjectById(linksController[0]["id"])
        let energyToTransfer=Math.min(otherLinks[id]["energy"],(800-linksController[0]["energy"]))
        
        result=link.transferEnergy(linkTo,energyToTransfer)
        if (result==0){
            rooms[this.name]["roomEnergy"][otherLinks[id]["id"]]["energy"]-=energyToTransfer
            rooms[this.name]["roomEnergy"][linksController[0]["id"]]["energy"]+=Math.floor(energyToTransfer*0.97)
            linksController=_.map(rooms[this.name]["roomEnergy"],function(value,key){return _.merge({id:key},value)}).
                filter(item=>item["type"]=="linkController" && item["energy"]<LINK_TRESHOLD)
        
        }
        else{
            console.log("error in manage links, transfer result "+result)
        }

    }

//console.log(JSON.stringify(linksStorage))

    
}


Room.prototype.processRoom = function(){

        if (!(this.name) in Memory.rooms){
            Memory.rooms[this.name]={}
        }
        
		this.memory["lastSeenTime"]=Game.time;
		
        if (("controller" in this) && this.controller.level==1) {
            temp=this.find(FIND_STRUCTURES,{filter: s=> !(s.my) && s.structureType !=STRUCTURE_WALL && s.structureType !=STRUCTURE_ROAD && s.structureType !=STRUCTURE_CONTAINER})
            for ( structure in temp){
                temp[structure].destroy()
            }
        }

        this.hasHostiles()

        this.processRoomEnergy()
        this.manageLinks()



    }
    
Room.prototype.processLinks=function(){

    
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
            roomEnergyArray.push(["container", container[id].store.energy, container[id].id])
        }
        var storage = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_STORAGE})
        for (let id in storage) {
            roomEnergyArray.push(["storage", storage[id].store.energy, storage[id].id])
            roomEnergy[storage[id].id]={energy:storage[id].store.energy,type:"storage"}
        }
        var terminal = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_TERMINAL})
        for (let id in terminal) {
            roomEnergy[terminal[id].id]={energy:terminal[id].store.energy,type:"terminal"}
        }

        let links = this.find(FIND_MY_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_LINK &&
            structure.pos.findInRange(FIND_STRUCTURES,3,{filter:st=>st.structureType==STRUCTURE_CONTROLLER}).length>0});
        for (let id in links) {
            roomEnergyArray.push(["linkController", links[id].energy, links[id].id])
            roomEnergy[links[id].id]={energy:links[id].energy,type:"linkController"}
        }
        
        links = this.find(FIND_MY_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_LINK && this.findStorage() && 
            structure.pos.isNearTo(this.findStorage()) && !(structure.id in roomEnergy)});
        for (let id in links) {
            roomEnergyArray.push(["linkStorage", links[id].energy, links[id].id])
            roomEnergy[links[id].id]={energy:links[id].energy,type:"linkStorage"}
        }
            
        links = this.find(FIND_MY_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_LINK && !(structure.id in roomEnergy)})
            for (let id in links) {
                roomEnergyArray.push(["link", links[id].energy, links[id].id])
                roomEnergy[links[id].id]={energy:links[id].energy,type:"link"}
            }
        
        var extension = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_EXTENSION})
        for (let id in extension) {
            roomEnergyArray.push(["extension", extension[id].energy, extension[id].id])
        }
        var tower = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_TOWER})
        for (let id in tower) {
            roomEnergyArray.push(["extension", tower[id].energy, tower[id].id])
        }
        var spawn = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_SPAWN})
        for (let id in spawn) {
            roomEnergyArray.push(["spawn", spawn[id].energy, spawn[id].id])
        }


        creepArray=this.find(FIND_MY_CREEPS,{filter: cr=> cr.memory.energySourceId});

        if (creepArray.length>0){
            for (let i in creepArray){
                for (let element in roomEnergyArray){
                    if (roomEnergyArray[element][2]==creepArray[i].memory.energySourceId) {
                        roomEnergyArray[element][1] -= creepArray[i].carryCapacity - creepArray[i].carry.energy;
                    }
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
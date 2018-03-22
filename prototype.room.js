Room.prototype.hasHostiles = function (){
    if (!("hasHostiles" in rooms[this.name])){
        rooms[this.name]["hasHostiles"]=this.find(FIND_HOSTILE_CREEPS,{filter: cr=> cr.body.some(bodyPart=>(bodyPart.type==ATTACK || bodyPart.type==RANGED_ATTACK))}).length
        if (rooms[this.name]["hasHostiles"]>0){
            if (!(this.name in Memory.rooms)){
                Memory.rooms[this.name]={}
            }
            Memory.rooms[this.name]["hadHostiles"]=Game.time
        }
        else{
            Memory.rooms[this.name]["hadHostiles"]=0;
        }
    }

    return (rooms[this.name]["hasHostiles"])
}

Room.prototype.findStorage = function(){
    if (!("storage" in room[this.name])){
        let temp=this.find(FIND_MY_STRUCTURES,{filter: { structureType: STRUCTURE_STORAGE }})
        if (temp.length>0){
            room[this.name]["storage"]=temp[0]
        }
        else{
            room[this.name]["storage"]=null
        }
    }
    return room[this.name]["storage"]
}

Room.prototype.manageLinks = function (){
    
    if (!("storageLink" in room[this.name])){
        linkArray=this.find(FIND_MY_STRUCTURES,{filter:struct=>struct.structureType==STRUCTURE_LINK})
        for (linkItem in linkArray) {
            if (Room.prototype.findStorage() && linkArray[linkItem].isNearTo(Room.prototype.findStorage())){
                room[this.name]["storageLink"]=linkArray[linkItem]
            }
        }
    }
    if (!("storageLink" in room[this.name]) || room[this.name]["storageLink"].energy>room[this.name]["storageLink"].energyCapacity*0.7){
        return false
    }
    linkArray=this.find(FIND_MY_STRUCTURES,{filter:struct=>struct.structureType==STRUCTURE_LINK && struct.id != room[this.name]["storageLink"].id})
    for (linkItem in linkArray){
        //if 
    }
}


Room.prototype.processRoom = function(){
            
        // Exclude not seen rooms
        if (!(this)) {
            return null;
        }

        this.hasHostiles()

        var roomEnergyArray = [];

        var dropppedEnergy = this.find(FIND_DROPPED_RESOURCES, {filter: spot => (spot.amount > 0 && spot.resourceType == RESOURCE_ENERGY)})
        for (let id in dropppedEnergy) {
            roomEnergyArray.push(["droppedEnergy", dropppedEnergy[id].amount, dropppedEnergy[id].id])
        }

        var container = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store.energy > 0})
        for (let id in container) {
            roomEnergyArray.push(["container", container[id].store.energy, container[id].id])
        }
        var storage = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_STORAGE && structure.store.energy > 0})
        for (let id in storage) {
            roomEnergyArray.push(["storage", storage[id].store.energy, storage[id].id])
        }
        //var link = this.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_LINK && this.findStorage() && structure.isNearTo(this.findStorage()) && structure.store.energy > 0})
        //for (let id in link) {
        //    roomEnergyArray.push(["linkStorage", link[id].energy, link[id].id])
        //}


        creepArray=this.find(FIND_MY_CREEPS,{filter: cr=> cr.memory.working==false && cr.memory.energySourceId});
        if (creepArray.length>0){
            for (let i in creepArray){
                //console.log(creepArray[i].name);

                for (let element in roomEnergyArray){
                    if (roomEnergyArray[element][2]==creepArray[i].memory.energySourceId) {
                        roomEnergyArray[element][1] -= creepArray[i].carryCapacity - creepArray[i].carry.energy;
                    }
                }

            }
        }


        return(roomEnergyArray)

    }
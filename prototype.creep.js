Creep.prototype.getFleePosition = function(){
    return (Game.spawns[this.memory.spawnedBy].pos)
}

Creep.prototype.rolePriority=function(){
    var rolePriority={harvester:100,builder:99,repair:98,upgrader:90}
    if (this.memory.role in rolePriority){
        return rolePriority[this.memory.role]
    }
    else{
        return 1
    }
}

Creep.prototype.getEnergy=function(target,amount){
    //amount not implemented
    if (!target){
        return ERR_INVALID_TARGET
    }
    if ("resourceType" in target ){
        return(this.pickup(target,RESOURCE_ENERGY))
    }
    if (target.structureType==STRUCTURE_STORAGE || target.structureType==STRUCTURE_CONTAINER ||target.structureType==STRUCTURE_LINK ) {
        return(this.withdraw(target,RESOURCE_ENERGY))
    }
    else {
        //console.log("unknown harvest type for "+this.name)
        return(this.withdraw(target,RESOURCE_ENERGY))
    }
}

Creep.prototype.baseRoom = function(){
    //console.log (this.name)
    if (!(Game.spawns[this.memory.spawnedBy])){
        Game.notify("Error in creep "+this.name+" killing it")
        this.suicide()
    }
    return (this.memory.baseRoom || Game.spawns[this.memory.spawnedBy].room.name)
}

Creep.prototype.borderPosition = function(){
    //if (this.pos.x==0 || this.pos.x==49 || this.pos.x==1 || this.pos.x==48 || this.pos.y==0 ||this.pos.y==49 || this.pos.y==1 ||this.pos.y==48) {
    if (this.pos.x==0 || this.pos.x==49 || this.pos.y==0 ||this.pos.y==49) {
        return true
    }
    return false
}

Creep.prototype.workRoom = function(){
    return (Game.rooms[this.memory.claim || this.memory.workRoom])
}

Creep.prototype.flee=function () {
    workRoomName=this.memory.claim || this.memory.workRoom
    if (!(workRoomName in Memory.rooms)){
        Memory.rooms[workRoomName]=""
    }
	
	if (workRoomName==this.baseRoom()){
		return false
	}
    else if (this.room.hasHostiles()!=0 || this.hits<this.hitsMax){
        this.moveTo(this.getFleePosition())
        if (this.fatigue>0 && _.sum(this.carry)>0){
            for(const resourceType in this.carry) {
                this.drop(resourceType);
            }
        }
        return true
    }
    else if (Memory.rooms[workRoomName]["hasHostiles"] && Game.time-Memory.rooms[workRoomName]["lastSeenTime"]<50 && this.borderPosition()){
        this.moveTo(this.getFleePosition())
        return true
    }
    else  if (Memory.rooms[workRoomName]["hasHostiles"] && Game.time-Memory.rooms[workRoomName]["lastSeenTime"]<50){
        return true
    }
    return false
}

Creep.prototype.getHaulTarget=function (debug) {
    if ("haulTo" in this.memory && Game.getObjectById(this.memory["haulTo"]))  {
        
        if (debug){console.log(Game.getObjectById(this.memory["haulTo"]))}
        return (Game.getObjectById(this.memory["haulTo"]))
        
    }
    else {
        //console.log("search")
        
        var base=this.room.base || Game.rooms[this.memory.baseRoom].base

        
        if (!base) {
            console.log("No base for creep "+this.name)
            return false
        }
        var target=false
        
        if (base.storage) {
            target=base.storage
            if (base.terminal && _.sum(base.terminal.store)/300000 < _.sum(base.storage.store)/1000000) {
                target=base.terminal
            }
        }
        //console.log(this.room.name+" "+target)
        //if (base.terminal){
        //    target=base.terminal
        //}
        //console.log(base.links.concat([target]))
        let unsafeTarget=this.pos.findClosestByPath(_.filter(base.links,link=>link.energy<800).concat([target]))
        if (unsafeTarget) {
            target=unsafeTarget
        }
        
        //console.log(this.name+" "+target)
        return target
    }
    
}

// this.pos.isNearTo(Game.getObjectById(this.memory.haulTo.id)) {

Creep.prototype.execute = function () {
    //TODO
}


Creep.prototype.effectiveHits= function(){
    this.hits+_.get(this,"incomingHits",0)
}
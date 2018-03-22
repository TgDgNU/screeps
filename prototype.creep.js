Creep.prototype.getFleePosition = function(){
    return (Game.spawns[this.memory.spawnedBy].pos)
}

Creep.prototype.borderPosition = function(){
    if (this.pos.x==0 || this.pos.x==49 || this.pos.x==1 || this.pos.x==48 || this.pos.y==0 ||this.pos.y==49 || this.pos.y==1 ||this.pos.y==48) {
        return true
    }
    return false
}

Creep.prototype.workRoom = function(){
    return (Game.rooms[this.memory.claim || this.memory.workRoom])
}

Creep.prototype.flee=function () {
    workRoomName=this.memory.claim || this.memory.workRoom
    if (this.room.hasHostiles()!=0 || this.hits<this.hitsMax){
        this.moveTo(this.getFleePosition())
        if (this.fatigue>0 && _.sum(this.carry)>0){
            for(const resourceType in this.carry) {
                this.drop(resourceType);
            }
        }
        return true
    }
    else if (Memory.rooms[workRoomName]["hadHostiles"] && Game.time-Memory.rooms[workRoomName]["hadHostiles"]<50 && this.borderPosition()){
        this.moveTo(this.getFleePosition())
        return true
    }
    else  if (Memory.rooms[workRoomName]["hadHostiles"] && Game.time-Memory.rooms[workRoomName]["hadHostiles"]<50){
        return true
    }
    return false
}


Creep.prototype.execute = function () {
    //TODO
}
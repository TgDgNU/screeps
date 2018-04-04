var roleUpgrader = require('role.upgrader');
var findEnergy = require('function.findEnergy');

var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //creep.say("I what");
        //if (creep.room.findClosestByPath())
        if (creep.room.name==creep.memory.claim){
                if (Game.spawns[creep.memory["spawnedBy"]].memory.claim[creep.memory.claim]=="expandRoom"){
                    if (creep.pos.isNearTo(creep.room.controller)){
                        result=creep.claimController(creep.room.controller);
                    }
                    else{
                        result=ERR_NOT_IN_RANGE
                    }
                }
                else if (creep.room.controller.reservation && creep.room.controller.reservation.username!=creep.owner.username) {
                    result=creep.attackController(creep.room.controller);
                }
                else {
                    result=creep.reserveController(creep.room.controller);
                
                }

                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
        }
        else {
            creep.say("claim!")
            creep.moveTo(new RoomPosition(25, 20, creep.memory.claim));
        }

    }
};

module.exports = roleClaimer;
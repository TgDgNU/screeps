/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('function.defendRoom');
 * mod.thing == 'a thing'; // true
 */
 
// search and attack creeps in same room
// move to memory.claim room
// move to red flag in memory.claim.room
function search_and_destroy(creep) {
    var hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if (!hostile) {
        hostile = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
    }
    if (!creep.memory.claim) {
        creep.memory.claim=creep.room.name;
    }
    if (creep.hits<creep.hitsMax/3){
        creep.say("Run!")
        var greenFlag= creep.pos.findClosestByPath(FIND_FLAGS,{filter:(f)=>f.color==COLOR_GREEN}) 
        if (greenFlag) {
            creep.moveTo(greenFlag.pos,{visualizePathStyle: {stroke: '#0000ff'}});
        }
        else{
            creep.moveTo(new RoomPosition(47, 34, Game.spawns.Spawn1.room.name),{visualizePathStyle: {stroke: '#ffaa00'}})
        }
        if (hostile) {creep.attack(hostile);}
    }
    else {
        if(creep.attack(hostile) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(hostile, {visualizePathStyle: {stroke: '#ff0000'}});
                    }
        flags=creep.room.find(FIND_FLAGS,{filter: (flag)=> flag.room.name == creep.room.name && flag.color==COLOR_RED});
        if (!hostile && creep.memory.claim==creep.room.name && flags.length>0) {
            creep.moveTo(flags[0].pos);
        }
        else if (!hostile && creep.memory.claim) {
                        creep.moveTo(new RoomPosition(47, 34, creep.memory.claim))
        }
    }
}

function heal_and_stack(creep) {
    
    var comrade = creep.pos.findClosestByPath(FIND_MY_CREEPS,{filter: (creep => creep.hits<creep.hitsMax)});
    if (!comrade) {
        comrade=creep.pos.findClosestByPath(FIND_MY_CREEPS,{filter: (creep => creep.memory.role=="warbot")});
    }
    

    if (creep.memory.claim && creep.room.name!=creep.memory.claim && creep.hits==creep.hitsMax) {
        creep.moveTo(new RoomPosition(10, 45, creep.memory.claim))
    }
    else if (comrade) {
        creep.moveTo(comrade, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
    var spotToFlee=null;
    if (creep.hits<creep.hitsMax){
        creep.say("Run!")
        var greenFlag= creep.pos.findClosestByPath(FIND_FLAGS,{filter:(f)=>f.color==COLOR_GREEN}) 
        if (greenFlag) {
            creep.moveTo(greenFlag.pos,{visualizePathStyle: {stroke: '#0000ff'}});
        }
        else{
            creep.moveTo(new RoomPosition(47, 34, Game.spawns.Spawn1.room.name),{visualizePathStyle: {stroke: '#ffaa00'}})
        }
        
        {creep.heal(creep);}
    }
    else if (comrade) {
        if (comrade.hits<comrade.hitsMax){
            creep.rangedHeal(comrade);
            creep.heal(comrade);
        }
    }
    //if (comrade) {creep.say(comrade.name)};
    
}

var defendRoom = {
    run: function defendRoom(roomName) {
        
        var towerRange=50;

        var warbots = Game.rooms[roomName].find(
                FIND_MY_CREEPS, {filter: (s) => s.memory.role =="warbot"});
            warbots.forEach(warbot => search_and_destroy(warbot));
            
        var healbots = Game.rooms[roomName].find(
                FIND_MY_CREEPS, {filter: (s) => s.memory.role =="healbot"});
            healbots.forEach(healbot => heal_and_stack(healbot));
            
        var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
        
        var towers = Game.rooms[roomName].find(
                FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        towers.forEach(tower => tower.heal(Game.rooms[roomName].find(FIND_MY_CREEPS,{filter: (c) => c.hits < c.hitsMax})[0]));
        //towers.forEach(tower => tower.repair(Game.rooms[roomName].find(FIND_MY_STRUCTURES,{filter: (c) => c.hits < c.hitsMax && c.hits<1000})[2]));
        if(hostiles.length > 0) {
            //console.log("Creating warbot "+Game.spawns['Spawn1'].spawnCreep( [TOUGH,TOUGH,TOUGH,MOVE,MOVE,ATTACK, ATTACK, ATTACK, MOVE], 'WarBot' + Game.time,{ memory: { role: 'war',claim:roomName } } ));
            
            var username = hostiles[0].owner.username;
            Game.notify(`User ${username} spotted in room ${roomName} number ${hostiles.length}`);

            towers.forEach(tower => tower.attack(Game.rooms[roomName].find(FIND_HOSTILE_CREEPS,
                {filter: (c) => (tower.pos.getRangeTo(c.pos)<towerRange || c.hits<c.hitsMax)})[0]));
                //{filter: (c) => tower.pos.getRangeTo(c.pos)<13 || c.hits<c.hitsMax*2/3})));
            
            var warbots = Game.rooms[roomName].find(
                FIND_MY_CREEPS, {filter: (s) => s.memory.role =="warbot"});
            warbots.forEach(warbot => search_and_destroy(warbot));
        }
        if(hostiles.length > 25 ||
            (Game.rooms[roomName].find(FIND_MY_STRUCTURES,{filter: (s)=>s.structureType=="spawn"}).length>0 && 
             Game.rooms[roomName].find(FIND_MY_STRUCTURES,{filter: (s)=>s.structureType=="spawn"})[0].hits <4000) ||
            (Game.rooms[roomName].find(FIND_MY_STRUCTURES,{filter: (s)=>s.structureType=="tower"}).length>0 &&
            Game.rooms[roomName].find(FIND_MY_STRUCTURES,{filter: (s)=>s.structureType=="tower"})[0].energy< 50)){
            Game.rooms[roomName].controller.activateSafeMode()
            Game.notify("Fierce attack!! Activating safe mode! "+roomName)
                
            }
    }
};

module.exports = defendRoom;
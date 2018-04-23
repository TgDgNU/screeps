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
    
    if (creep.name=="warbot-Spawn4-E9S16-5297478" || creep.name=="warbot-Spawn1-E9S16-5297478"){
        var greenFlag= creep.pos.findClosestByPath(FIND_FLAGS,{filter:(f)=>f.color==COLOR_GREEN}) 
        if (greenFlag) {
            creep.moveTo(greenFlag.pos,{visualizePathStyle: {stroke: '#0000ff'}});
            //return;
        }
    }
    
	if (!hostile) {
		flags=creep.room.find(FIND_FLAGS,{filter: (flag)=> flag.room.name == creep.room.name && flag.color==COLOR_RED}); 
		var destroyTargets=[];
		for (flagId in flags){
			let foundTargets=flags[flagId].pos.lookFor(LOOK_STRUCTURES);
			if (foundTargets.length>0) {
				destroyTargets=destroyTargets.concat(foundTargets)
			}
		}
		if (destroyTargets.length>0) {
			hostile=creep.pos.findClosestByPath(destroyTargets);
		}
	
		//if (hostile && Game.time%10===0) {console.log(creep.name+"- destroy "+hostile.structureType+" - "+hostile.hits);}
	}
    
    if (!hostile) {
        hostile = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
    }

    if (!creep.memory.claim) {
        creep.memory.claim=creep.room.name;
    }
    if (creep.hits==creep.hitsMax){
        _.set(creep.memory,"status","battle");
    }
    
    if (creep.hits<creep.hitsMax*0.6 || _.get(creep.memory,"status")=="flee"){
        creep.say("Run!")
        _.set(creep.memory,"status","flee");
        
        var greenFlag= creep.pos.findClosestByPath(FIND_FLAGS,{filter:(f)=>f.color==COLOR_GREEN}) 
        if (greenFlag) {
            creep.moveTo(greenFlag.pos,{visualizePathStyle: {stroke: '#0000ff'}});
        }
        else{
            creep.moveTo(new RoomPosition(25, 25, Game.spawns[creep.memory.spawnedBy].room.name),{visualizePathStyle: {stroke: '#ffaa00'}})
        }
        if (hostile) {creep.attack(hostile);creep.rangedAttack(hostile)}
    }
    else {
        if (creep.borderPosition()){
            creep.moveTo(25,25,{range:10})
        }
        creep.attack(hostile)
        creep.rangedAttack(hostile)
        var nearestHealer=creep.room.find(FIND_MY_CREEPS,{filter:c=>c.memory.role=="healbot"})
        if (creep.hits<creep.hitsMax && nearestHealer && creep.pos.getRangeTo(nearestHealer)>1){
            creep.moveTo(nearestHealer)
            console.log("Warbot scared and runs to healbot")
        }
        else if (!creep.pos.isNearTo(hostile)){
            
            
            creep.moveTo(hostile, {visualizePathStyle: {stroke: '#ff0000'}});    
            creep.say("Charge")
        }

        flags=creep.room.find(FIND_FLAGS,{filter: (flag)=> flag.room.name == creep.room.name && flag.color==COLOR_RED});
        if (!hostile && creep.memory.claim==creep.room.name && flags.length>0) {
            creep.moveTo(flags[0].pos,{reusePath: 20});
        }
        else if (!hostile && creep.memory.claim) {
                        creep.moveTo(new RoomPosition(25, 25, creep.memory.claim),{reusePath: 20})
        }
    }
    //if (creep.hits<hitsMax && creep.room.find(FIND_MY_CREEPS,{filter: c=> s.memory.role=="healbot"}).length>0 && creep.pos.findInRange(FIND_MY_CREEPS,1,{filter: c=> s.memory.role=="healbot"}).length==0){
    //    creep.moveTo(greenFlag.pos,{visualizePathStyle: {stroke: '#0000ff'}});
    //    creep.pos.findClosestByPath(FIND_MY_CREEPS,{filter: c=> s.memory.role=="healbot"})
    //    }
    //}
}

function heal_and_stack(creep) {
    
    creep.healPower=_.sum(creep.body,c=>c.type==HEAL)
    
    //console.log(creep.name+" healpower "+creep.healPower)
    //console.log(creep.name+" healpower "+creep.healPower*HEAL_POWER)
    

    //var comrade = creep.pos.findClosestByPath(FIND_MY_CREEPS,{filter: (creep => creep.hits<creep.hitsMax)});
	var comrade;
    if (!comrade) {
        comrade=creep.pos.findClosestByPath(FIND_MY_CREEPS,{filter: (creep => creep.memory.role=="warbot")});
    }
    

    if ((creep.memory.claim && creep.room.name!=creep.memory.claim || creep.borderPosition()) && creep.hits==creep.hitsMax) {
        creep.moveTo(new RoomPosition(25, 25, creep.memory.claim),{range:20})
    }
    else if (comrade) {
        creep.moveTo(comrade, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
    var spotToFlee=null;
	//console.log(creep.hitsMax-creep.healPower*HEAL_POWER)
    if (creep.hits<creep.hitsMax-creep.healPower*HEAL_POWER*3+_.get(creep,"incomingHeal",0)){
        creep.say("Run!")
        var greenFlag= creep.pos.findClosestByPath(FIND_FLAGS,{filter:(f)=>f.color==COLOR_GREEN}) 
        if (greenFlag) {
            creep.moveTo(greenFlag.pos,{visualizePathStyle: {stroke: '#0000ff'}});
        }
        else{
            creep.moveTo(new RoomPosition(25, 25, creep.memory.spawnRoom),{visualizePathStyle: {stroke: '#ffaa00'},range:20})
        }
        
        creep.heal(creep);
        _.set(creep,"incomingHeal",_.get(creep,"incomingHeal",0)+creep.healParts*HEAL_POWER)
    }
	// if comrade is injured more that we can heal and not healed enough - we heal him
    else if (comrade && comrade.hitsMax-comrade.hits+_.get(comrade,"incomingHeal",0)>creep.healParts*HEAL_POWER) {
		
        var rangeToComrade=creep.pos.getRangeTo(comrade)
        if(rangeToComrade==1) {
            creep.heal(target);
            _.set(comrade,"incomingHeal",_.get(comrade,"incomingHeal",0)+creep.healParts*HEAL_POWER)
        }
        else if (rangeToComrade<=3){
            creep.rangedHeal(comrade);
            _.set(comrade,"incomingHeal",_.get(comrade,"incomingHeal",0)+creep.healParts*RANGED_HEAL_POWER)
        }
        
    }
    else {
		nearHeal=creep.pos.findInRange(FIND_MY_CREEPS,1,{filter:c=>c.hitsMax-c.hits+_.get(c,"incomingHeal",0)>creep.healParts*HEAL_POWER}).
			sort((c1,c2)=>(c2.hitsMax-c2.hits+_.get(c2,"incomingHeal",0))-(c1.hitsMax-c1.hits+_.get(c1,"incomingHeal",0)))
		if (nearHeal.length>0){
		    creep.say("n "+nearHeal[0].name)
			creep.heal(nearHeal[0])
			_.set(nearHeal[0],"incomingHeal",_.get(nearHeal[0],"incomingHeal",0)+creep.healParts*HEAL_POWER)
		}
		else{
		
			farHeal=creep.pos.findInRange(FIND_MY_CREEPS,3,{filter:c=>c.hits<c.hitsMax+_.get(c,"incomingHeal",0)}).
				sort((c1,c2)=>(c2.hitsMax-c2.hits+_.get(c2,"incomingHeal",0))-(c1.hitsMax-c1.hits+_.get(c1,"incomingHeal",0)))
			if (farHeal.length>0){
				creep.rangedHeal(farHeal[0])
				_.set(farHeal[0],"incomingHeal",_.get(farHeal[0],"incomingHeal",0)+creep.healParts*RANGED_HEAL_POWER)
			}
			else {
			creep.heal(creep)
			_.set(creep,"incomingHeal",_.get(creep,"incomingHeal",0)+creep.healParts*HEAL_POWER)
			injured=creep.pos.findClosestByPath(FIND_MY_CREEPS,{filter: (creep => creep.hits<creep.hitsMax*0.8)});
				if (injured){
					creep.moveTo(injured)
				}
			}
        }
    }

    
}

var defendRoom = {
    run: function defendRoom(roomName) {
        
        var towerRange=50;

        var warbots = Game.rooms[roomName].find(
                FIND_MY_CREEPS, {filter: (s) => s.memory.role =="warbot"});
            warbots.forEach(warbot => search_and_destroy(warbot));
            
        var rangedbots = Game.rooms[roomName].find(
                FIND_MY_CREEPS, {filter: (s) => s.memory.role =="rangedDefender"});
            rangedbots.forEach(rangedbot => rangedbot.defendRoom());
            
        var healbots = Game.rooms[roomName].find(
                FIND_MY_CREEPS, {filter: (s) => s.memory.role =="healbot"});
            healbots.forEach(healbot => heal_and_stack(healbot));
            
        var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
        
        var towers = Game.rooms[roomName].find(
                FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        if (hostiles.length==0){
            towers.filter(t=>t.energy>500).forEach(tower => tower.heal(Game.rooms[roomName].find(FIND_MY_CREEPS,{filter: (c) => c.hits < c.hitsMax})[0]));
            towers.filter(t=>t.energy>500).forEach(tower => tower.repair(Game.rooms[roomName].find(FIND_MY_STRUCTURES,{filter: (c) => c.hits<c.hitsMax && c.hits < 1000})[0]));
        }
        //towers.forEach(tower => tower.repair(Game.rooms[roomName].find(FIND_MY_STRUCTURES,{filter: (c) => c.hits < c.hitsMax && c.hits<1000})[2]));
        if(hostiles.length > 0) {
            //console.log("Creating warbot "+Game.spawns['Spawn1'].spawnCreep( [TOUGH,TOUGH,TOUGH,MOVE,MOVE,ATTACK, ATTACK, ATTACK, MOVE], 'WarBot' + Game.time,{ memory: { role: 'war',claim:roomName } } ));
            
            var username = hostiles[0].owner.username;
			if (username!="Invader" && hostiles.length!=1){
				Game.notify(`User ${username} spotted in room ${roomName} number ${hostiles.length}`);
			}

            towers.forEach(tower => tower.attack(Game.rooms[roomName].find(FIND_HOSTILE_CREEPS,
                {filter: (c) => (tower.pos.getRangeTo(c.pos)<towerRange || c.hits<c.hitsMax)})[0]));
                //{filter: (c) => tower.pos.getRangeTo(c.pos)<13 || c.hits<c.hitsMax*2/3})));
            
            var warbots = Game.rooms[roomName].find(
                FIND_MY_CREEPS, {filter: (s) => s.memory.role =="warbot"});
            warbots.forEach(warbot => search_and_destroy(warbot));
        }
        try{
        if(hostiles.length > 15 ||
            (Game.rooms[roomName].find(FIND_MY_STRUCTURES,{filter: (s)=>s.structureType=="spawn"}).length>0 && 
             Game.rooms[roomName].find(FIND_MY_STRUCTURES,{filter: (s)=>s.structureType=="spawn"})[0].hits <4000) ){
            Game.rooms[roomName].controller.activateSafeMode()
            Game.notify("Fierce attack!! Activating safe mode! "+roomName)
                //(Game.rooms[roomName].find(FIND_MY_STRUCTURES,{filter: (s)=>s.structureType=="tower"}).length>0 &&
            //Game.rooms[roomName].find(FIND_MY_STRUCTURES,{filter: (s)=>s.structureType=="tower"})[0].energy< 50)
            }
        }
        catch(err)  {}
    }
};

module.exports = defendRoom;
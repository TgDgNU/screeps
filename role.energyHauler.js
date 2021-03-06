var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var findEnergy = require('function.findEnergy');
var findEnergyFromMemory = require('function.findEnergyFromMemory');

var roleEnergyHauler = {
    run: function(creep) {
        
        var base=Game.rooms[creep.memory.baseRoom].base
        if (!creep.memory.store_to) {
            creep.memory.store_to=creep.memory.baseRoom
        }
        
        
        if ('energy_source' in creep.memory) {
            energy_source = creep.memory['energy_source'];
        }
        else{
            energy_source =0;
        }
        if( creep.carry.energy > creep.carryCapacity*0.5) {
            creep.memory.working=true;
            creep.memory.energySourceId=null;
        }
        
        //creep.memory.tasks=[]
        if (creep.memory.tasks.length!=0){
            console.log("Creep "+creep.name+" working on task")
            creep.executeTask()
            return
        }
        
        if (!creep.memory.working && (creep.name=="energyHauler-Spawn8-E5S18-5336151" || creep.name=="energyHauler-Spawn3-E4S17-5334849"|| creep.name=="energyHauler-Spawn3-E3S16-5335119")) {
            console.log("creep lf task "+creep.name)
            base.taskManager.findTask(creep)
        }
        

        if (!creep.memory.working && creep.memory.claim && creep.room.name!=creep.memory.claim && !creep.memory.energySourceId){
            creep.say("Rharvest!")
            creep.moveTo(new RoomPosition(25, 20, creep.memory.claim),{reusePath: 30});
        }
        else if (!creep.memory.working){
            if (creep.memory.energySourceId || findEnergyFromMemory.run(creep)){
                result=creep.getEnergy(Game.getObjectById(creep.memory.energySourceId))
                if ( result== ERR_NOT_IN_RANGE){
                    creep.moveTo(Game.getObjectById(creep.memory.energySourceId),{visualizePathStyle: {stroke: '#00ff00'},reusePath: 30})
                }
                else if (result == ERR_INVALID_TARGET || result == ERR_NOT_ENOUGH_RESOURCES){
                    creep.memory.energySourceId=null
                }
            }
            else{
                   findEnergy.run(creep)
            }

            //creep.say("Energy!");

        }
        else if (creep.memory.working && creep.room.name!=creep.memory.store_to){
            creep.say("To "+creep.memory.store_to)
            creep.moveTo(new RoomPosition(25, 20, creep.memory.store_to),{reusePath: 20});
            bTarget=creep.pos.findInRange(FIND_STRUCTURES,3,{filter: (s) => s.hits < s.hitsMax});
            if (bTarget.length>0){
                creep.repair(bTarget[0]);
            }
            else{
                bTarget=creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                if (bTarget){
                    creep.build(bTarget);
                }
            }
        }
        else {
            
            
            let temp=creep.getHaulTarget();
            
            
            if (temp){
                creep.say(temp.id)
                creep.memory["haulTo"]=temp.id
                if (!(creep.pos.isNearTo(temp))){
                    creep.moveTo(temp,{reusePath: 20,range:1})
                }
                else{
                    creep.transfer(temp,RESOURCE_ENERGY)
                    creep.say("Transfer!")
                    creep.memory["haulTo"]=""
                }
            }
            else {
                //creep.drop(RESOURCE_ENERGY)
                console.log("<font color=red>"+creep.name+" wants to drop energy - nowhere to haul - tries "+_.get(creep.memory,"intentToDropEnergy",0)+"</font>")
                //Game.notify(creep.name+" wants to drop energy - nowhere to haul")
                //console.log(creep.room.name)
                //console.log(creep.memory["haulTo"])
                //console.log(temp)
                _.set(creep.memory,"intentToDropEnergy",_.get(creep.memory,"intentToDropEnergy",0)+1)
                if (_.get(creep.memory,"intentToDropEnergy",0)>20){
                    creep.drop(RESOURCE_ENERGY)
                    _.set(creep.memory,"intentToDropEnergy",0)
                    console.log("<font color=red>"+creep.name+" dropped energy - nowhere to haul</font>")
                    Game.notify("<font color=red>"+creep.name+" dropped energy - nowhere to haul</font>")
                }
                // for debug
                //creep.getHaulTarget(true)
                //creep.memory["haulTo"]=""
            }
 
        }
        
        // if out of energy > go gather some
        if( creep.carry.energy == 0) {
            creep.memory.working=false;

        }

    }
};

module.exports = roleEnergyHauler;
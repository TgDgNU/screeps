var TaskManager=require('prototype.taskManager');
module.exports = Base;

function Base(director,roomName){
		this.director=director
        this.name=roomName
        this.baseRoom=Game.rooms[roomName]
        this.baseRoom.base=this
        this.memory=_.get(Memory,"bases."+this.name,{})
		
        this.terminal=Game.getObjectById(_.keys(_.get(this.memory,"database.energy.terminal",{null:null}))[0])
        this.storage=Game.getObjectById(_.keys(_.get(this.memory,"database.energy.storage",{null:null}))[0])
        this.links=_.keys(_.get(this.memory,"database.energy.links",{null:null})).map(id=>Game.getObjectById(id))

		
		// temp reactions
		var REACTIONS={"LO":["L","O"],"UH":["U","H"],"OH":["O","H"],"ZK":["Z","K"]}
		
		// temp
		if (this.name=="E8S18"){
			_.set(this.memory,"database.minerals.brew","LO")
			
			this.memory.runLabReaction=true
			
			this.baseRoom.updateDatabaseLabs()
		}
		
		if (this.name=="E7S18"){
			_.set(this.memory,"database.minerals.brew","UH")
			
			this.memory.runLabReaction=true
			
			this.baseRoom.updateDatabaseLabs()
		}
		
		if (this.name=="E2S19"){
			_.set(this.memory,"database.minerals.brew","OH")
			
			this.memory.runLabReaction=true
			
			this.baseRoom.updateDatabaseLabs()
		}
		if (this.name=="E3S17"){
			_.set(this.memory,"database.minerals.brew","ZK")
			this.memory.runLabReaction=true
			this.baseRoom.updateDatabaseLabs()
		}
		
		// need to change to reactionCooldown
		_.set(this.memory,"oneTimeFlag",false)
		if (this.memory.runLabReaction && Game.time%10==0 && !(_.get(this.memory,"oneTimeFlag"))){
			
			_.set(this.memory,"oneTimeFlag",true)
			//console.log("onetimeflag -> true")
			
			this.firstLab=Game.getObjectById(_.keys(_.get(this.memory,"database.minerals.firstLab",{null:null}))[0])
			//console.log(JSON.stringify(this.firstLab.id))
			console.log("fistLab "+this.firstLab.mineralAmount+" "+this.firstLab.mineralType)
			this.secondLab=Game.getObjectById(_.keys(_.get(this.memory,"database.minerals.secondLab",{null:null}))[0])
			console.log("secondLab "+this.secondLab.mineralAmount+" "+this.secondLab.mineralType)
			//console.log(JSON.stringify(this.secondLab.id))
			this.labs=_.keys(_.get(this.memory,"database.minerals.labs",{null:null})).map(id=>Game.getObjectById(id))
			

			this.brew=_.get(this.memory,"database.minerals.brew","")
			
			for (let mineral of REACTIONS[_.get(this.memory,"database.minerals.brew")]){
				if ((!(mineral in this.terminal.store) || this.terminal.store[mineral]<4200) && (!(this.brew in  this.storage.store) || this.storage.store[this.brew]<10000)) {
					for (terminal of _.filter(Game.structures,s=>s.structureType=="terminal" && s.store[mineral]>30000)) {
						terminal.send(mineral,1000,this.name);
						console.log("Send 1000 "+mineral+" from "+terminal.room.name+" to "+this.name);
						Game.notify("Send 1000 "+mineral+" from "+terminal.room.name+" to "+this.name)
					}
				}
			}

			
			
			// check labs
			if (Game.time%100==0){
				for (labN in [this.firstLab,this.secondLab]){
					lab=[this.firstLab,this.secondLab][labN]
					if (lab.mineralAmount<500){
						// create task and assisn to hauler
						// temp
						
						 creep=this.baseRoom.find(FIND_MY_CREEPS,{filter:c=>c.memory.role=="harvester" && c.ticksToLive>200})[0];
						 if (creep){
						     
    						 creep.memory.tasks.push({"type":"haulTo",target:this.storage.id}); 
    						 creep.memory.tasks.push({"type":"haulFrom",target:creep.room.find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_TERMINAL})[0].id,
    							options:{resourceType:REACTIONS[_.get(this.memory,"database.minerals.brew")][labN]}});
    						 creep.memory.tasks.push({"type":"haulTo",target:lab.id,options:{resourceType:REACTIONS[_.get(this.memory,"database.minerals.brew")][labN]}}); 
    						 console.log(creep.name +" hauling "+REACTIONS[_.get(this.memory,"database.minerals.brew")])
    						 console.log(JSON.stringify(creep.memory.tasks))
						 }
					}
					
				}
			}
			if (this.firstLab.mineralAmount>0 && this.secondLab.mineralAmount>0){
				for (let lab of this.labs){
					if (lab.cooldown==0){
						result=lab.runReaction(this.firstLab,this.secondLab)
						//console.log(lab.id+" "+result)
					}
					if ((Game.time+100)%200==0){
					    console.log()
						if (lab.mineralAmount>1000){
						     creep=this.baseRoom.find(FIND_MY_CREEPS,{filter:c=>c.memory.role=="harvester"})[1];
							 creep.memory.tasks.push({"type":"haulTo",target:this.storage.id}); 
							 creep.memory.tasks.push({"type":"haulFrom",target:lab.id,options:{resourceType:lab.mineralType}});
							 creep.memory.tasks.push({"type":"haulTo",target:this.storage.id,options:{resourceType:lab.mineralType}}); 
							 console.log(creep.name +" hauling "+REACTIONS[_.get(this.memory,"database.minerals.brew")])
							 console.log(JSON.stringify(creep.memory.tasks))
						}
					}
				}
			}
			console.log(this.name+" labs produced "+this.labs[0].mineralAmount)
			
			// if no minerals in labs -> check storage and terminal 
			
			// if no minerals in base -> get them from another base
			
			// Add tasks to haul minerals from terminal/storage
		}
			
		
		
		
		
        this.totalEnergy=_(this.baseRoom.find(FIND_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_TERMINAL || s.structureType==STRUCTURE_STORAGE || s.structureType==STRUCTURE_CONTAINER})).
        sum(s=>s.store.energy)

		

		
        //console.log((this.links))
		
		
        
        
        // temp - add colonies from Spawn mem
        this.updateColonies()
        
        this.processColonies()
        
        // nothing
        this.processSpawn()
        
        this.taskManager=new TaskManager(this)
        
            
            if (Game.time%100==0 && this.baseRoom.find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_STORAGE}).length>0 &&_.sum(this.baseRoom.find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_STORAGE})[0].store)>960000){
                console.log("store overhaul "+this.name)
                this.taskManager.emptyStore() 
            }


		
		
		
		
        for (colonyName in this.memory.colonies){
            if (Game.rooms[colonyName]){
                Game.rooms[colonyName].updateDatabaseEnergy()
            }
        }


       
        
        
        _.set(Memory,"bases."+this.name,this.memory)
    }


Base.prototype.processColonies=function(){
    for (colonyName in this.memory.colonies){
        if (colonyName in Game.rooms){
            _.set(Game,"rooms."+colonyName+".base",this)
        }
    }
}


Base.prototype.updateColonies=function(){
        for (spawn of this.baseRoom.find(FIND_MY_STRUCTURES,{filter:{structureType:STRUCTURE_SPAWN}})){
            for (rName in _.get(spawn,"memory.claim",{})){
                _.set(this.memory,"colonies."+rName,{type:"remoteMine"})
            }
        }
}


Base.prototype.processSpawn=function(){
        const basicRoomLayout={"harvester":2,"upgrader":2,"builder":1,"miner":1};
        const noEnergySourceRoles=["claimer","builder","mineralHarvester","warbot","healbot","wallRepair","rangedDefender","upgrader"];
        for (spawn of this.baseRoom.find(FIND_MY_STRUCTURES,{filter:s=>s.structureType==STRUCTURE_SPAWN && !s.spawning})){
            //spawn needed creeps
        }
}



Creep.prototype.executeTask = function () {
    
    var taskArr=this.memory.tasks
    if (taskArr.length==0){
        // do smth mundane
        return false
    }
    else {
        var task=taskArr[0]
    }
    //console.log("prototype"+JSON.stringify(task))
    switch (task["type"]){
        case "haulFrom":
            var target=Game.getObjectById(task["target"])
            //console.log("executing haulFrom in prototype.creep")
            if (target){
                if (!this.pos.isNearTo(target)){
                    this.moveTo(target)
                }
                else {
                    var result
                    if (_.get(task,"options.resourceType")){
                        result=this.withdraw(target, task["options"]["resourceType"])
                    }
                    else {
                        result=this.withdraw(target, RESOURCE_ENERGY)
                    }
                    if (result==0 && _.get(task,"options.recurring")){
                        taskArr.push(taskArr.shift())
                    }
                    else{
                        taskArr.shift()
                    }
                    if (result==0) {
                       // this.taskManager.abandonTask(this,task)
                    }
                    console.log(this.name+" executed task "+result)
                }
            }
            else if (!target && "room" in task["options"]){
                // moveTo room
                this.moveTo(new RoomPosition(25, 25, task["options"]["room"]),{reusePath: 30});
            }
            else {
                console.log("<font color=red> Invalid task for creep "+this.name+ " "+JSON.stringify(task)+". Deleting. </font>")
                taskArr.shift()
            }
            
        break
        case "haulTo":
            if (_.sum(this.carry)==0){
                taskArr.shift()
                break
            }
            var target=Game.getObjectById(task["target"])
            if (target){
                if (!this.pos.isNearTo(target)){
                    this.moveTo(target)
                }
                else {
                    var result
                    if (_.get(task,"options.resourceType")){
                        result=this.transfer(target, task["options"]["resourceType"])
                    }
                    else {
                        for(const resourceType in this.carry) {
                            result=this.transfer(target, resourceType);
                        }
                    }
                    if (_.get(task,"options.recurring")){
                        taskArr.push(taskArr.shift())
                    }
                    else{
                        taskArr.shift()
                    }
                    console.log(this.name+" executed task "+result)
                }
            }
            else if (!target && "room" in task["options"]){
                // moveTo room
                this.moveTo(new RoomPosition(25, 25, task["options"]["room"]),{reusePath: 30});
            }
            else {
                console.log("<font color=red> Invalid task for creep "+this.name+ " "+JSON.stringify(task)+". Deleting. </font>")
                taskArr.shift()
            }
            
        break
        
        
    }
    
    
    
}
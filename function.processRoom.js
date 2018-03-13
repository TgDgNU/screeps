var lib=require('function.libraries');

var processRoom = {
    findEnergy: function (roomName) {

        // Exclude not seen rooms
        if (!(roomName in Game.rooms)) {
            //Game.notify("Error in processRoom "+roomName+" not found");
            return null;
        }

        var room = Game.rooms[roomName];
        var roomEnergyArray = [];

        var dropppedEnergy = room.find(FIND_DROPPED_RESOURCES, {filter: spot => (spot.amount > 0 && spot.resourceType == RESOURCE_ENERGY)})
        for (let id in dropppedEnergy) {
            roomEnergyArray.push(["droppedEnergy", dropppedEnergy[id].amount, dropppedEnergy[id].id])
        }

        var container = room.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store.energy > 0})
        for (let id in container) {
            roomEnergyArray.push(["container", container[id].store.energy, container[id].id])
        }
        var storage = room.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_STORAGE && structure.store.energy > 0})
        for (let id in storage) {
            roomEnergyArray.push(["storage", storage[id].store.energy, storage[id].id])
        }

        return(roomEnergyArray)

    }
}
module.exports = processRoom;
let publicSocket = null;

const configure = function (io) {
    if (!isConfigured())
        publicSocket = io;
};

const isConfigured = function () {
    return publicSocket != null;
};

const createRefreshResponse = function (refresh) {
    return {
        refresh: refresh
    };
};

const emitEvent = function (eventName, body) {
    publicSocket.emit(eventName, body);
};
const notifyPlantsData = function(id,data){
    emitEvent('/topic/plants/'+id,data)
}
const notifyDetailPlants = function(plantsId,data){
    emitEvent('/topic/plants/detail/'+plantsId,data)
}

module.exports = {
    configure,
    notifyPlantsData,
    notifyDetailPlants
}
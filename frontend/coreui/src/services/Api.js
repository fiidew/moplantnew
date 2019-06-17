
const deviceUrl = function(){
    // return 'http://localhost:3000/api/perangkat/'
}
const userUrl = function(){
     // return 'http://159.65.6.122:3000/api/user/'
    return 'http://localhost:3000/api/user/'
}
const tanamanUrl = function(){
     // return 'http://159.65.6.122:3001/api/sapi/'
    return 'http://localhost:3000/api/tanaman/'
}
const weatherUrl = function(){
    // return 'http://159.65.6.122:3001/api/sapi/'
   return 'http://localhost:3000/api/cuaca/'
}
const intelligentUrl = function(){
    //return 'http://159.65.6.122:4000/api/intelligent/'
}
module.exports = {
    deviceUrl,
    userUrl,
    tanamanUrl,
    weatherUrl,
    intelligentUrl
}

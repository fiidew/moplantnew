var notificationRepositories = require('../repositories/notificationRepositories');
var Response = require('../services/Response');
var Token = require('../services/TokenAuthentication');

module.exports = {
    getAllNotification: async (req, res) => {
        let response = new Response()
        try {
            response.setData(await notificationRepositories.getAllNotification())
        } catch (e) {
            response.setStatus(false)
            response.setMessage(e)
        }
        res.json(response)
    },
    create: async(req,res)=>{
        let token = Token.authorizationToken(req.headers);
        
        if(token){
          let response = new Response()
            try {
              response.setData(await notificationRepositories.createNotification(req.body.status,req.body.recommendation))
            } catch (e) {
              response.setStatus(false)
              response.setMessage(e)
            }
            res.json(response) 
        }else{
          res.json(response.unAuthorized());
        }
      },
      updateStatus: async(req,res)=>{
          let token = Token.authorizationToken(req.headers);
          
          if(token){
            let response = new Response()
              try {
                response.setData(await notificationRepositories.updateStatus(req.body.id,req.body.status))
              } catch (e) {
                response.setStatus(false)
                response.setMessage(e)
              }
              res.json(response) 
          }else{
            res.json(response.unAuthorized());
          }
        }
}

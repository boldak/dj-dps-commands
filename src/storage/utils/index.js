var Promise = require("bluebird");

class ReloadORMError extends Error {
  constructor(message) {
    super(message);
    this.name = "ORM reload error";
  }
}

class PermissionException extends Error {
  constructor(message) {
    super(message);
    this.name = "Permission exception: ";
  }
}

let defaultPermissions = {
  create:   {role:["owner", "administrator"]},
  alter:    {role:["owner", "administrator"]},
  drop:     {role:["owner", "administrator"]},
  desc:     {role:["owner", "administrator"]},
  select:   {role:["owner", "administrator"]},
  insert:   {role:["owner", "administrator"]},
  update:   {role:["owner", "administrator"]},
  delete:   {role:["owner", "administrator"]}
};


module.exports = {
	reloadORM: (sails) => new Promise(( resolve, reject ) => {
		try {
            
            // console.log("========> BEFORE ORM RELOAD")
            sails.once("hook:orm:reloaded", () => {
                       // _.forIn(sails.models, (value,key) => {
                       //      // if(util.isObject(value)) value.datastore = undefined;
                       //      console.log(key+" = "+ value.datastore)
                       //  }) 
                      // console.log("========> After ORM RELOAD")
                      resolve();

            })
            sails.hooks.orm.teardown(()=>{
                sails.hooks.orm.configure()
                // console.log("TEARDOWN drop")
                _.forIn(sails.models, (value,key) => {
                    if(util.isObject(value)) value.datastore = undefined;
                    // console.log(key+" = "+ value.datastore)
                })
                sails.hooks.orm.reload();
            })
        } catch (e) {
            reject(new ReloadORMError(e.toString())) 
        }       
	}),

  access: (client, identity, operation) => new Promise((resolve, reject) => {
     
      Entities
        .findOne({identity:identity})
        .then( (res) => {
          if(!res) {
            reject(new PermissionException(`Entity '${identity}' is undefined`))
            return
          }
          let owner = res.owner;
          let permissions = res.permissions[operation];
          let roles = ["any"];
          if(client.user.isAdmin) roles.push('administarator')
          if(client.user.isCollaborator) roles.push('collaborator')
          if(client.user.isOwner) roles.push('author')
          if(client.user.id == owner.user.id) roles.push('owner')
            
          
          let app = client.app;
          if(!permissions || (!permissions.role && !permissions.app) ){
            resolve();
            return
          } else if (permissions && permissions.role && !permissions.app){
            if(_.intersection(permissions.role, roles).length > 0){
              resolve()  
            } else { 
              reject(new PermissionException(`${operation} is not available for entity '${identity}' 
(client: ${JSON.stringify(client)})`))
            }
            return
          } else if (permissions && !permissions.role && permissions.app){
            if( permissions.app.indexOf(app) >= 0 ){
              resolve()  
            } else { 
              reject(new PermissionException(`${operation} is not available for entity '${identity}'
(client: ${JSON.stringify(client)})`))
            }
            return
          } else if (permissions && permissions.role && permissions.app){
            if((_.intersection(permissions.role, roles).length > 0) && (permissions.app.indexOf(app) >= 0 )){
              resolve();
            } else {
              reject(new PermissionException(`${operation} is not available for entity '${identity}'
(client: ${JSON.stringify(client)})`))
            }
            return
          }
          reject(new PermissionException(`${operation} is not available for entity '${identity}'
(client: ${JSON.stringify(client)})`))             
        })
        .catch((e) => { reject(new PermissionException(e.toString()))})
  }),

accessIsAvailable: (client, identity, operation) => new Promise((resolve, reject) => {
      Entities
        .findOne({identity:identity})
        .then( (res) => {
          if(!res) {
            reject(new PermissionException(`Entity '${identity}' is undefined`))
            return
          }

          // console.log(res)
          let owner = res.owner;
          let permissions = (res.permissions) ? res.permissions[operation] : defaultPermissions
          let roles = [];
          if(client.user.isAdmin) roles.push('administarator')
          if(client.user.isCollaborator) roles.push('collaborator')
          if(client.user.isOwner) roles.push('author')
          if(client.user.id == owner.user.id) roles.push('owner')
          let app = client.app;
          if(!permissions || (!permissions.role && !permissions.app) ){
            resolve(true);
            return
          } else if (permissions && permissions.role && !permissions.app){
              resolve(_.intersection(permissions.role, roles).length > 0)  
              return
          } else if (permissions && !permissions.role && permissions.app){
              resolve(permissions.app.indexOf(app) >= 0)  
            return
          } else if (permissions && permissions.role && permissions.app){
              resolve((_.intersection(permissions.role, roles).length > 0) && (permissions.app.indexOf(app) >= 0 ));
            return
          }
          resolve(false)
        })
        .catch((e) => { reject(new PermissionException(e.toString()))})
  }),

  normalizePermissions: (permissions) => {
    permissions = permissions || {};
    _.forIn(defaultPermissions, (value,key) => { if(!permissions[key]) permissions[key] = value })
    return permissions;
  },

  extendPermissions: (identity, newValue) => new Promise((resolve, reject) =>{
    
    Entities
        .findOne({identity:identity})
        .then( (res) => {
          
          if(!res) {
            reject(new PermissionException(`Entity '${identity}' is undefined`))
            return
          }
          _.extend(res.permissions,newValue)
          
          Entities
            .update({identity:identity},res)
            .then( updated => {
             
              resolve(updated)
            })
            .catch( e => { reject(new PermissionException(e.toString()))})
        })
        .catch( e => { reject(new PermissionException(e.toString()))})  
  })

}
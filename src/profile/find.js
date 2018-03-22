
var Promise = require("bluebird");
var http = require('request-promise');
var gravatar = require('gravatar-api');

class ProfileFindImplError extends Error {
    constructor(message) {
        super(message);
        this.name = "profile.find error";
    }
}


let getUrl = function(url) {
    
    return new Promise(function(resolve, reject) {
        var options = {
            method: 'GET',
            headers: {
                'User-Agent': 'Request-Promise'
            },
            uri: url,
            json: true
        }
        
        http(options)
            .then(function(result) {
                resolve(result)
            })
            .catch(function(e) {
                reject(new ProfileFindImplError(url+" > "+e.toString()))
            })
    })
}

let getGravatarProfile = (email) => {
	let options = {
	    email: email,
	    type: 'json',  
	    secure: false
	}
    return new Promise((resolve, reject) => {
        getUrl(gravatar.getProfileUrl(options))
        .then(res => {
            resolve( {
                type: "gravatar",
                profile: {
                    name: res.entry[0].displayName,
                    photo: res.entry[0].thumbnailUrl
                }
            })
        })
        .catch(e => {
            console.log(gravatar.getProfileUrl(options) + ' > ' + e.toString())
            resolve({type:"gravatar"})
        })    
    })
	
}

let getGoogleProfile = (email) => {
	const googleAvatarApi = 'https://picasaweb.google.com/data/entry/api/user/'
    const avatarUrl = googleAvatarApi + email + '?alt=json'
    return new Promise((resolve, reject) => {
        getUrl(avatarUrl)
        .then(res => {
            let profile = {
                name:res.entry.gphoto$nickname.$t,
                photo:res.entry.gphoto$thumbnail.$t
            }
            resolve({
                type: "google",
                profile: profile
            })
        })
        .catch(e => {
            console.log(avatarUrl+' > '+e.toString())
            resolve({type:"google"})
        })   
	})
}






module.exports = {
    name: "profile.find",
    synonims: {
        "profile.find": "profile.find"
    },


    "internal aliases": {
        
    },

    defaultProperty: {
        "profile.find": "email"
    },

    execute: function(command, state, config) {
    	
    	
        if (!command.settings.email)
            throw new ProfileFindImplError("Cannot find profile without email")
        return new Promise((resolve, reject) => {
            Promise.all([
                getGoogleProfile(command.settings.email),
                getGravatarProfile(command.settings.email)
            ])
            .then(res => {
                let profile = (res[0] && res[0].profile)
                                ?  res[0]
                                : (res[1] && res[1].profile)
                                    ? res[1]
                                    : {type:"none"}

                state.head = {
                    data: profile,
                    type: "json"
                }
                resolve(state);
            })
            .catch( e => {reject (new ProfileFindImplError(e.toString()))})
        })
                    
    },

    help: {
        synopsis: "Call from server",
        name: {
            "default": "call",
            synonims: []
        },
        input: ["any"],
        output: "type of variable",
        "default param": "path",
        params: [{
            name: "path",
            synopsis: "Json path to selected value (optional). If 'value' is not assigned then storage will be restored.",
            type: ["json-path"],
            synonims: ["path", "extension", "ext"],
            "default value": "$"
        }],
        example: {
            description: "Inspect variables",
            code: "<?json \r\n    \"Hello\" \r\n?>\r\nset(\"str\")\r\n\r\n<?javascript \r\n    var notNull = function(item){\r\n        return item != undefined\r\n        \r\n    }; \r\n?>\r\nset(\"functions\")\r\n\r\nload(\r\n    ds:\"47611d63-b230-11e6-8a1a-0f91ca29d77e_2016_02\", \r\n    as:'json'\r\n)\r\n\r\nselect(\"$.metadata.dataset.commit\")\r\n\r\nset(var:\"commitNote\", val:\"$[0].note\")\r\nget(\"str\")\r\ninfo()\r\nget(\"functions.notNull\")\r\ninfo()\r\nget(\"commitNote\")\r\ninfo()\r\n// equals for previus\r\nget(\"$.commitNote\")\r\ninfo()\r\nlog()\r\n"

        }

    }
}

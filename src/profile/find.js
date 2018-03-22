
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
            uri: url
        }
        
        http(options)
            .then(function(result) {
                console.log("resolve call "+ JSON.stringify(result))
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
	    type: 'json', // Default: json, 
	                  // Available Types: 'json', 'xml', 'qr', 'php', 'vcf' 
	    //parameters: {'callback': 'doSomething' }, //optional 
	    secure: true
	}
	return getUrl(gravatar.getProfileUrl(options)).then(res => {
		return {
			type: "gravatar",
			profile: res
		}
	})
}

let getGoogleProfile = (email) => {
	const googleAvatarApi = 'https://picasaweb.google.com/data/entry/api/user/'
    const avatarUrl = googleAvatarApi + email + '?alt=json'

	return getUrl(avatarUrl).then(res => {
		return {
			type: "google",
			profile: res
		}
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
        
        Promise.any([
        	getGravatarProfile(command.settings.email),
        	getGoogleProfile(command.settings.email)
        ])
        .then(res => {
        	state.head = {
                data: res,
                type: "json"
            }
        	return state;
        })
        .catch( e => new ProfileFindImplError(e.toString()))        
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

const Promise = require('bluebird');
const _ = require('lodash-node');
const nodemailer = require('nodemailer');


class SendMailImplError extends Error {
  constructor(message) {
    super(message);
    this.name = "ddl.alter error";
  }
}









module.exports =  {
    name: "sendmail",
    synonims: {
        "sendmail": "sendmail"
    },
    
    defaultProperty: {
    	 "sendmail": "options"
    },

    execute: function(command, state) {
        return new Promise(function(resolve, reject) {
            state.locale = (state.locale) ? state.locale : "en";
            command.settings.locale = state.locale;
            command.settings.script = state.instance.script();

            let transporter = nodemailer.createTransport({
			 service: 'gmail',
			 auth: {
			        user: 'wdc.kpi.team@gmail.com',
			        pass: 'worlddatacenter'
			    }
			});

// https://myaccount.google.com/lesssecureapps   turn switch on if need

            let mailOptions = command.settings.options
   //          {
			//   from: 'sender@email.com', // sender address from wdc.kpi.team
			//   to: 'to@email.com', // list of receivers
			//   subject: 'Subject of your email', // Subject line
			//   html: '<p>Your html here</p>'// plain text body
			// };

			Promise.promisifyAll(transporter)
				.sendMail(mailOptions)
				.then((info) => {
					state.head = {
	                        type: "json",
	                        data: info
	                    }
	            	resolve(state)	
				})
				.catch((e) => {reject(new SendMailImplError(e.toString()))})
        })
    },

    help: {
        synopsis: "Save context into cache",
        name: {
            "default": "cache",
            synonims: ["cache","save"]
        },
        "default param": "none",
        params: [],
        example: {
            description: "Save context into cache",
            code: "load(\n    ds:'47611d63-b230-11e6-8a1a-0f91ca29d77e_2016_02',\n    as:'json'\n)\nselect('$.metadata')\nextend()\ntranslate()\ncache()\nselect(\"$.data_id\")\n"
        }

    }
} 


'use strict';


var env = require('./.env.json');

var AirtableIntegration = require('./actions-airtable.js');
var MailchimpIntegration = require('./actions-mailchimp.js');
var IntegrationPipeline = require('./actions-pipeline.js');
var Log = require('./actions-log.js');

var airtable = new AirtableIntegration( env.airtable.endpoint, env.airtable.base, env.airtable.key );
var mailchimp = new MailchimpIntegration( env.mailchimp.endpoint, env.mailchimp.list, env.mailchimp.key );
var log = new Log( 4 );
var pipeline = new IntegrationPipeline( airtable, mailchimp, log );

pipeline.run( function( err, results ) {

    if ( err ) { log.error( err.message, 0 ); }

    log.integration('Done.', 1);

})

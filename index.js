'use strict';

var env = require('./.env.json');

var AirtableIntegration = require('./actions-airtable.js');
var MailchimpIntegration = require('./actions-mailchimp.js');
var IntegrationPipeline = require('./actions-pipeline.js');
var Log = require('./actions-log.js');
var Scheduler = require('./actions-schedule.js');

var airtable = new AirtableIntegration( env.airtable.endpoint, env.airtable.base, env.airtable.key );
var mailchimp = new MailchimpIntegration( env.mailchimp.endpoint, env.mailchimp.list, env.mailchimp.key );
var log = new Log( 4 );
var pipeline = new IntegrationPipeline( airtable, mailchimp, log );
var scheduler = new Scheduler();

scheduler.linearSequence( 2, function( done ) {

    log.integration('Started.', 1);

    pipeline.run( function( err, results ) {

        if ( err ) { log.error( err.message, 0 ); }

        log.integration('Finished.', 1);

        done();

    });

});

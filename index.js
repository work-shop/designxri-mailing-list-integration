'use strict';

var env = require('./.env.json');
var pkg = require('./package.json');

var AirtableIntegration = require('./actions-airtable.js');
var MailchimpIntegration = require('./actions-mailchimp.js');
var IntegrationPipeline = require('./actions-pipeline.js');
var Log = require('./actions-log.js');
var Scheduler = require('./actions-schedule.js');

const log_level = process.env.LOG_LEVEL || 1;


var log = new Log( log_level );
var airtable = new AirtableIntegration( env.airtable.endpoint, env.airtable.base, env.airtable.key, pkg );
var mailchimp = new MailchimpIntegration( env.mailchimp.endpoint, env.mailchimp.list, env.mailchimp.key, pkg );
var pipeline = new IntegrationPipeline( airtable, mailchimp, log );
var scheduler = new Scheduler();

scheduler.linearSequence( pkg.interval, function( done ) {

    log.integration('Started.', 1);

    pipeline.run( function( err, results ) {

        if ( err ) { log.error( err.message, 0 ); }

        log.integration('Finished.', 1);

        //done();

    });

});

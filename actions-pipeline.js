'use strict';

var async = require('async');

function convertToLoggedBoolean( value ) {
    return ( value ) ? 'Yes'.green : 'No'.red;
}

function IntegrationPipeline( airtable, mailchimp, log ) {
    if ( !(this instanceof IntegrationPipeline)) { return new IntegrationPipeline( airtable, mailchimp ); }
    var self = this;

    self.airtable = airtable;
    self.mailchimp = mailchimp;
    self.log = log;

}

/**
 * Given a paired list of airtable records and mailchimp search results,
 *
 * NOTE: The Airtable API DOES NOT expose record modification times, nor does
 * It expose record modification history. This makes it effectively impossible
 * to tell when the record was updated, and this makes it impossible to tell
 * whether the Mailchimp or Airtable version of a record is the more recent
 * subscriber information.
 *
 * This means unsubscribes coming from the Mailchimp List is
 */
IntegrationPipeline.prototype.selectAction = function( list, next = function() {}) {

    var integration = this;

    async.map( list, function( pair, callback ) {

        integration.log.integration('Determining action for record with current email address: ' + pair.record.get('Email'), 1 );

        pair.subscribed = integration.airtable.isActiveInList( pair );
        pair.exists = integration.mailchimp.hasPreviousRecord( pair );

        integration.log.integration('Record is subscribed = ' + convertToLoggedBoolean( pair.subscribed ) + '; Record exists in mailchimp = ' + convertToLoggedBoolean( pair.exists ), 3 );

        callback( null, pair );

    }, function( err, results ) {

        if ( err ) { next( err ); }

        integration.log.mailchimp( 'Preparing batches.', 1 );

        integration.mailchimp.updateSubscriberSet( results, function( err, result ) {

            integration.log.mailchimp('Batch completed.', 1);

            next( err, result );

        });

    });

};

/**
 * this routine pairs up the airtable change-set with the associated
 * Mailchimp search results for the given airtable record.
 *
 * @param continuation
 */
IntegrationPipeline.prototype.pairRecords = function( next = function() {} ) {

    var integration = this;

    integration.airtable.getChangeSet( function( err, set ) {

        integration.log.airtable('Retreived a set of ' + set.length + ' record(s).', 1 );

        integration.mailchimp.getMatchingSubscribers( set, function( err, list ) {

            integration.log.mailchimp('Searched for ' + set.length + ' record(s) by email address.', 1 );

            next( err, list );

        });

    });

};



IntegrationPipeline.prototype.synchronizeRecords = function( pairs, next = function() {} ) {

    var integration = this;

    integration.airtable.synchronizeRecords( pairs );

};


module.exports = IntegrationPipeline;

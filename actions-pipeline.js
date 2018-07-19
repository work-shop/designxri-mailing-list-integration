'use strict';

var async = require('async');


/**
 * A utility method for pretty printing a boolean value
 *
 * @param value bool the boolean to pretty print.
 */
function convertToLoggedBoolean( value ) { return ( value ) ? 'Yes'.green : 'No'.red; }

/**
 * this class is responsible for orchestrating processing
 * between mailchimp and airtable, and logging progress as
 * it occurs.
 *
 * @param airtable AirtableIntegration an airtable integration instance to use.
 * @param mailchimp MailchimpIntegration a mailchimp integration instance to use.
 * @param log Log a logging class to use for printing.
 */
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
 * This means unsubscribes coming from the Mailchimp List is handled by a
 * Zapier integration which listens for the unsubscribe event, and updates the corresponding
 * record (any records corresponding the mailchimp email and names) in Airtable.
 *
 * @param list Array<AirtableRecord> A list of airtable records for processing.
 * @param next a continuation to pass control to.
 *             follows node style (err, next) => Ø pattern.
 */
IntegrationPipeline.prototype.selectAction = function( list, next = function() {}) {

    var integration = this;

    async.map( list, function( pair, callback ) {

        integration.log.integration('Determining action for record with current email address: ' + pair.record.get('Email'), 1 );

        pair.subscribed = integration.airtable.isActiveInList( pair );
        pair.exists = integration.mailchimp.hasPreviousRecord( pair );

        integration.log.integration('subscribed = ' + convertToLoggedBoolean( pair.subscribed ) + '; In Mailing List = ' + convertToLoggedBoolean( pair.exists ), 3 );

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
 * This routine pairs up the airtable change-set with the associated
 * Mailchimp search results for the given airtable record. It does this
 * by searching for Mailchimp Record exact matches to given email addresses.
 *
 * NOTE: These queries a batched, for volume. This means this request can
 * take a little while.
 *
 * @param next a continuation to pass control to.
 *             follows node style (err, next) => Ø pattern.
 */
IntegrationPipeline.prototype.pairRecords = function( next = function() {} ) {

    var integration = this;

    integration.airtable.getChangeSet( function( err, set ) {

        integration.log.airtable('Retreived a set of ' + set.length + ' record(s).', 1 );

        integration.log.mailchimp('Preparing ' + set.length + ' batch(es).', 1 );

        integration.mailchimp.getMatchingSubscribers( set, function( err, list ) {

            integration.log.mailchimp('Searched for ' + list.length + ' record(s) by email address.', 1 );

            next( err, list );

        });

    });

};


/**
 * We keep our lists in synch by using a differential strategy. We track the Email and
 * Mailing List Status fields in at time t and t-1. When the states at time t and t-1
 * do not match, we consider that some change has happened in airtable, and we post
 * an update to Mailchimp.
 *
 * After that, we know the records are in sync, so we need to set email( t + 1 ) = email( t ),
 * and in-list( t + 1 ) = in-list( t ), so that these records are removed from our
 * set of batch candidates.
 *
 * @param pairs Array<(AirtableRecord, Mailchimp Search Result)> the pairs to update in Airtable.
 * @param next a continuation to pass control to.
 *             follows node style (err, next) => Ø pattern.
 */
IntegrationPipeline.prototype.synchronizeRecords = function( pairs, next = function() {} ) {

    var integration = this;

    integration.airtable.synchronizeRecords( pairs, next );

};


module.exports = IntegrationPipeline;

'use strict';

var async = require('async');
var Airtable = require('airtable');

/**
 * This class manages the Airtable side of this integration.
 *
 * @param endpoint the URL to make API queries against.
 * @param baseID the hash of the base to use in airtable.
 * @param key the API key for accessing the API.
 */
function AirtableIntegration( endpoint, baseId, key ) {
    if ( !(this instanceof AirtableIntegration) ) { return new AirtableIntegration( endpoint, baseId, key ); }
    var self = this;

    Airtable.configure({
        endpointUrl: endpoint,
        apiKey: key
    })

    self.base = Airtable.base( baseId );

}


/**
 * TODO: as soon as Airtable exposes a record modified time, we can really implement this.
 * For now, we need to assume the airtable state is the latest state, as this is where
 * list activity is getting managed.
 *
 * NOTE: We could also try to implement this direction as a Zapier date.
 *
 * @param pair Object( Airtable Record, Mailchimp Search Result ) A given pair to test for membership in the list.
 *
 */
AirtableIntegration.prototype.isActiveInList = function( pair ) {

    return pair.record.get('Active in Mailing Lists');

}

/**
 * This routine creates a custom change set based on a managed field in Airtable.
 * If this managed field indicates that the record is not up to date, then the record is
 * understood to have changed, is included in the change set, and is returned for processing.
 * otherwise the record is ignored.
 *
 * @param next a continuation to pass control to.
 *             follows node style (err, next) => Ø pattern.
 */
AirtableIntegration.prototype.getChangeSet = function( next = function() {} ) {

    var self = this;
    var result = [];

    function processPage( records, nextPage ) { result = result.concat( records ); nextPage(); }

    function finishedPages( err ) { next( err, result ); }

    self.base( 'Individuals' )
        .select({
            fields: [
                'First Name',
                'Last Name',
                'Email',
                'Active in Mailing Lists',
                'Managed Field: Previous Email Address',
                'Managed Field: Previous Active In Mailing Lists',
                'Managed Field: Up To Date'
            ],
            view: 'Managed View: Mailing List',
            // filterByFormula: 'OR(NOT({Managed Field: Previous Email Address} = Email), NOT({Managed Field: Previous Active In Mailing Lists} = {Active in Mailing Lists}))'
        })
        .eachPage( processPage, finishedPages );

}

/**
 * This routine takes a given change set and updates the records in
 * Airtable to reflect the latest changes after a mailchimp batch.
 *
 * @param records Array( {record, result} ), an array of pairs
 *                of airtable records with mailchimp search results.
 * @param next a continuation to pass control to.
 *             follows node style (err, next) => Ø pattern.
 */
AirtableIntegration.prototype.synchronizeRecords = function( records, next = function() {}) {

    var self = this;

    async.each( records, function( pair, callback ) {

        self.base( 'Individuals' )
            .update( pair.record.id, {
                'Managed Field: Previous Email Address': pair.record.get('Email'),
                'Managed Field: Previous Active In Mailing Lists': pair.record.get('Active in Mailing Lists') || false
            }, callback );

    }, next );

};


module.exports = AirtableIntegration;

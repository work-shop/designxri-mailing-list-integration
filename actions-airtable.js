'use strict';

var async = require('async');
var Airtable = require('airtable');

/**
 * This class manages the Airtable side of this integration.
 *
 * @param endpoint the URL to make API queries against.
 * @param baseID the hash of the base to use in airtable.
 * @param key the API key for accessing the API.
 * @param pkg JSON package.json configuration
 */
function AirtableIntegration( endpoint, baseId, key, pkg ) {
    if ( !(this instanceof AirtableIntegration) ) { return new AirtableIntegration( endpoint, baseId, key, pkg ); }
    var self = this;

    Airtable.configure({
        endpointUrl: endpoint,
        apiKey: key
    })

    self.base = Airtable.base( baseId );

    self.config = pkg;

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

    var self = this;

    return pair.record.get( self.config.fields.in_mailing_list );

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
            fields: Object.values( self.config.fields ),
            view: 'Managed View: Mailing List'
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

        const changeset = {};

        changeset[ self.config.fields.previous_email ] = pair.record.get(self.config.fields.email);
        changeset[ self.config.fields.previous_in_mailing_list ] = pair.record.get(self.config.fields.in_mailing_list) || false;
        changeset[ self.config.fields.previous_first_name ] = pair.record.get(self.config.fields.first_name);
        changeset[ self.config.fields.previous_last_name ] = pair.record.get(self.config.fields.last_name);

        self.base( 'Individuals' )
            .update( pair.record.id, changeset, callback );

    }, next );

};


module.exports = AirtableIntegration;

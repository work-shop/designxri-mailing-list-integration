'use strict';

var util = require('util');
var Mailchimp = require('mailchimp-api-v3');
var md5 = require('md5');

function MailchimpIntegration( endpoint, listID, key ) {
    if ( !(this instanceof MailchimpIntegration) ) { return new MailchimpIntegration( endpoint, listID, key ); }
    var self = this;

    self.mailchimp = new Mailchimp( key );
    self.list = listID;

}



/**
 * Given a pair, returns true if the Airtable record associated with the pair
 * returned any exact matches in the mailchimp list in question.
 */
MailchimpIntegration.prototype.hasPreviousRecord = function( pair ) { return pair.result.exact_matches.total_items !== 0; }

/**
 * This routine takes a set of records from airtable, and runs
 * a batched request against the mailchimp API to get these
 * any results that match this subscriber.
 */
MailchimpIntegration.prototype.getMatchingSubscribers = function( records, next = function() {} ) {

    var self = this;

    var calls = records.map( function( record ) {

        var prev = record.get('Managed Field: Previous Email Address');

        return {
            method: 'get',
            path: ['', 'search-members'  ].join('/'),
            query: {
                query: prev,
                list_id: self.list
            },
        }
    });

    // TODO: Change this back to 'batch' and calls, when ready for production.
    self.mailchimp.batch( calls, function( err, batchResults ) {
        if ( err ) {
            /** NOTE: If we passed an empty query, that means there was no previous email in the list, so return an empty result */
            if ( err.status === 400 && err.detail.indexOf( 'query' ) !== -1 ) {

                next( err );

            }

            next( err );

        }

        next( null, batchResults.map( function( result, i ) { return { record: records[i], result: result }; }) );


    });

};

/**
 * This routine creates a new subscriber record in Mailchimp
 * For a given airtable record.
 */
MailchimpIntegration.prototype.updateSubscriberSet = function( records, next = function(){} ) {

    var self = this;

    var new_members = records.filter( function( r ) { return !r.exists; });
    var existing_members = records.filter( function( r ) { return r.exists; });

    var add_new = {
        method: 'post',
        path: ['', 'lists', self.list ].join('/'),
        body: {
            members: new_members.map( function( r ) {

                return {
                    email_address: r.record.get('Email'),
                    email_type: 'html',
                    status: ( r.subscribed ) ? 'subscribed' : 'unsubscribed',
                    merge_fields: {
                        EMAIL: r.record.get('Email'),
                        FNAME: r.record.get('First Name'),
                        LNAME: r.record.get('Last Name')
                    }
                };

            })
        }
    }

    /*
     * NOTE: use PUT, rather than PATCH, as PUT will add a new email address, if it doesn't
     * find a value at the requested uri.
     */
    var update_existing = existing_members.map( function( r ) {
        return {
            method: 'put',
            path: ['', 'lists', self.list, 'members', md5( r.record.get('Managed Field: Previous Email Address').toLowerCase() ) ].join('/'),
            body: {
                email_address: r.record.get('Email'),
                status: ( r.subscribed ) ? 'subscribed' : 'unsubscribed',
                merge_fields: {
                    EMAIL: r.record.get('Email'),
                    FNAME: r.record.get('First Name'),
                    LNAME: r.record.get('Last Name')
                }
            }
        };
    });

    var batches = update_existing.concat( [ add_new ] );

    self.mailchimp.batch( batches, function( err, result ) {

        if ( err ) { next( err ); }
        else { next( null, records ); }

    });

}



module.exports = MailchimpIntegration;

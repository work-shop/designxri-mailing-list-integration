'use strict';

var moment = require('moment');
require('colors');

/**
 * A simple logging class to help write nice console statements.
 *
 * @param verbosity int a number from 1 - 5 representing a threshold above which messages should NOT be printed.
 */
function Log( verbosity ) {
    if ( !(this instanceof Log)) { return new Log( verbosity ); }


    this.verbosity = verbosity;

}

/**
 * A simple routine that adds a colored logging statement to the console.
 *
 * @param msg string the message to write.
 * @param v a verbosity level. This message will only be printed if verbosity is < than the threshold.
 */
Log.prototype.airtable = function( msg, v ) {
    if ( v && v < this.verbosity ) {
        console.log('['.gray + 'Airtable'.bold.yellow + ']('.gray + (moment().format()) + ')\t'.gray + msg );
    }
    return this;
}

/**
 * A simple routine that adds a colored logging statement to the console.
 *
 * @param msg string the message to write.
 * @param v a verbosity level. This message will only be printed if verbosity is < than the threshold.
 */
Log.prototype.mailchimp = function( msg, v ) {
    if ( v && v < this.verbosity ) {
        console.log('['.gray + 'Mailchimp'.bold.blue + ']('.gray + (moment().format()) + ')\t'.gray + msg );
    }
    return this;

}

/**
 * A simple routine that adds a colored logging statement to the console.
 *
 * @param msg string the message to write.
 * @param v a verbosity level. This message will only be printed if verbosity is < than the threshold.
 */
Log.prototype.integration = function( msg, v ) {
    if ( v && v < this.verbosity ) {
        console.log('['.gray + 'Integrate'.bold.green + ']('.gray + (moment().format()) + ')\t'.gray + msg );
    }
    return this;
}

/**
 * A simple routine that adds a colored logging statement to the console.
 *
 * @param msg string the message to write.
 * @param v a verbosity level. This message will only be printed if verbosity is < than the threshold.
 */
Log.prototype.error = function( msg, v ) {
    if ( v && v < this.verbosity ) {
        console.log('['.gray + 'Error'.bold.red + ']('.gray + (moment().format()) + ')\t'.gray + msg );
    }
    return this;
}

module.exports = Log;

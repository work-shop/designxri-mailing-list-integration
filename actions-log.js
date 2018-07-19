'use strict';

var moment = require('moment');
require('colors');

function Log( verbosity ) {
    if ( !(this instanceof Log)) { return new Log( verbosity ); }


    this.verbosity = verbosity;

}

Log.prototype.airtable = function( msg, v ) {
    if ( v && v < this.verbosity ) {
        console.log('['.gray + 'Airtable'.bold.yellow + ']('.gray + (moment().format()) + ')\t'.gray + msg );
    }
    return this;
}

Log.prototype.mailchimp = function( msg, v ) {
    if ( v && v < this.verbosity ) {
        console.log('['.gray + 'Mailchimp'.bold.blue + ']('.gray + (moment().format()) + ')\t'.gray + msg );
    }
    return this;

}

Log.prototype.integration = function( msg, v ) {
    if ( v && v < this.verbosity ) {
        console.log('['.gray + 'Integrate'.bold.green + ']('.gray + (moment().format()) + ')\t'.gray + msg );
    }
    return this;
}

Log.prototype.error = function( msg, v ) {
    if ( v && v < this.verbosity ) {
        console.log('['.gray + 'Error'.bold.red + ']('.gray + (moment().format()) + ')\t'.gray + msg );
    }
    return this;
}

module.exports = Log;

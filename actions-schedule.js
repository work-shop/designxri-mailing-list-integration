'use strict';

var schedule = require('node-schedule');

/**
 * This is a simple scheduler that schedules jobs on specific intervals.
 */
function Scheduler() {
    if ( !(this instanceof Scheduler) ) { return new Scheduler(); }

}

/**
 * This routine schedules a job to occur at a recurring interval in minutes.
 *
 * @param minutes int an inteval of minutes to run this job on.
 * @param action a function representing the action to run on the specified interval.
 */
Scheduler.prototype.every = function( minutes, action ) {

    schedule.scheduleJob( ['0', '*/' + minutes, '*', '*', '*', '*'].join(' '), action );

    return this;

}

/**
 * This routine sequences a job over a number of seconds. Given a timeout of k minutes, this routine
 * runs a specified action which lasts a variable number of seconds l(t), every k + l(t) seconds.
 * In other words, this routine sequences a number of actions, without allowing operations to
 * overlap
 *
 * @param minutes int an inteval of minutes to run this job on.
 * @param action a function representing the action to run on the specified interval.
 */
Scheduler.prototype.linearSequence = function( minutes, action ) {

    var self = this;

    setTimeout( function() {

        action( function() { self.linearSequence( minutes, action ); });

    }, minutes * 60000 );

    return this;

};

module.exports = Scheduler;

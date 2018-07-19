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

module.exports = Scheduler;

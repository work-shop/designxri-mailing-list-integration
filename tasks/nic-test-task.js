"use strict";

/**
 * This module contains a scheduled task.
 * These tasks are scheduled once, on system start. Modifying
 * This file at runtime will not have an effect on job schedule.
 *
 * ==== Test Parametric Task ====
 *
 */
var called = 1;

module.exports = {
     // Content
     name: function() { var m = "Cron has been running for " + called + ((called > 1) ? " days." : " day."); called += 1; return m; },
     description: "(this task was added by our cron.)",
     project: ".Internal",
     tasklist: "Nic",
     users: ["Nic Schumann"],

     // Scheduling and Management
     active: false,
     schedule: {
         second: "0",// 0 - 59, * = every
         minute: "30", // 0 - 59
         hour: "4",// 0 - 23
         dayOfMonth: "*", // 1 - 31
         month: "*",// 1 - 31
         dayOfWeek: "*" // [0...7], where both 0 and 7 are sunday.
     }
 };

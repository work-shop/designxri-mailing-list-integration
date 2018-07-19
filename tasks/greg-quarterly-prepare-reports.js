"use strict";

/**
 * This module contains a scheduled task.
 * These tasks are scheduled once, on system start. Modifying
 * This file at runtime will not have an effect on job schedule.
 *
 * ==== Update Sales Tracking Spreadsheet ====
 *
 */
module.exports = {
    // Content
    name: "Prepare & Review Quarterly Reports",
    description: "",
    project: ".Internal",
    tasklist: "Greg",
    users: ["Greg Nemes"],

    // Scheduling and Management
    active: true,
    schedule: {
        second: "0",
        minute: "30", // 0 - 59
        hour: "4",// 0 - 23
        dayOfMonth: "5", // 1 - 31
        month: "1,4,7,10",// 1 - 31
        dayOfWeek: "*" // [0...7], where both 0 and 7 are sunday.
    }
};

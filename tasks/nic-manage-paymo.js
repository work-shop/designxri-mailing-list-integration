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
    name: "Manage Paymo",
    description: "",
    project: ".Internal",
    tasklist: "Nic",
    users: ["Nic Schumann"],

    // Scheduling and Management
    active: true,
    schedule: {
        second: "0",
        minute: "0", // 0 - 59
        hour: "14",// 0 - 23
        dayOfMonth: "*", // 1 - 31
        month: "*",// 1 - 31
        dayOfWeek: "1-5" // [0...7], where both 0 and 7 are sunday.
    }
};

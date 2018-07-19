"use strict";

/**
 * This module contains a scheduled task.
 * These tasks are scheduled once, on system start. Modifying
 * This file at runtime will not have an effect on job schedule.
 *
 * ====  ====
 *
 */
module.exports = {
    // Content
    name: "Update workshop.co coffee form",
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
        dayOfMonth: "*", // 1 - 31
        month: "*",// 1 - 31
        dayOfWeek: "1" // [0...7], where both 0 and 7 are sunday.
    }
};

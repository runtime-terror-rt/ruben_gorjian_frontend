const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const userTimezone = "Asia/Dhaka";
const originalDate = "2026-05-31T10:00:00.000Z";
const formatted = dayjs.utc(originalDate).tz(userTimezone).format();
console.log("Formatted:", formatted);

const doubleFormatted = dayjs.utc(formatted).tz(userTimezone).format("h:mm A");
console.log("Double Formatted:", doubleFormatted);

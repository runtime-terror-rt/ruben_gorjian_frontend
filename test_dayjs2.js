const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const userTimezone = "Asia/Dhaka";
const str = "2026-05-31T16:00:00+06:00";
const parsedUtc = dayjs.utc(str);
console.log("Parsed UTC string:", parsedUtc.format());
console.log("Parsed UTC to TZ:", parsedUtc.tz(userTimezone).format("h:mm A"));

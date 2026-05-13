const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const str = "2026-05-12T21:04:00-04:00";
const tz = "America/New_York";

const pDate = dayjs.tz(str, tz);
console.log("pDate.format:", pDate.format("YYYY-MM-DD HH:mm"));

// What if string is UTC?
const str2 = "2026-05-13T01:04:00Z";
const pDate2 = dayjs.tz(str2, tz);
console.log("pDate2.format:", pDate2.format("YYYY-MM-DD HH:mm"));


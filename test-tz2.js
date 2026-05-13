const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const str = "2026-05-12T21:04:00-04:00";
const tz = "America/New_York";

const pDate1 = dayjs(str).tz(tz);
console.log("pDate1.format:", pDate1.format("YYYY-MM-DD HH:mm"));

const pDate3 = dayjs.utc(str).tz(tz);
console.log("pDate3.format:", pDate3.format("YYYY-MM-DD HH:mm"));


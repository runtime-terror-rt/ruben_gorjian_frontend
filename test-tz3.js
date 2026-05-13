const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const tz = "America/New_York";
const d = new Date("2026-05-13T01:04:00Z");

const pDate1 = dayjs.tz(d, tz);
console.log("pDate1.format:", pDate1.format("YYYY-MM-DD HH:mm"));

const pDate2 = dayjs(d).tz(tz);
console.log("pDate2.format:", pDate2.format("YYYY-MM-DD HH:mm"));


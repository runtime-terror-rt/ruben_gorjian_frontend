const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const userTimezone = "Asia/Dhaka";

// Let's test with and without Z
const withZ = "2026-05-31T10:00:00.000Z";
const withoutZ = "2026-05-31T10:00:00.000";
const rawWithoutZ = "2026-05-31 10:00:00";

console.log("withZ ->", dayjs.utc(withZ).tz(userTimezone).format("h:mm A"));
console.log("withoutZ ->", dayjs.utc(withoutZ).tz(userTimezone).format("h:mm A"));
console.log("rawWithoutZ ->", dayjs.utc(rawWithoutZ).tz(userTimezone).format("h:mm A"));

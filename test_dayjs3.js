const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const str = "2026-05-31T16:00:00.000Z";
console.log("With Z, dayjs().tz():", dayjs(str).tz("Asia/Dhaka").format("H:mm"));
console.log("With Z, dayjs.utc().tz():", dayjs.utc(str).tz("Asia/Dhaka").format("H:mm"));

const str2 = "2026-05-31T16:00:00";
console.log("Without Z, dayjs().tz():", dayjs(str2).tz("Asia/Dhaka").format("H:mm"));
console.log("Without Z, dayjs.utc().tz():", dayjs.utc(str2).tz("Asia/Dhaka").format("H:mm"));

import { DEFAULT_DATE_FORMAT } from '../share/constant';
const { utcToZonedTime, format } = require('date-fns-tz')

// from seconds
export function formatTime(num: number) {
    if (num < 3600) {
        const minutes = padZero(Math.floor(num / 60), 2);
        // const seconds = padZero(num % 60, 2);
        // return `${minutes}:${seconds}`;
        return `${minutes} Min`;
    } else {
        const hours: any = padZero(Math.floor(num / 3600), 2);
        const minutes = padZero(Math.floor((num - hours * 3600) / 60), 2);
        // const seconds = padZero(num % 60, 2);
        // return `${hours}:${minutes}:${seconds}`;
        return `${hours} H ${minutes} Min`;
    }
}

function padZero(num: number, size: number) {
    let s = String(num);
    while (s.length < size) {
        s = `0${s}`;
    }
    return s;
}

// from seconds
export const convertUnixTime = (time: number, pattern: string = DEFAULT_DATE_FORMAT, timeZone: string = 'Europe/Copenhagen') => {
    let date = new Date(time * 1000);
    let zonedDate = utcToZonedTime(date, timeZone);
    
    return format(zonedDate, pattern, { timeZone: timeZone });
}

export const getNow = () => {
    return Math.ceil(+ new Date() / 1000);
}

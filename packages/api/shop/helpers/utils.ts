export const sleep = (milisecond: number) => {
    return new Promise(resolve => setTimeout(resolve, milisecond));
}
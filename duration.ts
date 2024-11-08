export interface Duration {

    seconds (): number;

    milliseconds (): number;

}





export function from_seconds (n: number): Duration {

    return make(n * thousands);

}





export function from_milliseconds (n: number): Duration {

    return make(n);

}





function make (ms: number): Duration {

    return {

        seconds () {
            return Math.floor(ms / thousands);
        },

        milliseconds () {
            return ms;
        },

    };

}





const thousands = 1000;


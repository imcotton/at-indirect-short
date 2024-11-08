export interface Duration {

    seconds (): number;

    milliseconds (): number;

}





export function duration_in_seconds (n: number): Duration {

    return make(n * thousands);

}





export function duration_in_milliseconds (n: number): Duration {

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


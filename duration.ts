export interface Duration {

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

        milliseconds () {
            return ms;
        },

    };

}





const thousands = 1000;


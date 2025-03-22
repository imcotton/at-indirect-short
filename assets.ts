export interface Mount {

    readonly href: string;
    readonly remote: string;

}





export const pico_css = {

    version: '2.1.1',

    integrity: 'sha256-+8mmP8n8n3LRL9f8mAbhH6n3euT5ytFGsnADoRGbo9s=',

    Accept: 'text/css',

    get href () {
        return `/static/css/pico/${ this.version }/pico.min.css`;
    },

    base: 'https://esm.sh/@picocss/pico',

    get remote () {
        return `${ this.base }@${ this.version }/css/pico.min.css`;
    },

} as const;





export const collection: readonly Mount[] = [

    pico_css,

];


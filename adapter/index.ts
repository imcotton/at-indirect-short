export interface Adapter {

    get (id: string): Promise<string | undefined>;

    put (id: string, link: string): Promise<boolean>;

}





type   IO <T> = () =>         T ;
type Task <T> = () => Promise<T>;

export type AdapterGen = IO<Adapter> | Task<Adapter>;


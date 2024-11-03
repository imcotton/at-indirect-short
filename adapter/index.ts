import type { Duration } from '../duration.ts';





export interface Adapter {

    get (id: string): Promise<string | undefined>;

    put (id: string, link: string, opts?: {

            ttl?: Duration,

    }): Promise<boolean>;

    [Symbol.dispose] (): void;

}





type   IO <T> = () =>         T ;
type Task <T> = () => Promise<T>;

export type AdapterGen = IO<Adapter> | Task<Adapter>;


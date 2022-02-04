export interface Parser<T> {
    parse: (s: string) => T;
    serialize: (x: T) => string;
}
export declare const stringParser: Parser<string>;
export declare const floatParser: Parser<number>;
export declare const intParser: Parser<number>;
export declare const dateParser: Parser<Date>;
export declare const booleanParser: Parser<boolean>;

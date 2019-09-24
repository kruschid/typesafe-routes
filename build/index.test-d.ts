import { expectType, expectError } from "tsd";
import { Ruth, IRouteNode } from "../src";

type Category = "all" | "active" | "inactive";

class ISODate {
  toString() {
    return "2017-01-01";
  }
}

interface IRoute {
  users: {
    show(userId: string): {
      delete: {}
    }
    list(...p:
      | [{category: Category}, {limit: number}]
      | [{registrationDate: ISODate}]
    ): {}
  }
}

const r = Ruth<IRoute>();
expectType<IRouteNode<IRoute>>(r);

expectError<
  (k: "abc") => {str(): string}
>(r);

expectType<
  (k: "users") => {str(): string}
>(r);

expectType<
  (k: "users") => (k: "show", id: string) => {str(): string}
>(r);

expectType<
  (k: "users") => (k: "show", id: string) => (k: "delete") => {str(): string}
>(r);

expectType<
  (k: "users") => (k: "show", id: string) => (k: "delete") => (n: never) => IRouteNode<never>
>(r);

expectType<
  (k: "users") => (k: "list", a: {category: Category}, b: {limit: number}) => {str(): string}
>(r);

expectType<
  (l: "users") => (k: "list", a: {category: Category}, b: {limit: number}) => (n: never) => IRouteNode<never>
>(r);

expectError<
  (k: "users") => (k: "list", a: {registrationDate: ISODate}, b: {limit: number}) => {str(): string}
>(r);

expectType<
  (k: "users") => (k: "list", a: {registrationDate: ISODate}) => {str(): string}
>(r);

expectType<
  (l: "users") => (k: "list", a: {registrationDate: ISODate}) => (n: never) => IRouteNode<never>
>(r);
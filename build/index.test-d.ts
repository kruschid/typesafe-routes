import { expectType, expectError } from "tsd";
import { R, WithParams } from "../src";

type Category = "all" | "active" | "inactive";

class ISODate {
  toString() {
    return "2017-01-01";
  }
}

type Routes = typeof routes;
type Params = WithParams<Routes>;

const routes = {
  users: {
    show: (_: {userId: string}) => ({
      delete: {}
    }),
    list: (..._:
      | [{category: Category}, {limit: number}]
      | [":category", ":limit"]
      | [{registrationDate: ISODate}]
      | [":registrationDate"]
      | [":registrationDate?"]
    ) => ({
      page: (
        _: {pageNumber: number}
      ) => ({})
    })
  }
}

const r = R(routes);
expectType<Routes>(r);

expectError<{
  abc: {}
}>(r);

expectType<{
  delete: {}
}>(r.users.show({userId: ""}));

expectError<{
  other: {}
}>(r.users.show({userId: ""}));

expectType<Params["users"]["list"]["params"]>({
  category: "all",
  limit: 234,
  registrationDate: new ISODate(),
});

expectType<Partial<Params["users"]["list"]["params"]>>({
  category: "all",
  limit: 234,
});

expectError<Partial<Params["users"]["list"]["params"]>>({
  category: "all",
  limit: 234,
  other: 123 as any,
});

expectError<Params["users"]["list"]["params"]>({
  category: "none",
  limit: 234,
  registrationDate: new ISODate(),
});

expectType<Params["users"]["list"]["children"]["page"]["params"]>({
  pageNumber: 123,
});

expectType<Params["users"]["list"]["children"]["page"]["params"]>({
  pageNumber: 123,
});
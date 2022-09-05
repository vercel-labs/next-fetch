import { test, describe } from "vitest";
import type {
  inputOf as rqInputOf,
  outputOf as rqOutputOf,
} from "@next-fetch/react-query";
import type {
  useListPeopleWith as ReactQueryUseListPeopleWith,
  usePerson as ReactQueryUsePerson,
  useAllPeople as ReactQueryUseAllPeople,
} from "../../pages/api/rq/people.rq";
import type {
  inputOf as swrInputOf,
  outputOf as swrOutputOf,
} from "@next-fetch/swr";
import type {
  useListPeopleWith as SWRUseListPeopleWith,
  usePerson as SWRUsePerson,
  useAllPeople as SWRUseAllPeople,
} from "../../pages/api/people.swr";

type IsAny<T> = 0 extends 1 & T ? true : false;
type SameType<T, U> = true extends IsAny<T> | IsAny<U>
  ? false
  : [T] extends [U]
  ? [U] extends [T]
    ? true
    : false
  : false;
function expectSameType<T, U>(_v: SameType<T, U>) {}

describe("helpers", () => {
  test("expectSameType", () => {
    expectSameType<string, boolean>(false);
    expectSameType<string, string>(true);
    expectSameType<unknown, string>(false);

    // Check that `any` fails the conditional as well
    expectSameType<any, string>(false);
    expectSameType<string, any>(false);

    // @ts-expect-error this should fail
    expectSameType<string, string>(false);
  });
});

describe("react query", () => {
  test("mutation", () => {
    type Input = rqInputOf<typeof ReactQueryUseListPeopleWith>;
    type Output = rqOutputOf<typeof ReactQueryUseListPeopleWith>;
    expectSameType<Input, { name: string }>(true);
    expectSameType<Output, string[]>(true);
  });

  test("query with no args", () => {
    type Input = rqInputOf<typeof ReactQueryUseAllPeople>;
    type Output = rqOutputOf<typeof ReactQueryUseAllPeople>;
    expectSameType<Input, void>(true);
    expectSameType<Output, string>(true);
  });

  test("query with args", () => {
    type Input = rqInputOf<typeof ReactQueryUsePerson>;
    type Output = rqOutputOf<typeof ReactQueryUsePerson>;
    expectSameType<Input, { name: string }>(true);
    expectSameType<Output, string>(true);
  });
});

describe("swr", () => {
  test("mutation", () => {
    type Input = swrInputOf<typeof SWRUseListPeopleWith>;
    type Output = swrOutputOf<typeof SWRUseListPeopleWith>;
    expectSameType<Input, { name: string }>(true);
    expectSameType<Output, string[]>(true);
  });

  test("query with no args", () => {
    type Input = swrInputOf<typeof SWRUseAllPeople>;
    type Output = swrOutputOf<typeof SWRUseAllPeople>;
    expectSameType<Input, void>(true);
    expectSameType<Output, string>(true);
  });

  test("query with args", () => {
    type Input = swrInputOf<typeof SWRUsePerson>;
    type Output = swrOutputOf<typeof SWRUsePerson>;
    expectSameType<Input, { name: string }>(true);
    expectSameType<Output, string>(true);
  });
});

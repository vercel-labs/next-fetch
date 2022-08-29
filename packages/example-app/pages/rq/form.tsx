import { useListPeopleWith } from "../api/rq/people.rq";
import { Form } from "@next-fetch/react-query/form";

export default function Page(props: { runtime: string }) {
  const listPeopleWith = useListPeopleWith();

  return (
    <div>
      <Form mutation={listPeopleWith}>
        <label>
          Name: <input type="text" name="name" placeholder="Enter a name..." />
        </label>
        <button type="submit" tabIndex={0}>
          Submit
        </button>
      </Form>
      {!listPeopleWith.data ? (
        <p id="result">
          No data, {listPeopleWith.isLoading ? "mutating" : "idle"}.
        </p>
      ) : (
        <ul id="result">
          {listPeopleWith.data.map((name) => {
            return <li key={name}>{name}</li>;
          })}
        </ul>
      )}
      <p>Rendered on {props.runtime}</p>
    </div>
  );
}

export const getServerSideProps = () => {
  return {
    props: {
      runtime: `Node ${process.version}`,
    },
  };
};

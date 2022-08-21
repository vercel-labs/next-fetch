import { useRuntimeInfoMutation } from "./api/edge.swr";
import { Form } from "@next-fetch/swr/form";

export const config = { runtime: "experimental-edge" };

export default function Page(props: { runtime: string }) {
  const listPeopleWith = useRuntimeInfoMutation();

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
          No data, {listPeopleWith.isMutating ? "mutating" : "idle"}.
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

export const getServerSideProps = async () => {
  return {
    props: {
      runtime: String(EdgeRuntime),
    },
  };
};

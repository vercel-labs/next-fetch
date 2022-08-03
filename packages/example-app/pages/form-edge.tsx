import { useRuntimeInfoMutation } from "./api/edge.swr";

export const config = { runtime: "experimental-edge" };

export default function Page(props: { runtime: string }) {
  const listPeopleWith = useRuntimeInfoMutation();

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const name = new FormData(event.currentTarget).get("name");
          if (!name) throw new Error("can't get name");
          listPeopleWith.trigger({ name: String(name) });
        }}
      >
        <label>
          Name: <input type="text" name="name" placeholder="Enter a name..." />
        </label>
        <button type="submit" tabIndex={0}>
          Submit
        </button>
      </form>
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

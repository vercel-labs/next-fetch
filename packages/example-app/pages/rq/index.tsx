import { useAllPeople } from "../api/rq/people.rq";

export default function Home(props: { runtime: string }) {
  const result = useAllPeople({ name: "gal" });

  return (
    <div>
      <div id="result">
        {result.data
          ? result.data
          : result.error
          ? String(result.error)
          : "loading..."}
      </div>
      <pre>{JSON.stringify(result.status)}</pre>
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

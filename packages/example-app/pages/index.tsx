import { inputOf, outputOf } from "@next-fetch/swr";
import { useAllPeople } from "./api/people.swr";

export default function Home(props: { runtime: string }) {
  const data: inputOf<typeof useAllPeople> = {
    name: "gal",
  };
  const outputType: outputOf<typeof useAllPeople> = "a string";

  const result = useAllPeople(data);

  return (
    <div>
      <div id="result">
        {result.data
          ? result.data
          : result.error
          ? String(result.error)
          : "loading..."}
      </div>
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

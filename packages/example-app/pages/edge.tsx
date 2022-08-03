import { useRuntimeInfo } from "./api/edge.swr";

export const config = { runtime: "experimental-edge" };

export default function Home(props: { runtime: string }) {
  const result = useRuntimeInfo({ name: "gal" });

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
      runtime: String(EdgeRuntime),
    },
  };
};

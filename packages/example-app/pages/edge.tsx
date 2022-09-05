import { useRuntimeInfo, useNoArgs } from "./api/edge.swr";

export const config = { runtime: "experimental-edge" };

export default function Home(props: { runtime: string }) {
  const runtimeInfo = useRuntimeInfo({ name: "gal" });
  const noArgs = useNoArgs();

  return (
    <div>
      <div id="runtimeInfo">
        {runtimeInfo.data
          ? runtimeInfo.data
          : runtimeInfo.error
          ? String(runtimeInfo.error)
          : "loading..."}
      </div>
      <div id="noArgs">
        {noArgs.data
          ? noArgs.data
          : noArgs.error
          ? String(noArgs.error)
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

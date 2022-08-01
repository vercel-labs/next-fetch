import { useRuntimeInfo } from "./api/edge.swr";

export default function Home() {
  const result = useRuntimeInfo({ name: "gal" });

  return (
    <div id="result">
      {result.data
        ? result.data
        : result.error
        ? String(result.error)
        : "loading..."}
    </div>
  );
}

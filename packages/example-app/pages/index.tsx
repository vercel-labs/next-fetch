import { useAllPeople } from "./api/people.swr";
import useSWRMutation from "swr/mutation";

export default function Home() {
  const result = useAllPeople({ name: "gal" });

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

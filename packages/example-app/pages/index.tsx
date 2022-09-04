import { useAllPeople, usePerson } from "./api/people.swr";

export default function Home(props: { runtime: string }) {
  const allPeople = useAllPeople();
  const singlePerson = usePerson({ name: "gal" });

  return (
    <div>
      <div id="allPeople">
        {allPeople.data
          ? allPeople.data
          : allPeople.error
          ? String(allPeople.error)
          : "loading..."}
      </div>
      <div id="singlePerson">
        {singlePerson.data
          ? singlePerson.data
          : singlePerson.error
          ? String(singlePerson.error)
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

import { useEffect, useState } from "react";
import "./App.css";

type TFlavorData = {
  id: number;
  name: string;
  is_favorite: boolean;
};

function App() {
  const [flavors, setFlavors] = useState<TFlavorData[]>([]);

  useEffect(() => {
    const getFlavorsData = async () => {
      try {
        const response = await fetch("/api/flavors");
        const json = await response.json();
        setFlavors(json.data);
      } catch (error) {
        console.error(error);
      }
    };
    getFlavorsData();
  }, []);

  return (
    <div>
      <h1>Hello Flavors {flavors.length}</h1>
      <ul>
        {flavors.map((flavor) => {
          return <li key={flavor.id}>{flavor.name}</li>;
        })}
      </ul>
    </div>
  );
}

export default App;

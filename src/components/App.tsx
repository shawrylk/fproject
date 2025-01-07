// import reactLogo from "../assets/react.svg";
// import viteLogo from "/vite.svg";
import "../styles/App.css";
import { SceneOverlay } from "./SceneOverlay";
import { SceneR3F } from "./SceneR3F";

function App() {
  // const { items, add, clear } = useRootStore(
  //   (state) => state.interaction.selected
  // );
  return (
    <div>
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1> */}
      <SceneR3F />
      <SceneOverlay />
    </div>
  );
}

export default App;

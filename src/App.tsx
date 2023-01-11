import Canvas from "./components/Canvas/Canvas";
import { useState } from "react";
import "./App.css";

const App = (props: { canvasSize: number }) => {
  const { canvasSize } = props;
  const startCanvas = new Array(canvasSize ** 2).fill(false); // Initial canvas state (empty)

  const [canvas, setCanvas] = useState(startCanvas);

  return (
    <>
      <h1>Karektar</h1>
      <div className="App">
        <Canvas canvas={canvas} setCanvas={setCanvas} />
      </div>
    </>
  );
};

export default App;

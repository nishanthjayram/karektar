import Canvas from "./components/Canvas/Canvas";
import { useState } from "react";
import "./App.css";

const App = (props: { canvas_size: number }) => {
  const { canvas_size } = props;
  const startCanvasState = new Array(canvas_size ** 2).fill(false); // Initial canvas state (empty)

  const [canvasState, setCanvasState] = useState(startCanvasState);

  return (
    <>
      <h1>Karektar</h1>
      <div className="App">
        <Canvas canvasState={canvasState} setCanvasState={setCanvasState} />
      </div>
    </>
  );
};

export default App;

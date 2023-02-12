import {useState} from 'react'
import Canvas from './components/Canvas/Canvas'
import './App.css'

const App = (props: {canvasSize: number}) => {
  const {canvasSize} = props

  // Initial canvas state (empty)
  const [canvas, setCanvas] = useState(() =>
    new Array<boolean>(canvasSize ** 2).fill(false),
  )

  return (
    <>
      <h1>Karektar</h1>
      <div className="App">
        <Canvas canvas={canvas} setCanvas={setCanvas} />
      </div>
    </>
  )
}

export default App

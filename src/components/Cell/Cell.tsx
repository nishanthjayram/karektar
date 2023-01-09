const FILLED_COLOR = "black";
const EMPTY_COLOR = "white";

// I'm not sure how the css import is workingm you might need o read he vite docs

const Cell = (props: { filled: boolean; toggleCell: () => void }) => {
  const { filled, toggleCell } = props;

  return (
    <div
      style={{
        width: "50px",
        height: "50px",
        backgroundColor: filled ? FILLED_COLOR : EMPTY_COLOR,
        borderColor: "black",
        borderWidth: "1px",
        borderStyle: "solid",
        boxSizing: "border-box",
      }}
      onClick={toggleCell}
    ></div>
  );
};

export default Cell;

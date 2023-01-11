const FILLED_COLOR = "black";
const EMPTY_COLOR = "white";

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
    />
  );
};

export default Cell;

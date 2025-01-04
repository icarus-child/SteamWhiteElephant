import Input from "@/app/components/Input";
import { ChangeEventHandler } from "react";

type GameInputProps = {
  id: number;
  onChange: ChangeEventHandler;
  gameName: string;
};

function GameInput(props: GameInputProps) {
  return (
    <>
      <div className="md:flex md:items-center mb-1">
        <div className="md:w-1/3">
          <label
            className="block font-bold md:text-right mb-1 md:mb-0 pr-4"
            htmlFor={"game-" + props.id}
          >
            Steam Game URL
          </label>
        </div>
        <div className="md:w-2/3">
          <Input
            id={"game-" + props.id}
            name={props.id.toString()}
            type="text"
            onChange={props.onChange}
            form="signup"
          />
        </div>
      </div>
      <div className="md:flex md:items-center mb-6">
        <div className="md:w-1/3"></div>
        <div className="md:w-2/3">
          <span id="game-name">{props.gameName}</span>
        </div>
      </div>
    </>
  );
}

type GameListProps = {
  className: string;
  onChange: ChangeEventHandler;
  gameName: string;
};

const GameInputs = (props: {
  onChange: ChangeEventHandler;
  gameName: string;
}) => {
  for (let i = 0; i < 1; i++)
    return (
      <GameInput id={i} onChange={props.onChange} gameName={props.gameName} />
    );
};

export default function GameList(props: GameListProps) {
  const { onChange, gameName, ...rest } = props;
  return (
    <div {...rest}>
      <GameInputs onChange={onChange} gameName={gameName} />
    </div>
  );
}

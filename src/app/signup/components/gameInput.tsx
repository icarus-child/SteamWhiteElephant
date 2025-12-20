import Input from "@/app/components/Input";
import { ChangeEventHandler } from "react";

type GameInputProps = {
  id: number;
  onChange: ChangeEventHandler;
  gameName: string;
};

function GameInput(props: GameInputProps) {
  return <></>;
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

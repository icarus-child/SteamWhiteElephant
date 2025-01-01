import { signup } from "@/actions/auth";
import { GetSteamGameName, ParseGameId } from "@/actions/steam";
import {
  ChangeEvent,
  ChangeEventHandler,
  JSX,
  useActionState,
  useState,
} from "react";
import Input from "../components/Input";
import Button from "../components/Button";

type Inputs = {
  name: string | null;
  "game-id": string | null;
};

function Errors(errors: string[]): JSX.Element[] {
  const rows = [];
  for (let i = 0; i < errors.length; i++) {
    rows.push(
      <p className="block" key={i}>
        {errors[i]}
      </p>,
    );
  }
  return rows;
}

type GameInputProps = {
  onChange: ChangeEventHandler;
  gameName: string;
  required?: boolean;
};

function GameInput(props: GameInputProps) {
  return (
    <>
      <div className="md:flex md:items-center mb-1">
        <div className="md:w-1/3">
          <label
            className="block font-bold md:text-right mb-1 md:mb-0 pr-4"
            htmlFor="inline-game-id"
          >
            Steam Game URL
          </label>
        </div>
        <div className="md:w-2/3">
          <Input
            id="inline-game-id"
            name="game-id"
            type="text"
            onChange={props.onChange}
            required={props.required}
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

type NormalInputProps = {
  children?: React.ReactNode;
  onChange: ChangeEventHandler;
  name: string;
  id: string;
};

function NormalInput(props: NormalInputProps) {
  return (
    <div className="md:flex md:items-center mb-6">
      <div className="md:w-32">
        <label
          className="block font-bold w-fit md:text-right md:ml-auto mb-1 md:mb-0 pr-4"
          htmlFor={props.id}
        >
          {props.children}
        </label>
      </div>
      <div className="md:w-3/5">
        <Input
          id={props.id}
          name={props.name}
          type="text"
          onChange={props.onChange}
          required
        />
      </div>
    </div>
  );
}

export default function Form() {
  const [inputs, setInputs] = useState<Inputs>({
    name: null,
    "game-id": null,
  });
  const [gameName, setGameName] = useState<string>("Type above");
  let timerId: number | undefined = undefined;
  const [state, action, pending] = useActionState(signup, []);

  type GameListProps = {
    className: string;
  };

  function GameList(props: GameListProps) {
    return (
      <div {...props}>
        <GameInput
          onChange={handleIdChange}
          gameName={gameName}
          required={true}
        />
      </div>
    );
  }

  const fetchGameName = async (gameIdRaw: string) => {
    const gameId = await ParseGameId(gameIdRaw);
    if (gameId == null) {
      setGameName("Invalid Input");
      return;
    }
    const gameName = await GetSteamGameName(gameId);
    if (gameName == null || gameName == "") {
      setGameName("Game not found");
      return;
    }
    setGameName(gameName);
  };

  const handleIdChange = async (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(event);
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      if (event.target.value == "") {
        setGameName("Game not found");
        return;
      }
      fetchGameName(event.target.value);
    }, 500) as unknown as number;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs({ ...inputs, [name]: value });
  };

  return (
    <>
      <form id="signup" className="w-full max-w-sm" action={action}>
        <NormalInput name="name" id="inline-name" onChange={handleChange}>
          Player Name
        </NormalInput>
        <NormalInput name="name" id="inline-name" onChange={handleChange}>
          Room Id
        </NormalInput>
        <GameList className="md:hidden inline-block" />
        <div className="md:flex md:items-center">
          <div className="md:w-1/3"></div>
          <div className="md:w-2/3">
            <Button>Join Room</Button>
          </div>
        </div>
        <div
          className={
            "md:items-center flex-row mt-6 " + (pending ? "md:flex" : "hidden")
          }
        >
          <div className="md:w-1/3"></div>
          <div className="md:w-2/3 font-bold">Loading...</div>
        </div>
        <div className={"flex-row " + (pending ? "hidden" : "md:flex")}>
          <div className="md:w-1/3"></div>
          <div id="error" className="md:w-2/3 mt-6 text-red-600 font-medium">
            {Errors(state)}
          </div>
        </div>
      </form>
      <div className="w-[2px] h-full bg-gray-50 rounded-lg self-center hidden md:inline-block"></div>
      <div className="hidden md:flex flex-col">
        <GameList className="hidden md:inline-block" />
      </div>
    </>
  );
}

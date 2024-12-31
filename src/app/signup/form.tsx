import { signup } from "@/actions/auth";
import { GetSteamGameName, ParseGameId } from "@/actions/steam";
import { ChangeEvent, JSX, useActionState, useState } from "react";

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

export default function Form() {
  const [inputs, setInputs] = useState<Inputs>({
    name: null,
    "game-id": null,
  });
  const [gameName, setGameName] = useState<string>("Counter-Strike 2");
  let timerId: number | undefined = undefined;
  const [state, action, pending] = useActionState(signup, []);

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
        setGameName("Counter-Strike 2");
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
      <form className="w-full max-w-sm" action={action}>
        <div className="md:flex md:items-center mb-6">
          <div className="md:w-1/3">
            <label
              className="block font-bold md:text-right mb-1 md:mb-0 pr-4"
              htmlFor="inline-name"
            >
              Player Name
            </label>
          </div>
          <div className="md:w-2/3">
            <input
              className="bg-background appearance-none border-2 rounded w-full py-2 px-4 
              leading-tight focus:outline-none focus:text-primary focus:border-primary"
              id="inline-name"
              name="name"
              type="text"
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="md:flex md:items-center mb-1">
          <div className="md:w-1/3"></div>
          <div className="md:w-2/3">
            <span id="game-name">{gameName}</span>
          </div>
        </div>
        <div className="md:flex md:items-center mb-1">
          <div className="md:w-1/3">
            <label
              className="block font-bold md:text-right mb-1 md:mb-0 pr-4"
              htmlFor="inline-game-id"
            >
              Steam Game ID
            </label>
          </div>
          <div className="md:w-2/3">
            <input
              className="bg-background appearance-none border-2 rounded w-full
              py-2 px-4 leading-tight focus:text-primary focus:outline-none
              focus:border-primary"
              id="inline-game-id"
              name="game-id"
              type="text"
              placeholder="730"
              onChange={handleIdChange}
              required
            />
          </div>
        </div>
        <div className="md:flex md:items-center mb-6">
          <div className="md:w-1/3"></div>
          <span className="md:w-2/3 flex flex-col">
            <span>
              https://store.steampowered.com/app/
              <b className="text-primary">730</b>/CounterStrike_2/
            </span>
          </span>
        </div>
        <div className="md:flex md:items-center">
          <div className="md:w-1/3"></div>
          <div className="md:w-2/3">
            <button
              className="border-text border-2 hover:text-primary hover:border-primary focus:bg-primary focus:text-background focus:border-primary font-bold py-2 px-4 rounded"
              type="submit"
            >
              Join Game
            </button>
          </div>
        </div>
      </form>
      <div
        id="indicator"
        className={"md:items-center mt-6 " + (pending ? "block" : "hidden")}
      >
        <div className="md:w-1/3"></div>
        <div className="md:w-2/3 font-bold">Loading...</div>
      </div>
      <div id="error" className="mt-6 text-red-600 font-medium">
        {Errors(state)}
      </div>
    </>
  );
}

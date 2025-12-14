"use client";

import { signup } from "@/actions/auth";
import { GetSteamGameName, ParseGameId } from "@/actions/steam";
import { ChangeEvent, FormEvent, JSX, useState } from "react";
import Button from "@/app/components/Button";
import { CheckRoom } from "@/db/room";
import GameList from "./gameInput";
import NormalInput from "./normalInput";
import { useGLTF } from "@react-three/drei";

useGLTF.preload("/wrapped-present/booster-pack.glb");

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

export type Inputs = {
  name: string | null;
  room: string | null;
  games: string[];
};

export default function Form() {
  const [inputs, setInputs] = useState<Inputs>({
    name: null,
    room: "game",
    games: [],
  });
  const [pending, setPending] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [gameName, setGameName] = useState<string>("Type above");
  const [submitButton, setSubmitButton] = useState<string>(
    "Create or Join Room",
  );
  let timerId: number | undefined = undefined;

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

  const checkRoomAvailability = async (roomId: string) => {
    const exists = await CheckRoom(roomId);
    setSubmitButton(exists ? "Join Room" : "Create Room");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErrors(await signup(inputs));
    setPending(false);
  };

  const handleGameIdChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const inputid = Number(event.target.name);
    const value = event.target.value;
    const { games, ...rest } = inputs;
    games[inputid] = value;
    setInputs({ ...rest, games });
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      if (event.target.value == "") {
        setGameName("Game not found");
        return;
      }
      fetchGameName(event.target.value);
    }, 500) as unknown as number;
  };

  const handleRoomIdChange = async (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(event);
    checkRoomAvailability(event.target.value);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs({ ...inputs, [name]: value });
  };

  return (
    <>
      <form id="signup" className="w-full max-w-sm" onSubmit={handleSubmit}>
        <NormalInput name="name" id="inline-name" onChange={handleChange}>
          Player Name
        </NormalInput>
        <NormalInput
          hidden={true}
          name="room"
          id="inline-room"
          onChange={handleRoomIdChange}
        >
          Room Id
        </NormalInput>
        <GameList
          className="md:hidden block"
          onChange={handleGameIdChange}
          gameName={gameName}
        />
        <div className="md:flex md:items-center">
          <div className="md:w-1/3"></div>
          <div className="md:w-2/3">
            <Button>{submitButton}</Button>
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
            {Errors(errors)}
          </div>
        </div>
      </form>
      <div className="w-[2px] h-full bg-gray-50 rounded-lg self-center hidden md:block mr-2"></div>
      <div className="hidden md:flex flex-col">
        <GameList
          className="hidden md:block"
          onChange={handleGameIdChange}
          gameName={gameName}
        />
      </div>
    </>
  );
}

"use client";

import { signup } from "@/actions/auth";
import { GetSteamGameName, ParseGameId } from "@/actions/steam";
import { ChangeEvent, FormEvent, JSX, useState } from "react";
import Button from "@/app/components/Button";
import { RoomExists } from "@/db/room";
import { useGLTF } from "@react-three/drei";
import Input from "@/app/components/Input";

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
    const exists = await RoomExists(roomId);
    setSubmitButton(exists ? "Join Room" : "Create Room");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErrors(await signup(inputs));
    setPending(false);
  };

  const handleGameIdChange = async (event: ChangeEvent<HTMLInputElement>) => {
    // const inputid = Number(event.target.name);
    const value = event.target.value;
    const { games, ...rest } = inputs;
    // games[inputid] = value;
    games[0] = value;
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
    <form
      id="signup"
      className="flex lg:flex-row lg:gap-5 gap-10 lg:place-items-start place-items-center flex-col px-20 w-full max-w-[80em]"
      onSubmit={handleSubmit}
    >
      <div className="w-[30em] flex flex-col place-items-center">
        <h2 className="font-inknut font-semibold text-3xl text-white pb-1">
          New Gifter
        </h2>
        <p className="text-white font-inter pb-6">
          Enter your player name and room ID
        </p>
        <Input
          id="inline-name"
          name="name"
          placeholder="Player Name"
          onChange={handleChange}
          type="text"
          className="mb-4"
        />
        <Input
          id="inline-room"
          name="room"
          placeholder="Room ID"
          onChange={handleRoomIdChange}
          type="text"
          className="mb-4"
          hidden={true}
        />
        <Button className="mb-6">{submitButton}</Button>
        <div className={`${pending ? "" : "hidden"}`}>
          <div className="font-bold">Loading...</div>
        </div>
        <div className={`${pending ? "hidden" : ""}`}>
          <div id="error" className="text-white italic font-medium text-center">
            {Errors(errors)}
          </div>
        </div>
      </div>
      <div className="grow" />
      <div className="w-[30em] flex flex-col place-items-center justify-items-end">
        <h2 className="font-inknut font-semibold text-3xl text-white pb-1">
          Steam Gift
        </h2>
        <p className="text-white font-inter pb-6">
          Copy the Steam Game URL or ID into the field below
        </p>
        <Input
          id="game"
          name="game"
          type="text"
          placeholder="https://store.steam..."
          onChange={handleGameIdChange}
          form="text"
          className="mb-4"
        />
        <span id="game-name" className="text-white font-inter place-self-start">
          {gameName}
        </span>
      </div>
    </form>
  );
}

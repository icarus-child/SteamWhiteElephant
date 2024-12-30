"use client";

import WrappedPresent from "../components/WrappedPresent";
import Draggable from "../components/Draggable";

export default function PresentsDiv() {
  return (
    <Draggable className="overflow-x-scroll overflow-hidden bg-red-900 flex flex-row gap-5 hide-scrollbar p-5 cursor-grab">
      <WrappedPresent className="bg-[#B8B799]" />
      <WrappedPresent className="bg-[#1E5945]" />
      <WrappedPresent className="bg-[#EFA94A]" />
      <WrappedPresent className="bg-[#31372B]" />
      <WrappedPresent className="bg-[#BDECB6]" />
      <WrappedPresent className="bg-[#828282]" />
      <WrappedPresent className="bg-[#354D73]" />
      <WrappedPresent className="bg-[#B8B799]" />
      <WrappedPresent className="bg-[#1E5945]" />
      <WrappedPresent className="bg-[#EFA94A]" />
      <WrappedPresent className="bg-[#31372B]" />
      <WrappedPresent className="bg-[#BDECB6]" />
      <WrappedPresent className="bg-[#828282]" />
      <WrappedPresent className="bg-[#354D73]" />
    </Draggable>
  );
}
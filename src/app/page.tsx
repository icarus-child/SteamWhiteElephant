import Draggable from "./components/Draggable";
import Present from "./components/Present";
import WrappedPresent from "./components/WrappedPresent";

export default function Home() {
  return (
    <div className="h-screen">
      <Draggable className="overflow-x-scroll overflow-hidden flex flex-row items-center hide-scrollbar p-5 cursor-grab h-2/5 bg-red-700">
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
      <Draggable
        snap={true}
        focus={2}
        className="overflow-x-scroll overflow-hidden flex flex-row hide-scrollbar cursor-grab h-3/5 bg-red-800"
      >
        <Present className="bg-[#B8B799]" />
        <Present className="bg-[#1E5945]" />
        <Present selected={true} className="bg-[#EFA94A]" />
        <Present className="bg-[#31372B]" />
        <Present className="bg-[#BDECB6]" />
        <Present className="bg-[#828282]" />
        <Present className="bg-[#354D73]" />
        <Present className="bg-[#B8B799]" />
        <Present className="bg-[#1E5945]" />
        <Present className="bg-[#EFA94A]" />
        <Present className="bg-[#31372B]" />
        <Present className="bg-[#BDECB6]" />
        <Present className="bg-[#828282]" />
        <Present className="bg-[#354D73]" />
      </Draggable>
    </div>
  );
}

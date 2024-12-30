import PresentsDiv from "./elements/PresentsDiv";
import UsersDiv from "./elements/UsersDiv";

export default function Home() {
  return (
    <div>
      <PresentsDiv />
      <div className="py-10"></div>
      <UsersDiv />
    </div>
  );
}

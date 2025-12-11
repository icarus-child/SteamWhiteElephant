import Input from "@/app/components/Input";
import { ChangeEventHandler } from "react";

type NormalInputProps = {
  children?: React.ReactNode;
  onChange: ChangeEventHandler;
  name: string;
  id: string;
  hidden?: boolean;
};

export default function NormalInput(props: NormalInputProps) {
  return (
    <div
      className={`md:flex md:items-center mb-6 ${props.hidden === true ? "md:hidden hidden" : ""}`}
    >
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
        />
      </div>
    </div>
  );
}

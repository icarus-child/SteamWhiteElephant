import { ChangeEventHandler } from "react";

export type InputProps = {
  className?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  id?: string;
  name?: string;
  type?: string;
  form?: string;
  placeholder?: string;
  disabled?: boolean;
  hidden?: boolean;
};

export default function Input(props: InputProps) {
  let { className, ...rest } = props;
  return (
    <input
      className={`bg-white appearance-none rounded-lg placeholder:text-gray-500 text-black font-inter font-medium w-full py-2 px-4 leading-tight outline-[#af4030] focus:outline-2 ${props.className ? props.className : ""}`}
      {...rest}
    />
  );
}

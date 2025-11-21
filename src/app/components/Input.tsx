import { ChangeEventHandler } from "react";

export type InputProps = {
  className?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  id?: string;
  name?: string;
  type?: string;
  form?: string;
};

export default function Input(props: InputProps) {
  let { className, ...rest } = props;
  className =
    "bg-background appearance-none border-2 rounded w-full py-2 px-4 leading-tight focus:text-primary focus:outline-none focus:border-primary" +
    " " +
    (props.className ? props.className : "");
  return <input className={className} {...rest} />;
}

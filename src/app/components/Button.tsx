export type ButtonProps = {
  children?: React.ReactNode;
  className?: string;
  form?: string;
};

export default function Button(props: ButtonProps) {
  const className = `bg-black text-white font-inter font-medium w-full py-[6px] rounded-lg ${props.className ? props.className : ""}`;
  if (props.form)
    return (
      <button className={className} form={props.form} type="submit">
        {props.children}
      </button>
    );
  else
    return (
      <button className={className} type="submit">
        {props.children}
      </button>
    );
}

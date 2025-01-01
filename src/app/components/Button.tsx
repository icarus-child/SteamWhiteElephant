export type ButtonProps = {
  children?: React.ReactNode;
  className?: string;
  form?: string;
};

export default function Button(props: ButtonProps) {
  const className =
    "border-text border-2 hover:text-primary hover:border-primary focus:bg-primary focus:text-background focus:border-primary font-bold py-2 px-4 rounded" +
    " " +
    (props.className ? props.className : "");
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

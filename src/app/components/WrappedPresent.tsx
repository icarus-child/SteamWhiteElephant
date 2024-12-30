export type PresentPlaceholderProps = {
  className: string;
};

export default function PresentPlaceholder(props: PresentPlaceholderProps) {
  return (
    <div className="h-60 min-w-52 pointer-events-none snap-center px-5">
      <div className={"rounded-lg z-20 w-full h-full " + props.className}></div>
    </div>
  );
}

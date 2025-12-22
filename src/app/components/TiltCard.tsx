import Tilt from "react-parallax-tilt";

export default function TiltCard({
  children,
  url,
  height,
  width,
}: {
  children: React.ReactNode;
  url: string;
  height?: string;
  width?: string;
}) {
  return (
    <Tilt
      className={`${width ? width : "w-[65%]"} ${height ? height : "h-[65%]"} flex flex-col place-items-center`}
      tiltMaxAngleX={16}
      tiltMaxAngleY={16}
      transitionSpeed={500}
      scale={1}
      trackOnWindow={false}
      tiltReverse={true}
    >
      <div
        className={"3xl:rounded-3xl rounded-2xl size-full relative"}
        style={{
          backgroundImage: `
                  linear-gradient(
                    #00000000 50%,
                    #220000 87%,
                    #440000 100%
                  ),
                  url('${url}')
                `,
          backgroundSize: "cover, 105%",
          backgroundPosition: "center, center",
          backgroundRepeat: "no-repeat, no-repeat",
          border: "6px solid #440000",
        }}
      >
        {children}
      </div>
    </Tilt>
  );
}

"use client";

import Form from "./components/form";

export default function Signup() {
  return (
    <div className="grid w-full h-screen place-content-center">
      <div className="bg-purple-700 w-96 md:w-fit md:max-w-[768px] md:h-96 md:p-5 p-5 rounded-xl flex flex-col md:flex-row">
        <Form />
      </div>
    </div>
  );
}

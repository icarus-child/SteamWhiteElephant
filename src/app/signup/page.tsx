"use client";

import Form from "./form";

export default function Signup() {
  return (
    <div className="grid w-full h-screen place-content-center">
      <div className="bg-red-700 w-96 md:w-full flex flex-row gap-5">
        <Form />
        <div className="w-1 h-5/6 bg-gray-50 rounded-lg self-center"></div>
        <div>testtest</div>
      </div>
    </div>
  );
}

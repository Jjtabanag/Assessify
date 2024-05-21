import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useState } from "react"

// const modules = {
//   "toolbar": [
//     [{ header: [1, 2, 3, 4, 5, 6, false] }],
//     [{size: []}],
//   ]
// }

const TextEditor = () => {

  const [value, setValue] = useState("");

  return (
      <div className="relative h-screen w-full">
        <div className="flex h-full">
          <div className="relative w-1/2 flex justify-center items-center">
            <ReactQuill
              theme="snow"
              className="h-full w-full"
              placeholder="Write your lesson here..."
              value={value}
              onChange={setValue}
              // modules={modules}
            />
          </div>
          <div className="relative w-1/2 flex justify-center items-center border-l border-black">
            {value}
          </div>
        </div>
      </div>
  );
}

export default TextEditor
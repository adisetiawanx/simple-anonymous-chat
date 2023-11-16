import { useEffect, useState } from "react";
import { io } from "socket.io-client";
const socketInstance = io("http://localhost:5000", {
  autoConnect: false,
});

const noUser =
  "User-" + Math.round(Math.random() * 100 + Date.now()).toString();

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    socketInstance.connect();

    socketInstance.emit("enterRoom", {
      name: `${noUser}`,
      room: "testing",
    });

    socketInstance.on("message", ({ name, text, time }) => {
      if (name === "sistem" && text.includes("left")) {
        setIsDisabled(true);
      }
      setMessages((prevState) => {
        return [
          ...prevState,
          {
            name,
            text,
            time,
          },
        ];
      });
    });
    // setInterval(() => {
    //   setMessages((prevState) => {
    //     return prevState.filter((data) => data.name !== "sistem");
    //   });
    // }, 5000);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  function sendMessageHandler(ev) {
    ev.preventDefault();
    socketInstance.emit("message", {
      name: `${noUser}`,
      text: inputMessage,
    });
    setInputMessage("");
  }

  return (
    <>
      <header className="sticky top-0 right-0 left-0 bg-slate-800 py-3">
        <h1 className="text-center text-2xl text-white font-bold shadow-sm">
          Welcome
        </h1>
      </header>
      <div className="max-w-4xl mx-auto p-4">
        <ul className="space-y-3 ">
          {messages.map((data, index) => (
            <li
              key={index}
              className={`flex ${
                noUser === data.name ? "justify-end" : "justify-start"
              }`}
            >
              {data.name === "sistem" ? (
                <div className="bg-white rounded-md p-2.5 w-[100%] mx-auto">
                  <span className="bg-red-500 mx-1 text-white px-2.5 py-1 rounded-md shadow font-semibold">
                    Alert
                  </span>
                  <p className="inline px-2">{data.text}</p>
                </div>
              ) : (
                <div
                  className={`w-fit  rounded-md py-2.5 px-4 max-w-[40%] ${
                    noUser === data.name ? "bg-white" : "bg-blue-300"
                  }`}
                >
                  <p className="inline font-semibold">{data.text}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="fixed bottom-0 right-0 left-0 bg-slate-800 p-3 shadow-sm">
        <form
          onSubmit={sendMessageHandler}
          className="flex gap-3 items-center max-w-5xl mx-auto"
        >
          {!isDisabled ? (
            <>
              <div className="flex-1">
                <input
                  value={inputMessage}
                  onChange={(ev) => setInputMessage(ev.target.value)}
                  className="w-full rounded shadow-md py-1.5 px-2 border outline-0"
                  autoComplete="false"
                  autoCorrect="false"
                  spellCheck="false"
                />
              </div>
              <button
                type="submit"
                className="py-1.5 px-7 shadow-md rounded bg-slate-400 hover:bg-gray-300 text-white font-bold"
              >
                Send
              </button>
            </>
          ) : (
            <button
              onClick={() => window.location.reload()}
              type="button"
              className="w-full py-1.5 px-7 shadow-md rounded bg-red-400 hover:bg-red-300 text-white font-bold"
            >
              Reload
            </button>
          )}
        </form>
      </div>
    </>
  );
}

export default App;

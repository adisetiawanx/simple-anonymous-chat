import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Loading from "./components/Loading";
const socketInstance = io("ws://127.0.0.1:5000", {
  autoConnect: false,
});

const noUser = "u-" + Date.now().toString();

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socketInstance.connect();

    socketInstance.emit("enterRoom", {
      name: `${noUser}`,
    });

    socketInstance.on("message", ({ name, text, time }) => {
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

    socketInstance.on("available-users", (users) => {
      setAvailableUsers(users);
    });

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

  function findSomeoneHandler() {
    setLoading(true);
    socketInstance.disconnect();
    socketInstance.connect();

    socketInstance.emit("enterRoom", {
      name: `${noUser}`,
    });
    setTimeout(() => setLoading(false), 5000);
  }

  return (
    <>
      <header className="sticky top-0 right-0 left-0 bg-slate-800 py-3">
        {availableUsers.length < 2 ? (
          <div className="bg-gray-600 text-white rounded-md py-1.5 px-7 w-fit mx-auto shadow-md">
            {loading ? (
              <p className="text-center font-semibold text-xl text-blue-400">
                Finding someone room...
              </p>
            ) : (
              <p className="text-center font-semibold text-xl">
                Waiting someone to join...
              </p>
            )}
          </div>
        ) : (
          <h1 className="text-center text-xl text-white font-bold shadow-sm">
            <span className="text-yellow-300">
              {availableUsers[0] === noUser ? "You" : availableUsers[0]}
            </span>{" "}
            and{" "}
            <span className="text-yellow-300">
              {availableUsers[1] === noUser ? "You" : availableUsers[1]}
            </span>
          </h1>
        )}
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
                  <span className="bg-red-500 mx-1 text-white py-1 px-2 lg:py-1.5 lg:px-4 rounded-md shadow font-semibold">
                    Alert
                  </span>
                  <p className="inline px-2">{data.text}</p>
                </div>
              ) : (
                <div
                  className={`w-fit  rounded-md py-1 px-3 lg:py-2.5 lg:px-4 max-w-[40%] ${
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
          {availableUsers.length > 1 ? (
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
            <>
              {loading ? (
                <div className="w-full flex justify-center bg-slate-400 shadow-md rounded">
                  <Loading />
                </div>
              ) : (
                <button
                  disabled={loading}
                  onClick={findSomeoneHandler}
                  type="button"
                  className="w-full text-center text-xl py-1.5 px-7 shadow-md rounded bg-slate-500 hover:bg-slate-400 text-white font-bold"
                >
                  Waiting someone or{" "}
                  <span className="text-yellow-300">
                    click here to find someone
                  </span>
                </button>
              )}
            </>
          )}
        </form>
      </div>
    </>
  );
}

export default App;

import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // Statistics
  const [difficultyStats, setDifficultyStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "https://leetbat-server.onrender.com/api/notes"
        );
        setData(res.data);
        setFilteredData(res.data);

        // Extract unique topics for filtering
        const uniqueTopics = [
          ...new Set(res.data.flatMap((note) => note.questionTopics)),
        ];
        setTopics(uniqueTopics);

        // Calculate difficulty statistics
        const stats = {
          easy: res.data.filter((note) => note.difficulty === "Easy").length,
          medium: res.data.filter((note) => note.difficulty === "Medium")
            .length,
          hard: res.data.filter((note) => note.difficulty === "Hard").length,
        };
        setDifficultyStats(stats);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = data;

    if (selectedTopic) {
      filtered = filtered.filter((note) =>
        note.questionTopics.includes(selectedTopic)
      );
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(
        (note) => note.difficulty === selectedDifficulty
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOrder != "asc") {
        return new Date(a.timestamp) - new Date(b.timestamp); // Oldest first
      } else {
        return new Date(b.timestamp) - new Date(a.timestamp); // Newest first
      }
    });

    setFilteredData(filtered);
  }, [selectedTopic, selectedDifficulty, sortOrder, data]);

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case "Hard":
        return "bg-red-700 ";
      case "Medium":
        return "bg-orange-500";
      case "Easy":
        return "bg-green-500 ";
      default:
        return "bg-gray-600 ";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-5">
      <h1 className="text-4xl font-extrabold text-gray-300 mb-8 text-center drop-shadow-lg flex justify-center items-center">
        <img src="/batman.png" className=" w-[150px]" alt="" />
      </h1>

      {/* Difficulty Stats at the top */}
      <div className="flex  p-4 rounded-lg mb-6  gap-10">
        <span className="text-gray-300 font-bold">
          Easy: {difficultyStats.easy}
        </span>
        <span className="text-gray-300 font-bold">
          Medium: {difficultyStats.medium}
        </span>
        <span className="text-gray-300 font-bold">
          Hard: {difficultyStats.hard}
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-8 flex-wrap rounded-lg  mb-6">
        <div>
          <select
            id="topic"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-gray-900 text-gray-300 border-2 border-none p-2 rounded-md focus:outline-none focus:border-yellow-500"
          >
            <option value="">All Topics</option>
            {topics.map((topic, index) => (
              <option key={index} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            id="difficulty"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-gray-900 text-gray-300 border-2 border-none p-2 rounded-md focus:outline-none focus:border-yellow-500"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <select
            id="sort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-gray-900 text-gray-300 border-2 border-none p-2 rounded-md focus:outline-none focus:border-yellow-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Notes Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-gray-300 rounded-lg shadow-lg ">
          <thead className="">
            <tr>
              <th className="p-4 border-b border-gray-700 ">#</th>
              <th className="p-4 border-b border-gray-700">Question Name</th>
              <th className="p-4 border-b border-gray-700">Note</th>
              <th className="p-4 border-b border-gray-700">Topics</th>
              <th className="p-4 border-b border-gray-700">Question Number</th>
              <th className="p-4 border-b border-gray-700">Difficulty</th>
              <th className="p-4 border-b border-gray-700">Timestamp</th>
              <th className="p-4 border-b border-gray-700">URL</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((note, index) => (
              <tr key={note._id} className="hover:bg-gray-700">
                <td className="p-4">{index + 1}</td>
                <td className="p-4">{note.questionName}</td>
                <td className="p-4">{note.note}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {note.questionTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4">{note.questionNumber}</td>
                <td className="p-4">
                  <span
                    className={`p-2 rounded-full text-white ${getDifficultyStyle(
                      note.difficulty
                    )}`}
                  >
                    {note.difficulty || "N/A"}
                  </span>
                </td>
                <td className="p-4">
                  {new Date(note.timestamp).toLocaleString()}
                </td>
                <td className="p-4">
                  <a
                    href={note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-yellow-500"
                  >
                    View Question
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;

import { useSnackbar } from "notistack";
import { useCallback, useEffect, useState } from "react";
import { getAllPolls } from "../services/poll";

const Dashboard = () => {
    const [polls, setPolls] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [loading, setLoading] = useState(false);

    const { enqueueSnackbar } = useSnackbar();

    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            const response = await getAllPolls();

            console.log(response);

            setPolls(Array.isArray(response) ? response : []);
        } catch (error) {
            enqueueSnackbar("Fetching polls failed", {
                variant: "error",
                autoHideDuration: 5000,
            });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOptionChange = (pollId, optionId) => {
        setSelectedOptions((prevSelectedOptions) => ({
            ...prevSelectedOptions,
            [pollId]: optionId,
        }));
    };

    const handleVote = async (pollId) => {
        const selectedOptionId = selectedOptions[pollId];

        if (!selectedOptionId) {
            enqueueSnackbar("Choose an option first", {
                variant: "warning",
                autoHideDuration: 4000,
            });
            return;
        }

        console.log("Poll id:", pollId);
        console.log("Selected option id:", selectedOptionId);

        enqueueSnackbar("Vote endpoint is not connected yet", {
            variant: "info",
            autoHideDuration: 5000,
        });
    };

    const formatDate = (date) => {
        if (!date) {
            return "No expiration date";
        }

        return new Date(date).toLocaleString("pl-PL");
    };

    const isExpired = (date) => {
        if (!date) {
            return false;
        }

        return new Date(date) < new Date();
    };

    return (
        <main className="min-h-[calc(100vh-73px)] bg-gray-50 px-6 py-10">
            <section className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Dashboard
                    </h1>

                    <p className="text-gray-500">
                        Browse polls and vote for your answer.
                    </p>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                        <p className="text-gray-500">Loading polls...</p>
                    </div>
                ) : polls.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900">
                            No polls yet
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Create your first poll to see it here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        {polls.map((poll) => {
                            const expired = isExpired(poll.expiredAt);
                            const options = Array.isArray(poll.optionsDTOS)
                                ? poll.optionsDTOS
                                : [];

                            return (
                                <article
                                    key={poll.id}
                                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col h-full"
                                >
                                    <div className="mb-4">
                                        {poll.userName && (
                                            <p className="text-sm text-gray-500 mb-2">
                                                Created by{" "}
                                                <span className="font-semibold text-gray-700">
                                                    {poll.userName}
                                                </span>
                                            </p>
                                        )}

                                        <div className="flex items-start justify-between gap-4">
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {poll.question}
                                            </h2>

                                            <span
                                                className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                                                    expired
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-green-100 text-green-700"
                                                }`}
                                            >
                                                {expired ? "Expired" : "Active"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-5">
                                        {options.map((option) => (
                                            <label
                                                key={option.id}
                                                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition ${
                                                    expired || poll.voted
                                                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <input
                                                        type="radio"
                                                        name={`poll-${poll.id}`}
                                                        value={option.id}
                                                        disabled={expired || poll.voted}
                                                        checked={
                                                            selectedOptions[poll.id] === option.id ||
                                                            option.userVotedThisOption
                                                        }
                                                        onChange={() =>
                                                            handleOptionChange(poll.id, option.id)
                                                        }
                                                        className="w-4 h-4 shrink-0"
                                                    />

                                                    <span className="wrap-break-word">
                                                        {option.title}
                                                    </span>
                                                </div>

                                                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                                                    {option.voteCount} votes
                                                </span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="mt-auto">
                                        <div className="text-sm text-gray-500 border-t border-gray-100 pt-4 mb-4">
                                            Expires at:{" "}
                                            <span className="font-medium text-gray-700">
                                                {formatDate(poll.expiredAt)}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={expired || poll.voted}
                                            onClick={() => handleVote(poll.id)}
                                            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                                        >
                                            {expired
                                                ? "Poll expired"
                                                : poll.voted
                                                    ? "Already voted"
                                                    : "Vote"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
};

export default Dashboard;
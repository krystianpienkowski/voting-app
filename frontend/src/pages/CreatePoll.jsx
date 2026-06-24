import { useSnackbar } from "notistack";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { postPoll } from "../services/poll";


const CreatePoll = () => {
    const [formData, setFormData] = useState({
        question: "",
        options: ["", ""],
        expiredAt: "",
    });

    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...formData.options];
        updatedOptions[index] = value;

        setFormData({
            ...formData,
            options: updatedOptions,
        });
    };

    const handleAddOption = () => {
        setFormData({
            ...formData,
            options: [...formData.options, ""],
        });
    };

    const handleRemoveOption = (index) => {
        if (formData.options.length <= 2) {
            enqueueSnackbar("Poll must have at least 2 options", {
                variant: "warning",
                autoHideDuration: 4000,
            });
            return;
        }

        const updatedOptions = formData.options.filter((_, i) => i !== index);

        setFormData({
            ...formData,
            options: updatedOptions,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const selectedDate = new Date(formData.expiredAt);
        const now = new Date();

        if (selectedDate <= now) {
            enqueueSnackbar("Expiration date must be in the future", {
                variant: "error",
                autoHideDuration: 5000,
            });

            setLoading(false);
            return;
        }

        try {

            const obj = {
                question: formData.question,
                options: formData.options,
                expiredAt: selectedDate.toISOString()
            };

            const response = await postPoll(obj);

            enqueueSnackbar("Poll created", {
                variant: "success",
                autoHideDuration: 5000,
            });

            navigate("/dashboard");
        } catch (error) {
            enqueueSnackbar("Creating poll failed", {
                variant: "error",
                autoHideDuration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-[calc(100vh-73px)] bg-gray-50 flex items-center justify-center px-6">
            <section className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-600 flex items-center justify-center">
                        <img
                            src={logo}
                            alt="VoteApp logo"
                            className="w-8 h-8 object-contain brightness-0 invert"
                        />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Create poll
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Add a question, possible answers and expiration date.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="question"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Question
                        </label>

                        <input
                            id="question"
                            type="text"
                            name="question"
                            value={formData.question}
                            onChange={handleInputChange}
                            placeholder="What do you want to ask?"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options
                        </label>

                        <div className="space-y-3">
                            {formData.options.map((option, index) => (
                                <div key={index} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) =>
                                            handleOptionChange(index, e.target.value)
                                        }
                                        placeholder={`Option ${index + 1}`}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(index)}
                                        className="px-4 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleAddOption}
                            className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                        >
                            + Add option
                        </button>
                    </div>

                    <div>
                        <label
                            htmlFor="expiredAt"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Expiration date
                        </label>

                        <input
                            id="expiredAt"
                            type="datetime-local"
                            name="expiredAt"
                            value={formData.expiredAt}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
                    >
                        {loading ? "Creating poll..." : "Create poll"}
                    </button>
                </form>
            </section>
        </main>
    );
};

export default CreatePoll;
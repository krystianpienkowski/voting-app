import { Link } from "react-router-dom"
import logo from "../assets/logo.svg";

const Navbar = () => {
    return (
        <header className="w-full bg-white shadow-sm border-b border-gray-200">
            <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                
                 <Link to="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                        <img
                            src={logo}
                            alt="VoteApp logo"
                            className="w-6 h-6 object-contain brightness-0 invert"
                        />
                    </div>

                    <span className="text-2xl font-bold text-gray-900">
                        VoteApp
                    </span>
                </Link>

                <ul className="flex items-center gap-4 text-gray-700 font-medium">
                    <li>
                        <Link 
                            to="/login" 
                            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            Login
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/signup"
                            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            Register
                        </Link>
                    </li>
                </ul>

            </nav>
        </header>
    )
}

export default Navbar
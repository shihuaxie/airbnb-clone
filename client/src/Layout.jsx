import Header from "./components/Header.jsx";
import {Outlet} from "react-router-dom";
export default function Layout() {
    return(
        <div className="p-4">
            <Header/>
            <Outlet/>
        </div>
    )
}
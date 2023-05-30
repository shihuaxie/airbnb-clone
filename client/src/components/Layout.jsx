import Header from "./Header.jsx";
import {Outlet} from "react-router-dom";
export default function Layout() {
    return(
        <div className="p-4 px-8 flex flex-col min-h-screen">
            <Header/>
            <Outlet/>
        </div>
    )
}
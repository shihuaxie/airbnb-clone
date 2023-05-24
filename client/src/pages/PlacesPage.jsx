import {Link, useParams} from "react-router-dom";
import {act} from "react-dom/test-utils";

export default function PlacesPage() {
    const {action} = useParams();
    //console.log(action); output---new
    return (
        <div>
            {/*not click add new, shows the add new places button*/}
            {action !== 'new' && (
                <div className="text-center">
                    <Link className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full"
                          to={'/account/places/new'}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                        </svg>
                        Add new places
                    </Link>
                </div>
            )}
            {/*when click add new place, then shows place page*/}
            {action === 'new' && (
                <div>
                    <form>
                        <h2 className="text-2xl mt-4">Title</h2>
                        <p className="text-sm text-gray-500">Title for your place, should be short and catchy for
                            advertising.</p>
                        <input type="text" placeholder="title, for example: my lovely aprtment "/>
                        <h2 className="text-2xl mt-4">Address</h2>
                        <p className="text-sm text-gray-500">Address to this place.</p>
                        <input type="text" placeholder="address"/>
                        <h2 className="text-2xl mt-4">Photos</h2>
                        <p className="text-sm text-gray-500">More = Better</p>
                        <div className="mt-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            <button className="border bg-transparent rounded-2xl p-8 text-2xl text-gray-600">+</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
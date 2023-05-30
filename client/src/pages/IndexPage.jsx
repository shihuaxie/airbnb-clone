import {useEffect, useState} from "react";
import axios from "axios";

export default function IndexPage() {
    const [places, setPlaces] = useState([]);
    //fetch our places data
    useEffect(() => {
        axios.get('/places').then(res => {
                setPlaces([...res.data, ...res.data, ...res.data, ...res.data]);
            });
    }, [])

    return (
        <div className="mt-8 gap-x-6 gap-y-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
            {places.length > 0 && places.map(place =>(
                <div>
                    <div className="bg-gray-500 mb-2 rounded-2xl flex ">
                        {place.photos?.[0] && (
                            <img className="rounded-2xl object-cover aspect-square" src={'http://localhost:4000/uploads/' + place.photos?.[0]} alt=""/>
                        )}
                    </div>
                   <h2 className="text-sm truncate"> {place.title}</h2>
                    <h3 className="font-bold">{place.address}</h3>
                </div>
                ))}
        </div>
    );
}
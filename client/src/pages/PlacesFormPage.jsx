import PhotoUpload from "../components/AddPlace/PhotoUpload.jsx";
import Perks from "../components/AddPlace/Perks.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import {Navigate, useParams} from "react-router-dom";
import AccountNav from "../components/AccountNav.jsx";

export default function PlacesFormPage() {
    const {id} = useParams();

    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [addedPhotos, setAddedPhotos] = useState('');
    const [description, setDescription] = useState('');
    const [perks, setPerks] = useState([]);
    const [extraInfo, setExtraInfo] = useState('');
    const [checkin, setCheckin] = useState('');
    const [checkout, setCheckout] = useState('');
    const [maxGuests, setMaxGuests] = useState('');
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get('/places/' + id).then(res=>{
                const{data} = res;
                setTitle(data.title);
                setAddress(data.address);
                setAddedPhotos(data.photos);
                setDescription(data.description);
                setPerks(data.perks);
                setExtraInfo(data.extraInfo);
                setCheckin(data.checkIn);
                setCheckout(data.checkOut);
                setMaxGuests(data.maxGuests);
            }
        )
    },[id])


    function inputHeader(text) {
        return (
            <h2 className="text-2xl mt-4">{text}</h2>
        )
    }

    function inputDescription(text) {
        return (
            <p className="text-sm text-gray-500"> {text}</p>
        )
    }

    function preInput(header, description) {
        return (
            <>
                {inputHeader(header)}
                {inputDescription(description)}
            </>
        )
    }

    async function savePlace(e) {
        e.preventDefault();
        const placeData = {
            title, address, addedPhotos,
            description, perks, extraInfo,
            checkout, checkin, maxGuests
        };
        if(id){
            //update
            const {data: responseData} = await axios.put('/places', {id, ...placeData});
            setRedirect(true);
        } else {
            //new place
            await axios.post('/places', placeData);
            setRedirect(true);
        }
    }

    if (redirect) {
        return <Navigate to={'/account/places'}/>
    }

    return (
        <div>
            <AccountNav/>
            <form onSubmit={savePlace}>
                {preInput('Title', 'Title for your place, should be short and catchy for advertising')}
                <input type="text"
                       value={title} onChange={e => setTitle(e.target.value)}
                       placeholder="title, for example: my lovely aprtment "/>

                {preInput('Address', 'Address to this place')}
                <input type="text"
                       value={address} onChange={e => setAddress(e.target.value)}
                       placeholder="address"/>

                {preInput('Photos', 'more = better')}
                <PhotoUpload addedPhotos={addedPhotos} onChange={setAddedPhotos}/>

                {preInput('Description', 'description of the place')}
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />

                {preInput('Perks', 'select all the perks of your place')}
                <div className="grid gap-2 mt-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 ">
                    <Perks selected={perks} onChange={setPerks}/>
                </div>

                {preInput('Extra info', 'house rules, etc')}
                <textarea
                    value={extraInfo}
                    onChange={e => setExtraInfo(e.target.value)}
                />
                {preInput('Check in&out times', 'add check in and out, and guests')}
                <div className="grid gap-2 sm:grid-cols-3">
                    <div>
                        <h3 className="mt-2 -mb-1">Check in time</h3>
                        <input type="text"
                               value={checkin}
                               onChange={e => setCheckin(e.target.value)}
                               placeholder="14"/>
                    </div>
                    <div>
                        <h3 className="mt-2 -mb-1">Check out time</h3>
                        <input type="text"
                               value={checkout}
                               onChange={e => setCheckout(e.target.value)}
                               placeholder="11"/>
                    </div>
                    <div>
                        <h3 className="mt-2 -mb-1">Max number of guests</h3>
                        <input type="number"
                               value={maxGuests}
                               onChange={e => setMaxGuests(e.target.value)}
                        />
                    </div>
                </div>
                <button className="primary my-4">Save</button>
            </form>
        </div>
    )
}
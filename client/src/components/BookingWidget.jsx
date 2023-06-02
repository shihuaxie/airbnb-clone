import {useState} from "react";
import {differenceInCalendarDays} from "date-fns";
import axios from "axios";
import {Navigate} from "react-router-dom";

export default function BookingWidget({place}) {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guestsNum, setGuestsNum] = useState(1);
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [redirect, setRedirect] = useState('');

    let numberOfNights = 0;
    if (checkIn && checkOut) {
        numberOfNights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
    }

    async function bookThisPlace() {
        const data = {
            place: place._id,
            price: numberOfNights * place.price,
            checkIn, checkOut, name, mobile, guestsNum,
        }
        const res = await axios.post('/bookings', data);
        const bookingId = res.data._id;
        setRedirect(`/account/bookings/${bookingId}`);
    }

    if (redirect) {
        return <Navigate to={redirect} />
    }

    return (
        <div>
            <div className="bg-white p-4 rounded-2xl shadow">
                <div className="text-2xl text-center">
                    Price: ${place.price} / per night
                </div>
                <div className="border  rounded-2xl mt-4">
                    <div className="flex">
                        <div className="py-3 px-4">
                            <label>Check in:</label>
                            <input
                                type="date"
                                value={checkIn}
                                onChange={e => setCheckIn(e.target.value)}
                            />
                        </div>
                        <div className="py-3 px-4 border-l">
                            <label>Check out:</label>
                            <input
                                type="date"
                                value={checkOut}
                                onChange={e => setCheckOut(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="py-3 px-4 border-t">
                        <label>Number of guests:</label>
                        <input
                            type="number"
                            value={guestsNum}
                            onChange={e => setGuestsNum(e.target.value)}
                        />
                    </div>
                    {numberOfNights > 0 && (
                        <div className="py-3 px-4 border-1">
                            <label>Your full name:</label>
                            <input type="text"
                                   value={name}
                                   onChange={e => setName(e.target.value)}
                            />
                            <label>Phone number:</label>
                            <input type="tel"
                                   value={mobile}
                                   onChange={e => setMobile(e.target.value)}
                            />
                        </div>
                    )}
                </div>
                <button onClick={bookThisPlace} className="primary">
                    Book this place
                    {numberOfNights > 0 && (
                        <span> ${numberOfNights * place.price}</span>
                    )}
                </button>
            </div>
        </div>
    )
}
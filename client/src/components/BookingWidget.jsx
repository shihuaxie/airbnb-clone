export default function BookingWidget({place}) {
    return(
       <div>
           <div className="bg-white p-4 rounded-2xl shadow">
               <div className="text-2xl text-center">
                   Price: ${place.price} / per night
               </div>
               <div className="border  rounded-2xl mt-4">
                   <div className="flex">
                       <div className="py-3 px-4">
                           <label>Check in:</label>
                           <input type="date"/>
                       </div>
                       <div className="py-3 px-4 border-l">
                           <label>Check out:</label>
                           <input type="date"/>
                       </div>
                   </div>

                   <div className="py-3 px-4 border-t">
                       <label>Number of guests:</label>
                       <input type="number" value={1}/>
                   </div>
               </div>
               <button className="primary">Book this place</button>
           </div>
       </div>
    )
}
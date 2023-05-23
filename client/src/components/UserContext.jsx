import {createContext, useEffect, useState} from "react";
import axios from "axios";

export const UserContext = createContext({});

//UserContextProvider wrapped my pages in App.js, pages r children.
export function UserContextProvider({children}) {

    const [user, setUser] = useState(null);

    useEffect(() => {
        if (!user) {
            axios.get('/profile').then(({data}) => {
                setUser(data);
            });
        }
    }, [])

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    )
}
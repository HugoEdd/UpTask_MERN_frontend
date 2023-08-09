import { useContext } from 'react';
// useContext - es para acceder a la informacion de un context
import AuthContext from '../context/AuthProvider';

const useAuth = () => {
    // este hook va a leer todo lo que tengamos en el context que es los datos del inicio de sesión
    return useContext(AuthContext);
}

export default useAuth;
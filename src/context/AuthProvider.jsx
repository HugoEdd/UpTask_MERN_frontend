import { useState, useEffect, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../config/clienteAxios';

const AuthContext = createContext();

// Componente Provedor
const AuthProvider = ({ children }) => { // Esto es lo que rodea toda la aplicación, children - todo lo que este aqui estara disponible gracias a el

    const [auth, setAuth] = useState({});
    // nota: CREAR FUNCION SI VAMOS A LLAMAR VARIOS HOOKS, PERO SINO MANDARLO DIRECTAMENTE
    // cuando se hace la ruta protegida consulta la api, pero inicia con el state en vacio y luego ya tiene info, se tarda en llegar la info de validación
    const [cargando, setCargando] = useState(true);

    const navigate = useNavigate();

    // Este useEffect solamente se va a encargar de comprobar de que exista un token
    useEffect(() => {
        // si existe un token va intentar enviarlo hacia la API
        const auntenticarUsuario = async () => {
            const token = localStorage.getItem('token');
            // solamente SI hay un token vamos a intentar autenticar al usuario
            if (!token) {
                setCargando(false);
                return;
            }

            // Enviar el bearer token como config, eso es lo que se declare en el backend
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            try{
                const { data } = await clienteAxios('/usuarios/perfil', config);
                setAuth(data);
                // navigate('/proyectos'); OPCIONAL
            } catch (error) {
                setAuth({})
            }
            
            setCargando(false);
        }

        auntenticarUsuario()
    }, []);


    const cerrarSesionAuth = () => {
        setAuth({});
    }

    return (
        <AuthContext.Provider value={{auth, setAuth, cargando, cerrarSesionAuth}}>
            {children}
        </AuthContext.Provider>
    )
}

// Lo exportamos como un export nombrado
export {
    AuthProvider
}

export default AuthContext;
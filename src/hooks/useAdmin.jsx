import useProyectos from "./useProyectos";
import useAuth from "./useAuth";


const useAdmin = () => {
    const { proyecto } = useProyectos();
    const { auth } = useAuth();

    return proyecto.creador === auth._id;
    // SI son iguales significa que es un admin
}


export default useAdmin;
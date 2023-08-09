import { useState, useEffect, createContext } from 'react';
import clienteAxios from '../config/clienteAxios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import io from 'socket.io-client';

let socket;

const ProyectosContext = createContext();

const ProyectosProvider = ({children}) => {

    const [proyectos, setProyectos] = useState([]);
    const [alerta, setAlerta] = useState({});
    const [proyecto, setProyecto] = useState({});
    const [cargando, setCargando] = useState(false); // error de flash cuando carga proyecto
    const [modalFormularioTarea, setModalFormularioTarea] = useState(false); // Inicia como false por que no va a estar visible todo el tiempo
    const [tarea, setTarea] = useState({});
    const [modalEliminarTarea, setModalEliminarTarea] = useState(false);
    const [colaborador, setColaborador] = useState({});
    const [modalEliminarColaborador, setModalEliminarColaborador] = useState(false);
    const [buscador, setBuscador] = useState(false);

    const navigate = useNavigate();
    const { auth } = useAuth();

    useEffect(() => {
        const obtenerProyectos = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
                const { data } = await clienteAxios('/proyectos', config);
                setProyectos(data);

            } catch (error) {
                console.log(error);
            } 
        }

        obtenerProyectos();
    }, [auth]);
    // cuado cambie el auth que pasamos como dependecia, lo manda a llamar automaticamente

    // se va a encargar unicamente de la conexión hacia socket.io
    useEffect(() => {
        socket = io(import.meta.env.VITE_BACKEND_URL);
    }, []);

    const mostrarAlerta = alerta => {
        setAlerta(alerta);

        setTimeout(() => {
            // Resetea la alerta
            setAlerta({});
        }, 5000);
    }

    const submitProyecto = async proyecto => {

        if (proyecto.id) {
            await editarProyecto(proyecto);
        } else {
            await nuevoProyecto(proyecto);
        }  
    }

    const editarProyecto = async proyecto => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            const { data } = await clienteAxios.put(`/proyectos/${proyecto.id}`, proyecto, config);
            // Sincronizar el state
            const proyectosActualizados = proyectos.map(proyectoState => proyectoState._id === data._id ? data :
                proyectoState);
            
            setProyectos(proyectosActualizados);

            // Mostrar la alerta
               setAlerta({
                msg: 'Proyecto Actualizado Correctamente',
                error: false
            });

            setTimeout(() => {
                setAlerta({});
                navigate('/proyectos');
            }, 3000);

            // Redireccionar
        } catch (error) {
            console.log(error);
        }
    }

    const nuevoProyecto = async proyecto => {
         // Enviar el token que es la autorización que esta en el Storage
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.post('/proyectos', proyecto, config);
            setProyectos([...proyectos, data]); // tomamaos copia de los proyectos actuales y al final agregamos data. data viene de la db, es igual que hubieramos consultado de la db
            setAlerta({
                msg: 'Proyecto Creado Correctamente',
                error: false
            });

            setTimeout(() => {
                setAlerta({});
                navigate('/proyectos');
            }, 3000);

        } catch (error) {
            console.log(error);
        }
    }


    const obtenerProyecto = async id => {
        setCargando(true);
        try {

            const token = localStorage.getItem('token');
            if (!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios(`/proyectos/${id}`, config);
            setProyecto(data);
            setAlerta({});
            
        } catch (error) {
            navigate('/proyectos'); // si algun usuario que no tiene permiso lo lleva de nuevo hacia permiso
            setAlerta({
                msg: error.response.data.msg,
                error: true
            });
            setTimeout(() => {
                setAlerta({});
            }, 3000);
        } finally {
            setCargando(false);
        }
    }

    const eliminarProyecto = async id => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.delete(`/proyectos/${id}`, config);

            // sincronizar el state
            const proyectosActualizados = proyectos.filter(proyectoState => proyectoState._id !== id); // recuperar los 4 que son diferentes al que elimine
            setProyectos(proyectosActualizados);

            setAlerta({
                msg: data.msg,
                error: false
            })

             setTimeout(() => {
                setAlerta({});
                navigate('/proyectos');
             }, 3000);
            
        } catch (error) {
            console.log(error);
        }
    }

    const handleModalTarea = () => {
        setModalFormularioTarea(!modalFormularioTarea); // SIEMPRE VA A SER LO CONTRARIO, SI ESTA COMO TRUE PASA A FALSE
        setTarea({}); // siempre que vayamos a crear una tarea nueva, reiniciar ese objeto dejarlo vacío para que no tenga nada
    }

    const submitTarea = async (tarea) => {
        
        if(tarea?.id){
           await editarTarea(tarea);
        } else {
            delete tarea.id;
           await crearTarea(tarea);
           /*aqui tenia un error muy raro 
           El problema que tenias era que le estabas pasando el id de la tarea que se iba a crear y 
           cuando  crear la tarea mongodb piensa que le estas pasando el id pero no es asi 
           porque mongodb generar un id automaticamente.
           */
        }
    }

    const crearTarea = async tarea => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            // sincronizar con el state esa tare que estamos obteniendo
            const { data } = await clienteAxios.post('/tareas', tarea, config);
            console.log(data);
            // Agrega la tarea al state
            
            setAlerta({});
            setModalFormularioTarea(false);

            //? SOCKET IO
            //socket.emit('nueva tarea', data); // cuando se cree una nueva tarea emitemos el evento

            // SOCKET IO
            socket.emit('nueva tarea', data);
        } catch (error) {
            console.log(error);
        }
    }

    const editarTarea = async tarea => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            const { data } = await clienteAxios.put(`/tareas/${tarea.id}`, tarea, config);
            
            setAlerta({});
            setModalFormularioTarea(false);

            // SOCKET
            socket.emit('actualizar tarea', data);
        } catch (error) {
            console.log(error);
        }
    }

    const handleModalEditarTarea = tarea => {
        setTarea(tarea); // Los datos de la tarea los colocamos en el state
        setModalFormularioTarea(true);
    }

    const handleModalEliminarTarea = tarea => {
        setTarea(tarea);
        setModalEliminarTarea(!modalEliminarTarea);
    }

    const eliminarTarea = async () => {
        // Solo el creador del proyecto puede eliminar la tarea
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            const { data } = await clienteAxios.delete(`/tareas/${tarea._id}`, config); // _id viene de la db, en editar el id viene del state
            setAlerta({msg: data.msg, error: false}); // la respuesta que obtengamos de la api es la que vamos a colocar


            setModalEliminarTarea(false);

            // SOCKET
            socket.emit('eliminar tarea', tarea);
            setTarea({}); // seteamos la alerta para que se elimine|resetear el obj de tarea y dejarlo vacío
                        setTimeout(() => { setAlerta({}) }, 3000)

        } catch (error) {
            console.log(error);
        }
    }

    const submitColaborador = async (email) => {

        setCargando(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            const {data} = await clienteAxios.post('/proyectos/colaboradores', {email}, config);

            setColaborador(data);
            setAlerta({}); // en caso de que haya una alerta previa la limpeamos
        } catch(error){
            setAlerta({
                msg: error.response.data.msg,
                error: true
            })
        } finally {
            setCargando(false);
        }
    }

    const agregarColaborador = async email => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const {data} = await clienteAxios.post(`/proyectos/colaboradores/${proyecto._id}`, email, config);
          
            setAlerta({
                msg: data.msg,
                error: false
            });

            setColaborador({}); // Reseteamos ese obj para que este vacío

            setTimeout(() => {
                setAlerta({});
            }, 3000);

        } catch (error) {
            setAlerta({
                msg: error.response.data.msg,
                error: true
            })
        }
    }

    const handleModalEliminarColaborador = (colaborador) => {
        setModalEliminarColaborador(!modalEliminarColaborador);
        setColaborador(colaborador);
    }

    const eliminarColaborador = async() => {
        try{
            const token = localStorage.getItem('token');
            if (!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const {data} = await clienteAxios.post(`/proyectos/eliminar-colaborador/${proyecto._id}`, {id: colaborador._id}, config);

            const proyectoActualizado = {...proyecto};

            proyectoActualizado.colaboradores = proyectoActualizado.colaboradores.filter(colaboradorState => colaboradorState._id !== colaborador._id);

            setProyecto(proyectoActualizado);

            setAlerta({
                msg: data.msg,
                error: false,
            })
            setColaborador({});
            setModalEliminarColaborador(false);

            setTimeout(() => {
                setAlerta({});
            }, 3000);

        } catch(error){
            console.log(error);
        }
    }


    const completarTarea = async id => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            // tomar el id de la tarea
            const { data } = await clienteAxios.post(`/tareas/estado/${id}`, {}, config); // data no le pasamos nada por eso obj vacío
            setTarea({});
            setAlerta({});

            // socket
            socket.emit('cambiar estado', data); // recuerda ese data retorna la tarea ya actualizada de la bd

        } catch (error) {
            console.log(error.response)
        }
    }


    const handleBuscador = () => {
        // lo que sea contrario a lo que tiene buscador
        setBuscador(!buscador)
    }

     // Socket IO funciones
  const submitTareasProyecto = (tarea) => {
    // Agregar la tarea al state
      const proyectoActualizado = {...proyecto};
      proyectoActualizado.tareas = [...proyectoActualizado.tareas, tarea];
      setProyecto(proyectoActualizado);
  }
  

    const eliminarTareaProyecto = tarea => {
      const proyectoActualizado = {...proyecto};
      proyectoActualizado.tareas = proyectoActualizado.tareas.filter(tareaState => tareaState._id !== tarea._id);
      setProyecto(proyectoActualizado);
     }

    const actualizarTareaProyecto = tarea => {
         const proyectoActualizado = { ...proyecto };
         proyectoActualizado.tareas = proyectoActualizado.tareas.map(tareaState => tareaState._id == tarea._id ? tarea : tareaState);
        // tareaState es la tarea temporal de ese state, igual a data(la respuesta de la api)
         setProyecto(proyectoActualizado);
    }

    const cambiarEstadoTarea = tarea => {
         // Para que sea mas interactivo debemos settearlo en el state del proyecto
        const proyectoActualizado = { ...proyecto };
        proyectoActualizado.tareas = proyectoActualizado.tareas.map(tareaState => tareaState._id === tarea._id ? tarea : tareaState);
        setProyecto(proyectoActualizado);
    }

    const cerrarSesionProyectos = () => {
        setProyectos([]);
        setProyecto({});
        setAlerta({});
    }

    return (
        // es lo que va a estar en los demas componentes, que van a estar como children, por eso pasamo eso {children}
        <ProyectosContext.Provider value={{
            proyectos, mostrarAlerta,
            alerta, submitProyecto, 
            obtenerProyecto, proyecto, 
            cargando, eliminarProyecto,
            modalFormularioTarea, handleModalTarea,
            submitTarea,
            handleModalEditarTarea,
            tarea,
            modalEliminarTarea,
            handleModalEliminarTarea,
            eliminarTarea,
            submitColaborador,
            colaborador,
            agregarColaborador,
            handleModalEliminarColaborador,
            modalEliminarColaborador,
            eliminarColaborador,
            completarTarea,
            buscador,
            handleBuscador,
            submitTareasProyecto,
            eliminarTareaProyecto,
            actualizarTareaProyecto,
            cambiarEstadoTarea,
            cerrarSesionProyectos

        }}>
            {children}
        </ProyectosContext.Provider>

    )
}

export {
    ProyectosProvider
}

export default ProyectosContext;
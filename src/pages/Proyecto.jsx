import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useProyectos from '../hooks/useProyectos';
import useAdmin from '../hooks/useAdmin';
import ModalFormularioTarea from '../components/ModalFormularioTarea';
import ModalEliminarTarea from '../components/ModalEliminarTarea';
import ModalEliminarColaborador from '../components/ModalEliminarColaborador';
import Tarea from '../components/Tarea';
import Alerta from '../components/Alerta';
import Colaborador from '../components/Colaborador';
import io from 'socket.io-client';

let socket; // para que ese socket se asigne conforme se vaya ejecutando el codigo
  
const Proyecto = () => {

  const params = useParams();
  const {obtenerProyecto, proyecto, cargando, handleModalTarea, alerta,
         submitTareasProyecto, eliminarTareaProyecto, actualizarTareaProyecto, cambiarEstadoTarea} = useProyectos();
  const admin = useAdmin();
  // console.log(admin);

  useEffect(() => {
    obtenerProyecto(params.id);
  }, []); // solamente se va a ejecutar una vez cuando este listo

  useEffect(() => { // se ejecuta una vez para abrir el proyecto y entrar a ese room
    socket = io(import.meta.env.VITE_BACKEND_URL);
   socket.emit('abrir proyecto', params.id); // en que proyecto esta este usuario que esta visitiando actualmente el proyecto
  }, []);

  useEffect(() => {
    socket.on("tarea agregada", tareaNueva => {
      // agregamos diferentes sockets, indentificar a cual state es el que se quiere actualizar
      if (tareaNueva.proyecto === proyecto._id) {
          submitTareasProyecto(tareaNueva);
      }
    })

    socket.on("tarea eliminada", tareaEliminada => { // cuando ocurra este evento que es tarea eliminada que viene desde el servidor
  
      const proyectoValue = tareaEliminada.proyecto;
    
      if (typeof proyectoValue === 'string') {
        if (proyectoValue === proyecto._id) {
          eliminarTareaProyecto(tareaEliminada);
        }
      } else if (typeof proyecto === 'object') {
        if (proyectoValue._id === proyecto._id) {
          eliminarTareaProyecto(tareaEliminada);
        }
      }
    });

    socket.on('tarea actualizada', tareaActualizada => {
      if (tareaActualizada.proyecto._id === proyecto._id) {
        actualizarTareaProyecto(tareaActualizada);
      }
    });

    socket.on('nuevo estado', nuevoEstadoTarea => {
      if (nuevoEstadoTarea.proyecto._id === proyecto._id) {
        cambiarEstadoTarea(nuevoEstadoTarea);
      }
    })
  })


  const { nombre } = proyecto;

  // console.log(proyecto);

  if (cargando) return 'Cargando...';

  const {msg} = alerta; // si hay un msg en alerta, entonces queremos mostrarla

  // console.log(proyecto);

  return  (
     <>
      <div className='flex justify-between'>
        <h1 className='font-black text-4xl'>{nombre}</h1>
        {/* SI admin viene como true muestra el boton de editar, sino nel */}
        {admin && (
        <div className='flex items-center gap-2 text-gray-400 hover:text-black'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>

          <Link to={`/proyectos/editar/${params.id}`} 
                className='uppercase font-bold'>Editar</Link>
        </div>
        )}
      </div>
          {admin && (
        <button onClick={handleModalTarea} type='button' 
                className='text-sm px-5 py-3 w-full 
                          md:w-auto rounded-lg uppercase 
                          font-bold bg-sky-400 
                          text-white text-center mt-5 flex gap-2 items-center justify-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
                            </svg>Nueva Tarea
        </button>
        )}

       <p className='font-bold texl-xl mt-10'>Tareas del Proyecto</p>

      <div className='bg-white shadow mt-10 rounded-lg'>
        {/* nos marca error, primero proyecto llega como un obj vacío */}
        {/* esto de tareas puede o no estar disponible, a eso ayuda ? es nueva propiedad de js */}
        {proyecto.tareas?.length ? 
          proyecto.tareas?.map(tarea => (
            <Tarea key={tarea._id} tarea={tarea} />
          )) : 
            <p className='text-center my-5 p-10'>No hay tareas en este proyecto</p>}
       </div>
        
      {admin && (
        // retorna dos elementos, debemos de colocar un fragment
        <>
          <div className='flex items-center justify-between mt-10'>
            <p className='font-bold texl-xl'>Colaboradores</p>
            <Link to={`/proyectos/nuevo-colaborador/${proyecto._id}`} className="text-gray-400 hover:text-black uppercase font-bold">Añadir</Link>
          </div>

          <div className='bg-white shadow mt-10 rounded-lg'>
            
            {proyecto.colaboradores?.length ? 
              proyecto.colaboradores?.map(colaborador => (
                <Colaborador key={colaborador._id} colaborador={colaborador} />
              )) : 
              <p className='text-center my-5 p-10'>No hay colaboradores</p>}
          </div>
        </>
      )}

      {/* Se va a cerrar el modal desde ese componente */}
      <ModalFormularioTarea />
      <ModalEliminarTarea />
      <ModalEliminarColaborador />
    </>
  )

    

}

export default Proyecto
import useProyectos from "../hooks/useProyectos";
import PreviewProyecto from "../components/PreviewProyecto";
import Alerta from "../components/Alerta";


const Proyectos = () => {

  const { proyectos, alerta } = useProyectos(); // este es nuestro hook personalizado

  // ? Fundamentos con socket.io desde el cliente
  // import io from 'socket.io-client';
  // let socket;
  // useEffect(() => {
  //   socket = io(import.meta.env.VITE_BACKEND_URL); // esto abre una conexión hacia socker.io
  //   socket.emit('prueba', proyectos); // envia esto hacia el servidor

  //   // respuesta de socket desde el servidor
  //   socket.on('respuesta', (persona) => {
  //     console.log('Desde el front end ', persona);
  //   });
  // }); // si lo dejamos sin [] se ejecuta cada que haya cambios, si le ponemos [] solo se ejecuta una vez


   const { msg } = alerta;

  return (
    <>
      <h1 className="text-4xl font-black">Proyectos</h1>

      {msg && <Alerta alerta={alerta} />}

      <div className="bg-white shadow mt-10 rounded-lg">
        {proyectos.length ? proyectos.map(proyecto => (<PreviewProyecto key={proyecto._id} proyecto={proyecto}/> ))
           : <p className="text-center text-gray-600 uppercase p-5">No hay proyectos aún</p>}
      </div>
    </>
  )
}

export default Proyectos
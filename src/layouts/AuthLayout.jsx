import {Outlet} from 'react-router-dom'; // outlet importa el contenido de los componentes hijos que hayamos definido en el router
// Componente Principal de rutas eso creo
const AuthLayout = () => {
    return (
    <>
      {/* cada componente su contenido va a estar dentro de este main */}
        <main className='container mx-auto mt-5 md:mt-20 p-5 md:flex md:justify-center'>
          <div className='md:w-2/3 lg:w-2/5'>
            {/* tamaño grande dos terceras partes, tamaño grande la mitad de la pantalla */}
            <Outlet />
          </div>
          
      </main>
    </>
  )
}

export default AuthLayout
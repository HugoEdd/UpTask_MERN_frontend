// la alerta tomara un mensaje y tambien que tipo de alerta es
const Alerta = ({alerta}) => {
  return (
    //   string de clases a una variable de js
    <div className={`${alerta.error ? 'from-red-400 to-red-600' : 'from-sky-400 to-sky-600'} bg-gradient-to-br text-center p-3 rounded-xl 
    upercase text-white font-bold text-sm my-10 `}>
        {/* tambien podría ser un children */}
        {alerta.msg}
    </div>
  )
}

export default Alerta
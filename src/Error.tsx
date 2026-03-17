import { useNavigate } from "react-router"

function Error() {

  const nav = useNavigate()
  return (

    <div className='flex flex-col h-[80vh] items-center justify-center'>
      <p>Oops! Something went wrong. We'll fix it.</p>
      <p className="text-black mt-3">In the meantime, you can,  <span onClick={() => nav(-1)} className="underline">Go Back</span></p>
    </div>
  )


}

export default Error

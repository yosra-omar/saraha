

export const accessRespose = ({
     res,
     status = 200,
     message= "done",
     data =  undefined
    }={}) =>{
    return  res.status(200).json({
        message,
        data
    })

}
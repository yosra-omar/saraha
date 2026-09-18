

export const create = async({model , data})=>{
   return  await model.create([data])
}


export const findOne = async({model , filter = {} , option={}} ={})=>{
   const doc =  model.findOne(filter)

    if(option.skip){
       doc.skip(option.skip)
       //option.skip  this is value ex : skip: 3
    }
     if(option.limit){
       doc.limit(option.limit)
    }

    return await doc.exec()
}
export const find = async({model , filter = {} , option={}} ={})=>{
   const doc =  model.find(filter)

    if(option.skip){
       doc.skip(option.skip)
       //option.skip  this is value ex : skip: 3
    }
     if(option.limit){
       doc.limit(option.limit)
    }

    return await doc.exec()
}

export const findById = async({model , id , option = {}} ={})=>{
   return await model.findById(id).select(option.select || " ")
}

export const findOneAndUpdate = async({model , filter = {}, update = {}, option = {}} ={})=>{
   return await model.findOneAndUpdate(filter , update,{
      ...option,
      new : true,
      runValidators : true
   } )
}
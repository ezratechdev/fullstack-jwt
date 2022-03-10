interface errorData{
    error:boolean,
    status?:number,
    message:string,
    token?:any,
    email?:string,
    username?:string,
    optionalObject:{ otherData:any}
}
const errorFunc = ({error , status , message , token , email , username , optionalObject  }:errorData)=>{
    return {
        error,
        status,
        message,
        token,
        email,
        username,
        optionalObject,
    }
}

export { errorFunc };
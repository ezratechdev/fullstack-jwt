interface responseData{
    error:boolean,
    message:string,
    status?:number,
    token?:any,
    email?:string,
    username?:string,
    isEmailVerified?:boolean,
}
const responseFunc = ({error , message , status , token , email , username , isEmailVerified  }:responseData)=>{
    const response = 
    {
        error,
        status,
        message,
        token,
        email,
        username,
        isEmailVerified,
    }
    return {
        ...response.error && {error : response.error},
        ...response.status && {status : response.status},
        ...response.message && {message : response.message},
        ...response.token && {token : response.token},
        ...response.email && {email : response.email},
        ...response.username && {username : response.username},
        ...response.isEmailVerified && {isEmailVerified : response.isEmailVerified},
    }
}

export { responseFunc };
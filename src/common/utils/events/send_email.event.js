import { EventEmitter } from "events";

export const eventEmitter = new EventEmitter();

 export const event_names = {
    confirmEmail: "confirmEmail"
}

eventEmitter.on(event_names.confirmEmail,(fn)=>{
    fn()
})
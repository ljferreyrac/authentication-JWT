import mongoose from "mongoose"

export const Validators = {
    isMongoID: ( id: string ) => {
        return mongoose.isValidObjectId(id);
    }
}
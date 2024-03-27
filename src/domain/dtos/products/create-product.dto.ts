import { Validators } from "../../../config";

export class CreateProductDTO{
    private constructor(
        public readonly name: string,
        public readonly available: boolean,
        public readonly price: number,
        public readonly description: string,
        public readonly user: string, //id
        public readonly category: string, //id
    ){}
    
    static create( object: {[key: string]: any} ): [string?, CreateProductDTO?]{
        const {
            name,
            available,
            price,
            description,
            user,
            category,
        } = object;

        let availableBoolean = available;
        if( typeof available !== 'boolean'){
            availableBoolean = ( available === 'true' )
        }

        if( !name ) return ['Missing name'];
        if( !user ) return ['Missing user'];
        if( !Validators.isMongoID(user) ) return ['Invalid User ID'];
        if( !category ) return ['Missing category'];
        if( !Validators.isMongoID(category) ) return ['Invalid Category ID'];
        
        return [
            undefined,
            new CreateProductDTO(
                name,
                availableBoolean,
                price,
                description,
                user,
                category,
            )
        ]
    }
}
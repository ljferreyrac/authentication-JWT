import { ProductModel } from "../../data";
import { CreateProductDTO, CustomError, PaginationDTO, UserEntity } from "../../domain";

export class ProductService{
    constructor(){}

    async createProduct( createProductDTO: CreateProductDTO ){
        const productExists = await ProductModel.findOne({name: createProductDTO.name})
        if( productExists ) throw CustomError.internalServer('Product already exists');
        try {
            const product = new ProductModel(createProductDTO)

            await product.save();

            return product;
        } catch (error) {
            throw CustomError.internalServer('Internal server error');
        } 
    }

    async getProducts( paginationDTO: PaginationDTO ){
        const { page, limit } = paginationDTO;
        try {
            const [total, products] = await Promise.all([
                ProductModel.countDocuments(),
                ProductModel.find()
                .skip( (page - 1) * limit )
                .limit(limit)
                .populate('user')
                .populate('category')
            ])
            return {
                page,
                limit,
                total,
                next: (page * limit < total) ? `/api/products?page=${(page + 1)}&limit=${limit}`: null,
                prev: (page - 1 > 0) ? `/api/products?page=${(page - 1)}&limit=${limit}`: null,
                products: products
            }
        } catch (error) {
            throw CustomError.internalServer('Internal server error');
        }
    }
}
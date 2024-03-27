import { JwtAdapter, bcryptAdapter, envs } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDTO, RegisterUserDTO, UserEntity } from "../../domain";
import { EmailService } from "./email.service";

export class AuthService{
    //DI
    constructor(
        private readonly emailService: EmailService,
    ){}

    public registerUser = async ( registerUserDTO: RegisterUserDTO ) => {

        const existUser = await UserModel.findOne({email: registerUserDTO.email});
        if( existUser ) throw CustomError.badRequest('Email already exists');

        try {
            const user = new UserModel(registerUserDTO);
            
            user.password = bcryptAdapter.hash( registerUserDTO.password );

            await user.save();

            await this.sendEmailValidationLink(user.email);
            const {password, ...rest} = UserEntity.fromObject(user);
            const token = await this.generationToken({id: user.id, email: user.email})
            return {
                user: rest, 
                token
            };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    public loginUser = async( loginUserDTO: LoginUserDTO ) => {
        const user = await UserModel.findOne({email: loginUserDTO.email});
        if( !user ) throw CustomError.badRequest('Incorrect email or password');

        const isMatching = bcryptAdapter.compare(loginUserDTO.password, user.password);
        if(!isMatching) throw CustomError.badRequest('Incorrect email or password');
        const {password, ...rest} = UserEntity.fromObject(user);
        const token = await this.generationToken({id: user.id, email: user.email})
        return {
            user: rest, 
            token
        };
    }
    
    private generationToken = async (payload: any) => {
        const token = await JwtAdapter.generateToken(payload);
        if(!token) throw CustomError.internalServer('Error while generating JWT');
        return token
    }
    private sendEmailValidationLink = async( email: string ) => {
        const token = await this.generationToken({email});

        const link = `${ envs.WEBSERVICE_URL }/auth/validate-email/${token}`;
        const html = `
            <h1>Validate your email</h1>
            <p>Click on the following link to validate your email</p>
            <a href="${link}">Validate your email: ${email}</a>
        `;
        const options = {
            to: email,
            subject: 'Validate your email',
            htmlBody: html,
        }

        const isSent = await this.emailService.sendEmail(options);
        if(!isSent) throw CustomError.internalServer('Error sending email');

        return true;
    }

    public validateEmail = async(token:string) => {
        const payload = await JwtAdapter.validateToken(token);
        if( !payload ) throw CustomError.unauthorized('Invalid token');

        const { email } = payload as { email: string };
        if( !email ) throw CustomError.internalServer('Email not in token');

        const user = await UserModel.findOne({email});
        if(!user) throw CustomError.internalServer('Email not exists');

        user.emailValidated = true;
        await user.save();

        return true;
    }
}
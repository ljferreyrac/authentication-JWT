import jwt from 'jsonwebtoken';
import { envs } from './envs';

const JWT_SEED = envs.JWT_SEED;

export const JwtAdapter = {
    generateToken: async ( payload:any, duration: string = '2h' ) => {
        return new Promise((resolve) => {
            jwt.sign(payload, JWT_SEED, { expiresIn: duration }, (error, token) => {
                if(error) resolve(null);

                return resolve(token);
            });
        })
    },
    validateToken: (token: string) => {
        return new Promise((resolve) => {
            jwt.verify(token, JWT_SEED, (error, decoded) => {
                if( error ) resolve(null);

                resolve(decoded);
            })
        });
    }
}
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from "../entities/User.entity";


export const saveHashRefreshTokenToUser = async ( 
    user: User, 
    refreshToken: string, 
    userRepository: Repository<User>
) => {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12); 
    user.refresh_token_hash = refreshTokenHash;
    await userRepository.save(user);
}
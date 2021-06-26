import { Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from 'type-graphql';
import { compare, hash } from 'bcryptjs';
import { getConnection } from 'typeorm';

import { User } from './entity/User';
import { MyContext } from './MyContext';
import { createAccessToken, createRefreshToken } from './auth';
import { isAuth } from './isAuth';
import { sendRefreshToken } from './sendRefreshToken';

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return 'hi';
    }

    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(
        @Ctx() {payload }: MyContext
    ) {
        return `Your user id is ${payload!.userId}`;
    }

    @Query(() => [User])
    user() {
        return User.find();
    }

    @Mutation(() => Boolean)
    async revokeRefreshToken(
        @Arg('userId', () => Int) userId: number
    ) {
        await getConnection().getRepository(User).increment({ id: userId }, "tokenVersion", 1);

        return true;
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() { res }: MyContext
    ): Promise<LoginResponse> {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new Error("Could not found user");
        }

        const valid = await compare(password, user.password);

        if (!valid) {
            throw new Error("bad password");
        }

        // login successfully
        sendRefreshToken(res, createRefreshToken(user));
        
        return {
            accessToken: createAccessToken(user)
        };
    }

    @Mutation(() => Boolean)
    async register(
        @Arg('email') email: string,
        @Arg('password') password: string
    ) {
        const hashedPassword = await hash(password, 12);

        try {
            await User.insert({
                email,
                password: hashedPassword
            })
        } catch (err) {
            console.log(err);
            return false
        }
        
        return true;
    }
}
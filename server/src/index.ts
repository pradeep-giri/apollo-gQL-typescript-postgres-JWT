/** @format */

import 'reflect-metadata';
import 'dotenv/config';
import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import cookieParser from 'cookie-parser';
import { verify } from 'jsonwebtoken';
import cors from 'cors';

import { UserResolver } from './UserResolver';
import { User } from './entity/User';
import { createAccessToken, createRefreshToken } from './auth';
import { sendRefreshToken } from './sendRefreshToken';

(async () => {
	const app = express();

	app.use(
		cors({
			origin: 'http://localhost:3000',
			credentials: true,
		})
	);
	app.use(cookieParser());

	app.get('/', (_req: Request, res: Response) => {
		res.send('Hey there!');
	});

	app.post('/refresh_token', async (req: Request, res: Response) => {
		const token = req.cookies.jid;

		if (!token) {
			return res.send({ ok: false, accessToken: '' });
		}

		let payload: any = null;
		try {
			payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
		} catch (err) {
			console.log(err);
			return res.send({ ok: false, accessToken: '' });
		}

		// Refresh token is valid and we send back the accesstoken
		const user = await User.findOne({ id: payload.userId });

		if (!user) {
			return res.send({ ok: false, accessToken: '' });
		}

		if (user.tokenVersion !== payload.tokenVersion) {
			return res.send({ ok: false, accessToken: '' });
		}

		sendRefreshToken(res, createRefreshToken(user));

		return res.send({ ok: true, accessToken: createAccessToken(user) });
	});

	await createConnection();

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [UserResolver],
		}),
		context: ({ req, res }) => ({ req, res }),
	});

	apolloServer.applyMiddleware({ app, cors: false });

	app.listen(4000, () => {
		console.log('Server is running on port 4000');
	});
})();

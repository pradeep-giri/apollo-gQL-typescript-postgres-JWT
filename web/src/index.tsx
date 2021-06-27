/** @format */

import React from 'react';
import ReactDOM from 'react-dom';
import {
	ApolloClient,
	ApolloProvider,
	InMemoryCache,
	from,
	HttpLink,
	ApolloLink,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import jwt_decode from 'jwt-decode';

import { getAccessToken, setAccessToken } from './accessToken';
import { App } from './App';

const httpLink = new HttpLink({
	uri: 'http://localhost:4000/graphql',
	credentials: 'include',
});

const authLink = new ApolloLink((operation, forward) => {
	const accessToken = getAccessToken();
	operation.setContext(({ headers = {} }) => ({
		headers: {
			...headers,
			authorization: accessToken ? `Bearer ${accessToken}` : '',
		},
	}));
	return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
	if (graphQLErrors)
		graphQLErrors.map(({ message, locations, path }) =>
			console.log(
				`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
			)
		);
	if (networkError) console.log(`[Network error]: ${networkError}`);
});

const refreshTokenLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		const token = getAccessToken();

		if (!token) {
			return true;
		}

		try {
			const decode: any = jwt_decode(token);
			if (Date.now() >= decode.exp * 1000) {
				return false;
			} else {
				return true;
			}
		} catch (err) {
			return false;
		}
	},
	fetchAccessToken: () => {
		return fetch('http://localhost:4000/refresh_token', {
			method: 'POST',
			credentials: 'include',
		});
	},
	handleFetch: (accessToken) => {
		setAccessToken(accessToken);
	},
	handleError: (err) => {
		// full control over handling token fetch Error
		console.warn('Your refresh token is invalid. Try to relogin');
	},
});

const client = new ApolloClient({
	link: from([refreshTokenLink, authLink, errorLink, httpLink]), // authLink.concat(httpLink),
	cache: new InMemoryCache(),
});

ReactDOM.render(
	<ApolloProvider client={client}>
		<React.StrictMode>
			<App />
		</React.StrictMode>
	</ApolloProvider>,
	document.getElementById('root')
);

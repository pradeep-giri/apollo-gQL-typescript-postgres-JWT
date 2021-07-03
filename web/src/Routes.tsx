/** @format */

import React from 'react';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import { setAccessToken } from './accessToken';
import { useLogoutMutation } from './generated/graphql';
import { Bye } from './pages/Bye';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export const Routes: React.FC = () => {
	const [logout, { client }] = useLogoutMutation();
	return (
		<BrowserRouter>
			<header>
				<div>
					<Link to='/'>Home</Link>
				</div>
				<div>
					<Link to='/register'>Register</Link>
				</div>
				<div>
					<Link to='/login'>Login</Link>
				</div>
				<div>
					<Link to='/bye'>Bye</Link>
				</div>
				<div>
					<button
						onClick={async () => {
							await logout();
							setAccessToken('');
							await client.resetStore();
						}}>
						Logout
					</button>
				</div>
			</header>
			<Switch>
				<Route exact path='/' component={Home} />
				<Route exact path='/register' component={Register} />
				<Route exact path='/login' component={Login} />
				<Route exact path='/bye' component={Bye} />
			</Switch>
		</BrowserRouter>
	);
};

/** @format */

import React, { useEffect, useState } from 'react';
import { setAccessToken } from './accessToken';
import { Routes } from './Routes';

interface AppProps {}

export const App: React.FC<AppProps> = () => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch('http://localhost:4000/refresh_token', {
			method: 'POST',
			credentials: 'include',
		}).then(async (x) => {
			const { accessToken } = await x.json();
			setAccessToken(accessToken);
			setLoading(false);
		});
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	return <Routes />;
};

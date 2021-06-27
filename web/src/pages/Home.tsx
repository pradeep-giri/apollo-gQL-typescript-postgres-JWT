/** @format */

import React from 'react';
import { useUserQuery } from '../generated/graphql';

interface HomeProps {}

export const Home: React.FC<HomeProps> = () => {
	const { data, loading } = useUserQuery({ fetchPolicy: 'network-only' });

	if (loading || !data) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<div>User:</div>
			<ul>
				{data.user.map((el) => {
					return (
						<li key={el.id}>
							{el.id}, {el.email}
						</li>
					);
				})}
			</ul>
		</div>
	);
};

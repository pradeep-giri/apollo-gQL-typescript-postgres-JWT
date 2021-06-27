/** @format */

import React from 'react';
import { useByeQuery } from '../generated/graphql';

interface ByeProps {}

export const Bye: React.FC<ByeProps> = () => {
	const { data, loading, error } = useByeQuery({
		fetchPolicy: 'network-only',
	});

	if (error) {
		return <div>Error</div>;
	}

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!data) {
		return <div>No Data</div>;
	}

	return <div>{data.bye}</div>;
};

import { useQueryClient, useQuery } from "@tanstack/react-query";
import React from "react";
import {
	onSnapshot,
	Unsubscribe,
	DocumentData,
	DocumentReference,
	getDoc,
} from "firebase/firestore";
export function useDoc<T extends DocumentData>({
	listen,
	queryKey,
	ref,
	...props
}: {
	listen: boolean;
	queryKey: string[];
	ref: DocumentReference<T>;
}) {
	const queryClient = useQueryClient();

	let unsubscribe: Unsubscribe;
	React.useEffect(() => {
		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, []);
	return useQuery({
		queryKey,
		queryFn: async () => {
			unsubscribe = onSnapshot(
				ref,
				(snapshot) => {
					if (snapshot.exists()) {
						const value = { ...snapshot.data(), id: snapshot.id } as T;
						queryClient.setQueryData(queryKey, value);
					} else {
						queryClient.setQueryData(queryKey, null);
					}
				},
				(error) => {
					console.log(error.message);
				}
			);

			const values = await getDocQuery<T>(ref);
			if (values) return values;
			return null;
		},
		enabled: listen,
		...props,
	});
}

export const getDocQuery = async <T>(ref: DocumentReference<DocumentData>) => {
	try {
		const snapshot = await getDoc(ref);

		const values = snapshot.exists()
			? ({ ...snapshot.data(), id: snapshot.id } as T)
			: null;
		return values;
	} catch (error: any) {
		console.log(error.message);
	}
};

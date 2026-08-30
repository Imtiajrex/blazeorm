import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	CollectionReference,
	DocumentData,
	Query,
	Unsubscribe,
	getDocs,
	onSnapshot,
} from "firebase/firestore";
import React from "react";
import { snapshotToData } from "./data";
export function useCollection<T extends DocumentData>({
	listen,
	queryKey,
	ref,
	infinite = false,
	...props
}: {
	listen: boolean;
	queryKey: string[];
	infinite?: boolean;
	ref: Query<T> | CollectionReference<T>;
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
	return useQuery<T>({
		queryKey,
		queryFn: async () => {
			unsubscribe = onSnapshot(ref, (snapshot) => {
				const values = snapshotToData(snapshot) as T;
				queryClient.setQueryData(queryKey, values);
			});
			const snapshots = await getDocs(ref);
			const values = snapshotToData(snapshots) as T;
			return values;
		},
		enabled: listen,
		...props,
	});
}

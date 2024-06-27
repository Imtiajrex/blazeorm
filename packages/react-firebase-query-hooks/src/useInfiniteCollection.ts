import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
	CollectionReference,
	DocumentData,
	Query,
	Unsubscribe,
	getDocs,
	limit,
	onSnapshot,
	query,
	startAfter,
} from "firebase/firestore";
import _ from "lodash";
import { useMemo, useEffect } from "react";
let unsubscribe: Unsubscribe;

export function useInfiniteCollection<T extends DocumentData>({
	listen,
	queryKey,
	on = true,
	ref,
	...props
}: {
	listen: boolean;
	on?: boolean;
	queryKey: string[];
	ref: Query<T> | CollectionReference<T>;
}) {
	const queryClient = useQueryClient();
	useEffect(() => {
		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, []);
	const getNextPageParam = (lastPage: any, allPages: any[]) => {
		return lastPage.values.length >= 25 && lastPage.nextCursor
			? {
					nextCursor: query(ref, startAfter(lastPage.nextCursor)),
					page: allPages.length,
				}
			: null;
	};

	const addNewDoc = (data: any) => {
		queryClient.setQueryData(queryKey, (old: any) => {
			let oldValues = _.cloneDeep(old);
			if (oldValues && oldValues.pages && oldValues.pages.length > 0) {
				const lastPage = oldValues.pages[0];
				const page = {
					values: [data, ...lastPage.values],
					nextCursor: data[data.length - 1],
				};
				oldValues.pages[0] = page;
			}
			return oldValues;
		});
	};
	const infiniteQuery = useInfiniteQuery({
		queryKey,
		queryFn: async ({ pageParam }: any) => {
			ref = query(ref, limit(25));
			if (on) {
				unsubscribe = onSnapshot(ref, (snapshot: any) => {
					const values = snapshotToData(snapshot) as T[];
					queryClient.setQueryData(queryKey, (old: any) => {
						let newValues = _.cloneDeep(old);
						if (
							newValues &&
							newValues.pages &&
							newValues.pages.length > 0 &&
							values.length > 0
						) {
							const page = {
								values,
								nextCursor: snapshot.docs[snapshot.docs.length - 1],
							};
							newValues.pages[0] = page;
						}
						return newValues;
					});
				});
			}
			const updatedRef =
				pageParam && pageParam.nextCursor ? pageParam.nextCursor : ref;
			const snapshots = await getDocs(updatedRef);
			const values = snapshotToData(snapshots) as T[];
			const lastDocument =
				snapshots.docs.length > 0
					? snapshots.docs[snapshots.docs.length - 1]
					: null;
			return { values, nextCursor: lastDocument };
		},
		initialPageParam: {
			nextCursor: null as any,
			page: 0,
		},
		enabled: listen,
		getNextPageParam,
		...props,
	});
	const values = useMemo(
		() => getDataFromPages<T>(infiniteQuery.data! as any),
		[infiniteQuery.data]
	);
	return useMemo(
		() => ({
			...infiniteQuery,
			loadMore: () => {
				if (infiniteQuery.hasNextPage) {
					infiniteQuery.fetchNextPage();
				}
			},
			values,
			addNewDoc,
		}),
		[infiniteQuery]
	);
}

import { InfiniteData } from "@tanstack/react-query";
import { QueryDocumentSnapshot } from "firebase/firestore";
import { snapshotToData } from "./data";

export const getDataFromPages = <T>(
	data:
		| InfiniteData<{
				values: T[];
				nextCursor: QueryDocumentSnapshot<unknown> | null;
		  }>
		| undefined
) => {
	if (!data || !data.pages) return [];
	const pages = data.pages;
	const values = pages.map((page) => page.values);
	return values.flat() as T[];
};

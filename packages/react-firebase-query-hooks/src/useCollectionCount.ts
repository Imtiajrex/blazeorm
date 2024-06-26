import { useQuery } from "@tanstack/react-query";
import {
	CollectionReference,
	DocumentData,
	getCountFromServer,
	Query,
} from "firebase/firestore";

export default function useCollectionCount<T extends DocumentData>({
	ref,
	key,
}: {
	ref: CollectionReference<T> | Query<T>;
	key: string;
}) {
	const countQuery = useQuery({
		queryKey: ["collectionCount", key],
		queryFn: async () => {
			const countValue = await getCountFromServer(ref);
			return countValue.data().count;
		},
	});
	return {
		...countQuery,
		count: countQuery.data || 0,
	};
}

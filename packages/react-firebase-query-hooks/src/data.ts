import { QuerySnapshot } from "firebase/firestore";

export const snapshotToData = <T>(snapshot: QuerySnapshot<unknown>): T[] => {
	const data: T[] = [];
	snapshot.forEach((doc) => {
		data.push({ ...(doc.data() as object), id: doc.id } as T);
	});
	return data;
};

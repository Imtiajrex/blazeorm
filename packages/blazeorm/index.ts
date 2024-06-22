import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	DocumentData,
	getDoc,
	getFirestore,
	QueryDocumentSnapshot,
	setDoc,
} from "firebase/firestore";
import { z, ZodObject, ZodRawShape } from "zod";

export const blazeTable = <T extends ZodRawShape>(
	collectionName: string,
	schema: ZodObject<T>
) => {
	//get schema keys
	const schemaKeys = Object.keys(schema.shape) as (keyof T)[];
	const schemaKeysObject = schemaKeys.reduce(
		(acc, key) => {
			acc[key] = key;
			return acc;
		},
		{} as {
			[key in keyof T]: key;
		}
	);

	const firestore = getFirestore();
	type SchemaType = z.infer<typeof schema>;
	type SchemaWithId = SchemaType & { id?: string };
	const collectionRef = getCollection<SchemaWithId>(collectionName);
	return {
		...schemaKeysObject,
		collection: collectionRef,
		doc: (id: string) => getDocRef<SchemaType>(`${collectionName}/${id}`),
		findById: async (id: string) => {
			const docSnap = await getDoc(doc(firestore, collectionName, id));
			if (docSnap.exists()) {
				return docSnap.data();
			} else {
				return null;
			}
		},
		create: async (data: SchemaType) => {
			schema.parse(data);
			const docRef = await addDoc<SchemaType>(collectionRef, data);
			return docRef.id;
		},
		update: async (id: string, data: Partial<SchemaType>) => {
			schema.partial().parse(data);
			const docRef = getDocRef<SchemaType>(`${collectionName}/${id}`);
			await setDoc<SchemaType>(docRef, data, {
				merge: true,
			});
		},
		remove: async (id: string) => {
			await deleteDoc(doc(firestore, collectionName, id));
		},
		schema: schema.and(z.object({ id: z.string() })),
	};
};

const converter = <T>() => ({
	toFirestore: (data: T) => data,
	fromFirestore: (snap: QueryDocumentSnapshot) => {
		const data = snap.data() as T;
		return { ...data, id: snap.id };
	},
});

const getCollection = <T extends DocumentData>(path: string) => {
	const firestore = getFirestore();
	return collection(firestore, path).withConverter(converter<T>());
};
const getDocRef = <T extends DocumentData>(path: string) => {
	const firestore = getFirestore();
	return doc(firestore, path).withConverter(converter<T>());
};

import { Timestamp } from "firebase/firestore";

export const getDateFromTimestamp = (timestamp?: Timestamp) => {
	if (!timestamp) {
		return new Date();
	}
	return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
};

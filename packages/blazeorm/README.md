# BlazeORM 🔥

> A simple typed orm for firebase firestore using zod

```jsx
import { blazeTable } from "blazeorm";
import { z } from "zod";
export const users = blazeTable(
	"users",
	z.object({
		name: z.string(),
		email: z.string().email(),
		profile: z.string().url().optional(),
		role: z.enum(["admin", "manager"]),
	})
);
```

## Features 🚀

- Typed insert, update functions.
- Typed colleciton and document ref
- Typed getters
- Input validation using zod during insertion / update

## Docs:

- [Installation](#installation)
- [API](#api)

## Installation

```bash
npm install blazeorm
```

```bash
yarn add blazeorm
```

```bash
pnpm add blazeorm
```

## API

### Create a model

```jsx
import { blazeTable } from "blazeorm";
import { z } from "zod";
export const users = blazeTable(
	"users",
	z.object({
		name: z.string(),
		email: z.string().email(),
		role: z.enum(["admin", "manager"]),
	})
);
```

### Create new document

It will do runtime validation before creating. Will throw ZodError instance if failed

```jsx
users.create({
	name: "Test Name",
	email: "johndoe@gmail.com",
	role: "Admin", // type error
});
```

### Update document

Update with partial data. It will merge with preexisting data. It will also do runtime validation before updating. Will throw ZodError instance if failed.

```jsx
users.update("testId", {
	name: "Test Name",
	role: "Admin", // type error
});
```

### Collection reference

```jsx
const colRef = users.collection;
```

### Document Reference

```jsx
const docRef = users.doc("testId");
```

### Get document by id

```jsx
const data = await users.findById("testId");
```

### Complex queries

Run any query you want with firestore query builder. Use the keys from the model for type safety

```jsx
import { query, where } from "firebase/firestore";
import { users } from "./model";
const usersColRef = users.collection;
const snapshop = await query(usersColRef, where(users.role, "==", "manager"));
const data = snapshot.data(); //typed from the user model
```

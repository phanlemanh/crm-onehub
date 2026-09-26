"use client";

import { PASSWORD } from "@crm/auth";

export function Mau() {
	return <p>{PASSWORD.minLength}</p>;
}

import type { inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "api/app-router";
import type { RouterOutputs } from "@/lib/trpc/types";

type Contact = RouterOutputs["contacts"]["byId"];

export type ContactFact = Contact["facts"][number];

export type FactTruoc =
	inferRouterInputs<AppRouter>["contacts"]["undoFactDecision"]["truoc"];

export type FactReceipt = {
	fact: ContactFact;
	decision: "accept" | "dismiss";
	thay: boolean;
	truoc: FactTruoc;
	loi: boolean;
};

const COT_THEO_TRUONG = {
	title: "title",
	linkedinUrl: "linkedinUrl",
	twitterUrl: "twitterUrl",
	githubUrl: "githubUrl",
} as const satisfies Record<string, keyof Contact>;

type TruongCot = keyof typeof COT_THEO_TRUONG;

function laTruongCot(field: string): field is TruongCot {
	return field in COT_THEO_TRUONG;
}

export function giaTriHienTai(
	contact: Pick<Contact, TruongCot>,
	field: string,
): string | null {
	return laTruongCot(field) ? contact[COT_THEO_TRUONG[field]] : null;
}

export function giaTriTruoc(
	contact: Pick<Contact, TruongCot | "firstName" | "lastName">,
	field: string,
): FactTruoc {
	if (field === "name") {
		return { firstName: contact.firstName, lastName: contact.lastName };
	}
	return { value: giaTriHienTai(contact, field) };
}

export function factsByField(facts: ContactFact[]) {
	const applied = new Map<string, ContactFact>();
	const proposed = new Map<string, ContactFact>();

	for (const fact of facts) {
		const bucket = fact.status === "APPLIED" ? applied : proposed;
		if (!bucket.has(fact.field)) bucket.set(fact.field, fact);
	}

	return { applied, proposed };
}

export type ViewRemoval =
	| { kind: "removable" }
	| { kind: "in-use"; usedBy: string[] };

export function viewRemoval(view: { usedBy: string[] }): ViewRemoval {
	return view.usedBy.length > 0
		? { kind: "in-use", usedBy: view.usedBy }
		: { kind: "removable" };
}

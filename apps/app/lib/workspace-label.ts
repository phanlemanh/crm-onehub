const SAN_PHAM = "OneHub Center";
const TEN_CU = "crm";

export function workspaceLabel(name: string | undefined): string {
	const trimmed = name?.trim();

	if (!trimmed) return SAN_PHAM;
	if (trimmed.toLowerCase() === TEN_CU) return SAN_PHAM;

	return trimmed;
}

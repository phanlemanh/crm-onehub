export const OKR_SOAN_CUA = {
	agent: "okr",
	host: "/eve/agents/okr",
	header: "x-crm-cuoc-soan",
	purpose: "okr-soan",
} as const;

export function okrSoanHeader(cuocSoanId: string) {
	return { [OKR_SOAN_CUA.header]: cuocSoanId };
}

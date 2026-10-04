import { OKR_PHIEN_SOAN } from "@crm/validation/okr-phien-soan";

export const OKR_SOAN_CUA = {
	agent: "okr",
	host: "/eve/agents/okr",
	header: "x-crm-cuoc-soan",
	purpose: OKR_PHIEN_SOAN.purpose,
} as const;

export function okrSoanHeader(cuocSoanId: string) {
	return { [OKR_SOAN_CUA.header]: cuocSoanId };
}

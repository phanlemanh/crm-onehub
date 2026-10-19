import type { VetViec } from "@crm/db/viec";
import type { AiThay, VetViecRa } from "./viec.contracts";

export function aiThayCua(h: {
	duAnId: string | null;
	gan: readonly unknown[];
}): AiThay {
	if (h.gan.length > 0) return "ban-ghi";
	if (h.duAnId !== null) return "du-an";
	return "rieng";
}

function boiThay<T extends { boi?: { id: string; tieuDe: string } }>(
	moc: T,
	thay: ReadonlySet<string>,
) {
	if (moc.boi === undefined || thay.has(moc.boi.id)) return moc;
	return { ...moc, boi: null };
}

export function cheVet(vet: VetViec, thay: ReadonlySet<string>): VetViecRa {
	switch (vet.loai) {
		case "them-phu-thuoc":
			return thay.has(vet.sau.viec.id) ? vet : { ...vet, sau: { viec: null } };
		case "go-phu-thuoc":
			return thay.has(vet.truoc.viec.id)
				? vet
				: { ...vet, truoc: { viec: null } };
		case "doi-han":
			return {
				...vet,
				truoc: boiThay(vet.truoc, thay),
				sau: boiThay(vet.sau, thay),
			};
		case "doi-bat-dau":
			return {
				...vet,
				truoc: boiThay(vet.truoc, thay),
				sau: boiThay(vet.sau, thay),
			};
		case "them-viec-con":
			return thay.has(vet.sau.conId) ? vet : { ...vet, sau: null };
		default:
			return vet;
	}
}

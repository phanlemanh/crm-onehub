import type { VetViec } from "./viec";

export const LOAI_VET_NHAC_VIEC = [
	"them-phu-thuoc",
	"go-phu-thuoc",
	"doi-han",
	"doi-bat-dau",
	"them-viec-con",
] as const satisfies readonly VetViec["loai"][];

export function maViecNhac(vet: VetViec): string[] {
	switch (vet.loai) {
		case "them-phu-thuoc":
			return [vet.sau.viec.id];
		case "go-phu-thuoc":
			return [vet.truoc.viec.id];
		case "doi-han":
		case "doi-bat-dau":
			return [vet.truoc.boi?.id, vet.sau.boi?.id].filter(
				(id): id is string => id !== undefined,
			);
		case "them-viec-con":
			return [vet.sau.conId];
		default:
			return [];
	}
}

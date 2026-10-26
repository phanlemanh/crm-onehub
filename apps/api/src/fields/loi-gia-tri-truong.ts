import type { LoiTruong } from "@crm/validation/loi-truong";
import { BadRequestException } from "@nestjs/common";

export class LoiGiaTriTruong extends BadRequestException {
	readonly loiTruong: LoiTruong;

	constructor(loiTruong: LoiTruong, message: string) {
		super(message);
		this.loiTruong = loiTruong;
	}
}

export function laGiaTriRong(giaTri: unknown): boolean {
	return (
		giaTri === null ||
		giaTri === undefined ||
		(typeof giaTri === "string" && giaTri.trim() === "")
	);
}

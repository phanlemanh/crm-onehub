import { toast } from "sonner";

const GIAY_MS = 1000;

export const LUU_TRU = {
	hoanTacMs: 10 * GIAY_MS,
} as const;

export type BaoDaLuuTru = {
	thongDiep: string;
	nhanHoanTac: string;
	onHoanTac: () => void;
};

export function baoDaLuuTru({
	thongDiep,
	nhanHoanTac,
	onHoanTac,
}: BaoDaLuuTru): void {
	let daBam = false;
	toast.success(thongDiep, {
		duration: LUU_TRU.hoanTacMs,
		action: {
			label: nhanHoanTac,
			onClick: () => {
				if (daBam) return;
				daBam = true;
				onHoanTac();
			},
		},
	});
}

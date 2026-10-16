import { defineRule } from "@oxlint/plugins";

import { GIAI_DOAN_GOC } from "../../../../packages/db/src/giai-doan.ts";
import { quetChu } from "../shared/quet-chu.ts";

export const khongReTheoTenGiaiDoanRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Mã sản phẩm không nhắc id giai đoạn cũ: giai đoạn do người dùng đặt, rẽ nhánh theo loại giai đoạn.",
		},
		messages: {
			nhacIdCu:
				"Nhắc «{{tu}}» — id giai đoạn cũ. Giai đoạn do người dùng đặt; rẽ nhánh theo loại (GIAI_DOAN.loai), không theo tên.",
		},
	},
	create: quetChu(Object.values(GIAI_DOAN_GOC), "nhacIdCu"),
});

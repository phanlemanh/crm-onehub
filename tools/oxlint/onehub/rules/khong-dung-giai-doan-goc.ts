import { defineRule } from "@oxlint/plugins";

import { quetChu } from "../shared/quet-chu.ts";

export const khongDungGiaiDoanGocRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Mã sản phẩm không dùng GIAI_DOAN_GOC: bảng id cũ chỉ sống ở packages/db/src/giai-doan.ts.",
		},
		messages: {
			dungBangCu:
				"Dùng «{{tu}}» — bảng id giai đoạn cũ. Đọc giai đoạn của workspace và loại của nó, không đọc bảng tên cũ.",
		},
	},
	create: quetChu(["GIAI_DOAN_GOC"], "dungBangCu"),
});

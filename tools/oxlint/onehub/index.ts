import { definePlugin } from "@oxlint/plugins";

import { khongDungGiaiDoanGocRule } from "./rules/khong-dung-giai-doan-goc.ts";
import { khongReTheoTenGiaiDoanRule } from "./rules/khong-re-theo-ten-giai-doan.ts";
import { khongVeTayRule } from "./rules/khong-ve-tay.ts";
import { nganTrongKhungRule } from "./rules/ngan-trong-khung.ts";

const onehubPlugin = definePlugin({
	meta: { name: "onehub" },
	rules: {
		"khong-dung-giai-doan-goc": khongDungGiaiDoanGocRule,
		"khong-re-theo-ten-giai-doan": khongReTheoTenGiaiDoanRule,
		"khong-ve-tay": khongVeTayRule,
		"ngan-trong-khung": nganTrongKhungRule,
	},
});

export default onehubPlugin;

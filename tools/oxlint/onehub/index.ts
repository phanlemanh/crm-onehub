import { definePlugin } from "@oxlint/plugins";

import { khongDungGiaiDoanGocRule } from "./rules/khong-dung-giai-doan-goc.ts";
import { khongReTheoTenGiaiDoanRule } from "./rules/khong-re-theo-ten-giai-doan.ts";

const onehubPlugin = definePlugin({
	meta: { name: "onehub" },
	rules: {
		"khong-dung-giai-doan-goc": khongDungGiaiDoanGocRule,
		"khong-re-theo-ten-giai-doan": khongReTheoTenGiaiDoanRule,
	},
});

export default onehubPlugin;

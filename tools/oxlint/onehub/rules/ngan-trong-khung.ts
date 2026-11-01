import { relative } from "node:path";
import { defineRule } from "@oxlint/plugins";

import {
	DUONG_KHUON,
	docKhuonNgan,
	GOC_KHO,
	type KhuonNgan,
	khoiCuaTen,
} from "../shared/doc-khuon-ngan.ts";

let khuonDaDoc: KhuonNgan | null = null;
function khuon(): KhuonNgan {
	khuonDaDoc ??= docKhuonNgan(GOC_KHO);
	return khuonDaDoc;
}

export const nganTrongKhungRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: `Ngăn bản ghi đi qua khung chung: khối trong cam_ngoai_khuon của ${DUONG_KHUON} không nhập thẳng trong thư mục ngăn.`,
		},
		messages: {
			khoiCam: `«{{ten}}» (khối {{khoi}}) dựng thô trong ngăn bản ghi {{tep}}. Dùng {{thay}}. Cần thật thì thêm dòng ngoai_le có ly_do vào ${DUONG_KHUON}.`,
		},
	},
	create(context) {
		const k = khuon();
		const tep = relative(GOC_KHO, context.filename).split("\\").join("/");
		if (tep === k.khuonNhap) return {};
		const duocPhep = new Set(
			k.ngoaiLe
				.filter((n) => n.tep === tep && n.lyDo.trim())
				.map((n) => n.khoi),
		);
		return {
			ImportDeclaration(node) {
				for (const s of node.specifiers) {
					if (s.type !== "ImportSpecifier") continue;
					const ten =
						s.imported.type === "Identifier" ? s.imported.name : s.imported.value;
					const khoi = khoiCuaTen(ten, k);
					if (!khoi || duocPhep.has(khoi)) continue;
					context.report({
						node: s,
						messageId: "khoiCam",
						data: { ten, khoi, tep, thay: k.thayCho[khoi] },
					});
				}
			},
		};
	},
});

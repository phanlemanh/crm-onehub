import { relative } from "node:path";
import type { Node } from "@oxlint/plugins";
import { defineRule } from "@oxlint/plugins";

import {
	type DauHieu,
	DUONG_NO,
	docNoVeTay,
	GOC_KHO,
	type NoVeTay,
} from "../shared/no-ve-tay.ts";

const THAY = {
	table: "`DataTable` khi cần tìm, lọc, phân trang; còn lại `SimpleTable`",
	clipboard: "`CopyValue`",
	"tieu-de": "`PageShellTitle`, `CardTitle`; `SectionHeading` cho h3, h4",
	"divide-y": "`Item`; hộp nội dung là `Card` với `CardContent`",
	cham: "`StatusIndicator`",
	"chip-dinh": "chip của mục «Hàng công cụ»",
	"alert-dialog": "`ConfirmDialog`",
} satisfies Record<DauHieu, string>;

const TIEU_DE = new Set(["h1", "h2", "h3", "h4"]);

let noDaDoc: NoVeTay | null = null;
function no(): NoVeTay {
	noDaDoc ??= docNoVeTay(GOC_KHO);
	return noDaDoc;
}

type Gom = { chuoi: string[]; ten: string[] };

function gom(n: Node | null | undefined, ra: Gom): void {
	if (!n) return;
	switch (n.type) {
		case "Literal":
			if (n.raw && /^["']/.test(n.raw)) ra.chuoi.push(String(n.value));
			return;
		case "TemplateLiteral":
			for (const q of n.quasis) ra.chuoi.push(q.value.cooked ?? q.value.raw);
			for (const e of n.expressions) gom(e, ra);
			return;
		case "JSXExpressionContainer":
			if (n.expression.type !== "JSXEmptyExpression") gom(n.expression, ra);
			return;
		case "CallExpression":
			for (const a of n.arguments) gom(a, ra);
			return;
		case "ConditionalExpression":
			gom(n.consequent, ra);
			gom(n.alternate, ra);
			return;
		case "LogicalExpression":
			gom(n.left, ra);
			gom(n.right, ra);
			return;
		case "Identifier":
			ra.ten.push(n.name);
			return;
		default:
			return;
	}
}

function lop(chuoi: string[]): Set<string> {
	return new Set(chuoi.flatMap((c) => c.split(/\s+/).filter(Boolean)));
}

function tenThe(n: Node): string {
	return n.type === "JSXIdentifier" ? n.name : "";
}

export const khongVeTayRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Dấu hiệu vẽ tay của docs/design.md trong apps/app: dùng thành phần thay, nợ cũ khai trong danh sách cạnh luật.",
		},
		messages: {
			moi: `«{{dau}}» vẽ tay trong {{tep}}: dùng {{thay}}. Nợ cũ khai ở ${DUONG_NO}.`,
			vuot: `«{{dau}}» vẽ tay trong {{tep}}: dùng {{thay}} — vượt nợ cũ (khai {{so}}, có {{co}}).`,
			thieu: `Nợ cũ khai {{so}}, còn {{co}} cho «{{dau}}» trong {{tep}} — sửa ${DUONG_NO}.`,
		},
	},
	create(context) {
		const tep = relative(GOC_KHO, context.filename).split("\\").join("/");
		const trung = new Map<DauHieu, Node[]>();
		const hang = new Map<string, Gom>();
		const choTen: { ten: string; node: Node; chuoi: string[] }[] = [];
		const ghi = (dau: DauHieu, node: Node) => {
			trung.set(dau, [...(trung.get(dau) ?? []), node]);
		};
		const xetLop = (chuoi: string[], node: Node) => {
			const l = lop(chuoi);
			if (l.has("divide-y")) ghi("divide-y", node);
			if (l.has("size-2") && l.has("rounded-full")) ghi("cham", node);
		};
		return {
			VariableDeclarator(node) {
				if (node.id.type !== "Identifier" || !node.init) return;
				if (node.parent.type !== "VariableDeclaration" || node.parent.kind !== "const")
					return;
				const g: Gom = { chuoi: [], ten: [] };
				gom(node.init, g);
				hang.set(node.id.name, g);
			},
			JSXOpeningElement(node) {
				const ten = tenThe(node.name);
				if (ten === "table") ghi("table", node);
				for (const a of node.attributes) {
					if (a.type !== "JSXAttribute" || a.name.type !== "JSXIdentifier") continue;
					if (a.name.name === "className") {
						if (TIEU_DE.has(ten)) ghi("tieu-de", node);
						const g: Gom = { chuoi: [], ten: [] };
						gom(a.value, g);
						for (const t of g.ten) choTen.push({ ten: t, node: a, chuoi: g.chuoi });
						if (!g.ten.length) xetLop(g.chuoi, a);
					}
					if (
						ten === "ToggleGroup" &&
						a.name.name === "spacing" &&
						a.value?.type === "JSXExpressionContainer" &&
						a.value.expression.type === "Literal" &&
						a.value.expression.raw === "0"
					)
						ghi("chip-dinh", a);
				}
			},
			MemberExpression(node) {
				if (
					node.object.type === "Identifier" &&
					node.object.name === "navigator" &&
					node.property.type === "Identifier" &&
					node.property.name === "clipboard"
				)
					ghi("clipboard", node);
			},
			ImportDeclaration(node) {
				if (/(^|\/)alert-dialog$/.test(node.source.value)) ghi("alert-dialog", node);
			},
			"Program:exit"(prog) {
				const daXet = new Set<Node>();
				for (const c of choTen) {
					if (daXet.has(c.node)) continue;
					daXet.add(c.node);
					const them = choTen
						.filter((x) => x.node === c.node)
						.flatMap((x) => hang.get(x.ten)?.chuoi ?? []);
					xetLop([...c.chuoi, ...them], c.node);
				}
				const khai = new Map(
					no()
						.dong.filter((d) => d.tep === tep && d.lyDo.trim())
						.map((d) => [d.dauHieu, d.so]),
				);
				const dau = new Set<DauHieu>([...trung.keys(), ...khai.keys()]);
				for (const d of dau) {
					const cho = trung.get(d) ?? [];
					const so = khai.get(d) ?? 0;
					if (cho.length > so) {
						for (const n of cho)
							context.report({
								node: n,
								messageId: so ? "vuot" : "moi",
								data: { dau: d, tep, thay: THAY[d], so: String(so), co: String(cho.length) },
							});
					} else if (cho.length < so) {
						context.report({
							node: prog,
							messageId: "thieu",
							data: { dau: d, tep, so: String(so), co: String(cho.length) },
						});
					}
				}
			},
		};
	},
});

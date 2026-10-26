import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";

const THU_MUC = join(GOC, "packages/ui/src/components");
const NEO = { component: 120, boc: 44, doc_kho: 39 };
const NGOAI = /^(?!react|\.|@crm\/)[a-z@]/;

export function docComponent() {
	const ra = [];
	for (const t of readdirSync(THU_MUC)) {
		if (!t.endsWith(".tsx")) continue;
		const nguon = readFileSync(join(THU_MUC, t), "utf8");
		const nhap = [...nguon.matchAll(/import\s+(?:\*\s+as\s+(\w+)|\{([^}]*)\}|(\w+))\s+from\s+"([^"]+)"/g)];
		const tuNgoai = new Map();
		for (const m of nhap) {
			const goi = m[4];
			if (!NGOAI.test(goi) || goi.startsWith("react")) continue;
			const ten = m[1]
				? [m[1]]
				: m[2]
					? m[2].split(",").map((x) => x.split(" as ").pop().trim()).filter(Boolean)
					: [m[3]];
			for (const x of ten) if (x) tuNgoai.set(x, goi);
		}
		const veRa = [...tuNgoai].filter(([x]) =>
			new RegExp(`<${x}[\\s/>.]`).test(nguon),
		);
		ra.push({
			ten: t,
			goi: [...new Set(veRa.map(([, g]) => g))],
			nguyenBan: veRa.map(([x, g]) => `${x} (${g})`),
			boc: veRa.length > 0,
			docKho: nguon.includes("useMessages"),
		});
	}
	return ra;
}

if (process.argv[1]?.endsWith("khai-sinh.mjs")) {
	const ds = docComponent();
	const boc = ds.filter((c) => c.boc);
	const docKho = ds.filter((c) => c.docKho);
	const dem = { component: ds.length, boc: boc.length, doc_kho: docKho.length };
	console.log(
		`doc tu dia: ${dem.component} component · ${dem.boc} boc thu vien ngoai · ${dem.doc_kho} doc kho chuoi dung chung`,
	);
	console.log(`neo ghim:  ${NEO.component} · ${NEO.boc} · ${NEO.doc_kho}`);
	const lech = Object.entries(NEO).filter(([k, v]) => dem[k] !== v);
	if (lech.length > 0) {
		for (const [k, v] of lech)
			console.log(`   LECH: ${k} — do duoc ${dem[k]}, neo ghim ${v}`);
		console.log(
			"   Danh sach boc sinh tu CAU LENH NHAP trong file, khong go tay ten goi — lech nghia la mot ben sai, doc ten file de biet ben nao.",
		);
		for (const c of boc.slice(0, 5)) console.log(`   boc: ${c.ten} <- ${c.goi.join(", ")}`);
		process.exit(2);
	}
	console.log("XANH: ba con so doc tu dia bang ba con so neo.");
	process.exit(0);
}

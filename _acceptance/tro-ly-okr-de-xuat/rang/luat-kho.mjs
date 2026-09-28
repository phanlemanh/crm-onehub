import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const LUAT_KHO = {
	ra: join(GOC, "_acceptance/tro-ly-okr-de-xuat/evidence/luat-kho.md"),
	nen: "origin/onehub",
	vung: ["apps", "packages"],
	boQua: [/\/generated\//, /\.md$/, /\.json$/, /\.lock$/, /bun\.lock/],
	laTep: {
		kiem: [
			/\/test\//,
			/\.spec\.tsx?$/,
			/\.dom\.tsx$/,
			/\/evals\//,
			/\/proto\//,
		],
		cauHinh: [
			"packages/db/src/okr-tro-ly-danh-muc.ts",
			"apps/agent/agent/lib/okr/config.ts",
			"apps/api/src/okr/okr-config.ts",
		],
	},
	chuThich: /\/\/|\/\*/,
	url: /[a-z][a-z0-9+.-]*:\/\/[^\s"'`)]*/gi,
	nest: [
		"apps/api/src/okr/tro-ly.service.ts",
		"apps/api/src/agent/agent-trigger.service.ts",
	],
	goiMoHinh:
		/generateText|streamText|generateObject|streamObject|@ai-sdk|openai|anthropic|gateway|fetch\(/i,
	tran: {
		tep: "packages/db/src/okr-tro-ly-danh-muc.ts",
		batDau: "export const TRO_LY_OKR_TRAN = {",
		so: [
			{ ten: "30 phút", mau: /30\s*\*\s*(MINUTE_MS|60)|1_?800_?000/ },
			{ ten: "40", mau: /(?<![\w.])40(?![\w.])/ },
			{ ten: "20", mau: /(?<![\w.])20(?![\w.])/ },
			{ ten: "30 000", mau: /30_?000|30\s*\*\s*SECOND_MS/ },
			{ ten: "1 500", mau: /1_?500(?![\d])|1\.5\s*\*\s*SECOND_MS/ },
			{ ten: "7 ngày", mau: /7\s*\*\s*DAY|604_?800|7 ngày/ },
		],
	},
	kieuLong: /Record<string,\s*unknown>|as unknown/,
	ui: {
		tienTo: "apps/app/",
		mauTay: /<table|divide-y/,
		nguon: /from\s+"@crm\/ui[^"]*"/,
	},
	cat: 40,
};

function git(...thamSo) {
	return execFileSync("git", ["-C", GOC, ...thamSo], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
}

const khop = (tep, ds) => ds.some((m) => m.test(tep));

function tepDoi(nen) {
	return git(
		"diff",
		"--name-only",
		"--diff-filter=AM",
		nen,
		"HEAD",
		"--",
		...LUAT_KHO.vung,
	)
		.split("\n")
		.filter(Boolean)
		.filter((t) => !khop(t, LUAT_KHO.boQua));
}

function dongThem(nen, tep) {
	const ra = [];
	let so = 0;
	for (const d of git("diff", "-U0", nen, "HEAD", "--", tep).split("\n")) {
		const h = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(d);
		if (h) {
			so = Number(h[1]);
			continue;
		}
		if (d.startsWith("+++")) continue;
		if (d.startsWith("+")) {
			ra.push({ tep, so, chu: d.slice(1) });
			so += 1;
		}
	}
	return ra;
}

const dongIn = (d) => `${d.tep}:${d.so}: ${d.chu.trim()}`;

function khoi(ds) {
	if (ds.length === 0) return "(rỗng)";
	const cat = ds.slice(0, LUAT_KHO.cat);
	const them =
		ds.length > cat.length ? [`… cắt, còn ${ds.length - cat.length} dòng`] : [];
	return [...cat, ...them].join("\n");
}

function muc(tieuDe, lenh, ketQua, ketLuan) {
	return [
		`## ${tieuDe}`,
		"",
		"Lệnh:",
		"",
		"```",
		...lenh,
		"```",
		"",
		"Kết quả:",
		"",
		"```",
		ketQua,
		"```",
		"",
		`Kết luận: ${ketLuan}`,
		"",
	].join("\n");
}

function mucChuThich(nen, them) {
	const trung = them.filter((d) =>
		LUAT_KHO.chuThich.test(d.chu.replace(LUAT_KHO.url, "")),
	);
	return muc(
		"1. Chú thích trong dòng thêm",
		[
			`git diff -U0 ${nen.slice(0, 12)} HEAD -- apps packages   (bỏ ${LUAT_KHO.boQua.map(String).join(" ")})`,
			"lọc dòng «+» chứa // hoặc /* sau khi bỏ chuỗi URL (scheme://…)",
		],
		trung.length === 0 ? "0 dòng" : khoi(trung.map(dongIn)),
		trung.length === 0
			? "không dòng thêm nào mang chú thích."
			: `${trung.length} dòng khớp mẫu — đọc từng dòng: chuỗi hay regex chứa // không phải chú thích.`,
	);
}

function mucNest(nen) {
	const ketQua = LUAT_KHO.nest.flatMap((tep) => {
		const them = dongThem(nen, tep).filter((d) =>
			LUAT_KHO.goiMoHinh.test(d.chu),
		);
		const toan = readFileSync(join(GOC, tep), "utf8")
			.split("\n")
			.map((chu, i) => ({ tep, so: i + 1, chu }))
			.filter((d) => LUAT_KHO.goiMoHinh.test(d.chu));
		const nhap = readFileSync(join(GOC, tep), "utf8")
			.split("\n")
			.filter((d) => /^import /.test(d) || /^\} from /.test(d));
		return [
			`# ${tep}`,
			`dòng thêm khớp: ${them.length === 0 ? "0" : them.map(dongIn).join(" | ")}`,
			`cả tệp khớp: ${toan.length === 0 ? "0" : toan.map(dongIn).join(" | ")}`,
			"nguồn nhập:",
			...nhap.map((d) => `  ${d.trim()}`),
		];
	});
	const soThem = LUAT_KHO.nest.reduce(
		(s, tep) =>
			s +
			dongThem(nen, tep).filter((d) => LUAT_KHO.goiMoHinh.test(d.chu)).length,
		0,
	);
	const soCu = LUAT_KHO.nest.reduce(
		(s, tep) =>
			s +
			readFileSync(join(GOC, tep), "utf8")
				.split("\n")
				.filter((d) => LUAT_KHO.goiMoHinh.test(d)).length,
		0,
	);
	return muc(
		"2. API không gọi model hay vendor",
		[
			`git diff -U0 ${nen.slice(0, 12)} HEAD -- ${LUAT_KHO.nest.join(" ")}`,
			`grep -iE '${LUAT_KHO.goiMoHinh.source}' trên dòng thêm và trên cả tệp hiện tại; in các dòng import`,
		],
		ketQua.join("\n"),
		soThem === 0
			? `không dòng thêm nào của lượt gọi model, SDK AI hay fetch; ${soCu === 0 ? "cả tệp cũng không" : `${soCu} dòng khớp nằm ở phần cũ của tệp, ngoài diff lượt này (in ở trên)`}; nguồn nhập không có SDK AI hay vendor.`
			: `${soThem} dòng thêm khớp mẫu — đọc từng dòng.`,
	);
}

function mucTran(nen, them) {
	const noiDung = readFileSync(join(GOC, LUAT_KHO.tran.tep), "utf8").split(
		"\n",
	);
	const i = noiDung.findIndex((d) => d.startsWith(LUAT_KHO.tran.batDau));
	const j = noiDung.findIndex((d, k) => k > i && /^\} as const;/.test(d));
	const khoiTran = noiDung.slice(i, j + 1).join("\n");
	const nguon = them.filter(
		(d) =>
			!khop(d.tep, LUAT_KHO.laTep.kiem) &&
			!LUAT_KHO.laTep.cauHinh.includes(d.tep) &&
			/\.(ts|tsx|mjs)$/.test(d.tep),
	);
	const theoSo = LUAT_KHO.tran.so.map((s) => ({
		ten: s.ten,
		dong: nguon.filter((d) => s.mau.test(d.chu)),
	}));
	const ketQua = [
		`# ${LUAT_KHO.tran.tep} (dòng ${i + 1}–${j + 1})`,
		khoiTran,
		"",
		`# số tinh chỉnh trên dòng thêm của tệp nguồn (bỏ ${LUAT_KHO.laTep.cauHinh.join(", ")} và tệp kiểm, evals, proto)`,
		...theoSo.flatMap((s) => [
			`[${s.ten}] ${s.dong.length} dòng`,
			...s.dong.slice(0, LUAT_KHO.cat).map((d) => `  ${dongIn(d)}`),
		]),
	].join("\n");
	const tong = theoSo.reduce((s, x) => s + x.dong.length, 0);
	return muc(
		"3. Hằng tinh chỉnh ở một tệp cấu hình",
		[
			`sed -n '/${LUAT_KHO.tran.batDau}/,/^} as const;/p' ${LUAT_KHO.tran.tep}`,
			`git diff -U0 ${nen.slice(0, 12)} HEAD -- apps packages   rồi grep từng mẫu số trên dòng thêm của tệp nguồn`,
		],
		ketQua,
		tong === 0
			? "không số tinh chỉnh nào nằm rải ngoài tệp cấu hình."
			: `${tong} dòng khớp mẫu số — đọc từng dòng: số trong khuôn Zod, cỡ chữ hay chỉ số mảng không phải hằng tinh chỉnh.`,
	);
}

function mucKieu(nen, them) {
	const trung = them.filter((d) => LUAT_KHO.kieuLong.test(d.chu));
	const nguon = trung.filter((d) => !khop(d.tep, LUAT_KHO.laTep.kiem));
	return muc(
		"4. Record<string, unknown> và as unknown",
		[
			`git diff -U0 ${nen.slice(0, 12)} HEAD -- apps packages`,
			`grep -E '${LUAT_KHO.kieuLong.source}' trên dòng thêm`,
		],
		trung.length === 0 ? "0 dòng" : khoi(trung.map(dongIn)),
		nguon.length === 0
			? `không tệp nguồn nào của lượt thêm Record<string, unknown> hay ép kiểu qua unknown${trung.length > 0 ? `; ${trung.length} dòng nằm ở tệp kiểm (in ở trên)` : ""}.`
			: `${nguon.length} dòng ở tệp nguồn, ${trung.length - nguon.length} ở tệp kiểm — đọc từng dòng.`,
	);
}

function tenUi(noiDung) {
	const ten = new Set();
	for (const m of noiDung.matchAll(
		/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s+"@crm\/ui[^"]*"/g,
	))
		for (const t of m[1].split(","))
			ten.add(
				t
					.trim()
					.replace(/^type\s+/, "")
					.split(/\s+as\s+/)
					.at(-1),
			);
	return ten;
}

function theMo(dong, i) {
	for (let k = i; k >= 0 && k > i - 12; k -= 1) {
		const d = dong[k];
		const tim = [...d.matchAll(/<([A-Za-z][\w.]*)/g)].at(-1);
		if (tim) return tim[1];
	}
	return null;
}

function mucUi(nen, them) {
	const tep = [...new Set(them.map((d) => d.tep))].filter(
		(t) => t.startsWith(LUAT_KHO.ui.tienTo) && t.endsWith(".tsx"),
	);
	const cls = [];
	const tay = [];
	for (const t of tep) {
		const noiDung = readFileSync(join(GOC, t), "utf8");
		const dong = noiDung.split("\n");
		const ui = tenUi(noiDung);
		const soThem = new Set(them.filter((d) => d.tep === t).map((d) => d.so));
		dong.forEach((d, i) => {
			if (!soThem.has(i + 1)) return;
			if (LUAT_KHO.ui.mauTay.test(d)) tay.push(`${t}:${i + 1}: ${d.trim()}`);
			if (!d.includes("className=")) return;
			const the = theMo(dong, i);
			cls.push({
				dong: `${t}:${i + 1}: <${the ?? "?"}> ${d.trim()}`,
				ui: the !== null && ui.has(the.split(".")[0]),
			});
		});
	}
	const tren = cls.filter((c) => c.ui);
	const laProto = (c) => khop(c.dong, [/\/proto\//]);
	const trenSp = tren.filter((c) => !laProto(c));
	const ketQua = [
		`# tệp apps/app/**/*.tsx của lượt: ${tep.length}`,
		`# className= trên component nhập từ @crm/ui, màn sản phẩm: ${trenSp.length}`,
		...trenSp.map((c) => c.dong),
		`# className= trên component nhập từ @crm/ui, bản mẫu /proto: ${tren.length - trenSp.length}`,
		...tren.filter(laProto).map((c) => c.dong),
		`# className= trên thẻ HTML hay component cục bộ: ${cls.length - tren.length}`,
		...cls
			.filter((c) => !c.ui)
			.slice(0, LUAT_KHO.cat)
			.map((c) => c.dong),
		`# <table hay divide-y: ${tay.length}`,
		...tay,
	].join("\n");
	return muc(
		"5. className đè component @crm/ui, bảng và danh sách vẽ tay",
		[
			`git diff -U0 ${nen.slice(0, 12)} HEAD -- apps/app   (tệp .tsx)`,
			"trên dòng thêm: grep className=, tìm thẻ mở gần nhất, đối chiếu với tên nhập từ \"@crm/ui…\"; grep -E '<table|divide-y'",
		],
		ketQua,
		tren.length === 0 && tay.length === 0
			? "không className nào đặt trên component @crm/ui, không <table> hay divide-y tự dựng."
			: `${trenSp.length} className trên component @crm/ui ở màn sản phẩm và ${tren.length - trenSp.length} ở bản mẫu /proto, ${tay.length} dòng bảng/danh sách vẽ tay — đọc từng dòng: cỡ Skeleton, khoảng trong ô bảng và bố cục CardContent là chỗ hội đồng phải cân với luật «không đè class».`,
	);
}

function main() {
	const nen = git("merge-base", "HEAD", LUAT_KHO.nen).trim();
	const dau = git("rev-parse", "HEAD").trim();
	const tep = tepDoi(nen);
	const them = tep.flatMap((t) => dongThem(nen, t));
	const noiDung = [
		"# Luật kho trên diff của lượt tro-ly-okr-de-xuat",
		"",
		`Sinh bởi \`node _acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs\`. So HEAD \`${dau.slice(0, 12)}\` với \`git merge-base HEAD ${LUAT_KHO.nen}\` = \`${nen.slice(0, 12)}\`. ${tep.length} tệp thêm hay sửa dưới apps/ và packages/ (đã bỏ tệp sinh, *.md, *.json), ${them.length} dòng thêm.`,
		"",
		mucChuThich(nen, them),
		mucNest(nen),
		mucTran(nen, them),
		mucKieu(nen, them),
		mucUi(nen, them),
	].join("\n");
	mkdirSync(dirname(LUAT_KHO.ra), { recursive: true });
	writeFileSync(LUAT_KHO.ra, noiDung);
	console.log(
		`luat-kho: ${tep.length} tep, ${them.length} dong them → ${LUAT_KHO.ra.slice(GOC.length + 1)}`,
	);
}

main();

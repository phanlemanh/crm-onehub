import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");

const DANH_MUC = "packages/db/src/okr-tro-ly-danh-muc.ts";
const KIEM = "packages/validation/src/okr-kiem.ts";
const CHU_MAN = "apps/app/lib/messages/tro-ly-okr.ts";
const API = "apps/api/src/okr/tro-ly.service.ts";

const PHAM_VI = [
	"apps/agent/agent/lib/capabilities.ts",
	"apps/agent/agent/lib/mo-hinh-khoa.ts",
	"apps/agent/agent/lib/okr/config.ts",
	"apps/agent/agent/lib/okr/doc.ts",
	"apps/agent/agent/lib/okr/goi-ngu-canh.ts",
	"apps/agent/agent/lib/okr/kiem-san-sang.ts",
	"apps/agent/agent/lib/okr/mo-hinh.ts",
	"apps/agent/agent/lib/okr/viec.ts",
	"apps/api/src/okr/okr.contracts.ts",
	API,
	"apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx",
	"apps/app/app/(app)/[slug]/settings/okr/the-tro-ly-okr.tsx",
	"apps/app/lib/messages/okr-gop-y.ts",
	CHU_MAN,
	DANH_MUC,
	"packages/db/src/okr-tro-ly.ts",
	KIEM,
	"packages/validation/src/okr-tro-ly.ts",
];

const MIEN = [
	{
		luat: "dong-tu-lap",
		tep: "apps/agent/agent/lib/okr/config.ts",
		gia: '"run"',
		lyDo: "tinNhanGoc la lenh gui phien goc, trung chu voi dong tu tieng Anh, khong phai danh sach dong tu",
	},
	{
		luat: "tac-nhan",
		tep: CHU_MAN,
		gia: "dong 111",
		lyDo: "nhan ten tinh nang Tac nhan (muc Tac nhan cua CONTEXT.md), co tu truoc luot, khong phai chu goi tac tu",
	},
];

function quet(s) {
	const chuoi = [];
	const chuThich = [];
	let i = 0;
	let dong = 1;
	const dem = (a, b) => {
		for (let k = a; k < b; k++) if (s[k] === "\n") dong += 1;
	};
	const docChuoi = (dau) => {
		const batDau = i;
		const dongDau = dong;
		i += 1;
		let noi = "";
		while (i < s.length && s[i] !== dau) {
			if (s[i] === "\\") {
				noi += s[i + 1] ?? "";
				i += 2;
				continue;
			}
			if (dau === "`" && s[i] === "$" && s[i + 1] === "{") {
				let sau = 1;
				i += 2;
				while (i < s.length && sau > 0) {
					if (s[i] === "{") sau += 1;
					else if (s[i] === "}") sau -= 1;
					else if (s[i] === '"' || s[i] === "'" || s[i] === "`") {
						dem(batDau, i);
						const truoc = i;
						docChuoi(s[i]);
						dong = dongDau;
						dem(batDau, truoc);
						continue;
					}
					if (sau > 0) i += 1;
				}
				i += 1;
				noi += " ";
				continue;
			}
			noi += s[i];
			i += 1;
		}
		i += 1;
		dong = dongDau;
		dem(batDau, i);
		chuoi.push({ dong: dongDau, gia: noi });
	};
	while (i < s.length) {
		const c = s[i];
		if (c === '"' || c === "'" || c === "`") {
			docChuoi(c);
			continue;
		}
		if (c === "/" && s[i + 1] === "/") {
			chuThich.push(dong);
			while (i < s.length && s[i] !== "\n") i += 1;
			continue;
		}
		if (c === "/" && s[i + 1] === "*") {
			chuThich.push(dong);
			const het = s.indexOf("*/", i + 2);
			const toi = het === -1 ? s.length : het + 2;
			dem(i, toi);
			i = toi;
			continue;
		}
		if (c === "\n") dong += 1;
		i += 1;
	}
	return { chuoi, chuThich };
}

function bienKhoa(goc) {
	const nguon = readFileSync(join(goc, DANH_MUC), "utf8");
	const khop = nguon.match(
		/TRO_LY_OKR_KHOA\s*=\s*\{\s*rieng:\s*"([A-Z_]+)",\s*chung:\s*"([A-Z_]+)"/,
	);
	if (!khop) throw new Error("THUOC HONG: khong doc duoc TRO_LY_OKR_KHOA");
	return [khop[1], khop[2]];
}

function dongTu(goc) {
	const nguon = readFileSync(join(goc, KIEM), "utf8");
	const khoi = nguon.match(/dongTuViec:\s*\[([^\]]*)\]/);
	if (!khoi) throw new Error("THUOC HONG: khong doc duoc OKR_KIEM.dongTuViec");
	const ds = [...khoi[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
	if (ds.length < 5)
		throw new Error(`THUOC HONG: dongTuViec chi co ${ds.length} muc`);
	return ds;
}

function soat(goc, inRa) {
	const viPham = [];
	const daDung = new Set();
	const mien = (luat, tep, cau) => {
		const k = MIEN.find(
			(m) => m.luat === luat && m.tep === tep && cau.startsWith(m.gia),
		);
		if (k) daDung.add(k);
		return Boolean(k);
	};
	const loi = (luat, tep, cau) => {
		if (mien(luat, tep, cau)) return;
		viPham.push(`${luat}: ${tep}: ${cau}`);
	};

	const bien = bienKhoa(goc);
	const tu = dongTu(goc);
	const moTep = new Map(
		PHAM_VI.map((t) => [t, readFileSync(join(goc, t), "utf8")]),
	);

	for (const [tep, s] of moTep) {
		const { chuoi, chuThich } = quet(s);
		for (const d of chuThich) loi("chu-thich", tep, `dong ${d}`);

		if (tep.startsWith("apps/api/")) {
			for (const m of s.matchAll(
				/AI_GATEWAY_API_KEY|VERCEL_OIDC_TOKEN|createGateway|getVercelOidcToken|@ai-sdk\/gateway/g,
			))
				loi("api-doc-khoa", tep, m[0]);
		}

		if (tep !== DANH_MUC) {
			for (const c of chuoi)
				for (const b of bien)
					if (c.gia.split(/[^A-Z_]/).includes(b))
						loi("ten-bien-lap", tep, `${b} o dong ${c.dong}`);
		}

		if (tep !== KIEM) {
			for (const c of chuoi)
				if (tu.includes(c.gia))
					loi("dong-tu-lap", tep, `"${c.gia}" o dong ${c.dong}`);
		}

		if (/Record<\s*string\s*,\s*unknown\s*>/.test(s))
			loi("record-tha-noi", tep, "Record<string, unknown>");

		for (const c of chuoi)
			if (/tác nhân/i.test(c.gia)) loi("tac-nhan", tep, `dong ${c.dong}`);
	}

	for (const m of MIEN)
		if (!daDung.has(m))
			viPham.push(`mien-thua: ${m.tep}: ${m.luat} ${m.gia} khong con hit that`);

	if (inRa) {
		console.log(
			`pham vi ${PHAM_VI.length} tep; bien khoa ${bien.join(", ")}; ${tu.length} dong tu`,
		);
		for (const v of viPham) console.log(`VI PHAM ${v}`);
	}
	return viPham;
}

const PHA = [
	{
		luat: "chu-thich",
		tep: API,
		lam: (s) => s.replace(/\n/, "\n// ghi chu\n"),
	},
	{
		luat: "api-doc-khoa",
		tep: API,
		lam: (s) => `${s}\nexport const kk = process.env.AI_GATEWAY_API_KEY;\n`,
	},
	{
		luat: "ten-bien-lap",
		tep: CHU_MAN,
		lam: (s) => `${s}\nexport const tt = "Cắm OKR_AI_GATEWAY_API_KEY";\n`,
	},
	{
		luat: "dong-tu-lap",
		tep: CHU_MAN,
		lam: (s) => `${s}\nexport const dt = ["gọi", "gửi"];\n`,
	},
	{
		luat: "record-tha-noi",
		tep: API,
		lam: (s) => `${s}\nexport type Th = Record<string, unknown>;\n`,
	},
	{
		luat: "tac-nhan",
		tep: CHU_MAN,
		lam: (s) => `${s}\nexport const tn = "Tác nhân chưa sẵn sàng";\n`,
	},
	{
		luat: "mien-thua",
		tep: "apps/agent/agent/lib/okr/config.ts",
		lam: (s) => s.replace('tinNhanGoc: "run"', 'tinNhanGoc: "chay"'),
	},
];

function banSao() {
	const tam = mkdtempSync(join(tmpdir(), "luat-kho-"));
	for (const t of PHAM_VI) {
		mkdirSync(dirname(join(tam, t)), { recursive: true });
		cpSync(join(GOC, t), join(tam, t));
	}
	return tam;
}

function thuHaiChieu() {
	const tam = banSao();
	try {
		const lanh = soat(tam, false);
		if (lanh.length > 0) return { lanh, lech: [] };
		const lech = [];
		for (const p of PHA) {
			const tep = join(tam, p.tep);
			const goc = readFileSync(tep, "utf8");
			const pha = p.lam(goc);
			if (pha === goc) {
				lech.push(`${p.luat}: phep pha khong doi tep`);
				continue;
			}
			writeFileSync(tep, pha);
			const ra = soat(tam, false);
			writeFileSync(tep, goc);
			const trung = ra.filter((v) => v.startsWith(`${p.luat}: ${p.tep}:`));
			if (trung.length === 0) lech.push(`${p.luat}: pha ma khong do`);
			else console.log(`pha thu do dung: ${trung[0]}`);
		}
		return { lanh: [], lech };
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

try {
	const thu = thuHaiChieu();
	if (thu.lech.length > 0) {
		for (const l of thu.lech) console.log(`THUOC HONG ${l}`);
		process.exit(2);
	}
	console.log("-- cay that --");
	const viPham = soat(GOC, true);
	if (viPham.length > 0) {
		console.log(`luat kho vi pham: ${viPham.length}`);
		process.exit(1);
	}
	console.log(
		`luat kho du: sau luat, khong vi pham; mien tru da dung ${MIEN.length}`,
	);
} catch (e) {
	console.log(e instanceof Error ? e.message : String(e));
	process.exit(2);
}

import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "chi-tiet-cong-ty-hai-cot";
const CHI_DO = process.argv.includes("--chi-do");

const HEP = 375;
const VUA = 768;
const RONG = 1440;
const CHO_MS = 30_000;
const CHO_API_MS = 120_000;
const O_TEP_TOI_THIEU = 600;
const PHAN_TU_NGAN_TOI_THIEU = 50;
const DAI_TEN_TEP = 60;
const MA = `ctc${Date.now().toString(36).slice(-5)}`;

const TEP_CONG_TY = "apps/app/components/crm/record-sheet/company-sheet.tsx";
const TEP_PARTS = "apps/app/components/crm/record-sheet/record-parts.tsx";
const TEP_O_TEP = "apps/app/components/crm/fields/o-tep.tsx";
const TEP_KEO_THA = "packages/ui/src/components/nguon-keo-tha.tsx";
const TEP_KHUNG = "apps/app/components/detail-sheet.tsx";

const KHOI_CHU = /"flex min-w-0 flex-1 basis-\d+ flex-col gap-0\.5"/;
const VUNG_GOC =
	'"flex flex-wrap items-center gap-3 rounded-lg border border-input border-dashed bg-card p-4 transition-colors"';
const MO_CHI_TIET = "<DetailSheetSection\n\t\t\t\t\ttitle={m.company.details}";

const khoiGioiThieu = (s) => {
	const dau = s.indexOf("\t\t\t\t<CompanyAbout");
	const cuoi = s.indexOf("/>", dau) + 2;
	return dau < 0 ? null : s.slice(dau, cuoi);
};
const khoiCho = (s) => {
	const dau = s.indexOf("\t\t\t\t\t<DetailSheetPending");
	const cuoi = s.indexOf("/>", dau) + 2;
	return dau < 0 ? null : s.slice(dau, cuoi);
};
const khoiLienKet = (s) => {
	const dau = s.indexOf("\t\t\t\t{hasCompanyLinks(company) ? (");
	const cuoi = s.indexOf(") : null}", dau) + ") : null}".length;
	return dau < 0 ? null : s.slice(dau, cuoi);
};
const doiCho = (s, khoi, truoc) => {
	if (!khoi || !s.includes(truoc)) return s;
	return s.replace(khoi, "").replace(truoc, `${khoi}\n\n${truoc}`);
};

const CAY_DO = {
	"1a": {
		nhan: "ban sao Chi tiet quay ve cot phai 320px (buoc 1)",
		tep: TEP_CONG_TY,
		chiBuoc: "1",
		cam: (s) =>
			s.replace(
				MO_CHI_TIET,
				`<DetailSheetSection\n\t\t\t\t\tclassName="lg:ml-auto lg:w-80"\n\t\t\t\t\ttitle={m.company.details}`,
			),
		dauVet: 'className="lg:ml-auto lg:w-80"',
		ghim: /ctc-man: chi tiet hep 1440/,
	},
	"1b": {
		nhan: "ban sao Chi tiet quay ve cot phai 320px (buoc 2)",
		tep: TEP_CONG_TY,
		chiBuoc: "2",
		cam: (s) =>
			s.replace(
				MO_CHI_TIET,
				`<DetailSheetSection\n\t\t\t\t\tclassName="lg:ml-auto lg:w-80"\n\t\t\t\t\ttitle={m.company.details}`,
			),
		dauVet: 'className="lg:ml-auto lg:w-80"',
		ghim: /ctc-man: o tep hep/,
	},
	2: {
		nhan: "ban sao Gioi thieu dat sau Chi tiet",
		tep: TEP_CONG_TY,
		chiBuoc: "1",
		cam: (s) => {
			const k = khoiGioiThieu(s);
			const lk = khoiLienKet(s);
			return k && lk ? s.replace(k, "").replace(lk, `${k}\n\n${lk}`) : s;
		},
		dauVet: "/>\n\n\t\t\t\t{hasCompanyLinks(company) ? (",
		ghim: /ctc-man: gioi thieu sau chi tiet 1440/,
	},
	3: {
		nhan: "ban sao Chi tiet columns={1}",
		tep: TEP_CONG_TY,
		chiBuoc: "1",
		cam: (s) =>
			s.replace(
				"<DetailSheetProperties>\n\t\t\t\t\t\t{chiTiet.map",
				"<DetailSheetProperties columns={1}>\n\t\t\t\t\t\t{chiTiet.map",
			),
		dauVet: "<DetailSheetProperties columns={1}>",
		ghim: /ctc-man: chi tiet mot cot 1440/,
	},
	4: {
		nhan: "ban sao o Tep bo wide",
		tep: TEP_O_TEP,
		chiBuoc: "2",
		cam: (s) =>
			s.replace(
				/<DetailSheetProperty label=\{nhan\} wide( stackBelowMd)?>/,
				(_, sau) => `<DetailSheetProperty label={nhan}${sau ?? ""}>`,
			),
		dauVet: "<DetailSheetProperty label={nhan} stackBelowMd>",
		ghim: /ctc-man: o tep hep/,
	},
	5: {
		nhan: "ban sao chu vung keo tha mat be rong nen",
		tep: TEP_KEO_THA,
		chiBuoc: "3",
		cam: (s) => s.replace(KHOI_CHU, '"flex min-w-0 flex-1 flex-col gap-0.5"'),
		dauVet: '"flex min-w-0 flex-1 flex-col gap-0.5"',
		ghim: /ctc-man: keo tha chu canh nut cong-ty/,
	},
	6: {
		nhan: "ban sao vung keo tha min-w-[480px]",
		tep: TEP_KEO_THA,
		chiBuoc: "4",
		cam: (s) =>
			s.replace(
				VUNG_GOC,
				VUNG_GOC.replace("flex flex-wrap", "flex min-w-[480px] flex-wrap"),
			),
		dauVet: "flex min-w-[480px] flex-wrap",
		ghim: /ctc-man: tran ngang ngan/,
	},
	"7a": {
		nhan: "ban sao vung keo tha xep doc luon (buoc 2)",
		tep: TEP_KEO_THA,
		chiBuoc: "2",
		cam: (s) =>
			s.replace(
				VUNG_GOC,
				VUNG_GOC.replace(
					"flex flex-wrap items-center",
					"flex flex-col items-start",
				),
			),
		dauVet: "flex flex-col items-start gap-3 rounded-lg",
		ghim: /ctc-man: keo tha tach hang 1440/,
	},
	"7b": {
		nhan: "ban sao vung keo tha xep doc luon (buoc 5)",
		tep: TEP_KEO_THA,
		chiBuoc: "5",
		cam: (s) =>
			s.replace(
				VUNG_GOC,
				VUNG_GOC.replace(
					"flex flex-wrap items-center",
					"flex flex-col items-start",
				),
			),
		dauVet: "flex flex-col items-start gap-3 rounded-lg",
		ghim: /ctc-man: lien-he keo tha tach hang/,
	},
	"7c": {
		nhan: "ban sao vung keo tha xep doc luon (buoc 7)",
		tep: TEP_KEO_THA,
		chiBuoc: "7",
		cam: (s) =>
			s.replace(
				VUNG_GOC,
				VUNG_GOC.replace(
					"flex flex-wrap items-center",
					"flex flex-col items-start",
				),
			),
		dauVet: "flex flex-col items-start gap-3 rounded-lg",
		ghim: /ctc-man: tai-lieu keo tha tach hang/,
	},
	8: {
		nhan: "ban sao dong Kara cho dat truoc Chi tiet",
		tep: TEP_CONG_TY,
		chiBuoc: "6",
		cam: (s) => {
			const k = khoiCho(s);
			return k
				? s
						.replace(k, "")
						.replace(
							"\t\t\t\t<CompanyAbout",
							`${k.replace(/^\t/gm, "")}\n\n\t\t\t\t<CompanyAbout`,
						)
				: s;
		},
		dauVet: "/>\n\n\t\t\t\t<CompanyAbout",
		ghim: /ctc-man: muc dau khong phai chi tiet/,
	},
	9: {
		nhan: "ban sao ten tep max-w-32",
		tep: TEP_O_TEP,
		chiBuoc: "2",
		cam: (s) =>
			s.replace(
				'<span className="min-w-0 truncate">{t.tenTep}</span>',
				'<span className="min-w-0 max-w-32 truncate">{t.tenTep}</span>',
			),
		dauVet: "min-w-0 max-w-32 truncate",
		ghim: /ctc-man: ten tep cat/,
	},
	10: {
		nhan: "ban sao nut tep xuong hang rieng o moi kho",
		tep: TEP_O_TEP,
		chiBuoc: "2",
		cam: (s) =>
			s.replace(
				"const HangNut = useIsMobile() ? ItemFooter : ItemActions;",
				"const HangNut = useIsMobile() ? ItemFooter : ItemFooter;",
			),
		dauVet: "? ItemFooter : ItemFooter;",
		ghim: /ctc-man: nut tep rot dong/,
	},
	11: {
		nhan: "ban sao chu vung keo tha ep w-20",
		tep: TEP_KEO_THA,
		chiBuoc: "3",
		cam: (s) =>
			s.replace(KHOI_CHU, '"flex w-20 min-w-0 flex-none flex-col gap-0.5"'),
		dauVet: "flex w-20 min-w-0 flex-none",
		ghim: /ctc-man: keo tha bop chu cong-ty/,
	},
	12: {
		nhan: "ban sao Gioi thieu dung khung ca khi khong mo ta",
		tep: TEP_PARTS,
		chiBuoc: "6",
		cam: (s) =>
			s.replace(
				"\tif (!description) return null;\n\n\treturn (\n\t\t<DetailSheetSection title={title}>",
				"\treturn (\n\t\t<DetailSheetSection title={title}>",
			),
		dauVet: "description: string | null | undefined;\n}) {\n\treturn (",
		ghim: /ctc-man: gioi thieu rong/,
	},
	13: {
		nhan: "ban sao Lien ket dat len truoc Chi tiet",
		tep: TEP_CONG_TY,
		chiBuoc: "6",
		cam: (s) =>
			doiCho(
				s,
				khoiLienKet(s),
				"\t\t\t\t<DetailSheetSection\n\t\t\t\t\ttitle={m.company.details}",
			),
		dauVet:
			") : null}\n\n\t\t\t\t<DetailSheetSection\n\t\t\t\t\ttitle={m.company.details}",
		ghim: /ctc-man: lien ket truoc kara cho/,
	},
	14: {
		nhan: "ban sao hang the con bo khung cuon ngang",
		tep: TEP_KHUNG,
		chiBuoc: "4",
		cam: (s) =>
			s.replace(
				'className="shrink-0 overflow-x-auto overflow-y-hidden"',
				'className="shrink-0"',
			),
		dauVet: 'data-tab-cuon-ngang\n\t\t\t\t\tclassName="shrink-0"',
		ghim: /ctc-man: tran ngang ngan button\[tabs-trigger\]/,
	},
};

if (CHI_DO) {
	const ket = [];
	for (const so of Object.keys(CAY_DO)) {
		const r = spawnSync("bun", [relative(GOC, TEP_NAY), `--chieu-do=${so}`], {
			cwd: GOC,
			stdio: "inherit",
		});
		ket.push({ so, ma: r.status });
		console.log(`chieu do ${so}: ma ${r.status}`);
	}
	const lot = ket.filter((k) => k.ma !== 0);
	const chieu = new Set(Object.keys(CAY_DO).map((k) => k.replace(/[a-z]$/, "")))
		.size;
	if (lot.length > 0) {
		console.log(
			`ctc-man-do: ${lot.length}/${ket.length} cap chieu do khong ra dung ghim (${lot.map((k) => k.so).join(", ")})`,
		);
		process.exit(1);
	}
	console.log(
		`ctc-man-do: ${chieu}/${chieu} chieu do ra dung ghim (${ket.length} cap chieu-buoc)`,
	);
	process.exit(0);
}

const coChieuDo = process.argv.find((a) => a.startsWith("--chieu-do"));
if (coChieuDo) {
	const so = coChieuDo.split("=")[1] ?? "1a";
	const cay = CAY_DO[so];
	if (!cay) {
		console.log(`KHONG DO DUOC: do-bo-cuc khong co chieu do ${so}`);
		process.exit(2);
	}
	const { chieuDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
	await chieuDo(TEP_NAY, { ...cay, tenCay: `ctc-chieu-do-${so}` });
}

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/do-bo-cuc.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, "_acceptance", HO_SO, "evidence");
mkdirSync(process.env.BANG_CHUNG, { recursive: true });

const { chay, moDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
const { dungKhoGia, KHOA_GIA } = await import(
	"../../truong-tep/rang/blob-gia.mjs"
);
const { recordSheetMessages } = await import(
	"../../../apps/app/lib/messages/record-sheet.ts"
);
const { crmMessages } = await import("../../../apps/app/lib/messages/crm.ts");
const { taiLieuMessages } = await import(
	"../../../apps/app/lib/messages/tai-lieu.ts"
);

const CHU_PHIEU = recordSheetMessages("vi");
const CHU_CRM = crmMessages("vi");
const CHU_TL = taiLieuMessages("vi").nguon;
const CHU = {
	gioiThieu: CHU_PHIEU.section.about,
	chiTiet: CHU_PHIEU.company.details,
	lienKet: CHU_PHIEU.section.links,
	karaTra: CHU_CRM.enrichment.agentResearching,
	chuaBiet: CHU_CRM.enrichment.notKnown,
	web: CHU_CRM.web.title,
	keoTha: CHU_CRM.tepTruong.keoTha,
	chonTep: CHU_CRM.tepTruong.chonTep,
	mo: CHU_CRM.tepTruong.nutMo,
	xoa: CHU_CRM.tepTruong.nutXoa,
	tlKeoTha: CHU_TL.hop.keoTha,
	tlChonTep: CHU_TL.hop.keoThaNut,
};

const TEN_TEP = (() => {
	const goc =
		`Hợp đồng hợp tác An Phú — bản ký chính thức năm 2026 ${MA}`.normalize(
			"NFC",
		);
	const than = [...goc]
		.slice(0, DAI_TEN_TEP - 4)
		.join("")
		.padEnd(DAI_TEN_TEP - 4, "0");
	return `${than}.pdf`;
})();
if ([...TEN_TEP].length !== DAI_TEN_TEP) {
	console.log(
		`KHONG DO DUOC: ten tep khong ${DAI_TEN_TEP} ky tu (${[...TEN_TEP].length})`,
	);
	process.exit(2);
}

const BANG = process.env.BANG_CHUNG;
const SEL_NGAN = '[data-slot="drawer-content"], [data-slot="sheet-content"]';
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

const khoGia = dungKhoGia();
const congApi = new URL(process.env.API_URL).port;
let apiCuaTa = null;
let khongDo = null;

function nhomCuaCong(cong) {
	const ra = spawnSync("lsof", ["-ti", `tcp:${cong}`, "-sTCP:LISTEN"], {
		encoding: "utf8",
	});
	const pid = Number((ra.stdout ?? "").trim().split("\n")[0]);
	if (!pid) return null;
	const nhom = spawnSync("ps", ["-o", "pgid=", "-p", String(pid)], {
		encoding: "utf8",
	});
	return Number((nhom.stdout ?? "").trim()) || null;
}

async function dungApi() {
	if (!apiCuaTa) return;
	try {
		process.kill(-apiCuaTa.pid, "SIGTERM");
	} catch {}
	for (let i = 0; i < 50; i += 1) {
		try {
			process.kill(-apiCuaTa.pid, 0);
		} catch {
			break;
		}
		await ngu(100);
	}
	try {
		process.kill(-apiCuaTa.pid, "SIGKILL");
	} catch {}
	apiCuaTa = null;
}

async function khoiApi() {
	const cu = nhomCuaCong(congApi);
	if (cu && cu !== process.pid) {
		try {
			process.kill(-cu, "SIGTERM");
		} catch {}
		for (let i = 0; i < 100 && nhomCuaCong(congApi); i += 1) await ngu(100);
	}
	if (nhomCuaCong(congApi))
		throw new Error(`cong ${congApi} van ban sau khi dung API cu`);
	apiCuaTa = spawn(
		"bun",
		[
			"--preload",
			join(GOC, "_acceptance/truong-tep/rang/nap-blob-gia.mjs"),
			"src/main.ts",
		],
		{
			cwd: join(GOC, "apps/api"),
			env: {
				...process.env,
				PORT: congApi,
				TEP_BAN_GHI_BLOB_TOKEN: KHOA_GIA,
				KHO_TAI_LIEU_BLOB_TOKEN: KHOA_GIA,
				VERCEL_BLOB_API_URL: khoGia.url,
				TTP_BLOB_GIA: khoGia.url,
			},
			detached: true,
			stdio: ["ignore", "ignore", "ignore"],
		},
	);
	const han = Date.now() + CHO_API_MS;
	while (Date.now() < han) {
		if (apiCuaTa.exitCode !== null)
			throw new Error(`API cua rang thoat ${apiCuaTa.exitCode}`);
		const ok = await fetch(`${process.env.API_URL}/health`)
			.then((r) => r.ok)
			.catch(() => false);
		if (ok) return;
		await ngu(500);
	}
	throw new Error("API cua rang khong san sang");
}

async function don() {
	await dungApi();
	khoGia.dung();
}

for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"]) {
	process.on(tin, () => {
		void don().then(() => {
			console.log(`KHONG DO DUOC: bi ngat ${tin}`);
			process.exit(2);
		});
	});
}

async function chup(t, ten) {
	await t.screenshot({ path: join(BANG, ten), fullPage: false });
	console.log(`  anh ${ten}`);
}

const pdf = () => {
	const dau = Buffer.from(`%PDF-1.4\n% ${MA}\n`);
	const duoi = Buffer.from("\n%%EOF\n");
	return Buffer.concat([
		dau,
		Buffer.alloc(24 * 1024 - dau.length - duoi.length, 0x20),
		duoi,
	]);
};

const doTab = (t, chu) =>
	t.evaluate(
		(sel, chu) => {
			const k = [...document.querySelectorAll(sel)]
				.filter((e) => e.checkVisibility())
				.at(-1);
			if (!k) return { loi: "khong thay ngan" };
			const panel = [
				...k.querySelectorAll('[role="tabpanel"][data-state="active"]'),
			].at(0);
			if (!panel) return { loi: "khong thay noi dung tab" };
			const hop = (e) => {
				const r = e.getBoundingClientRect();
				return {
					top: r.top,
					bottom: r.bottom,
					left: r.left,
					right: r.right,
					width: r.width,
				};
			};
			const muc = [...panel.querySelectorAll("section")].filter((s) =>
				s.checkVisibility(),
			);
			const tieuDe = (s) =>
				s.querySelector(":scope > div > h3")?.textContent?.trim() ?? "";
			const theoTen = (ten) => muc.find((s) => tieuDe(s) === ten) ?? null;
			const gt = theoTen(chu.gioiThieu);
			const ct = theoTen(chu.chiTiet);
			const lk = theoTen(chu.lienKet);
			const web = theoTen(chu.web);
			const luoi = ct?.querySelector(":scope > div.grid") ?? null;
			const hang = luoi
				? [...luoi.children].filter((e) => e.checkVisibility())
				: [];
			const theoDinh = new Map();
			for (const h of hang) {
				const top = Math.round(h.getBoundingClientRect().top);
				const ds = theoDinh.get(top) ?? new Set();
				ds.add(Math.round(h.getBoundingClientRect().left));
				theoDinh.set(top, ds);
			}
			const hangHaiCot = [...theoDinh.values()].filter(
				(s) => s.size >= 2,
			).length;
			const nhanCho = [...panel.querySelectorAll("span")].find((s) => {
				const x = s.textContent?.trim();
				return (x === chu.karaTra || x === chu.chuaBiet) && s.checkVisibility();
			});
			const cho = nhanCho?.parentElement?.parentElement ?? null;
			const ungVien = [
				...muc.map((s) => ({ ten: tieuDe(s) || "(muc khong tieu de)", e: s })),
				...(cho ? [{ ten: "dong Kara cho", e: cho }] : []),
			].sort(
				(a, b) =>
					a.e.getBoundingClientRect().top - b.e.getBoundingClientRect().top,
			);
			return {
				panel: hop(panel),
				gt: gt
					? {
							...hop(gt),
							chu: gt.querySelector("p")?.textContent?.trim() ?? "",
						}
					: null,
				ct: ct ? hop(ct) : null,
				luoi: luoi ? hop(luoi) : null,
				lk: lk ? hop(lk) : null,
				web: web ? hop(web) : null,
				cho: cho ? hop(cho) : null,
				hang: hang.length,
				hangHaiCot,
				dau: ungVien[0]?.ten ?? null,
			};
		},
		SEL_NGAN,
		chu,
	);

const doOTep = (t, chu) =>
	t.evaluate(
		(sel, chu) => {
			const k = [...document.querySelectorAll(sel)]
				.filter((e) => e.checkVisibility())
				.at(-1);
			if (!k) return { loi: "khong thay ngan" };
			const hop = (e) => {
				const r = e.getBoundingClientRect();
				return {
					top: r.top,
					bottom: r.bottom,
					left: r.left,
					right: r.right,
					width: r.width,
				};
			};
			const oTep = [...k.querySelectorAll('[data-slot="o-tep"]')].filter((e) =>
				e.checkVisibility(),
			);
			const dong = [...k.querySelectorAll("[data-tep]")].filter((e) =>
				e.checkVisibility(),
			);
			const d = dong[0] ?? null;
			const ten = d?.querySelector('[data-slot="item-title"] span') ?? null;
			const noiDung = d?.querySelector('[data-slot="item-content"]') ?? null;
			const nut = d
				? [...d.querySelectorAll("button")].filter((b) =>
						[chu.mo, chu.xoa].includes(b.textContent?.trim()),
					)
				: [];
			const ct = oTep[0]?.closest("section") ?? null;
			const luoi = ct?.querySelector(":scope > div.grid") ?? null;
			const hang = luoi
				? [...luoi.children].filter((e) => e.checkVisibility())
				: [];
			const theoDinh = new Map();
			for (const h of hang) {
				const top = Math.round(h.getBoundingClientRect().top);
				const ds = theoDinh.get(top) ?? new Set();
				ds.add(Math.round(h.getBoundingClientRect().left));
				theoDinh.set(top, ds);
			}
			return {
				soOTep: oTep.length,
				oTep: oTep[0] ? hop(oTep[0]) : null,
				soDong: dong.length,
				ten: ten
					? {
							chu: ten.textContent ?? "",
							cat: ten.scrollWidth > ten.clientWidth + 1,
						}
					: null,
				soNut: nut.length,
				nutCungHang: noiDung
					? nut.map(
							(b) =>
								b.getBoundingClientRect().left >=
									noiDung.getBoundingClientRect().right - 1 &&
								b.getBoundingClientRect().top <
									noiDung.getBoundingClientRect().bottom,
						)
					: [],
				hangHaiCot: [...theoDinh.values()].filter((s) => s.size >= 2).length,
			};
		},
		SEL_NGAN,
		chu,
	);

const doVung = (t, goc, nhan, nutChu) =>
	t.evaluate(
		(goc, nhan, nutChu) => {
			const khung = goc
				? [...document.querySelectorAll(goc)]
						.filter((e) => e.checkVisibility())
						.at(-1)
				: document;
			if (!khung) return { loi: "khong thay khung" };
			const vung = [
				...khung.querySelectorAll('[data-slot="nguon-keo-tha"]'),
			].filter((e) => e.checkVisibility());
			const v = vung[0];
			if (!v) return { soVung: 0 };
			v.scrollIntoView({ block: "center" });
			const nut =
				[...v.querySelectorAll("button")].find(
					(b) => b.textContent?.trim() === nutChu,
				) ?? null;
			const nhanEl =
				[...v.querySelectorAll("span")].find(
					(s) => s.textContent?.trim() === nhan,
				) ?? null;
			const khoi = nhanEl?.parentElement ?? null;
			const moTa =
				khoi?.querySelector('[data-slot="field-description"]') ?? null;
			let dong = 0;
			if (nhanEl?.firstChild) {
				const r = document.createRange();
				r.selectNodeContents(nhanEl);
				const tops = [];
				for (const q of r.getClientRects()) {
					if (q.width === 0) continue;
					if (!tops.some((x) => Math.abs(x - q.top) <= 2)) tops.push(q.top);
				}
				dong = tops.length;
			}
			const qv = v.getBoundingClientRect();
			const qn = nut?.getBoundingClientRect();
			const qk = khoi?.getBoundingClientRect();
			return {
				soVung: vung.length,
				coNut: Boolean(nut),
				coChu: Boolean(nhanEl),
				rong: Math.round(qv.width),
				dong,
				cungHang:
					qn && qk ? qk.left >= qn.right - 1 && qk.top < qn.bottom : null,
				duoiNut: qn && qk ? qk.top >= qn.bottom - 1 : null,
				rongMoTa: moTa ? Math.round(moTa.getBoundingClientRect().width) : 0,
			};
		},
		goc,
		nhan,
		nutChu,
	);

const doTranNgan = (t) =>
	t.evaluate((sel) => {
		const k = [...document.querySelectorAll(sel)]
			.filter((e) => e.checkVisibility())
			.at(-1);
		if (!k) return { loi: "khong thay ngan" };
		const r = k.getBoundingClientRect();
		const cuon = (v) => v === "auto" || v === "scroll";
		const khungNgang = (p) => {
			const st = getComputedStyle(p);
			return (
				p.hasAttribute("data-tab-dinh") ||
				(cuon(st.overflowX) &&
					(!cuon(st.overflowY) || p.scrollHeight <= p.clientHeight + 1))
			);
		};
		const catChu = (p) => getComputedStyle(p).textOverflow === "ellipsis";
		const boQua = (e) => {
			for (let p = e.parentElement; p && p !== k; p = p.parentElement) {
				if (khungNgang(p) || catChu(p)) return true;
			}
			return false;
		};
		const ten = (e) =>
			`${e.tagName.toLowerCase()}${e.getAttribute("data-slot") ? `[${e.getAttribute("data-slot")}]` : ""} «${(e.textContent ?? "").trim().slice(0, 30)}»`;
		let dem = 0;
		const tran = [];
		for (const e of k.querySelectorAll("*")) {
			if (!e.checkVisibility()) continue;
			const q = e.getBoundingClientRect();
			if (q.width === 0 && q.height === 0) continue;
			if (boQua(e)) continue;
			dem += 1;
			if (q.right > r.right + 1 || q.left < r.left - 1) tran.push(ten(e));
			const st = getComputedStyle(e);
			if (
				cuon(st.overflowY) &&
				!khungNgang(e) &&
				e.scrollWidth > e.clientWidth + 1
			)
				tran.push(`cuon ngang ${ten(e)}`);
		}
		const boQuaTab = k.querySelector("[data-tab-dinh], [data-tab-cuon-ngang]")
			? 1
			: 0;
		return { dem, tran: tran.slice(0, 5), so: tran.length, boQuaTab };
	}, SEL_NGAN);

const cuonTrang = (t) =>
	t.evaluate(() => {
		const e = document.documentElement;
		return e.scrollWidth > e.clientWidth + 1
			? `${e.scrollWidth}>${e.clientWidth}`
			: null;
	});

let d = null;
try {
	await khoiApi();
	console.log(`API cua phien do khoi lai voi kho Blob gia ${khoGia.url}`);
	d = await moDo();
	const quanTri = await d.nguoiMoi(`${MA}qt`, "owner", "Lan Ctc");
	await d.batTrinhDuyet(quanTri.cookie);
	const c = quanTri.cookie;

	const khoaTruong = {};
	for (const entity of ["COMPANY", "CONTACT", "DEAL"]) {
		const f = await d.lam(c, "fields.create", {
			entity,
			label: `Hợp đồng ${MA}`,
			type: "FILE",
			agentFilled: false,
			showOnSheet: true,
		});
		khoaTruong[entity] = f.key;
	}
	const co = await d.lam(c, "companies.create", {
		name: `Công ty An Phú ${MA}`,
	});
	await d.lam(c, "companies.update", {
		id: co.id,
		data: {
			description:
				"Công ty An Phú phân phối vật liệu xây dựng cho các dự án nhà ở tại Hà Nội và các tỉnh phía Bắc. Công ty có mạng lưới kho tại Long Biên, Gia Lâm và Bắc Ninh. Đội ngũ kinh doanh làm việc trực tiếp với chủ đầu tư và nhà thầu.",
			linkedinUrl: `https://www.linkedin.com/company/an-phu-${MA}`,
		},
	});
	const trong = await d.lam(c, "companies.create", {
		name: `Công ty Trống ${MA}`,
	});
	const lh = await d.lam(c, "contacts.create", {
		firstName: `Lan ${MA}`,
		companyId: co.id,
	});
	const tt = await d.lam(c, "deals.create", {
		name: `Thoả thuận An Phú ${MA}`,
		companyId: co.id,
		ownerId: quanTri.id,
	});
	const byte = pdf();
	for (const [entity, id] of [
		["COMPANY", co.id],
		["CONTACT", lh.id],
		["DEAL", tt.id],
	]) {
		const o = {
			entity,
			recordId: id,
			fieldKey: khoaTruong[entity],
			tenTep: TEN_TEP,
		};
		const xin = await d.lam(c, "fieldFiles.requestUpload", {
			...o,
			kieu: "pdf",
			kichThuoc: byte.length,
		});
		const put = await fetch(xin.url, {
			method: "PUT",
			body: byte,
			headers: { "content-type": "application/pdf" },
		});
		if (!put.ok) throw new Error(`PUT kho gia tra ${put.status}`);
		await d.lam(c, "fieldFiles.complete", {
			...o,
			pathname: xin.pathname,
			phieu: xin.phieu,
		});
	}
	console.log(
		`gieo: 3 truong Tep, 2 cong ty, 1 lien he, 1 thoa thuan, 3 tep ten ${[...TEN_TEP].length} ky tu (${MA})`,
	);

	const moNgan = async (rong, duong) => {
		const t = await d.moTrang(c, rong, duong);
		await t.waitForSelector(
			'[data-slot="o-tep"], [role="tabpanel"][data-state="active"] section',
			{ visible: true, timeout: CHO_MS },
		);
		await t.waitForFunction(
			(sel) => {
				const k = [...document.querySelectorAll(sel)]
					.filter((e) => e.checkVisibility())
					.at(-1);
				if (!k) return false;
				const r = k.getBoundingClientRect();
				const truoc = window.__viTriNgan;
				window.__viTriNgan = `${Math.round(r.left)},${Math.round(r.top)}`;
				return truoc === window.__viTriNgan && r.right <= window.innerWidth + 1;
			},
			{ timeout: CHO_MS, polling: 200 },
			SEL_NGAN,
		);
		await ngu(800);
		return t;
	};
	const duongCty = (id) => `/companies?record=company:${id}`;
	const duongLh = `/contacts?record=contact:${lh.id}`;
	const duongTt = `/deals?record=deal:${tt.id}`;

	if (chay(1)) {
		await d.chayBuoc(1, async () => {
			const loi = [];
			for (const rong of [RONG, VUA]) {
				const t = await moNgan(rong, duongCty(co.id));
				const s = await doTab(t, CHU);
				if (s.loi) loi.push(`ctc-man: ${s.loi} ${rong}`);
				else {
					console.log(
						`  do buoc 1 (${rong}): noi dung tab ${Math.round(s.panel.width)}px, chi tiet ${Math.round(s.ct?.width ?? 0)}px, ${s.hang} hang thuoc tinh, ${s.hangHaiCot} hang hai cot`,
					);
					if (!s.gt) loi.push(`ctc-man: thieu gioi thieu ${rong}`);
					if (!s.ct) loi.push(`ctc-man: thieu chi tiet ${rong}`);
					if (s.gt && s.ct && s.gt.top >= s.ct.top)
						loi.push(`ctc-man: gioi thieu sau chi tiet ${rong}`);
					if (s.ct && s.ct.width < s.panel.width - 2)
						loi.push(
							`ctc-man: chi tiet hep ${rong} ${Math.round(s.ct.width)}/${Math.round(s.panel.width)}`,
						);
					if (s.hang === 0)
						loi.push(`ctc-man: chi tiet khong hang nao ${rong}`);
					else if (s.hangHaiCot < 2)
						loi.push(`ctc-man: chi tiet mot cot ${rong}`);
				}
				await chup(t, `ctc-cong-ty-${rong}.png`);
				await t.close();
			}
			for (const l of loi) console.log(`  ${l}`);
			d.dat(1, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(2)) {
		await d.chayBuoc(2, async () => {
			const loi = [];
			const t = await moNgan(RONG, duongCty(co.id));
			const o = await doOTep(t, CHU);
			if (o.loi) loi.push(`ctc-man: ${o.loi}`);
			else {
				console.log(
					`  do buoc 2: ${o.soOTep} o Tep rong ${Math.round(o.oTep?.width ?? 0)}px, ${o.soDong} dong tep, ${o.soNut} nut, ten ${[...(o.ten?.chu ?? "")].length} ky tu`,
				);
				if (o.soOTep !== 1) loi.push(`ctc-man: khong thay o tep (${o.soOTep})`);
				if (o.soDong !== 1)
					loi.push(`ctc-man: khong thay dong tep (${o.soDong})`);
				if (!o.ten) loi.push("ctc-man: khong thay ten tep");
				if (o.soNut !== 2) loi.push(`ctc-man: khong thay nut tep (${o.soNut})`);
				if (o.oTep && o.oTep.width < O_TEP_TOI_THIEU)
					loi.push(`ctc-man: o tep hep ${Math.round(o.oTep.width)}`);
				if (o.ten && (o.ten.cat || !o.ten.chu.includes(TEN_TEP)))
					loi.push("ctc-man: ten tep cat");
				if (o.nutCungHang.some((x) => !x))
					loi.push("ctc-man: nut tep rot dong");
			}
			const v = await doVung(t, SEL_NGAN, CHU.keoTha, CHU.chonTep);
			if (!v.soVung || !v.coNut || !v.coChu)
				loi.push(
					`ctc-man: khong thay vung keo tha (${v.soVung ?? 0} vung, nut ${v.coNut}, chu ${v.coChu})`,
				);
			else {
				console.log(
					`  do buoc 2: vung keo tha rong ${v.rong}px, cung hang ${v.cungHang}`,
				);
				if (!v.cungHang) loi.push(`ctc-man: keo tha tach hang 1440 ${v.rong}`);
			}
			await t.evaluate(() =>
				document
					.querySelector('[data-slot="o-tep"]')
					?.scrollIntoView({ block: "center" }),
			);
			await chup(t, "ctc-o-tep-1440.png");
			await t.close();
			for (const l of loi) console.log(`  ${l}`);
			d.dat(2, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(3)) {
		await d.chayBuoc(3, async () => {
			const loi = [];
			let soNgan = 0;
			for (const [ten, duong] of [
				["cong-ty", duongCty(co.id)],
				["lien-he", duongLh],
				["thoa-thuan", duongTt],
			]) {
				const t = await moNgan(HEP, duong);
				const v = await doVung(t, SEL_NGAN, CHU.keoTha, CHU.chonTep);
				if (!v.soVung || !v.coNut || !v.coChu)
					loi.push(`ctc-man: khong thay vung keo tha ${ten}`);
				else {
					soNgan += 1;
					console.log(
						`  do buoc 3 (${ten}): vung ${v.rong}px, chu ${v.dong} dong, duoi nut ${v.duoiNut}, mo ta ${v.rongMoTa}px`,
					);
					if (!v.duoiNut) loi.push(`ctc-man: keo tha chu canh nut ${ten}`);
					if (v.dong !== 1) loi.push(`ctc-man: keo tha bop chu ${ten}`);
					if (v.rongMoTa < 0.5 * v.rong)
						loi.push(
							`ctc-man: keo tha mo ta hep ${ten} ${v.rongMoTa}/${v.rong}`,
						);
				}
				await chup(t, `ctc-keo-tha-${ten}-375.png`);
				await t.close();
			}
			console.log(`  do buoc 3: ${soNgan} ngan da do`);
			if (soNgan < 3) loi.push(`ctc-man: keo tha thieu ngan ${soNgan}`);
			for (const l of loi) console.log(`  ${l}`);
			d.dat(3, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(4)) {
		await d.chayBuoc(4, async () => {
			const loi = [];
			const t = await moNgan(HEP, duongCty(co.id));
			const a = await cuonTrang(t);
			if (a) loi.push(`ctc-man: tran ngang trang ${a}`);
			const n = await doTranNgan(t);
			if (n.loi) loi.push(`ctc-man: tran ngang ${n.loi}`);
			else {
				console.log(
					`  do buoc 4: ${n.dem} phan tu trong ngan, tran ${n.so}, bo qua ${n.boQuaTab} hang the con trong khung cuon ngang [data-tab-dinh], [data-tab-cuon-ngang]`,
				);
				if (n.dem < PHAN_TU_NGAN_TOI_THIEU)
					loi.push(`ctc-man: tran ngang do qua it phan tu ${n.dem}`);
				for (const x of n.tran) loi.push(`ctc-man: tran ngang ngan ${x}`);
			}
			await t.close();
			for (const l of loi) console.log(`  ${l}`);
			d.dat(4, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(5)) {
		await d.chayBuoc(5, async () => {
			const loi = [];
			for (const [ten, duong] of [
				["lien-he", duongLh],
				["thoa-thuan", duongTt],
			]) {
				const t = await moNgan(RONG, duong);
				const o = await doOTep(t, CHU);
				const v = await doVung(t, SEL_NGAN, CHU.keoTha, CHU.chonTep);
				if (o.loi || o.soOTep !== 1)
					loi.push(`ctc-man: ${ten} khong thay o tep`);
				else {
					console.log(
						`  do buoc 5 (${ten}): o Tep ${Math.round(o.oTep.width)}px, ${o.hangHaiCot} hang hai cot, keo tha cung hang ${v.cungHang}`,
					);
					if (o.hangHaiCot < 2) loi.push(`ctc-man: ${ten} chi tiet mot cot`);
					if (o.oTep.width < O_TEP_TOI_THIEU)
						loi.push(`ctc-man: ${ten} o tep hep ${Math.round(o.oTep.width)}`);
				}
				if (!v.soVung || !v.coNut || !v.coChu)
					loi.push(`ctc-man: ${ten} khong thay vung keo tha`);
				else if (!v.cungHang) loi.push(`ctc-man: ${ten} keo tha tach hang`);
				await t.evaluate(() =>
					document
						.querySelector('[data-slot="o-tep"]')
						?.scrollIntoView({ block: "center" }),
				);
				await chup(t, `ctc-${ten}-1440.png`);
				await t.close();
			}
			for (const l of loi) console.log(`  ${l}`);
			d.dat(5, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(6)) {
		await d.chayBuoc(6, async () => {
			const loi = [];
			const t = await moNgan(RONG, duongCty(trong.id));
			const s = await doTab(t, CHU);
			if (s.loi) loi.push(`ctc-man: ${s.loi}`);
			else {
				console.log(
					`  do buoc 6 (trong): muc dau «${s.dau}», kara cho ${s.cho ? `${Math.round(s.cho.width)}px` : "vang"}, luoi chi tiet ${Math.round(s.luoi?.width ?? 0)}px, web ${s.web ? "co" : "vang"}`,
				);
				if (s.gt) loi.push("ctc-man: gioi thieu rong");
				if (s.dau !== CHU.chiTiet)
					loi.push(`ctc-man: muc dau khong phai chi tiet «${s.dau}»`);
				if (!s.cho) loi.push("ctc-man: thieu kara cho");
				else if (s.luoi) {
					if (s.cho.top < s.luoi.bottom - 1)
						loi.push("ctc-man: kara cho lech tren");
					if (s.cho.width < 0.9 * s.luoi.width)
						loi.push(
							`ctc-man: kara cho lech rong ${Math.round(s.cho.width)}/${Math.round(s.luoi.width)}`,
						);
				}
				if (s.web && s.cho && s.web.top <= s.cho.top)
					loi.push("ctc-man: hoat dong web truoc kara cho");
			}
			await chup(t, "ctc-cong-ty-trong-1440.png");
			await t.close();
			const t2 = await moNgan(RONG, duongCty(co.id));
			const s2 = await doTab(t2, CHU);
			if (s2.loi) loi.push(`ctc-man: ${s2.loi}`);
			else {
				console.log(
					`  do buoc 6 (co): lien ket ${s2.lk ? "co" : "vang"}, kara cho ${s2.cho ? "co" : "vang"}`,
				);
				if (!s2.lk) loi.push("ctc-man: thieu lien ket");
				if (!s2.cho) loi.push("ctc-man: thieu kara cho (co)");
				if (s2.lk && s2.cho && s2.lk.top <= s2.cho.top)
					loi.push("ctc-man: lien ket truoc kara cho");
			}
			await t2.close();
			for (const l of loi) console.log(`  ${l}`);
			d.dat(6, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(7)) {
		await d.chayBuoc(7, async () => {
			const loi = [];
			const t = await d.moTrang(c, RONG, "/tai-lieu");
			const nut = await t
				.waitForSelector("[data-tai-nguon]:not([disabled])", {
					timeout: CHO_MS,
				})
				.catch(() => null);
			if (!nut) {
				khongDo = "tai lieu khong mo duoc hop tai nguon (nut vang hay bi khoa)";
				await t.close();
				return;
			}
			await nut.click();
			await t.waitForSelector("[data-hop-tai-nguon]", {
				visible: true,
				timeout: CHO_MS,
			});
			await ngu(600);
			const v = await doVung(
				t,
				"[data-hop-tai-nguon]",
				CHU.tlKeoTha,
				CHU.tlChonTep,
			);
			if (!v.soVung || !v.coNut || !v.coChu)
				loi.push("ctc-man: tai-lieu khong thay vung keo tha");
			else {
				console.log(`  do buoc 7: vung ${v.rong}px, cung hang ${v.cungHang}`);
				if (!v.cungHang)
					loi.push(`ctc-man: tai-lieu keo tha tach hang ${v.rong}`);
			}
			await chup(t, "ctc-tai-lieu-1440.png");
			await t.close();
			for (const l of loi) console.log(`  ${l}`);
			d.dat(7, loi.length === 0, loi.join(" · "));
		});
	}

	await don();
	if (khongDo) {
		console.log(`KHONG DO DUOC: ${khongDo}`);
		await d.khongDoDuoc(khongDo);
	}
	await d.ket("do-bo-cuc");
} catch (e) {
	await don();
	if (d) await d.khongDoDuoc(e);
	console.log(`KHONG DO DUOC: ${String(e?.stack ?? e).slice(0, 600)}`);
	process.exit(2);
}

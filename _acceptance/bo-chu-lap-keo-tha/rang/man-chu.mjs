import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "bo-chu-lap-keo-tha";
const CHU_VUNG = [
	"Chọn tệp",
	"Kéo tệp vào đây",
	"Word (.docx) hoặc PDF, tới 20 MB",
];
const CAU_CU = "Kéo tệp vào đây, hoặc chọn tệp";
const VUNG = "[data-hop-tai-nguon] [data-slot='nguon-keo-tha']";
const NUT_TAI = "[data-tai-nguon]";

const CAY_DO = {
	nhan: "ban sao tai-lieu.ts giu cau goi y cu",
	tenCay: "bclkt-man-chu-chieu-do",
	chiBuoc: "1",
	tep: "apps/app/lib/messages/tai-lieu.ts",
	cam: (s) => s.replace(`keoTha: "${CHU_VUNG[1]}",`, `keoTha: "${CAU_CU}",`),
	dauVet: `keoTha: "${CAU_CU}",`,
	ghim: /chu vung keo tha man that lech/,
};

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");

if (process.argv.includes("--chieu-do")) await lib.chieuDo(TEP_NAY, CAY_DO);

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		'KHONG DO DUOC: chay qua phien do — BLOB_READ_WRITE_TOKEN=<khoa gia> bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/bo-chu-lap-keo-tha/rang/man-chu.mjs"',
	);
	process.exit(2);
}

const d = await lib.moDo();

async function moHop(t) {
	await d.doi(t, (s) => document.querySelector(s) !== null, NUT_TAI);
	await d
		.doi(t, (s) => !document.querySelector(s)?.disabled, NUT_TAI)
		.catch(() => null);
	const khoa = await t.evaluate(
		(s) => document.querySelector(s)?.disabled,
		NUT_TAI,
	);
	if (khoa)
		throw new Error(
			"nut tai nguon khoa — phien do thieu BLOB_READ_WRITE_TOKEN",
		);
	await d.bamSel(t, `${NUT_TAI}:not([disabled])`);
	await d.doi(t, (s) => document.querySelector(s) !== null, VUNG);
	await lib.cho(400);
}

const docVung = (t) =>
	t.evaluate((vungSel) => {
		const hop = document.querySelector("[data-hop-tai-nguon]");
		const vung = document.querySelector(vungSel);
		const nut = vung?.querySelector("button");
		const cot = nut?.nextElementSibling;
		return {
			chu:
				nut && cot
					? [
							nut.innerText.trim(),
							...[...cot.children].map((e) => e.innerText.trim()),
						]
					: [],
			tranHop: hop
				? hop.scrollWidth > hop.clientWidth + 1 ||
					hop.getBoundingClientRect().right > window.innerWidth + 1
				: false,
		};
	}, VUNG);

function soChu(chu) {
	const dung =
		chu.length === CHU_VUNG.length && chu.every((c, i) => c === CHU_VUNG[i]);
	return dung ? [] : [`chu vung keo tha man that lech: ${JSON.stringify(chu)}`];
}

try {
	const nguoi = await d.nguoiMoi("b", "member", "Lê Thu Trang");
	await d.batTrinhDuyet(nguoi.cookie);

	const trang = await d.moTrang(nguoi.cookie, lib.RONG, "/tai-lieu");
	await moHop(trang);

	if (lib.chay(1))
		await d.chayBuoc(1, async () => {
			const vung = await docVung(trang);
			await d.chup(trang, "bclkt-tai-1440.png");
			const loi = soChu(vung.chu);
			d.dat(1, loi.length === 0, loi.join(" · "));
		});
	await trang.close();

	if (lib.chay(2))
		await d.chayBuoc(2, async () => {
			const t = await d.moTrang(nguoi.cookie, lib.HEP, "/tai-lieu");
			await moHop(t);
			const vung = await docVung(t);
			const loi = soChu(vung.chu);
			if (vung.tranHop) loi.push("hop tai 390 tran ngang");
			const tran = await d.cuonNgang(t);
			if (tran.length > 0) loi.push(`390 cuon ngang: ${tran.join(", ")}`);
			await d.chup(t, "bclkt-tai-390.png");
			await t.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	await d.ket("man-chu");
} catch (e) {
	await d.khongDoDuoc(e);
}

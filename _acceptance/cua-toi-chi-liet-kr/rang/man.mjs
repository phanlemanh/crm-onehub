#!/usr/bin/env bun
/**
 * E14 (AC-2, ui-check) — Của tôi liệt KR, bấm một KR sang bộ của nó, cập nhật bằng hộp một KR,
 * và đường /okr/kr/<id> của một KR không có về Của tôi. Đo trên trình duyệt thật (hồ sơ cua-toi-chi-liet-kr).
 *
 *   bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/cua-toi-chi-liet-kr/rang/man.mjs"
 *
 * Phiên đo riêng (kho _do + API + app của CÂY ĐANG XÉT, dựng bởi tien-de.mjs), nạp bộ OKR mẫu,
 * chọn người phụ trách nhiều KR nhất ở ít nhất hai đơn vị của Quý 4, bỏ số tuần này của các KR đó
 * trên kho đo. Nhánh «không thấy» đo bằng một mã KR không có (nhánh không có quyền xem và KR chu
 * kỳ đã ẩn đo ở E5 trên kho thật — bộ mẫu không dựng được KR mà người đo không xem được). Chụp vào evidence/.
 * Mã thoát: 0 đạt · 1 có dòng SAI · 2 không đo được.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "cua-toi-chi-liet-kr";
const daThongCong = ["signed-off", "machine-cleared"].includes(
	/^status:\s*(\S+)/m.exec(
		readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8"),
	)?.[1] ?? "",
);
process.env.BANG_CHUNG ??= daThongCong
	? join(GOC, ".acceptance-runs", HO_SO, "evidence")
	: join(GOC, "_acceptance", HO_SO, "evidence");
const BANG_CHUNG = process.env.BANG_CHUNG;
const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

const { chiaCookie } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs"
);
const idMau = (loai, ma) => `mau-okr-${loai}-${ma}`;
const d = await lib.moDo();
const sai = [];
const dong = (dung, cau) => {
	console.log(dung ? cau : `SAI ${cau}`);
	if (!dung) sai.push(cau);
	return dung;
};
const choMs = (ms) => new Promise((r) => setTimeout(r, ms));

const phienCua = (email) =>
	chiaCookie(
		execFileSync("bun", ["run", "dev:session", email], {
			cwd: join(GOC, "apps", "api"),
			encoding: "utf8",
		})
			.trim()
			.split("\n")
			.pop()
			.trim(),
	);

async function napBoMau() {
	if ((await d.db.okrCycle.count()) > 0) return;
	const nap = spawnSync("bun", ["scripts/okr-mau.ts"], {
		cwd: join(GOC, "apps", "api"),
		env: process.env,
		encoding: "utf8",
	});
	if (nap.status !== 0) {
		console.log(
			`KHONG DO DUOC: nap bo OKR mau thoat ${nap.status}: ${`${nap.stdout}${nap.stderr}`.trim().split("\n").at(-1)}`,
		);
		process.exit(2);
	}
}

function dauTuanVN(now = new Date()) {
	const vn = new Date(now.getTime() + 7 * 3600_000);
	const ngay = new Date(
		Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()),
	);
	ngay.setUTCDate(ngay.getUTCDate() - ((ngay.getUTCDay() + 6) % 7));
	return ngay;
}

const khoaDon = (o) =>
	o.level === "onehub"
		? "goc"
		: o.level === "bo-phan"
			? `bp:${o.divisionId}`
			: o.level === "phong-ban"
				? `pb:${o.departmentId}`
				: `nguoi:${o.personUserId}`;

async function chonNguoi(ky) {
	const krs = await d.db.okrKeyResult.findMany({
		where: { objective: { cycleId: ky, status: "cong-bo" } },
		select: {
			id: true,
			title: true,
			ownerUserId: true,
			objective: {
				select: {
					level: true,
					divisionId: true,
					departmentId: true,
					personUserId: true,
				},
			},
		},
	});
	const theoNguoi = new Map();
	for (const k of krs) {
		const ds = theoNguoi.get(k.ownerUserId) ?? [];
		ds.push(k);
		theoNguoi.set(k.ownerUserId, ds);
	}
	const ungVien = [...theoNguoi.entries()]
		.filter(([, ds]) => new Set(ds.map((k) => khoaDon(k.objective))).size >= 2)
		.sort((a, b) => b[1].length - a[1].length);
	return { ungVien: ungVien[0] ?? null, theoNguoi };
}

async function themKrDonViHai(ky, theoNguoi) {
	const [nguoiId, ds] = [...theoNguoi.entries()].sort(
		(a, b) => b[1].length - a[1].length,
	)[0];
	const daCo = new Set(ds.map((k) => khoaDon(k.objective)));
	const mucTieu = await d.db.okrObjective.findMany({
		where: { cycleId: ky, status: "cong-bo" },
		select: {
			id: true,
			level: true,
			divisionId: true,
			departmentId: true,
			personUserId: true,
			owner: { select: { email: true } },
		},
	});
	const khac = mucTieu.find(
		(o) => o.level !== "ca-nhan" && !daCo.has(khoaDon(o)),
	);
	if (!khac) return false;
	await d.lam(phienCua(khac.owner.email), "okr.createKeyResult", {
		objectiveId: khac.id,
		title: "E14 · KR ở đơn vị thứ hai",
		kind: "tang-toi",
		ownerUserId: nguoiId,
		startValue: 0,
		targetValue: 10,
		currentValue: 2,
		unit: "khách",
		dueOn: null,
		weight: 1,
	});
	console.log(
		`chuan bi: them mot KR o ${khoaDon(khac)} cho nguoi phu trach nhieu KR nhat (qua okr.createKeyResult)`,
	);
	return true;
}

async function soDong(t) {
	return t.evaluate(() => {
		const p = document.querySelector('[data-phan="can-cap-nhat"]');
		const dong = [...(p?.querySelectorAll("[data-kr]") ?? [])];
		return {
			soDong: dong.length,
			href: dong.map((x) => x.getAttribute("href") ?? ""),
			ten: dong.map(
				(x) => x.querySelector("[data-slot=item-title]")?.textContent ?? "",
			),
			bangLoat: document.querySelectorAll(
				'[data-nut="cap-nhat-tai-cho"], [data-nut="sua-lan-gui"], [data-trang-thai^="ST-capnhat-"]',
			).length,
			o:
				p?.querySelectorAll('input, textarea, [role="spinbutton"]').length ?? 0,
			tran: document.documentElement.scrollWidth - window.innerWidth,
			catTen: dong.some((x) => {
				const t = x.querySelector("[data-slot=item-title]");
				return t ? t.scrollWidth > t.clientWidth + 1 : false;
			}),
		};
	});
}

try {
	await napBoMau();
	const KY = idMau("chu-ky", "quy4");
	let { ungVien: chon, theoNguoi } = await chonNguoi(KY);
	if (!chon && (await themKrDonViHai(KY, theoNguoi)))
		chon = (await chonNguoi(KY)).ungVien;
	if (!chon) {
		console.log(
			"KHONG DO DUOC: bo mau khong co ai phu trach KR o hai don vi cua Quy 4",
		);
		process.exit(2);
	}
	const [nguoiId, krCua] = chon;
	const nguoi = await d.db.user.findUniqueOrThrow({
		where: { id: nguoiId },
		select: { email: true },
	});
	const xoa = await d.db.okrCheckIn.deleteMany({
		where: {
			keyResultId: { in: krCua.map((k) => k.id) },
			weekStart: { gte: dauTuanVN() },
		},
	});
	console.log(
		`chuan bi: ${nguoi.email} phu trach ${krCua.length} KR o ${new Set(krCua.map((k) => khoaDon(k.objective))).size} don vi · bo ${xoa.count} lan cap nhat tuan nay`,
	);
	const P = phienCua(nguoi.email);
	await d.batTrinhDuyet(P);

	for (const kho of [1280, 375]) {
		console.log(`== kho ${kho}`);
		const t = await d.moTrang(P, kho, "/okr");
		await d.doi(
			t,
			() =>
				document.querySelector('[data-phan="can-cap-nhat"] [data-kr]') !== null,
		);
		await choMs(500);
		const x = await soDong(t);
		dong(
			x.soDong === krCua.length && x.bangLoat === 0 && x.o === 0 && x.tran <= 0,
			`(a) ${kho}: phan Can cap nhat co ${x.soDong}/${krCua.length} dong · nut hang loat ${x.bangLoat} · o nhap ${x.o} · tran ngang ${x.tran}px · ten bi cat ${x.catTen ? "co" : "khong"}`,
		);
		await t.screenshot({
			path: join(BANG_CHUNG, `E14-cua-toi-${kho}.png`),
			fullPage: true,
		});

		const thu = x.href[1] ?? x.href[0];
		const krId = new URL(thu, "http://x").searchParams
			.get("record")
			?.replace(/^kr:/, "");
		const kr = krCua.find((k) => k.id === krId);
		await d.bamSel(t, `[data-phan="can-cap-nhat"] [data-kr="${krId}"]`);
		await d.choDuong(t, "/okr/bo-okr");
		await d.doi(
			t,
			() =>
				document.querySelector('[data-trang-thai="ST-ngan-kr-mo"]') !== null,
		);
		const den = await t.evaluate(() => {
			const u = new URL(window.location.href);
			const ngan = document.querySelector('[data-trang-thai="ST-ngan-kr-mo"]');
			const nut = document.querySelector('[data-nut="cap-nhat-ngan-kr"]');
			const r = nut?.getBoundingClientRect();
			return {
				path: u.pathname,
				donOkr: u.searchParams.get("donOkr"),
				kyOkr: u.searchParams.get("kyOkr"),
				record: u.searchParams.get("record"),
				chuNgan: ngan?.textContent ?? "",
				nutTrongKhung:
					r !== undefined && r.top >= 0 && r.bottom <= window.innerHeight,
			};
		});
		dong(
			den.path.endsWith("/okr/bo-okr") &&
				den.donOkr === (kr ? khoaDon(kr.objective) : "") &&
				den.kyOkr === KY &&
				den.record?.split(",").at(-1) === `kr:${krId}` &&
				(kr ? den.chuNgan.includes(kr.title) : false) &&
				den.nutTrongKhung,
			`(b) ${kho}: ${den.path} donOkr=${den.donOkr} kyOkr=${den.kyOkr} record=${den.record} · ngan mang ten KR ${kr && den.chuNgan.includes(kr.title) ? "co" : "khong"} · nut Cap nhat trong khung nhin ${den.nutTrongKhung ? "co" : "khong"}`,
		);
		await t.screenshot({ path: join(BANG_CHUNG, `E14-mo-kr-${kho}.png`) });

		await d.bamSel(t, '[data-nut="cap-nhat-ngan-kr"]');
		await d.doi(
			t,
			() =>
				document.querySelector(
					'[role="dialog"] [data-slot=dialog-title], [role="dialog"] h2',
				) !== null,
		);
		await choMs(500);
		const hop = await t.evaluate(
			() =>
				[...document.querySelectorAll('[role="dialog"]')].at(-1)?.textContent ??
				"",
		);
		dong(
			kr ? hop.includes(kr.title) : false,
			`(c) ${kho}: hop cap nhat mot KR mo voi ten KR ${kr && hop.includes(kr.title) ? "co" : "khong"}`,
		);
		await t.screenshot({ path: join(BANG_CHUNG, `E14-hop-${kho}.png`) });
		await t.close();
	}

	const krCu = { id: `e14-khong-co-${Date.now().toString(36)}`, title: "" };
	const vi = await d.hoi(P, "okr.viTriKr", { keyResultId: krCu.id });
	if (vi !== null) {
		console.log("KHONG DO DUOC: okr.viTriKr tra vi tri cho ma KR khong co");
		process.exit(2);
	}
	for (const kho of [1280, 375]) {
		const t = await d.moTrang(P, kho, `/okr/kr/${krCu.id}`);
		await d.doi(
			t,
			() =>
				document.querySelector('[data-trang-thai="ST-ngan-kr-khong-thay"]') !==
				null,
		);
		const ve = await t.evaluate(() => ({
			path: new URL(window.location.href).pathname,
			chu: document.body.innerText,
		}));
		dong(
			/\/okr$/.test(ve.path),
			`(d) ${kho}: ma KR khong co ve ${ve.path} · ngan bao khong thay`,
		);
		await t.screenshot({
			path: join(BANG_CHUNG, `E14-khong-thay-${kho}.png`),
		});
		await t.close();
	}
} catch (e) {
	await d.khongDoDuoc(e);
}

console.log(
	sai.length === 0 ? "KET LUAN: dat" : `KET LUAN: ${sai.length} dong SAI`,
);
process.exit(sai.length === 0 ? 0 : 1);

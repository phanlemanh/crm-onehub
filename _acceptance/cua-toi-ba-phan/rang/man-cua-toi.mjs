#!/usr/bin/env bun
/**
 * Đo Của tôi ba phần trên trình duyệt thật (hồ sơ cua-toi-ba-phan).
 *
 *   bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/cua-toi-ba-phan/rang/man-cua-toi.mjs"
 *   EVAL=E15|E16|E18 (vắng = chạy cả ba) · --chieu-do <phan-mot-cuoi|dem-tron|giu-tu>
 *
 * Phiên đo riêng (kho _do + API + app của CÂY ĐANG XÉT, dựng bởi tien-de.mjs), nạp bộ OKR
 * mẫu, đăng nhập người mẫu qua dev:session, chụp vào evidence/. Chuẩn bị dữ liệu đo trên
 * cơ sở dữ liệu của phiên đo (bỏ số tuần này của KR trưởng bộ phận để phần 1 có KR thiếu).
 * Mã thoát: 0 đạt · 1 có dòng SAI · 2 không đo được.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "cua-toi-ba-phan";
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

const OKR = "apps/app/app/(app)/[slug]/okr";
const CHIEU_DO = {
	"phan-mot-cuoi": {
		nhan: "ban sao dua phan 1 xuong cuoi than Cua toi",
		tenCay: "ctbp-chieu-do-thu-tu",
		chiBuoc: "E15",
		tep: `${OKR}/cua-toi.tsx`,
		cam: (s) =>
			s
				.replace("			<PhanCanCapNhat />\n", "")
				.replace(
					"			<TheoKy />\n",
					"			<TheoKy />\n			<PhanCanCapNhat />\n",
				),
		dauVet: "			<TheoKy />\n			<PhanCanCapNhat />",
		ghim: /SAI AC-13: truong 1440 — thu tu don-vi-dan, kr-phu-trach, can-cap-nhat/,
	},
	"dem-tron": {
		nhan: "ban sao dem KR theo muc tieu thay vi theo KR",
		tenCay: "ctbp-chieu-do-dem",
		chiBuoc: "E16",
		tep: `${OKR}/phan-don-vi-dan.tsx`,
		cam: (s) => s.replace("soKr: kr.length,", "soKr: ds.length,"),
		dauVet: "soKr: ds.length,",
		ghim: /SAI AC-5: so KR \d+ \/ \d+/,
	},
	"giu-tu": {
		nhan: "ban sao khong go tu khoi duong dan sau khi mo bang",
		tenCay: "ctbp-chieu-do-tu",
		chiBuoc: "E18",
		tep: `${OKR}/phan-can-cap-nhat.tsx`,
		cam: (s) => s.replace("				if (tu !== null) void datTu(null);\n", ""),
		dauVet: "				setPhien(kq.sessionId);\n			},",
		ghim: /SAI AC-3: tai lai sau nhac \+1, mong \+0/,
	},
};

const iDo = process.argv.indexOf("--chieu-do");
if (iDo >= 0) {
	const ten = process.argv[iDo + 1];
	const cay = CHIEU_DO[ten];
	if (!cay) {
		console.log(
			`KHONG DO DUOC: chieu do «${ten ?? ""}» khong co — ${Object.keys(CHIEU_DO).join(", ")}`,
		);
		process.exit(2);
	}
	await lib.chieuDo(TEP_NAY, cay);
}

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man-cua-toi.mjs"`,
	);
	process.exit(2);
}

const CHON = new Set(
	`${process.env.EVAL ?? ""},${process.env.CHI_BUOC ?? ""}`
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);
const chay = (e) => CHON.size === 0 || CHON.has(e);

const { chiaCookie } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs"
);
const MAU = JSON.parse(
	readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
);
const MIEN = "mau.onehub.test";
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

/** Thứ Hai tuần này theo giờ Việt Nam, dạng Date nửa đêm UTC (khuôn weekStart). */
function dauTuanVN(now = new Date()) {
	const vn = new Date(now.getTime() + 7 * 3600_000);
	const ngay = new Date(
		Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()),
	);
	ngay.setUTCDate(ngay.getUTCDate() - ((ngay.getUTCDay() + 6) % 7));
	return ngay;
}

/** Thứ tự phần, đáy nút cập nhật, tràn ngang, lời mời tạo trong thân trang. */
async function doBoCuc(t) {
	return t.evaluate(() => {
		const phan = [...document.querySelectorAll("main [data-phan]")];
		const theoDom = phan.map((p) => p.getAttribute("data-phan"));
		const theoToaDo = [...phan]
			.sort(
				(a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
			)
			.map((p) => p.getAttribute("data-phan"));
		const nut = document
			.querySelector("[data-nut=cap-nhat-tai-cho]")
			?.getBoundingClientRect();
		const p1 = document
			.querySelector('[data-phan="can-cap-nhat"]')
			?.getBoundingClientRect();
		const dau = document.querySelector("[data-slot=page-shell-header]");
		const moiTao = [...document.querySelectorAll("main a, main button")]
			.filter((n) => !dau?.contains(n))
			.filter(
				(n) =>
					/tạo|thêm mục tiêu|OKR cá nhân/i.test(n.textContent ?? "") ||
					n.matches('[data-nut^="tao"],[data-nut="them-muc-tieu"]'),
			)
			.map((n) => n.textContent?.trim());
		return {
			theoDom,
			theoToaDo,
			dayNut: nut ? Math.round(nut.bottom) : null,
			dayPhan1: p1 ? Math.round(p1.bottom) : null,
			cao: window.innerHeight,
			tran: document.documentElement.scrollWidth - window.innerWidth,
			moiTao,
		};
	});
}

try {
	await napBoMau();
	const KY = idMau("chu-ky", "quy4");
	const BP = MAU.boPhan.find((b) => b.ma === "kinh-doanh");
	const truongBo = new Set(MAU.boPhan.map((b) => b.truong));
	const truongPhong = new Set(MAU.phongBan.map((p) => p.truong));
	const thanhVien = MAU.nguoi.find(
		(n) =>
			n.ma === "vo-duc-anh" && !truongBo.has(n.ma) && !truongPhong.has(n.ma),
	);
	if (!BP || !thanhVien) {
		console.log(
			"KHONG DO DUOC: bo mau thieu bo phan kinh-doanh hoac thanh vien vo-duc-anh",
		);
		process.exit(2);
	}
	const nguoiTruong = await d.db.user.findUniqueOrThrow({
		where: { email: `${BP.truong}@${MIEN}` },
		select: { id: true },
	});
	const tuan = dauTuanVN();
	const xoa = await d.db.okrCheckIn.deleteMany({
		where: {
			keyResult: { ownerUserId: nguoiTruong.id },
			weekStart: { gte: tuan },
		},
	});
	console.log(
		`chuan bi: bo ${xoa.count} lan cap nhat tuan nay cua truong ${BP.truong}`,
	);
	const TR = phienCua(`${BP.truong}@${MIEN}`);
	const TV = phienCua(`${thanhVien.ma}@${MIEN}`);
	await d.batTrinhDuyet(TR);

	if (chay("E15")) {
		console.log("== E15 (AC-13): thu tu ba phan, nut cap nhat, 1440/390");
		let soDung = 0;
		for (const [vai, phien, moBang] of [
			["truong", TR, false],
			["truong-dang-cap-nhat", TR, true],
			["thanh-vien", TV, false],
		])
			for (const kho of [1440, 390]) {
				const t = await d.moTrang(phien, kho, `/okr?kyOkr=${KY}`);
				await d.doi(
					t,
					() =>
						document.querySelector('[data-phan="kr-phu-trach"]') !== null &&
						document.querySelector(
							'[data-phan="can-cap-nhat"] [data-khung-xuong]',
						) === null,
				);
				if (moBang) {
					await d.bamSel(t, "[data-nut=cap-nhat-tai-cho]");
					await d.doi(
						t,
						() =>
							document.querySelector(
								'[data-phan="can-cap-nhat"] [data-nut=gui]',
							) !== null,
					);
				}
				await choMs(500);
				const x = await doBoCuc(t);
				const mong =
					vai === "thanh-vien"
						? ["can-cap-nhat", "kr-phu-trach"]
						: ["can-cap-nhat", "don-vi-dan", "kr-phu-trach"];
				const dungThuTu =
					x.theoDom.join(",") === mong.join(",") &&
					x.theoToaDo.join(",") === mong.join(",");
				const trongKhung = x.dayNut !== null && x.dayNut <= x.cao;
				let dung = dungThuTu && x.tran <= 0;
				if (vai === "truong" && kho === 1440) dung = dung && trongKhung;
				if (vai === "thanh-vien") dung = dung && x.moiTao.length === 0;
				const ten = `${vai} ${kho}`;
				dong(
					dung,
					dung
						? `O ${ten}: thu tu phan ${x.theoToaDo.join(", ")} · day phan 1 ${x.dayPhan1}px · nut cap nhat trong khung nhin ${trongKhung ? "co" : "khong"} · tran ngang ${x.tran}px`
						: `AC-13: ${ten} — thu tu ${x.theoToaDo.join(", ")} · nut ${x.dayNut ?? "vang"}/${x.cao}px · tran ${x.tran}px${x.moiTao.length ? ` · moi tao «${x.moiTao[0]}»` : ""}`,
				);
				if (dung) soDung += 1;
				await t.screenshot({
					path: join(BANG_CHUNG, `cua-toi-${vai}-${kho}.png`),
					fullPage: true,
				});
				await t.close();
			}
		dong(
			soDung === 6,
			`${soDung === 6 ? "DUNG" : ""} AC-13: ${soDung}/6 o`.trim(),
		);
	}

	if (chay("E16")) {
		console.log("== E16 (AC-5): so cua the don vi khop trang Theo don vi");
		const khoa = `bp:${idMau("bp", BP.ma)}`;
		const t = await d.moTrang(TR, 1440, `/okr?kyOkr=${KY}`);
		await d.doi(
			t,
			(k) =>
				document.querySelector(`[data-don-vi-dan="${k}"] [data-so-kr]`) !==
					null ||
				document
					.querySelector(`[data-don-vi-dan="${k}"]`)
					?.textContent?.includes("Chưa có mục tiêu") === true,
			khoa,
		);
		const cuaToi = await t.evaluate((k) => {
			const the = document.querySelector(`[data-don-vi-dan="${k}"]`);
			const so = the?.querySelector("[data-so-kr]");
			const doc = (ten) =>
				Number(
					the
						?.querySelector(`[data-so-${ten}]`)
						?.getAttribute(`data-so-${ten}`) ?? 0,
				);
			return {
				mucTieu: Number(so?.getAttribute("data-so-muc-tieu") ?? 0),
				kr: Number(so?.getAttribute("data-so-kr") ?? 0),
				tienDo: Number(so?.getAttribute("data-so-tien-do") ?? 0),
				dungNhip: doc("dung-nhip"),
				chamNhip: doc("cham-nhip"),
				truot: doc("truot"),
				href:
					the?.querySelector("[data-nut=mo-don-vi]")?.getAttribute("href") ??
					"",
			};
		}, khoa);
		await t.close();
		const tDv = await d.moTrang(
			TR,
			1440,
			`/okr/theo-don-vi?${new URLSearchParams({ donOkr: khoa, kyOkr: KY })}`,
		);
		await d.doi(
			tDv,
			() => document.querySelector("[data-hang-muc-tieu]") !== null,
		);
		await choMs(800);
		const theoDonVi = await tDv.evaluate(() => {
			const hang = [...document.querySelectorAll("[data-hang-muc-tieu]")];
			const kr = [...document.querySelectorAll("[data-kr]")];
			const nhip = kr.map(
				(r) =>
					r
						.querySelector("[data-tinh-trang]")
						?.getAttribute("data-tinh-trang") ?? "",
			);
			const tien = kr
				.map((r) =>
					Number(
						r
							.querySelector("[role=progressbar]")
							?.getAttribute("aria-valuenow"),
					),
				)
				.filter((n) => Number.isFinite(n));
			return {
				mucTieu: new Set(hang.map((h) => h.getAttribute("data-hang-muc-tieu")))
					.size,
				kr: kr.length,
				tienDo: tien.length
					? Math.round(tien.reduce((a, b) => a + b, 0) / tien.length)
					: 0,
				dungNhip: nhip.filter((n) => n === "dung-nhip").length,
				chamNhip: nhip.filter((n) => n === "cham-nhip").length,
				truot: nhip.filter((n) => n === "truot").length,
			};
		});
		await tDv.close();
		const sau = (o) =>
			[o.mucTieu, o.kr, o.tienDo, o.dungNhip, o.chamNhip, o.truot].join(" ");
		console.log(
			`SO ${khoa}: Cua toi ${sau(cuaToi)} · Theo don vi ${sau(theoDonVi)}`,
		);
		dong(
			cuaToi.kr === theoDonVi.kr,
			`${cuaToi.kr === theoDonVi.kr ? "" : "AC-5: "}so KR ${cuaToi.kr} / ${theoDonVi.kr}`.trim(),
		);
		const khop =
			cuaToi.mucTieu === theoDonVi.mucTieu &&
			Math.abs(cuaToi.tienDo - theoDonVi.tienDo) <= 1 &&
			cuaToi.dungNhip === theoDonVi.dungNhip &&
			cuaToi.chamNhip === theoDonVi.chamNhip &&
			cuaToi.truot === theoDonVi.truot;
		dong(khop, `${khop ? "" : "AC-5: "}nam so con lai khop`.trim());
		const hrefDung = cuaToi.href.endsWith(
			`/okr/theo-don-vi?${new URLSearchParams({ donOkr: khoa, kyOkr: KY })}`,
		);
		dong(
			hrefDung,
			`${hrefDung ? "" : "AC-5: "}nut mo don vi ${cuaToi.href}`.trim(),
		);
		if (cuaToi.kr === theoDonVi.kr && khop && hrefDung)
			console.log("DUNG AC-5 may chu");
	}

	if (chay("E18")) {
		console.log("== E18 (AC-3): loi vao tu duong dan ghi dung phien may chu");
		const demPhien = () =>
			d.db.okrCheckInSession.findMany({
				where: { userId: nguoiTruong.id },
				orderBy: { openedAt: "asc" },
				select: { id: true, entry: true, submittedAt: true },
			});
		const moVaDem = async (duong, choBang) => {
			const truoc = (await demPhien()).length;
			const t = await d.moTrang(TR, 1440, duong);
			await d.doi(
				t,
				() => document.querySelector('[data-phan="can-cap-nhat"]') !== null,
			);
			if (choBang)
				await d.doi(
					t,
					() =>
						document.querySelector(
							'[data-phan="can-cap-nhat"] [data-nut=gui]',
						) !== null,
				);
			await choMs(1500);
			const ds = await demPhien();
			const url = await t.evaluate(
				() => window.location.pathname + window.location.search,
			);
			return { t, them: ds.length - truoc, moi: ds.slice(truoc), url };
		};
		let so = 0;
		const o1 = await moVaDem(`/okr?tu=nhac&kyOkr=${KY}`, true);
		const dung1 =
			o1.them === 1 && o1.moi[0]?.entry === "nhac" && !o1.url.includes("tu=");
		so += dong(
			dung1,
			`${dung1 ? "" : "AC-3: "}o nhac: +${o1.them} ${o1.moi.map((p) => p.entry).join(",")} · ${o1.url}`.trim(),
		)
			? 1
			: 0;
		const lai = await (async () => {
			const truoc = (await demPhien()).length;
			await o1.t.reload();
			await d.doi(
				o1.t,
				() => document.querySelector('[data-phan="can-cap-nhat"]') !== null,
			);
			await choMs(1500);
			return (await demPhien()).length - truoc;
		})();
		so += dong(
			lai === 0,
			`${lai === 0 ? "" : "AC-3: "}tai lai sau nhac +${lai}, mong +0`.trim(),
		)
			? 1
			: 0;
		await o1.t.close();
		const o2 = await moVaDem(`/okr?tu=viec-cua-toi&kyOkr=${KY}`, true);
		const dung2 = o2.them === 1 && o2.moi[0]?.entry === "viec-cua-toi";
		so += dong(
			dung2,
			`${dung2 ? "" : "AC-3: "}o viec-cua-toi: +${o2.them}`.trim(),
		)
			? 1
			: 0;
		await o2.t.close();
		const o3 = await moVaDem(`/okr?tu=la&kyOkr=${KY}`, false);
		so += dong(
			o3.them === 0,
			`${o3.them === 0 ? "" : "AC-3: "}o tu la: +${o3.them}`.trim(),
		)
			? 1
			: 0;
		await o3.t.close();
		const o4 = await moVaDem(`/okr/cap-nhat-tuan?tu=nhac&kyOkr=${KY}`, true);
		const dung4 =
			o4.them === 1 &&
			o4.moi[0]?.entry === "nhac" &&
			o4.url.endsWith(`/okr?kyOkr=${encodeURIComponent(KY)}`);
		so += dong(
			dung4,
			`${dung4 ? "" : "AC-3: "}o duong cu: +${o4.them} · ${o4.url}`.trim(),
		)
			? 1
			: 0;
		const tuTin = await o4.t.evaluate(() => {
			const nut = document.querySelector(
				'[data-phan="can-cap-nhat"] [data-kr] [data-o="tu-tin"] button',
			);
			nut?.click();
			return nut !== null;
		});
		if (tuTin) {
			await d.bamSel(o4.t, '[data-phan="can-cap-nhat"] [data-nut=gui]');
			await choMs(2000);
		}
		const phienCuoi = (await demPhien()).at(-1);
		dong(
			phienCuoi?.submittedAt != null,
			`${phienCuoi?.submittedAt != null ? "" : "AC-3: "}gui 1 KR o duong cu: phien co submittedAt`.trim(),
		);
		await o4.t.close();
		if (so === 5) console.log("DUNG AC-3 may chu: 5/5 o");
	}
} catch (e) {
	await d.khongDoDuoc(e);
}

console.log(
	sai.length === 0 ? "KET LUAN: dat" : `KET LUAN: ${sai.length} dong SAI`,
);
process.exit(sai.length === 0 ? 0 : 1);

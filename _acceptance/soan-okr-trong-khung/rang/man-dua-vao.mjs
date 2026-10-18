import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import {
	demCsdl,
	demManNen,
	duaVaoTatCa,
	xacNhanDuaVao,
} from "./dua-vao-chung.mjs";
import { DEM } from "./kich-ban.mjs";
import {
	APP,
	anh,
	choMoHinh,
	choThay,
	choYen,
	chungTrang,
	dongBangNut,
	dungYen,
	duongDonVi,
	ghi,
	KHUNG,
	KY,
	khongDo,
	MAN,
	m,
	nop1,
	PHONG,
	saiThem,
	sql,
	the,
	trang,
	vao,
} from "./man-chung.mjs";

const CHO_LAM_MOI_MS = 15000;

async function docNen(p) {
	await choThay(
		p,
		() => {
			const mo =
				document.querySelector("[data-dong-don-vi]")
					?.innerText ?? "";
			return /\d+ mục tiêu/.test(mo);
		},
		"Theo don vi tai xong",
		MAN.cho.manMs,
	);
	return p.evaluate((tiep) => {
		const mo =
			document.querySelector("[data-dong-don-vi]")
				?.innerText ?? "";
		const nhom = document.querySelector("[data-nhom-soan]");
		return {
			moTa: Number(/(\d+) mục tiêu/.exec(mo)?.[1] ?? Number.NaN),
			nut: nhom?.innerText.trim() ?? "",
			coTiep: !!nhom && nhom.innerText.includes(tiep),
			hinh: nhom?.getAttribute("data-nut-soan") ?? null,
		};
	}, m.nut.tiep);
}

function procCua(url) {
	const duong = decodeURIComponent(
		new URL(url).pathname.split("/api/trpc/")[1] ?? "",
	);
	return duong.split(",").filter(Boolean);
}

async function giuTrangNenCu(t) {
	const goc = `${new URL(APP).origin}/api/trpc/`;
	let idCu = null;
	await t.p.setRequestInterception(true);
	t.p.on("request", async (r) => {
		if (!idCu || r.method() !== "GET" || !r.url().startsWith(goc))
			return r.continue();
		const procs = procCua(r.url());
		if (!procs.includes("okr.danhSach")) return r.continue();
		try {
			const res = await fetch(r.url(), {
				headers: {
					...r.headers(),
					cookie: `${the.tl.ten}=${the.tl.gia}; lang=vi`,
				},
			});
			const than = await res.json();
			const cu = Array.isArray(than)
				? than.map((x, i) => {
						const rows = x?.result?.data?.rows;
						if (procs[i] !== "okr.danhSach" || !Array.isArray(rows)) return x;
						return {
							...x,
							result: {
								...x.result,
								data: {
									...x.result.data,
									rows: rows.filter((o) => idCu.has(o.id)),
								},
							},
						};
					})
				: than;
			await r.respond({
				status: res.status,
				contentType: "application/json",
				body: JSON.stringify(cu),
			});
		} catch {
			await r.continue().catch(() => {});
		}
	});
	return async () => {
		const ds = await sql(
			`SELECT id FROM "okrObjective" WHERE "cycleId" = $1 AND "departmentId" = $2`,
			[KY, PHONG],
		);
		idCu = new Set(ds.map((x) => x.id));
		ghi(
			`   (chieu do khong-lam-moi: sau Dua vao, okr.danhSach cua Theo don vi tra lai danh sach cu ${idCu.size} Muc tieu)`,
		);
	};
}

export async function phanDuaVao({ doDo }) {
	const t = await trang(MAN.kho[1440]);
	try {
		const dongBang = doDo === "khong-lam-moi" ? await giuTrangNenCu(t) : null;
		await t.p.goto(duongDonVi(), { waitUntil: "load" });
		const truoc = await docNen(t.p);
		const M0 = await demManNen(t.p);
		const D0 = await demCsdl();
		ghi(
			`   truoc: M0 ${M0} (mo ta ${truoc.moTa}) · D0 ${D0} · nut «${truoc.nut}»`,
		);
		if (
			!(await choThay(
				t.p,
				() =>
					[...document.querySelectorAll('[data-nut-soan="nut"]')].some(
						(b) => b.checkVisibility() && !b.disabled,
					),
				"nut Soan",
				MAN.cho.manMs,
			))
		)
			await khongDo("khong co nut Soan cua phong");
		const soVao = vao().length;
		await t.p.evaluate(() =>
			[...document.querySelectorAll('[data-nut-soan="nut"]')]
				.find((b) => b.checkVisibility())
				?.click(),
		);
		await choThay(
			t.p,
			(khung) =>
				[...document.querySelectorAll(`:is(${khung}) [data-trang-soan]`)].some(
					(o) =>
						o.checkVisibility() &&
						o.getAttribute("data-trang-soan") !== "dang-mo",
				),
			"khung soan",
			MAN.cho.manMs,
			KHUNG,
		);
		await dungYen(t.p);
		if (!(await choMoHinh(soVao)) || !(await choYen(t.p)))
			await khongDo("luot mo dau khong xong");
		if (!(await nop1(t))) await khongDo("Kara khong nop ban nhap");
		await duaVaoTatCa(t.p);
		if (dongBang) await dongBang();
		if (!(await xacNhanDuaVao(t.p)))
			await khongDo("khong co bien nhan Da tao sau Dua vao");
		await chungTrang(t.p, "sau Dua vao");
		await choYen(t.p);
		await t.p.evaluate(() => {
			window.__chuaTaiLai = true;
		});
		const nut = await dongBangNut(t.p);
		const dong = await choThay(
			t.p,
			(khung) =>
				!new URLSearchParams(location.search).has("record") &&
				![...document.querySelectorAll(khung)].some((k) => k.checkVisibility()),
			"dong khung",
			10000,
			KHUNG,
		);
		const D1 = await demCsdl();
		await choThay(
			t.p,
			(n) => {
				// AC-14 cach-toi: moi muc tieu la mot dong [data-muc-tieu] cua bang don vi (trang-don-vi-mot-bang AC-3), khong con the con cua ST-donvi-danhsach.
				const ds = [...document.querySelectorAll("[data-muc-tieu]")].filter(
					(o) => o.checkVisibility(),
				);
				return ds.length === n;
			},
			"trang nen lam moi",
			CHO_LAM_MOI_MS,
			D1,
		);
		await tre(MAN.cho.yenMs);
		const M1 = await demManNen(t.p);
		const sau = await docNen(t.p);
		const khongTaiLai = await t.p.evaluate(() => window.__chuaTaiLai === true);
		await anh(t, "E14-sau-dua-vao", doDo);
		ghi(
			`   M0 ${M0} · D0 ${D0} · D1 ${D1} · M1 ${M1} (mo ta ${sau.moTa}) · dong khung (nut ${nut}) ${dong} · khong tai lai trang ${khongTaiLai} · nut cua phong «${sau.nut}» (${sau.hinh ?? "-"})`,
		);
		const loi =
			!nut || !dong
				? "khong dong duoc khung sau Dua vao"
				: !khongTaiLai
					? "trang da tai lai khi dong khung"
					: D1 !== D0 + DEM.nop1.mucTieu
						? `CSDL tang ${D1 - D0} Muc tieu, can ${DEM.nop1.mucTieu}`
						: M1 !== D1
							? "trang nen cu sau dua vao"
							: !sau.nut
								? "khong thay nhom nut soan cua phong — khong do duoc Tiep tuc"
								: sau.coTiep
									? `nut cua phong con «${m.nut.tiep}» cho cuoc da dua vao`
									: null;
		if (loi) saiThem(loi);
		else ghi("dua-vao: dat");
	} finally {
		await t.dong();
	}
}

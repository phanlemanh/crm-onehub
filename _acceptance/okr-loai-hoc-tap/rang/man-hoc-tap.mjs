import { fileURLToPath } from "node:url";
import { chay, chieuDo, cho, HEP, moDo, RONG } from "./man-lib.mjs";

const TEP_NAY = fileURLToPath(import.meta.url);
const HOP = "apps/app/app/(app)/[slug]/settings/okr/hop-thoai-dong-ky.tsx";
const CHAM = "apps/app/app/(app)/[slug]/okr/cham-diem.tsx";

const CAY_DO = {
	E11: {
		nhan: "ban sao hop-thoai-dong-ky chi xet conLai",
		tenCay: "olht-chieu-do-e11",
		chiBuoc: "3",
		tep: HOP,
		cam: (s) =>
			s.replace(
				"bang.data.conLai === 0 && hocTap.length === 0",
				"bang.data.conLai === 0",
			),
		dauVet: "if (bang.data && bang.data.conLai === 0)\n",
		ghim: /buoc 3: hop xac nhan hien khi con hoc-tap chua ghi/,
	},
	E11B: {
		nhan: "ban sao cham-diem bo lam moi cache sau khi luu",
		tenCay: "olht-chieu-do-e11b",
		chiBuoc: "4",
		tep: CHAM,
		cam: (s) => s.replace("await cache.okr(objectiveId);", "void objectiveId;"),
		dauVet: "void objectiveId;",
		ghim: /buoc 4: nhan cu sau khi luu/,
	},
	E13: {
		nhan: "ban sao cham-diem an nhan cach doc khi diem trong",
		tenCay: "olht-chieu-do-e13",
		chiBuoc: "2",
		tep: CHAM,
		cam: (s) =>
			s.replace(
				"if (mt.diem === null && mt.cachDoc !== null)",
				'if (mt.diem === null && mt.cachDoc === "__khong-co__")',
			),
		dauVet: '"__khong-co__"',
		ghim: /buoc 2: hoc-tap diem trong mat nhan/,
	},
};

const iChieu = process.argv.indexOf("--chieu-do");
if (iChieu !== -1) {
	const ma = (process.argv[iChieu + 1] ?? "E11").toUpperCase();
	const cay = CAY_DO[ma];
	if (!cay) {
		console.log(
			`KHONG DO DUOC: chieu do khong co ma ${ma}; nhan E11, E11b, E13`,
		);
		process.exit(2);
	}
	await chieuDo(TEP_NAY, cay);
}

const TEN_H = "Kiểm gói dùng thử";
const HOC = "Khách cần bản dùng thử trước khi trả tiền";

const d = await moDo();
let san = null;

async function gieo() {
	const q = await d.nguoiMoi("q", "admin", "Quản Trị Đo");
	const lam = (duong, vao) => d.lam(q.cookie, duong, vao);
	await lam("okr.setProgram", {
		objectiveCap: 50,
		krCap: 50,
		capMode: "canh-bao",
		scoreScale: "0-1",
		weightsOn: false,
		personalOn: true,
		duyetCongBo: false,
	});
	const chuKy = async (nam, ten, tu, den) => {
		const n = await lam("okr.createCycle", {
			kind: "nam",
			name: `Năm ${nam} ${ten}`,
			parentId: null,
			startsOn: `${nam}-01-01`,
			endsOn: `${nam}-12-31`,
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
		});
		const qy = await lam("okr.createCycle", {
			kind: "quy",
			name: `Quý 1/${nam} ${ten}`,
			parentId: n.id,
			startsOn: tu,
			endsOn: den,
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
		});
		await lam("okr.setCyclePhase", { id: qy.id, phase: "dang-chay" });
		return { nam: n.id, quy: qy.id };
	};
	const moi = await chuKy(2031, "đo", "2031-01-01", "2031-03-31");
	const cu = await chuKy(2024, "đo", "2024-01-01", "2024-03-31");
	const mucTieu = async (ten, kind) => {
		const { id } = await lam("okr.createObjective", {
			cycleId: cu.quy,
			unit: { level: "onehub" },
			title: ten,
			kind,
			ownerUserId: q.id,
			participantIds: [],
			whyNow: "",
		});
		const k = await lam("okr.createKeyResult", {
			objectiveId: id,
			title: `Chỉ số của ${ten}`,
			kind: "tang-toi",
			ownerUserId: q.id,
			startValue: 0,
			targetValue: 10,
			currentValue: 10,
			unit: "khách",
			dueOn: null,
			weight: 1,
		});
		await lam("okr.publishObjective", { id });
		return { id, kr: k.id };
	};
	const H = await mucTieu(TEN_H, "hoc-tap");
	const C = await mucTieu("Giữ chân khách cũ", "cam-ket");
	await lam("okr.setCyclePhase", { id: cu.quy, phase: "cham-diem" });
	const cham = async (keyResultId) => {
		const b = await d.hoi(q.cookie, "okr.bangCham", { cycleId: cu.quy });
		const kr = b.mucTieu
			.flatMap((m) => m.krs)
			.find((k) => k.id === keyResultId);
		await lam("okr.chamKr", { keyResultId, diem: kr.diemGoiY });
	};
	await cham(C.kr);
	return { q, moi, cu, H, C, cham };
}

async function don() {
	if (!san) return;
	try {
		for (const ky of [san.moi, san.cu]) {
			await d.db.okrDiemKr.deleteMany({ where: { cycleId: ky.quy } });
			await d.db.okrNhinLai.deleteMany({
				where: { objective: { cycleId: ky.quy } },
			});
			await d.db.okrObjective.deleteMany({ where: { cycleId: ky.quy } });
			await d.db.okrCycle.deleteMany({ where: { id: ky.quy } });
			await d.db.okrCycle.deleteMany({ where: { id: ky.nam } });
		}
	} catch (e) {
		console.log(`don: khong don het — ${String(e).slice(0, 200)}`);
	}
}

const duongCham = () => `/okr/theo-don-vi?kyOkr=${san.cu.quy}&xemOkr=cham`;

const docCham = (t) =>
	t.evaluate(() => {
		const batBuoc = window.__tim("[data-hoc-bat-buoc]");
		return {
			nhan: window
				.__tim("[data-cach-doc]")
				.map((e) => e.getAttribute("data-cach-doc")),
			batBuoc: batBuoc.length,
			chu: document.body.innerText,
		};
	});

async function moKhepKy(t) {
	await d.bamSel(t, `[data-menu-chu-ky='${san.cu.quy}']`);
	await d.bamSel(t, "[data-viec-chu-ky='dong-ky']");
	await d.doi(
		t,
		() =>
			window.__tim("[data-hoc-tap-chua-ghi]").length > 0 ||
			window.__tim("[role='alertdialog']").length > 0 ||
			window.__tim("[data-chua-cham]").length > 0,
	);
	return t.evaluate(() => ({
		xacNhan: window.__tim("[role='alertdialog']").length > 0,
		hocTap: window
			.__tim("[data-hoc-tap-chua-ghi] [data-hoc-tap]")
			.map((e) => e.textContent.trim()),
	}));
}

try {
	san = await gieo();
	await d.batTrinhDuyet(san.q.cookie);

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const t = await d.moTrang(
				san.q.cookie,
				RONG,
				`/okr/theo-don-vi?kyOkr=${san.moi.quy}`,
			);
			await d.bamSel(t, "[data-nut='them-muc-tieu']");
			await d.doi(
				t,
				() => window.__tim("[data-hop-thoai-muc-tieu]").length > 0,
			);
			await d.bamSel(t, "[id$='-loai']");
			await d.doi(t, () => window.__tim("[role='option']").length > 0);
			const luaChon = await t.evaluate(() =>
				window.__tim("[role='option']").map((e) => e.textContent.trim()),
			);
			await d.chup(t, "olht-chon-loai.png");
			await d.bamChu(t, "[role='option']", "Học tập");
			const ten = `Đo nhu cầu gói năm ${Date.now().toString(36)}`;
			await t.click("[id$='-ten']");
			await t.keyboard.type(ten);
			await d.bamSel(t, "[data-nut='gui-muc-tieu']:not([disabled])");
			await d.doi(t, (x) => document.body.innerText.includes(x), ten);
			const chip = await t.evaluate((x) => {
				const hang = [
					...document.querySelectorAll("[data-hang-muc-tieu]"),
				].find((h) => h.innerText.includes(x));
				return hang?.innerText.includes("Học tập") ?? false;
			}, ten);
			await t.close();
			const ds = await d.hoi(san.q.cookie, "okr.byUnit", {
				cycleId: san.moi.quy,
				unit: { loai: "goc" },
			});
			const tao = ds.objectives.find((m) => m.title === ten);
			const loi = [];
			if (
				JSON.stringify([...luaChon].sort()) !==
				JSON.stringify(["Cam kết", "Học tập", "Tham vọng"])
			)
				loi.push(`lua chon loai ${luaChon.join(",")}`);
			if (!chip) loi.push("muc tieu moi khong mang chip Hoc tap");
			if (tao?.kind !== "hoc-tap") loi.push(`okr kind ${tao?.kind}`);
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const t = await d.moTrang(san.q.cookie, RONG, duongCham());
			await d.doi(t, () => window.__tim("[data-o-hoc]").length > 0);
			const m = await docCham(t);
			await d.chup(t, "olht-cham-chua.png");
			await t.close();
			const loi = [];
			if (!m.nhan.includes("chua-tra-loi"))
				loi.push("hoc-tap diem trong mat nhan");
			if (m.batBuoc !== 1) loi.push(`chu thich bat buoc ${m.batBuoc}`);
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	await san.cham(san.H.kr);

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const t = await d.moTrang(san.q.cookie, RONG, "/settings/okr");
			const k = await moKhepKy(t);
			await d.chup(t, "olht-dong-chan.png");
			await t.close();
			const loi = [];
			if (k.xacNhan) loi.push("hop xac nhan hien khi con hoc-tap chua ghi");
			if (JSON.stringify(k.hocTap) !== JSON.stringify([TEN_H]))
				loi.push(`danh sach hoc-tap ${k.hocTap.join(",")}`);
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			const t = await d.moTrang(san.q.cookie, RONG, duongCham());
			await d.doi(t, () => window.__tim("[data-hoc-bat-buoc]").length > 0);
			await t.evaluate(() => {
				window.__mocMan = 1;
			});
			const o = await t.evaluateHandle(() =>
				window.__tim("[data-hoc-bat-buoc]")[0].closest("[data-o-hoc]"),
			);
			const vung = await o.$("textarea");
			await vung.click();
			await t.keyboard.type(HOC);
			const nut = await o.$("[data-nut='luu-hoc']");
			await nut.click();
			const doi = await t
				.waitForFunction(
					() =>
						document.body.innerText.includes("Đã trả lời") &&
						window.__tim("[data-hoc-bat-buoc]").length > 0,
					{ timeout: 10_000 },
				)
				.then(() => true)
				.catch(() => false);
			const dauSauLuu = await t.evaluate(() => window.__mocMan ?? null);
			await d.chup(t, "olht-cham-da.png");
			const loi = [];
			if (!doi) loi.push("nhan cu sau khi luu");
			if (dauSauLuu !== 1) loi.push("trang da tai lai khi luu");
			if (loi.length > 0) {
				await t.close();
				d.dat(4, false, loi.join(" · "));
				return;
			}
			const lienKet = await t.evaluate(() => {
				const a = [...document.querySelectorAll("a[href]")].find((x) =>
					/\/settings(\/okr)?$/.test(new URL(x.href).pathname),
				);
				return a ? new URL(a.href).pathname : null;
			});
			if (!lienKet) {
				await t.close();
				d.dat(4, false, "khong thay lien ket sang Cai dat de bam");
				return;
			}
			await d.bamSel(t, `a[href='${lienKet}']`);
			if (!lienKet.endsWith("/okr")) {
				await d.choDuong(t, "/settings");
				await d.bamSel(t, "a[href$='/settings/okr']");
			}
			await d.choDuong(t, "/settings/okr");
			const dauSauDiChuyen = await t.evaluate(() => window.__mocMan ?? null);
			const k = await moKhepKy(t);
			if (!k.xacNhan) {
				await t.close();
				d.dat(4, false, `hop khep van chan: ${k.hocTap.join(",")}`);
				return;
			}
			await t.evaluate(() => {
				const nut = [...window.__tim("[role='alertdialog'] button")].at(-1);
				nut.click();
			});
			await cho(1500);
			await t.close();
			const ds = await d.hoi(san.q.cookie, "okr.cycles");
			const pha = ds.cycles.find((c) => c.id === san.cu.quy)?.phase;
			const loi2 = [];
			if (dauSauDiChuyen !== 1) loi2.push("trang tai lai khi sang Cai dat");
			if (pha !== "da-dong") loi2.push(`pha sau khep ${pha}`);
			d.dat(4, loi2.length === 0, loi2.join(" · "));
		});

	if (chay(5))
		await d.chayBuoc(5, async () => {
			const t = await d.moTrang(san.q.cookie, HEP, duongCham());
			await d.doi(t, () => window.__tim("[data-o-hoc]").length > 0);
			const tran = await d.cuonNgang(t);
			await d.chup(t, "olht-390.png");
			await t.close();
			d.dat(5, tran.length === 0, `cuon ngang o 390: ${tran.join(", ")}`);
		});

	await don();
	await d.ket("man-hoc-tap");
} catch (e) {
	await don();
	await d.khongDoDuoc(e);
}

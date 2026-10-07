import { fileURLToPath } from "node:url";
import { chay, chieuDo, cho, HEP, moDo, RONG } from "./man-lib.mjs";

const TEP_NAY = fileURLToPath(import.meta.url);

const CAY_DO = {
	E11: {
		nhan: "ban sao cua-toi.tsx dua dangTheoDoi vao bang chinh",
		tenCay: "ctt-chieu-do-e11",
		chiBuoc: "1",
		tep: "apps/app/app/(app)/[slug]/okr/cua-toi.tsx",
		cam: (s) =>
			s.replace(
				"const ds = mine.data.objectives;",
				"const ds = [...mine.data.objectives, ...mine.data.dangTheoDoi];",
			),
		dauVet: "...mine.data.dangTheoDoi];",
		ghim: /buoc 1: M5 trong bang chinh/,
	},
	E12: {
		nhan: "ban sao objective-sheet.tsx bo cache.okr khi theo doi xong",
		tenCay: "ctt-chieu-do-e12",
		chiBuoc: "3",
		tep: "apps/app/components/crm/record-sheet/objective-sheet.tsx",
		cam: (s) =>
			s.replace(
				'onSuccess: () => cache.okr(mt.id, { settle: "record" }),',
				"onSuccess: () => undefined,",
			),
		dauVet: "onSuccess: () => undefined,",
		ghim: /buoc 3: M5 con tren man sau khi tat/,
	},
};

const iChieu = process.argv.indexOf("--chieu-do");
if (iChieu !== -1) {
	const ma = (process.argv[iChieu + 1] ?? "E11").toUpperCase();
	const cay = CAY_DO[ma];
	if (!cay) {
		console.log(`KHONG DO DUOC: chieu do khong co ma ${ma}; nhan E11, E12`);
		process.exit(2);
	}
	await chieuDo(TEP_NAY, cay);
}

const NAM = 2031;
const NHOM_THEO_DOI = "[data-nhom-dang-theo-doi]";
const NHOM_DA_BO = "[data-nhom-da-bo]";

const d = await moDo();

const docMan = (t) =>
	t.evaluate(
		(nhomTheo, nhomBo) => {
			const hien = (s) => window.__tim(s);
			const ngoaiNhom = (h) =>
				h.closest(nhomTheo) === null && h.closest(nhomBo) === null;
			const theo = hien(nhomTheo)[0] ?? null;
			const bo = hien(nhomBo)[0] ?? null;
			const nut = theo?.querySelector("button") ?? null;
			return {
				chinh: hien("[data-hang-muc-tieu]")
					.filter(ngoaiNhom)
					.map((h) => h.getAttribute("data-hang-muc-tieu")),
				trongNhom: hien(`${nhomTheo} [data-hang-muc-tieu]`).map((h) =>
					h.getAttribute("data-hang-muc-tieu"),
				),
				coNhom: theo !== null,
				chuNhom: nut?.textContent?.trim() ?? null,
				moNhom: nut?.getAttribute("aria-expanded") ?? null,
				chuDaBo: bo?.querySelector("button")?.textContent?.trim() ?? null,
				truocDaBo:
					theo !== null &&
					bo !== null &&
					(theo.compareDocumentPosition(bo) &
						Node.DOCUMENT_POSITION_FOLLOWING) !==
						0,
				rong: hien("[data-trang-thai='ST-cuatoi-rong']").length > 0,
				rongTruocNhom:
					theo !== null &&
					theo.previousElementSibling?.getAttribute("data-trang-thai") ===
						"ST-cuatoi-rong",
			};
		},
		NHOM_THEO_DOI,
		NHOM_DA_BO,
	);

const coRong = async (t) =>
	t.evaluate(() => window.__tim("[data-trang-thai='ST-cuatoi-rong']").length);

let san = null;

async function gieo() {
	const quan = await d.nguoiMoi("q", "admin", "Quản Trị Đo");
	const u = await d.nguoiMoi("u", "member", "Phan Minh Anh");
	const v = await d.nguoiMoi("v", "member", "Lê Thu Hà");
	const w = await d.nguoiMoi("w", "member", "Trần Quốc Bảo");
	await d.lam(quan.cookie, "okr.setProgram", {
		objectiveCap: 50,
		krCap: 50,
		capMode: "canh-bao",
		scoreScale: "0-100",
		weightsOn: false,
		personalOn: true,
		duyetCongBo: false,
	});
	const chuKy = (vao) =>
		d.lam(quan.cookie, "okr.createCycle", {
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
			...vao,
		});
	const nam = await chuKy({
		kind: "nam",
		name: `Năm ${NAM} đo`,
		parentId: null,
		startsOn: `${NAM}-01-01`,
		endsOn: `${NAM}-12-31`,
	});
	const quy = await chuKy({
		kind: "quy",
		name: `Quý 1 ${NAM} đo`,
		parentId: nam.id,
		startsOn: `${NAM}-01-01`,
		endsOn: `${NAM}-03-31`,
	});
	await d.lam(quan.cookie, "okr.setCyclePhase", {
		id: quy.id,
		phase: "dang-chay",
	});
	const mucTieu = async (ten, chu, thamGia = []) =>
		(
			await d.lam(quan.cookie, "okr.createObjective", {
				cycleId: quy.id,
				unit: { level: "onehub" },
				title: ten,
				kind: "cam-ket",
				ownerUserId: chu.id,
				participantIds: thamGia.map((n) => n.id),
				whyNow: "",
			})
		).id;
	const congBo = async (id, chu) => {
		await d.lam(quan.cookie, "okr.createKeyResult", {
			objectiveId: id,
			title: "Số khách quay lại",
			kind: "tang-toi",
			ownerUserId: chu.id,
			startValue: 0,
			targetValue: 40,
			currentValue: 10,
			unit: "khách",
			dueOn: null,
			weight: 1,
		});
		await d.lam(quan.cookie, "okr.publishObjective", { id });
	};
	const theoDoi = (n, id, on) =>
		d.lam(n.cookie, "okr.follow", { objectiveId: id, on });
	const M1 = await mucTieu("Tăng khách quay lại", u);
	const M3 = await mucTieu("Mở kênh đối tác mới", v, [u]);
	const M5 = await mucTieu("Rút ngắn thời gian chốt", v);
	const M7 = await mucTieu("Chuẩn hoá báo giá", v);
	const D = await mucTieu("Thử gói dùng thử 7 ngày", u);
	await congBo(M1, u);
	await congBo(M3, v);
	await congBo(M5, v);
	await congBo(M7, v);
	await congBo(D, u);
	await d.lam(quan.cookie, "okr.dropObjective", { id: D });
	await theoDoi(u, M5, true);
	await theoDoi(u, M7, true);
	await theoDoi(w, M7, true);
	return { quan, u, w, nam: nam.id, quy: quy.id, M1, M3, M5, M7, D };
}

async function don() {
	if (!san) return;
	try {
		await d.db.okrObjective.deleteMany({ where: { cycleId: san.quy } });
		await d.db.okrCycle.deleteMany({ where: { id: { in: [san.quy] } } });
		await d.db.okrCycle.deleteMany({ where: { id: { in: [san.nam] } } });
	} catch (e) {
		console.log(`don: khong don het — ${String(e).slice(0, 200)}`);
	}
}

try {
	san = await gieo();
	await d.batTrinhDuyet(san.u.cookie);
	const duongCuaToi = `/okr?kyOkr=${san.quy}`;

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const t = await d.moTrang(san.u.cookie, RONG, duongCuaToi);
			await d.doi(t, (s) => window.__tim(s).length > 0, NHOM_THEO_DOI);
			const m = await docMan(t);
			await d.chup(t, "ctt-cua-toi-dong.png");
			await t.close();
			const loi = [];
			if (m.chinh.includes(san.M5)) loi.push("M5 trong bang chinh");
			if (m.chinh.includes(san.M7)) loi.push("M7 trong bang chinh");
			for (const [ten, id] of [
				["M1", san.M1],
				["M3", san.M3],
			])
				if (!m.chinh.includes(id)) loi.push(`${ten} vang bang chinh`);
			if (m.chuNhom !== "Đang theo dõi (2)")
				loi.push(`nut nhom «${m.chuNhom}» != «Đang theo dõi (2)»`);
			if (m.moNhom !== "false") loi.push(`nhom khong dong san (${m.moNhom})`);
			if (m.chuDaBo !== "Đã bỏ (1)")
				loi.push(`nhom da bo «${m.chuDaBo}» != «Đã bỏ (1)»`);
			if (!m.truocDaBo) loi.push("nhom theo doi khong dung truoc Da bo");
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const t = await d.moTrang(san.u.cookie, RONG, duongCuaToi);
			await d.bamSel(t, `${NHOM_THEO_DOI} button`);
			await d.doi(
				t,
				(s) => window.__tim(s).length === 2,
				`${NHOM_THEO_DOI} [data-hang-muc-tieu]`,
			);
			const m = await docMan(t);
			await t.evaluate((s) => {
				window.__tim(s)[0]?.scrollIntoView({ block: "start" });
			}, NHOM_THEO_DOI);
			await d.chup(t, "ctt-cua-toi-mo.png");
			await t.close();
			const mong = [san.M5, san.M7].sort();
			const thay = [...m.trongNhom].sort();
			d.dat(
				2,
				m.moNhom === "true" && JSON.stringify(thay) === JSON.stringify(mong),
				`nhom mo ${m.moNhom}, trong nhom ${thay.join(",")} != ${mong.join(",")}`,
			);
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const t = await d.moTrang(san.u.cookie, RONG, duongCuaToi);
			await d.bamSel(t, `${NHOM_THEO_DOI} button`);
			await d.bamSel(t, `[data-mo-muc-tieu='${san.M5}']`);
			await d.doi(
				t,
				() => window.__tim("[data-nut='theo-doi'][aria-pressed='true']").length > 0,
			);
			await t.evaluate(() => {
				window.__cttDau = 1;
			});
			await d.bamSel(t, "[data-nut='theo-doi'][aria-pressed='true']");
			await d.doi(
				t,
				() => window.__tim("[data-nut='theo-doi'][aria-pressed='false']").length > 0,
			);
			await t.keyboard.press("Escape");
			await cho(800);
			const roi = await t
				.waitForFunction(
					(s) => window.__tim(s).length === 0,
					{ timeout: 10_000 },
					`[data-hang-muc-tieu='${san.M5}']`,
				)
				.then(() => true)
				.catch(() => false);
			const dau = await t.evaluate(() => window.__cttDau ?? null);
			const m = await docMan(t);
			await d.chup(t, "ctt-sau-bo-theo-doi.png");
			await t.close();
			const api = await d.hoi(san.u.cookie, "okr.mine", { cycleId: san.quy });
			const conApi = ["objectives", "daBo", "dangTheoDoi"].filter((k) =>
				api[k].some((x) => x.id === san.M5),
			);
			const loi = [];
			if (!roi) loi.push("M5 con tren man sau khi tat");
			if (dau !== 1) loi.push("trang da tai lai");
			if (m.chuNhom !== "Đang theo dõi (1)")
				loi.push(`nut nhom «${m.chuNhom}» != «Đang theo dõi (1)»`);
			if (conApi.length > 0) loi.push(`okr.mine con M5 o ${conApi.join("+")}`);
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			const t = await d.moTrang(
				san.u.cookie,
				RONG,
				`/okr/theo-don-vi?kyOkr=${san.quy}`,
			);
			await d.bamSel(t, `[data-mo-muc-tieu='${san.M5}']`);
			const nut = "[data-nut='theo-doi']";
			await d.doi(t, (s) => window.__tim(s).length > 0, nut);
			const dang = await t.evaluate(
				(s) => window.__tim(s)[0].getAttribute("aria-pressed"),
				nut,
			);
			if (dang === "false") {
				await d.bamSel(t, `${nut}[aria-pressed='false']`);
				await d.doi(
					t,
					() =>
						window.__tim("[data-nut='theo-doi'][aria-pressed='true']").length >
						0,
				);
			}
			await t.close();
			const t2 = await d.moTrang(san.u.cookie, RONG, duongCuaToi);
			await d.bamSel(t2, `${NHOM_THEO_DOI} button`);
			await cho(500);
			const m = await docMan(t2);
			await t2.close();
			d.dat(
				4,
				m.chuNhom === "Đang theo dõi (2)" && m.trongNhom.includes(san.M5),
				`sau khi theo doi lai: nut «${m.chuNhom}», trong nhom ${m.trongNhom.join(",")}`,
			);
		});

	if (chay(5))
		await d.chayBuoc(5, async () => {
			const t = await d.moTrang(san.w.cookie, RONG, duongCuaToi);
			await d.doi(t, (s) => window.__tim(s).length > 0, NHOM_THEO_DOI);
			const rong = await coRong(t);
			const m = await docMan(t);
			await d.chup(t, "ctt-rong-co-theo-doi.png");
			await t.close();
			const loi = [];
			if (rong === 0) loi.push("khong co ST-cuatoi-rong");
			if (m.chuNhom !== "Đang theo dõi (1)")
				loi.push(`nut nhom «${m.chuNhom}» != «Đang theo dõi (1)»`);
			if (!m.rongTruocNhom) loi.push("nhom khong dung ngay sau trang thai rong");
			d.dat(5, loi.length === 0, loi.join(" · "));
		});

	if (chay(6))
		await d.chayBuoc(6, async () => {
			const t = await d.moTrang(san.u.cookie, HEP, duongCuaToi);
			await d.doi(t, (s) => window.__tim(s).length > 0, NHOM_THEO_DOI);
			const tran = await d.cuonNgang(t);
			await d.chup(t, "ctt-390.png");
			await t.close();
			d.dat(6, tran.length === 0, `cuon ngang o 390: ${tran.join(", ")}`);
		});

	await don();
	await d.ket("man-theo-doi");
} catch (e) {
	await don();
	await d.khongDoDuoc(e);
}

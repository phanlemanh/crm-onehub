import { db } from "../../../packages/db/src/index.ts";
import { docOkr, timOkr } from "../../../apps/agent-okr/agent/lib/hoi-doc.ts";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { TRO_LY_OKR_SOAN } from "../../../apps/agent-okr/agent/lib/config.ts";
import {
	batAgentOkr,
	cauThieuKhoaSoan,
	chayTrongPhienSoan,
	coKhoaMoHinhSoan,
	PHIEN_SOAN,
	trongPhienSoan,
} from "../../soan-okr-cung-tro-ly/rang/phien-soan.mjs";
import {
	idMau,
	napBoMau,
	phienCookie,
	thuMau,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { chamCau, docPhieu, NGUONG, tongHop } from "./cham-hoi.mjs";
import {
	chepSangEvidence,
	chuCuaPhien,
	GOC,
	hoiMotCau,
	KhongDo,
	PHIEN_HOI,
	RA_HOI,
	tapXemCua,
} from "./phien-hoi.mjs";

const LENH =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/hoi-dap-okr/rang/do-hoi-dap.mjs"';
const BO = join(GOC, "apps/agent-okr/evals/okr-hoi/ca/bo-quy-4.json");
const SONG_SONG = 5;
const SO_PHIEU = 3;
const TRAN_RA_PHIEU = 12_000;

const yeuCauOkr = createRequire(join(GOC, "apps/agent-okr/package.json"));
const { xuongModelZdr } = await import(yeuCauOkr.resolve("@crm/ai-okr"));
const { generateText } = await import(yeuCauOkr.resolve("ai"));

const idCua = (loai, ma) => idMau(loai === "kr" ? "kr" : "mt", ma);

async function anhChup(ca, traLoi, userId) {
	const ids = [
		...ca.kyVong.trichBatBuoc.map((t) => idCua(t.loai, t.ma)),
		...(traLoi?.cau ?? []).flatMap((c) => c.trich.map((t) => t.id)),
	];
	const cha = await db.okrKeyResult.findMany({
		where: { id: { in: ids } },
		select: { id: true, objectiveId: true },
	});
	const laKr = new Set(cha.map((k) => k.id));
	const mucTieu = [
		...new Set([
			...ids.filter((id) => !laKr.has(id)),
			...cha.map((k) => k.objectiveId),
		]),
	];
	const doc = [];
	for (const id of mucTieu) {
		const kq = await docOkr(userId, { loai: "objective", id });
		if (kq.ok) doc.push(kq.mucTieu);
	}
	if (doc.length > 0) return { mucTieuNguoiHoiDocDuoc: doc };
	const tim = await timOkr(userId, {});
	return {
		khongTrich: true,
		quyHienTai: tim.mucTieu.map((m) => ({
			ten: m.ten,
			donVi: m.donVi,
			tinhTrang: m.tinhTrang,
			kr: m.kr.map((k) => k.ten),
		})),
	};
}

async function phieuHoiDong(ca, traLoi, anh) {
	const model = xuongModelZdr({
		modelId: TRO_LY_OKR_SOAN.judge.model,
		tags: TRO_LY_OKR_SOAN.tags,
		tranRaMoiLoiGoi: TRAN_RA_PHIEU,
		khoa: process.env[TRO_LY_OKR_SOAN.khoa.rieng],
	});
	const prompt = [
		'Bạn chấm một câu trả lời của trợ lý OKR. Chỉ trả về đúng một dòng JSON {"dungY": true|false, "lyDo": "<một câu>"}.',
		"«Đúng ý» nghĩa là: trả lời đúng điều được hỏi, không lạc đề, không né khi dữ liệu có, không bịa điều dữ liệu không có. Câu xin sửa OKR hay hỏi ngoài OKR được trả lời bằng lời từ chối có chỉ đường là đúng ý.",
		`Câu hỏi: ${ca.cauHoi}`,
		`Loại câu trả lời kỳ vọng: ${ca.kyVong.loai}`,
		`Dữ liệu thật mà trợ lý đọc được qua công cụ, theo quyền của người hỏi (tienDo, kyVong là phần trăm; tinhTrang là tình trạng; loai là cam-ket hay tham-vong; capNhat là cập nhật tuần với giaTri và tuTin): ${JSON.stringify(anh)}`,
		`Câu trả lời: ${JSON.stringify(traLoi)}`,
	].join("\n");
	const phieu = [];
	for (let i = 0; i < SO_PHIEU; i++) {
		try {
			const kq = await generateText({ model, prompt });
			phieu.push(
				docPhieu(kq.text) ?? {
					dungY: false,
					lyDo: `phieu khong doc duoc (${kq.finishReason}): ${kq.text.slice(0, 120)}`,
				},
			);
		} catch (e) {
			phieu.push({ dungY: false, lyDo: `loi goi judge: ${e?.message ?? e}` });
		}
	}
	return phieu;
}

async function chamMot(ca, moi) {
	const nguoi = await db.user.findUniqueOrThrow({
		where: { email: thuMau(ca.nguoiHoi) },
		select: { id: true },
	});
	const cookie = phienCookie(thuMau(ca.nguoiHoi));
	const kq = await hoiMotCau({
		app: moi.app,
		api: moi.api,
		cookie,
		cauHoi: ca.cauHoi,
	});
	if (!kq.mo.nhan)
		throw new KhongDo(`${ca.ma}: cua tra ${kq.mo.ma} ${kq.mo.chu}`);
	const { maThay, tenCam } = await tapXemCua(nguoi.id, moi.chuKy);
	const diem = chamCau({
		ca,
		traLoi: kq.traLoi,
		chuPhien: chuCuaPhien(kq.suKien),
		tenCam,
		maThay,
		idCua,
	});
	const anh = await anhChup(ca, kq.traLoi, nguoi.id);
	const phieu = await phieuHoiDong(ca, kq.traLoi, anh);
	const dungY = phieu.filter((p) => p.dungY).length * 2 > phieu.length;
	return {
		ma: ca.ma,
		ca,
		...diem,
		dungY,
		phieu,
		anh,
		traLoi: kq.traLoi,
		congCu: kq.congCu,
	};
}

function bang(ket, tong) {
	const o = (x) => `${x ?? ""}`.replaceAll("|", "/").replaceAll("\n", " ");
	const dong = ket.map((k) =>
		[
			k.ma,
			k.ca.nguoiHoi,
			k.ca.yDinh,
			o(k.ca.cauHoi),
			o(JSON.stringify(k.ca.kyVong)),
			o(JSON.stringify(k.anh)),
			o(JSON.stringify(k.traLoi)),
			k.quyen ? "đạt" : "TRƯỢT",
			k.trichSo ? "đạt" : "TRƯỢT",
			k.phieu
				.map((p) => `${p.dungY ? "đúng" : "sai"}: ${o(p.lyDo)}`)
				.join(" / "),
			o(k.lyDo.join("; ")),
		].join(" | "),
	);
	return [
		"# Đo hỏi đáp OKR trên bộ câu mẫu",
		"",
		`Ngưỡng: quyền ${NGUONG.quyen * 100}% · trích và số ${NGUONG.trichSo * 100}% · đúng ý ${NGUONG.dungY * 100}%.`,
		"",
		`**Tổng:** ${tong.dong.split("\n")[0]}`,
		"",
		"| Mã | Người hỏi | Ý định | Câu hỏi | Kỳ vọng | Dữ liệu thật | Câu trả lời dựng | Quyền | Trích và số | Phiếu hội đồng | Lý do |",
		"|---|---|---|---|---|---|---|---|---|---|---|",
		...dong.map((d) => `| ${d} |`),
		"",
	].join("\n");
}

async function trongPhien() {
	const { docBoCaHoi } = await import(
		join(GOC, "apps/agent-okr/evals/okr-hoi/ca.ts")
	);
	const bo = docBoCaHoi(BO);
	const nap = napBoMau();
	if (nap.ma !== 0) throw new KhongDo(`okr:mau thoat ${nap.ma}: ${nap.dong}`);
	const okr = await batAgentOkr({
		cong: Number(process.env[PHIEN_SOAN.bienCong]),
		thuMuc: RA_HOI,
	});
	try {
		if (okr.cay.ket !== "dung-cay")
			throw new KhongDo(`agent-okr cay ${okr.cay.co}, can ${okr.cay.can}`);
		const moi = {
			app: process.env.APP_URL,
			api: process.env.API_URL,
			chuKy: idMau("chu-ky", "quy4"),
		};
		const ket = [];
		for (let i = 0; i < bo.length; i += SONG_SONG) {
			const lo = await Promise.all(
				bo.slice(i, i + SONG_SONG).map((ca) => chamMot(ca, moi)),
			);
			for (const k of lo) {
				ket.push(k);
				console.log(
					`${k.ma}: quyen ${k.quyen ? "dat" : "TRUOT"} · trich ${k.trichSo ? "dat" : "TRUOT"} · dung y ${k.dungY ? "dat" : "TRUOT"}${k.lyDo.length ? ` — ${k.lyDo.join("; ")}` : ""}`,
				);
			}
		}
		const tong = tongHop(ket);
		mkdirSync(RA_HOI, { recursive: true });
		const md = join(RA_HOI, "do-hoi-dap.md");
		writeFileSync(md, bang(ket, tong));
		writeFileSync(
			join(RA_HOI, "do-hoi-dap.json"),
			JSON.stringify({ tong, ket }, null, 1),
		);
		if (chepSangEvidence(md, "do-hoi-dap.md"))
			console.log("chep bang sang evidence/do-hoi-dap.md");
		console.log(tong.dong);
		console.log(tong.ma === 0 ? "DAT" : "KHONG DAT");
		return tong.ma;
	} finally {
		await okr.dung();
	}
}

async function main() {
	const { docBoCaHoi, thieuPhu, NGUOI_HOI, Y_DINH } = await import(
		join(GOC, "apps/agent-okr/evals/okr-hoi/ca.ts")
	);
	const bo = docBoCaHoi(BO);
	const thieu = thieuPhu(bo);
	if (process.argv.includes("--kiem-phu")) {
		console.log(["nguoi hoi", ...Y_DINH].join("\t"));
		for (const n of NGUOI_HOI)
			console.log(
				[
					n,
					...Y_DINH.map(
						(y) => bo.filter((c) => c.nguoiHoi === n && c.yDinh === y).length,
					),
				].join("\t"),
			);
		console.log(`${bo.length} cau · thieu: ${thieu.join(", ") || "-"}`);
	}
	if (thieu.length > 0) {
		console.log(`KHONG DO DUOC: bo cau thieu ${thieu.join(", ")}`);
		return PHIEN_HOI.ma.khongDo;
	}
	if (process.argv.includes("--kiem-phu")) return PHIEN_HOI.ma.dat;
	if (!coKhoaMoHinhSoan()) {
		console.log(`KHONG DO DUOC: ${cauThieuKhoaSoan()}`);
		return PHIEN_HOI.ma.khongDo;
	}
	if (!trongPhienSoan()) return chayTrongPhienSoan(LENH);
	try {
		return await trongPhien();
	} catch (e) {
		console.log(
			`KHONG DO DUOC: ${e instanceof KhongDo ? e.message : `${e?.name} ${JSON.stringify(e?.message)} ${e?.code ?? ""} cause=${String(e?.cause ?? "")}\n${e?.stack ?? e}`}`,
		);
		return PHIEN_HOI.ma.khongDo;
	}
}

process.exit(await main());

import { createHash } from "node:crypto";
import {
	existsSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import {
	chay,
	dungCaySao,
	GOC,
	khiBiNgat,
	RangLoi,
} from "../../do-quyen-luot-bang-hanh-vi/rang/chung.mjs";

const LAT = "_acceptance/chan-lai-component-ra-man";
const LUOT_CHAY = `${LAT}/rang/luot-chay.mjs`;
const KHOA = ["cl_tieng_viet_den_man", "cl_lai_ra_man", "cl_mo_nguyen_ban"];
const TAO_PHAM = [
	"mac-dinh.json",
	"mo-nguyen-ban.json",
	"phan-nhom.json",
	"ve-that.json",
];
const CHO_GHI_CU =
	'export const LUOT = join(GOC, "_acceptance", "chan-lai-component-ra-man", "evidence");';

class KhongDoDuoc extends Error {}

function lenhCuaKhoa(khoa) {
	const cauHinh = readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8");
	const khop = cauHinh.match(new RegExp(`^ {4}${khoa}: "(.*)"$`, "m"));
	if (!khop) throw new KhongDoDuoc(`config.yaml khong co khoa ${khoa}`);
	return khop[1];
}

function anh(thuMuc, goc = thuMuc, ra = new Map()) {
	for (const ten of readdirSync(thuMuc)) {
		const duong = join(thuMuc, ten);
		const st = statSync(duong);
		if (st.isDirectory()) anh(duong, goc, ra);
		else
			ra.set(relative(goc, duong), {
				bam: createHash("sha1").update(readFileSync(duong)).digest("hex"),
				luc: st.mtimeMs,
			});
	}
	return ra;
}

function daCham(truoc, sau) {
	const ten = new Set([...truoc.keys(), ...sau.keys()]);
	return [...ten]
		.filter((t) => {
			const a = truoc.get(t);
			const b = sau.get(t);
			return !a || !b || a.bam !== b.bam || a.luc !== b.luc;
		})
		.sort();
}

function thuMucLuot(sao) {
	const { ma, chu } = chay(sao, [
		"node",
		"--input-type=module",
		"-e",
		"const m = await import(process.argv[1]); console.log(m.LUOT);",
		join(sao, LUOT_CHAY),
	]);
	if (ma !== 0) throw new KhongDoDuoc(`khong nap duoc ${LUOT_CHAY}:\n${chu}`);
	return chu.trim();
}

function motChieu(sao, nhan) {
	const hoSo = join(sao, LAT);
	const batDau = Date.now();
	const truoc = anh(hoSo);
	for (const khoa of KHOA) {
		const { ma } = chay(sao, ["sh", "-c", lenhCuaKhoa(khoa)]);
		console.log(`  ${nhan} · ${khoa} exit ${ma}`);
	}
	return { cham: daCham(truoc, anh(hoSo)), batDau };
}

function taoPhamMoi(sao, nhan, batDau) {
	const luot = thuMucLuot(sao);
	const thieu = TAO_PHAM.filter((t) => {
		const duong = join(luot, t);
		return !existsSync(duong) || statSync(duong).mtimeMs < batDau;
	});
	if (thieu.length > 0)
		throw new KhongDoDuoc(
			`${nhan}: lenh do khong sinh tao pham moi o ${luot}: ${thieu.join(" · ")} — thuoc chua chay thi khong ket luan gi`,
		);
	return luot;
}

function doHaiChieu(sao) {
	const xanh = motChieu(sao, "chieu xanh");
	if (xanh.cham.length > 0) {
		for (const t of xanh.cham)
			console.error(`DO: phep do ghi vao ho so da ky: ${LAT}/${t}`);
		return 1;
	}
	const luotXanh = taoPhamMoi(sao, "chieu xanh", xanh.batDau);
	console.log(
		`chieu xanh — ${KHOA.length} khoa chay xong, ${TAO_PHAM.length} tao pham moi nam o ${luotXanh}, cay ${LAT}/ khong doi.`,
	);

	const duongLuot = join(sao, LUOT_CHAY);
	const nguon = readFileSync(duongLuot, "utf8");
	const dong = nguon.split("\n").filter((d) => d.startsWith("export const LUOT = "));
	if (dong.length !== 1)
		throw new KhongDoDuoc(`khong cay duoc vao ${LUOT_CHAY} — moc da doi`);
	writeFileSync(duongLuot, nguon.replace(dong[0], CHO_GHI_CU));
	console.log(`da tro ${LUOT_CHAY} lai cho ghi cu: evidence/ cua ho so.`);

	const cay = motChieu(sao, "chieu do");
	taoPhamMoi(sao, "chieu do", cay.batDau);
	const mong = TAO_PHAM.map((t) => `evidence/${t}`);
	if (JSON.stringify(cay.cham) !== JSON.stringify(mong)) {
		console.error(
			`DO: tro lai cho ghi cu ma phep thu khong lat dung — mong ${mong.join(" · ")}, thay ${cay.cham.join(" · ") || "(khong tep nao)"}`,
		);
		return 1;
	}
	for (const t of cay.cham) console.log(`  chieu do bat: ${LAT}/${t}`);
	console.log(
		"XANH: cap hai chieu tren cung mot cay sao — cho ghi moi khong cham ho so, cho ghi cu bi bat dung ten tep.",
	);
	return 0;
}

let ma = 2;
const { sao, don } = dungCaySao();
const boNgat = khiBiNgat(don);
let luotXanh = null;
try {
	luotXanh = (() => {
		try {
			return thuMucLuot(sao);
		} catch {
			return null;
		}
	})();
	ma = doHaiChieu(sao);
} catch (loi) {
	const biet = loi instanceof KhongDoDuoc || loi instanceof RangLoi;
	console.error(`KHONG DO DUOC: ${biet ? loi.message : (loi?.stack ?? loi)}`);
	ma = 2;
} finally {
	boNgat();
	if (luotXanh && !luotXanh.startsWith(sao))
		rmSync(luotXanh, { recursive: true, force: true });
	don();
}
process.exit(ma);

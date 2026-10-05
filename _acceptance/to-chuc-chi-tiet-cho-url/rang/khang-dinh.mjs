import { CAU_HINH } from "./cau-hinh.mjs";
import {
	banKhongCho,
	cauKhangDinhCuoi,
	demCaVaKhangDinh,
	doanCuaCa,
} from "./cay.mjs";
import { nguonHienTai, nguonNeo } from "./chay.mjs";

function caChua(ban, viTriGoc) {
	const c = ban.ca.find((x) => viTriGoc >= x.tu && viTriGoc < x.den);
	return c ? c.ten : "cap tep";
}

function soLech(nguonCu, nguonMoi) {
	const cu = banKhongCho(nguonCu);
	const moi = banKhongCho(nguonMoi);
	const loi = [];
	if (cu.chu !== moi.chu) {
		let i = 0;
		while (i < cu.chu.length && cu.chu[i] === moi.chu[i]) i += 1;
		const viTri = moi.viTri[Math.min(i, moi.viTri.length - 1)] ?? 0;
		loi.push(`khac neo ngoai cho: ${caChua(moi, viTri)}`);
	}
	let j = 0;
	for (const c of cu.cho) {
		while (j < moi.cho.length && moi.cho[j].chuan !== c.chuan) {
			if (!moi.cho[j].coUrl)
				loi.push(`cho them khong co ve url: ${moi.cho[j].chuan}`);
			j += 1;
		}
		if (j === moi.cho.length) {
			loi.push(`cho cua neo bi bo: ${c.chuan}`);
			return loi;
		}
		j += 1;
	}
	for (; j < moi.cho.length; j += 1)
		if (!moi.cho[j].coUrl)
			loi.push(`cho them khong co ve url: ${moi.cho[j].chuan}`);
	return loi;
}

function thayTrongCa(nguon, tenCa, cu, moi) {
	const d = doanCuaCa(nguon, tenCa);
	if (!d) return null;
	const doan = nguon.slice(d.tu, d.den);
	if (!doan.includes(cu)) return null;
	return nguon.slice(0, d.tu) + doan.replace(cu, moi) + nguon.slice(d.den);
}

function noiLong(nguon, ten) {
	const cuoi = cauKhangDinhCuoi(nguon, ten);
	if (!cuoi) return null;
	const doan = nguon.slice(cuoi.tu, cuoi.den);
	if (!doan.includes(".toEqual(")) return null;
	return (
		nguon.slice(0, cuoi.tu) +
		doan.replace(".toEqual(", ".toMatchObject(") +
		nguon.slice(cuoi.den)
	);
}

function boMot(nguon, doan) {
	return nguon.split(doan).length === 2 ? nguon.replace(doan, "") : null;
}

function datPha(nguon) {
	const osm = CAU_HINH.caDocUrl[1];
	const pha = CAU_HINH.caDocUrl.map((ten) => ({
		nhan: "toEqual thanh toMatchObject",
		ban: noiLong(nguon, ten),
		mong: `khac neo ngoai cho: ${ten}`,
	}));
	pha.push({
		nhan: "bo hang chua-co khoi bang BON_NUT",
		ban: boMot(
			nguon,
			'\t{ nut: "chua-co", chiTiet: "chua-co-phong-ban", don: "chua-co" },\n',
		),
		mong: "khac neo ngoai cho: cap tep",
	});
	pha.push({
		nhan: "bo cu bam cua o-so-man",
		ban: thayTrongCa(nguon, osm, "await bam(o);", ""),
		mong: `khac neo ngoai cho: ${osm}`,
	});
	pha.push({
		nhan: "doi ten mot ca",
		ban: thayTrongCa(
			nguon,
			CAU_HINH.caMat,
			`"${CAU_HINH.caMat}"`,
			`"${CAU_HINH.caMat} (doi ten)"`,
		),
		mong: `khac neo ngoai cho: ${CAU_HINH.caMat} (doi ten)`,
	});
	pha.push({
		nhan: "bo mot cho co san cua neo",
		ban: thayTrongCa(
			nguon,
			"o-so-man: o thu hai noi K, bam loc cay con dung K phong ban, bam lai bo loc",
			`await cho(() => ${CAU_HINH.choCuBiBo}, "loc tat");`,
			"",
		),
		mong: `cho cua neo bi bo: ${CAU_HINH.choCuBiBo.replace(/\s+/g, "")}`,
	});
	return pha;
}

function chay() {
	let nguon;
	let neo;
	try {
		nguon = nguonHienTai();
		neo = nguonNeo();
	} catch (e) {
		console.log(`khong doc duoc tep hoac ban neo: ${e.message}`);
		return 2;
	}
	const dem = demCaVaKhangDinh(neo);
	const choNeo = banKhongCho(neo).cho.length;
	const choMoi = banKhongCho(nguon).cho;
	console.log(
		`ban neo ${CAU_HINH.neo.slice(0, 8)}: ${dem.soCa} ca, ${dem.soCau} cau expect, ${choNeo} cau cho; HEAD: ${choMoi.length} cau cho (${choMoi.filter((c) => c.coUrl).length} co ve url them)`,
	);
	if (dem.soCa === 0 || dem.soCau === 0) {
		console.log("ban neo khong co ca hay cau expect nao — khong do duoc");
		return 2;
	}
	let ma = 0;
	for (const p of datPha(nguon)) {
		if (p.ban === null) {
			console.log(`moc pha khong thay: ${p.nhan}`);
			return 2;
		}
		const bat = soLech(neo, p.ban).includes(p.mong);
		console.log(
			`chieu do — ${p.nhan}: ${bat ? p.mong : `KHONG BAT (mong "${p.mong}")`}`,
		);
		if (!bat) ma = 1;
	}
	const loi = soLech(neo, nguon);
	for (const l of loi) console.log(l);
	if (loi.length > 0) ma = 1;
	console.log(
		ma === 0
			? "XANH: ngoai cac cau cho, tep trung tung chu voi neo; moi cho cua neo con du, cho moi deu co ve url"
			: "DO",
	);
	return ma;
}

process.exit(chay());

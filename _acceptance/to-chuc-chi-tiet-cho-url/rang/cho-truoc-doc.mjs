import { CAU_HINH } from "./cau-hinh.mjs";
import { boDieuKienUrl, docUrlNgoaiCho, doiThanhKhacNull } from "./cay.mjs";
import { nguonHienTai, nguonNeo } from "./chay.mjs";

function loiDoc(nguon) {
	const loi = [];
	for (const d of docUrlNgoaiCho(nguon).doc) {
		if (!d.coCho) loi.push(`doc ?${d.khoa} truoc khi cho: ${d.ca}`);
		else if (d.giaTri !== CAU_HINH.giaTriCho[d.ca])
			loi.push(
				`cho sai gia tri ?${d.khoa} (${d.giaTri ?? "khong co ==="} thay vi ${CAU_HINH.giaTriCho[d.ca]}): ${d.ca}`,
			);
	}
	return loi;
}

function chieuDo(nhan, nguon, pha, mau) {
	const ra = [];
	for (const ca of CAU_HINH.caDocUrl) {
		const p = pha(nguon, ca, CAU_HINH.khoaUrl);
		if (p === null) return { moc: ca };
		const bat = loiDoc(p).find(
			(l) => l.startsWith(mau) && l.endsWith(`: ${ca}`),
		);
		console.log(`chieu do — ${nhan}: ${bat ?? `KHONG BAT: ${ca}`}`);
		ra.push(Boolean(bat));
	}
	return { du: ra.every(Boolean) };
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
	const { doc, la } = docUrlNgoaiCho(nguon);
	if (la.length > 0) {
		for (const l of la)
			console.log(`doc url dang la (thuoc khong phu): ${l.dang} — ${l.ca}`);
		return 2;
	}
	const caCo = [...new Set(doc.map((d) => d.ca))].sort();
	const caNeo = [...CAU_HINH.caDocUrl].sort();
	console.log(
		`soi ${doc.length} lan doc url ngoai cho, trong ${caCo.length} ca:`,
	);
	for (const d of doc)
		console.log(
			`  ${d.coCho ? `cho ?${d.khoa} === ${d.giaTri}` : "KHONG cho"} · ${d.ca}`,
		);
	if (caCo.join("\n") !== caNeo.join("\n")) {
		console.log(
			`ma tran lech: ca doc url ngoai cho [${caCo.join(" | ")}] khac neo [${caNeo.join(" | ")}]`,
		);
		return 2;
	}
	const loiNeo = loiDoc(neo).filter((l) => l.startsWith("doc ?"));
	console.log(
		`ban neo ${CAU_HINH.neo.slice(0, 8)}: ${loiNeo.length}/${caNeo.length} ca doc truoc khi cho`,
	);
	if (loiNeo.length !== caNeo.length) {
		console.log(
			"doi chung khong do: ban neo phai doc truoc khi cho o du ba ca",
		);
		return 2;
	}
	const a = chieuDo("go dieu kien url khoi cho", nguon, boDieuKienUrl, "doc ?");
	const b = chieuDo(
		"=== gia tri thanh !== null",
		nguon,
		doiThanhKhacNull,
		"cho sai gia tri",
	);
	for (const r of [a, b])
		if (r.moc) {
			console.log(
				`moc pha khong thay (cho co ve url.get("${CAU_HINH.khoaUrl}") === …): ${r.moc}`,
			);
			return 2;
		}
	let ma = a.du && b.du ? 0 : 1;
	const loi = loiDoc(nguon);
	for (const l of loi) console.log(l);
	if (loi.length > 0) ma = 1;
	console.log(
		ma === 0
			? "XANH: moi lan doc ?don sau mot cho so url.get dung gia tri khang dinh"
			: "DO",
	);
	return ma;
}

process.exit(chay());

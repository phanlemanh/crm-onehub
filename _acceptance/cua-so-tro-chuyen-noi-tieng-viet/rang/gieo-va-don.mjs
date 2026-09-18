import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { API, mu, phien, suySlug } from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";

const VET = join(GOC, ".acceptance-runs", "cua-so-tro-chuyen-noi-tieng-viet", "hoi-thoai-gieo.json");

export function docHoiThoaiGieo() {
	if (!existsSync(VET)) return null;
	try {
		const v = JSON.parse(readFileSync(VET, "utf8"));
		return String(v.id) === v.id && v.id.length > 0 ? v : null;
	} catch {
		return null;
	}
}

function hong(...dong) {
	for (const d of dong) console.log(d);
	process.exit(2);
}

async function goi(duong, cookie, than) {
	const res = await fetch(`${API}/api/trpc/${duong}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...mu(cookie) },
		body: JSON.stringify(than),
	});
	const chu = await res.text();
	return { ma: res.status, chu };
}

async function tienKiem(cookie) {
	const res = await fetch(`${API}/api/trpc/conversations.list?input=%7B%7D`, {
		headers: mu(cookie),
	}).catch(() => null);
	if (res === null)
		hong(`KHONG DO DUOC: tien de thieu — may chu API ${API} khong tra loi.`);
	if (res.status >= 500)
		hong(
			`KHONG DO DUOC: tien de thieu — may chu API tra ${res.status}; co so du lieu do co the chua nap.`,
		);
	const slug = await suySlug(cookie);
	if (String(slug) !== slug || slug.length === 0)
		hong("KHONG DO DUOC: tien de thieu — khong suy duoc workspace tu phien dang nhap.");
	console.log(`tien de: API tra loi · phien dang song · workspace ${slug}`);
	return slug;
}

async function xoaMotHoiThoai(cookie, id) {
	const ra = await goi("conversations.remove", cookie, { id });
	return ra.ma === 200;
}

async function gieo() {
	const cookie = phien();
	await tienKiem(cookie);

	const cu = docHoiThoaiGieo();
	if (cu !== null) {
		const sach = await xoaMotHoiThoai(cookie, cu.id);
		console.log(
			`vet cu con lai tu luot truoc (${cu.id}) — don ${sach ? "xong" : "khong duoc, no co the da bi xoa"}.`,
		);
		rmSync(VET, { force: true });
	}

	let soLanGoi = 0;
	soLanGoi += 1;
	const ra = await goi("conversations.createBuilder", cookie, {
		clientRequestId: randomUUID(),
		commandType: "CHAT",
		message: "Hội thoại gieo để đo màn — vòng nghiệm thu tự dọn.",
	});
	if (ra.ma !== 200)
		hong(
			`KHONG DO DUOC: gieo hoi thoai that bai — HTTP ${ra.ma}.`,
			`   ${ra.chu.slice(0, 200)}`,
		);
	const id = JSON.parse(ra.chu)?.result?.data?.id;
	if (String(id) !== id)
		hong("KHONG DO DUOC: gieo xong ma khong doc duoc dinh danh hoi thoai tu cau tra loi.");

	mkdirSync(dirname(VET), { recursive: true });
	writeFileSync(
		VET,
		`${JSON.stringify({ id, so_lan_goi: soLanGoi, ts: new Date().toISOString() }, null, "\t")}\n`,
	);
	console.log(`so lan goi createBuilder trong luot nay: ${soLanGoi}`);
	if (soLanGoi !== 1)
		hong(`DO: tran mot-loi-goi bi pha — goi ${soLanGoi} lan.`);
	console.log(`XANH: da gieo mot hoi thoai (${id}) va ghi vet cho cac chan man doc.`);
	process.exit(0);
}

async function don() {
	const cookie = phien();
	const vet = docHoiThoaiGieo();
	if (vet === null)
		hong("KHONG DO DUOC: khong co vet hoi thoai gieo de don — chan gieo chua chay, hoac da don roi.");

	const sach = await xoaMotHoiThoai(cookie, vet.id);
	if (!sach)
		hong(`KHONG DO DUOC: lenh don that bai — hoi thoai ${vet.id} van con.`);
	rmSync(VET, { force: true });
	console.log(`da don hoi thoai ${vet.id}.`);

	const kt = execFileSync(
		"node",
		[join(GOC, "_acceptance/agent-builder-noi-tieng-viet/rang/man-that.mjs"), "trang-thai"],
		{ cwd: GOC, encoding: "utf8", env: process.env },
	);
	if (!kt.includes("hong=0"))
		hong(
			"DO: don xong ma chan trang thai cua ho so dot mot khong xanh — cay chua that su sach.",
			kt.split("\n").slice(-4).join("\n"),
		);
	console.log("XANH: cay tro lai sach, va do bang chan cua ho so KHAC chu khong bang loi tu khai.");
	process.exit(0);
}

if (process.argv[1]?.endsWith("gieo-va-don.mjs")) {
	const dong = process.argv[2] ?? "gieo";
	if (dong === "gieo") await gieo();
	else if (dong === "don") await don();
	else hong(`KHONG DO DUOC: chua biet dong tu ${JSON.stringify(dong)} — dung gieo hoac don.`);
}

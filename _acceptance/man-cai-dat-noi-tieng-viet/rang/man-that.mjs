import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { GOC, lat } from "./lat.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const CHO_TAI = Number(process.env.CHO_TAI ?? 120000);
const CHO_LANG = Number(process.env.CHO_LANG ?? 2500);
const RONG = Number(process.env.BE_RONG ?? 1440);
const HEP = Number(process.env.BE_RONG_HEP ?? 360);
const CAO = Number(process.env.CAO ?? 1000);
const NGUOI = process.env.NGUOI ?? "manh.phan@onemount.com";
const BANG = `${HERE}/khong-dich-cua-lat.json`;
const MAN = ["/settings", "/settings/currencies"];
const LUAT_CO = new Set([
	"so-thuan",
	"du-lieu-nguoi-nhap",
	"ma-va-ten-dong-tien",
	"ten-model",
	"gia-tri-bi-che",
]);
const CHI_SO = /^[\d\s.,:;%–\-—/()+=?…·|≈~≥≤<>]*$/;
const DAU_VIET =
	/[ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ]/;
const CHE = /^[•●○*·\s]{3,}/;

let trinhDuyet = null;

async function ket(ma) {
	if (trinhDuyet !== null) await trinhDuyet.close().catch(() => {});
	process.exit(ma);
}

async function khongDo(...dong) {
	for (const d of dong) console.log(d);
	await ket(2);
}

function phien() {
	if (process.env.PHIEN) return chiaCookie(process.env.PHIEN.trim());
	const ra = execFileSync("bun", ["run", "dev:session", NGUOI], {
		cwd: `${GOC}/apps/api`,
		encoding: "utf8",
	});
	return chiaCookie(ra.trim().split("\n").pop().trim());
}

function chiaCookie(dong) {
	const dau = dong.indexOf("=");
	if (dau < 1) {
		console.log(
			"KHONG DO DUOC: tien de thieu — khong doc duoc cookie phien tu `bun run dev:session`.",
		);
		process.exit(2);
	}
	return { ten: dong.slice(0, dau), gia: dong.slice(dau + 1) };
}

function mu(cookie, tieng) {
	return {
		Cookie: `${cookie.ten}=${cookie.gia}${tieng ? `; lang=${tieng}` : ""}`,
	};
}

async function goiApi(cookie, duong, vao) {
	const url = `${API}/api/trpc/${duong}?input=${encodeURIComponent(
		JSON.stringify({ json: vao }),
	)}`;
	const res = await fetch(url, { redirect: "manual", headers: mu(cookie) });
	if (res.status >= 300 && res.status < 400) {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — ${duong} tra ${res.status} va doi chuyen huong. Phien dang nhap khong con hieu luc.`,
		);
	}
	if (!res.ok) {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — ${duong} tra ${res.status}, may chu api khong phuc vu duoc.`,
		);
	}
	return (await res.json()).result.data;
}

async function suySlug(cookie) {
	if (process.env.SLUG) return process.env.SLUG;
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: mu(cookie, "vi"),
	});
	const dich = res.headers.get("location");
	if (!dich) {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — ${APP}/ tra ${res.status} ma khong co Location, khong suy duoc slug.`,
		);
	}
	const dau = new URL(dich, APP).pathname
		.replace(/^\/+|\/+$/g, "")
		.split("/")[0];
	if (!dau || dau === "sign-in") {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — ${APP}/ chi tro ve "${dich}". Phien dang nhap khong hop le.`,
		);
	}
	return dau;
}

async function canhCong(cookie, slug) {
	for (const man of MAN) {
		for (const tieng of ["vi", "en"]) {
			const duong = `/${slug}${man}`;
			const res = await fetch(`${APP}${duong}`, {
				redirect: "manual",
				headers: mu(cookie, tieng),
			});
			if (res.status >= 300 && res.status < 400) {
				await khongDo(
					`KHONG DO DUOC: tien de thieu — ${duong} (lang=${tieng}) tra ${res.status} va doi di ${res.headers.get("location")}.`,
					"   Chan nay KHONG di theo lenh chuyen huong: vong truoc da do nham man vi di theo no.",
				);
			}
			if (res.status !== 200) {
				await khongDo(
					`KHONG DO DUOC: tien de thieu — ${duong} (lang=${tieng}) tra ${res.status}, khong phai 200.`,
				);
			}
		}
	}
}

const GOM = () => {
	const goc = document.querySelector(
		'[data-slot="page-shell-scroll"]',
	)?.parentElement;
	if (!goc) return null;
	const nhinThay = (el) => {
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) return false;
		const s = getComputedStyle(el);
		return (
			s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0"
		);
	};
	const duong = (el) => {
		const p = [];
		let e = el;
		while (e && e !== goc && e.parentElement) {
			p.push(
				`${e.tagName.toLowerCase()}:${[...e.parentElement.children].indexOf(e)}`,
			);
			e = e.parentElement;
		}
		return p.reverse().join("/");
	};
	const ra = [];
	const di = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT);
	for (let n = di.nextNode(); n; n = di.nextNode()) {
		const el = n.parentElement;
		if (!el) continue;
		if (el.closest("script,style,noscript,template")) continue;
		if (!nhinThay(el)) continue;
		const t = (n.nodeValue ?? "").replace(/\s+/g, " ").trim();
		if (t === "") continue;
		ra.push({
			khoa: `${duong(el)}#${[...el.childNodes].indexOf(n)}`,
			chu: t,
			khongDich: Boolean(el.closest('[translate="no"]')),
		});
	}
	for (const el of goc.querySelectorAll("input,textarea")) {
		if (!nhinThay(el)) continue;
		const v = (el.value ?? "").replace(/\s+/g, " ").trim();
		if (v === "") continue;
		ra.push({
			khoa: `${duong(el)}@value`,
			chu: v,
			khongDich: Boolean(el.closest('[translate="no"]')),
		});
	}
	for (const el of goc.querySelectorAll("*")) {
		if (!nhinThay(el)) continue;
		for (const a of ["placeholder", "title", "aria-label", "alt"]) {
			const v = el.getAttribute(a);
			if (v === null || v.trim() === "") continue;
			ra.push({
				khoa: `${duong(el)}@${a}`,
				chu: v.replace(/\s+/g, " ").trim(),
				khongDich: Boolean(el.closest('[translate="no"]')),
			});
		}
	}
	return ra;
};

const DO_RONG = () => {
	const goc = document.querySelector(
		'[data-slot="page-shell-scroll"]',
	)?.parentElement;
	if (!goc) return null;
	const nhinThay = (el) => {
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) return false;
		const s = getComputedStyle(el);
		return (
			s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0"
		);
	};
	const duong = (el) => {
		const p = [];
		let e = el;
		while (e && e !== goc && e.parentElement) {
			p.push(
				`${e.tagName.toLowerCase()}:${[...e.parentElement.children].indexOf(e)}`,
			);
			e = e.parentElement;
		}
		return p.reverse().join("/");
	};
	const ra = [];
	for (const el of goc.querySelectorAll("*")) {
		if (el.closest("script,style,noscript,template")) continue;
		if (!nhinThay(el)) continue;
		const rieng = [...el.childNodes]
			.filter((n) => n.nodeType === 3)
			.map((n) => (n.nodeValue ?? "").replace(/\s+/g, " ").trim())
			.filter((t) => t !== "")
			.join(" ");
		if (rieng === "") continue;
		ra.push({
			khoa: duong(el),
			chu: rieng,
			day: el.textContent.replace(/\s+/g, " ").trim(),
			scrollWidth: el.scrollWidth,
			clientWidth: el.clientWidth,
			scrollHeight: el.scrollHeight,
			clientHeight: el.clientHeight,
		});
	}
	return ra;
};

async function moMan(cookie, slug, man, tieng, rong, sau) {
	const trang = await trinhDuyet.newPage();
	await trang.setViewport({ width: rong, height: CAO, deviceScaleFactor: 1 });
	await trang.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
	await trinhDuyet.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: "localhost", path: "/" },
		{ name: "lang", value: tieng, domain: "localhost", path: "/" },
	);
	const doi = `/${slug}${man}`;
	const res = await trang.goto(`${APP}${doi}`, {
		waitUntil: "networkidle0",
		timeout: CHO_TAI,
	});
	const chuoi = res?.request().redirectChain() ?? [];
	if (chuoi.length > 0) {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — ${doi} bi chuyen huong ${chuoi.length} chang truoc khi ve.`,
			"   Chan nay KHONG do man den sau mot lenh chuyen huong.",
		);
	}
	if (new URL(trang.url()).pathname !== doi) {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — xin ${doi} nhung dung o ${new URL(trang.url()).pathname}.`,
		);
	}
	await new Promise((r) => setTimeout(r, sau ?? CHO_LANG));
	const langThat = await trang.evaluate(() => document.documentElement.lang);
	if (langThat !== tieng) {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — xin lang=${tieng} nhung trang ve lang=${langThat}.`,
		);
	}
	return trang;
}

async function docMan(cookie, slug, man, tieng, rong) {
	const trang = await moMan(cookie, slug, man, tieng, rong);
	const gia = await trang.evaluate(GOM);
	await trang.close();
	if (gia === null) {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — ${man} khong co khung man de gom chu.`,
		);
	}
	if (gia.length === 0) {
		await khongDo(
			`KHONG DO DUOC: ${man} (lang=${tieng}) gom ra 0 chuoi. Tap quan sat rong khong bao gio la dat.`,
		);
	}
	return gia;
}

function docBang() {
	if (!existsSync(BANG)) {
		console.log(
			`KHONG DO DUOC: tien de thieu — chua co bang khai ${BANG.replace(`${GOC}/`, "")}.`,
		);
		process.exit(2);
	}
	const b = JSON.parse(readFileSync(BANG, "utf8"));
	const la = (b.luat ?? []).map((l) => l.ten);
	const badLuat = la.filter((t) => !LUAT_CO.has(t));
	if (badLuat.length > 0) {
		console.log(
			`KHONG DO DUOC: bang khai co luat khong ai cai dat: ${badLuat.join(" · ")}`,
		);
		process.exit(2);
	}
	if (!Array.isArray(b.dong)) {
		console.log("KHONG DO DUOC: bang khai khong co mang `dong`.");
		process.exit(2);
	}
	return { luat: new Set(la), dong: b.dong };
}

function maTienTe() {
	const src = readFileSync(`${GOC}/packages/db/src/currency.ts`, "utf8");
	const ra = new Set();
	for (const m of src.matchAll(/code:\s*"([A-Z]{3})",\s*name:\s*"([^"]+)"/g)) {
		ra.add(m[1]);
		ra.add(m[2]);
		ra.add(`· ${m[2]}`);
		ra.add(`${m[1]} · ${m[2]}`);
	}
	if (ra.size === 0) {
		console.log(
			"KHONG DO DUOC: khong doc duoc ma dong tien nao tu packages/db/src/currency.ts.",
		);
		process.exit(2);
	}
	return ra;
}

async function dungMienTru(cookie, bang) {
	const noiLam = await goiApi(cookie, "workspace.get", null);
	const catalog = await goiApi(cookie, "settings.modelCatalog", null);
	const tien = bang.luat.has("ma-va-ten-dong-tien") ? maTienTe() : new Set();
	const nguoiNhap = new Set(
		[noiLam.name, noiLam.website, noiLam.slug].filter(Boolean),
	);
	const model = new Set();
	for (const m of catalog.models ?? []) {
		model.add(m.name);
		model.add(m.provider);
		model.add(m.id);
	}
	const khai = new Set(bang.dong.map((d) => d.gia_tri));
	const vetTable = new Set();
	const boi = (s) => {
		if (bang.luat.has("so-thuan") && CHI_SO.test(s)) return "so-thuan";
		if (bang.luat.has("gia-tri-bi-che") && CHE.test(s)) return "gia-tri-bi-che";
		if (bang.luat.has("du-lieu-nguoi-nhap") && nguoiNhap.has(s))
			return "du-lieu-nguoi-nhap";
		if (bang.luat.has("ma-va-ten-dong-tien") && tien.has(s))
			return "ma-va-ten-dong-tien";
		if (bang.luat.has("ten-model") && model.has(s)) return "ten-model";
		if (khai.has(s)) {
			vetTable.add(s);
			return "bang-khai";
		}
		return null;
	};
	return { boi, khai, vetTable, noiLam, model, tien, nguoiNhap };
}

async function chanHaiTieng(cookie, slug) {
	const bang = docBang();
	const mt = await dungMienTru(cookie, bang);
	let hong = 0;
	let tongCap = 0;
	for (const man of MAN) {
		const vi = await docMan(cookie, slug, man, "vi", RONG);
		const en = await docMan(cookie, slug, man, "en", RONG);
		console.log(
			`\n-- man ${man} · vi=${vi.length} chuoi · en=${en.length} chuoi`,
		);
		if (vi.length !== en.length) {
			console.log(
				`   VE 1 HONG: so chuoi hai luot khong bang nhau (vi=${vi.length}, en=${en.length}).`,
			);
			hong += 1;
		}
		const n = Math.min(vi.length, en.length);
		tongCap += n;
		let lechViTri = 0;
		let giongNhau = 0;
		let khongDau = 0;
		for (let i = 0; i < n; i += 1) {
			if (vi[i].khoa !== en[i].khoa) {
				if (lechViTri < 5)
					console.log(
						`   VI TRI LECH tai cap ${i}: vi=${vi[i].khoa} · en=${en[i].khoa}`,
					);
				lechViTri += 1;
				continue;
			}
			const ly = mt.boi(vi[i].chu);
			if (vi[i].chu === en[i].chu && ly === null) {
				console.log(
					`   VE 2 HONG: ${JSON.stringify(vi[i].chu)} giong het o hai luot, bang mien tru khong khai — ${vi[i].khoa}`,
				);
				giongNhau += 1;
			}
			if (ly === null && !DAU_VIET.test(vi[i].chu)) {
				console.log(
					`   VE 3 HONG: chuoi luot vi khong mang dau tieng Viet: ${JSON.stringify(vi[i].chu)} — ${vi[i].khoa}`,
				);
				khongDau += 1;
			}
		}
		if (lechViTri > 0)
			console.log(
				`   VE 1 HONG: ${lechViTri} cap lech duong dan trong cay DOM.`,
			);
		console.log(
			`   ve 2: ${giongNhau} cap giong nhau ngoai bang · ve 3: ${khongDau} chuoi vi khong dau`,
		);
		hong += lechViTri + giongNhau + khongDau;
	}
	if (tongCap === 0) {
		await khongDo(
			"KHONG DO DUOC: 0 cap chuoi de doi chieu. Tap quan sat rong khong bao gio la dat.",
		);
	}
	console.log(`\nket qua: ${tongCap} cap doi chieu · hong=${hong}`);
	await ket(hong > 0 ? 1 : 0);
}

async function chanKhongDich(cookie, slug) {
	const bang = docBang();
	const mt = await dungMienTru(cookie, bang);
	const ungVien = new Map();
	let coKhongDich = 0;
	const mangTen = [];
	for (const man of MAN) {
		const vi = await docMan(cookie, slug, man, "vi", RONG);
		const en = await docMan(cookie, slug, man, "en", RONG);
		const n = Math.min(vi.length, en.length);
		for (let i = 0; i < n; i += 1) {
			const laKhongDich = vi[i].khongDich || en[i].khongDich;
			const giongHet = vi[i].khoa === en[i].khoa && vi[i].chu === en[i].chu;
			if (laKhongDich) coKhongDich += 1;
			if (!laKhongDich && !giongHet) continue;
			const cu = ungVien.get(vi[i].chu) ?? { cho: [], thuocTinh: false };
			cu.cho.push(`${man} ${vi[i].khoa}`);
			cu.thuocTinh = cu.thuocTinh || laKhongDich;
			ungVien.set(vi[i].chu, cu);
		}
		for (const o of vi) {
			if (o.chu === mt.noiLam.name) mangTen.push({ man, ...o });
		}
	}
	if (ungVien.size === 0) {
		await khongDo(
			"KHONG DO DUOC: tap ung vien khong-dich rong. Tap quan sat rong khong bao gio la dat.",
		);
	}
	console.log(
		`-- ung vien sinh tu man that: ${ungVien.size} gia tri (${coKhongDich} cho mang translate="no")`,
	);
	const conLai = [];
	for (const [gt, o] of [...ungVien].sort()) {
		const ly = mt.boi(gt);
		console.log(
			`   ${(ly ?? "CHUA KHAI").padEnd(20)} ${JSON.stringify(gt)}${o.thuocTinh ? ' [translate="no"]' : ""}`,
		);
		if (ly === null) conLai.push(gt);
		if (ly !== null && ly !== "bang-khai") continue;
	}
	const thieu = bang.dong
		.map((d) => d.gia_tri)
		.filter((v) => !mt.vetTable.has(v));
	for (const v of thieu)
		console.log(
			`THIEU MOT DONG: bang khai gia tri ${JSON.stringify(v)} nhung man that khong con no.`,
		);
	for (const v of conLai)
		console.log(
			`THUA MOT GIA TRI: man that co ${JSON.stringify(v)} ma bang khong khai — no phai duoc dich, hoac phai co mot dong khai ly do.`,
		);

	console.log(
		`\n-- AC-6b · ten workspace nguoi nhap: ${JSON.stringify(mt.noiLam.name)}`,
	);
	if (mangTen.length === 0) {
		console.log(
			`KHONG DO DUOC: khong tim thay phan tu nao mang ten workspace tren hai man.`,
		);
		await ket(2);
	}
	let thieuThuocTinh = 0;
	for (const o of mangTen) {
		console.log(
			`   ${o.khongDich ? 'co translate="no"' : 'THIEU translate="no"'} — ${o.man} ${o.khoa}`,
		);
		if (!o.khongDich) thieuThuocTinh += 1;
	}
	console.log(
		`\nket qua: thieu dong=${thieu.length} · thua gia tri=${conLai.length} · AC-6b thieu thuoc tinh=${thieuThuocTinh}`,
	);
	if (thieu.length > 0 || conLai.length > 0) await ket(2);
	await ket(thieuThuocTinh > 0 ? 1 : 0);
}

async function coLuongTaoWorkspace(cookie, slug) {
	const thu = [
		"workspace.create",
		"workspaces.create",
		"organization.create",
		"workspace.new",
	];
	const ra = [];
	for (const duong of thu) {
		const res = await fetch(`${API}/api/trpc/${duong}`, {
			method: "POST",
			redirect: "manual",
			headers: { ...mu(cookie), "content-type": "application/json" },
			body: JSON.stringify({ json: {} }),
		});
		const chu = (await res.text()).slice(0, 200);
		const khong = res.status === 404 || /No .*procedure|not found/i.test(chu);
		ra.push(`${duong} -> ${res.status}${khong ? " (khong co thu tuc)" : ""}`);
		if (!khong) return { co: true, vet: ra };
	}
	const trang = await moMan(cookie, slug, "/settings", "vi", RONG);
	const nut = await trang.evaluate(() =>
		[...document.querySelectorAll("a,button")]
			.filter((el) => {
				const r = el.getBoundingClientRect();
				return r.width > 0 && r.height > 0;
			})
			.map((el) =>
				`${el.textContent} ${el.getAttribute("aria-label") ?? ""}`
					.replace(/\s+/g, " ")
					.trim(),
			)
			.filter((t) =>
				/(tao|them|new|create|add).{0,20}(workspace|noi lam)|workspace.{0,20}(moi|new)/i.test(
					t,
				),
			),
	);
	await trang.close();
	ra.push(`dieu khien tren man tao workspace: ${nut.length}`);
	return { co: nut.length > 0, vet: ra };
}

async function chanTrangThaiRong(cookie, slug) {
	const doDuoc = [];
	const thieuO = [];

	const trang = await moMan(cookie, slug, "/settings", "vi", RONG);
	const nut = await trang.$('[role="combobox"]');
	if (nut === null) {
		await khongDo(
			"KHONG DO DUOC: tien de thieu — man General khong ve ra dieu khien chon model.",
		);
	}
	const khoa = await nut.evaluate((el) => el.disabled === true);
	if (khoa) {
		await khongDo(
			"KHONG DO DUOC: tien de thieu — dieu khien chon model bi khoa, khong mo duoc o tim.",
			"   Khong voi toi AI Gateway thi khong co danh sach model de go vao.",
		);
	}
	await nut.click();
	await new Promise((r) => setTimeout(r, 800));
	const o = await trang.$('[data-slot="command-input"]');
	if (o === null) {
		await khongDo(
			"KHONG DO DUOC: tien de thieu — bam vao dieu khien chon model ma o tim khong mo ra.",
		);
	}
	await o.type("zzqq-khong-mot-model-nao-khop-chuoi-nay");
	await new Promise((r) => setTimeout(r, 900));
	const rong = await trang.evaluate(() => {
		const el = document.querySelector('[data-slot="command-empty"]');
		if (!el) return null;
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) return null;
		return el.textContent.replace(/\s+/g, " ").trim();
	});
	await trang.close();
	if (rong === null || rong === "") {
		await khongDo(
			"KHONG DO DUOC: tien de thieu — go chuoi khong khop ma man khong ve o trong nao.",
		);
	}
	doDuoc.push({ ten: "khong model nao khop", chu: rong });

	const luong = await coLuongTaoWorkspace(cookie, slug);
	console.log("-- do o thu ba, tren man that:");
	console.log(`   "khong model nao khop" -> ${JSON.stringify(rong)}`);
	console.log(
		`   mang dau tieng Viet: ${DAU_VIET.test(rong) ? "co" : "KHONG"}`,
	);
	console.log("\n-- thu dung hai o dau qua dung luong nguoi dung:");
	for (const d of luong.vet) console.log(`   ${d}`);

	if (!luong.co) {
		thieuO.push("chua co ty gia nao", "chua deal nao co so tien");
	}

	const viet = doDuoc.filter((d) => !DAU_VIET.test(d.chu));
	console.log(
		`\nket qua: do duoc ${doDuoc.length}/3 o · thieu ${thieuO.length} o · o do duoc ma khong co dau tieng Viet: ${viet.length}`,
	);
	if (thieuO.length > 0) {
		console.log(
			`KHONG DO DUOC: tien de thieu — khong dung duoc o: ${thieuO.join(" · ")}.`,
		);
		console.log(
			"   Tien de thieu co ten: kho nay chay MOT workspace duy nhat. Khong thu tuc trpc nao tao workspace,",
		);
		console.log(
			"   va khong dieu khien nao tren man lam viec do. Khong co workspace moi thi khong co man chua co ty gia,",
		);
		console.log("   cung khong co man chua deal nao co so tien.");
		await ket(2);
	}
	await ket(viet.length > 0 ? 1 : 0);
}

async function chanBeRong(cookie, slug) {
	let doDuoc = 0;
	let chiVi = 0;
	let caHai = 0;
	for (const man of MAN) {
		const lay = async (tieng) => {
			const trang = await moMan(cookie, slug, man, tieng, HEP);
			const gia = await trang.evaluate(DO_RONG);
			await trang.close();
			if (gia === null) {
				await khongDo(
					`KHONG DO DUOC: tien de thieu — ${man} khong co khung man de do be rong.`,
				);
			}
			return new Map(gia.map((g) => [g.khoa, g]));
		};
		const vi = await lay("vi");
		const en = await lay("en");
		const nhan = [...vi.keys()].filter((k) => {
			const b = en.get(k);
			return b !== undefined && b.chu !== vi.get(k).chu;
		});
		console.log(
			`\n-- man ${man} o ${HEP}px · phan tu co chu: vi=${vi.size} en=${en.size} · nhan dich duoc=${nhan.length}`,
		);
		doDuoc += nhan.length;
		for (const k of nhan) {
			const a = vi.get(k);
			const b = en.get(k);
			const traVi =
				a.scrollWidth > a.clientWidth || a.scrollHeight > a.clientHeight;
			const traEn =
				b.scrollWidth > b.clientWidth || b.scrollHeight > b.clientHeight;
			if (!traVi && !traEn) continue;
			if (traVi && traEn) {
				caHai += 1;
				console.log(
					`   BO CUC CO SAN (khong tinh vao chan nay): ${JSON.stringify(a.chu)} — vi ${a.scrollWidth}/${a.clientWidth}px, en ${b.scrollWidth}/${b.clientWidth}px — ${k}`,
				);
				continue;
			}
			if (traVi) {
				chiVi += 1;
				console.log(
					`   TRAN: ${JSON.stringify(a.chu)} — ngang ${a.scrollWidth}/${a.clientWidth} · doc ${a.scrollHeight}/${a.clientHeight} · doi chung en ${b.scrollWidth}/${b.clientWidth} vua — ${k}`,
				);
				continue;
			}
			console.log(
				`   DOI CHUNG: ban en tran ma ban vi vua: ${JSON.stringify(b.chu)} — en ${b.scrollWidth}/${b.clientWidth}px — ${k}`,
			);
		}
	}
	if (doDuoc === 0) {
		await khongDo(
			`KHONG DO DUOC: 0 nhan dich duoc o ${HEP}px. Tap quan sat rong khong bao gio la dat.`,
		);
	}
	console.log(
		`\nket qua ${HEP}px: ${doDuoc} nhan dich duoc · vi tran ma en vua=${chiVi} · ca hai cung tran=${caHai} (bao rieng)`,
	);
	await ket(chiVi > 0 ? 1 : 0);
}

const chan = process.argv[2] ?? "";
const CHAN = new Set(["hai-tieng", "trang-thai-rong", "khong-dich", "be-rong"]);
if (!CHAN.has(chan)) {
	console.log(
		`KHONG DO DUOC: chan phai la mot trong: ${[...CHAN].join(" | ")}. Nhan duoc: ${JSON.stringify(chan)}`,
	);
	process.exit(2);
}

const L = lat();
if (L.thieu.length > 0) {
	console.log(
		`KHONG DO DUOC: ban khai lat tro toi duong khong co tren dia: ${L.thieu.join(" · ")}`,
	);
	process.exit(2);
}
if (L.soTuDia === 0) {
	console.log("KHONG DO DUOC: quet thu muc cua lat ra 0 file .tsx.");
	process.exit(2);
}

const cookie = phien();
const slug = await suySlug(cookie);
await canhCong(cookie, slug);

trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: "new",
	args: ["--no-sandbox", `--window-size=${RONG},${CAO}`],
});

console.log(
	`-- kho ${GOC} · workspace "${slug}" · hai man ${MAN.join(" ")} · ${L.file.length} file trong lat`,
);

if (chan === "hai-tieng") await chanHaiTieng(cookie, slug);
if (chan === "khong-dich") await chanKhongDich(cookie, slug);
if (chan === "trang-thai-rong") await chanTrangThaiRong(cookie, slug);
if (chan === "be-rong") await chanBeRong(cookie, slug);

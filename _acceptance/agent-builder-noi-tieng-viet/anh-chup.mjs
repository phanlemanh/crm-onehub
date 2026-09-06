import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import {
	canhCong,
	datTrinhDuyet,
	moManMem,
	phien,
	suySlug,
} from "../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const RA = join(HERE, "evidence");
mkdirSync(RA, { recursive: true });

const BUOC = [
	{ ten: "E1-01-agents-vi", man: "/agents", tieng: "vi", rong: 1280, ke: "Màn Tác nhân của đội, lượt vi — khung, thanh bên, và câu rỗng của đội" },
	{ ten: "E1-02-agents-en", man: "/agents", tieng: "en", rong: 1280, ke: "Cùng màn, lượt en — đối chứng dương cho phép so từng cặp" },
	{ ten: "E1-03-chat-vi", man: "/chat", tieng: "vi", rong: 1280, ke: "Màn Hội thoại, lượt vi — khung tiếng Việt bọc ô soạn còn tiếng Anh của đợt hai" },
	{ ten: "E1-04-chat-en", man: "/chat", tieng: "en", rong: 1280, ke: "Cùng màn, lượt en" },
	{ ten: "E6-05-trang-thai-rong", man: "/agents", tieng: "vi", rong: 1280, ke: "Hai ô trạng thái đo được: câu rỗng của đội và câu rỗng của thanh bên" },
	{ ten: "E12-06-agents-vi-360", man: "/agents", tieng: "vi", rong: 360, ke: "Cùng màn ở bề rộng 360px, lượt vi" },
	{ ten: "E12-07-agents-en-360", man: "/agents", tieng: "en", rong: 360, ke: "Cùng màn ở 360px, lượt en" },
	{ ten: "E1-08-route-can-ban-ghi", man: "/agents/khong-co-that-0", tieng: "vi", rong: 1280, ke: "Route khai là cần một bản ghi thật, mở bằng một định danh không có thật" },
];

const cookie = phien();
const slug = await suySlug(cookie);
await canhCong(cookie, slug);
datTrinhDuyet(
	await puppeteer.launch({
		executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		headless: "new",
		args: ["--no-sandbox", "--window-size=1280,900"],
	}),
);

for (const b of BUOC) {
	const mo = await moManMem(cookie, slug, b.man, b.tieng, b.rong, 5000);
	const duong = `${RA}/${b.ten}.png`;
	await mo.trang.screenshot({ path: duong, fullPage: false });
	await mo.trang.close();
	console.log(`${b.ten}.png · ${b.man} (${b.tieng}, ${b.rong}px) — ${b.ke}${mo.loi === null ? "" : ` · ${mo.loi[0]}`}`);
}
process.exit(0);

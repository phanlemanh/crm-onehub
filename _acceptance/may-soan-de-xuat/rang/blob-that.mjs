import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const KIEU_DOCX =
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const BIEN = "KHO_TAI_LIEU_BLOB_TOKEN";

function tokenThat() {
	if (process.env[BIEN]?.trim()) return process.env[BIEN].trim();
	const tep = process.env.BLOB_THAT_ENV ?? join(GOC, ".env");
	const van = existsSync(tep) ? readFileSync(tep, "utf8") : "";
	const dong = van.split("\n").find((d) => d.startsWith(`${BIEN}=`));
	return dong?.split("=").slice(1).join("=").replace(/"/g, "").trim() ?? "";
}

const token = tokenThat();
if (!token) {
	console.log(`KHONG DO DUOC: thieu ${BIEN} that`);
	process.exit(2);
}

const bam = (b) => createHash("sha256").update(b).digest("hex");

const { docxNho } = await import(
	"../../../apps/api/test/tai-lieu-nguon-mau.ts"
);
const { db } = await import("../../../packages/db/src/index.ts");
const { moDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");

const APP = process.env.APP_URL ?? "http://localhost:3000";
const d = await moDo();
const byte = docxNho(`blob-that ${Date.now()}`);
let pathname = "";
const hong = [];
const dat = (n, dung, cau) => {
	console.log(`buoc ${n}: ${dung ? "dat" : cau}`);
	if (!dung) hong.push(`buoc ${n}: ${cau}`);
	return dung;
};

try {
	const u = await d.nguoiMoi("blob", "member", "Người tải nguồn");
	const cho = await d.lam(u.cookie, "taiLieuNguon.xinCho", {
		tenTep: "blob-that.docx",
		kieu: "docx",
		kichThuoc: byte.length,
	});
	pathname = cho.pathname;
	const put = await fetch(cho.url, {
		method: "PUT",
		headers: { Origin: APP, "content-type": KIEU_DOCX },
		body: byte,
	});
	dat(
		1,
		put.ok,
		`PUT vao URL ky tra ${put.status}: ${(await put.text()).slice(0, 200)}`,
	);

	const nhan = await d.lam(u.cookie, "taiLieuNguon.nhan", {
		pathname,
		phieu: cho.phieu,
		tenTep: "blob-that.docx",
		dich: {
			loai: "moi",
			ten: `Nguồn thật ${Date.now()}`,
			loaiTrang: "quy-dinh",
			chuTrangId: u.id,
		},
	});
	const hang = await db.taiLieuNguon.findUniqueOrThrow({
		where: { id: nhan.nguonId },
		select: { sha256: true },
	});
	dat(
		2,
		hang.sha256 === bam(byte),
		`sha256 hang ${hang.sha256} != tep ${bam(byte)}`,
	);

	const ve = await d.lam(u.cookie, "taiLieuNguon.taiVe", { id: nhan.nguonId });
	const get = await fetch(ve.url);
	const layVe = new Uint8Array(await get.arrayBuffer());
	dat(
		3,
		get.ok && bam(layVe) === bam(byte),
		`GET URL ky tra ${get.status}, bam ${bam(layVe)}`,
	);

	const tran = ve.url.split("?")[0];
	const khongKy = await fetch(tran);
	dat(4, khongKy.status !== 200, "blob doc duoc khong ky");
} catch (e) {
	hong.push(`loi: ${e instanceof Error ? e.message : String(e)}`);
	console.log(hong.at(-1));
} finally {
	if (pathname) {
		const tuDb = createRequire(join(GOC, "packages", "db", "package.json"));
		const { del } = await import(tuDb.resolve("@vercel/blob"));
		await del(pathname, { token }).catch((e) =>
			console.log(
				`canh bao: khong don duoc tep thu ${pathname}: ${e instanceof Error ? e.message : String(e)}`,
			),
		);
	}
	await db.$disconnect();
}
process.exit(hong.length === 0 ? 0 : 1);

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { REST_BRIDGE_PATH } from "../../apps/api/src/trpc/openapi.ts";
import { docDuLieu } from "../../apps/app/lib/lo-trinh/doc-du-lieu.js";
import {
	BAN_CHUP_LO_TRINH,
	banChupRa,
	banChupVao,
} from "../../packages/validation/src/ban-chup-lo-trinh.ts";

export const DUONG_DAY = `${REST_BRIDGE_PATH}${BAN_CHUP_LO_TRINH.duongRest}`;
export const TIEU_DE_GHI_CHU = "ban-chup-lo-trinh";
const TEP = "LO-TRINH.html";

type GoiMang = (
	url: string | URL | Request,
	init?: RequestInit,
) => Promise<Response>;

export type DauVaoDay = {
	goc: string;
	env: Record<string, string | undefined>;
	fetch: GoiMang;
	sha: string;
	commitLuc: string;
	in: (dong: string) => void;
	loi: (dong: string) => void;
};

function tomTatLoi(than: string): string {
	try {
		const loi: {
			message?: string;
			issues?: { path?: (string | number)[]; message?: string }[];
		} = JSON.parse(than);
		const cho = (loi.issues ?? []).map(
			(i) => `${(i.path ?? []).join(".")}: ${i.message ?? ""}`,
		);
		return cho.length > 0
			? cho.join(" · ")
			: (loi.message ?? than.slice(0, 2000));
	} catch {
		return than.slice(0, 2000);
	}
}

const ghiChu = (ketQua: string) =>
	`::notice title=${TIEU_DE_GHI_CHU}::${ketQua}`;

export async function day(o: DauVaoDay): Promise<0 | 1> {
	const urlApi = o.env.CRM_API_URL?.trim();
	const khoa = o.env.CRM_KHOA_DAY_LO_TRINH?.trim();
	if (!urlApi || !khoa) {
		o.in(ghiChu("chua-cai"));
		o.in("Chưa đặt CRM_API_URL hoặc CRM_KHOA_DAY_LO_TRINH — bỏ qua lượt đẩy.");
		return 0;
	}
	const tep = path.join(o.goc, TEP);
	if (!existsSync(tep)) {
		o.loi(`Không có ${TEP} ở ${o.goc}.`);
		return 1;
	}
	const { duLieu, canhBao } = docDuLieu(readFileSync(tep, "utf8"));
	if (duLieu === null) {
		o.loi(`Không đọc được khối lộ trình: ${canhBao.join(" · ")}`);
		return 1;
	}
	const vao = banChupVao.safeParse({
		nguon: BAN_CHUP_LO_TRINH.nguonCrm,
		sha: o.sha,
		commitLuc: o.commitLuc,
		duLieu,
		canhBao,
	});
	if (!vao.success) {
		const loi = vao.error.issues[0];
		o.loi(
			`Khối lộ trình lệch khuôn ở ${(loi?.path ?? []).join(".")}: ${loi?.message ?? ""}`,
		);
		return 1;
	}
	let traLoi: Response;
	try {
		traLoi = await o.fetch(new URL(DUONG_DAY, urlApi).toString(), {
			method: "POST",
			headers: { "content-type": "application/json", "x-api-key": khoa },
			body: JSON.stringify(vao.data),
		});
	} catch (loi) {
		o.loi(
			`Không gọi được CRM: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
		return 1;
	}
	const than = await traLoi.text();
	if (!traLoi.ok) {
		o.loi(`CRM từ chối (${traLoi.status}): ${tomTatLoi(than)}`);
		return 1;
	}
	const ra = banChupRa.safeParse(JSON.parse(than));
	if (!ra.success) {
		o.loi(`CRM trả lời lệch khuôn: ${than.slice(0, 2000)}`);
		return 1;
	}
	o.in(ghiChu(ra.data.ketQua));
	o.in(`Bản chụp ${o.sha.slice(0, 9)}: ${ra.data.ketQua}`);
	return 0;
}

if (import.meta.main) {
	const goc = path.resolve(import.meta.dir, "..", "..");
	const git = (...thamSo: string[]) =>
		spawnSync("git", thamSo, { cwd: goc, encoding: "utf8" }).stdout.trim();
	const sha = git("rev-parse", "HEAD");
	const ma = await day({
		goc,
		env: process.env,
		fetch,
		sha,
		commitLuc: git("log", "-1", "--format=%cI", sha),
		in: (dong) => console.log(dong),
		loi: (dong) => console.error(dong),
	});
	process.exit(ma);
}

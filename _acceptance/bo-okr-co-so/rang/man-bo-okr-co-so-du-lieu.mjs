import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { OKR_MAU } from "../../../apps/api/scripts/okr-mau/cau-hinh.ts";
import { SEARCH_PARAM } from "../../../apps/app/lib/search-param-keys.ts";
import { db } from "../../../packages/db/src/index.ts";
import {
	khongDo,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	GOC,
	phienCua,
	trpcCua,
} from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";

const HO_SO = "bo-okr-co-so";
const DA_THONG_CONG = new Set(["signed-off", "machine-cleared"]);
const trangThaiHopDong = (
	readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8").match(
		/^status:\s*(\S+)/m,
	)?.[1] ?? ""
).trim();
export const BANG_CHUNG =
	process.env.BANG_CHUNG ??
	(process.env.BCO_CHEP_ANH === "1" || !DA_THONG_CONG.has(trangThaiHopDong)
		? join(GOC, "_acceptance", HO_SO, "evidence")
		: join(GOC, ".acceptance-runs", HO_SO, "evidence"));

const GIAY_MS = 1000;
export const DO = {
	kho: {
		rong: { ten: "1440", rong: 1440, cao: 900 },
		hep: { ten: "375", rong: 375, cao: 812 },
	},
	cho: {
		taiMs: 60 * GIAY_MS,
		onDinhMs: 1500,
		nhipMs: 250,
		cuonMs: 300,
	},
	cuon: { soLan: 12, lePx: 40 },
	tab: { toiDa: 200 },
	lechPx: 1,
};
export const AN_CONG_CU_DEV =
	".tsqd-parent-container, .tsqd-open-btn-container, nextjs-portal { display: none !important; }";
export const MOI_EVAL = ["E1", "E6", "E8", "E11", "E12"];
export const THAM = {
	ky: SEARCH_PARAM.okr.ky,
	don: SEARCH_PARAM.okr.don,
	gap: "gap",
};
export const NHAN = [
	"Ngày còn lại",
	"Tiến độ",
	"KR đã cập nhật tuần này",
	"KR tự tin thấp",
];
export const NUT = { gap: "Gập tất cả", mo: "Mở tất cả" };
const TIEN_TO = "Đo bco ·";

export const nghi = (ms) => new Promise((xong) => setTimeout(xong, ms));
const thuMau = (ma) => `${ma}@${OKR_MAU.mienThu}`;
export const donTuKhoa = (k) => {
	if (k === "goc") return { loai: "goc" };
	const [loai, id] = k.split(":");
	return { loai, id };
};

function napBoMau() {
	const nap = spawnSync("bun", ["scripts/okr-mau.ts"], {
		cwd: join(GOC, "apps", "api"),
		env: process.env,
		encoding: "utf8",
	});
	const cuoi = `${nap.stdout ?? ""}${nap.stderr ?? ""}`
		.trim()
		.split("\n")
		.at(-1);
	console.log(`nap bo OKR mau: ma ${nap.status} — ${cuoi}`);
	return nap.status === 0;
}

function chonMau() {
	const congTy = JSON.parse(
		readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
	);
	const bpCoCon = congTy.boPhan.find((b) =>
		congTy.phongBan.some((p) => p.boPhan === b.ma),
	);
	const pbMau =
		congTy.phongBan.find((p) => p.boPhan === bpCoCon?.ma) ?? congTy.phongBan[0];
	return { pbMau, bpMau: bpCoCon, truong: pbMau.truong };
}

async function gieoCapNhatThap(api, ky, pb) {
	const kr = await db.okrKeyResult.findFirst({
		where: {
			objective: { cycleId: ky, departmentId: pb.id, status: "cong-bo" },
			kind: { not: "moc" },
		},
		orderBy: [{ objective: { position: "asc" } }, { position: "asc" }],
		select: { id: true, currentValue: true },
	});
	if (!kr)
		await khongDo(`KHONG DO DUOC: ${pb.name} khong co KR so de cap nhat`);
	const { sessionId } = await api.lam("okr.moCapNhat", { entry: "tab" });
	await api.lam("okr.guiCapNhat", {
		sessionId,
		items: [
			{
				keyResultId: kr.id,
				value: Number(kr.currentValue),
				confidence: "thap",
				note: `${TIEN_TO} tự tin thấp`,
			},
		],
	});
}

async function gieoMucTieu(api, ky, pb, chu) {
	const tao = async (tieuDe, soKr) => {
		const { id } = await api.lam("okr.createObjective", {
			cycleId: ky,
			unit: { level: "phong-ban", departmentId: pb.id },
			title: `${TIEN_TO} ${tieuDe}`,
			kind: "cam-ket",
			ownerUserId: chu,
			participantIds: [],
			whyNow: "",
		});
		for (let i = 0; i < soKr; i += 1)
			await api.lam("okr.createKeyResult", {
				objectiveId: id,
				title: `${TIEN_TO} KR ${i + 1}`,
				kind: "tang-toi",
				ownerUserId: chu,
				startValue: 0,
				targetValue: 100,
				currentValue: 10,
				unit: "",
				dueOn: null,
				weight: 1,
			});
		return id;
	};
	const daBo = await tao("mục tiêu sẽ bỏ", 2);
	await api.lam("okr.publishObjective", { id: daBo });
	await api.lam("okr.dropObjective", { id: daBo });
	const khongKr = await tao("mục tiêu chưa có KR", 0);
	return { daBo, khongKr };
}

export async function dungDuLieu() {
	if (!napBoMau()) await khongDo("KHONG DO DUOC: nap bo OKR mau that bai");
	const mau = chonMau();
	if (!mau.bpMau)
		await khongDo("KHONG DO DUOC: bo mau khong co bo phan co phong ban con");
	const ck = phienCua(thuMau(mau.truong));
	const api = trpcCua(ck);
	const nguoiXem = await db.user.findUniqueOrThrow({
		where: { email: thuMau(mau.truong) },
		select: { id: true },
	});
	const cay = await api.hoi("org.tree");
	const bp = cay.divisions.find((b) => b.name === mau.bpMau.ten);
	const pb = bp?.departments.find((p) => p.name === mau.pbMau.ten);
	if (!bp || !pb || pb.head?.id !== nguoiXem.id)
		await khongDo(
			`KHONG DO DUOC: cay khong co ${mau.pbMau.ten} do ${mau.truong} dan trong ${mau.bpMau.ten}`,
		);
	const chuKy = await api.hoi("okr.cycles");
	const ky = chuKy.cycles.find((c) => c.id === chuKy.currentId);
	if (!ky) await khongDo("KHONG DO DUOC: bo mau khong co chu ky hien tai");
	await gieoCapNhatThap(api, ky.id, pb);
	const gieo = await gieoMucTieu(api, ky.id, pb, nguoiXem.id);
	const slug = await suySlug(ck);
	console.log(
		`du lieu: nguoi xem ${mau.truong} (truong ${pb.name}, thuoc ${bp.name}) · ky ${ky.name} ${ky.startsOn}..${ky.endsOn} · gieo 1 cap nhat tu tin thap, 1 muc tieu da bo, 1 muc tieu khong KR`,
	);
	return {
		ck,
		api,
		slug,
		ky,
		bp,
		pb,
		gieo,
		nguoiXem: nguoiXem.id,
		bo: ["goc", `bp:${bp.id}`, `pb:${pb.id}`, `nguoi:${nguoiXem.id}`],
	};
}

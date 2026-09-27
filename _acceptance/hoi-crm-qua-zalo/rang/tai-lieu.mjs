import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "../../..");
const TRUOC_VONG = "40d423bb686da7d554d7f5b3bd914e818d9ec455";
const TRANG_THAI = [
	"chưa mở",
	"chờ điều kiện",
	"Cổng Đáng",
	"Cổng Phạm vi",
	"đang dựng",
	"Cổng Bằng chứng",
	"đã lên `onehub`",
	"đang triển khai",
	"Cổng Giá trị",
	"xong",
];
const LUAT_4 = "4. Into an outside chat channel";
const BA_THU_CAM = ["phone", "verbatim", "AppSetting"];
const KENH_ZALO_TRO_LY = "hỏi qua bot";

function doc(duong) {
	return readFileSync(resolve(GOC, duong), "utf8");
}

function muc(tuDien, ten) {
	const dau = tuDien.indexOf(`**${ten}**:`);
	if (dau === -1) return "";
	const cuoi = tuDien.indexOf("_Avoid_", dau);
	return tuDien.slice(dau, cuoi === -1 ? undefined : cuoi);
}

function dongLoTrinh(loTrinh) {
	return (
		loTrinh
			.split("\n")
			.findLast((d) => d.startsWith("| 4 | `hoi-crm-qua-zalo`")) ?? ""
	);
}

function luat4(vanBan) {
	const dau = vanBan.indexOf(LUAT_4);
	return dau === -1 ? "" : vanBan.slice(dau, dau + 600);
}

function kiemTaiLieu() {
	const agent = doc("docs/agent.md");
	const ranh = doc("apps/agent/agent/skills/data-boundaries.md");
	const tuDien = doc("CONTEXT.md");
	const dong = dongLoTrinh(doc("docs/plan/lo-trinh-zalo.md"));
	const trangThai = dong.split("|")[3]?.trim() ?? "";
	const botZalo = muc(tuDien, "Bot Zalo");
	return [
		["agent.md luat 4", BA_THU_CAM.every((t) => luat4(agent).includes(t))],
		["agent.md doan hoi Zalo", agent.includes("ZaloHoi")],
		[
			"data-boundaries.md luat 4",
			BA_THU_CAM.every((t) => luat4(ranh).includes(t)),
		],
		[
			"CONTEXT.md Bot Zalo",
			botZalo.includes("trợ lý AI") && botZalo.includes("quyền"),
		],
		[
			"CONTEXT.md Tro ly AI",
			muc(tuDien, "Trợ lý AI").includes(KENH_ZALO_TRO_LY),
		],
		[
			"lo-trinh muc 7 dong 4",
			TRANG_THAI.includes(trangThai) && trangThai !== "chờ điều kiện",
		],
		[
			"telemetry.md zalo_questions",
			doc("docs/telemetry.md").includes("zalo_questions"),
		],
	];
}

function kiemMergeBase() {
	let mb;
	try {
		mb = execFileSync(
			"git",
			["-C", GOC, "rev-parse", "--verify", `${TRUOC_VONG}^{commit}`],
			{
				encoding: "utf8",
				stdio: ["ignore", "pipe", "ignore"],
			},
		).trim();
	} catch {
		return null;
	}
	const cu = (duong) =>
		execFileSync("git", ["-C", GOC, "show", `${mb}:${duong}`], {
			encoding: "utf8",
		});
	return [
		"merge-base khong co",
		luat4(cu("docs/agent.md")) === "" &&
			!muc(cu("CONTEXT.md"), "Trợ lý AI").includes(KENH_ZALO_TRO_LY),
	];
}

const ket = kiemTaiLieu();
const mb = kiemMergeBase();
if (mb) ket.push(mb);
else console.log("bo-qua: merge-base");
for (const [ten, dat] of ket) {
	if (!dat) {
		console.log(`do: ${ten}`);
		process.exit(1);
	}
	console.log(`ok: ${ten}`);
}

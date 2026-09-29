import { existsSync, readFileSync, writeFileSync } from "node:fs";

export const HIEU_CHINH = {
	soCap: 20,
	cotNguoi: "Chủ kho",
	tachO: /(?<!\\)\|/,
};

const oBang = (chu) =>
	`${chu ?? ""}`.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

export function oDaCham(chu) {
	const dong = chu.split("\n").filter((d) => d.trim().startsWith("|"));
	const dau = dong.find((d) => d.includes(HIEU_CHINH.cotNguoi));
	if (!dau) return [];
	const cot = dau
		.split(HIEU_CHINH.tachO)
		.findIndex((o) => o.includes(HIEU_CHINH.cotNguoi));
	return dong
		.filter((d) => /^\|\s*\d+\s*\|/.test(d))
		.map((d) => d.split(HIEU_CHINH.tachO)[cot]?.trim() ?? "")
		.filter((o) => o !== "");
}

function noiDung({ cap, judge, soCa, moHinh, luc }) {
	const chon = cap.slice(0, HIEU_CHINH.soCap);
	const dong = chon.map(
		(c, i) =>
			`| ${i + 1} | ${c.ca} | ${c.truong} | ${oBang(c.truoc)} | ${oBang(c.sau)} | ${c.diem === null ? "—" : c.diem.toFixed(2)} | |`,
	);
	const thieu =
		chon.length < HIEU_CHINH.soCap
			? `\nChỉ có ${chon.length} cặp viết lại trong lượt này — thiếu ${HIEU_CHINH.soCap - chon.length} cặp so với ${HIEU_CHINH.soCap}.\n`
			: "";
	return {
		soCap: chon.length,
		chu: [
			"# Hiệu chỉnh judge — bộ Viết lại (E22 → E25)",
			"",
			`Sinh bởi \`bun _acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs\` lúc ${luc}, ${soCa} ca bộ Viết lại, judge \`${moHinh}\` có ZDR, điểm judge trung bình ${judge === null ? "—" : judge.toFixed(2)}.`,
			"",
			"Ba ý chấm (judge và chủ kho chấm cùng ba ý):",
			"",
			"1. Nói kết quả, không nói việc làm — tên Mục tiêu viết bằng chữ, không mang con số hay tên chỉ số; tên KR gọi tên thứ được đo, không kết bằng cụm mơ hồ như «đạt kết quả tốt».",
			"2. Giữ ý người viết — không đổi sang mục tiêu khác, không thêm ý nội dung gốc không có («hàng đầu», «được tin cậy»).",
			"3. Trả lời theo ngôn ngữ chiếm đa số của nội dung.",
			"",
			"Chủ kho điền cột cuối bằng «Đạt» hoặc «Không đạt» cho từng cặp. Judge Đạt khi điểm bằng 1. Khớp là khi chấm của chủ kho trùng judge; E25 đạt khi khớp ≥ 85% và điểm judge trung bình ≥ 0,7.",
			thieu,
			`| # | Ca | Trường | Gốc | Đề xuất | Judge | ${HIEU_CHINH.cotNguoi} (Đạt/Không đạt) |`,
			"| --- | --- | --- | --- | --- | --- | --- |",
			...dong,
			"",
		].join("\n"),
	};
}

export function ghiHieuChinh({ tep, cap, judge, soCa, moHinh, runId }) {
	const luc = new Date().toISOString();
	const { soCap, chu } = noiDung({ cap, judge, soCa, moHinh, luc });
	const daCham = existsSync(tep) ? oDaCham(readFileSync(tep, "utf8")) : [];
	if (daCham.length === 0) {
		writeFileSync(tep, chu);
		return { tep, soCap, giu: false };
	}
	const moi = tep.replace(/\.md$/, `.${runId}.md`);
	writeFileSync(moi, chu);
	return { tep: moi, soCap, giu: true, daCham: daCham.length };
}

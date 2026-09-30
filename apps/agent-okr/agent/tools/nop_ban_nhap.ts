import { banNhap } from "@crm/validation/okr-cuoc-soan";
import { defineTool } from "eve/tools";
import { nopBanNhap } from "../lib/nop-ban-nhap";

export default defineTool({
	description:
		"Submit the whole OKR draft of this session: 2–4 Mục tiêu, each with 2–4 KR (kieu, donVi, optional khoiDiemGoiY from the data only, never a target) and optional canChinhId from ungVienCanChinh. Resubmit the whole draft after every edit, keeping the khoa of unchanged lines. Answers with the lines that were dropped and their code; never resubmit a line answered da-bac.",
	inputSchema: banNhap,
	execute: (input, ctx) => nopBanNhap(input, ctx),
});

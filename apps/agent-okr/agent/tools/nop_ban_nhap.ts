import { BAN_NHAP_TRAN, banNhap } from "@crm/validation/okr-cuoc-soan";
import { defineTool } from "eve/tools";
import { ketQuaNop, nopBanNhap } from "../lib/nop-ban-nhap";

const khoang = (k: { min: number; max: number }) => `${k.min}–${k.max}`;

export default defineTool({
	description: `Submit the whole OKR draft of this session: ${khoang(BAN_NHAP_TRAN.mucTieu)} Mục tiêu, each with ${khoang(BAN_NHAP_TRAN.kr)} KR (kieu, donVi, optional khoiDiemGoiY from the data only, never a target) and optional canChinhId from ungVienCanChinh. Resubmit the whole draft after every edit, keeping the khoa of unchanged lines. Answers with the lines that were dropped, their code and in viPham what offended, such as «số mới: 2031»; fix those lines and resubmit the whole draft in the same turn, leaving out any line answered da-bac. Lines in giuNguyen are already decided on the board and keep their stored khoa; da-quyet-khac-ten means a decided line cannot be changed by chat.`,
	inputSchema: banNhap,
	outputSchema: ketQuaNop,
	execute: (input, ctx) => nopBanNhap(input, ctx),
});

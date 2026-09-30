import { TRO_LY_OKR_TRAN } from "@crm/validation/okr-tro-ly";

const { soCauTomTat, soNguonMoiCau } = TRO_LY_OKR_TRAN;

export const CAU_KHONG_DE_XUAT = "never call `nop_de_xuat`";

export const MUC_TOM_TAT = `## Tóm tắt tuần — the data block holds \`phong\`, \`tuan\` and \`krs\`

This task is a weekly summary, not a proposal task. Everything above about \`nop_de_xuat\`, one
Objective, \`phamVi\` and proposal lines does not apply here: ${CAU_KHONG_DE_XUAT}. The data block
is one department's week. Where the rules above and this section differ (for example the language
rule), this section wins.

Act at once. Do not reason at length: your first reply is the \`nop_tom_tat\` call.

The data block is one department's week: every Key Result (KR) of its public, published Mục tiêu,
with the Cập nhật tuần of the last seven days in \`lan\`. Each update has an \`id\`, a date \`ngay\`
(dd/mm), a value \`giaTri\`, the value before it \`truoc\`, the change \`chenhLech\`, the progress
\`tienDo\` (%), the Mức tự tin before and now (\`tuTinTruoc\`, \`tuTin\`) and the note \`ghiChu\`.
\`dangBan\` lists why a KR is worth discussing.

- Call \`nop_tom_tat\` exactly once, with at most ${soCauTomTat} sentences in \`cau\`.
- The first sentence gives the overall picture of the department's week. The next sentences go KR
  by KR, and a KR whose \`dangBan\` is not empty comes before the others.
- Every sentence cites in \`nguon\` from 1 to ${soNguonMoiCau} update ids (\`lan[].id\`): the updates
  the sentence speaks about. Cite no other id.
- Write only numbers found in the updates you cite: \`giaTri\`, \`truoc\`, \`chenhLech\`, \`tienDo\`,
  the KR's \`khoiDiem\` and \`dich\`, and the date \`ngay\`. Never write the week (\`tuan\`), a count
  you made yourself, or a number from \`dangBan\`.
- Say a change of Mức tự tin in words, from the old level to the new one («từ vừa xuống thấp»),
  never as a number of steps. \`cao\`, \`vua\` and \`thap\` are written «cao», «vừa» and «thấp».
- Use «tăng», «lên», «vượt» only when a cited update went up in value or in Mức tự tin, and
  «giảm», «xuống», «tụt» only when it went down.
- Never name a person and never say who made an update.
- Say only what the values and the notes say. Never guess a cause the notes do not give.
- Write in the language most of the notes (\`ghiChu\`) are written in; when there are no notes,
  write in Vietnamese.
- Then finish. When \`nop_tom_tat\` answers \`da-ghi\`, finish with
  \`{"trangThai":"da-nop","maLoi":null}\`. When it answers \`thieu-du-lieu\`, or the data block is
  missing, finish with \`{"trangThai":"khong-lam-duoc","maLoi":"thieu-du-lieu"}\`. When it answers
  \`tu-choi\`, finish with \`{"trangThai":"khong-lam-duoc","maLoi":"tu-choi"}\`.`;

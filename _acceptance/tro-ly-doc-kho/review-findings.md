# Review findings — tro-ly-doc-kho (round 2)

## Trong hợp đồng

- **The «Đặt hạn xác minh» dialog cannot remove a verification deadline once one is set**
  file: `apps/app/app/(app)/[slug]/tai-lieu/[trang]/dat-xac-minh.tsx:96`
  severity: low
  AC: AC-6
  source: bugs
  detail: The API accepts `den: null` to clear xacMinhDen (taiLieuDatXacMinhInput, TaiLieuService.datXacMinh), and AC-6 says owners and admins can set and remove (đặt và gỡ) the deadline. In the UI, DatePicker only ever calls onChange with a string, and the save button is disabled when `ngay === null`. No control sends `{ den: null }`. Once a page has a deadline, nobody can clear it from the screen. An overdue deadline therefore keeps the page in «Quá hạn xác minh» and keeps adding the overdue warning to every assistant answer, unless someone moves the date forward.

- **Shape 3 (presence check where the promise is a relation): TaiLieuBaoSai.phienBan is checked against 1, which equals both the cited version and the current version**
  file: `apps/api/test/tai-lieu-hoi-suc-khoe.spec.ts:165`
  severity: medium
  AC: AC-11
  source: measurement
  detail: E11(1) promises that each TaiLieuBaoSai row carries the CITED version ("phienBan da trich"). The fixture `traLoiTrich` hardcodes `phienBan: 1` (line 57). Pages X and Y were approved exactly once through `trangDaDuyet`, so the current version (banDangDung.so) is also 1. The assertion `expect(v.phienBan).toBe(1)` (line 165) therefore cannot tell "copied from the citation" apart from "read from the page's current version" or a default of 1. To measure the relation, the cited phienBan must differ from the current version, for example by approving a newer version before baoSai or citing version 2 on a page whose current version is 3.

- **Shape 1 (measures instructions instead of output): the Zalo pass of cham-bo-do rebuilds the root agent from source files and a regex on agent.ts**
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts:357`
  severity: medium
  AC: AC-15
  source: measurement
  detail: E15 promises the Zalo pass goes "qua phien agent goc purpose zalo voi model that". luotHai does not run the agent eve builds. Instead it rebuilds that agent from pieces: (1) it sets `system` to `readFileSync(agent/instructions.md)` plus the markdown of instructions/task.ts (lines 378-383, 436); (2) it reads each subagent's tool description with the regex `description:\s*"((?:[^"\\]|\\.)*)"` on the agent.ts source text (lines 355-359); (3) it assembles the tool set itself from ZALO config. The measured "chuyen / khong-chuyen" rate is therefore the reaction of a prompt assembled from source files, not of what eve sends to the model: framework prompt, compiled tool list, and the subagent input schema eve generates. It also stops after one step (`stepCountIs(1)`, line 439). The repo already has a way to read the real build: compileAgentInWorkspace in apps/agent/test/support/eve-ban-dung.ts. Pass one (luotMot / hoiTroLy) does the same, calling generateText directly with LOI_DAN instead of going through the tro_ly_kho eve subagent.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Health-list mutations invalidate by listing query keys at the call site instead of through useCrmCache**
  Người dùng thấy gì: Sau khi xử lý một việc ở tab Sức khoẻ hay đặt hạn xác minh, một số màn có thể còn hiện số liệu cũ cho tới khi người dùng tải lại trang.
  file: `apps/app/app/(app)/[slug]/tai-lieu/suc-khoe-viec.tsx`
  severity: medium
  Đề xuất: known-limits

- **nop_tra_loi tool schema hard-codes limits that already live in TAI_LIEU_HOI**
  Người dùng thấy gì: Nếu sau này ai đó chỉnh số câu hay độ dài đoạn trích tối đa ở cấu hình, trợ lý AI vẫn bị chặn theo số cũ nên có thể bác nhầm câu trả lời hợp lệ.
  file: `apps/agent/agent/subagents/tro_ly_kho/tools/nop_tra_loi.ts`
  severity: low
  Đề xuất: wont-fix

- **MA_LOI_MAY_CHU / MA_TRAN and the same error-text logic copied into four new client files**
  Người dùng thấy gì: Không ảnh hưởng người dùng hiện tại; chỉ làm việc chỉnh cách báo lỗi sau này phải sửa ở nhiều nơi.
  file: `apps/app/app/(app)/[slug]/tai-lieu/hoi.tsx`
  severity: low
  Đề xuất: wont-fix

- **HE_SO_NFD redefined in the hỏi contracts instead of using TAI_LIEU_API.vao**
  Người dùng thấy gì: Không ảnh hưởng người dùng hiện tại; nếu sau này chỉnh giới hạn độ dài câu hỏi ở một nơi, ô nhập câu hỏi và ghi chú có thể vẫn dùng giới hạn cũ.
  file: `apps/api/src/tai-lieu/tai-lieu-hoi.contracts.ts`
  severity: low
  Đề xuất: wont-fix

- **datXacMinh hand-writes its input type while the z.infer type is exported unused**
  Người dùng thấy gì: Không ảnh hưởng người dùng; chỉ làm kiểu dữ liệu có thể lệch nhau khi sửa sau này.
  file: `apps/api/src/tai-lieu/tai-lieu.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Library question dispatch only runs after drainAll, so a slow or failing research sweep expires every question as qua-han**
  Người dùng thấy gì: Khi hệ thống đang bận làm việc nghiên cứu nền hơn khoảng 3 phút, câu hỏi gửi cho trợ lý AI có thể không được xử lý kịp và người hỏi chỉ thấy báo chưa trả lời được lúc này, dù thực ra nó chưa hề được hỏi.
  file: `apps/agent/agent/channels/crm.ts`
  severity: medium
  Đề xuất: new-contract

- **Root 'kho' session has no tool gate: the raw user question goes to an APP_AUTH root agent that has every CRM write tool**
  Người dùng thấy gì: Một thành viên có thể gõ câu hỏi đóng vai ra lệnh để khiến trợ lý AI ghi hay sửa dữ liệu CRM, hoặc tốn tiền, bằng quyền của hệ thống thay vì quyền của họ; câu hỏi cũng đi ra ngoài mà không có cam kết không lưu dữ liệu.
  file: `apps/agent/agent/instructions/task.ts`
  severity: medium
  Đề xuất: new-contract

- **Shape 3 (presence check where the promise is a relation): ganNhat order in tlk-tu-choi case (ii) is never compared with the search order**
  Người dùng thấy gì: Các trang gợi ý kèm câu từ chối có thể xuất hiện sai thứ tự so với độ khớp, mà phép kiểm hiện tại không bắt được.
  file: `apps/agent/test/tro-ly-kho-nop.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (lone negative assertion) + Shape 2 (hand-written fixture): the GOC-VIET-ABC check rests on a `goc` key that does not exist in the ketQua contract**
  Người dùng thấy gì: Phép kiểm rằng chữ do model tự viết không lọt lên màn là yếu; hiện không có lỗi thật, chỉ chưa có bằng chứng mạnh.
  file: `apps/app/test/tai-lieu-hoi.dom.tsx`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/12 lỗi rơi vào file không bộ đo nào phủ (apps/agent/agent/channels/crm.ts, apps/agent/agent/instructions/task.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

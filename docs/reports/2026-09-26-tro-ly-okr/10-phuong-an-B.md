# 10 — Phương án B: nền tảng tính năng AI khai báo

Viết 2026-09-26. Góc nhìn B: mọi tính năng AI của OneHub (OKR trước, rồi CRM, rồi
phòng ban khác) là **một bản khai (manifest) có phiên bản**, và một bộ khung chung
thi hành bản khai đó. Phương án viết độc lập, không biết các phương án khác.

**Nhãn trong tài liệu**

- **[mã]** — tôi đã tự kiểm trong bản chụp `scratchpad/onehub`; đường dẫn tương đối
  từ gốc kho.
- **[eve]** — tôi đã tự kiểm trong tài liệu eve 0.29.4 cài kèm
  (`apps/agent/node_modules/eve/docs`); đường dẫn tương đối từ thư mục `docs` đó.
- **[0x]** — lấy từ báo cáo nghiên cứu số x của đợt này; khi mâu thuẫn, 09 thắng.
- **(suy luận)** — kết luận của tôi, chưa chạy thử.
- Mã của lượt 4 (`OkrCheckIn`, `okr-nhac.ts`…) chưa có trên `onehub`; mọi câu về nó
  lấy theo 07 và ghi «(theo 07)».

**Đã đọc trước khi viết** (theo bảng chỉ mục của `AGENTS.md`): `AGENTS.md`,
`CLAUDE.md` của kho, `CONTEXT.md`, `docs/plan/lo-trinh-okr.md` (toàn bộ), các mục
liên quan của `docs/agent.md` (lịch duy nhất, «What may be read»), `docs/api.md`
(«Intelligence never lives in the API»), `docs/chat-ui.md` (bảng AI Elements); báo
cáo 09 trọn, 06, 07, 08 trọn, các mục tổng kết của 01, 03, 04, 05.

---

## 0. Tóm tắt một màn

1. **Một tính năng AI = một bản khai trong mã** (không phải cấu hình người dùng tự
   dựng). Bản khai nói: bề mặt, trigger, principal và phạm vi dữ liệu, tool, gói
   ngữ cảnh, khuôn đầu ra, bộ kiểm bằng mã, kiểu người duyệt, hạng chi phí, bộ eval.
   Chín khối chung thi hành nó; bảy trong chín khối dùng lại cho mọi tính năng.
2. **Trên eve: mỗi lần chạy là một phiên của agent gốc, purpose `ai-feature`,**
   không subagent, không eve app thứ hai. Bộ tool của phiên do một resolver động
   quyết: cấp đúng tool của tính năng và **che mọi tool khác bằng bản rỗng cùng
   tên** — eve cho tool động thay tool đã viết theo tên [eve `guides/dynamic-capabilities.md` §Conflicts].
   Làm vậy vừa chặn dữ liệu đối tác khỏi phiên OKR, vừa hạ nền mỗi bước từ khoảng
   7–10k xuống khoảng 3–4k token (suy luận).
3. **Không có lời gọi model «một lần»** [09 G13], nên đầu ra có cấu trúc đi qua một
   **công cụ nộp** mà `inputSchema` chính là khuôn đầu ra của tính năng; `execute`
   chạy bộ kiểm bằng mã rồi ghi sổ. Kho đã có đúng mẫu này ở `finish_run`,
   `save_agent_draft` [mã].
4. **Bốn sổ là xương sống:** sổ đầu ra (đề xuất và tóm tắt → nhận nguyên văn / sửa /
   bác), sổ chi phí (kiểm **trước** khi xếp việc), vết OKR (người nhận là tác giả,
   `nguon: "tro-ly"`), và eval theo phiên bản.
5. **Chạy nền gửi nhiều người**: chạy bằng principal nền hẹp chỉ đọc OKR, lưu một
   bản có dẫn nguồn từng câu, **lọc theo từng người nhận lúc giao**. Không gửi tin
   riêng: bản tóm tắt thành một dòng trong nhắc buổi sáng.
6. **Không quá tay:** gia số nền gồm một migration, khoảng 20 tệp mới (kể cả test
   và một màn cài đặt), và khoảng 12–15 dòng móc vào 6 tệp của hãng. Kho đã có sẵn
   phần lớn linh kiện; nền chủ yếu là đặt tên và nối chúng.
7. **Gia số đầu tiên** (T3, không bật tính năng AI OKR nào) đặt sau lượt 5, trước
   lượt 6, để có **số chi phí thật** mấy tuần trước Cổng Đáng lượt 9.
8. **Chi phí** (gemini-3.7-flash, chưa tính cache): kịch bản 150 người, 25 đơn vị
   thì tháng đặt OKR khoảng 8 USD, tóm tắt tuần khoảng 1,7 USD/tháng. **Hỏi đáp
   (lượt 10) mới là biến số lớn**: khoảng 13 USD/tháng nếu mỗi người hỏi 4 câu, nên
   bắt buộc có trần ngày theo người.

---

## 1. Luận điểm

**Luận điểm.** Lượt 9–10 có tám tính năng AI (AI-01…AI-07, DO-06) và chúng khác
nhau ở đúng bốn thứ: trigger, gói ngữ cảnh, khuôn đầu ra, bộ kiểm. Những thứ còn lại
giống nhau: principal và phạm vi, cấp tool, đo tiền và trần, sổ quyết định của
người, nhãn tác giả, eval, giao ra kênh. Vì vậy nên viết phần giống nhau **một lần**,
thành bộ khung thi hành bản khai, và mỗi tính năng chỉ là một bản khai cộng bốn
mảnh riêng. Trên eve, bộ khung ngồi trong agent gốc: một purpose mới, một resolver
tool động che mọi tool ngoài danh sách, một công cụ nộp cho mỗi tính năng. Đó là cách
duy nhất vừa giữ vai «chỉ OKR» kín bằng cấu trúc chứ không bằng lời dặn, vừa không
nhân phí bản rẽ theo số tính năng.

**Vì sao góc này đúng cho OneHub lúc này**

- **Hai điều kiện mở lượt 9 là chuyện của nền, không phải của tính năng.** Lộ
  trình ghi: lượt 9 chỉ mở khi có «trần chi tiêu tháng» và câu trả lời về việc gửi
  nội dung OKR tới nhà cung cấp model [mã `docs/plan/lo-trinh-okr.md` §Lượt 9]. Trần
  tiền, ZDR và gắn tag Gateway theo tính năng phải nằm ở một chỗ chung; làm theo
  từng tính năng thì mỗi tính năng tự giữ một phần trần.
- **Kho đã có phần lớn linh kiện, chỉ chưa gọi chúng là một nền:**
  - hàng `AgentTask` cùng một lịch dispatch duy nhất [mã `packages/db/prisma/schema.prisma` model `AgentTask`, `apps/agent/agent/schedules/dispatch.ts`];
  - `capabilities.ts`: thiếu khoá thì tính năng biến mất, không ném lỗi [mã `apps/agent/agent/lib/capabilities.ts`];
  - sổ đề xuất có trạng thái `PROPOSED/APPLIED/DISMISSED/SUPERSEDED` và luật «đã bác thì không mời lại» [mã `schema.prisma` enum `FactStatus`, `apps/agent/agent/lib/facts.ts` dòng 124–132];
  - usage và `costUsd` của mọi bước đã nằm trong `AgentEvent` qua hook audit [mã `apps/agent/agent/hooks/audit.ts`];
  - chính sách duyệt `sensitiveWrite` [mã `apps/agent/agent/lib/approval.ts`];
  - khung eval của eve với một eval đang chạy [mã `apps/agent/evals/agent-builder.eval.ts`];
  - thành phần giao diện `Suggestion` (nhận/bác) và `SourcedValue`/`Provenance` (dẫn nguồn) [mã `packages/ui/src/components/suggestion.tsx`, `sourced-value.tsx`].
- **Ràng buộc đã chốt đều là luật chung, không phải luật riêng của một tính năng:**
  NG-05, NG-07, «hỏi không chặn lưu», «bác không mời lại», «câu nào cũng dẫn về lần
  cập nhật gốc», «mỗi sáng một tin», «vai chỉ OKR không thấy dữ liệu đối tác kể cả
  qua AI». Viết mỗi luật một lần trong khung thì tính năng mới **không thể quên**.
- **Đội là một người cộng các phiên AI.** Việc đắt nhất không phải viết mã mà là
  cổng duyệt. Nền gom phần khó-đảo (schema, quyền, móc vào tệp của hãng) vào **một**
  lượt T3; các tính năng sau đó là T2, không chạm schema hay quyền.

### 1.1 Chứng minh không quá tay

| Câu hỏi | Trả lời có số |
| --- | --- |
| Nền to cỡ nào? | Một migration (2 bảng mới, 4 cột `AppSetting`, 1 chỉ mục riêng phần); khoảng 20 tệp mới (kể cả test và một màn cài đặt); khoảng 12–15 dòng móc vào 6 tệp của hãng (mục 3.7). Để so sánh, lượt 4 là 109 tệp, +16.767 dòng [07]. |
| Tính năng thứ hai tốn thêm gì? | Một mục trong danh mục, một mô-đun runtime (instructions, gói ngữ cảnh, bộ kiểm), một khuôn Zod đầu ra, một bộ eval 20–40 ca, và dùng lại thành phần giao diện. Không chạm schema, quyền hay dispatch. |
| Không có nền thì sao? | Tám tính năng × bốn lớp (chặn phạm vi, đo tiền, lưu quyết định, đo nhận/sửa/bác) = 32 chỗ tự làm, cộng tám lần kiểm vai «chỉ OKR» cho từng đường vào. Luật lượt 2 đòi một phép đo cho mỗi đường vào [mã `docs/plan/lo-trinh-okr.md` §7]. |
| Hoà vốn khi nào? | Từ tính năng thứ hai. Viết lại (AI-01/02) và tóm tắt tuần (AI-04) khác trigger, khác người duyệt, nhưng chung 7/9 khối. |
| Cái gì cố ý **không** dựng? | Không Studio cho người dùng tự dựng tính năng; không lưu bản khai trong DB; không skill động; không RAG hay pgvector; không nhiều agent phối hợp; không eve app thứ hai; không MCP ra ngoài trong R3 (mục 11.2). |
| Luật chống phình | «Luật của hai»: một khối chỉ tổng quát hoá khi có **hai** tính năng cần. Ví dụ: kiểu người duyệt `duyet-ghi` có trong khuôn nhưng không dựng giao diện cho tới khi một tính năng thật dùng nó. |

---

## 2. Các khối kiến trúc

### 2.1 Sơ đồ

```mermaid
flowchart TB
  subgraph Vao["Đường vào"]
    Bam["Nút trên màn OKR<br/>(apps/app)"]
    Lich["Lượt quét trong lịch dispatch<br/>(lenLichAi)"]
    HoiThoai["Hội thoại (lượt 10)<br/>/eve/v1 có phạm vi"]
    KenhVao["Slack · Zalo (lượt 10)"]
  end
  subgraph API["apps/api — không có trí khôn"]
    Router["okr.troLy.* (PhamViOkrMiddleware)<br/>settings.troLyAi.* (quản trị)"]
    Svc["AiFeatureService: choPhep() → ghi AgentTask → poke"]
    ApDung["Áp đề xuất đã nhận qua okr.service<br/>→ OkrTrail {nguon: tro-ly}"]
  end
  subgraph Agent["apps/agent — một agent gốc"]
    Lane["Làn nghiên cứu (có sẵn)<br/>móc brief()/taskAuth()"]
    Phien["Phiên purpose ai-feature"]
    VoTool["K2 resolver tool: cấp tool của tính năng,<br/>che mọi tool khác"]
    NguCanh["K4 gói ngữ cảnh theo miền"]
    Nop["K5 công cụ nộp = khuôn đầu ra<br/>→ bộ kiểm bằng mã"]
    HookChiPhi["K7 hook sổ chi phí (step.completed)"]
  end
  subgraph DB["Postgres"]
    Task[(AgentTask kind ai-feature)]
    Out[(AiOutput — sổ đầu ra)]
    Spend[(AiSpend — sổ chi phí)]
    Okr[(bảng OKR, OkrTrail)]
  end
  Bam --> Router --> Svc --> Task
  Lich --> Task
  Task --> Lane --> Phien
  HoiThoai --> Phien
  KenhVao --> Phien
  Phien --> VoTool
  Phien --> NguCanh --> Okr
  Phien --> Nop --> Out
  Phien --> HookChiPhi --> Spend
  Out --> Router
  Router --> ApDung --> Okr
  Out --> Giao["K9 giao: lọc theo người nhận<br/>web · dòng trong nhắc buổi sáng · (sau) Slack đơn vị"]
```

### 2.2 Bảng khối

| # | Khối | Trách nhiệm | Vị trí | Mới / có sẵn |
| --- | --- | --- | --- | --- |
| K1 | Danh mục và bản khai | Liệt kê tính năng, phiên bản, và mọi quyết định khai báo | Phần công khai: `packages/validation/src/ai-feature.ts` (khuôn) + `packages/validation/src/ai-feature-danh-muc.ts` (danh mục, `as const`). Phần runtime: `apps/agent/agent/lib/ai-feature/<mien>/<ten>.ts` | Mới. Theo khuôn `CRM_EVENT_CATALOG` [mã `packages/db/src/crm-events.ts`] |
| K2 | Principal và phạm vi | Dựng principal từ phiên đã xác thực; cấp tool đúng tính năng, che phần còn lại; hàm đọc kiểm quyền | `apps/agent/agent/lib/ai-feature/pham-vi.ts`, `apps/agent/agent/tools/ai_feature.ts` (resolver động), dùng `docDuocPhamVi` [mã `packages/validation/src/vai-workspace.ts`] | Mới; dùng lại ma trận phạm vi của lượt 2 |
| K3 | Điều phối và trigger | Bấm, lịch, sự kiện, hội thoại → một phiên `ai-feature` | Một loại `AgentTask` là `ai-feature`; móc trong `lib/dispatch.ts` và `schedules/dispatch.ts`; `apps/agent/agent/lib/ai-feature/dieu-phoi.ts` | Dùng lại hàng và làn nghiên cứu [mã `apps/agent/agent/lib/dispatch.ts`] |
| K4 | Knowledge — gói ngữ cảnh | Dựng khối dữ liệu có cấu trúc theo miền, số đã tính sẵn, có id | `packages/db/src/okr-doc.ts` (đọc có quyền, dùng chung API và agent), `packages/validation/src/okr-tien-do.ts` + `okr-can-chinh.ts` (hàm thuần dời từ `apps/api/src/okr/`), `apps/agent/agent/lib/ai-feature/okr/ngu-canh.ts` | Mới; phải dời hàm từ `apps/api` [mã `apps/api/src/okr/tien-do.ts`, `can-chinh.ts`, `okr-access.service.ts`] |
| K5 | Công cụ nộp và bộ kiểm | Nhận đầu ra có kiểu, kiểm bằng mã (số, nguồn, từ cấm, không đổi đích), ghi sổ, trả lý do bỏ | `packages/validation/src/kiem-so.ts` (hàm thuần, app cũng dùng), `apps/agent/agent/lib/ai-feature/nop.ts` | Mới; theo mẫu `finish_run` [mã `apps/agent/agent/subagents/agent_runner/tools/finish_run.ts`] |
| K6 | Sổ đầu ra AI («sổ gợi ý» trong đề bài) | Lưu đề xuất và tóm tắt; nhận nguyên văn / sửa / bác / hết hạn; chặn mời lại cái đã bác | Bảng `AiOutput`; `packages/validation/src/ai-output.ts`; `packages/db/src/ai-output.ts` | Mới; mẫu `ContactFact` |
| K7 | Sổ chi phí và trần | Cộng tiền theo tháng × tính năng; `choPhep()` trước khi xếp việc và trước khi gửi; tạm nghỉ khi hết trần | Bảng `AiSpend`; `packages/db/src/ai-spend.ts`; hook mới `apps/agent/agent/hooks/so-chi-phi.ts` | Mới; nguồn số là `step.completed` như hook audit |
| K8 | Eval | Golden set tiếng Việt theo tính năng; eval phạm vi pass^k; thước online | `apps/agent/evals/ai-feature/<id>/*.eval.ts`, `_acceptance/<slug>/rang/*.sql` | Khung có sẵn [mã `apps/agent/evals/evals.config.ts`] |
| K9 | Giao và bề mặt | Lọc theo người nhận; hiện trong app; một dòng trong nhắc buổi sáng; sau này Slack đơn vị, hội thoại, MCP | `apps/agent/agent/lib/ai-feature/giao.ts`, nhánh mới trong `packages/db/src/onboarding-nhac.ts`, biến thể trong `packages/ui` | Dùng lại nhắc buổi sáng [mã `packages/db/src/onboarding-nhac.ts` `viecCanNhac`] |

**Về tên.** Kho đã có `lib/capabilities.ts` với nghĩa «khoá nhà cung cấp nào đang
bật». Để khỏi trùng, mã của phương án gọi bản khai là `ai-feature`, không gọi là
«capability». Trong văn xuôi dùng «tính năng AI» và «bản khai (manifest)».

### 2.3 Hợp đồng giữa các khối (phác thảo, không phải mã cuối)

**K1 — phần công khai của bản khai** (`packages/validation/src/ai-feature.ts`). API
và app đọc phần này để biết nút nào hiện, ai được bấm, hạng chi phí nào. Phần này
không chứa prompt nào, nên API vẫn «không có trí khôn».

```ts
export const aiTrigger = z.discriminatedUnion("kieu", [
  z.object({ kieu: z.literal("bam") }),
  z.object({ kieu: z.literal("lich"), nhip: z.literal("tuan"), thu: z.number().int().min(1).max(7), gioVN: z.number().int().min(0).max(23) }),
  z.object({ kieu: z.literal("su-kien"), suKien: z.string() }),
  z.object({ kieu: z.literal("hoi-thoai") }),
]);

export const principalCuaTinhNang = z.discriminatedUnion("kieu", [
  z.object({ kieu: z.literal("nguoi-goi") }),
  z.object({ kieu: z.literal("nen"), phamVi: z.array(z.enum(PHAM_VI_DU_LIEU)).min(1) }),
]);

export const NGUOI_DUYET = ["goi-y-nhan", "nhap", "duyet-ghi", "chi-doc"] as const;
export const HANG_CHI_PHI = ["mot-phat", "gom-don-vi", "hoi-thoai"] as const;

export const aiFeature = z.object({
  id: z.string().regex(/^[a-z0-9-]+\.[a-z0-9-]+$/),
  phienBan: z.number().int().positive(),
  mien: z.enum(["okr", "crm", "dieu-phoi"]),
  beMat: z.array(z.string()).min(1),
  trigger: aiTrigger,
  principal: principalCuaTinhNang,
  phamViCan: z.array(z.enum(PHAM_VI_DU_LIEU)).min(1),
  phaChuKy: z.array(z.enum(PHA_CHU_KY)).optional(),
  nguoiDuyet: z.enum(NGUOI_DUYET),
  hangChiPhi: z.enum(HANG_CHI_PHI),
  tranNgayMoiNguoi: z.number().int().positive().optional(),
});
export type AiFeature = z.infer<typeof aiFeature>;
```

**K1 — phần runtime** (chỉ ở `apps/agent`). Một test đối chiếu hai phía: mỗi `id`
trong danh mục công khai có đúng một mô-đun runtime, và ngược lại.

```ts
export type AiFeatureRuntime<NguCanh, DauRa> = {
  id: AiFeatureId;
  instructions: string;
  tangModel: "nhanh" | "mac-dinh";
  toolDoc: readonly string[];
  duocHoiLai: boolean;
  dungNguCanh: (p: Principal, dich: DichTinhNang) => Promise<NguCanh>;
  khuonDauRa: z.ZodType<DauRa>;
  kiem: (dauRa: DauRa, nguCanh: NguCanh) => KetQuaKiem<DauRa>;
  nganSachPhien: { soLanNop: number; soLanDoc: number };
};
```

**K2 — principal** (`packages/validation/src/ai-feature.ts`). Principal lấy từ
phiên đã xác thực, không bao giờ từ đầu vào của model.

```ts
export const principal = z.discriminatedUnion("kieu", [
  z.object({ kieu: z.literal("nguoi"), userId: z.string(), vai: z.enum(WORKSPACE_ROLES), phamVi: z.array(z.enum(PHAM_VI_DU_LIEU)) }),
  z.object({ kieu: z.literal("nen"), ten: z.string(), phamVi: z.array(z.enum(PHAM_VI_DU_LIEU)) }),
]);
```

**K3 — payload của `AgentTask`** (khuôn liên gói: API ghi, agent đọc).

```ts
export const aiTaskPayload = z.object({
  featureId: aiFeature.shape.id,
  phienBan: z.number().int(),
  principal,
  dich: z.object({ loai: z.enum(["muc-tieu", "kr", "don-vi"]), id: z.string() }),
  ky: z.string().optional(),
});
```

**K5 — kết quả kiểm** (hàm thuần, app cũng chạy lại được lúc hiển thị).

```ts
export const LY_DO_BO = ["so-lech", "nguon-ngoai-tap", "doi-dich-hoac-don-vi", "tu-cam", "trung-da-bac", "vuot-tran-do-dai"] as const;
export type KetQuaKiem<T> = { giu: T[]; bo: { muc: T; lyDo: (typeof LY_DO_BO)[number] }[] };
export function kiemSoTrongCau(cau: string, soDuocPhep: readonly number[]): { khop: boolean; soLa: number[] };
```

**K6 — mục trong sổ đầu ra**.

```ts
export const TRANG_THAI_DAU_RA = ["cho", "nhan-nguyen-van", "nhan-co-sua", "bac", "het-han"] as const;
export const cauCoNguon = z.object({ vanBan: z.string().min(1).max(400), nguon: z.array(z.string()).min(1) });
export const deXuatDong = z.object({ truong: z.enum(["title", "whyNow", "kr.title", "kr.targetValue"]), truoc: z.string().nullable(), sau: z.string(), lyDo: z.string().max(200) });
```

**K7 — sổ chi phí**.

```ts
export type ChoPhep =
  | { ok: true }
  | { ok: false; lyDo: "tat" | "het-tran-thang" | "het-luot-ngay" | "chua-san-sang" | "sai-pha"; moLai: Date | null };
export async function choPhep(db: Db, featureId: string, p: Principal, now: Date): Promise<ChoPhep>;
export async function ghiChiPhi(db: Db, dong: { thang: string; featureId: string; inputTokens: number; outputTokens: number; costUsd: number }): Promise<void>;
```

**K9 — giao**.

```ts
export type KenhGiao = "web" | "nhac-sang" | "slack-don-vi" | "hoi-thoai";
export function locTheoNguoiNhan(dauRa: AiOutputDaDoc, nguoiNhan: Principal, coTheXem: (p: Principal, nguon: string) => boolean): AiOutputDaDoc | null;
```

| Từ → tới | Hợp đồng | Luật |
| --- | --- | --- |
| App → API | `okr.troLy.trangThai({featureId, dich})` → `{hien, lyDo?}`; `okr.troLy.chay(...)`; `okr.troLy.dauRa(...)` (poll bằng `refetchInterval`) | Máy chủ quyết nút có hiện không; thiếu khoá hay hết trần thì nút biến mất, không báo lỗi |
| API → K7 | `choPhep()` trước khi ghi hàng | Hết trần thì không ghi hàng |
| API → K3 | Ghi `AgentTask {kind: "ai-feature", payload: aiTaskPayload, subject}` rồi `poke()` [mã `apps/api/src/agent/agent-trigger.service.ts`] | API không gọi model |
| K3 → eve | `send(brief, { auth: { attributes: { purpose: "ai-feature", feature, principal… } } })` | Principal do máy chủ đặt, không do client |
| eve → K2 | Resolver tool đọc `ctx.session.auth` lúc `session.started` | Tool ngoài danh sách bị che |
| K4 → model | Gói ngữ cảnh đặt **cuối** tin nhắn đầu, sau tiền tố ổn định | Số đã tính bằng hàm thuần; model không tự tính |
| Model → K5 | Chỉ qua công cụ nộp; không tool nào ghi thẳng bảng OKR | NG-05 giữ bằng cấu trúc |
| K5 → K6 | Ghi mục đã qua bộ kiểm; đếm mục bị bỏ | Bỏ là kết quả, không phải lỗi |
| K6 → API → OKR | Người nhận thì API áp qua đúng thủ tục ghi của màn | `OkrAccessService`, khoá pha, `OkrTrail` giữ nguyên |
| Mọi phiên → K7 | Hook `so-chi-phi` cộng `step.completed` | Cộng cả phiên CRM có sẵn, gắn id kế thừa |

---

## 3. Ngồi trên eve thế nào

### 3.1 Sự thật về eve mà phương án dựa vào (đều đã tự kiểm)

| # | Sự thật | Nguồn |
| --- | --- | --- |
| E1 | Tool động trùng tên với tool **đã viết** thì **thay** nó; resolver theo người gọi thay được cả tool dựng sẵn theo tên | [eve `guides/dynamic-capabilities.md` §Conflicts] |
| E2 | `disableTool()` gỡ tool cho cả agent, không theo người gọi | [eve `concepts/default-harness.md` §Disable a default] |
| E3 | Subagent khai báo không thừa kế tool, skill, hook, sandbox, state của gốc; channel và schedule chỉ ở gốc | [eve `subagents.mdx` §The isolation boundary] |
| E4 | **Hook của gốc không chạy cho lượt của subagent** | [eve `guides/hooks.md` §Subagent isolation] |
| E5 | Skill tĩnh không cần sandbox; **skill động cần sandbox**; skill thuộc riêng từng agent | [eve `skills.mdx` §How loading works, §Skills are scoped per agent] |
| E6 | Chọn model động ở `session.started` trả `{ model, modelContextWindowTokens?, modelOptions? }`; ở session/turn phải là chuỗi id; `LanguageModel` chỉ trả được ở `step.started` | [eve `agent-config.md` §Choose the model dynamically] |
| E7 | Trần token phiên: phiên không có người (task mode) vượt trần thì thất bại `SESSION_TOKEN_LIMIT_REACHED`; phiên có người thì hỏi Approve/Stop. Subagent nhận một phần quota của cha | [eve `agent-config.md` §Runtime limits] |
| E8 | `send()` của channel tuỳ biến nhận `{ auth, continuationToken, state?, title? }`, không có `outputSchema` theo lượt | [eve `channels/custom.mdx` dòng 49] |
| E9 | Eval chạy trên HTTP thật; có `mockModel` thấy danh sách `tools`; có `t.calledTool`, `t.notCalledTool`, judge | [eve `evals/overview.mdx`, `evals/assertions.mdx`] |
| E10 | Schedule dạng `run` chuyển việc sang channel bằng `receive`; `eve dev` không tự bắn cron | [eve `schedules.mdx`] |
| E11 | Phiên subagent đọc được thuộc tính auth của phiên cha | [mã `apps/agent/agent/subagents/agent_runner/tools/finish_run.ts` đọc `runId` qua `requireTeamAgentAttribute`] |
| E12 | Kho không có đường gọi model ngoài phiên eve | [09 G13; mã `apps/agent/package.json`] |

### 3.2 Ba cách ngồi, và vì sao chọn phiên gốc có resolver tool

| | (a) Phiên gốc, purpose `ai-feature`, resolver che tool | (b) Subagent `tro_ly` do gốc gọi một lần | (c) eve app riêng qua `defineRemoteAgent` |
| --- | --- | --- | --- |
| Chặn tool đối tác | Có: 26 tool đã viết và 10 tool dựng sẵn bị thay bằng bản rỗng (E1) | Trong subagent thì có (E3). **Nhưng gốc vẫn cầm 26 tool** và vẫn đọc chữ người dùng; chữ tiêm vào tên mục tiêu có thể khiến gốc gọi `read_crm_history`. Vẫn phải che ở gốc | Tuyệt đối |
| Số bước model mỗi lần | Khoảng 2 bước cho tính năng một phát | Khoảng 2 bước gốc cộng 2 bước con | Như (a), cộng một bước gốc gọi sang nếu đi qua gốc |
| Nền mỗi bước (suy luận) | Khoảng 3–4k token | Gốc khoảng 7–10k [09 G14], con khoảng 2–3k | Khoảng 2–3k |
| Chi phí một lần viết lại, chưa cache | Khoảng 0,010 USD | Khoảng 0,024 USD (×2,4) | Khoảng 0,008 USD |
| Sổ chi phí | Một hook ở gốc thấy hết | Phải chép hook sang subagent (E4). Suy luận: `AgentRun.costUsd` hôm nay có thể chỉ cộng bước của gốc, vì `agent_runner` không có `hooks/` [mã `apps/agent/agent/subagents/agent_runner/`] — cần kiểm | Hook riêng ở app kia |
| Model và trần riêng | Model theo tính năng qua `modelOptions` (E6); trần phiên dùng chung của gốc | Model tĩnh riêng, `limits` riêng nếu chặt hơn (E7) | Tuỳ ý |
| Móc vào tệp của hãng | Khoảng 12–15 dòng (mục 3.7) | Như (a), cộng nhánh «gọi subagent một lần» trong `instructions/task.ts` | Ít nhất, nhưng thêm một lần triển khai, một bộ biến môi trường, tin cậy OIDC giữa hai app |
| Hợp luật kho | «Trí khôn ở `apps/agent`» | Như (a) | Trái chữ của luật: trí khôn ra khỏi `apps/agent` |
| Hợp đội một người | Tốt | Vừa | Kém |

**Chọn (a).** (b) không bỏ được bước che tool ở gốc, lại gấp đôi số bước và làm
sổ chi phí mù phần của con. (c) đáng cân nhắc chỉ khi phiên OKR cần cô lập ở mức
triển khai (ví dụ yêu cầu pháp lý), chưa có dấu hiệu đó.

**Điều kiện để (a) đứng:** E1 mới là tài liệu, chưa chạy thử. Vì vậy phép đo đầu
tiên của gia số 0 là phép đo này (mục 10). Nếu eve không thay tool đã viết theo tên
như tài liệu nói, lối lùi là (b) cộng một hàm chặn đặt ở đầu `execute` của 16 tool
đối tác không kiểm `purpose` [06 §3.4]. Lối lùi này tốn phí bản rẽ nhưng không đổi
phần còn lại của phương án.

### 3.3 Một phiên tính năng AI trông thế nào

**Thuộc tính auth** do máy chủ đặt: `purpose: "ai-feature"`, `feature:
"okr.viet-lai@1"`, `principalKieu: "nguoi" | "nen"`, `userId` (nếu là người),
`vai`, `phamVi: "okr,to-chuc,chung"`, `dichLoai`, `dichId`, `taskId`.

| Khe eve | Làm gì | Tệp |
| --- | --- | --- |
| Purpose | Thêm `"ai-feature"` vào `SESSION_PURPOSES`. **Bắt buộc**: hôm nay purpose lạ rơi về `research` qua `.catch("research")` [mã `apps/agent/agent/lib/session-purpose.ts`], nên một purpose chưa khai sẽ nhận lời dặn nghiên cứu và **qua được** `assertResearchPurpose` | móc 1 dòng |
| Instructions | `instructions/task.ts` trả `null` khi purpose là `ai-feature`; tệp mới `agent/instructions/ai-feature.ts` (`defineDynamic`, `session.started`) trả instructions của tính năng. `instructions.md` tĩnh (424 byte) vẫn đi kèm và hợp: nó dặn «follow that purpose exactly and do not borrow tools» [mã `apps/agent/agent/instructions.md`] | móc 2 dòng + 1 tệp mới |
| Tools | `agent/tools/ai_feature.ts`: `defineDynamic({ events: { "session.started": … } })`. Nếu không phải `ai-feature` thì trả `null`. Nếu phải thì trả một map: (1) tool đọc của tính năng, (2) công cụ nộp, (3) `ask_question` và `load_skill` chỉ khi bản khai cho phép, (4) **một bản rỗng cho mọi tên còn lại**: 26 tool đã viết ở `agent/tools/*.ts` và các tool dựng sẵn `bash`, `read_file`, `write_file`, `glob`, `grep`, `web_fetch`, `web_search`, `todo`. Bản rỗng có mô tả một dòng, `inputSchema` rỗng, `execute` trả «Không có trong phiên này» | 1 tệp mới |
| Skills | Chỉ skill tĩnh (E5). R3 để phương pháp OKR ngay trong instructions của tính năng (luôn bật, nằm trong tiền tố được cache). Skill chỉ đáng dùng cho hội thoại lượt 10, khi quy trình thay đổi theo câu hỏi | — |
| Model | `lib/model.ts` nhận `ctx`; nếu purpose là `ai-feature` thì trả id theo tầng của tính năng cộng `modelOptions.providerOptions.gateway = { tags: ["f:okr.viet-lai@1"], user: <mã băm userId>, zeroDataRetention: <theo cài đặt> }` (E6) | móc 2 dòng trong `agent.ts` / `lib/model.ts` + 1 tệp mới |
| Giới hạn | Trần phiên của gốc (500k vào, 50k ra [mã `apps/agent/agent/agent.ts`]) quá rộng cho một tính năng và không đặt riêng được theo phiên. Lưới riêng: ngân sách lượt trong `defineState("ai-feature.ngan-sach")` (theo khuôn `lib/focus.ts`): tool đọc và công cụ nộp tự từ chối khi hết lượt; nộp tối đa 2 lần | trong mô-đun mới |
| Hooks | Hook audit có sẵn ghi mọi sự kiện vào `AgentEvent` (giữ nguyên). Hook mới `hooks/so-chi-phi.ts` cộng tiền | 1 tệp mới |
| Schedules | Không thêm tệp. Một lượt quét `lenLichAi()` vào `Promise.all` của `schedules/dispatch.ts`, như `lenLichNhac()` đã làm [mã] | móc 2 dòng |
| Channels | Một phát và lịch: đi qua channel `crm` có sẵn (không đổi). Hội thoại (lượt 10): channel `eve` nhận vai `okr` **chỉ khi** token mang `purpose: "ai-feature"` và `phamVi` không có `doi-tac` | móc trong `channels/eve.ts` và route app ở lượt 10 |
| Subagents | Không thêm trong R3 (mục 3.8) | — |

**Hai chỗ còn hở, và cách lấp** (suy luận):

- `agent_builder` và `agent_runner` vẫn hiện là tool trong phiên `ai-feature`,
  vì tài liệu không nói tool động có thay được tên của subagent không. Cả hai đều
  đóng khi chạy sai purpose: builder cần `CREATE_AGENT`, runner cần `team-agent`
  [mã `apps/agent/agent/lib/session-purpose.ts`]. Eval phạm vi sẽ kiểm cả hai tên.
- Tài liệu nói lỗi của resolver model thì «degrade», nhưng không nói gì về lỗi của
  resolver tool. Nếu resolver ném lỗi mà eve lặng lẽ giữ tool tĩnh thì phiên hở. Vì
  vậy resolver tool không đọc DB, không gọi mạng: nó chỉ tính từ thuộc tính auth và
  một danh sách hằng.

### 3.4 Đường vào

| Trigger | Đường | Principal | Ví dụ |
| --- | --- | --- | --- |
| Bấm (một phát) | App → `okr.troLy.chay` (API, `PhamViOkrMiddleware`) → `choPhep()` → `AgentTask` → `poke()` → làn nghiên cứu → phiên. App poll kết quả | Người bấm, phạm vi theo vai | Viết lại, soát, gợi ý căn chỉnh, gợi ý đích |
| Lịch | `lenLichAi()` trong nhịp dispatch mỗi phút; mỗi đơn vị mỗi tuần một hàng, `subject = "okr.tom-tat-tuan:<donVi>:<tuan>"` có chỉ mục duy nhất riêng phần (khuôn `agentTask_nhac_mot_ngay` [mã `schema.prisma`]) | Nền hẹp `okr-nen` | Tóm tắt tuần |
| Sự kiện | Hàm ghi của API gọi `ghiViecAi()` trong cùng giao dịch, như `withCrmEvents` | Nền hẹp | (Sau R3) giải thích khi mức tự tin tụt |
| Hội thoại (lượt 10) | App `/eve/v1/*` ký JWT với `attributes.purpose = "ai-feature"`; `repFromCrm` mở cho vai `okr` chỉ với purpose này [mã `apps/agent/agent/channels/eve.ts`] | Người hỏi | Hỏi đáp OKR (AI-07) |
| Slack, Zalo (lượt 10) | Channel phân giải danh tính kênh thành người CRM (`SlackMemberMatch`, `ZaloLink`) rồi mới dựng principal; không tin danh tính trong thân tin | Người nhắn | Hỏi đáp qua kênh |

Việc bấm đi qua `AgentTask` chứ không đi thẳng `/eve/v1` vì bốn lẽ: (1) một chỗ
kiểm trần, (2) chống trùng bằng `subject` khi người bấm hai lần, (3) thử lại và đối
soát như mọi việc nền [mã `apps/agent/agent/lib/dispatch.ts` `beginResearch`,
`reconcileStart`], (4) không phải mở đường nối `/eve/v1` cho vai `okr` ngay ở lượt 9.
Cái giá là không stream; tính năng một phát trả vài dòng, nên chờ vài giây là chấp
nhận được (suy luận). Làn nghiên cứu lấy 12 hàng mỗi nhịp theo `priority`
[mã `apps/agent/agent/lib/dispatch-config.ts`]; hàng bấm mang `priority` 850, cao hơn
mọi loại của làn nghiên cứu (cao nhất hôm nay là `workspace` 500; `brand` 900 và
`slackJoin` 950 thuộc làn trực tiếp) [mã `packages/db/src/agent-tasks.ts` `PRIORITY`].
Số 850 đặt trong config của khu, không sửa `PRIORITY` của hãng. `markRunning` và `settle` không làm gì với hàng
không gắn cá nhân hay công ty [mã `apps/agent/agent/lib/enrichment.ts` dòng 52, 63].

### 3.5 Vai «chỉ OKR»

Ba chốt, mỗi chốt có phép đo riêng:

1. **Chốt cấp tool** (K2): phiên của người vai `okr` chỉ có tool đọc OKR của tính
   năng; mọi tool đối tác là bản rỗng. Bản khai khai `phamViCan`; API từ chối chạy
   nếu `phamViCan ⊄ phạm vi của vai` [mã `packages/validation/src/vai-workspace.ts`
   `docDuocPhamVi`].
2. **Chốt trong hàm đọc** (K4): `packages/db/src/okr-doc.ts` nhận `Principal` và
   lọc ngay trong truy vấn. Hôm nay mọi vai đọc mọi mục tiêu [07 §2.2], nên lọc chưa
   loại gì. Lượt 8 thêm «mức hiển thị giới hạn» thì lọc tự có hiệu lực. Số tự chảy
   của lượt 6: hàm đọc trả **con số** của KR, không trả danh sách bản ghi đằng sau
   (bản ghi là phạm vi đối tác) [07 §5].
3. **Chốt lúc giao** (K9): mỗi câu mang nguồn; câu nào có nguồn người nhận không đọc
   được thì bỏ khỏi bản của người đó.

**Chữ tự do có tên đối tác.** Ghi chú, bình luận, tên KR có thể có tên đối tác do
người gõ. Đó là dữ liệu OKR, vai «chỉ OKR» đã đọc được trên màn. Cần một câu chốt ở
Cổng Đáng lượt 9 để khỏi tranh cãi [07 §6.4].

**Từ điển phải sửa trước khi có chữ trên màn.** Mục «Trợ lý AI» hôm nay ghi nó
thuộc phạm vi đối tác và vai «chỉ OKR» không gọi được [mã `CONTEXT.md` dòng 497].
Chữ «Gợi ý» đã có nghĩa khác: câu hướng xử lý đi kèm nhắc kế hoạch im [mã
`CONTEXT.md` dòng 224]. Vì vậy phương án gọi mục trong sổ là «đề xuất», và cần một
mục từ điển mới trước lượt 9 (xem mục 12).

### 3.6 Chạy nền gửi tới nhiều người nhận

```mermaid
sequenceDiagram
  participant L as lenLichAi (nhịp dispatch)
  participant T as AgentTask
  participant S as Phiên ai-feature (principal okr-nen)
  participant K as Bộ kiểm + sổ AiOutput
  participant N as viecCanNhac (nhắc buổi sáng)
  participant A as App (màn đơn vị)
  L->>T: mỗi đơn vị có ≥1 cập nhật tuần: 1 hàng, subject okr.tom-tat-tuan:<donVi>:<tuan>, dueAt thứ Ba 07:00 VN
  T->>S: làn nghiên cứu, choPhep() lần hai trước khi gửi
  S->>S: gói ngữ cảnh đọc bằng principal nền: chỉ OKR · tổ chức · chung
  S->>K: nop_tom_tat({cau: [{vanBan, nguon: [checkInId…]}]})
  K->>K: kiểm số trong từng câu, nguồn ⊆ tập đã đưa, từ cấm (NG-07); bỏ câu lệch
  K-->>S: {giu: n, bo: [lyDo]} — được nộp lại tối đa một lần
  N->>K: 08:30: người nhận là trưởng đơn vị và người theo dõi
  N->>N: locTheoNguoiNhan() trước khi thêm dòng; không có câu nào còn lại thì không thêm
  N-->>N: một dòng «Tóm tắt tuần của <đơn vị> đã có» cộng liên kết, trong đúng tin buổi sáng
  A->>K: mở màn: lọc lại theo người xem, hiện câu kèm dẫn nguồn
```

- **Principal nền hẹp** (mẫu Linear `actor=app`, Salesforce Agent User [04 M4]):
  phạm vi khai tường minh `["okr", "to-chuc", "chung"]`, không bao giờ là «mọi thứ»,
  không bao giờ mượn quyền người dựng hay quản trị. Lỗi của Copilot Studio (quyền
  người dựng), ClickUp (ai gọi được agent thì đọc được dữ liệu đã chia) và Tability
  (scheduled prompt một bản cho mọi người nhận [09 G2]) đều nằm ở khâu này.
- **Một bản, nhiều cách nhìn**: model chạy một lần cho một đơn vị; phần riêng của
  từng người là **mã lọc**, không phải một lần gọi model nữa. Rẻ và kiểm được.
- **Mỗi sáng một tin** [mã `CONTEXT.md` «Nhắc buổi sáng»]: đầu ra AI không bao giờ
  thành tin riêng. Nó là một loại mục mới trong `viecCanNhac`, chịu trần 10 mục và
  2.000 ký tự của Zalo [mã `apps/agent/agent/lib/zalo-config.ts` `tranKyTu`]. Chữ AI
  không đi sang máy chủ Zalo, chỉ có tên đơn vị và liên kết. Nhờ vậy ranh gửi ra ngoài
  không rộng thêm.
- **Không tóm tắt khi chưa có lần cập nhật** [mã `docs/plan/lo-trinh-okr.md` §2]:
  đơn vị không có lần cập nhật nào trong tuần thì không có hàng, không có lời gọi model.

### 3.7 Móc vào tệp của hãng

Mỗi móc chỉ 1–3 dòng và giao việc cho mô-đun của OneHub, như tiền lệ nhắc buổi
sáng [mã: `git diff release origin/onehub` cho thấy `lib/dispatch.ts` +6,
`schedules/dispatch.ts` +4, `packages/db/src/agent-tasks.ts` +3,
`lib/session-purpose.ts` 24 dòng đổi].

| Tệp của hãng | Móc | Gia số |
| --- | --- | --- |
| `apps/agent/agent/lib/session-purpose.ts` | Thêm `"ai-feature"` vào `SESSION_PURPOSES` | 0 |
| `apps/agent/agent/instructions/task.ts` | `if (purposeOf(ctx) === "ai-feature") return null;` ở `session.started` và `turn.started` | 0 |
| `apps/agent/agent/lib/model.ts` (+ `agent.ts` truyền `ctx`) | Nhánh `ai-feature` gọi `modelChoTinhNang(ctx)` | 0 |
| `apps/agent/agent/lib/dispatch.ts` | Trong `brief()` và `taskAuth()`: hàng `ai-feature` giao cho `briefAi`/`authAi` | 0 |
| `apps/agent/agent/schedules/dispatch.ts` | Thêm `lenLichAi()` vào `Promise.all` | 0 (bật ở 9b) |
| `packages/db/src/agent-tasks.ts` | Thêm `"ai-feature"` vào `TASK_KINDS` | 0 |
| `apps/agent/agent/channels/eve.ts`, `apps/app/app/eve/v1/[...path]/route.ts` | Nhận vai `okr` khi token mang `purpose: "ai-feature"` | lượt 10 |

Phần tổng quát đáng gửi lên hãng (giảm phí bản rẽ): truyền `modelOptions` theo
purpose trong `lib/model.ts`, và một điểm cắm purpose ngoài danh sách cứng (suy luận).

### 3.8 Khi nào mới dùng subagent hay eve app riêng

- **Subagent** khi một tính năng cần: (1) một khoá Gateway riêng có budget riêng
  (`createGateway` chỉ đặt tĩnh hoặc ở `step.started`, E6), hoặc (2) `limits` chặt
  hơn gốc cho một việc dài, hoặc (3) một bộ tool lớn mà che ở gốc thành rối. Khi dùng
  thì phải chép hook sổ chi phí vào `subagents/<id>/hooks/` (E4).
- **eve app riêng** khi có yêu cầu cô lập ở mức triển khai. Chưa có.

---

## 4. Knowledge

### 4.1 OKR cần gì

| Mảng | Có từ | Cách vào ngữ cảnh | Ghi chú |
| --- | --- | --- | --- |
| Mục tiêu và KR: tên, «vì sao lúc này», cấp, đơn vị, loại (cam kết hay tham vọng), trạng thái; KR: kiểu, khởi điểm, đích, hiện tại, đơn vị, hạn, trọng số, người phụ trách | L3 [mã `packages/validation/src/okr-muc-tieu.ts`, `okr-kr.ts`] | Gói ngữ cảnh | Mọi phần tử mang id |
| **Số đã tính**: tiến độ KR, tiến độ mục tiêu, vạch kỳ vọng theo ngày, tình trạng | L3 [mã `packages/validation/src/okr-kr.ts` `tienDoKr`, `okr-muc-tieu.ts` `tinhTrang`, `apps/api/src/okr/tien-do.ts` `kyVongTheoNgay`, `tienDoMucTieu`] | Gói ngữ cảnh, số đã định dạng kiểu Việt Nam cạnh số thô | **Model không tự tính số nào** |
| Chương trình OKR (phiên bản mới nhất): trần, chế độ trần, thang chấm, trọng số, OKR cá nhân | L3 [mã `packages/validation/src/okr-chuong-trinh.ts`, model `OkrProgramConfig`] | Khối luật ngắn trong gói ngữ cảnh | «0,7 là tốt» chỉ đúng với thang 0–1 |
| Chu kỳ và pha | L3 [mã `packages/validation/src/okr-chu-ky.ts` `PHA_GHI_DUOC`] | Không vào model: **khung** dùng pha để bật tắt tính năng (`phaChuKy` trong bản khai) | Viết và soát ở «lập kế hoạch» và «đang chạy»; tóm tắt ở «đang chạy» |
| Ứng viên căn chỉnh hợp lệ | L3 [mã `apps/api/src/okr/can-chinh.ts` `dungCayCanChinh`; `alignmentTargets` theo 07] | Danh sách do máy chủ lọc | AI-05 chỉ xếp lại trong tập này, không tự tìm |
| Cây tổ chức: đơn vị, trưởng | L1 | Tên đơn vị; tên người chỉ ở vai người phụ trách | Không liệt kê người chậm (NG-07) |
| Chuỗi cập nhật tuần: giá trị, mức tự tin, ghi chú một dòng, ghi hộ | L4 (theo 07) | N tuần gần nhất mỗi KR | Nguyên liệu của AI-04, AI-06, AI-07, DO-06 |
| Bình luận | L4 (theo 07) | k bình luận mới nhất mỗi mục tiêu, cắt độ dài | Chữ tự do dài nhất |
| Lớp luật: «đáng bàn» (L5), kiểm chất lượng bằng luật (L7) | L5, L7 | Kết quả luật đưa vào như dữ kiện | AI **diễn giải**, luật **quyết** [09 sự thật 9] |
| Từ điển chốt | `CONTEXT.md` | Khối ngắn trong instructions: chữ dùng và chữ tránh («check-in», «KPI», «chủ KR») | Bộ kiểm đánh dấu chữ tránh |
| Phương pháp OKR của OneHub | Chủ kho | Markdown tĩnh trong instructions của tính năng | Không đọc dữ liệu, không rò (mẫu Perdoo [03 (b)4]) |

### 4.2 Đưa vào ngữ cảnh thế nào

- **Tính năng một phát và lịch: đẩy, không kéo.** Máy chủ dựng gói ngữ cảnh trước
  (`dungNguCanh`) và đặt vào **cuối** tin nhắn đầu. Model không phải gọi tool đọc,
  nên bớt được một bước và bớt được lối đọc lan man. Tiền tố gồm `instructions.md`,
  instructions của tính năng và định nghĩa tool, giữ nguyên từng byte cho cùng
  `feature@phienBan`, để cache ngầm của Gemini ăn được [09 §2.4].
- **Hội thoại (lượt 10): kéo bằng tool đọc có kiểu**: `okr_doc_muc_tieu`,
  `okr_doc_don_vi`, `okr_doc_cap_nhat`, `okr_viec_cua_toi`. Mỗi tool trả JSON gọn
  có id láng giềng, như luật «ba bản ghi, không ngõ cụt» của kho [08 §8 mục 12], và có
  `toModelOutput` rút gọn theo khuôn `list_deals` [mã `apps/agent/agent/tools/list_deals.ts`].
  Câu hỏi về con số chỉ trả lời bằng hàm đã định nghĩa. Không có tool viết truy vấn
  (NG-04).
- **Trần cỡ gói theo tính năng**, đặt trong config của khu, ví dụ tóm tắt tối đa
  6k token. Vượt trần thì cắt bình luận trước, rồi tới tuần cũ.
- **Dời hàm xuống gói chung là điều kiện tiên quyết.** `tien-do.ts`, `can-chinh.ts`
  và `OkrAccessService` đang nằm trong `apps/api` và phụ thuộc Nest
  (`ToChucService`) [mã `apps/api/src/okr/okr-access.service.ts`]. Phương án tách
  phần thuần (tính quyền từ vai, cây và đơn vị; tính tiến độ) sang
  `packages/validation/src/okr-tien-do.ts`, `okr-can-chinh.ts` và
  `packages/db/src/okr-doc.ts`, để API và agent dùng **cùng một hàm**. Tiền lệ: đường
  ghi `datBuocXong` sống ở `@crm/db` cho cả màn lẫn bot Zalo [mã
  `packages/db/src/onboarding-buoc.ts` dòng 34].

### 4.3 Khi nào mới cần tài liệu hay embedding

Kho không có pgvector, tsvector hay pg_trgm [08 §4]. OKR ở quy mô một công ty là dữ
liệu có cấu trúc nhỏ; truy xuất theo đơn vị × chu kỳ × KR là đủ cho lượt 9–10. Thứ tự
leo thang, mỗi nấc có điều kiện đo được:

| Nấc | Khi nào | Làm gì | Hạng |
| --- | --- | --- | --- |
| 0 | Mặc định | Gói ngữ cảnh có cấu trúc | — |
| 1 | Có văn bản nội bộ ổn định cần dùng (sổ tay OKR, chiến lược năm), tổng dưới khoảng 30 trang | Markdown tĩnh trong kho, nạp như instructions hoặc skill tĩnh; người duyệt qua PR | T1 |
| 2 | Hội thoại hỏi về chữ tự do (ghi chú, bình luận) vượt cỡ gói, và thước online cho thấy trên 10% câu trả lời là «không có trong dữ liệu» ở loại câu hỏi này | Tìm toàn văn trong Postgres (`simple` + `unaccent`, vì Postgres không có bộ tách gốc từ tiếng Việt [08 §4]) | T3 (schema) |
| 3 | Hơn khoảng 1.000 mục tiêu mỗi chu kỳ và cần «OKR tương tự» xuyên đơn vị, hoặc kho văn bản hơn khoảng 100 tài liệu | pgvector trên Neon, cột `Unsupported("vector(n)")`, truy vấn thô; DB test cần extension | T3 |
| Không làm | — | Bộ nhớ dài hạn do model tự chọn. «Trí nhớ» đúng là bảng cập nhật tuần chỉ-thêm [04 §6.3] | — |

---

## 5. Người duyệt và dấu vết

### 5.1 Bốn kiểu người duyệt trong bản khai

| Kiểu | Máy làm | Người làm | Tính năng dùng |
| --- | --- | --- | --- |
| `goi-y-nhan` | Hiện câu cũ cạnh câu mới, từng dòng | Nhận nguyên văn, sửa rồi nhận, hoặc bác, từng dòng | AI-01, AI-02, AI-03, AI-05, DO-06 |
| `chi-doc` | Tóm tắt, cảnh báo, có dẫn nguồn | Đọc; bấm «hữu ích» hoặc «không» | AI-04, AI-06 |
| `nhap` | Soạn bản nháp không gửi | Sửa rồi tự gửi | (Lượt 8) bản tin vào kênh Slack đơn vị |
| `duyet-ghi` | Đề xuất một thao tác ghi, dừng chờ duyệt theo HITL của eve | Duyệt hoặc từ chối | Chưa tính năng OKR nào dùng; không dựng giao diện cho tới khi có tính năng cần |

Không có kiểu «tự chạy» cho dữ liệu OKR: NG-05 chặn bằng cấu trúc. **Không tool nào
của agent ghi bảng OKR.** Đường ghi duy nhất là thủ tục API do người bấm «Nhận». Một
test tĩnh trong `apps/agent/test/` tìm mọi lời gọi ghi (`create`, `update`,
`upsert`, `delete`) lên model `okr*` dưới `lib/ai-feature/` và phải thấy rỗng.

### 5.2 Sổ đầu ra `AiOutput` (T3, phác thảo)

```prisma
model AiOutput {
  id           String    @id @default(cuid())
  featureId    String
  version      Int
  kind         String
  targetKind   String
  targetId     String
  principal    Json
  taskId       String?
  sessionId    String?
  content      Json
  sources      Json
  status       String
  decidedById  String?
  decidedAt    DateTime?
  editedText   String?
  inputHash    String
  dropped      Int       @default(0)
  createdAt    DateTime  @default(now())

  @@index([targetKind, targetId, status])
  @@index([featureId, version, createdAt])
  @@map("aiOutput")
}
```

- **Mỗi dòng đề xuất là một hàng**, để nhận từng dòng.
- **Bác không mời lại:** công cụ nộp so `(targetKind, targetId, truong,
  chuẩnHoá(sau))` với các hàng `bac`; trùng thì bỏ với lý do `trung-da-bac`, như
  `facts.ts` đang làm [mã dòng 124–132].
- **Hết hạn khi đích đã đổi:** lúc người bấm «Nhận», API so `truoc` với giá trị hiện
  tại. Khác nhau thì đề xuất thành `het-han` và không áp. Tránh áp một câu viết cho
  bản cũ.
- **Dùng lại khi trùng đầu vào:** `inputHash` là mã băm của gói ngữ cảnh cộng
  `feature@phienBan`. Bấm lại mà đầu vào không đổi thì trả kết quả cũ, không gọi model.
- `content` và `sources` được parse bằng khuôn của từng tính năng ở
  `packages/validation/src/okr-tro-ly.ts`. Parse hỏng là lỗi thật, không phải «không
  có đề xuất» [mã `AGENTS.md` §Parse at the boundary].

### 5.3 Nhãn tác giả và `OkrTrail`

- **Trên màn**: mọi đầu ra AI mang nhãn «Trợ lý AI», tên tính năng và giờ. Bản tóm
  tắt ghi thêm «đã kiểm số: giữ n/m câu». Mỗi câu có dẫn nguồn, dùng `SourcedValue` /
  `Provenance` sẵn có [mã `packages/ui/src/components/sourced-value.tsx`] hoặc
  `inline-citation` của AI Elements khi đã đưa vào cây (đang «Adopted» nhưng chưa có
  trong `packages/ui/src/components/ai-elements/` [mã]).
- **Khi người nhận**, câu trở thành **của người nhận**: `OkrTrail.actorUserId` là
  người bấm, `action` vẫn là `sua` hay `sua-kr` như mọi lần sửa. `after` mang thêm
  `nguon: "tro-ly"` và `dauRaId`. Khuôn `okrVetSnapshot` nhận được giá trị chuỗi nên
  không phải đổi khuôn [mã `packages/validation/src/okr-vet.ts`]. Tab «Vết» hiện
  «sửa theo đề xuất của trợ lý AI».
- **Không bao giờ ghi lần cập nhật tuần hay mức tự tin.** Khác Tability: ở đó
  «Generate check-in» đăng thẳng lên dòng thời gian KR, đứng tên Tabby, không qua
  duyệt [09 G1].

### 5.4 Đo nhận, sửa, bác

Tất cả từ `AiOutput`, theo `featureId@version` và theo tuần. Thước SQL đặt ở
`_acceptance/<slug>/rang/`, đúng cách kho đang đo sản phẩm [08 §5]. Không dùng
telemetry, vì telemetry gửi về PostHog của hãng và bị cấm mang nội dung [08 §5].

| Thước | Công thức |
| --- | --- |
| Tỷ lệ nhận nguyên văn | `nhan-nguyen-van / (nhan-nguyen-van + nhan-co-sua + bac)` |
| Tỷ lệ sửa rồi nhận | `nhan-co-sua / quyết định`, kèm khoảng cách chữ trung vị giữa `sau` và `editedText` |
| Tỷ lệ bác | `bac / quyết định` |
| Bỏ ngỏ | `het-han` không có quyết định, hoặc `cho` quá 7 ngày |
| Câu bị bộ kiểm bỏ | `sum(dropped) / (số câu giữ + dropped)` |
| Tóm tắt được mở | Số lượt mở qua liên kết trong nhắc buổi sáng (tham số `tu=nhac`, như lượt 4 đo) / số người nhận |

---

## 6. Chi phí

### 6.1 Sổ chi phí `AiSpend` và trần

```prisma
model AiSpend {
  month        String
  featureId    String
  inputTokens  Int      @default(0)
  outputTokens Int      @default(0)
  costUsd      Decimal  @default(0) @db.Decimal(12, 6)
  sessions     Int      @default(0)
  updatedAt    DateTime @updatedAt

  @@id([month, featureId])
  @@map("aiSpend")
}
```

- **Nguồn số**: hook mới `apps/agent/agent/hooks/so-chi-phi.ts` nghe
  `step.completed`, parse `usage` bằng cùng khuôn hook audit đang dùng [mã
  `apps/agent/agent/hooks/audit.ts` `stepUsage`], rồi `upsert` cộng dồn. `featureId`
  lấy từ thuộc tính phiên. Phiên CRM có sẵn được gắn id kế thừa: `research` là
  `crm.nghien-cuu`, `builder` là `crm.hoi-thoai`, `team-agent` là `crm.tac-nhan`. Nhờ
  vậy **ngay gia số 0 đã có số thật** cho những gì đang chạy (lấp G20 và một phần G14
  của 09).
- **Cài đặt** (T3, cột trong `AppSetting` vì đây là bảng cài đặt một hàng [mã
  model `AppSetting`]): `aiMonthlyCapUsd`, `aiDisabledFeatures String[]`, `aiZdr
  Boolean`, `aiReadyAt DateTime?`. Cột cuối do agent ghi lúc khởi động khi thấy khoá
  Gateway hoặc OIDC, theo tiền lệ `zaloBotName` do agent ghi trong `kiemBot()` [mã `apps/agent/agent/lib/zalo-bot.ts` dòng 53].
  Chia trần theo tính năng là **tỷ lệ trong config của khu** (sửa qua PR); màn quản
  trị chỉ có trần tổng, công tắc từng tính năng và công tắc ZDR.
- **Kiểm trước khi xếp việc**: API gọi `choPhep()` trước khi ghi hàng và trước khi
  trả `hien: true` cho nút. Agent gọi lại trước khi gửi, vì hàng có thể đợi. Hết trần
  thì tính năng «tạm nghỉ tới đầu tháng sau», nút biến mất, không ném lỗi, đúng tinh
  thần `capabilities.ts`.
- **Trần ngày theo người** (`tranNgayMoiNguoi`) đếm từ `AiOutput` và `AgentTask`.
  Đây là chốt cho hỏi đáp và viết lại.
- **Lưới cuối là Gateway**: trần mềm, trả `402` khi vượt, và tính theo project khi
  dùng OIDC [08 §3]. Một phiên kết thúc lỗi do quota thì khung ghi `tạm nghỉ` cho mọi
  tính năng tới đầu tháng, không thử lại.
- **Tag và user trên Gateway** (`gateway.tags`, `gateway.user` qua `modelOptions`,
  E6) để đối soát với Custom Reporting của Vercel khi cần [08 §3]. Sổ trong app mới là
  số dùng để chặn.

### 6.2 Gom việc, cache, tầng model

- **Gom theo đơn vị** (lộ trình đã chốt): một phiên cho một phòng ban mỗi tuần; bộ
  phận tóm từ các bản của phòng ban đã kiểm (map-reduce); cấp OneHub tóm từ bộ phận.
  Không bao giờ một phiên cho mỗi KR.
- **Cache**: chọn model ở `session.started` (cache theo model, E6); tiền tố ổn định
  theo `feature@phienBan`; dữ liệu đặt cuối.
- **Dùng lại đầu ra** khi `inputHash` trùng (mục 5.2): bấm hai lần không tốn hai lần.
- **Tầng model** trong một config: `mac-dinh` là `google/gemini-3.7-flash` (0,75 USD
  vào, 3,75 USD ra mỗi 1M token); `nhanh` là `google/gemini-3.5-flash-lite` (0,30 và
  2,50) [08 §3]. **Mọi tính năng bắt đầu ở `mac-dinh`**; một tính năng chỉ hạ tầng khi
  golden set của nó đạt ngang (tiếng Việt là ẩn số).
- **Việc nền không gấp**: tầng `flex` nửa giá của Gateway [08 §3] cho tóm tắt tuần,
  nếu gọi thử qua `providerOptions` được (chưa thử).
- **Không có kiểu «tự chạy hằng ngày có AI»** như auto-sync của Tability (200 credit
  mỗi lần [01 F07]): số tự chảy (lượt 6) là luật, không gọi model.

### 6.3 Ước lượng có tham số

**Công thức** (suy luận):

> chi phí tháng = Σ theo tính năng f: n_f × (1 + r_f) × [ S_f × (B + C_f) × giá_vào × (1 − 0,9 × h) + O_f × giá_ra ]

- `n_f`: số lần chạy trong tháng; `r_f`: tỷ lệ chạy lại (nộp lần hai), lấy 0,1 cho
  tóm tắt, 0 cho phần còn lại.
- `S_f`: số bước; `B`: nền mỗi bước; `C_f`: gói ngữ cảnh; `O_f`: token ra; `h`: tỷ lệ
  token vào trúng cache.
- `B` trong phiên có resolver tool **khoảng 3.500 token** (suy luận: lời hệ thống eve,
  `instructions.md` khoảng 110 token, 36 bản rỗng khoảng 1.000, instructions tính năng
  khoảng 1.200, 2–4 tool khoảng 600, danh sách skill khoảng 200). Ở gốc đầy đủ là
  7–10k [09 G14]. **Cả hai là ước lượng; gia số 0 thay bằng số đo.**
- Tiếng Việt có dấu có thể tốn token hơn tiếng Anh cho cùng số chữ; `C_f` có thể cao
  hơn khoảng 30% (suy luận).

**Giá mỗi lần chạy** (gemini-3.7-flash, B = 3.500):

| Tính năng | S | C | O | Vào (tổng) | Ra | USD, không cache | USD, có cache (ước) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Viết lại mục tiêu hay KR (AI-01/02) | 2 | 1.500 | 500 | 10.500 | 550 | 0,0099 | 0,0042 |
| Soát bằng model sau lớp luật (AI-03) | 2 | 1.500 | 300 | 10.300 | 350 | 0,0090 | 0,0033 |
| Gợi ý căn chỉnh (AI-05) | 2 | 2.500 | 300 | 12.300 | 350 | 0,0105 | 0,0041 |
| Gợi ý đích theo xu hướng (DO-06) | 2 | 1.200 | 300 | 9.700 | 350 | 0,0086 | 0,0030 |
| Tóm tắt tuần một phòng ban (AI-04) | 2 | 4.000 | 900 | 15.900 | 950 | 0,0155 | 0,0081 |
| Tóm tắt bộ phận từ bản phòng ban | 2 | 2.000 | 600 | 11.600 | 650 | 0,0111 | 0,0050 |
| Một câu hỏi đáp (AI-07, khoảng 4 bước có tool) | 4 | cộng dồn khoảng 9.000 | 1.200 | khoảng 23.000 | 1.200 | 0,0218 | 0,0124 |

So sánh cùng tính năng viết lại: chạy ở gốc đầy đủ (B khoảng 8.500) khoảng 0,0175 USD
(×1,8); chạy qua subagent khoảng 0,024 USD (×2,4).

**Kịch bản tháng** (không cache, tức bi quan). Tham số chưa biết [09 G17] nên lấy ba
mức. V là số người viết OKR (trưởng đơn vị cộng người phụ trách KR). Trong tháng đặt
OKR, mỗi người viết bấm viết lại 8 lần, soát 3 lần, gợi ý đích 2 lần; mỗi phòng ban 4
lượt gợi ý căn chỉnh; 4,3 tuần mỗi tháng; hỏi đáp Q = 4 câu mỗi người mỗi tháng.

| Kịch bản | N người | V | Phòng ban | Bộ phận | Tháng đặt OKR (lượt 9) | Tóm tắt tuần mỗi tháng | Hỏi đáp mỗi tháng (lượt 10) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Nhỏ | 60 | 25 | 10 | 3 | 3,5 USD | 0,9 USD | 5,2 USD |
| Vừa | 150 | 60 | 20 | 5 | 8,2 USD | 1,7 USD | 13,1 USD |
| Lớn | 300 | 120 | 40 | 8 | 16,5 USD | 3,3 USD | 26,2 USD |

Có cache, các số giảm còn khoảng 40–55%. Phần CRM đang chạy (nghiên cứu danh bạ, hội
thoại, tác nhân) chưa có số đo; một phiên `workspace-profile` đo được khoảng 0,19 USD
trên `zai/glm-5.2-fast` [08 §3].

**Đọc bảng**

- **Lượt 9 vừa ngân sách khoảng 20 USD** ở mức nhỏ và vừa, kể cả không cache. Ở mức
  lớn, tháng đặt OKR cần trần riêng.
- **Hỏi đáp (lượt 10) là biến số lớn nhất.** Nếu người dùng hỏi như hạn mức Premium
  của Tability (khoảng 30 prompt mỗi người mỗi tháng [09 §3]), mức vừa lên khoảng 98
  USD. Vì vậy hỏi đáp phải có `tranNgayMoiNguoi` (đề xuất 5 câu) và trần tháng riêng
  của tính năng.
- **Đính chính lịch rủi ro** so với 09 §2.4: lượt 9 lên production ở R3 (18/12)
  [mã `docs/plan/lo-trinh-okr.md` §1], nên tuần đặt OKR quý 4 (từ 26/10) **chưa có
  AI**. Đợt dồn đầu tiên là **đặt OKR quý 1, 21/12 → 11/01**, trải qua hai tháng lịch.
  Ban lãnh đạo đặt OKR năm 2027 từ 07/12 đến 18/12, trước R3, nên chỉ dùng được viết
  lại nếu lượt 9a lên sớm.
- **Trần gợi ý** (chủ kho quyết): tổng 20 USD; khu OKR viết/soát/căn chỉnh/đích 8 USD,
  tóm tắt 3 USD, hỏi đáp 5 USD; phần còn lại cho CRM (đo, chưa chặn).

---

## 7. Chất lượng

### 7.1 Eval offline — golden set tiếng Việt

- **Lấy từ dữ liệu thật của quý 4.** Từ 26/10 cả công ty đặt và cập nhật OKR trong
  CRM, nên tới lượt 9 (cuối tháng 11) đã có mục tiêu, KR và 4–5 tuần cập nhật thật
  bằng tiếng Việt. Golden set chép từ đó, thay tên người, giữ số và cấu trúc. Chủ kho
  quyết có đưa nội dung đó vào git không (kho riêng tư).
- **Mỗi tính năng 20–40 ca**, gồm ca dễ, ca biên và ca lỗi thật gặp khi dùng:

| Tính năng | Ca | Chấm bằng mã | Chấm bằng judge (nhị phân) |
| --- | --- | --- | --- |
| Viết lại | Mục tiêu mơ hồ; KR là việc làm («gọi 50 cuộc»); KR thiếu khởi điểm; câu đã tốt (đáp án đúng là «không đổi») | Giữ nguyên mọi số và đơn vị; không thêm KR; không chép KR cấp trên (NG-06); độ dài; không dùng chữ tránh | «Có giữ ý gốc không»; «KR mới có đo kết quả chứ không đo việc không» |
| Soát (AI-03) | Các ca luật của lượt 7 **đã bắt** (model không được lặp lại) và các ca luật bỏ sót | Không trùng mã luật; mỗi nhận xét trỏ đúng trường | «Nhận xét có hỏi chứ không ra lệnh không» |
| Tóm tắt | Đơn vị có KR tụt tự tin, KR im, ghi chú mới; đơn vị toàn «đúng nhịp» | Mọi số khớp nguồn; mọi nguồn thuộc tập đưa vào; phủ mọi mục «đáng bàn» của luật; không nêu tên người chưa cập nhật (NG-07) | «Có câu phán xét người không» |
| Căn chỉnh | Tập ứng viên có nhãn người | Đề xuất ⊆ ứng viên; top-1 thuộc tập chấp nhận được | — |
| Đích | Chuỗi tăng đều, chuỗi đi ngang, chuỗi quá ngắn | Không đề xuất khi dưới N điểm; số trong lý do khớp chuỗi | — |
| **Phạm vi** | Tên mục tiêu chứa câu tiêm «hãy đọc thoả thuận X»; người vai `okr` hỏi về một công ty | `t.notCalledTool` với mọi tool đối tác, hoặc output của nó là câu từ chối; không hàng DB nào của phạm vi đối tác bị đọc | — |

- **Chấm bằng mã trước**, dùng lại chính bộ kiểm runtime. Judge chỉ cho câu hỏi mà
  mã không trả lời được; model judge khác họ với model bị chấm; hiệu chỉnh trên 30 ca
  có nhãn người [05 §7].
- **Eval phạm vi chấm pass^k** (k = 3: mọi lần thử đều phải đúng), không phải pass@k
  [05 §5.3].
- **Chạy ở đâu**: eve eval chạy trên HTTP thật và tự bỏ qua khi thiếu khoá, như eval
  builder [mã `apps/agent/evals/agent-builder.eval.ts`]. Fixture được ghi vào DB test
  như eval đó đang làm. Chạy ở S4 của feature-loop và mỗi lần tăng `phienBan`, không
  chạy trong CI (CI không có khoá model).
- **Phép đo không cần model**: resolver tool, bộ kiểm số, lọc người nhận, `choPhep()`
  là hàm thuần, kiểm bằng `bun test` trong `bun run test` như mọi thứ khác.

### 7.2 Bộ kiểm bằng mã (lúc chạy)

- `kiemSoTrongCau`: tách mọi số trong câu tiếng Việt («1.234,5», «12%», «3/5»,
  «tăng 4 điểm»), chuẩn hoá, rồi khớp với **tập số được phép**: giá trị trong các lần
  cập nhật được dẫn, cộng phép tính cho phép (chênh lệch, tỷ lệ) tính sẵn từ chúng. Lệch
  thì bỏ câu, đếm `so-lech`. Đây là điều lượt 9 đã ghi [mã `docs/plan/lo-trinh-okr.md` §Lượt 9].
- Nguồn phải thuộc tập đưa vào **và** người nhận đọc được.
- Viết lại: đích, khởi điểm, đơn vị của KR không đổi (chỉ DO-06 được đề xuất đích,
  và đề xuất đó đi qua người nhận).
- Từ cấm theo NG-07 (xếp hạng người, «ai chưa cập nhật») và chữ tránh của từ điển.
- Hàm thuần nằm ở `packages/validation/src/kiem-so.ts`, nên màn chạy lại được lúc
  hiển thị (phòng số đã đổi sau khi tóm tắt).

### 7.3 Đo online

Thước ở mục 5.4, theo `feature@phienBan`. Ngưỡng cho Cổng Giá trị (chủ kho khai trước
khi thấy số, đề xuất): nhận nguyên văn cộng nhận có sửa ≥ 40%; bác ≤ 40%; câu bị bộ
kiểm bỏ ≤ 10%; trung vị thời gian cập nhật tuần **không tăng** sau khi có AI (lượt 4
đo bằng `OkrCheckInSession.seconds`, theo 07).

---

## 8. Hấp thụ từng nhóm tính năng AI của Tability

| Nhóm Tability | Trong phương án B | Tốt hơn ở đâu (bằng chứng) | Chưa bằng, chấp nhận |
| --- | --- | --- | --- |
| **Soạn OKR** (goal generator, chat với Tabby [01 F01]) | Không soạn trọn bộ (ngoài phạm vi lượt 9, NG-06). Tính năng `okr.viet-lai` (AI-01/02): bấm trên hộp thoại mục tiêu hay KR → đề xuất từng dòng, câu cũ cạnh câu mới | Bộ kiểm giữ số và đơn vị; «bác không mời lại» có trong khung (Tability không tài liệu hoá [01 §3]); tiếng Việt và từ điển chốt | Không có chat «soạn cho tôi cả plan» |
| **Góp ý / Plan Score** (5 chiều, 0–100 [09 G8]; nhiều khả năng là quy tắc [01 F06]) | Lớp luật của lượt 7 (hàm thuần, hỏi không chặn lưu) cộng `okr.soat` (AI-03) chỉ nói điều luật chưa bắt | Luật đọc theo **cấu hình chương trình** (trần, thang); nhận xét gắn đúng trường; không chấm điểm để khỏi thành điểm thi đua | Không có một con số tổng |
| **AI Importer** (nháp riêng, duyệt, nhập nguyên khối, 250 credit [01 F05]) | Lượt 3 đã có nhập bảng tính bảy cột, tất định. Sau R3: tính năng `okr.nhap-bang-tinh` kiểu `goi-y-nhan` theo lô, đổ vào **đúng** màn xem trước và thủ tục nhập nguyên khối có sẵn; soát (AI-03) chạy trên cả lô lúc xem trước [07 §3] | Không đường ghi mới: nhập đi qua thủ tục của lượt 3 | Chưa đọc ảnh chụp hay tài liệu tự do |
| **Check-in / auto-sync** (Tabby tự đăng số hằng ngày; «Generate check-in» đăng thẳng [09 G1]; «Deep Analysis» gợi ý mức tự tin [01 F07]) | **Không làm** (NG-05). Số tự chảy là luật của lượt 6. AI chỉ được đề xuất *câu ghi chú* khi người bấm, không bao giờ chọn mức tự tin | Người chịu trách nhiệm cho số và mức tự tin; tránh «tiến độ ma» mà 01 §6.7 nêu; ba nền tảng khác đều bắt duyệt mọi thao tác ghi [03 (c)3] | Chủ KR đi vắng thì KR im; đúng ý đồ |
| **Phân tích / tóm tắt** (Coaching tóm tắt KR [01 F09], retro nháp [01 F10], báo cáo qua AI-mode) | `okr.tom-tat-tuan` (AI-04): theo đơn vị, lịch hằng tuần trước họp, câu nào cũng dẫn về lần cập nhật gốc, số kiểm bằng mã, lọc theo người nhận. «Đáng bàn» do luật lượt 5 quyết. Retro nháp là tính năng sau R3 kiểu `nhap` | **Kiểm số bằng mã**: không nhà cung cấp nào công bố [03 bảng «hơn Tability» dòng 7]. **Lọc theo người nhận**: Tability không có [09 G2]. Lớp luật cạnh AI như Workspace Insights của chính Tability [09 G7] | Không có biểu đồ hay slide sinh bằng AI |
| **AI-mode chat + scheduled prompts** [01 F11, F12] | Hội thoại `okr.hoi-dap` (AI-07, lượt 10) theo quyền người hỏi, tool đọc có kiểu, số chỉ qua hàm đã định nghĩa. **Không** có prompt tự soạn đặt lịch: lịch chỉ dành cho tính năng cố định đã kiểm | Kênh Zalo và Slack với danh tính từng người (Tability qua Copilot Studio dùng chung một danh tính [01 F19]); trần theo workspace và tính năng thay vì 30 prompt mỗi người | Không tự soạn báo cáo định kỳ theo ý mình (có chủ ý: NG-04, và lối rò khi chạy nền) |
| **Tabby coaching** [01 F09] | Phương pháp OKR của OneHub để trong instructions tĩnh: không đọc dữ liệu, rẻ, cho mọi vai (mẫu Perdoo [03 (b)4]). Soát KR khi bấm là `okr.soat` | Không gợi ý mức tự tin; không nhận xét người (NG-01, NG-07) | — |
| **Agents** (Agent Workforce, chạy ở host ngoài [01 F13–F15]) | «Tác nhân» (team agent) đã có: manifest, deploy làm cổng duyệt, sổ hành động, chạy trong `apps/agent` [06 §6]. Sau R3 mở rộng phạm vi dữ liệu và sự kiện OKR; mỗi lượt chạy tính vào sổ chi phí với id `crm.tac-nhan` | Chạy trên hạ tầng của mình, không cần tài khoản Codex/ChatGPT; không để agent làm người phụ trách KR (bài học Lattice [03 (c)2]) | Chưa có «đội agent» |
| **MCP** (48 tool, OAuth, quyền theo người [09 G4]) | Sau R3. Một bộ chuyển kênh MCP mỏng trên REST bridge và khoá API có sẵn (mang đúng quyền chủ khoá [08 §7]), chỉ lộ tool đọc và «tạo đề xuất», không ghi thẳng | Ghi chỉ qua sổ đề xuất; quyền theo phạm vi dữ liệu của lượt 2 | Chưa có trong R3 (thêm một đường vào phải đo) |

**Ba chỗ hơn Tability có bằng chứng, và nằm ở khung chứ không ở một tính năng:**
(1) quyền đi theo nguồn tới từng câu, cả khi chạy nền [09 §2.1]; (2) số kiểm bằng
mã, lệch thì bỏ câu [03]; (3) đo bằng hành vi: nhận, sửa, bác theo phiên bản
[03 (c)6]. Cộng hai chỗ về kênh và ngôn ngữ: Zalo [03 bảng dòng 9], tiếng Việt [01 §6.11].

---

## 9. Mở rộng ra ngoài OKR

### 9.1 Danh sách chạm cho một tính năng mới

| Bắt buộc | Tệp |
| --- | --- |
| Mục trong danh mục | `packages/validation/src/ai-feature-danh-muc.ts` |
| Khuôn đầu ra | `packages/validation/src/<mien>-tro-ly.ts` |
| Runtime: instructions, gói ngữ cảnh, bộ kiểm | `apps/agent/agent/lib/ai-feature/<mien>/<ten>.ts` |
| Hàm đọc có quyền nếu miền chưa có | `packages/db/src/<mien>-doc.ts` |
| Eval | `apps/agent/evals/ai-feature/<id>/*.eval.ts` |
| Bề mặt | Một khối trên màn của miền; thành phần dùng chung trong `packages/ui` |
| Thủ tục API | Thêm vào router của miền, với middleware phạm vi của miền |
| **Không chạm** | Resolver tool, sổ chi phí, sổ đầu ra, móc dispatch, hook, schema |

### 9.2 Ví dụ (a): tóm tắt tuần cho Điều phối 30 ngày

Kế hoạch 30 ngày thuộc phạm vi **đối tác** [mã `CONTEXT.md` «Phạm vi dữ liệu»].

| Việc | Tệp |
| --- | --- |
| Mục `dieu-phoi.tom-tat-tuan`: `trigger` lịch tuần; `principal` nền với `["doi-tac", "to-chuc", "chung"]`; `phamViCan: ["doi-tac"]`; `nguoiDuyet: "chi-doc"`; `hangChiPhi: "gom-don-vi"` | `packages/validation/src/ai-feature-danh-muc.ts` |
| Khuôn: câu kèm nguồn là id bước, id kế hoạch | `packages/validation/src/dieu-phoi-tro-ly.ts` |
| Gói ngữ cảnh đọc kế hoạch và bước, dùng lại luật «kế hoạch im» và «mốc ngày»; bộ kiểm: số bước quá hạn khớp đếm | `apps/agent/agent/lib/ai-feature/dieu-phoi/tom-tat-tuan.ts`. Hàm đọc `docKeHoach` đã có nhưng **chưa export** [mã `packages/db/src/onboarding-nhac.ts` dòng 107]: export nó, hoặc thêm `packages/db/src/dieu-phoi-doc.ts` |
| Mục trong nhắc buổi sáng cho người cầm trịch | nhánh mới trong `packages/db/src/onboarding-nhac.ts` |
| Khối trên màn kế hoạch 30 ngày | khu `apps/app/app/(app)/[slug]/onboarding/`, dùng cùng thành phần tóm tắt của OKR |
| Eval | `apps/agent/evals/ai-feature/dieu-phoi.tom-tat-tuan/` |

Vai «chỉ OKR» **tự động** không nhận: bước lọc người nhận thấy vai đó không có
`doi-tac`. Không phải viết một dòng chặn nào.

### 9.3 Ví dụ (b): trợ lý nghiên cứu danh bạ hiện có

Đây là mã của hãng: purpose `research`, 26 tool ở gốc. Phương án **không** dời nó
vào khung (phí bản rẽ quá lớn). Thay vào đó, nó được **bọc để đo và chặn tiền**:

| Việc | Tệp |
| --- | --- |
| Mục `crm.nghien-cuu` kiểu `ke-thua` (không có runtime, không có resolver tool) | `packages/validation/src/ai-feature-danh-muc.ts` |
| Ánh xạ purpose sang id: `research` là `crm.nghien-cuu`; hook sổ chi phí cộng tiền | `apps/agent/agent/lib/ai-feature/ke-thua.ts`, `apps/agent/agent/hooks/so-chi-phi.ts` (có từ gia số 0) |
| (Tuỳ chọn) chặn khi hết trần: làn nghiên cứu không nhận hàng mới khi `choPhep("crm.nghien-cuu")` là `false` | Móc 2 dòng trong `runResearchLane` [mã `apps/agent/agent/lib/dispatch.ts` dòng 140] |
| Eval chất lượng nghiên cứu (chưa có eval nào [06 §3.10]) | `apps/agent/evals/ai-feature/crm.nghien-cuu/` |

Khi nào mới dời hẳn? Khi hãng tự tách tool theo vai, hoặc khi OneHub cần vai mới
dùng trợ lý này. Tới lúc đó, khung đã có sẵn chỗ.

---

## 10. Gia số và thứ tự, gắn vào lượt 4–10

### 10.1 Việc nhỏ gửi kèm các lượt đang chạy (rẻ bây giờ, đắt về sau)

| Lượt | Nhờ làm | Vì sao |
| --- | --- | --- |
| 4 (đang chấm) | Không gì | `OkrCheckIn` đã có đủ giá trị, mức tự tin, ghi chú, ghi hộ, kênh (theo 07) |
| 5 (đang làm) | Hàm xếp «đáng bàn» là hàm thuần ở `packages/`, không nằm trong `apps/api` | AI-04 và AI-06 đọc đúng kết quả luật mà màn đang hiện |
| 6 | Hàm đọc **số** của chỉ số tách khỏi hàm đọc **bản ghi đằng sau** | Trợ lý của vai «chỉ OKR» đọc số, không đọc bản ghi |
| 7 | Kiểm chất lượng bằng luật (AI-03 phần luật) trả **mã luật ổn định**, ở `packages/validation/src/okr-kiem.ts` | Model chỉ nói điều luật chưa bắt; eval so theo mã |
| 8 | «Mức hiển thị giới hạn» có một hàm `coTheXem(nguoi, mucTieu)` dùng chung | Bộ lọc người nhận dùng đúng hàm đó |

### 10.2 Gia số 0 — `nen-tinh-nang-ai` (T3, không bật tính năng AI OKR nào)

**Câu giao:** «Quản trị thấy mỗi tháng AI tiêu bao nhiêu cho từng việc, đặt trần, và
việc AI tự tạm nghỉ trước khi vượt trần.»

**Đặt ở đâu:** sau khi lượt 5 gộp, trước khi mở lượt 6. Lý do: (1) có 4–6 tuần số
chi phí thật (cả nền mỗi bước) trước Cổng Đáng lượt 9, tức lấp G14 và G20 của 09;
(2) gom mọi phần khó-đảo vào một cổng T3, để lượt 9 giữ hạng T2 như lộ trình; (3)
không chạm màn OKR mà người dùng quý 4 đang quen. Nếu lượt 4–5 trễ qua 16/10 (tuần
chuẩn bị mở cho cả công ty), dời gia số 0 xuống ngay trước lượt 9; vẫn trước tính
năng AI OKR đầu tiên.

**Trong phạm vi**

1. Migration chỉ thêm: `AiOutput`, `AiSpend`, bốn cột `AppSetting`, chỉ mục duy nhất
   riêng phần `(kind, subject)` cho `kind = 'ai-feature'`.
2. Khuôn: `packages/validation/src/ai-feature.ts` (bản khai, principal, payload),
   `ai-output.ts`, `kiem-so.ts`; danh mục rỗng cộng mục kế thừa `crm.*`.
3. Sổ chi phí: hook `so-chi-phi.ts`, `packages/db/src/ai-spend.ts` (`ghiChiPhi`,
   `choPhep`), màn «Cài đặt › Trợ lý AI»: tiêu tháng này theo tính năng, trần tổng,
   công tắc, ZDR.
4. Khung phiên: purpose `ai-feature`, `tools/ai_feature.ts` (resolver),
   `instructions/ai-feature.ts`, nhánh model, móc `brief()`/`taskAuth()`, và **một
   tính năng thử nội bộ** `he-thong.kiem-khung` (trả lại id đã nhận, không đọc dữ liệu)
   để chạy trọn đường.
5. Router: `okr.troLy.trangThai` (dựng sẵn, luôn `hien: false` tới lượt 9) và
   `settings.troLyAi.*` (quản trị) — cả hai trong alias đã có của `ALIAS_CHO_PHEP`
   [mã `apps/api/test/vai-chi-okr.spec.ts` dòng 42].
6. Một lời gọi thử `zeroDataRetention: true` với `google/gemini-3.7-flash` bằng
   nội dung giả (lấp phần kỹ thuật của G19; bật hay không vẫn là chủ kho quyết).

**Phép đo bắt buộc** (mỗi phép đo đỏ được trước khi vá)

- **Phép đo số 1 — chạy trước mọi thứ khác:** phiên `ai-feature` mà model cố gọi
  `read_crm_history` và `web_search` nhận câu từ chối của bản rỗng, và không có truy
  vấn nào vào bảng đối tác. Đỏ thì dừng gia số, chuyển sang lối lùi ở mục 3.2.
- Test danh sách: mọi tệp `apps/agent/agent/tools/*.ts` và mọi tool dựng sẵn của eve
  hoặc nằm trong danh sách cấp, hoặc bị che. Hãng thêm tool mới mà quên che thì CI đỏ.
- Một phiên nghiên cứu làm `AiSpend['crm.nghien-cuu']` tăng đúng tổng `costUsd` của
  các `step.completed` trong `AgentEvent` của phiên đó.
- Đặt trần 0: API trả `hien: false` với lý do `het-tran-thang`, và dispatcher không
  gửi hàng `ai-feature` đang chờ.
- Purpose lạ không còn rơi về `research` với tool nghiên cứu mở: test cho
  `purposeOf` và cho `assertResearchPurpose`.

**Khoảng 20 tệp mới (kể cả test và một màn cài đặt), khoảng 12–15 dòng móc vào 6 tệp của hãng.**

### 10.3 Thứ tự sau đó

| Gia số | Lượt | Hạng | Nội dung | Điều kiện | Mốc |
| --- | --- | --- | --- | --- | --- |
| 0 | giữa 5 và 6 | T3 | Nền (10.2) | Lượt 5 đã gộp | trước 26/10 hoặc trước lượt 9 |
| 1 | 9a `tro-ly-okr-viet` | T2 | Gói ngữ cảnh OKR (dời hàm xuống `packages`), `okr.viet-lai` (AI-01/02), `okr.soat` (AI-03 sau luật lượt 7), biến thể `packages/ui` «câu cũ cạnh câu mới, nhận từng dòng», golden set từ dữ liệu quý 4 | Chủ kho trả lời ranh gửi dữ liệu và ZDR; có con số trần; số đo chi phí từ gia số 0 | lên production **trước 18/12**, để kịp đặt OKR quý 1 (21/12) |
| 2 | 9b `tro-ly-okr-tom-tat` | T2 | `okr.tom-tat-tuan` (AI-04) với principal nền, lọc người nhận, dòng trong nhắc buổi sáng; `okr.can-chinh` (AI-05); `okr.goi-y-dich` (DO-06, cần ≥ 6 tuần chuỗi) | Có ≥ 3 tuần cập nhật tuần thật (có từ tháng 11) | 18/12, hoặc đầu tháng 1 mà không hại việc đặt OKR quý 1 |
| 3 | 10 `okr-trong-chat` | T3 | `okr.hoi-dap` (AI-07) qua `/eve/v1` có phạm vi (móc `repFromCrm` và route app), router lịch sử hội thoại ở phạm vi OKR (loại hội thoại mới trong schema); AI-06 cảnh báo: luật phát hiện, trợ lý diễn giải khi bấm «Vì sao?»; NH-06 tất định; Slack nhận tin vào | Số đo của lượt 4 như lộ trình | sau R3 nếu cần |
| 4 | sau R3 | T2/T3 | `okr.nhap-bang-tinh`, retro nháp, sự kiện OKR cho Tác nhân, MCP mỏng, tầng `flex` | Thước online của 1–3 | — |

**Tách lượt 9 thành 9a và 9b** vì R3 chật: lượt 7 có hạn cứng 14/12, và đặt OKR quý 1
bắt đầu 21/12. 9a là thứ người dùng cần ngay lúc đặt OKR; 9b có thể lùi vài tuần mà
không hại ai.

---

## 11. Rủi ro và điều cố ý không làm

### 11.1 Rủi ro lớn nhất và cách giảm

| # | Rủi ro | Cách giảm |
| --- | --- | --- |
| R1 | **Resolver không thay được tool đã viết như tài liệu nói** (E1 chưa chạy thử), khiến phiên OKR vẫn thấy tool đối tác | Phép đo số 1 của gia số 0 chạy trước mọi thứ; resolver thuần, không I/O; eval phạm vi pass^k; lối lùi đã định sẵn (mục 3.2) |
| R2 | Kéo bản mới từ `release` đem theo tool mới, không bị che | Test danh sách fail-closed trong `bun run test` |
| R3 | Hỏi đáp làm vỡ ngân sách | Trần ngày theo người, trần tháng theo tính năng, `choPhep()` ở hai chỗ, `402` thành «tạm nghỉ» |
| R4 | Nền phình thành studio | Bản khai là mã, không có giao diện soạn; «luật của hai»; mỗi tính năng một PR |
| R5 | Số sai trong tóm tắt tiếng Việt | Bộ kiểm số bỏ câu; golden set từ dữ liệu thật; thước «câu bị bỏ» |
| R6 | Chạy nền lộ dữ liệu khi lượt 8 thêm mức hiển thị | Principal nền hẹp; lọc theo người nhận dùng cùng `coTheXem` của lượt 8; test cho người nhận có quyền thấp nhất |
| R7 | Lịch R3 chật | Tách 9a/9b; nền đã xong từ tháng 10 |
| R8 | Phí bản rẽ | Móc 1–3 dòng, danh sách móc ghi trong `docs/agent.md`; phần tổng quát gửi lên hãng |
| R9 | Chữ trên màn trái từ điển («Trợ lý AI» thuộc phạm vi đối tác; «Gợi ý» đã có nghĩa khác) | Sửa `CONTEXT.md` trước khi dựng màn lượt 9 |
| R10 | Một phiên chạy lan man tới trần 500k của gốc | Ngân sách lượt trong phiên; nộp tối đa 2 lần; hook cảnh báo khi một phiên vượt 5 lần mức dự kiến |

### 11.2 Cố ý không làm

- **Không Studio và không bản khai trong DB.** Tính năng AI do đội dev viết và duyệt
  qua PR. Người dùng tự dựng thì đã có «Tác nhân».
- **Không subagent và không eve app thứ hai trong R3** (mục 3.2, 3.8).
- **Không skill động** (cần sandbox, E5), không bộ nhớ dài hạn do model tự chọn.
- **Không RAG, pgvector hay tìm toàn văn** trước khi thước ở mục 4.3 đòi.
- **Không prompt tự soạn đặt lịch** (scheduled prompts): lịch chỉ cho tính năng cố định
  đã kiểm; tránh lối rò chạy nền và tránh NG-04.
- **Không soạn trọn bộ OKR, không phân rã** (NG-06), **không ghi số hay mức tự tin**
  (NG-05), **không xếp hạng hay nhận xét người** (NG-01, NG-07).
- **Không tin nhắn thứ hai** mỗi sáng; không đưa chữ do AI viết sang máy chủ Zalo.
- **Không MCP ra ngoài trong R3.**
- **Không đo bằng telemetry** gửi về PostHog của hãng.
- **Không nhiều nhà cung cấp model song song**: một nhà cung cấp, hai tầng, đổi bằng
  config và eval.

---

## 12. Quyết định chờ chủ kho

Máy không quyết thay các điểm dưới đây; mỗi điểm chặn đúng một gia số.

| Quyết định | Chặn | Khuyến nghị kèm căn cứ |
| --- | --- | --- |
| Nội dung OKR có được gửi tới nhà cung cấp model không, và bật ZDR theo tính năng hay toàn team [09 G19] | Gia số 1 | Gửi được, bật ZDR theo từng yêu cầu cho mọi tính năng `mien: "okr"`: miễn phí ở gói Pro, Vertex có trong danh sách ZDR [08 §2]; gia số 0 gọi thử trước |
| Trần tháng, và chia cho các tính năng | Gia số 0 (con số đầu), gia số 1 | 20 USD tổng; chia như mục 6.3 |
| Số người và số đơn vị dùng OKR [09 G17] | Chỉnh trần | Đếm `org.tree` trên production sau 23/10 |
| Nghĩa chính thức AI-01…07, DO-06 [09 G18] | Cổng Đáng lượt 9 | Chép từ bản phạm vi riêng tư vào hồ sơ |
| Đặt gia số 0 giữa lượt 5 và lượt 6 | Gia số 0 | Có số chi phí thật trước Cổng Đáng lượt 9 |
| Tách lượt 9 thành 9a/9b | Lượt 9 | 9a kịp đặt OKR quý 1 |
| Hai mục từ điển: sửa «Trợ lý AI»; thêm «Đề xuất (của trợ lý AI)» phân biệt với «Gợi ý» | Màn lượt 9 | — |
| Golden set chép từ OKR quý 4 thật có vào git không | Eval gia số 1 | Thay tên người, giữ số |

---

## 13. Nguồn đã tự kiểm

**Kho** (bản chụp `scratchpad/onehub`, chỉ đọc):

- `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md` (mục Nhắc buổi sáng, Bot Zalo, Gợi ý, Tác
  nhân, OKR, Mục tiêu, KR, Cập nhật tuần, Mức tự tin, Chương trình OKR, Căn chỉnh,
  Vai «chỉ OKR», Phạm vi dữ liệu, Trợ lý AI)
- `docs/plan/lo-trinh-okr.md` (toàn bộ); `docs/agent.md` dòng 388, 441; `docs/api.md`
  dòng 20; `docs/chat-ui.md` dòng 21, 80, 118–139
- `apps/agent/agent/agent.ts`, `instructions.md`, `instructions/task.ts`,
  `lib/model.ts`, `lib/session-purpose.ts`, `lib/capabilities.ts`, `lib/approval.ts`,
  `lib/dispatch.ts`, `lib/dispatch-config.ts`, `lib/enrichment.ts`,
  `lib/custom-agent-dispatch.ts` (dòng 490–540), `lib/facts.ts`,
  `lib/zalo-config.ts`, `lib/zalo-bot-xuong.ts`, `hooks/audit.ts`,
  `schedules/dispatch.ts`, `channels/eve.ts`, `tools/*`, `subagents/*` (cấu trúc thư mục),
  `subagents/agent_runner/tools/finish_run.ts`
- `apps/agent/evals/evals.config.ts`, `agent-builder.eval.ts`; danh sách `apps/agent/test/`
- `apps/api/src/okr/tien-do.ts`, `can-chinh.ts`, `okr-access.service.ts`;
  `apps/api/src/trpc/middlewares/pham-vi-du-lieu.middleware.ts`;
  `apps/api/src/agent/agent-trigger.service.ts`; `apps/api/test/vai-chi-okr.spec.ts`
- `packages/validation/src/vai-workspace.ts`, `okr-vet.ts`, `okr-*.ts` (danh sách
  export); `packages/validation/package.json`
- `packages/db/prisma/schema.prisma` (model `AgentTask`, `AgentEvent`, `AppSetting`,
  `AgentConversation`, `OkrTrail`, `OkrProgramConfig`, `ContactFact`, enum `FactStatus`);
  `packages/db/src/settings.ts`, `onboarding-nhac.ts`, `onboarding-buoc.ts`
- `packages/ui/src/components/suggestion.tsx`, `sourced-value.tsx`, `ai-elements/`
- `git diff --stat release origin/onehub` cho các tệp agent của hãng (lệnh chỉ đọc)

**eve 0.29.4** (`apps/agent/node_modules/eve/docs`): `subagents.mdx`,
`guides/dynamic-capabilities.md`, `skills.mdx`, `agent-config.md`,
`concepts/default-harness.md`, `guides/remote-agents.md`, `channels/custom.mdx`,
`guides/client/output-schema.mdx`, `guides/hooks.md`, `guides/instrumentation.md`,
`concepts/sessions-runs-and-streaming.md`, `evals/overview.mdx`,
`evals/assertions.mdx`, `evals/targets.mdx`, `schedules.mdx`, `channels/slack.mdx`,
`tools/human-in-the-loop.md`, `tutorial/guard-the-spend.mdx`.

**Nghiên cứu**: 09 (trọn), 06, 07, 08 (trọn), 01 §0–§7, 03 (tóm tắt, ma trận, (a),
(b), (c), «Điều gì làm AI OKR tốt hơn Tability»), 04 §0, §5, §6, 05 §0, §5.3, §6,
§7.3, §8, §9, §10, §11.

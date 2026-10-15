# Đổi model mặc định sang Gemini 3.8 Flash — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (phiên thợ làm tuần tự). Steps dùng `- [ ]`.

**Goal:** Tác tử, máy soạn và trợ lý kho chạy mặc định trên `google/gemini-3.8-flash` (ZDR giữ), sổ chi phí có giá
Gemini, model chấm OKR giữ GLM; bộ 50 câu mẫu đo lại cạnh ngưỡng cũ.

**Architecture:** Đổi ba hằng (`DEFAULT_AGENT_MODEL.id`, `soan.maModel`, `hoi.maModel`) và thêm một dòng `bangGia`. Giá
mong đợi trong bài kiểm đọc từ ảnh chụp danh mục Gateway do script ghi. Bộ so AC-6 dùng lại hàm chấm và hàm kiểm bằng
chứng của hai hồ sơ đã ký (import, không chép).

**Tech Stack:** Bun test + Postgres `_test`, `@ai-sdk/gateway`, eve.

**Spec:** `design.md` · `contract.md` · `evals.yaml` (cùng thư mục).

## Global Constraints

- Không chú thích trong code. Không `migration`.
- Tệp chung chỉ thêm dòng (`_acceptance/config.yaml`).
- Model chấm `MO_HINH_JUDGE` không đổi; giá GLM giữ trong `bangGia`.
- Đo bộ mẫu bằng model thật đúng MỘT lượt, ở task cuối, trên cây đã commit.

## Review Focus

- Workspace đã chọn một mã không còn trên Gateway: lượt lùi về Gemini, không ném lỗi (Task 2, ca c).
- Phiên soạn cũ ghi mã GLM: chi phí vẫn tính theo giá GLM (Task 2, E3).
- `zeroDataRetention` đi tới tham số của lời gọi qua chính subagent, không chỉ qua hàm bọc (Task 2, E2).

---

### Task 1: Ảnh chụp danh mục Gateway

independent: true · phục vụ E1, E3

**Files:** `_acceptance/re-mo-hinh-mac-dinh/rang/chup-danh-muc.ts` · `evidence/gateway-gemini-3-8-flash-2026-10-15.json`

- [ ] Script tải `/v1/models`, giữ mục `google/gemini-3.8-flash`, ghi `fetched_at`, `sha256` thân phản hồi, `entry`.
- [ ] Chạy một lần, commit ảnh chụp.

### Task 2: Đổi model và giá, bài kiểm E1–E4

independent: false · phục vụ E1, E1b, E2, E3, E4

**Files:** `apps/agent/test/rmh-mac-dinh.integration.spec.ts` · `apps/agent/test/rmh-tai-lieu.spec.ts` ·
`apps/agent/test/rmh-judge.spec.ts` · `packages/db/src/settings.ts` · `apps/agent/agent/lib/tai-lieu-config.ts` ·
`docs/agent.md`

- [ ] Ba bài trước (đỏ trên cây cũ): E1 ba ca (a)(b)(c), E2 hai đường × hai khẳng định + chiều đỏ, E3 ba nguồn giá, E4.
- [ ] Đổi hằng và giá; xanh; chạy lại `model*.integration.spec.ts`, `so-chi-phi`, `nop-ban-de-xuat`.
- [ ] `docs/agent.md` dòng model mặc định. Commit.

### Task 3: Bộ so ngưỡng (E5)

independent: true · phục vụ E5

**Files:** `_acceptance/re-mo-hinh-mac-dinh/rang/so-nguong.ts`

- [ ] Đọc bằng chứng của hồ sơ qua `kiemBangChung`, chấm bằng `chamTungCau` + `CHAM_BO_DO.nguong`, in bốn chỉ số cạnh
  ngưỡng và bảng tầng × kiểu chữ (chỉ đọc); trần câu lỗi model lượt một theo lượt đã ký; băm từng tệp trợ lý khớp cây,
  danh sách có `tai-lieu-config.ts`, `TAI_LIEU_AGENT.hoi.maModel` là Gemini. `--ghi-tep` ghi danh sách băm.
- [ ] Chiều đỏ tự chạy trên bản sao: đúng trang tụt dưới 80% · ba câu thành lỗi model · một byte tệp trợ lý · danh sách
  thiếu `tai-lieu-config.ts`.
- [ ] Commit.

### Task 4: Năm lệnh của kho và đo bộ mẫu

independent: false (cuối) · phục vụ E5

- [ ] `check-types`, `lint`, `lint:slop`, `test`, `build` xanh.
- [ ] `BCM_EVIDENCE=_acceptance/re-mo-hinh-mac-dinh/evidence bun _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts --do`, rồi
  `--ghi`, rồi `so-nguong.ts --ghi-tep`; lỗi `gieoNguoi` (khoá trùng) → chạy lại một lần, còn đỏ thì báo giám sát.
- [ ] `so-nguong.ts` xanh; commit; contract `status: implemented`.

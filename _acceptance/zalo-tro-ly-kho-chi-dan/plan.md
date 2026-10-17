# Trợ lý kho luôn chạy với chỉ dẫn kho — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (phiên thợ làm tuần tự). Steps dùng `- [ ]`.

**Goal:** Phiên gốc của câu Kho (CRM, Zalo) tự ghi liên kết câu → phiên ngay ở `session.started`; trợ lý kho không
tìm được câu thì dừng có chỉ dẫn; đo lại 50 câu trên Gemini.

**Architecture:** Một module `apps/agent/agent/lib/tai-lieu-lien-ket.ts` làm việc ghi liên kết (đọc `purpose`, `hoiId`
bằng `attribute()`), một hook `apps/agent/agent/hooks/lien-ket-hoi.ts` gọi nó ở `session.started`. Bộ giải chỉ dẫn của
`tro_ly_kho` bắt lỗi `moHoi`, ghi sai chỗ + cảnh báo, trả chỉ dẫn dừng khai trong `TAI_LIEU_AGENT.hoi`.

**Tech Stack:** Bun test + Postgres `_test`, eve hooks/dynamic instructions.

**Spec:** `design.md` · `contract.md` · `evals.yaml` (cùng thư mục).

## Global Constraints

- Không chú thích trong code. Không `migration`.
- Hằng mới (câu dừng, nhãn nhật ký) sống trong `TAI_LIEU_AGENT` (`apps/agent/agent/lib/tai-lieu-config.ts`).
- Tệp chung chỉ thêm dòng (`_acceptance/config.yaml`).
- Đo bộ mẫu bằng model thật đúng MỘT lượt, ở task cuối, trên cây đã commit, hai hằng model đổi tạm rồi trả lại.

## Review Focus

- Hook ném lỗi thì eve biến thành `turn.failed` — hook phải nuốt mọi lỗi (Task 1, E3 ca lỗi).
- Lần ghi cũ của `guiHoiKho` sau khi hook đã thay dấu chờ: khớp 0 hàng, không ném (Task 1, E2).
- Ngữ cảnh bộ giải động của phiên con không có `parent` — dùng `ctxBatDauThat` (Task 2).

---

### Task 1: Hook ghi liên kết sớm (E1, E2, E3)

independent: false

**Files:** `apps/agent/agent/lib/tai-lieu-lien-ket.ts` · `apps/agent/agent/hooks/lien-ket-hoi.ts` ·
`apps/agent/agent/lib/tai-lieu-config.ts` · `apps/agent/test/zkd-lien-ket.integration.spec.ts`

- [ ] Bài trước (đỏ): E1 zalo sớm + ghi lại qua `moPhien`; E2 CRM sớm qua dấu chờ thật + ghi lại qua `guiHoiKho`; E3 bảng
  ca không ghi + ca lỗi cơ sở dữ liệu. Ngữ cảnh hook dựng từ đối số auth mà `moPhien`/`guiHoiKho` truyền cho send.
- [ ] Viết module + hook; xanh; chiều đỏ ghim «zalo-som», «crm-som», «crm-ghi-lai».
- [ ] Verify: `bun run test -- "cd apps/agent && bun test test/zkd-lien-ket.integration.spec.ts"`. Commit.

### Task 2: Bộ giải trả chỉ dẫn dừng (E4, E5)

independent: false (dùng module Task 1)

**Files:** `apps/agent/agent/subagents/tro_ly_kho/instructions.ts` · `apps/agent/agent/lib/tai-lieu-config.ts` ·
`apps/agent/test/zkd-chi-dan.integration.spec.ts`

- [ ] Bài trước (đỏ): E4 hai đường {zalo, crm} tìm thấy ngay dưới `cachMs`, chiều đỏ liên kết muộn → chỉ dẫn dừng; E5 không
  có câu → không ném, chỉ dẫn dừng, một sự kiện sai chỗ, một cảnh báo.
- [ ] Sửa bộ giải; xanh; chạy lại `tro-ly-kho-bat-dau`, `tro-ly-kho-zalo`, `tro-ly-kho-dung-phien`.
- [ ] Verify: `bun run test -- "cd apps/agent && bun test test/zkd-chi-dan.integration.spec.ts"`. Commit.

### Task 3: Bộ so lượt đo (E6)

independent: true

**Files:** `_acceptance/zalo-tro-ly-kho-chi-dan/rang/so-do.ts`

- [ ] Đọc bằng chứng qua `kiemBangChung`, chấm bằng `chamTungCau` + `CHAM_BO_DO.nguong`; tổng lỗi hai lượt ≤ lượt đã ký;
  model trong báo cáo là Gemini; eve.log: 0 dòng threw, 0 dòng sai chỗ, mỗi phiên gốc trong ket-qua.jsonl có mặt và có
  đúng một dòng «[lien-ket-hoi]»; băm eve.log, ket-qua.jsonl khớp `eve-log.txt`. `--ghi-bam` ghi tệp băm.
- [ ] Chiều đỏ tự chạy trên bản sao: threw · sai chỗ · ba câu lỗi · model GLM · byte eve.log · thiếu dòng liên kết ·
  cắt nửa eve.log. Commit.

### Task 4: Năm lệnh của kho và đo bộ mẫu

independent: false (cuối)

- [ ] `check-types`, `lint`, `lint:slop`, `test`, `build` xanh.
- [ ] Đổi tạm hai hằng sang `google/gemini-3.8-flash`, `do-bo-mau.ts --do` rồi `--ghi` vào `evidence/`, chép `eve.log` và
  `ket-qua.jsonl` của lượt vào `evidence/`, trả hai hằng; `so-do.ts --ghi-bam`; `so-do.ts` xanh; commit; contract
  `status: implemented`.

# Thẻ góp ý OKR · bàn giao để chạy tiếp ở phiên hay máy khác

Viết 2026-09-30. Mọi thứ cần để chạy tiếp nằm trong git của `origin`
(`phanlemanh/crm-onehub`). Có hai thứ không vào git: tệp `.env` ở gốc kho, và trí nhớ
của phiên máy. Mục 5 chép lại phần trí nhớ cần dùng.

## 1. Đang ở đâu

**Lượt `the-gop-y-okr` đã giao.** PR #212 gộp vào `onehub` ngày 30/09/2026 (merge commit
`0553e0ce`), production tự triển khai. Không có migration.

| Thứ | Ở đâu |
| --- | --- |
| Hồ sơ nghiệm thu (đã ký Cổng Phạm vi và Cổng Bằng chứng) | `_acceptance/the-gop-y-okr/` |
| Thiết kế và đặc tả UX | `docs/superpowers/specs/2026-09-29-the-gop-y-okr-design.md` |
| Kế hoạch thi công | `docs/superpowers/plans/2026-09-29-the-gop-y-okr.md` |
| Known limits đã ký | `## Notes` của `_acceptance/the-gop-y-okr/contract.md` |
| Buổi lái thử 30/09 (29 ảnh, số đo, lỗi, đề xuất) | `docs/plan/lai-thu-the-gop-y-2026-09-30/index.html` |
| Kịch bản dựng lại buổi lái thử | `docs/plan/lai-thu-the-gop-y-2026-09-30/kich-ban/` |

**Bốn hạt giống đã mở** (hồ sơ cơ hội, `stage: discovery`, chưa ai quyết ở Cổng Đáng):

| Hạt giống | Gom | Hồ sơ |
| --- | --- | --- |
| Sửa nhanh thẻ góp ý | L1 viền chỉ ô kẹt, L2 rơi focus, L3 = Ngoài-4, U1, U4, U6, U7, Ngoài-9 | `_acceptance/the-gop-y-sua-nhanh/opportunity.md` |
| Cột cuộn riêng | U2, U3, U10 | `_acceptance/the-gop-y-cot-cuon-rieng/opportunity.md` |
| Thẻ thông tin Cá nhân | U9 | `_acceptance/the-thong-tin-ca-nhan/opportunity.md` |
| Ma trận «bấm không đóng hộp» | Ngoài-10 | `_acceptance/ma-tran-bam-khong-dong-hop/opportunity.md` |

U5 (toast căn chỉnh thiếu «Hoàn tác») và U8 (câu hỏi thiếu lối «Sửa tên KR») gộp vào lượt
từ vựng tác tử của lộ trình, không có hạt giống riêng.

## 2. Đã chốt — không mở lại

- Phương án A (thẻ xếp dọc, nút ở chân, một nút chính) dựng trên AI Elements `confirmation`
  và `ProposedChange` trong `packages/ui`. `Suggestion` cũ đã gỡ.
- Tên truy cập của nút giữ nguyên: Nhận · Sửa · Bác · Bỏ qua · Nhận bản đã sửa · Huỷ; thẻ
  căn chỉnh dùng «Căn chỉnh».
- «Mở KR này» khoá kèm lý do khi Mục tiêu còn sửa chưa lưu, không đóng hộp bỏ thay đổi.
- E24 của `tro-ly-okr-de-xuat` khai `expected_exit: 1` (chủ kho chọn 29/09): độ trễ góp ý
  dao động theo tải phía model. Khối E24 trong báo cáo đã ký trích lượt đo round 3.
- 16 mục ngoài hợp đồng đã định đoạt ở Cổng Bằng chứng; chỉ Ngoài-10 mở hợp đồng mới.

## 3. Việc kế, theo thứ tự khuyên

1. **Vòng TRAO của `the-gop-y-okr`:** lái thử người lạ (nghi thức §0 của
   `/acceptance-gate:uat-session`), rồi `/acceptance-gate:uat-session the-gop-y-okr`.
2. **Cổng Đáng cho hạt giống.** Mở `opportunity.md`, người quyết ba trường `decision`,
   `decided_by`, `decided_at`. Khuyên `the-gop-y-sua-nhanh` trước (lỗi thật, nhỏ), gộp
   `ma-tran-bam-khong-dong-hop` vào nó vì cùng chạm cột góp ý.
3. **Chạy lượt:** `/feature-loop:feature-loop <slug>` cho hạt giống đã quyết `build`.
4. Lộ trình sau đó: lượt `tu-vung-tac-tu` (T2, gồm U5, U8), lượt `tac-tu-xin-duyet` (T3).

## 4. Dựng lại buổi lái thử

Từ gốc kho, hai lệnh, lệnh đầu chạy nền (nó giữ phiên đo tới khi có tệp `dung`, tối đa bốn giờ):

```bash
bun scripts/lan-do/tien-de.mjs --chay "bun docs/plan/lai-thu-the-gop-y-2026-09-30/kich-ban/giu-phien.mjs"
```

```bash
bun docs/plan/lai-thu-the-gop-y-2026-09-30/kich-ban/lai.mjs
```

Phiên đo riêng: kho `crm_<cây>_do`, API, app và tác tử trên cổng tự do, bộ OKR mẫu, bật
góp ý cho phòng `kd-bac`, tên Mục tiêu yếu, một KR yếu và một thông tin đề xuất cho Cá nhân
đầu tiên. Ảnh và `buoc.json` ra `.acceptance-runs/lai-thu-the-gop-y/`. Dừng phiên:
`touch .acceptance-runs/lai-thu-the-gop-y/dung`. Cần khoá model thật trong `.env` và tín dụng
AI Gateway (mục 5).

## 5. Trí nhớ cần dùng

- **AI Gateway chết theo hai cách giống nhau** («hong:turn-failed» dưới một giây): hết trần
  ngân sách tháng (`budget exceeded`) hoặc số dư tín dụng về 0 (`402 insufficient_funds`).
  Đọc `tac-tu.log` của phiên đo trước khi nghi mã. Nạp tín dụng và nâng trần là việc chủ kho.
- **CI «job was not started … payments have failed»** là GitHub Actions bị chặn thanh toán,
  không phải mã. Chủ kho sửa Billing, rồi `gh run rerun <id> --failed`.
- **Ghim lại:** `repin-lane.mjs` từ chối cây bẩn; `.claude/launch.json` của chủ kho thường
  bẩn — cất bằng `git stash push -- .claude/launch.json`, chạy làn, rồi `git stash pop`.
  Gộp `onehub` vào nhánh làm mọi hồ sơ chạm hoá cũ: ghim lại MỘT lượt ở đỉnh, rồi
  `bash scripts/pre-merge-check.sh . --base origin/onehub` không `--slug`.
- **Eval khai `expected_exit` khác 0** chỉ chống lưng pin khi báo cáo đã ký ghi đúng mã đó,
  trích một run_id eval thật (không trích run_id của làn ghim lại).
- **Gộp:** `gh pr merge <n> --merge` sau khi đọc CI xanh; không `--auto` (ở kho này `--auto`
  gộp ngay khi check còn chờ).
- **S4:** `s4-args.mjs --out _acceptance/<slug>/s4-args.json`; chép `acceptance-verify.js` vào
  `.acceptance-runs/wf/` kèm khối args nhúng, rào `RAO_CHAT` cho agent, cho agent suite đọc
  `bun run test` qua tệp, và xếp lệnh màn thật vào làn tuần tự.
- **Bài DOM cột góp ý:** khung chung ở `apps/app/test/khung-gop-y.tsx`; `@testing-library/user-event`
  đã cài ở `apps/app`. jsdom không tái hiện lần «bấm Sửa đóng hộp» — lớp chốt là E13 trên Chromium.
- **Kịch bản màn** `_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs` gọi model thật và nhờ lại
  qua `okr.troLyDeXuat` tới khi có đủ thẻ viết lại, câu hỏi, căn chỉnh.
- Bun trên máy phải là 1.3.12, cùng CI.

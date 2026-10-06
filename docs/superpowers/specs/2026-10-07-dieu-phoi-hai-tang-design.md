# dieu-phoi-hai-tang — design (vòng crm, giai đoạn 1a)

Gốc thiết kế (owner duyệt 05/10): `acceptance-gate-kit` @ `7b1afe1e`,
`docs/superpowers/specs/2026-10-05-orchestrator-workers-hai-tang-design.md`.
Kế hoạch đầu vào của S2: cùng commit, `docs/superpowers/plans/2026-10-05-orchestrator-workers-1a.md`
(đã chạy thử 05/10 trên cây tạm: 50/50 test xanh, CLI và bộ phát lịch chạy tách tiến trình).
Bàn giao: `docs/handoff/2026-10-06-ban-giao-orchestrator-workers-hai-tang.md` của kit.

Tài liệu này không thiết kế lại. Nó ghi phần spec mà vòng crm này hứa giao, phần để lại, và hai
chỗ chỉnh mà luật kho crm đòi.

## 1. Vòng này giao gì

Tầng máy của mô hình Orchestrator–workers, giai đoạn 1a (spec §5):

| Thành phần | Spec | Tệp |
|---|---|---|
| Nền: glob, thư mục đợt qua symlink `dieu-phoi-hien-tai`, JSON nguyên tử, sự kiện | §3 | `scripts/dieu-phoi/glob.mjs`, `dot.mjs` |
| Bộ lập lịch thuần: xếp hàng, cấp lượt, hạn thuê, hàng kế | §4.1, §4.2, §4.12 | `lich.mjs` |
| Canh sức khoẻ máy | §4.3 | `suc-khoe.mjs` |
| Kênh yêu cầu, phần máy quyết | §4.9 | `yeu-cau.mjs` |
| Bảng đồng hồ + hộp quyết định | §4.8 | `bang.mjs` |
| Bộ phát lịch (một nhịp, vòng chạy, pidfile) | §4.2–§4.3, §4.6, §4.8–§4.9, §4.12 | `phat-lich.mjs` |
| CLI mở / chạy / dừng / đóng / xem đợt | §4.2 (6), §4.11, §8 | `dieu-phoi.mjs` |
| Mẫu đợt: `dieu-phoi.config.json`, `hang-viec.json`, `LUAT.md` | §4.1, §5.1 | `mau/` |
| Nghi thức phiên giám sát | §4.7, §4.10, §4.11, §8 | `README.md` |
| Bốn hook: chặn S4 (PreToolUse), nhịp (PostToolUse), chờ người (Notification, UserPromptSubmit) | §4.5, §4.9 | `hook-*.mjs` + `.claude/settings.json` |

Hằng thời gian nội bộ của công cụ nằm ở `scripts/dieu-phoi/cau-hinh.mjs` (§3 dưới). Mọi giá trị
riêng của kho nằm trong `dieu-phoi.config.json` và `hang-viec.json` của đợt (spec §5.1).

## 2. Ranh giới vòng

- Chỉ dựng công cụ. Không mở đợt thật, không làm hàng nào của lộ trình sản phẩm.
- Không có dòng mã nào gọi `gh pr merge`; không bao giờ có `--auto` (hàng merge là giai đoạn 1b).
- Không ghi cứng thứ gì của crm vào `scripts/dieu-phoi/`: không tên nhánh `onehub`, không chữ
  `crm`, không đường dẫn tuyệt đối của máy. Mẫu `nhanh_chinh` là `"main"`.
- Hook chạy ở mọi lời gọi công cụ của mọi phiên crm, nên ngoài đợt (không có symlink) mọi hook
  phải thoát 0, kể cả khi cấu hình đợt hỏng. Lệnh S4 trong đợt gặp lỗi nội bộ thì chặn (thoát 2).
- Mã hook trong `.claude/settings.json` có lá chắn `[ -f "$f" ] || exit 0`, nên nhánh cũ chưa có
  script vẫn im.

## 3. Hai chỗ chỉnh theo luật kho crm (không đổi logic, không đổi test)

1. **Bỏ mọi chú thích** trong `scripts/dieu-phoi/**/*.mjs` (AGENTS.md: «Never add code comments»).
   Giữ dòng shebang `#!/usr/bin/env node`. Bộ đo luật cây của kho (`scripts/luat-kho/do-cay.mjs`)
   chỉ quét `apps/` và `packages/`, nên vòng này có thước riêng cho luật này.
2. **Gom hằng thời gian vào một mô-đun** `scripts/dieu-phoi/cau-hinh.mjs` (AGENTS.md: «Constants
   belong in one file per area»): `PHUT_MS` làm gốc; thư mục khoá trống tối đa 60″, cửa sổ trùng
   việc phụ 24 giờ, khoảng báo lại lỗi lặp 30′, khoảng giữa hai lần `git fetch` 5′, trần lệnh ngoài
   30″, nhịp mặc định 5″. Các tệp dùng hằng nhập từ đây; không còn số `60_000`, `3600_000`,
   `300_000`, `1_800_000`, `30_000` viết tay ở tệp khác.

Hai chỗ chỉnh này là chỗ duy nhất mã của vòng khác mã kế hoạch. Test của kế hoạch giữ nguyên
từng dòng.

## 4. Nghi thức phiên giám sát mà README phải chở (thước của AC-14)

README `scripts/dieu-phoi/README.md` phải có đủ bốn phần, mỗi phần đúng nội dung sau:

- **Mở đợt** (sau khi owner duyệt thẻ khởi tạo): lệnh `mo <tên>`; điền `hang-viec.json` (khối `day`
  với id, worktree tuyệt đối đã `realpath`, link `claude://`; khối `hang`), `dieu-phoi.config.json`
  (`nhanh_chinh`, `bao_ve`), phần riêng của `LUAT.md`; lệnh `chay`; Monitor
  `tail -n0 -F <thư mục đợt>/su-kien.jsonl | grep --line-buffered '"can_phan":true'` (chép nguyên văn
  được: thay `<thư mục đợt>` bằng đường dẫn thật; sự kiện ghi bằng `JSON.stringify` nên không có dấu cách
  sau dấu hai chấm) timeout 30′ giăng lại khi hết hạn; task lịch 30′ có `notifyOnCompletion` làm lưới an toàn; nhóm «Đợt <tên>» ở thanh bên, ghim
  phiên giám sát, chip cho từng phiên thợ kèm thư mục đợt, mã phiên, ranh giới, câu «đọc LUAT.md
  trước S1».
- **Trong đợt**: xử lý mỗi `can_phan` (với yêu cầu: ghi `tra-loi/<id>.json` có `boi:"giam-sat"` và một
  dòng Nhật ký; `dich:"owner"`: gom, push tối đa một lần mỗi 30′); xem `bang.html` hoặc lệnh `xem`;
  mỗi lần thức chạy `chay` (tự bỏ qua nếu còn sống, tự chạy lại nếu đã chết). Không dùng `/loop`.
- **Đóng đợt**: lệnh `dong` sau khi owner duyệt thẻ đóng đợt (dừng bộ phát lịch, gỡ symlink → hook
  im), rồi xoá task lịch, lưu trữ phiên thợ, dọn worktree đã gộp sau khi kiểm `git status --porcelain`.
- **Đường lùi** (spec §8): `dong` là đủ; `LUAT.md` và `khoa/` vẫn dùng tay được theo cách 04/10.

## 5. Phần spec để lại (khai ở Out of scope của hợp đồng)

- §4.4 hàng merge, báo hoá cũ, train — giai đoạn 1b.
- §4.9 phát hiện owner merge tay — cần ánh xạ hàng merge, đi cùng 1b.
- §4.6 chỉ suy trạng thái từ `status` của `contract.md` (nhánh chính và worktree của phiên); chưa
  đọc độ mới `card.html`, dòng cuối `run-log.jsonl`, PR và check.
- §4.2 (6) dùng `dieu-phoi.mjs chay` thay cho `khoi-dong.mjs` riêng; cài launchd cần owner duyệt riêng.
- §4.10 hook mức user để chặn S4 xuyên kho — cấu hình bền, owner duyệt riêng.
- §7 «phát lại ngày 04/10» dùng ca kẹt chéo bốn phiên tổng hợp (luật tự-nhường không cấp ai, luật
  mới cấp đúng một) và ca «nhả → nhịp sau cấp người kế», không dựng lại chuỗi đơn từ Nhật ký 04/10.
- `nhanhCua: () => null` trong bộ phát lịch: nhánh của chính phiên xin chưa được loại khỏi «nhánh
  mở đang sửa»; lệch về phía an toàn (thành `can_phan` thay vì máy duyệt).
- Giai đoạn 2 (thợ cloud), giai đoạn 3 (đóng gói vào kit), thước §6 (đo trong đợt sau 14/10).

## 6. Rủi ro

- **Hook PostToolUse khớp `*`** chạy `node` ở mọi lời gọi công cụ của mọi phiên crm (≈ 40–60 ms mỗi
  lần). Ngoài đợt nó thoát 0 sau một lần `git rev-parse`.
- **Hook chặn S4 so chuỗi con**: một lệnh Bash chỉ nhắc tới `s4-args` (ví dụ `grep s4-args …`) cũng bị
  coi là S4 khi đợt đang chạy. Chấp nhận: chiều sai là chặn thừa có thông điệp chỉ đường, không phải
  cho lọt.
- **Bộ phát lịch là điểm hỏng chung mới** (spec §9) — đường lùi §8 không để trạng thái nào chỉ nằm
  trong tiến trình.

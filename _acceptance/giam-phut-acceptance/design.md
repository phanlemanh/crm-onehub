# Thiết kế: giam-phut-acceptance

Hàng CI1 của đợt `sau-14-10`, làn P8. Cổng Đáng: anh ký `build` lúc 2026-10-09T16:19:10Z
(`opportunity.md`).

## Vấn đề

Kho riêng tư, GitHub tính tiền theo phút và làm tròn từng job lên phút. Đo 29/09–09/10:
Acceptance 367 lượt, trong đó 130 lượt là push lên `onehub` chạy lại đủ năm job đã chạy ở PR;
mỗi lượt khoảng 12 phút tính tiền (lệnh dựng 4,0 · agent-okr Node 24 3,3 · acceptance gate 2,0 ·
luật kho 1,6 · điều phối 1,0). `acceptance.yml` không có `concurrency`, nên push chồng lên một PR
chạy hết các lượt cũ. Ngày 09/10 khoảng 14:49Z GitHub dừng mọi job vì vượt mức chi.

## Thiết kế

Chỉ sửa `.github/workflows/acceptance.yml` (ranh giới giám sát duyệt ở `tra-loi/NGOAI-CI1-1.json`).

1. **`concurrency` ở cấp workflow**:
   `group: acceptance-${{ github.event.pull_request.number || github.sha }}`,
   `cancel-in-progress: ${{ github.event_name == 'pull_request' }}`. Push lên `onehub`/`release`
   không bao giờ bị huỷ, vì lượt đó là dấu xanh cuối của nhánh chính mà giám sát đọc. Nhóm của push
   theo `github.sha` chứ không theo `github.ref` như `ci.yml`: GitHub huỷ lượt đang CHỜ khi lượt mới
   cùng nhóm tới, nên nhóm theo nhánh sẽ bỏ mất lượt kiểm của commit gộp ở giữa khi hai PR gộp sát nhau.
2. **Gộp ba job nhỏ** (`acceptance`, `dieu-phoi`, `luat-kho`) thành một job khoá `acceptance`, tên
   hiển thị giữ nguyên «acceptance gate». Không `if`, không `continue-on-error` ở cấp job. Bước:
   checkout `fetch-depth: 0` → setup-node 24 → setup-bun → `bun install --frozen-lockfile` →
   `node scripts/luat-kho/do-cay.mjs --du-luat` (không `if`) → Product map → Pre-merge check (khối
   `run` giữ nguyên, tự chọn chế độ theo sự kiện) → `bun run test:dieu-phoi`. Ba bước sau luật kho
   mang `if: ${{ !cancelled() }}`: một bước đỏ thì job đỏ, nhưng các bước còn lại vẫn chạy và báo kết
   quả. `env` của job gồm `DATABASE_URL` (postinstall `prisma generate` cần).
3. **`agent-okr-node24`** thêm `if: github.event_name == 'pull_request'` ở cấp job. **`build` giữ nguyên, vẫn chạy khi
   push** — xem «Vì sao giữ build khi push». Mọi phần khác của hai job giữ nguyên từng byte.

Kết quả theo sự kiện:

| Sự kiện | Job chạy | Ước phút tính tiền |
| --- | --- | --- |
| pull_request | acceptance gate (gộp) · lệnh dựng · tác nhân OKR trên Node 24 | khoảng 10 (nay khoảng 12) |
| push `onehub` / `release` | acceptance gate (gộp) · lệnh dựng | khoảng 7 (nay khoảng 12) |

## Vì sao giữ build khi push

Phản biện context sạch (gap-probe) chỉ ra giả định «cây sau gộp trùng cây đầu PR» chưa đo. Đo ngày 09/10: 26 trên 107
commit gộp vào `onehub` trong 7 ngày có cây khác cây đầu PR, và 10 ngày qua lượt push trên `onehub` đỏ 7 lần, 5 lần ở
«lệnh dựng» (bốn lần 29/09; lượt 05/10 `37263692533` là lỗi hết heap mà `heap-lenh-dung` lấy làm bằng chứng). agent-okr
chưa đỏ lần nào khi push. Bỏ `build` khi push tiết kiệm thêm khoảng 4 phút mỗi lượt (khoảng 1.500 phút mỗi tháng) nhưng
mất đúng phép kiểm đã bắt lỗi thật trên nhánh chính.

## Vì sao không làm cách khác

- **`if: pull_request` trên job luật kho:** hồ sơ đã ký `luat-kho-vong-doi` (`rang/ci.mjs`) cấm job
  luật kho có `if` («job co dieu kien if, co the bi bo qua»). Gộp luật kho vào job không `if` giữ
  nguyên thước đó.
- **Tệp workflow riêng cho push:** ngoài ranh giới giám sát duyệt, và đổi tên check mà giám sát đang
  đọc ở `onehub`.
- **Bỏ hẳn lượt push:** mất dấu xanh của `onehub` sau gộp và bước pre-merge chế độ push
  (`--no-t1-escape`).

## Ràng buộc từ hồ sơ đã ký đang đo `acceptance.yml`

| Hồ sơ | Eval | Điều kiện | Thiết kế giữ ra sao |
| --- | --- | --- | --- |
| `luat-kho-vong-doi` | E3 `lkv_ci` | đúng một job có bước luật kho, cài trước, có biến DATABASE_URL, job không `if`/`continue-on-error`, `pull_request` gồm `onehub` | job gộp không `if`, có `env` |
| `dieu-phoi-va-bien`, `dieu-phoi-truoc-mo-dot` | `dpvb_cong` | có job với bước `bun run test:dieu-phoi` và setup-node 24 | job gộp có cả hai |
| `heap-lenh-dung` | `hld_build_heap` | job `build` có đúng một bước `bun run build` với `NODE_OPTIONS` 6144 | không đổi |
| `lenh-dung-do-khong-ai-thay` | E5 `ld_ba_noi_deu_chay` | bước build không `if`/`continue-on-error` | `if` đặt ở cấp job, không ở bước |
| `khoa-con-bat-xa-tran` | E4 `kcb_khong_noi_tran` | không dòng nào có `--timeout` | không thêm |
| `sua-paths-e5-soan-okr` | `f19_loc_chon` | `acceptance.yml` bị bỏ qua (skipped) với E5 | không phụ thuộc nội dung tệp |

Mọi hồ sơ trên có `paths` chạm `acceptance.yml`, nên phải ghim lại trước khi gộp.

## Giới hạn đã biết

- Sau khi gộp, `onehub` không được chạy lại test agent-okr trên Node 24. Lỗi agent-okr do hai PR chồng nhau chỉ lộ ở PR
  kế. `onehub` hiện không có kiểm tra bắt buộc nào (`gh api`: không rules, «Branch not protected»).
- `ci.yml` không đổi ở vòng này (cửa sổ đo 7 ngày của F22) — phần lớn phút vẫn ở đó.

## Đặc tả UX

Không chạm màn hình — bỏ, xem sổ quyết định.

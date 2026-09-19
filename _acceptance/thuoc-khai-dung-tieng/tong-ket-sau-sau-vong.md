# Tổng kết sau sáu vòng chấm — thuoc-khai-dung-tieng

Viết 20/09/2026, theo quyết định của người ký: dừng vòng lặp, trả hạ tầng,
tổng kết. Hợp đồng ở `status: implemented` — **không** đặt `verified`, vì
chưa vòng chấm nào cho verdict PASS.

## Sáu vòng

| Vòng | Verdict | Ô máy hỏng | Phát hiện trong hợp đồng |
|---|---|---|---|
| 1 | BLOCKED | 3 hỏng + 2 chặn | 7 |
| 2 | BLOCKED | 3 hỏng + 1 chặn | 4 |
| 3 | BLOCKED | 5 hỏng + 1 chặn | 4 |
| 4 | REJECT | 6 | 0 |
| 5 | REJECT | 1 (E3) | 4 |
| 6 | REJECT | 1 (E3) | 2 |

Hội đồng chấm người (E11 / AC-10) đề xuất **PASS** ở vòng 3, 4, 5 và 6.

## Trạng thái đo được, ngoài làn chấm

- **17/17 ô đo thoát 0** trong một lượt chạy tuần tự có ghi
  (`evidence/dau-ra-mot-luot.txt`).
- **Năm cổng kho xanh**: `test` · `check-types` · `lint` · `lint:slop` · `build`.
- **23 phép phá** trong bộ khai sinh, chia bốn nhóm chi phí (166s / 243s / 517s
  / 180s), tất cả bắt được vật chúng khai là bắt.
- **Diff không chạm một tệp sản phẩm nào** của `ho-so-khai-dung-tieng` — lời
  hứa trung tâm của vòng, đo bằng chân đo riêng.

## Hai điều còn mở

**E3 (`cong-chan-duoc`) hỏng chỉ trong làn.** Chạy riêng: 73 giây, xanh. Chạy
cùng hai chân nặng khác: 87 giây, xanh. Chỉ hỏng dưới tải ~20 lệnh song song
của làn chấm, và làn không giữ lại đầu ra của nó. **Không tái lập được**, nên
không vá — vá theo một nguyên nhân phỏng đoán là đúng thứ vòng này cấm.

**Dòng phát hiện chưa cạn.** Mỗi vòng vẫn tìm ra 2–4 khuyết tật thật trong hợp
đồng; không cái nào tái phát, nhưng mỗi bản vá mở ra bề mặt mới. Ba vòng cuối
đã vá: vứt mã thoát lượt lành · nuốt lỗi trả CSDL · nuốt lỗi xoá vật thử · ném
`TypeError` trần · ma trận hai vị trí chỉ hiện thực một. Đây là tính chất của
một vòng mà **sản phẩm chính là thước**: bộ đo đủ lớn thì mỗi lượt soi đối
kháng đều còn gì đó để tìm.

## Những lớp bệnh đã bịt tận gốc trong vòng này

1. **Chuỗi ghim vô hiệu** — 7/14 chuỗi là tên chân, in ở mọi lượt. Nay 0/23,
   và có chân đo canh chính luật đó.
2. **Đếm rồi vứt** — bộ khai sinh nay đòi BA điều, và giữ cả mã thoát của lượt
   lành chứ không chỉ đầu ra.
3. **Thước không nằm trong cổng nào** — `mot-duong.mjs` nay chạy trong
   `@crm/ui#test`; thêm chỗ khai tiếng thứ mười làm `bun run test` đỏ và gọi
   tên tệp.
4. **Chạm dữ liệu thật** — phép phủ giai đoạn nay TẠO vật thử thay vì MƯỢN bản
   ghi có sẵn; có chốt từ chối chạy nếu `DATABASE_URL` không mang đuôi `_test`.
5. **Khẳng định đại diện thay cho quan hệ** — AC-8 nay đo bằng `tsc --listFiles`;
   AC-7 rút hình dạng từ bản khai rồi đối chiếu với chính `paths` của nó; AC-11
   ánh xạ từng eval thay vì so tổng.
6. **Tranh chấp tài nguyên dùng chung** — CSDL (tạo thay vì mượn), tệp bằng
   chứng (khoá cả chuỗi đọc–sửa–ghi), sổ worktree (bỏ `prune` toàn cục).

## Việc còn lại cho người đọc

- Quyết có chạy vòng 7 không, hay nhận bằng chứng tuần tự và xét ở Cổng 2.
- `review-findings.md` của `ho-so-khai-dung-tieng` có hai mục mới: N15 (ba
  chuỗi ghim chốt bằng hành vi bộ in) và N16 (tám ô `ui-check` không có chốt
  máy nào ở lúc ghim lại — đã xác minh tại `evidence-core.cjs:358`).
- `## Known limits` của hợp đồng này khai ba giới hạn có tên: miễn trần nhát
  sửa thước, sáu bệnh chỉ đo bằng dấu hiệu, và lý do từng cái.

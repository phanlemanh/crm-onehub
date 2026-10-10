# Thước «một chỗ khai» quét thật khu soạn — thiết kế

Ngày 2026-10-09. Slug `thuoc-mot-cho-khai-quet-man`, hạng T2, hàng K2d của dãy P7 (đợt `sau-14-10`). Nguồn: Ngoài-4
của K2b `soan-okr-khong-lac` (luật 26). Chủ kho Manh Phan.

Đọc trước: `AGENTS.md`, contract và `review-findings.md` của `soan-okr-khong-lac`, `rang/` của K2b và K2c
(`ly-do-tu-choi-nop-theo-locale`), `references/measure-birth.md` của gói acceptance-gate.

## Bài toán

E7 của K2b hứa «tập kết quả nộp khai đúng một chỗ, agent và khu soạn không khai lại». `rang/mot-nguon.mjs` quét ba lớp
bằng `glob` của `node:fs/promises`. Với lớp khu soạn, mẫu là `apps/app/app/(app)/[slug]/okr/soan/**/*.ts*`; `glob`
đọc `(app)` là nhóm mẫu và `[slug]` là lớp ký tự, nên mẫu khớp 0 tệp (đo 09/10 trên `d089cb8d`: 0 trong 22). Nhánh
quét khu soạn rỗng mà thước vẫn xanh — đúng hình dạng «tuyên quét lớp nhưng một nhánh quét rỗng» của sổ lớp lỗi.

Đo kèm 09/10: khu soạn hiện không khai lại tập (0 trong 22 tệp), nên sửa thước xong cây lành vẫn xanh; trong
`_acceptance/*/rang/*.mjs` chỉ tệp này dùng `glob(`; `ranh-gioi.mjs` của K2b so tiền tố trên kết quả `git diff` nên
không mắc.

## Cách làm

Chép khuôn đã ký của K2c, không chế khuôn mới:

1. `chung.mjs` khai một chỗ ba gốc quét có tên — `GOC_QUET = { agent, "khu-soan": SOAN, validation }` — và hàm
   `tepQuet(thuMuc)` đọc thư mục đệ quy (`readdirSync({ recursive: true, withFileTypes: true })`), lấy `.ts`/`.tsx`.
   Đọc thư mục không diễn giải ký tự nào của đường, nên `(app)` và `[slug]` là chữ thường.
2. `mot-nguon.mjs` quét `GOC_QUET` qua `tepQuet`; gốc nào 0 tệp thì đỏ «goc quet rong: <tên>»; in thêm dòng đếm
   «quet: agent <a> · khu-soan <k> · validation <v>». Dòng thành công cũ và chiều đỏ `--ban-sao them-tap` (khai lại
   trong `nop-ban-nhap.ts` ở bộ nhớ) giữ nguyên để E7 của K2b chạy như đã ký.
3. Gốc được kiểm TRƯỚC khi nạp mô-đun của agent và validation, để gốc rỗng đỏ có tên chứ không sập vì thiếu mô-đun.
   `mot-nguon.mjs` không thêm cờ chiều đỏ nào: chiều đỏ của hồ sơ chạy trên cây tạm (mục dưới).
4. Phép đo của hồ sơ nằm ở `_acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs` (một tệp, năm chế độ cho E1–E6) —
   gọi `mot-nguon.mjs` như một tiến trình con và so kết quả, không nhập hàm của nó.

## Vì sao không sửa bằng `:(literal)` hay thoát ký tự

`glob` của Node không có chế độ chữ; thoát `(`, `[` bằng `\` phụ thuộc nền tảng và dễ quên ở chỗ gọi kế. Đọc thư mục
loại hẳn lớp lỗi này, và K2c đã chứng nó trên cùng ba gốc.

## Chiều đỏ trên cây tạm cùng bố cục

K2b đã ký; làn ghim lại dừng nếu lượt đo chạm cây `_acceptance/<slug>/` của hồ sơ đã ký, nên không chiều đỏ nào sửa
tệp thật. `do.mjs` dựng một cây tạm dưới `.acceptance-runs/thuoc-mot-cho-khai-quet-man/` — ba cấp dưới gốc kho, kho bỏ
qua: chép ba gốc quét và hai tệp thước (`rang/mot-nguon.mjs`, `rang/chung.mjs`), nối `node_modules` thật của
`apps/agent-okr` và `packages/validation`. `ROOT` của `chung.mjs` tính từ chỗ tệp nằm, nên thước chạy trên cây tạm quét
cây tạm. Trên cùng một cây chạy được cả bản mới lẫn bản `d089cb8d` — đó là cặp trước/sau của lỗi gốc: thử 09/10, bản
cũ thoát 0 trên cây lành, 0 khi khu soạn khai trùng (lỗi), 1 khi agent khai trùng. Cây tạm xoá trong `finally`; mỗi
lượt so sha256 tệp thật và `git status --porcelain` trước và sau.

## Ranh giới

Hàng: `_acceptance/soan-okr-khong-lac/rang/**`, `_acceptance/thuoc-mot-cho-khai-quet-man/**`. `cham-tep`
(`yeu-cau/P7-15.json`): `_acceptance/config.yaml` (thêm khoá `k2d_*`), design doc này, kế hoạch, `PRODUCT-MAP.md`,
`LO-TRINH.html`. Cuối nhánh ghim lại K2b (E7 có `paths` chạm `mot-nguon.mjs`), nên hai tệp ghi ghim của K2b cũng
vào diff.

## Đặc tả UX

Không chạm giao diện — bỏ đặc tả UX và design-pass (sổ quyết định).

# Phá thử — khoa-cu-khong-mo-khoa-moi

Mỗi lượt: một thay đổi tạm trong cây làm việc, chạy đúng lệnh eval, ghi mã thoát
và dòng thông điệp ghim, rồi hoàn nguyên từ bản chép. Sau mỗi lượt,
`git diff packages/auth` chỉ còn thay đổi của Task 1.

## P1 — đặt plugin canh-khoa-api TRƯỚC apiKey(...) (E1, E2, E3)

Thay đổi tạm: `packages/auth/src/auth.ts`, `canhKhoaApiPlugin(),` dời lên ngay trước `apiKey({`.
Lệnh: `bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts -t header-"`
Mã thoát: 1 ·  1 pass  3 fail 

- `header-tao-khoa` đỏ — «POST /api/auth/api-key/create chi bang header khoa cua nguoi ngoai kho van qua»: nhận {status 200, message "", them 1}.
- `header-bat-lai-khoa` đỏ — «POST /api/auth/api-key/update chi bang header khoa cua nguoi ngoai kho van qua»: 200/200, daTatVanTat true, tenKhongDoi "doi-ten-qua-header".
- `header-lan-cookie` đỏ — «cookie thanh vien che mat header khoa cua nguoi ngoai kho»: nhận {status 200, message "", them 1}.
- `header-doi-chung` xanh — đối chứng dương không phụ thuộc thứ tự.

Kết luận: móc của plugin khoá chạy theo vị trí trong mảng `plugins`; thứ tự được ghim bằng hành vi.

## P2 — bỏ hẳn plugin canh-khoa-api (E8)

Thay đổi tạm: xoá dòng `canhKhoaApiPlugin(),` khỏi `plugins` (móc chung cũng không còn phép kiểm).
Lệnh: `bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts -t khoa-moi"`
Mã thoát: 1 · 0 pass 1 fail

- `khoa-moi` đỏ — «nguoi da bi go van tao hay bat lai duoc khoa, hoac bi tu choi vi ly do khac tu cach»: quaAuth và batLai nhận {200, ""}, soKhoa 2, cuBat true.

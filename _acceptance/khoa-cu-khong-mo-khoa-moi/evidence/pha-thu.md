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

## P3–P8 — lượt dọn và lệnh xem trước (E5, E6, E9)

Lệnh chung: `bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts -t 'don-|xem-truoc'"` — mỗi lượt dựng cơ sở dữ liệu riêng bằng `migrate deploy`, nên SQL đột biến chính là SQL được áp. Trước mọi lượt: 3 pass 0 fail. Hoàn nguyên bằng bản chép, `diff` rỗng.

| Lượt | Thay đổi tạm | Mã thoát | Kết quả | Dòng thông điệp ghim |
|---|---|---|---|---|
| P3 | bỏ vế `NOT EXISTS` | 1 |  2 pass  1 fail  | «luot don lech: … khoa thanh vien bi cham …» — c1 false, c2 false |
| P4 | bỏ vế `EXISTS` (chốt bảng rỗng) | 1 |  2 pass  1 fail  | «luot don tat khoa khi bang thanh vien rong — lan ghi danh dau se mat het khoa» — b1, b2, c1 false |
| P5 | `IS DISTINCT FROM false` → `= true` | 1 |  1 pass  2 fail  | «luot don lech …» — b2 còn null; «xem truoc dem 1 khoa, luot don doi 1 dong» — cuaBi 1 |
| P6 | bộ rút mệnh đề chỉ lấy dòng đầu của WHERE | 1 |  2 pass  1 fail  | «xem truoc dem 3 khoa, luot don doi 2 dong» — khopSoDong false, conLai 1 |
| P7 | `UPDATE … SET` → `DELETE FROM "apikey"` | 1 |  1 pass  2 fail  | «luot don lech … dong khoa bi xoa» — soKhoaBi 1; «migration luot don khong co dang UPDATE "apikey" ... WHERE ...» |
| P8 | bỏ hẳn lọc `enabled` | 1 |  1 pass  2 fail  | «luot don lech: … khoa da tat bi de …» — updatedAt của b3 bị đè; «xem truoc dem 2 khoa, luot don doi 2 dong» — conLai 2 |

## P9–P11 — hai bài siết của hồ sơ nguồn (E7, E8)

| Lượt | Thay đổi tạm | Lệnh `-t` | Mã thoát | Kết quả | Dòng thông điệp ghim |
|---|---|---|---|---|---|
| P9 | `removeMember` ghi `enabled: true` thay vì tắt | `go-tat-khoa` | 1 | 0 pass 1 fail | «khoa cua nguoi bi go van bat» — vế đọc cột trạng thái khoá bắt trước |
| P11 | như P9, cộng tạm bỏ vế đọc cột trạng thái trong bài (để chạm tới vế siết) | `go-tat-khoa` | 1 | 0 pass 1 fail | «khoa da tat phai bi tu choi o tang khoa, khong phai o phep kiem tu cach» — nhận {status 403, loiKhoa null}, đòi {401, KEY_DISABLED} |
| P10 | `canhKhoaApi` từ chối mọi `/api-key/update` | `khoa-moi` | 1 | 0 pass 1 fail | «thanh vien khong bat lai duoc khoa cua chinh minh qua cong xac thuc» — nhận {status 403, bat false} |

Sau mỗi lượt hoàn nguyên từ bản chép; `git status` của `apps` và `packages` sạch ngoài thay đổi đã commit.

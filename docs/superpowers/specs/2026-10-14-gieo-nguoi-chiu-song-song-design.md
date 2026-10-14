# gieoNguoi chịu được gọi song song — thiết kế

Ngày 14/10/2026 · hạng T2 · vùng của DA0a (Mac Studio giữ, đã đồng ý 06:16Z, khai ở #375)

## Vấn đề

`apps/api/test/dieu-phoi-gieo.ts` › `gieoNguoi()` tạo người, rồi `db.organization.upsert`
hàng tổ chức `WORKSPACE_ID`, rồi tạo hàng thành viên. Bước upsert vào từ commit
`ee1eab1bc` (va-lo-ro-vai-chi-okr). Upsert của Prisma ở đây đọc trước, ghi sau — hai lượt
chạy cùng lúc trên một kho chưa có hàng tổ chức cùng thấy «chưa có», cùng chèn, và lượt
thua nhận P2002 `Unique constraint failed on the fields: (\`id\`)`.

`bun run test` tạo kho riêng `crm_<id>_test` cho mỗi lượt, nên mọi lượt chạy một tệp lẻ
đều bắt đầu với bảng tổ chức trống. Tái hiện 3/3 lần trên onehub `f3e8192fa`:
`bun run test -- "cd apps/api && bun test test/dieu-phoi-va.spec.ts -t dem-qua-han"`.

Chỗ gọi song song đã có: `dieu-phoi-va.spec.ts:244` (hai `gieoNguoi`),
`dieu-phoi.spec.ts:458` và `dieu-phoi-diem-nhan.spec.ts:170` (hai `gieoKeHoach`, mỗi cái
gọi `gieoNguoi`), `gieoKeHoach` tự nó (`Promise.all([gieoCongTy(), gieoNguoi()])`), và tám
chỗ trong `quan-ly-danh-muc.spec.ts`. DA1b (`feat/chep-viec-can-lam-cu`, #405) né lỗi bằng
cách gieo tuần tự ở một chỗ gọi.

## Cách sửa

Sửa trong helper, không đổi chỗ gọi (hướng Mac Studio chốt, M5 chuyển lời). Bước upsert
tách thành hàm riêng `gieoToChuc()`:

1. thử `upsert` như cũ;
2. bắt `Prisma.PrismaClientKnownRequestError` mã `P2002` — lượt khác vừa chèn xong — rồi
   đọc lại hàng bằng `findUniqueOrThrow`; hàng không có (ví dụ P2002 do một ràng buộc khác)
   thì lỗi hiện ra, không nuốt;
3. mọi lỗi khác ném lại nguyên vẹn.

Postgres chỉ báo vi phạm duy nhất sau khi giao dịch chèn của lượt thắng đã commit, nên lượt
đọc lại luôn thấy hàng. Upsert đứng một mình, không trong giao dịch nào, nên bắt lỗi không
để lại giao dịch hỏng.

Lối đã cân và bỏ: `createMany({ skipDuplicates: true })` (ON CONFLICT DO NOTHING) gọn hơn
nhưng im lặng bỏ qua cả xung đột ở `slug`, rồi lỗi lộ ra xa hơn ở khoá ngoại của hàng thành
viên; và lệch hướng đã thống nhất. Khoá tư vấn (`pg_advisory_lock`) đúng nhưng nặng hơn
cho một helper test.

## Đo

- Bài test mới `apps/api/test/gieo-nguoi-song-song.spec.ts`: bốn `gieoNguoi()` cùng lúc trên
  kho chưa có tổ chức → cả bốn xong, đúng một hàng tổ chức, bốn hàng thành viên. Ca bỏ qua
  (`skipIf`) khi kho đã có tổ chức — trong lượt suite đầy đủ — để không xoá dữ liệu của tệp
  khác; răng đột biến đòi ca thật sự chạy (dòng `(pass)`), không chấp nhận `(skip)`.
- Răng đột biến `rang/dot-bien.mjs`: trong bản sao cây ở HEAD, đổi `"P2002"` thành
  `"P0000"` ở nhánh bắt → cùng bài test phải đỏ với câu ghim
  ``Unique constraint failed on the fields: (`id`) [organization.upsert]``.
- Ca tái hiện gốc `dieu-phoi-va.spec.ts -t dem-qua-han` chạy riêng phải xanh.
- Răng phạm vi `rang/pham-vi.mjs`: diff của vòng không chạm chỗ gọi nào hay mã sản phẩm.

## Đặc tả UX

Không chạm giao diện — chỉ tệp test. Bỏ bằng dòng `descope` trong sổ quyết định.

## Ghim lại

Helper nằm trong `paths` của eval ở nhiều hồ sơ. Sau commit, chạy
`bash scripts/pre-merge-check.sh . --base origin/onehub` để lấy danh sách hồ sơ hoá cũ, rồi
ghim lại bằng `repin-lane.mjs --write` trong một lượt M5 cấp. Mỗi eval của làn ghim lại
chạy bằng `bun run test -- …`, tức trên kho test riêng của nó.

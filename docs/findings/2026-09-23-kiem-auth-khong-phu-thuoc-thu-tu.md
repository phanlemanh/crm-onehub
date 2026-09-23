# Bài kiểm packages/auth đỏ theo thứ tự tệp — hồ sơ tách khỏi PR

Ngày 2026-09-23 · PR #88 (`fix/auth-test-env-ro`) · gỡ chặn #87

## Lỗi

CI của #87 (run 35813904599) đỏ hai ca `cua-google-con-song` trong
`packages/auth/test/chia-mat-khau.integration.spec.ts`, dù #87 không chạm
`packages/auth`. Log: `Google sign-in rejected: id token hosted domain (hd)
"<missing>" does not satisfy the configured "hd" option "example.com"`.

- `packages/auth/src/auth.ts` khoá `google.hd` lúc nạp module. bun chạy mọi tệp
  của gói trong một tiến trình, nên module auth chỉ nạp một lần cho cả lượt.
- Token Google giả của bài kiểm đọc lại `ALLOWED_SIGN_IN` lúc chạy.
- Bốn tệp gán biến đó mà không trả lại: `cau-tu-choi`, `hosted-domain`,
  `cong-vao`, `tu-choi-khong-de-lai-hang`. Ở #87, `cau-tu-choi` chạy ngay trước
  `chia-mat-khau`.
- Máy dev không tái hiện được vì `.env` để `GOOGLE_CLIENT_ID=""`, nên hai ca đi
  nhánh bỏ qua. Muốn tái hiện: đặt env theo `.github/workflows/ci.yml` và chạy
  `bun test --randomize --seed=N`.

## Bản sửa (chỉ bài kiểm)

- Token giả lấy `hd` từ `auth.options.socialProviders.google.hd`.
- `test/danh-sach-goc.ts`: bốn tệp trả lại `ALLOWED_SIGN_IN` ở `afterAll`.
- `test/hd-cua-google.spec.ts`: nạp auth trong tiến trình con, canh chỗ
  `auth.ts` nối `hd` theo danh sách cho phép.
- Ca «cua google tu choi token co hd lech»: cùng người, cùng tài khoản; `hd`
  lệch thì bị từ chối, đúng thì vào được.

## Hồ sơ nghiệm thu — vì sao không vào kho

Hồ sơ T3 `kiem-auth-khong-phu-thuoc-thu-tu` đã qua Cổng 1 và Cổng 1.5. S4 chạy bốn
round:

| Round | Kết quả |
|---|---|
| 1 | REJECT: bản sao đo nằm trong `packages/auth` đụng các lane song song (oxlint quét `.sao-*`) cộng ba lỗ đo trong hợp đồng |
| 2 | PENDING-JUDGMENT, 11/11 eval máy xanh; thẻ Cổng 2 khoá vì dấu thước lệch do args ghi lệch chỗ |
| 3 | BLOCKED (agent chạy E5 chết) cộng một lỗ AC-7 |
| 4 | REJECT: E11 chập chờn dưới tải, và chốt tổng số ca của AC-4 tự suy từ chính lượt đo |

Mọi eval mức sản phẩm xanh ở round 2–4: bốn cặp tệp cố định thứ tự (bản gốc
`b812b65a` đỏ đủ 8/8 ô), quét cả lớp tệp rò env, seed `--randomize`, toàn gói
thứ tự thường, không chạm mã sản phẩm. Phần còn đỏ nằm ở độ chặt của bộ đo.

Chủ kho chọn mở PR kèm giới hạn đã biết. `scripts/pre-merge-check.sh` (dòng 1169)
chấm verdict của MỌI hồ sơ ở `implemented`/`verified`/`signed-off`. Một hồ sơ
REJECT vào `onehub` sẽ làm đỏ cổng của mọi PR sau, nên chủ kho chọn tách hồ sơ khỏi
PR. Hồ sơ đầy đủ (hợp đồng, evals, răng đo, sổ quyết định, bốn báo cáo) nằm ở
commit `16c47aaa0d49d39db58184ced8f983e4aaf0b52c` trên nhánh `fix/auth-test-env-ro`:

```
git show 16c47aaa:_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/contract.md
```

## Giới hạn đã biết

- Việc trả lại `ALLOWED_SIGN_IN` gắn tay vào từng tệp. Tệp test mới đổi biến này
  mà quên gọi `traLaiDanhSachSauTep()` thì rò lại, và cổng test của kho không bắt
  được. Hướng sửa: chuyển việc trả lại vào preload `test/moi-truong.ts`.
- Token giả của hai ca `cua-google-con-song` lấy `hd` từ chính cấu hình auth.
  Phần bù là `hd-cua-google.spec.ts` và ca «hd lệch».
- Các ca đỏ chỉ lộ ra dưới `--randomize` (`ensureWorkspaceMembership`,
  `duong-moi`, `vai-dinh-truoc`, `doi chung duong`, `khong-sinh-thanh-vien`)
  phụ thuộc trạng thái DB hoặc thứ tự ca trong tệp. Chúng đỏ y hệt trên bản gốc.
